package services

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"goevoli/internal/models"
	"goevoli/internal/repositories"
)

type Services struct {
	Repos    *repositories.Repositories
	Project  *ProjectService
	Story    *StoryService
	Task     *TaskService
	Bug      *BugService
	Comment  *CommentService
	Activity *ActivityService
}

func NewServices(repos *repositories.Repositories) *Services {
	activity := NewActivityService(repos)
	project := NewProjectService(repos, activity)
	story := NewStoryService(repos, activity)
	task := NewTaskService(repos, activity, story)
	bug := NewBugService(repos, activity, story, task)
	comment := NewCommentService(repos, activity)

	return &Services{
		Repos:    repos,
		Project:  project,
		Story:    story,
		Task:     task,
		Bug:      bug,
		Comment:  comment,
		Activity: activity,
	}
}

type ActivityService struct {
	repos *repositories.Repositories
}

func NewActivityService(repos *repositories.Repositories) *ActivityService {
	return &ActivityService{repos: repos}
}

func (s *ActivityService) Log(ctx context.Context, projectID, actorID primitive.ObjectID, entityType models.EntityType, entityID primitive.ObjectID, action models.ActivityAction, oldVal, newVal string) error {
	logEntry := &models.ActivityLog{
		BaseModel: models.BaseModel{
			ID:        primitive.NewObjectID(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		ProjectId:  projectID,
		ActorId:    actorID,
		EntityType: entityType,
		EntityId:   entityID,
		Action:     action,
		OldValue:   oldVal,
		NewValue:   newVal,
	}
	return s.repos.ActivityLogs.Create(ctx, logEntry)
}
