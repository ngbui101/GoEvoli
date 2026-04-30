package auth

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"goevoli/internal/models"
	"goevoli/internal/repositories"
)

var (
	ErrUnauthorized = errors.New("unauthorized access to project")
	ErrForbidden    = errors.New("insufficient permissions for project")
)

// AssertProjectPermission checks if a user has the required roles for a project
func AssertProjectPermission(ctx context.Context, repos *repositories.Repositories, userID, projectID primitive.ObjectID, allowedRoles ...models.Role) error {
	membership, err := repos.ProjectMemberships.FindOne(ctx, bson.M{
		"userId":    userID,
		"projectId": projectID,
	})

	if err != nil {
		return err
	}

	if membership == nil {
		return ErrUnauthorized
	}

	if membership.Role == models.RoleAdmin {
		return nil
	}

	if len(allowedRoles) == 0 {
		return nil
	}

	for _, role := range allowedRoles {
		if membership.Role == role {
			return nil
		}
	}

	return ErrForbidden
}
