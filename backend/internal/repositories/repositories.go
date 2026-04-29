package repositories

import (
	"go.mongodb.org/mongo-driver/mongo"
	"goevoli/internal/models"
)

type Repositories struct {
	Users              *MongoRepository[models.User]
	Projects           *MongoRepository[models.Project]
	ProjectMemberships *MongoRepository[models.ProjectMembership]
	Stories            *MongoRepository[models.UserStory]
	AcceptanceCriteria *MongoRepository[models.AcceptanceCriterion]
	Tasks              *MongoRepository[models.Task]
	Subtasks           *MongoRepository[models.Subtask]
	Bugs               *MongoRepository[models.Bug]
	Comments           *MongoRepository[models.Comment]
	ActivityLogs       *MongoRepository[models.ActivityLog]
}

func NewRepositories(db *mongo.Database) *Repositories {
	return &Repositories{
		Users:              NewMongoRepository[models.User](db, "users"),
		Projects:           NewMongoRepository[models.Project](db, "projects"),
		ProjectMemberships: NewMongoRepository[models.ProjectMembership](db, "project_memberships"),
		Stories:            NewMongoRepository[models.UserStory](db, "stories"),
		AcceptanceCriteria: NewMongoRepository[models.AcceptanceCriterion](db, "acceptance_criteria"),
		Tasks:              NewMongoRepository[models.Task](db, "tasks"),
		Subtasks:           NewMongoRepository[models.Subtask](db, "subtasks"),
		Bugs:               NewMongoRepository[models.Bug](db, "bugs"),
		Comments:           NewMongoRepository[models.Comment](db, "comments"),
		ActivityLogs:       NewMongoRepository[models.ActivityLog](db, "activity_logs"),
	}
}
