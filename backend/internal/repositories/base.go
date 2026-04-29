package repositories

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// MongoRepository is a generic repository for MongoDB CRUD operations.
type MongoRepository[T any] struct {
	Collection *mongo.Collection
}

func NewMongoRepository[T any](db *mongo.Database, collectionName string) *MongoRepository[T] {
	return &MongoRepository[T]{
		Collection: db.Collection(collectionName),
	}
}

func (r *MongoRepository[T]) Create(ctx context.Context, entity *T) error {
	_, err := r.Collection.InsertOne(ctx, entity)
	return err
}

func (r *MongoRepository[T]) FindByID(ctx context.Context, id primitive.ObjectID) (*T, error) {
	var entity T
	err := r.Collection.FindOne(ctx, bson.M{"_id": id}).Decode(&entity)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &entity, nil
}

func (r *MongoRepository[T]) Update(ctx context.Context, id primitive.ObjectID, update bson.M) error {
	_, err := r.Collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	return err
}

func (r *MongoRepository[T]) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.Collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *MongoRepository[T]) Find(ctx context.Context, filter bson.M) ([]*T, error) {
	cursor, err := r.Collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	results := []*T{}
	for cursor.Next(ctx) {
		var entity T
		if err := cursor.Decode(&entity); err != nil {
			return nil, err
		}
		results = append(results, &entity)
	}
	return results, cursor.Err()
}

func (r *MongoRepository[T]) FindOne(ctx context.Context, filter bson.M) (*T, error) {
	var entity T
	err := r.Collection.FindOne(ctx, filter).Decode(&entity)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &entity, nil
}
