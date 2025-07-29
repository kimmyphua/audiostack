import axios from 'axios'
import { API_ENDPOINTS } from '../constants'
import { getApiBaseUrl, storage } from '../utils'

export const api = axios.create({
  baseURL: getApiBaseUrl(),
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('API Request URL:', (config.baseURL || '') + (config.url || ''))
    const token = storage.get('token')
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
      storage.remove('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  login: (username: string, password: string) =>
    api.post(API_ENDPOINTS.AUTH.LOGIN, { username, password }),
  register: (username: string, password: string, email?: string) =>
    api.post(API_ENDPOINTS.AUTH.REGISTER, { username, password, email }),
  me: () => api.get(API_ENDPOINTS.AUTH.ME),
}

export const userAPI = {
  getProfile: (id: string) => api.get(API_ENDPOINTS.USERS.PROFILE(id)),
  updateProfile: (id: string, data: any) => api.put(API_ENDPOINTS.USERS.PROFILE(id), data),
  deleteProfile: (id: string) => api.delete(API_ENDPOINTS.USERS.PROFILE(id)),
}

export const audioAPI = {
  upload: (formData: FormData) => api.post(API_ENDPOINTS.AUDIO.UPLOAD, formData),
  getMyFiles: (params?: any) => api.get(API_ENDPOINTS.AUDIO.MY_FILES, { params }),
  getFile: (id: string) => api.get(API_ENDPOINTS.AUDIO.FILE(id)),
  updateFile: (id: string, data: any) => api.put(API_ENDPOINTS.AUDIO.FILE(id), data),
  deleteFile: (id: string) => api.delete(API_ENDPOINTS.AUDIO.FILE(id)),
  getCategories: () => api.get(API_ENDPOINTS.AUDIO.CATEGORIES),
} 