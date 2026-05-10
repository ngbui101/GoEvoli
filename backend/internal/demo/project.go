package demo

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"goevoli/internal/models"
	"goevoli/internal/repositories"
)

const projectDescription = "A focused demo board for the next GoEvoli product work."

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

type storySeed struct {
	title       string
	description string
	status      models.StoryStatus
	priority    models.Priority
	tasks       []taskSeed
}

type RefreshResult struct {
	ProjectID        primitive.ObjectID
	StoriesCreated   int
	TasksCreated     int
	MembershipsAdded int
}

func RefreshDemoProject(ctx context.Context, repos *repositories.Repositories) (*RefreshResult, error) {
	project, err := findOrCreateDemoProject(ctx, repos)
	if err != nil {
		return nil, err
	}

	if err := deleteDemoBoardData(ctx, repos, project.ID); err != nil {
		return nil, err
	}

	users, err := repos.Users.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}

	usersByEmail := make(map[string]primitive.ObjectID, len(users))
	membershipsAdded := 0
	for _, user := range users {
		usersByEmail[user.Email] = user.ID

		membership, err := repos.ProjectMemberships.FindOne(ctx, bson.M{
			"projectId": project.ID,
			"userId":    user.ID,
		})
		if err != nil {
			return nil, err
		}
		if membership != nil {
			continue
		}

		if err := repos.ProjectMemberships.Create(ctx, &models.ProjectMembership{
			BaseModel: models.BaseModel{
				ID:        primitive.NewObjectID(),
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			ProjectId: project.ID,
			UserId:    user.ID,
			Role:      models.RoleDeveloper,
		}); err != nil {
			return nil, err
		}
		membershipsAdded++
	}

	tasksCreated := 0
	for _, seed := range demoStories() {
		story := &models.UserStory{
			BaseModel: models.BaseModel{
				ID:        primitive.NewObjectID(),
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			ProjectId:   project.ID,
			Title:       seed.title,
			Description: seed.description,
			Status:      seed.status,
			Priority:    seed.priority,
		}
		if err := repos.Stories.Create(ctx, story); err != nil {
			return nil, err
		}

		for _, taskSeed := range seed.tasks {
			assigned := make([]primitive.ObjectID, 0, len(taskSeed.assigned))
			for _, email := range taskSeed.assigned {
				if userID, ok := usersByEmail[email]; ok {
					assigned = append(assigned, userID)
				}
			}

			task := &models.Task{
				BaseModel: models.BaseModel{
					ID:        primitive.NewObjectID(),
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
				},
				StoryId:     story.ID,
				ProjectId:   project.ID,
				Title:       taskSeed.title,
				Description: taskSeed.description,
				Status:      taskSeed.status,
				Type:        taskSeed.taskType,
				Workload:    taskSeed.workload,
				Priority:    taskSeed.priority,
				Assigned:    assigned,
			}
			if userID, ok := usersByEmail[taskSeed.createdBy]; ok {
				task.CreatedBy = userID
			}

			if err := repos.Tasks.Create(ctx, task); err != nil {
				return nil, err
			}
			tasksCreated++
		}
	}

	return &RefreshResult{
		ProjectID:        project.ID,
		StoriesCreated:   len(demoStories()),
		TasksCreated:     tasksCreated,
		MembershipsAdded: membershipsAdded,
	}, nil
}

func findOrCreateDemoProject(ctx context.Context, repos *repositories.Repositories) (*models.Project, error) {
	project, err := repos.Projects.FindOne(ctx, bson.M{
		"name": bson.M{
			"$in": []string{
				models.DefaultDemoProjectName,
				"Pok\u00e9mon GoEvoli (Full Demo)",
			},
		},
	})
	if err != nil {
		return nil, err
	}

	if project == nil {
		project = &models.Project{
			BaseModel: models.BaseModel{
				ID:        primitive.NewObjectID(),
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			Name:        models.DefaultDemoProjectName,
			Description: projectDescription,
			WipLimits:   models.WipLimits{Next: 3, Doing: 2},
		}
		if err := repos.Projects.Create(ctx, project); err != nil {
			return nil, err
		}
		return project, nil
	}

	project.Name = models.DefaultDemoProjectName
	project.Description = projectDescription
	project.WipLimits = models.WipLimits{Next: 3, Doing: 2}
	project.UpdatedAt = time.Now()

	if err := repos.Projects.Update(ctx, project.ID, bson.M{
		"$set": bson.M{
			"name":        project.Name,
			"description": project.Description,
			"wipLimits":   project.WipLimits,
			"updatedAt":   project.UpdatedAt,
		},
	}); err != nil {
		return nil, err
	}

	return project, nil
}

func deleteDemoBoardData(ctx context.Context, repos *repositories.Repositories, projectID primitive.ObjectID) error {
	filter := bson.M{"projectId": projectID}

	if _, err := repos.AcceptanceCriteria.Collection.DeleteMany(ctx, filter); err != nil {
		return err
	}
	if _, err := repos.Subtasks.Collection.DeleteMany(ctx, filter); err != nil {
		return err
	}
	if _, err := repos.Comments.Collection.DeleteMany(ctx, filter); err != nil {
		return err
	}
	if _, err := repos.ActivityLogs.Collection.DeleteMany(ctx, filter); err != nil {
		return err
	}
	if _, err := repos.Bugs.Collection.DeleteMany(ctx, filter); err != nil {
		return err
	}
	if _, err := repos.Tasks.Collection.DeleteMany(ctx, filter); err != nil {
		return err
	}
	if _, err := repos.Stories.Collection.DeleteMany(ctx, filter); err != nil {
		return err
	}
	return nil
}

func demoStories() []storySeed {
	return []storySeed{
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
}
