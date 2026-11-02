import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  // Send the httpOnly session cookie with cross-origin API requests.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Requests to these auth endpoints are expected to handle their own 401s
// (e.g. checking the current session), so a 401 there must not trigger a
// global redirect.
const AUTH_ENDPOINTS = ['/auth/me', '/auth/login', '/auth/signup', '/auth/logout'];

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

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
      // On an unauthenticated response, clear the session and redirect to the
      // login page (unless the request was itself an auth request).
      if (
        error.response.status === 401 &&
        !isAuthEndpoint(error.config?.url) &&
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login'
      ) {
        window.location.assign('/login');
      }
      const responseData = error.response.data as { error?: { message?: string } } | undefined;
      const message = responseData?.error?.message || 'An unexpected error occurred';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  }
);
