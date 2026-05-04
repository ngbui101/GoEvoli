package services_test

import (
	"context"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"goevoli/internal/models"
)

func TestCalculateStoryStatus_Egg(t *testing.T) {
	clearCollections(t)
	ctx := context.Background()

	story := &models.UserStory{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		ProjectId: primitive.NewObjectID(),
		Title:     "Egg Story",
	}
	testRepos.Stories.Create(ctx, story)

	status, err := testSvcs.Story.CalculateStoryStatus(ctx, story)
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if status != models.StoryStatusEgg {
		t.Errorf("Expected EGG, got %s", status)
	}
}

func TestCalculateStoryStatus_Evolving(t *testing.T) {
	clearCollections(t)
	ctx := context.Background()

	story := &models.UserStory{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}
	testRepos.Stories.Create(ctx, story)

	// Add an active task
	task := &models.Task{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		StoryId:   story.ID,
		Status:    models.TaskStatusDoing,
	}
	testRepos.Tasks.Create(ctx, task)

	status, err := testSvcs.Story.CalculateStoryStatus(ctx, story)
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if status != models.StoryStatusEvolving {
		t.Errorf("Expected EVOLVING, got %s", status)
	}
}

func TestCalculateStoryStatus_ReadyForTest(t *testing.T) {
	clearCollections(t)
	ctx := context.Background()

	story := &models.UserStory{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}
	testRepos.Stories.Create(ctx, story)

	// Add a DONE task
	task := &models.Task{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		StoryId:   story.ID,
		Status:    models.TaskStatusDone,
	}
	testRepos.Tasks.Create(ctx, task)

	status, err := testSvcs.Story.CalculateStoryStatus(ctx, story)
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if status != models.StoryStatusReadyForTest {
		t.Errorf("Expected READY_FOR_TEST, got %s", status)
	}
}

func TestCalculateStoryStatus_Blocked(t *testing.T) {
	clearCollections(t)
	ctx := context.Background()

	story := &models.UserStory{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}
	testRepos.Stories.Create(ctx, story)

	// Block the story with a Bug
	bug := &models.Bug{
		BaseModel:          models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		AffectedEntityType: models.EntityTypeUserStory,
		AffectedEntityId:   story.ID,
		Status:             models.BugStatusOpen,
		BlocksWork:         true,
	}
	testRepos.Bugs.Create(ctx, bug)

	status, err := testSvcs.Story.CalculateStoryStatus(ctx, story)
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if status != models.StoryStatusBlocked {
		t.Errorf("Expected BLOCKED, got %s", status)
	}
}

func TestCalculateStoryStatus_IgnoresBlockingBugFromOtherProject(t *testing.T) {
	clearCollections(t)
	ctx := context.Background()

	projectID := primitive.NewObjectID()
	otherProjectID := primitive.NewObjectID()
	story := &models.UserStory{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		ProjectId: projectID,
		Title:     "Scoped Story",
	}
	testRepos.Stories.Create(ctx, story)

	bug := &models.Bug{
		BaseModel:          models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		ProjectId:          otherProjectID,
		AffectedEntityType: models.EntityTypeUserStory,
		AffectedEntityId:   story.ID,
		Status:             models.BugStatusOpen,
		BlocksWork:         true,
	}
	testRepos.Bugs.Create(ctx, bug)

	status, err := testSvcs.Story.CalculateStoryStatus(ctx, story)
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if status == models.StoryStatusBlocked {
		t.Errorf("Expected cross-project bug not to block story")
	}
}

func TestCalculateDominantTaskType_Workload(t *testing.T) {
	clearCollections(t)
	ctx := context.Background()

	storyID := primitive.NewObjectID()

	// Add tasks
	testRepos.Tasks.Create(ctx, &models.Task{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID()},
		StoryId:   storyID,
		Type:      models.TaskTypeFunctionality,
		Workload:  2.0,
	})
	testRepos.Tasks.Create(ctx, &models.Task{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID()},
		StoryId:   storyID,
		Type:      models.TaskTypeUIUX,
		Workload:  1.0,
	})

	dom, err := testSvcs.Story.CalculateDominantTaskType(ctx, storyID)
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if dom == nil || *dom != models.TaskTypeFunctionality {
		t.Errorf("Expected FUNCTIONALITY, got %v", dom)
	}
}

func TestCalculateDominantTaskType_Tie(t *testing.T) {
	clearCollections(t)
	ctx := context.Background()

	storyID := primitive.NewObjectID()

	testRepos.Tasks.Create(ctx, &models.Task{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID()},
		StoryId:   storyID,
		Type:      models.TaskTypeFunctionality,
		Workload:  2.0,
	})
	testRepos.Tasks.Create(ctx, &models.Task{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID()},
		StoryId:   storyID,
		Type:      models.TaskTypeUIUX,
		Workload:  2.0,
	})

	dom, err := testSvcs.Story.CalculateDominantTaskType(ctx, storyID)
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if dom != nil {
		t.Errorf("Expected tie (nil), got %v", *dom)
	}
}
