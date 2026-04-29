import { apiClient } from './client';
import type { UserStory, Task, Bug, TaskStatus, FinalEvolution, Comment, Activity } from '../types';

export const boardApi = {
  getStories: async (projectId: string): Promise<UserStory[]> => {
    return apiClient.get(`/projects/${projectId}/stories`);
  },

  createStory: async (projectId: string, story: { title: string; description: string; priority: string }): Promise<UserStory> => {
    return apiClient.post(`/projects/${projectId}/stories`, story);
  },

  getTasks: async (storyId: string): Promise<Task[]> => {
    return apiClient.get(`/stories/${storyId}/tasks`);
  },

  createTask: async (storyId: string, task: {
    title: string;
    description: string;
    type: string;
    priority: string;
    workload: number;
  }): Promise<Task> => {
    return apiClient.post(`/stories/${storyId}/tasks`, task);
  },

  moveTask: async (taskId: string, targetStatus: TaskStatus): Promise<{ message: string }> => {
    return apiClient.post(`/tasks/${taskId}/move`, { targetStatus });
  },

  getBugs: async (projectId: string): Promise<Bug[]> => {
    return apiClient.get(`/projects/${projectId}/bugs`);
  },

  createBug: async (projectId: string, bug: {
    title: string;
    description: string;
    severity: string;
    blocksWork: boolean;
    affectedEntityType: string;
    affectedEntityId: string;
  }): Promise<Bug> => {
    return apiClient.post(`/projects/${projectId}/bugs`, bug);
  },

  closeBug: async (bugId: string): Promise<{ message: string }> => {
    return apiClient.post(`/bugs/${bugId}/close`);
  },

  passTest: async (storyId: string): Promise<{ message: string }> => {
    return apiClient.post(`/stories/${storyId}/pass-test`);
  },

  completeStory: async (storyId: string): Promise<{ message: string }> => {
    return apiClient.post(`/stories/${storyId}/complete`);
  },

  setFinalEvolution: async (storyId: string, finalEvolution: FinalEvolution): Promise<{ message: string }> => {
    return apiClient.post(`/stories/${storyId}/final-evolution`, { finalEvolution });
  },

  getComments: async (storyId: string): Promise<Comment[]> => {
    return apiClient.get(`/stories/${storyId}/comments`);
  },

  createComment: async (storyId: string, text: string): Promise<Comment> => {
    return apiClient.post(`/stories/${storyId}/comments`, { text });
  },

  getActivity: async (storyId: string): Promise<Activity[]> => {
    return apiClient.get(`/stories/${storyId}/activity`);
  },
  
  deleteStory: async (storyId: string): Promise<{ message: string }> => {
    return apiClient.delete(`/stories/${storyId}`);
  },

  deleteTask: async (taskId: string): Promise<{ message: string }> => {
    return apiClient.delete(`/tasks/${taskId}`);
  },
};
