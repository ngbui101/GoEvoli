package services

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"goevoli/internal/models"
	"goevoli/internal/repositories"
)

var (
	ErrWipLimitExceeded = errors.New("WIP_LIMIT_EXCEEDED")
	ErrProjectNotFound  = errors.New("project not found")
)

type ProjectService struct {
	repos    *repositories.Repositories
	activity *ActivityService
}

func NewProjectService(repos *repositories.Repositories, activity *ActivityService) *ProjectService {
	return &ProjectService{repos: repos, activity: activity}
}

func (s *ProjectService) ValidateWipLimit(ctx context.Context, projectID primitive.ObjectID, targetStatus models.TaskStatus) error {
	if targetStatus != models.TaskStatusNext && targetStatus != models.TaskStatusDoing {
		return nil
	}

	project, err := s.repos.Projects.FindByID(ctx, projectID)
	if err != nil || project == nil {
		return ErrProjectNotFound
	}

	tasksInStatus, err := s.repos.Tasks.Find(ctx, bson.M{
		"projectId": projectID,
		"status":    targetStatus,
	})
	if err != nil {
		return err
	}

	if targetStatus == models.TaskStatusNext && len(tasksInStatus) >= project.WipLimits.Next {
		return ErrWipLimitExceeded
	}
	if targetStatus == models.TaskStatusDoing && len(tasksInStatus) >= project.WipLimits.Doing {
		return ErrWipLimitExceeded
	}

	return nil
}

func (s *ProjectService) CreateProject(ctx context.Context, name, desc string, adminID primitive.ObjectID) (*models.Project, error) {
	proj := &models.Project{
		BaseModel: models.BaseModel{
			ID:        primitive.NewObjectID(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		Name:        name,
		Description: desc,
		WipLimits: models.WipLimits{
			Next:  5,
			Doing: 3,
		},
	}

	if err := s.repos.Projects.Create(ctx, proj); err != nil {
		return nil, err
	}

	// Add creator as ADMIN
	member := &models.ProjectMembership{
		BaseModel: models.BaseModel{
			ID:        primitive.NewObjectID(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		ProjectId: proj.ID,
		UserId:    adminID,
		Role:      models.RoleAdmin,
	}
	if err := s.repos.ProjectMemberships.Create(ctx, member); err != nil {
		return nil, err
	}

	// Log
	// No explicit entity for project creation logging, using user_story as placeholder or general task
	// But let's add EntityTypeProject to models if needed, or use a workaround. The requirements say entityType: USER_STORY, TASK, SUBTASK.
	// Wait, requirements say: "entityType: TASK". If there's no project type, we just omit it or use an empty one.
	return proj, nil
}
