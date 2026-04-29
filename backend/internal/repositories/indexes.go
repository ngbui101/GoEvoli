package repositories

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// SetupIndexes creates the required database indexes idempotently.
func SetupIndexes(ctx context.Context, db *mongo.Database) error {
	// users.email unique
	_, err := db.Collection("users").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}

	// project_memberships projectId + userId unique
	_, err = db.Collection("project_memberships").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "projectId", Value: 1},
			{Key: "userId", Value: 1},
		},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}

	// stories.projectId
	_, err = db.Collection("stories").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "projectId", Value: 1}},
	})
	if err != nil {
		return err
	}

	// tasks.storyId
	_, err = db.Collection("tasks").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "storyId", Value: 1}},
	})
	if err != nil {
		return err
	}

	// tasks.projectId
	_, err = db.Collection("tasks").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "projectId", Value: 1}},
	})
	if err != nil {
		return err
	}

	// bugs.projectId
	_, err = db.Collection("bugs").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "projectId", Value: 1}},
	})
	if err != nil {
		return err
	}

	// bugs.affectedEntityType + affectedEntityId
	_, err = db.Collection("bugs").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "affectedEntityType", Value: 1},
			{Key: "affectedEntityId", Value: 1},
		},
	})
	if err != nil {
		return err
	}

	return nil
}
