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

type ProjectHandler struct {
	services *services.Services
}

func NewProjectHandler(services *services.Services) *ProjectHandler {
	return &ProjectHandler{services: services}
}

func (h *ProjectHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(primitive.ObjectID)
	memberships, err := h.services.Repos.ProjectMemberships.Find(r.Context(), bson.M{"userId": userID})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	var pIDs []primitive.ObjectID
	for _, m := range memberships {
		pIDs = append(pIDs, m.ProjectId)
	}

	if len(pIDs) == 0 {
		response.JSON(w, http.StatusOK, []models.Project{})
		return
	}

	projects, err := h.services.Repos.Projects.Find(r.Context(), bson.M{"_id": bson.M{"$in": pIDs}})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, projects)
}

func (h *ProjectHandler) GetByID(w http.ResponseWriter, r *http.Request) {
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

	project, err := h.services.Repos.Projects.FindByID(r.Context(), projectID)
	if err != nil || project == nil {
		response.Error(w, http.StatusNotFound, "Project not found")
		return
	}

	response.JSON(w, http.StatusOK, project)
}

func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(primitive.ObjectID)
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	proj, err := h.services.Project.CreateProject(r.Context(), req.Name, req.Description, userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.services.Activity.Log(r.Context(), proj.ID, userID, models.EntityTypeTask, proj.ID, models.ActivityActionProjectCreated, "", "")

	response.JSON(w, http.StatusCreated, proj)
}

func (h *ProjectHandler) UpdateWipLimits(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(primitive.ObjectID)
	projectID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "projectId"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid Project ID")
		return
	}

	if err := auth.AssertProjectPermission(r.Context(), h.services.Repos, userID, projectID, models.RoleAdmin, models.RoleScrumMaster); err != nil {
		response.Error(w, http.StatusForbidden, err.Error())
		return
	}

	var req struct {
		Next  int `json:"next"`
		Doing int `json:"doing"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	err = h.services.Repos.Projects.Update(r.Context(), projectID, bson.M{
		"$set": bson.M{
			"wipLimits.next":  req.Next,
			"wipLimits.doing": req.Doing,
			"updatedAt":       time.Now(),
		},
	})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.services.Activity.Log(r.Context(), projectID, userID, models.EntityTypeTask, projectID, models.ActivityActionWipLimitChanged, "", "")
	response.JSON(w, http.StatusOK, map[string]string{"message": "WIP limits updated"})
}
