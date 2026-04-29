package services_test

import (
	"context"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"goevoli/internal/models"
	"goevoli/internal/services"
)

func TestCanTaskBeDone_NoBlockers(t *testing.T) {
	clearCollections(t)
	ctx := context.Background()

	taskID := primitive.NewObjectID()

	err := testSvcs.Task.CanTaskBeDone(ctx, taskID)
	if err != nil {
		t.Errorf("Expected nil, got %v", err)
	}
}

func TestCanTaskBeDone_BlockedByBug(t *testing.T) {
	clearCollections(t)
	ctx := context.Background()

	taskID := primitive.NewObjectID()

	bug := &models.Bug{
		BaseModel:          models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		AffectedEntityType: models.EntityTypeTask,
		AffectedEntityId:   taskID,
		Status:             models.BugStatusOpen,
		BlocksWork:         true,
	}
	testRepos.Bugs.Create(ctx, bug)

	err := testSvcs.Task.CanTaskBeDone(ctx, taskID)
	if err != services.ErrTaskBlocked {
		t.Errorf("Expected ErrTaskBlocked, got %v", err)
	}
}

func TestCanTaskBeDone_BlockedBySubtaskOpen(t *testing.T) {
	clearCollections(t)
	ctx := context.Background()

	taskID := primitive.NewObjectID()

	subtask := &models.Subtask{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		TaskId:    taskID,
		Required:  true,
		Done:      false,
	}
	testRepos.Subtasks.Create(ctx, subtask)

	err := testSvcs.Task.CanTaskBeDone(ctx, taskID)
	if err != services.ErrSubtasksOpen {
		t.Errorf("Expected ErrSubtasksOpen, got %v", err)
	}
}

func TestValidateWipLimit_Next(t *testing.T) {
	clearCollections(t)
	ctx := context.Background()

	project := &models.Project{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID()},
		WipLimits: models.WipLimits{Next: 1, Doing: 2},
	}
	testRepos.Projects.Create(ctx, project)

	// Add 1 task in NEXT
	testRepos.Tasks.Create(ctx, &models.Task{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID()},
		ProjectId: project.ID,
		Status:    models.TaskStatusNext,
	})

	err := testSvcs.Project.ValidateWipLimit(ctx, project.ID, models.TaskStatusNext)
	if err != services.ErrWipLimitExceeded {
		t.Errorf("Expected ErrWipLimitExceeded, got %v", err)
	}
}

func TestValidateWipLimit_Doing(t *testing.T) {
	clearCollections(t)
	ctx := context.Background()

	project := &models.Project{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID()},
		WipLimits: models.WipLimits{Next: 2, Doing: 1},
	}
	testRepos.Projects.Create(ctx, project)

	testRepos.Tasks.Create(ctx, &models.Task{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID()},
		ProjectId: project.ID,
		Status:    models.TaskStatusDoing,
	})

	err := testSvcs.Project.ValidateWipLimit(ctx, project.ID, models.TaskStatusDoing)
	if err != services.ErrWipLimitExceeded {
		t.Errorf("Expected ErrWipLimitExceeded, got %v", err)
	}
}

func TestValidateWipLimit_Allowed(t *testing.T) {
	clearCollections(t)
	ctx := context.Background()

	project := &models.Project{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID()},
		WipLimits: models.WipLimits{Next: 5, Doing: 5},
	}
	testRepos.Projects.Create(ctx, project)

	err := testSvcs.Project.ValidateWipLimit(ctx, project.ID, models.TaskStatusDoing)
	if err != nil {
		t.Errorf("Expected nil, got %v", err)
	}
}
