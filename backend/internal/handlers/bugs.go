package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"goevoli/internal/auth"
	"goevoli/internal/middleware"
	"goevoli/internal/models"
	"goevoli/internal/response"
	"goevoli/internal/services"
	"goevoli/internal/validation"
)

type BugHandler struct {
	services *services.Services
}

func NewBugHandler(services *services.Services) *BugHandler {
	return &BugHandler{services: services}
}

func (h *BugHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(primitive.ObjectID)
	projectID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "projectId"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid Project ID")
		return
	}

	if err := auth.AssertProjectPermission(r.Context(), h.services.Repos, userID, projectID, models.RoleDeveloper, models.RoleTester); err != nil {
		response.Error(w, http.StatusForbidden, err.Error())
		return
	}

	var req struct {
		Title              string             `json:"title"`
		Description        string             `json:"description"`
		Severity           models.Severity    `json:"severity"`
		BlocksWork         bool               `json:"blocksWork"`
		AffectedEntityType models.EntityType  `json:"affectedEntityType"`
		AffectedEntityId   primitive.ObjectID `json:"affectedEntityId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validation.ValidateBug(req.Title, req.Description, req.Severity, req.AffectedEntityType); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	affectedStoryID, ok, err := h.affectedStoryID(r.Context(), projectID, req.AffectedEntityType, req.AffectedEntityId)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	if !ok {
		response.Error(w, http.StatusBadRequest, "Affected entity does not belong to project")
		return
	}

	bug := &models.Bug{
		BaseModel: models.BaseModel{
			ID:        primitive.NewObjectID(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		ProjectId:          projectID,
		Title:              req.Title,
		Description:        req.Description,
		Severity:           req.Severity,
		Status:             models.BugStatusOpen,
		BlocksWork:         req.BlocksWork,
		AffectedEntityType: req.AffectedEntityType,
		AffectedEntityId:   req.AffectedEntityId,
	}

	if err := h.services.Repos.Bugs.Create(r.Context(), bug); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.services.Activity.Log(r.Context(), projectID, userID, models.EntityTypeTask, bug.ID, models.ActivityActionBugCreated, "", "")

	h.services.Story.RecalculateAndSaveStoryStatus(r.Context(), affectedStoryID)

	response.JSON(w, http.StatusCreated, bug)
}

func (h *BugHandler) GetAllForProject(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(primitive.ObjectID)
	projectID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "projectId"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid Project ID")
		return
	}

	if err := auth.AssertProjectPermission(r.Context(), h.services.Repos, userID, projectID); err != nil {
		response.Error(w, http.StatusForbidden, err.Error())
		return
	}

	bugs, err := h.services.Repos.Bugs.Find(r.Context(), bson.M{"projectId": projectID})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, bugs)
}

func (h *BugHandler) Close(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(primitive.ObjectID)
	bugID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "bugId"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid Bug ID")
		return
	}

	bug, err := h.services.Repos.Bugs.FindByID(r.Context(), bugID)
	if err != nil || bug == nil {
		response.Error(w, http.StatusNotFound, "Bug not found")
		return
	}

	if err := auth.AssertProjectPermission(r.Context(), h.services.Repos, userID, bug.ProjectId, models.RoleTester); err != nil {
		response.Error(w, http.StatusForbidden, err.Error())
		return
	}

	err = h.services.Repos.Bugs.Update(r.Context(), bugID, bson.M{"$set": bson.M{"status": models.BugStatusClosed, "updatedAt": time.Now()}})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.services.Activity.Log(r.Context(), bug.ProjectId, userID, models.EntityTypeTask, bug.ID, models.ActivityActionBugClosed, string(bug.Status), string(models.BugStatusClosed))

	if affectedStoryID, ok, _ := h.affectedStoryID(r.Context(), bug.ProjectId, bug.AffectedEntityType, bug.AffectedEntityId); ok {
		h.services.Story.RecalculateAndSaveStoryStatus(r.Context(), affectedStoryID)
	}

	response.JSON(w, http.StatusOK, map[string]string{"message": "Bug closed"})
}

func (h *BugHandler) affectedStoryID(ctx context.Context, projectID primitive.ObjectID, entityType models.EntityType, entityID primitive.ObjectID) (primitive.ObjectID, bool, error) {
	switch entityType {
	case models.EntityTypeUserStory:
		story, err := h.services.Repos.Stories.FindByID(ctx, entityID)
		if err != nil || story == nil {
			return primitive.NilObjectID, false, err
		}
		if story.ProjectId != projectID {
			return primitive.NilObjectID, false, nil
		}
		return story.ID, true, nil

	case models.EntityTypeTask:
		task, err := h.services.Repos.Tasks.FindByID(ctx, entityID)
		if err != nil || task == nil {
			return primitive.NilObjectID, false, err
		}
		if task.ProjectId != projectID {
			return primitive.NilObjectID, false, nil
		}
		return task.StoryId, true, nil

	case models.EntityTypeSubtask:
		subtask, err := h.services.Repos.Subtasks.FindByID(ctx, entityID)
		if err != nil || subtask == nil {
			return primitive.NilObjectID, false, err
		}
		if subtask.ProjectId != projectID {
			return primitive.NilObjectID, false, nil
		}

		task, err := h.services.Repos.Tasks.FindByID(ctx, subtask.TaskId)
		if err != nil || task == nil {
			return primitive.NilObjectID, false, err
		}
		if task.ProjectId != projectID {
			return primitive.NilObjectID, false, nil
		}
		return task.StoryId, true, nil

	default:
		return primitive.NilObjectID, false, nil
	}
}
