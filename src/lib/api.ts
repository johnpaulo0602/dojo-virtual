import axios from 'axios';

// Base API instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// We will store the token in memory to avoid XSS in localStorage.
// Refresh token could be stored in localStorage or cookies.
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// --- Case conversion helpers ---
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function transformKeys(obj: unknown, fn: (s: string) => string): unknown {
  if (Array.isArray(obj)) return obj.map((item) => transformKeys(item, fn));
  if (obj && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, val]) => [
        fn(key),
        transformKeys(val, fn),
      ])
    );
  }
  return obj;
}

// Request interceptor: camelCase → snake_case for JSON bodies
api.interceptors.request.use((config) => {
  if (config.data && typeof config.data === "object" && !(config.data instanceof FormData)) {
    config.data = transformKeys(config.data, camelToSnake);
  }
  return config;
});

// Request interceptor to add the bearer token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: snake_case → camelCase
api.interceptors.response.use((response) => {
  if (response.data) {
    response.data = transformKeys(response.data, snakeToCamel);
  }
  return response;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(`${api.defaults.baseURL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken
        });

        const { access_token, refresh_token: new_refresh } = response.data;

        // Update tokens
        setAccessToken(access_token);
        localStorage.setItem('refresh_token', new_refresh);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, user must login again
        setAccessToken(null);
        localStorage.removeItem('refresh_token');

        // Force reload to trigger AuthContext to kick user to login page
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
