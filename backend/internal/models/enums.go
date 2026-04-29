package models

type Role string

const (
	RoleAdmin        Role = "ADMIN"
	RoleProductOwner Role = "PRODUCT_OWNER"
	RoleScrumMaster  Role = "SCRUM_MASTER"
	RoleDeveloper    Role = "DEVELOPER"
	RoleTester       Role = "TESTER"
	RoleViewer       Role = "VIEWER"
)

type Priority string

const (
	PriorityLow      Priority = "LOW"
	PriorityMedium   Priority = "MEDIUM"
	PriorityHigh     Priority = "HIGH"
	PriorityCritical Priority = "CRITICAL"
)

type StoryStatus string

const (
	StoryStatusEgg            StoryStatus = "EGG"
	StoryStatusEvolving       StoryStatus = "EVOLVING"
	StoryStatusReadyForTest   StoryStatus = "READY_FOR_TEST"
	StoryStatusFinalEvolution StoryStatus = "FINAL_EVOLUTION"
	StoryStatusDone           StoryStatus = "DONE"
	StoryStatusBlocked        StoryStatus = "BLOCKED"
)

type TaskStatus string

const (
	TaskStatusBacklog TaskStatus = "BACKLOG"
	TaskStatusNext    TaskStatus = "NEXT"
	TaskStatusDoing   TaskStatus = "DOING"
	TaskStatusTest    TaskStatus = "TEST"
	TaskStatusDone    TaskStatus = "DONE"
	TaskStatusBlocked TaskStatus = "BLOCKED"
)

type TaskType string

const (
	TaskTypeFunctionality TaskType = "FUNCTIONALITY"
	TaskTypeUIUX          TaskType = "UI_UX"
	TaskTypeStability     TaskType = "STABILITY"
	TaskTypeBug           TaskType = "BUG"
)

type BugStatus string

const (
	BugStatusOpen       BugStatus = "OPEN"
	BugStatusInProgress BugStatus = "IN_PROGRESS"
	BugStatusResolved   BugStatus = "RESOLVED"
	BugStatusRetest     BugStatus = "RETEST"
	BugStatusClosed     BugStatus = "CLOSED"
)

type Severity string

const (
	SeverityLow      Severity = "LOW"
	SeverityMedium   Severity = "MEDIUM"
	SeverityHigh     Severity = "HIGH"
	SeverityCritical Severity = "CRITICAL"
)

type FinalEvolution string

const (
	FinalEvolutionFeature   FinalEvolution = "FEATURE_EVOLUTION"
	FinalEvolutionDesign    FinalEvolution = "DESIGN_EVOLUTION"
	FinalEvolutionStability FinalEvolution = "STABILITY_EVOLUTION"
)

type EntityType string

const (
	EntityTypeUserStory EntityType = "USER_STORY"
	EntityTypeTask      EntityType = "TASK"
	EntityTypeSubtask   EntityType = "SUBTASK"
)

type ActivityAction string

const (
	ActivityActionProjectCreated     ActivityAction = "PROJECT_CREATED"
	ActivityActionRoleChanged        ActivityAction = "ROLE_CHANGED"
	ActivityActionWipLimitChanged    ActivityAction = "WIP_LIMIT_CHANGED"
	ActivityActionStoryCreated       ActivityAction = "STORY_CREATED"
	ActivityActionStoryUpdated       ActivityAction = "STORY_UPDATED"
	ActivityActionStoryStatusChanged ActivityAction = "STORY_STATUS_CHANGED"
	ActivityActionTaskCreated        ActivityAction = "TASK_CREATED"
	ActivityActionTaskMoved          ActivityAction = "TASK_MOVED"
	ActivityActionTaskUpdated        ActivityAction = "TASK_UPDATED"
	ActivityActionBugCreated         ActivityAction = "BUG_CREATED"
	ActivityActionBugStatusChanged   ActivityAction = "BUG_STATUS_CHANGED"
	ActivityActionBugClosed          ActivityAction = "BUG_CLOSED"
	ActivityActionCommentCreated     ActivityAction = "COMMENT_CREATED"
	ActivityActionFinalEvolutionSet  ActivityAction = "FINAL_EVOLUTION_SET"
	ActivityActionStoryCompleted     ActivityAction = "STORY_COMPLETED"
)
