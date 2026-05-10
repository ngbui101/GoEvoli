package demo

import (
	"context"
	"os"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"goevoli/internal/models"
	"goevoli/internal/repositories"
)

func TestRefreshDemoProjectReplacesOnlyDemoBoardData(t *testing.T) {
	ctx := context.Background()
	repos, cleanup := newDemoTestRepos(t)
	defer cleanup()

	admin := createDemoTestUser(t, repos, "admin@example.com")
	dev := createDemoTestUser(t, repos, "dev@example.com")
	createDemoTestUser(t, repos, "po@example.com")
	createDemoTestUser(t, repos, "scrum@example.com")
	createDemoTestUser(t, repos, "tester@example.com")
	newUser := createDemoTestUser(t, repos, "new.user@example.com")

	demoProject := &models.Project{
		BaseModel:   models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Name:        "Pok\u00e9mon GoEvoli (Full Demo)",
		Description: "Old demo",
		WipLimits:   models.WipLimits{Next: 9, Doing: 9},
	}
	if err := repos.Projects.Create(ctx, demoProject); err != nil {
		t.Fatalf("create demo project: %v", err)
	}

	otherProject := &models.Project{
		BaseModel:   models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Name:        "Keep Me",
		Description: "Not demo",
		WipLimits:   models.WipLimits{Next: 1, Doing: 1},
	}
	if err := repos.Projects.Create(ctx, otherProject); err != nil {
		t.Fatalf("create other project: %v", err)
	}

	if err := repos.ProjectMemberships.Create(ctx, &models.ProjectMembership{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		ProjectId: demoProject.ID,
		UserId:    admin.ID,
		Role:      models.RoleAdmin,
	}); err != nil {
		t.Fatalf("create existing membership: %v", err)
	}

	oldDemoStory := createDemoTestStory(t, repos, demoProject.ID, "old demo story")
	createDemoTestTask(t, repos, demoProject.ID, oldDemoStory.ID, "old demo task")
	otherStory := createDemoTestStory(t, repos, otherProject.ID, "other story")
	createDemoTestTask(t, repos, otherProject.ID, otherStory.ID, "other task")

	result, err := RefreshDemoProject(ctx, repos)
	if err != nil {
		t.Fatalf("refresh demo project: %v", err)
	}

	if result.StoriesCreated != 5 {
		t.Fatalf("expected 5 stories created, got %d", result.StoriesCreated)
	}
	if result.TasksCreated != 15 {
		t.Fatalf("expected 15 tasks created, got %d", result.TasksCreated)
	}

	demoStories, err := repos.Stories.Find(ctx, bson.M{"projectId": demoProject.ID})
	if err != nil {
		t.Fatalf("find demo stories: %v", err)
	}
	if len(demoStories) != 5 {
		t.Fatalf("expected 5 demo stories, got %d", len(demoStories))
	}

	demoTasks, err := repos.Tasks.Find(ctx, bson.M{"projectId": demoProject.ID})
	if err != nil {
		t.Fatalf("find demo tasks: %v", err)
	}
	if len(demoTasks) != 15 {
		t.Fatalf("expected 15 demo tasks, got %d", len(demoTasks))
	}

	otherTasks, err := repos.Tasks.Find(ctx, bson.M{"projectId": otherProject.ID})
	if err != nil {
		t.Fatalf("find other tasks: %v", err)
	}
	if len(otherTasks) != 1 {
		t.Fatalf("expected other project task to remain, got %d", len(otherTasks))
	}

	adminMembership, err := repos.ProjectMemberships.FindOne(ctx, bson.M{"projectId": demoProject.ID, "userId": admin.ID})
	if err != nil {
		t.Fatalf("find admin membership: %v", err)
	}
	if adminMembership == nil || adminMembership.Role != models.RoleAdmin {
		t.Fatalf("expected existing admin membership to be preserved")
	}

	newMembership, err := repos.ProjectMemberships.FindOne(ctx, bson.M{"projectId": demoProject.ID, "userId": newUser.ID})
	if err != nil {
		t.Fatalf("find new membership: %v", err)
	}
	if newMembership == nil || newMembership.Role != models.RoleDeveloper {
		t.Fatalf("expected new user to receive developer membership")
	}

	devMembership, err := repos.ProjectMemberships.FindOne(ctx, bson.M{"projectId": demoProject.ID, "userId": dev.ID})
	if err != nil {
		t.Fatalf("find dev membership: %v", err)
	}
	if devMembership == nil {
		t.Fatalf("expected seeded dev user to receive demo membership")
	}
}

func createDemoTestUser(t *testing.T, repos *repositories.Repositories, email string) *models.User {
	t.Helper()
	user := &models.User{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Name:      email,
		Email:     email,
		Password:  "hash",
	}
	if err := repos.Users.Create(context.Background(), user); err != nil {
		t.Fatalf("create user %s: %v", email, err)
	}
	return user
}

func createDemoTestStory(t *testing.T, repos *repositories.Repositories, projectID primitive.ObjectID, title string) *models.UserStory {
	t.Helper()
	story := &models.UserStory{
		BaseModel:   models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		ProjectId:   projectID,
		Title:       title,
		Description: title,
		Status:      models.StoryStatusEgg,
		Priority:    models.PriorityMedium,
	}
	if err := repos.Stories.Create(context.Background(), story); err != nil {
		t.Fatalf("create story %s: %v", title, err)
	}
	return story
}

func createDemoTestTask(t *testing.T, repos *repositories.Repositories, projectID, storyID primitive.ObjectID, title string) {
	t.Helper()
	if err := repos.Tasks.Create(context.Background(), &models.Task{
		BaseModel:   models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		ProjectId:   projectID,
		StoryId:     storyID,
		Title:       title,
		Description: title,
		Status:      models.TaskStatusBacklog,
		Type:        models.TaskTypeFunctionality,
		Priority:    models.PriorityMedium,
		Workload:    1,
	}); err != nil {
		t.Fatalf("create task %s: %v", title, err)
	}
}

func newDemoTestRepos(t *testing.T) (*repositories.Repositories, func()) {
	t.Helper()

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		t.Fatalf("connect mongodb: %v", err)
	}

	db := client.Database("goevoli_demo_test_" + primitive.NewObjectID().Hex())
	return repositories.NewRepositories(db), func() {
		_ = db.Drop(context.Background())
		_ = client.Disconnect(context.Background())
	}
}
