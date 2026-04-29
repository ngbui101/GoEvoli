import axios from 'axios';

// Get backend URL from environment or fallback to default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for sending cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => {
    // If the backend wraps data in { success: true, data: ... }, unwrap it
    if (response.data && response.data.success === true) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // Return a structured error with a usable message
    if (error.response && error.response.data) {
      const data = error.response.data;
      // Backend returns { success: false, error: "message" }
      const message = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      const err = new Error(message) as any;
      err.status = error.response.status;
      err.data = data;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  }
);
