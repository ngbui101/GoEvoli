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

type StoryHandler struct {
	services *services.Services
}

func NewStoryHandler(services *services.Services) *StoryHandler {
	return &StoryHandler{services: services}
}

func (h *StoryHandler) GetProjectStories(w http.ResponseWriter, r *http.Request) {
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

	stories, err := h.services.Repos.Stories.Find(r.Context(), bson.M{"projectId": projectID})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, stories)
}

func (h *StoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(primitive.ObjectID)
	projectID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "projectId"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid Project ID")
		return
	}

	if err := auth.AssertProjectPermission(r.Context(), h.services.Repos, userID, projectID, models.RoleProductOwner, models.RoleAdmin, models.RoleDeveloper); err != nil {
		response.Error(w, http.StatusForbidden, err.Error())
		return
	}

	var req struct {
		Title       string          `json:"title"`
		Description string          `json:"description"`
		Priority    models.Priority `json:"priority"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validation.ValidateStory(req.Title, req.Description, req.Priority); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	story := &models.UserStory{
		BaseModel: models.BaseModel{
			ID:        primitive.NewObjectID(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		ProjectId:      projectID,
		ProductOwnerId: userID,
		Title:          req.Title,
		Description:    req.Description,
		Priority:       req.Priority,
		Status:         models.StoryStatusEgg,
	}

	if err := h.services.Repos.Stories.Create(r.Context(), story); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.services.Activity.Log(r.Context(), projectID, userID, models.EntityTypeUserStory, story.ID, models.ActivityActionStoryCreated, "", "")

	response.JSON(w, http.StatusCreated, story)
}

func (h *StoryHandler) PassTest(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(primitive.ObjectID)
	storyID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "storyId"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid Story ID")
		return
	}

	story, err := h.services.Repos.Stories.FindByID(r.Context(), storyID)
	if err != nil || story == nil {
		response.Error(w, http.StatusNotFound, "Story not found")
		return
	}

	if err := auth.AssertProjectPermission(r.Context(), h.services.Repos, userID, story.ProjectId, models.RoleProductOwner, models.RoleTester); err != nil {
		response.Error(w, http.StatusForbidden, err.Error())
		return
	}

	err = h.services.Repos.Stories.Update(r.Context(), storyID, bson.M{"$set": bson.M{"storyTestPassed": true, "updatedAt": time.Now()}})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.services.Activity.Log(r.Context(), story.ProjectId, userID, models.EntityTypeUserStory, story.ID, models.ActivityActionStoryUpdated, "test passed", "true")
	h.services.Story.RecalculateAndSaveStoryStatus(r.Context(), storyID)

	response.JSON(w, http.StatusOK, map[string]string{"message": "Story test passed"})
}

func (h *StoryHandler) Complete(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(primitive.ObjectID)
	storyID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "storyId"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid Story ID")
		return
	}

	story, err := h.services.Repos.Stories.FindByID(r.Context(), storyID)
	if err != nil || story == nil {
		response.Error(w, http.StatusNotFound, "Story not found")
		return
	}

	if err := auth.AssertProjectPermission(r.Context(), h.services.Repos, userID, story.ProjectId, models.RoleProductOwner); err != nil {
		response.Error(w, http.StatusForbidden, err.Error())
		return
	}

	if story.Status != models.StoryStatusFinalEvolution {
		response.Error(w, http.StatusBadRequest, "Story must be in FINAL_EVOLUTION to complete")
		return
	}

	err = h.services.Repos.Stories.Update(r.Context(), storyID, bson.M{"$set": bson.M{"manuallyCompleted": true, "updatedAt": time.Now()}})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.services.Activity.Log(r.Context(), story.ProjectId, userID, models.EntityTypeUserStory, story.ID, models.ActivityActionStoryCompleted, "", "")
	h.services.Story.RecalculateAndSaveStoryStatus(r.Context(), storyID)

	response.JSON(w, http.StatusOK, map[string]string{"message": "Story completed"})
}

func (h *StoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(primitive.ObjectID)
	storyID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "storyId"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid Story ID")
		return
	}

	story, err := h.services.Repos.Stories.FindByID(r.Context(), storyID)
	if err != nil || story == nil {
		response.Error(w, http.StatusNotFound, "Story not found")
		return
	}

	if err := auth.AssertProjectPermission(r.Context(), h.services.Repos, userID, story.ProjectId, models.RoleProductOwner, models.RoleAdmin); err != nil {
		response.Error(w, http.StatusForbidden, err.Error())
		return
	}

	if err := h.services.Repos.Stories.Delete(r.Context(), storyID); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.services.Activity.Log(r.Context(), story.ProjectId, userID, models.EntityTypeUserStory, story.ID, models.ActivityActionStoryUpdated, "deleted", story.Title)

	response.JSON(w, http.StatusOK, map[string]string{"message": "Story deleted"})
}
