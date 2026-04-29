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
)

type CommentHandler struct {
	services *services.Services
}

func NewCommentHandler(services *services.Services) *CommentHandler {
	return &CommentHandler{services: services}
}

func (h *CommentHandler) Create(w http.ResponseWriter, r *http.Request) {
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

	var req struct {
		Text string `json:"text"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	comment := &models.Comment{
		BaseModel: models.BaseModel{
			ID:        primitive.NewObjectID(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		ProjectId: story.ProjectId,
		StoryId:   storyID,
		AuthorId:  userID,
		Text:      req.Text,
	}

	if err := h.services.Repos.Comments.Create(r.Context(), comment); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.services.Activity.Log(r.Context(), story.ProjectId, userID, models.EntityTypeUserStory, story.ID, models.ActivityActionCommentCreated, "", "")

	response.JSON(w, http.StatusCreated, comment)
}

func (h *CommentHandler) GetForStory(w http.ResponseWriter, r *http.Request) {
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

	comments, err := h.services.Repos.Comments.Find(r.Context(), bson.M{"storyId": storyID})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, comments)
}
