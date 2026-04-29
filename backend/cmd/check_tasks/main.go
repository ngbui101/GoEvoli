package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"goevoli/internal/database"
	"goevoli/internal/repositories"
)

func main() {
	envPath := filepath.Join("..", "..", ".env")
	if _, err := os.Stat(".env"); err == nil {
		envPath = ".env"
	}
	godotenv.Load(envPath)

	mongoURI := os.Getenv("MONGO_URI")
	db, err := database.Connect(mongoURI, "goevoli")
	if err != nil {
		log.Fatal(err)
	}

	repos := repositories.NewRepositories(db.DB)
	tasks, _ := repos.Tasks.Find(context.Background(), bson.M{"title": "Final Demo: Task Creation"})

	fmt.Printf("Found %d tasks with title 'Final Demo: Task Creation'\n", len(tasks))
	for _, t := range tasks {
		fmt.Printf("- Task: %s, Status: %s, StoryId: %s\n", t.Title, t.Status, t.StoryId)
	}
}
