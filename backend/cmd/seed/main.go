package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"

	"goevoli/internal/database"
	"goevoli/internal/demo"
	"goevoli/internal/models"
	"goevoli/internal/repositories"
)

func main() {
	fmt.Println("GoEvoli Seeder starting...")

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

	repos := repositories.NewRepositories(db.DB)
	ctx := context.Background()

	fmt.Println("Wiping database...")
	if err := db.DB.Drop(ctx); err != nil {
		log.Fatalf("Could not drop database: %v", err)
	}

	users := []struct {
		Name  string
		Email string
		Role  models.Role
	}{
		{"Admin User", "admin@example.com", models.RoleAdmin},
		{"Product Owner User", "po@example.com", models.RoleProductOwner},
		{"Scrum Master User", "scrum@example.com", models.RoleScrumMaster},
		{"Developer User", "dev@example.com", models.RoleDeveloper},
		{"Tester User", "tester@example.com", models.RoleTester},
		{"Viewer User", "viewer@example.com", models.RoleViewer},
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Could not hash password: %v", err)
	}

	userMap := make(map[string]primitive.ObjectID)
	for _, u := range users {
		newUser := &models.User{
			BaseModel: models.BaseModel{
				ID:        primitive.NewObjectID(),
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			Name:     u.Name,
			Email:    u.Email,
			Password: string(passwordHash),
		}

		if err := repos.Users.Create(ctx, newUser); err != nil {
			log.Fatalf("Error creating user %s: %v", u.Email, err)
		}
		fmt.Printf("Created user: %s\n", u.Email)
		userMap[u.Email] = newUser.ID
	}

	project := &models.Project{
		BaseModel: models.BaseModel{
			ID:        primitive.NewObjectID(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		Name:        models.DefaultDemoProjectName,
		Description: "A focused demo board for the next GoEvoli product work.",
		WipLimits:   models.WipLimits{Next: 3, Doing: 2},
	}
	if err := repos.Projects.Create(ctx, project); err != nil {
		log.Fatalf("Could not create default project: %v", err)
	}
	fmt.Printf("Created default project: %s\n", models.DefaultDemoProjectName)

	for _, u := range users {
		membership := &models.ProjectMembership{
			BaseModel: models.BaseModel{
				ID:        primitive.NewObjectID(),
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			ProjectId: project.ID,
			UserId:    userMap[u.Email],
			Role:      u.Role,
		}
		if err := repos.ProjectMemberships.Create(ctx, membership); err != nil {
			log.Fatalf("Could not create membership for %s: %v", u.Email, err)
		}
	}

	result, err := demo.RefreshDemoProject(ctx, repos)
	if err != nil {
		log.Fatalf("Could not refresh demo project board: %v", err)
	}

	fmt.Printf("Seeded demo board with %d stories and %d tasks\n", result.StoriesCreated, result.TasksCreated)
	fmt.Println("Seeding completed successfully!")
}
