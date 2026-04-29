package services

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"goevoli/internal/models"
	"goevoli/internal/repositories"
)

type BugService struct {
	repos    *repositories.Repositories
	activity *ActivityService
	story    *StoryService
	task     *TaskService
}

func NewBugService(repos *repositories.Repositories, activity *ActivityService, story *StoryService, task *TaskService) *BugService {
	return &BugService{repos: repos, activity: activity, story: story, task: task}
}

func (s *BugService) HasOpenBlockingBug(ctx context.Context, entityType models.EntityType, entityID primitive.ObjectID) (bool, error) {
	filter := bson.M{
		"affectedEntityType": entityType,
		"affectedEntityId":   entityID,
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
	if err != nil {
		return false, err
	}
	return len(bugs) > 0, nil
}
