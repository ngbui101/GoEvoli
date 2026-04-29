export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  wipLimits: {
    next: number;
    doing: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type StoryStatus = 'EGG' | 'EVOLVING' | 'READY_FOR_TEST' | 'FINAL_EVOLUTION' | 'BLOCKED' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskType = 'FUNCTIONALITY' | 'UI_UX' | 'STABILITY' | 'BUG';
export type TaskStatus = 'BACKLOG' | 'NEXT' | 'DOING' | 'TEST' | 'DONE' | 'BLOCKED';
export type FinalEvolution = 'FEATURE_EVOLUTION' | 'DESIGN_EVOLUTION' | 'STABILITY_EVOLUTION';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EntityType = 'USER_STORY' | 'TASK' | 'SUBTASK';

export interface UserStory {
  id: string;
  projectId: string;
  productOwnerId: string;
  title: string;
  description: string;
  acceptanceCriteria?: string;
  priority: Priority;
  status: StoryStatus;
  storyTestPassed: boolean;
  manuallyCompleted: boolean;
  finalEvolution?: FinalEvolution;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  storyId: string;
  assigneeId?: string;
  createdBy?: User;
  assigned?: User[];
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  workload: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bug {
  id: string;
  projectId: string;
  title: string;
  description: string;
  severity: Severity;
  status: string;
  blocksWork: boolean;
  affectedEntityType: EntityType;
  affectedEntityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  projectId: string;
  storyId: string;
  authorId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface WipStatus {
  nextCount: number;
  doingCount: number;
  nextLimit: number;
  doingLimit: number;
}
