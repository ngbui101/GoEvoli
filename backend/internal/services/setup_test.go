package services_test

import (
	"context"
	"log"
	"os"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"goevoli/internal/repositories"
	"goevoli/internal/services"
)

var (
	testDB    *mongo.Database
	testRepos *repositories.Repositories
	testSvcs  *services.Services
)

func TestMain(m *testing.M) {
	// Connect to test database
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

	testDB = client.Database("goevoli_test")
	testRepos = repositories.NewRepositories(testDB)
	testSvcs = services.NewServices(testRepos)

	// Run tests
	code := m.Run()

	// Cleanup test DB after all tests
	testDB.Drop(context.Background())
	client.Disconnect(context.Background())

	os.Exit(code)
}

// clearCollections cleans up all data before a test runs
func clearCollections(t *testing.T) {
	ctx := context.Background()
	collections, _ := testDB.ListCollectionNames(ctx, bson.M{})
	for _, collName := range collections {
		testDB.Collection(collName).DeleteMany(ctx, bson.M{})
	}
}
