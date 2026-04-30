package handlers

import (
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

	if req.AffectedEntityType == models.EntityTypeUserStory {
		h.services.Story.RecalculateAndSaveStoryStatus(r.Context(), req.AffectedEntityId)
	} else if req.AffectedEntityType == models.EntityTypeTask {
		t, _ := h.services.Repos.Tasks.FindByID(r.Context(), req.AffectedEntityId)
		if t != nil {
			h.services.Story.RecalculateAndSaveStoryStatus(r.Context(), t.StoryId)
		}
	} else if req.AffectedEntityType == models.EntityTypeSubtask {
		st, _ := h.services.Repos.Subtasks.FindByID(r.Context(), req.AffectedEntityId)
		if st != nil {
			t, _ := h.services.Repos.Tasks.FindByID(r.Context(), st.TaskId)
			if t != nil {
				h.services.Story.RecalculateAndSaveStoryStatus(r.Context(), t.StoryId)
			}
		}
	}

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

	if bug.AffectedEntityType == models.EntityTypeUserStory {
		h.services.Story.RecalculateAndSaveStoryStatus(r.Context(), bug.AffectedEntityId)
	} else if bug.AffectedEntityType == models.EntityTypeTask {
		t, _ := h.services.Repos.Tasks.FindByID(r.Context(), bug.AffectedEntityId)
		if t != nil {
			h.services.Story.RecalculateAndSaveStoryStatus(r.Context(), t.StoryId)
		}
	} else if bug.AffectedEntityType == models.EntityTypeSubtask {
		st, _ := h.services.Repos.Subtasks.FindByID(r.Context(), bug.AffectedEntityId)
		if st != nil {
			t, _ := h.services.Repos.Tasks.FindByID(r.Context(), st.TaskId)
			if t != nil {
				h.services.Story.RecalculateAndSaveStoryStatus(r.Context(), t.StoryId)
			}
		}
	}

	response.JSON(w, http.StatusOK, map[string]string{"message": "Bug closed"})
}
