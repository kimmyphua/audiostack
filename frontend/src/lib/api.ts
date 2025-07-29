import axios from 'axios'

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // In development, use the proxy (works with hot reload)
  if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
    console.log('Using proxy URL: /api')
    return '/api'
  }
  // In production, use the same domain as the frontend
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.log('Using production API URL: /api')
    return '/api'
  }
  // Fallback for Docker production
  console.log('Using backend URL: http://localhost:5001/api')
  return 'http://localhost:5001/api'
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('API Request URL:', (config.baseURL || '') + (config.url || ''))
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Set Content-Type for non-FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (username: string, password: string, email?: string) =>
    api.post('/auth/register', { username, password, email }),
  me: () => api.get('/auth/me'),
}

export const userAPI = {
  getProfile: (id: string) => api.get(`/users/${id}`),
  updateProfile: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteProfile: (id: string) => api.delete(`/users/${id}`),
}

export const audioAPI = {
  upload: (formData: FormData) => api.post('/audio/upload', formData),
  getMyFiles: (params?: any) => api.get('/audio/my-files', { params }),
  getFile: (id: string) => api.get(`/audio/${id}`),
  // streamFile: (id: string) => api.get(`/audio/${id}/stream`),
  updateFile: (id: string, data: any) => api.put(`/audio/${id}`, data),
  deleteFile: (id: string) => api.delete(`/audio/${id}`),
  getCategories: () => api.get('/audio/categories/list'),
} 