package services

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"goevoli/internal/models"
	"goevoli/internal/repositories"
)

var (
	ErrTaskBlocked  = errors.New("task is blocked and cannot be marked as DONE")
	ErrSubtasksOpen = errors.New("mandatory subtasks are not done")
)

type TaskService struct {
	repos    *repositories.Repositories
	activity *ActivityService
	story    *StoryService
}

func NewTaskService(repos *repositories.Repositories, activity *ActivityService, story *StoryService) *TaskService {
	return &TaskService{repos: repos, activity: activity, story: story}
}

func (s *TaskService) CanTaskBeDone(ctx context.Context, taskID primitive.ObjectID) error {
	hasBlockingBug := func(eType models.EntityType, eID primitive.ObjectID) (bool, error) {
		filter := bson.M{
			"affectedEntityType": eType,
			"affectedEntityId":   eID,
			"blocksWork":         true,
			"status": bson.M{
				"$in": []models.BugStatus{
					models.BugStatusOpen,
					models.BugStatusInProgress,
					models.BugStatusRetest,
				},
			},
		}
		bugs, err := s.repos.Bugs.Find(ctx, filter)
		return len(bugs) > 0, err
	}

	tBlocked, err := hasBlockingBug(models.EntityTypeTask, taskID)
	if err != nil {
		return err
	}
	if tBlocked {
		return ErrTaskBlocked
	}

	subtasks, err := s.repos.Subtasks.Find(ctx, bson.M{"taskId": taskID})
	if err != nil {
		return err
	}

	for _, st := range subtasks {
		stBlocked, err := hasBlockingBug(models.EntityTypeSubtask, st.ID)
		if err != nil {
			return err
		}
		if stBlocked {
			return ErrTaskBlocked
		}

		if st.Required && !st.Done {
			return ErrSubtasksOpen
		}
	}

	return nil
}
