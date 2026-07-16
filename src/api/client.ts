import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => {
    const data = response.data as { success?: boolean; data?: unknown };
    if (data && typeof data === 'object' && 'success' in data && data.data !== undefined) {
      response.data = data.data;
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const responseData = error.response.data as { error?: { message?: string } } | undefined;
      const message = responseData?.error?.message || 'An unexpected error occurred';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  }
);
