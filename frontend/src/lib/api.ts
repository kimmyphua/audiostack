import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { API_ENDPOINTS } from '../constants';
import { authStorage, getApiBaseUrl } from '../utils/apiHelpers';

// Axios Instance
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // Needed for HTTP-only refresh token cookies
});

let refreshPromise: Promise<any> | null = null;
let isRefreshing = false;

// Utility: Identify auth endpoints
const isAuthEndpoint = (url: string = ''): boolean =>
  url.includes('/login') || url.includes('/register');

// Utility: Decode JWT Expiry
const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp;
  } catch {
    return null;
  }
};

// Token Refresh Logic
const refreshAccessToken = async () => {
  if (!refreshPromise) {
    isRefreshing = true;
    refreshPromise = axios.post(
      `${getApiBaseUrl()}/auth/refresh`,
      {},
      { withCredentials: true }
    );
  }
  try {
    const { data } = await refreshPromise;
    authStorage.setAccessToken(data.accessToken);
    return data.accessToken;
  } finally {
    refreshPromise = null;
    isRefreshing = false;
  }
};

// Request Interceptor
api.interceptors.request.use(async config => {
  // Skip proactive refresh for auth endpoints to prevent infinite loops
  if (isAuthEndpoint(config.url || '')) {
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  }

  const token = authStorage.getAccessToken();

  if (token) {
    const exp = getTokenExpiry(token);
    const now = Math.floor(Date.now() / 1000);

    if (exp && exp - now < 60 && !isRefreshing) {
      try {
        console.log('Access token expiring soon, refreshing...');
        const newToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${newToken}`;
      } catch (refreshError) {
        console.error('Token refresh failed, redirecting to login');
        authStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// Response Interceptor
api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest || isAuthEndpoint(originalRequest.url || '')) {
      return Promise.reject(error);
    }

    // Handle expired token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return api(originalRequest);
      } catch (err) {
        console.error('Refresh failed, redirecting to login');
        authStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// API Groups
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),

  register: (data: { username: string; email: string; password: string }) =>
    api.post(API_ENDPOINTS.AUTH.REGISTER, data),

  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),
  logoutAll: () => api.post(API_ENDPOINTS.AUTH.LOGOUT_ALL),
  getMe: () => api.get(API_ENDPOINTS.AUTH.ME),
  refresh: () => api.post(API_ENDPOINTS.AUTH.REFRESH),

  updateUser: (
    id: string,
    data: { username: string; email: string; password?: string }
  ) => api.put(API_ENDPOINTS.USERS.PROFILE(id), data),

  deleteUser: (id: string) => api.delete(API_ENDPOINTS.USERS.PROFILE(id)),
};

export const audioAPI = {
  upload: (formData: FormData) =>
    api.post(API_ENDPOINTS.AUDIO.UPLOAD, formData),
  getMyFiles: (params?: any) =>
    api.get(API_ENDPOINTS.AUDIO.MY_FILES, { params }),
  getFile: (id: string) => api.get(API_ENDPOINTS.AUDIO.FILE(id)),
  updateFile: (id: string, data: any) =>
    api.put(API_ENDPOINTS.AUDIO.FILE(id), data),
  deleteFile: (id: string) => api.delete(API_ENDPOINTS.AUDIO.FILE(id)),
  getCategories: () => api.get(API_ENDPOINTS.AUDIO.CATEGORIES),
};
