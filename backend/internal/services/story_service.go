package services

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"goevoli/internal/models"
	"goevoli/internal/repositories"
)

type StoryService struct {
	repos    *repositories.Repositories
	activity *ActivityService
}

func NewStoryService(repos *repositories.Repositories, activity *ActivityService) *StoryService {
	return &StoryService{repos: repos, activity: activity}
}

func (s *StoryService) HasOpenBlockingBug(ctx context.Context, entityType models.EntityType, entityID primitive.ObjectID) (bool, error) {
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

func (s *StoryService) CalculateStoryStatus(ctx context.Context, story *models.UserStory) (models.StoryStatus, error) {
	blocked, err := s.HasOpenBlockingBug(ctx, models.EntityTypeUserStory, story.ID)
	if err != nil {
		return "", err
	}

	tasks, err := s.repos.Tasks.Find(ctx, bson.M{"storyId": story.ID})
	if err != nil {
		return "", err
	}

	for _, t := range tasks {
		if blocked {
			break
		}
		tBlocked, err := s.HasOpenBlockingBug(ctx, models.EntityTypeTask, t.ID)
		if err != nil {
			return "", err
		}
		if tBlocked {
			blocked = true
			break
		}

		subtasks, err := s.repos.Subtasks.Find(ctx, bson.M{"taskId": t.ID})
		if err != nil {
			return "", err
		}
		for _, st := range subtasks {
			stBlocked, err := s.HasOpenBlockingBug(ctx, models.EntityTypeSubtask, st.ID)
			if err != nil {
				return "", err
			}
			if stBlocked {
				blocked = true
				break
			}
		}
	}

	if blocked {
		return models.StoryStatusBlocked, nil
	}

	if len(tasks) == 0 {
		return models.StoryStatusEgg, nil
	}

	if story.ManuallyCompleted {
		return models.StoryStatusDone, nil
	}

	allDone := true
	anyActive := false
	for _, t := range tasks {
		if t.Status != models.TaskStatusDone {
			allDone = false
		}
		if t.Status == models.TaskStatusNext || t.Status == models.TaskStatusDoing || t.Status == models.TaskStatusTest {
			anyActive = true
		}
	}

	if allDone && !story.StoryTestPassed {
		return models.StoryStatusReadyForTest, nil
	}

	if story.StoryTestPassed && story.FinalEvolution != nil {
		return models.StoryStatusFinalEvolution, nil
	}

	if anyActive {
		return models.StoryStatusEvolving, nil
	}

	return models.StoryStatusEgg, nil
}

func (s *StoryService) RecalculateAndSaveStoryStatus(ctx context.Context, storyID primitive.ObjectID) error {
	story, err := s.repos.Stories.FindByID(ctx, storyID)
	if err != nil || story == nil {
		return err
	}

	newStatus, err := s.CalculateStoryStatus(ctx, story)
	if err != nil {
		return err
	}

	if newStatus != story.Status {
		err = s.repos.Stories.Update(ctx, story.ID, bson.M{"$set": bson.M{"status": newStatus, "updatedAt": time.Now()}})
		if err != nil {
			return err
		}
	}

	return nil
}

func (s *StoryService) CalculateDominantTaskType(ctx context.Context, storyID primitive.ObjectID) (*models.TaskType, error) {
	tasks, err := s.repos.Tasks.Find(ctx, bson.M{"storyId": storyID})
	if err != nil {
		return nil, err
	}

	workloads := make(map[models.TaskType]float64)
	for _, t := range tasks {
		if t.Type != models.TaskTypeBug {
			workloads[t.Type] += t.Workload
		}
	}

	var dominant *models.TaskType
	maxWorkload := -1.0
	isTie := false

	for tType, w := range workloads {
		if w > maxWorkload {
			maxWorkload = w
			typ := tType
			dominant = &typ
			isTie = false
		} else if w == maxWorkload {
			isTie = true
		}
	}

	if isTie {
		return nil, nil
	}
	return dominant, nil
}

func (s *StoryService) CalculateFinalEvolution(ctx context.Context, storyID primitive.ObjectID) (*models.FinalEvolution, error) {
	domType, err := s.CalculateDominantTaskType(ctx, storyID)
	if err != nil {
		return nil, err
	}
	if domType == nil {
		return nil, nil
	}

	var evo models.FinalEvolution
	switch *domType {
	case models.TaskTypeFunctionality:
		evo = models.FinalEvolutionFeature
	case models.TaskTypeUIUX:
		evo = models.FinalEvolutionDesign
	case models.TaskTypeStability:
		evo = models.FinalEvolutionStability
	}
	return &evo, nil
}

func (s *StoryService) CalculateTaskProgress(ctx context.Context, storyID primitive.ObjectID) (int, int, error) {
	tasks, err := s.repos.Tasks.Find(ctx, bson.M{"storyId": storyID})
	if err != nil {
		return 0, 0, err
	}
	doneCount := 0
	for _, t := range tasks {
		if t.Status == models.TaskStatusDone {
			doneCount++
		}
	}
	return doneCount, len(tasks), nil
}
