package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
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

func TestRegisterAddsUserToDefaultDemoProject(t *testing.T) {
	ctx := context.Background()
	repos, cleanup := newAuthHandlerTestRepos(t)
	defer cleanup()

	demoProject := &models.Project{
		BaseModel: models.BaseModel{
			ID:        primitive.NewObjectID(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		Name:        models.DefaultDemoProjectName,
		Description: "Demo",
		WipLimits:   models.WipLimits{Next: 3, Doing: 2},
	}
	if err := repos.Projects.Create(ctx, demoProject); err != nil {
		t.Fatalf("create demo project: %v", err)
	}

	handler := NewAuthHandler(repos)
	body, _ := json.Marshal(RegisterRequest{
		Name:     "New Trainer",
		Email:    "new.trainer@example.com",
		Password: "password123",
	})

	req := httptest.NewRequest(http.MethodPost, "/api/auth/register", bytes.NewReader(body))
	res := httptest.NewRecorder()
	handler.Register(res, req)

	if res.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d: %s", http.StatusCreated, res.Code, res.Body.String())
	}

	user, err := repos.Users.FindOne(ctx, bson.M{"email": "new.trainer@example.com"})
	if err != nil {
		t.Fatalf("find registered user: %v", err)
	}
	if user == nil {
		t.Fatal("expected registered user to be persisted")
	}

	membership, err := repos.ProjectMemberships.FindOne(ctx, bson.M{
		"projectId": demoProject.ID,
		"userId":    user.ID,
	})
	if err != nil {
		t.Fatalf("find demo membership: %v", err)
	}
	if membership == nil {
		t.Fatal("expected demo project membership")
	}
	if membership.Role != models.RoleDeveloper {
		t.Fatalf("expected role %s, got %s", models.RoleDeveloper, membership.Role)
	}
}

func newAuthHandlerTestRepos(t *testing.T) (*repositories.Repositories, func()) {
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

	dbName := "goevoli_auth_handler_test_" + primitive.NewObjectID().Hex()
	db := client.Database(dbName)

	return repositories.NewRepositories(db), func() {
		_ = db.Drop(context.Background())
		_ = client.Disconnect(context.Background())
	}
}
