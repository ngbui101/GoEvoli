package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"goevoli/internal/auth"
	"goevoli/internal/middleware"
	"goevoli/internal/response"
	"goevoli/internal/services"
)

type ActivityHandler struct {
	services *services.Services
}

func NewActivityHandler(services *services.Services) *ActivityHandler {
	return &ActivityHandler{services: services}
}

func (h *ActivityHandler) GetForStory(w http.ResponseWriter, r *http.Request) {
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

	if err := auth.AssertProjectPermission(r.Context(), h.services.Repos, userID, story.ProjectId); err != nil {
		response.Error(w, http.StatusForbidden, err.Error())
		return
	}

	activities, err := h.services.Repos.ActivityLogs.Find(r.Context(), bson.M{
		"projectId": story.ProjectId,
		"entityId":  storyID,
	})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, activities)
}
