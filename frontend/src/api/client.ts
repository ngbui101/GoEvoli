import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('goevoli:unauthorized'));
    }

    if (error.response && error.response.data) {
      const data = error.response.data;
      const message = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      const err = new Error(message) as any;
      err.status = error.response.status;
      err.data = data;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  }
);
