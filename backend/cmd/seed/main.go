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
		Name:        models.DefaultDemoProjectName,
		Description: "A focused demo board for the next GoEvoli product work.",
		WipLimits: models.WipLimits{
			Next:  3,
			Doing: 2,
		},
	}
	repos.Projects.Create(ctx, project)
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
		repos.ProjectMemberships.Create(ctx, membership)
	}
	type taskSeed struct {
		title       string
		description string
		status      models.TaskStatus
		taskType    models.TaskType
		workload    float64
		priority    models.Priority
		createdBy   string
		assigned    []string
	}

	storySeeds := []struct {
		title       string
		description string
		status      models.StoryStatus
		priority    models.Priority
		tasks       []taskSeed
	}{
		{
			title:       "Trainer einem Task zuweisen",
			description: "Als Teammitglied moechte ich Tasks anderen Trainern zuweisen koennen, damit Verantwortlichkeiten im Board sichtbar sind.",
			status:      models.StoryStatusEgg,
			priority:    models.PriorityHigh,
			tasks: []taskSeed{
				{"Backend Membership/User-Auswahl vorbereiten", "API-Daten bereitstellen, damit der Assigned-Tab Projektmitglieder anzeigen kann.", models.TaskStatusBacklog, models.TaskTypeFunctionality, 3, models.PriorityHigh, "po@example.com", []string{"dev@example.com"}},
				{"Assigned-Tab im Editor implementieren", "Trainer auswaehlen, speichern und bestehende Zuweisungen anzeigen.", models.TaskStatusBacklog, models.TaskTypeUIUX, 4, models.PriorityHigh, "po@example.com", []string{"dev@example.com"}},
				{"Zuweisung auf Task-Karten anzeigen", "Board- und Detailkarten sollen zugewiesene Trainer eindeutig darstellen.", models.TaskStatusNext, models.TaskTypeUIUX, 2, models.PriorityMedium, "scrum@example.com", []string{"dev@example.com", "tester@example.com"}},
			},
		},
		{
			title:       "Stories und Tasks direkt bearbeiten",
			description: "Als Nutzer moechte ich Stories und Tasks nachtraeglich bearbeiten koennen, damit Fehler ohne Loeschen und Neuerstellen korrigiert werden.",
			status:      models.StoryStatusEvolving,
			priority:    models.PriorityHigh,
			tasks: []taskSeed{
				{"Update-Endpunkte fuer Stories und Tasks", "PATCH-Routen mit Validierung und Berechtigungspruefung ergaenzen.", models.TaskStatusDoing, models.TaskTypeFunctionality, 5, models.PriorityHigh, "admin@example.com", []string{"dev@example.com"}},
				{"Edit-Modus in Detailansichten", "Titel, Beschreibung, Prioritaet, Typ und Workload bearbeitbar machen.", models.TaskStatusNext, models.TaskTypeUIUX, 4, models.PriorityHigh, "po@example.com", []string{"dev@example.com"}},
				{"Regressionstests fuer Bearbeiten", "Backend- und Frontend-Flows fuer erfolgreiche und ungueltige Updates absichern.", models.TaskStatusBacklog, models.TaskTypeStability, 3, models.PriorityMedium, "tester@example.com", []string{"tester@example.com"}},
			},
		},
		{
			title:       "Board in Echtzeit aktualisieren",
			description: "Als Team moechte ich Board-Aenderungen automatisch sehen, damit parallele Arbeit ohne manuelles Neuladen synchron bleibt.",
			status:      models.StoryStatusEgg,
			priority:    models.PriorityMedium,
			tasks: []taskSeed{
				{"Realtime-Strategie festlegen", "WebSocket oder Polling anhand Deployment-Grenzen und Aufwand entscheiden.", models.TaskStatusBacklog, models.TaskTypeStability, 2, models.PriorityMedium, "scrum@example.com", []string{"dev@example.com"}},
				{"Board-Events im Backend veroeffentlichen", "Task-Moves, neue Bugs und Story-Aenderungen als Events bereitstellen.", models.TaskStatusBacklog, models.TaskTypeFunctionality, 5, models.PriorityMedium, "admin@example.com", []string{"dev@example.com"}},
				{"Frontend-Subscription integrieren", "Board-State aktualisieren, ohne lokale Drag-Interaktionen zu stoeren.", models.TaskStatusBacklog, models.TaskTypeFunctionality, 4, models.PriorityMedium, "po@example.com", []string{"dev@example.com"}},
			},
		},
		{
			title:       "Drag-and-drop auf Mobile haerten",
			description: "Als mobiler Nutzer moechte ich Karten zuverlaessig per Touch bewegen koennen, ohne versehentlich zu scrollen oder Details zu oeffnen.",
			status:      models.StoryStatusEvolving,
			priority:    models.PriorityCritical,
			tasks: []taskSeed{
				{"Touch-Sensoren und Scroll-Konflikte testen", "Mobile Gesten fuer Halten, Ziehen und horizontales Scrollen reproduzierbar pruefen.", models.TaskStatusDoing, models.TaskTypeStability, 3, models.PriorityCritical, "tester@example.com", []string{"tester@example.com"}},
				{"Mobile Drop-Zonen robuster machen", "Drop-Ziele und Feedback fuer kleine Viewports verbessern.", models.TaskStatusNext, models.TaskTypeUIUX, 3, models.PriorityHigh, "po@example.com", []string{"dev@example.com"}},
				{"E2E-Test fuer mobilen Kartenmove", "Automatisierten Touch-Flow fuer Task-Bewegung und Stapel-Reihenfolge ergaenzen.", models.TaskStatusBacklog, models.TaskTypeStability, 4, models.PriorityHigh, "tester@example.com", []string{"tester@example.com"}},
			},
		},
		{
			title:       "Board-Suchergebnisse klar hervorheben",
			description: "Als Nutzer moechte ich sofort erkennen, welche Story oder Task zur Suche passt, damit ich Treffer im Board schneller finde.",
			status:      models.StoryStatusEgg,
			priority:    models.PriorityMedium,
			tasks: []taskSeed{
				{"Trefferlogik fuer Tasks und Stories ableiten", "Suchtreffer getrennt nach Story-Titel, Task-Titel und Beschreibung berechnen.", models.TaskStatusBacklog, models.TaskTypeFunctionality, 2, models.PriorityMedium, "po@example.com", []string{"dev@example.com"}},
				{"Visuelle Highlight-Zustaende gestalten", "Passende Karten hervorheben und nicht passende Karten dezent reduzieren.", models.TaskStatusBacklog, models.TaskTypeUIUX, 3, models.PriorityMedium, "scrum@example.com", []string{"dev@example.com"}},
				{"Suche per QA-Szenarien absichern", "Story-Treffer, Task-Treffer und leere Ergebnisse auf Desktop und Mobile testen.", models.TaskStatusBacklog, models.TaskTypeStability, 2, models.PriorityMedium, "tester@example.com", []string{"tester@example.com"}},
			},
		},
	}

	for _, storySeed := range storySeeds {
		story := &models.UserStory{
			BaseModel:   models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
			ProjectId:   project.ID,
			Title:       storySeed.title,
			Description: storySeed.description,
			Status:      storySeed.status,
			Priority:    storySeed.priority,
		}
		repos.Stories.Create(ctx, story)

		for _, taskSeed := range storySeed.tasks {
			assigned := make([]primitive.ObjectID, 0, len(taskSeed.assigned))
			for _, email := range taskSeed.assigned {
				assigned = append(assigned, userMap[email])
			}

			repos.Tasks.Create(ctx, &models.Task{
				BaseModel:   models.BaseModel{ID: primitive.NewObjectID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
				StoryId:     story.ID,
				ProjectId:   project.ID,
				Title:       taskSeed.title,
				Description: taskSeed.description,
				Status:      taskSeed.status,
				Type:        taskSeed.taskType,
				Workload:    taskSeed.workload,
				Priority:    taskSeed.priority,
				CreatedBy:   userMap[taskSeed.createdBy],
				Assigned:    assigned,
			})
		}
	}

	fmt.Println("Seeding completed successfully!")
}
