package validation

import (
	"errors"
	"strings"

	"goevoli/internal/models"
)

var (
	ErrInvalidTitle       = errors.New("title must be at least 3 characters")
	ErrInvalidDescription = errors.New("description must be at least 5 characters (10 for stories)")
	ErrInvalidPriority    = errors.New("invalid priority")
	ErrInvalidWorkload    = errors.New("workload must be greater than 0")
	ErrInvalidTaskType    = errors.New("invalid task type")
	ErrInvalidSeverity    = errors.New("invalid severity")
	ErrInvalidEntityType  = errors.New("invalid entity type")
)

func ValidateStory(title, desc string, priority models.Priority) error {
	if len(strings.TrimSpace(title)) < 3 {
		return ErrInvalidTitle
	}
	if len(strings.TrimSpace(desc)) < 10 {
		return ErrInvalidDescription
	}
	switch priority {
	case models.PriorityLow, models.PriorityMedium, models.PriorityHigh, models.PriorityCritical:
		// ok
	default:
		return ErrInvalidPriority
	}
	return nil
}

func ValidateTask(title, desc string, workload float64, taskType models.TaskType) error {
	if len(strings.TrimSpace(title)) < 3 {
		return ErrInvalidTitle
	}
	if len(strings.TrimSpace(desc)) < 5 {
		return ErrInvalidDescription
	}
	if workload <= 0 {
		return ErrInvalidWorkload
	}
	switch taskType {
	case models.TaskTypeFunctionality, models.TaskTypeUIUX, models.TaskTypeStability, models.TaskTypeBug:
		// ok
	default:
		return ErrInvalidTaskType
	}
	return nil
}

func ValidateBug(title, desc string, severity models.Severity, affectedType models.EntityType) error {
	if len(strings.TrimSpace(title)) < 3 {
		return ErrInvalidTitle
	}
	if len(strings.TrimSpace(desc)) < 5 {
		return ErrInvalidDescription
	}
	switch severity {
	case models.SeverityLow, models.SeverityMedium, models.SeverityHigh, models.SeverityCritical:
		// ok
	default:
		return ErrInvalidSeverity
	}
	switch affectedType {
	case models.EntityTypeUserStory, models.EntityTypeTask, models.EntityTypeSubtask:
		// ok
	default:
		return ErrInvalidEntityType
	}
	return nil
}
