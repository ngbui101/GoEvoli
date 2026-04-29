package services

import (
	"goevoli/internal/repositories"
)

type CommentService struct {
	repos    *repositories.Repositories
	activity *ActivityService
}

func NewCommentService(repos *repositories.Repositories, activity *ActivityService) *CommentService {
	return &CommentService{repos: repos, activity: activity}
}
