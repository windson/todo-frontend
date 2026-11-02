import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * An Error enriched with the HTTP status so callers (hooks) can branch on
 * specific outcomes such as 409 (optimistic-concurrency conflict) without
 * re-parsing the message. Backward compatible: existing `error.message`
 * handling keeps working.
 */
export class ApiRequestError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

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
      const status = error.response.status;

      // On an unauthenticated response, clear the session and redirect to the
      // login page (unless the request was itself an auth request).
      if (
        status === 401 &&
        !isAuthEndpoint(error.config?.url) &&
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login'
      ) {
        window.location.assign('/login');
      }

      const responseData = error.response.data as { error?: { message?: string } } | undefined;
      const message = responseData?.error?.message || 'An unexpected error occurred';

      // Surface rate limiting (429) with a friendly toast globally so every
      // caller benefits without special-casing it. The rejection still
      // propagates so callers can stop their own loading state.
      if (status === 429) {
        toast.error(
          "You're doing that too fast. Please wait a moment and try again."
        );
      }

      // Carry the status so hooks can detect specific outcomes (e.g. 409).
      return Promise.reject(new ApiRequestError(message, status));
    }
    return Promise.reject(error);
  }
);
