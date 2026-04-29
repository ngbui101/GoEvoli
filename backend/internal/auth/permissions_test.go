package auth_test

import (
	"context"
	"log"
	"os"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"goevoli/internal/auth"
	"goevoli/internal/models"
	"goevoli/internal/repositories"
)

var (
	testDB    *mongo.Database
	testRepos *repositories.Repositories
)

func TestMain(m *testing.M) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatalf("Failed to connect to test mongodb: %v", err)
	}

	testDB = client.Database("goevoli_test_auth")
	testRepos = repositories.NewRepositories(testDB)

	code := m.Run()

	testDB.Drop(context.Background())
	client.Disconnect(context.Background())

	os.Exit(code)
}

func clearCollections() {
	ctx := context.Background()
	collections, _ := testDB.ListCollectionNames(ctx, bson.M{})
	for _, collName := range collections {
		testDB.Collection(collName).DeleteMany(ctx, bson.M{})
	}
}

func TestAssertProjectPermission_Allowed(t *testing.T) {
	clearCollections()
	ctx := context.Background()

	userID := primitive.NewObjectID()
	projectID := primitive.NewObjectID()

	// Give user RoleProductOwner
	testRepos.ProjectMemberships.Create(ctx, &models.ProjectMembership{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID()},
		UserId:    userID,
		ProjectId: projectID,
		Role:      models.RoleProductOwner,
	})

	// Check if ProductOwner is allowed
	err := auth.AssertProjectPermission(ctx, testRepos, userID, projectID, models.RoleProductOwner, models.RoleAdmin)
	if err != nil {
		t.Errorf("Expected nil, got %v", err)
	}
}

func TestAssertProjectPermission_Denied(t *testing.T) {
	clearCollections()
	ctx := context.Background()

	userID := primitive.NewObjectID()
	projectID := primitive.NewObjectID()

	// Give user RoleDeveloper
	testRepos.ProjectMemberships.Create(ctx, &models.ProjectMembership{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID()},
		UserId:    userID,
		ProjectId: projectID,
		Role:      models.RoleDeveloper,
	})

	// Check if ProductOwner is allowed (should fail)
	err := auth.AssertProjectPermission(ctx, testRepos, userID, projectID, models.RoleProductOwner)
	if err != auth.ErrForbidden {
		t.Errorf("Expected ErrForbidden, got %v", err)
	}
}

func TestAssertProjectPermission_AnyRoleAllowedIfNoSpecificRolesPassed(t *testing.T) {
	clearCollections()
	ctx := context.Background()

	userID := primitive.NewObjectID()
	projectID := primitive.NewObjectID()

	testRepos.ProjectMemberships.Create(ctx, &models.ProjectMembership{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID()},
		UserId:    userID,
		ProjectId: projectID,
		Role:      models.RoleViewer,
	})

	err := auth.AssertProjectPermission(ctx, testRepos, userID, projectID)
	if err != nil {
		t.Errorf("Expected nil, got %v", err)
	}
}

func TestAssertProjectPermission_NotAMember(t *testing.T) {
	clearCollections()
	ctx := context.Background()

	userID := primitive.NewObjectID()
	projectID := primitive.NewObjectID()

	// No membership created

	err := auth.AssertProjectPermission(ctx, testRepos, userID, projectID)
	if err != auth.ErrUnauthorized {
		t.Errorf("Expected ErrUnauthorized, got %v", err)
	}
}
