import axios from 'axios';
import { API_ENDPOINTS } from '../constants';
import { getApiBaseUrl, storage } from '../utils/apiHelpers';

export const api = axios.create({
  baseURL: getApiBaseUrl(),
});

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = storage.get('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set Content-Type for non-FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  response => response,
  error => {
    // Only redirect on 401 errors if we're not on auth pages
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage =
        currentPath.includes('/login') || currentPath.includes('/register');

      if (!isAuthPage) {
        console.log('401 error on non-auth page, redirecting to login');
        storage.remove('token');
        window.location.href = '/login';
      } else {
        console.log('401 error on auth page, not redirecting');
      }
    }
    return Promise.reject(error);
  }
);

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
