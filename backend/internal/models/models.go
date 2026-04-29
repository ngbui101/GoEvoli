package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// BaseModel contains the common fields for all collections
type BaseModel struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type User struct {
	BaseModel `bson:",inline"`
	Name      string `bson:"name" json:"name"`
	Email     string `bson:"email" json:"email"`
	Password  string `bson:"password" json:"-"`
}

type WipLimits struct {
	Next  int `bson:"next" json:"next"`
	Doing int `bson:"doing" json:"doing"`
}

type Project struct {
	BaseModel   `bson:",inline"`
	Name        string    `bson:"name" json:"name"`
	Description string    `bson:"description" json:"description"`
	WipLimits   WipLimits `bson:"wipLimits" json:"wipLimits"`
}

type ProjectMembership struct {
	BaseModel `bson:",inline"`
	ProjectId primitive.ObjectID `bson:"projectId" json:"projectId"`
	UserId    primitive.ObjectID `bson:"userId" json:"userId"`
	Role      Role               `bson:"role" json:"role"`
}

type UserStory struct {
	BaseModel         `bson:",inline"`
	ProjectId         primitive.ObjectID `bson:"projectId" json:"projectId"`
	ProductOwnerId    primitive.ObjectID `bson:"productOwnerId" json:"productOwnerId"`
	Title             string             `bson:"title" json:"title"`
	Description       string             `bson:"description" json:"description"`
	Priority          Priority           `bson:"priority" json:"priority"`
	Status            StoryStatus        `bson:"status" json:"status"`
	StoryTestPassed   bool               `bson:"storyTestPassed" json:"storyTestPassed"`
	FinalEvolution    *FinalEvolution    `bson:"finalEvolution,omitempty" json:"finalEvolution,omitempty"`
	ManuallyCompleted bool               `bson:"manuallyCompleted" json:"manuallyCompleted"`
}

type AcceptanceCriterion struct {
	BaseModel `bson:",inline"`
	StoryId   primitive.ObjectID `bson:"storyId" json:"storyId"`
	ProjectId primitive.ObjectID `bson:"projectId" json:"projectId"`
	Text      string             `bson:"text" json:"text"`
	Done      bool               `bson:"done" json:"done"`
}

type Task struct {
	BaseModel   `bson:",inline"`
	ProjectId   primitive.ObjectID   `bson:"projectId" json:"projectId"`
	StoryId     primitive.ObjectID   `bson:"storyId" json:"storyId"`
	AssigneeId  primitive.ObjectID   `bson:"assigneeId,omitempty" json:"assigneeId,omitempty"`
	CreatedBy   primitive.ObjectID   `bson:"createdBy,omitempty" json:"createdBy,omitempty"`
	Assigned    []primitive.ObjectID `bson:"assigned,omitempty" json:"assigned,omitempty"`
	Title       string               `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	Type        TaskType           `bson:"type" json:"type"`
	Status      TaskStatus         `bson:"status" json:"status"`
	Priority    Priority           `bson:"priority" json:"priority"`
	Workload    float64            `bson:"workload" json:"workload"`
}

type Subtask struct {
	BaseModel `bson:",inline"`
	ProjectId primitive.ObjectID `bson:"projectId" json:"projectId"`
	TaskId    primitive.ObjectID `bson:"taskId" json:"taskId"`
	Title     string             `bson:"title" json:"title"`
	Done      bool               `bson:"done" json:"done"`
	Required  bool               `bson:"required" json:"required"`
}

type Bug struct {
	BaseModel          `bson:",inline"`
	ProjectId          primitive.ObjectID  `bson:"projectId" json:"projectId"`
	Title              string              `bson:"title" json:"title"`
	Description        string              `bson:"description" json:"description"`
	Severity           Severity            `bson:"severity" json:"severity"`
	Status             BugStatus           `bson:"status" json:"status"`
	BlocksWork         bool                `bson:"blocksWork" json:"blocksWork"`
	AffectedEntityType EntityType          `bson:"affectedEntityType" json:"affectedEntityType"`
	AffectedEntityId   primitive.ObjectID  `bson:"affectedEntityId" json:"affectedEntityId"`
	AssigneeId         *primitive.ObjectID `bson:"assigneeId,omitempty" json:"assigneeId,omitempty"`
}

type Comment struct {
	BaseModel `bson:",inline"`
	ProjectId primitive.ObjectID `bson:"projectId" json:"projectId"`
	StoryId   primitive.ObjectID `bson:"storyId" json:"storyId"`
	AuthorId  primitive.ObjectID `bson:"authorId" json:"authorId"`
	Text      string             `bson:"text" json:"text"`
}

type ActivityLog struct {
	BaseModel  `bson:",inline"`
	ProjectId  primitive.ObjectID `bson:"projectId" json:"projectId"`
	ActorId    primitive.ObjectID `bson:"actorId" json:"actorId"`
	EntityType EntityType         `bson:"entityType" json:"entityType"`
	EntityId   primitive.ObjectID `bson:"entityId" json:"entityId"`
	Action     ActivityAction     `bson:"action" json:"action"`
	OldValue   string             `bson:"oldValue,omitempty" json:"oldValue,omitempty"`
	NewValue   string             `bson:"newValue,omitempty" json:"newValue,omitempty"`
}
