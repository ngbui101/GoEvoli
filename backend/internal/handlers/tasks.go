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

type TaskHandler struct {
	services *services.Services
}

func NewTaskHandler(services *services.Services) *TaskHandler {
	return &TaskHandler{services: services}
}

func (h *TaskHandler) GetTasks(w http.ResponseWriter, r *http.Request) {
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

	tasks, err := h.services.Repos.Tasks.Find(r.Context(), bson.M{"storyId": storyID})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, tasks)
}

func (h *TaskHandler) Move(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(primitive.ObjectID)
	taskID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "taskId"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid Task ID")
		return
	}

	var req struct {
		TargetStatus models.TaskStatus `json:"targetStatus"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	task, err := h.services.Repos.Tasks.FindByID(r.Context(), taskID)
	if err != nil || task == nil {
		response.Error(w, http.StatusNotFound, "Task not found")
		return
	}

	if err := auth.AssertProjectPermission(r.Context(), h.services.Repos, userID, task.ProjectId, models.RoleDeveloper, models.RoleTester, models.RoleProductOwner); err != nil {
		response.Error(w, http.StatusForbidden, err.Error())
		return
	}

	// Rule 4 & 5: Check if task can be done
	if req.TargetStatus == models.TaskStatusDone {
		if err := h.services.Task.CanTaskBeDone(r.Context(), taskID); err != nil {
			response.Error(w, http.StatusConflict, err.Error())
			return
		}
	}

	// Rule 2 & 3: Validate WIP Limit
	if req.TargetStatus == models.TaskStatusNext || req.TargetStatus == models.TaskStatusDoing {
		if err := h.services.Project.ValidateWipLimit(r.Context(), task.ProjectId, req.TargetStatus); err != nil {
			response.Error(w, http.StatusConflict, "WIP Limit Exceeded")
			return
		}
	}

	oldStatus := task.Status
	err = h.services.Repos.Tasks.Update(r.Context(), taskID, bson.M{
		"$set": bson.M{
			"status":    req.TargetStatus,
			"updatedAt": time.Now(),
		},
	})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.services.Activity.Log(r.Context(), task.ProjectId, userID, models.EntityTypeTask, taskID, models.ActivityActionTaskMoved, string(oldStatus), string(req.TargetStatus))
	h.services.Story.RecalculateAndSaveStoryStatus(r.Context(), task.StoryId)

	response.JSON(w, http.StatusOK, map[string]string{"message": "Task moved successfully"})
}

func (h *TaskHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(primitive.ObjectID)
	storyID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "storyId"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid Story ID")
		return
	}

	var req struct {
		Title       string          `json:"title"`
		Description string          `json:"description"`
		Type        models.TaskType `json:"type"`
		Priority    models.Priority `json:"priority"`
		Workload    float64         `json:"workload"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validation.ValidateTask(req.Title, req.Description, req.Workload, req.Type); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	story, err := h.services.Repos.Stories.FindByID(r.Context(), storyID)
	if err != nil || story == nil {
		response.Error(w, http.StatusNotFound, "Story not found")
		return
	}

	if err := auth.AssertProjectPermission(r.Context(), h.services.Repos, userID, story.ProjectId, models.RoleDeveloper, models.RoleProductOwner); err != nil {
		response.Error(w, http.StatusForbidden, err.Error())
		return
	}

	task := &models.Task{
		BaseModel: models.BaseModel{
			ID:        primitive.NewObjectID(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		ProjectId:   story.ProjectId,
		StoryId:     storyID,
		Title:       req.Title,
		Description: req.Description,
		Type:        req.Type,
		Status:      models.TaskStatusBacklog,
		Priority:    req.Priority,
		Workload:    req.Workload,
	}

	if err := h.services.Repos.Tasks.Create(r.Context(), task); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.services.Activity.Log(r.Context(), story.ProjectId, userID, models.EntityTypeTask, task.ID, models.ActivityActionTaskCreated, "", "")
	h.services.Story.RecalculateAndSaveStoryStatus(r.Context(), storyID)

	response.JSON(w, http.StatusCreated, task)
}

func (h *TaskHandler) Delete(w http.ResponseWriter, r *http.Request) {

	userID := r.Context().Value(middleware.UserIDKey).(primitive.ObjectID)
	taskID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "taskId"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid Task ID")
		return
	}

	task, err := h.services.Repos.Tasks.FindByID(r.Context(), taskID)
	if err != nil || task == nil {
		response.Error(w, http.StatusNotFound, "Task not found")
		return
	}

	if err := auth.AssertProjectPermission(r.Context(), h.services.Repos, userID, task.ProjectId, models.RoleDeveloper, models.RoleProductOwner, models.RoleAdmin); err != nil {
		response.Error(w, http.StatusForbidden, err.Error())
		return
	}

	if err := h.services.Repos.Tasks.Delete(r.Context(), taskID); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.services.Activity.Log(r.Context(), task.ProjectId, userID, models.EntityTypeTask, taskID, models.ActivityActionTaskUpdated, "deleted", task.Title)
	h.services.Story.RecalculateAndSaveStoryStatus(r.Context(), task.StoryId)

	response.JSON(w, http.StatusOK, map[string]string{"message": "Task deleted"})
}
