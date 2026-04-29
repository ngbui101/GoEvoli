import { apiClient } from './client';
import type { User, LoginCredentials } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ message: string }> => {
    return apiClient.post('/auth/login', credentials);
  },

  logout: async (): Promise<{ message: string }> => {
    return apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    return apiClient.get('/auth/me');
  },
  register: async (data: any): Promise<User> => {
    return apiClient.post('/auth/register', data);
  },
  checkEmail: async (email: string): Promise<{ exists: boolean }> => {
    return apiClient.post('/auth/check-email', { email });
  },
};
