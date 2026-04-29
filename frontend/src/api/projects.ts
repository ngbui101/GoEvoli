import { apiClient } from './client';
import type { Project } from '../types';

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    return apiClient.get('/projects');
  },
  getById: async (id: string): Promise<Project> => {
    return apiClient.get(`/projects/${id}`);
  },
  create: async (data: { name: string, description: string }): Promise<Project> => {
    return apiClient.post('/projects', data);
  },
};
