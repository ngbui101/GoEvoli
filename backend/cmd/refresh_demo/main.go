package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"

	"goevoli/internal/database"
	"goevoli/internal/demo"
	"goevoli/internal/models"
	"goevoli/internal/repositories"
)

func main() {
	fmt.Printf("Refreshing %s without dropping the database...\n", models.DefaultDemoProjectName)

	envPath := filepath.Join("..", "..", ".env")
	if _, err := os.Stat(".env"); err == nil {
		envPath = ".env"
	} else if _, err := os.Stat("../.env"); err == nil {
		envPath = "../.env"
	}

	godotenv.Load(envPath)

	mongoURI := os.Getenv("MONGO_URI")
	dbName := os.Getenv("MONGO_DATABASE")
	if dbName == "" {
		dbName = "goevoli"
	}

	db, err := database.Connect(mongoURI, dbName)
	if err != nil {
		log.Fatalf("Could not connect to MongoDB: %v", err)
	}
	defer db.Disconnect(context.Background())

	result, err := demo.RefreshDemoProject(context.Background(), repositories.NewRepositories(db.DB))
	if err != nil {
		log.Fatalf("Could not refresh demo project: %v", err)
	}

	fmt.Printf("Refreshed project %s\n", result.ProjectID.Hex())
	fmt.Printf("Stories created: %d\n", result.StoriesCreated)
	fmt.Printf("Tasks created: %d\n", result.TasksCreated)
	fmt.Printf("Memberships added: %d\n", result.MembershipsAdded)
}
