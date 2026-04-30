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
	err = db.DB.Drop(ctx)
	if err != nil {
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

		err = repos.Users.Create(ctx, newUser)
		if err != nil {
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
		Name:        "Pokémon GoEvoli (Full Demo)",
		Description: "A Kanban board for Pokémon management.",
		WipLimits: models.WipLimits{
			Next:  3,
			Doing: 2,
		},
	}
	repos.Projects.Create(ctx, project)
	fmt.Println("Created default project: Pokémon GoEvoli (Full Demo)")
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
		repos.ProjectMemberships.Create(ctx, membership)
	}
	s1 := &models.UserStory{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		ProjectId: project.ID,
		Title:     "Pikachu Initial Design",
		Status:    models.StoryStatusEgg,
		Priority:  models.PriorityMedium,
	}
	repos.Stories.Create(ctx, s1)

	repos.Tasks.Create(ctx, &models.Task{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		StoryId:   s1.ID,
		ProjectId: project.ID,
		Title:     "Sketching",
		Status:    models.TaskStatusBacklog,
		Type:      models.TaskTypeUIUX,
		Workload:  2.0,
		Priority:  models.PriorityMedium,
		CreatedBy: userMap["admin@example.com"],
		Assigned:  []primitive.ObjectID{userMap["dev@example.com"]},
	})
	s2 := &models.UserStory{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		ProjectId: project.ID,
		Title:     "Charizard Fire Breath Implementation",
		Status:    models.StoryStatusEvolving,
		Priority:  models.PriorityHigh,
	}
	repos.Stories.Create(ctx, s2)
	repos.Tasks.Create(ctx, &models.Task{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		StoryId:   s2.ID,
		ProjectId: project.ID,
		Title:     "Particle Effects",
		Status:    models.TaskStatusDoing,
		Type:      models.TaskTypeFunctionality,
		Workload:  3.0,
		Priority:  models.PriorityHigh,
		CreatedBy: userMap["admin@example.com"],
		Assigned:  []primitive.ObjectID{userMap["dev@example.com"], userMap["tester@example.com"]},
	})
	repos.Tasks.Create(ctx, &models.Task{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		StoryId:   s2.ID,
		ProjectId: project.ID,
		Title:     "Sound Effects",
		Status:    models.TaskStatusNext,
		Type:      models.TaskTypeUIUX,
		Workload:  1.0,
		Priority:  models.PriorityMedium,
		CreatedBy: userMap["scrum@example.com"],
		Assigned:  []primitive.ObjectID{userMap["dev@example.com"]},
	})
	s3 := &models.UserStory{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		ProjectId: project.ID,
		Title:     "Bulbasaur Vine Whip Logic",
		Status:    models.StoryStatusBlocked,
		Priority:  models.PriorityCritical,
	}
	repos.Stories.Create(ctx, s3)
	t3 := &models.Task{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		StoryId:   s3.ID,
		ProjectId: project.ID,
		Title:     "Collision Detection",
		Status:    models.TaskStatusDoing,
		Type:      models.TaskTypeStability,
		Workload:  5.0,
		Priority:  models.PriorityHigh,
		CreatedBy: userMap["po@example.com"],
		Assigned:  []primitive.ObjectID{userMap["dev@example.com"]},
	}
	repos.Tasks.Create(ctx, t3)
	repos.Bugs.Create(ctx, &models.Bug{
		BaseModel:          models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		ProjectId:          project.ID,
		Title:              "Vines clipping through terrain",
		Severity:           models.SeverityHigh,
		Status:             models.BugStatusOpen,
		BlocksWork:         true,
		AffectedEntityType: models.EntityTypeTask,
		AffectedEntityId:   t3.ID,
	})
	s4 := &models.UserStory{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		ProjectId: project.ID,
		Title:     "Squirtle Water Gun Mechanics",
		Status:    models.StoryStatusReadyForTest,
		Priority:  models.PriorityMedium,
	}
	repos.Stories.Create(ctx, s4)
	repos.Tasks.Create(ctx, &models.Task{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		StoryId:   s4.ID,
		ProjectId: project.ID,
		Title:     "Water Particle Shader",
		Status:    models.TaskStatusDone,
		Type:      models.TaskTypeFunctionality,
		Workload:  2.0,
		Priority:  models.PriorityMedium,
		CreatedBy: userMap["admin@example.com"],
		Assigned:  []primitive.ObjectID{userMap["dev@example.com"]},
	})
	repos.Tasks.Create(ctx, &models.Task{
		BaseModel: models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
		StoryId:   s4.ID,
		ProjectId: project.ID,
		Title:     "Damage Calculation",
		Status:    models.TaskStatusDone,
		Type:      models.TaskTypeStability,
		Workload:  2.0,
		Priority:  models.PriorityLow,
		CreatedBy: userMap["tester@example.com"],
		Assigned:  []primitive.ObjectID{userMap["dev@example.com"]},
	})

	fmt.Println("Seeding completed successfully!")
}
