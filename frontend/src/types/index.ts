// User types
export interface User {
  id: string
  username: string
  email: string
}

// Audio file types
export interface AudioFile {
  id: string
  originalName: string
  description?: string
  category: string
  fileSize: number
  mimeType: string
  createdAt: string
}

// Auth context types
export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, email: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => Promise<void>
}

// Navigation types
export interface NavigationItem {
  name: string
  href: string
  icon: string
}

// Quick action types
export interface QuickAction {
  name: string
  description: string
  href: string
  icon: string
  color: 'blue' | 'green' | 'purple'
}

// Getting started step types
export interface GettingStartedStep {
  number: number
  text: string
  description: string
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  error?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface AudioFilesResponse {
  audioFiles: AudioFile[]
}

export interface AudioFileResponse {
  audioFile: AudioFile
}

export interface CategoriesResponse {
  categories: string[]
}

// Form types
export interface LoginForm {
  username: string
  password: string
}

export interface RegisterForm {
  username: string
  email: string
  password: string
}

export interface UploadForm {
  audio: File
  description: string
  category: string
}

export interface ProfileForm {
  username: string
  email: string
  password?: string
}

// Audio player types
export interface AudioPlayerState {
  playing: boolean
  currentTime: number
  duration: number
  volume: number
}

// Search and filter types
export interface AudioFilters {
  search?: string
  category?: string
}

// Component prop types
export interface AudioFileCardProps {
  id: string
  originalName: string
  description?: string
  category: string
  fileSize: number
  createdAt: string
}

export interface ProtectedRouteProps {
  children: JSX.Element
}

// Icon mapping type
export interface IconMap {
  [key: string]: React.ComponentType<{ className?: string }>
} 