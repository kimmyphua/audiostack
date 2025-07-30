// Audio categories
export const AUDIO_CATEGORIES = [
  'Music',
  'Podcast',
  'Audiobook',
  'Sound Effect',
  'Voice Recording',
  'Interview',
  'Lecture',
  'Other',
]  

// export type AudioCategory = typeof AUDIO_CATEGORIES[number]

// File size limits
export const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
export const MAX_FILE_SIZE_MB = 25

// Supported audio formats
export const SUPPORTED_AUDIO_FORMATS = [
  'audio/*',
  'video/*'
] 

// Navigation items
export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: 'Home' },
  { name: 'Upload Audio', href: '/upload', icon: 'Upload' },
  { name: 'My Files', href: '/files', icon: 'Music' },
  { name: 'Profile', href: '/profile', icon: 'User' },
] 

// Quick actions for dashboard
export const QUICK_ACTIONS = [
  {
    name: 'Upload Audio',
    description: 'Upload a new audio file',
    href: '/upload',
    icon: 'Upload',
    color: 'blue',
  },
  {
    name: 'My Files',
    description: 'View and manage your audio files',
    href: '/files',
    icon: 'Music',
    color: 'green',
  },
  {
    name: 'Profile',
    description: 'Manage your account settings',
    href: '/profile',
    icon: 'User',
    color: 'purple',
  },
]  

// Getting started steps
export const GETTING_STARTED_STEPS = [
  {
    number: 1,
    text: 'Drop the Beat',
    description: 'Ready to jam? Click on “Upload Audio” and kick off your personal sound collection. \n 🎵 Your vibes, your library.',
  },
  {
    number: 2,
    text: 'Sort Like a Pro',
    description: 'Keep your library tight - add categories and descriptions to find your files faster than you can say “lo-fi chill beats”. \n 📁 Organized files = happier ears.',
  },
  {
    number: 3,
    text: 'Hit Play & Vibe',
    description: 'Kick back and let the music play. Our built-in player is here to soundtrack your moment.\n ▶️ Because silence is overrated.',
  },
]  

// Default credentials for demo
export const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
}  

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  USERS: {
    PROFILE: (id: string) => `/users/${id}`,
  },
  AUDIO: {
    UPLOAD: '/audio/upload',
    MY_FILES: '/audio/my-files',
    FILE: (id: string) => `/audio/${id}`,
    STREAM: (id: string) => `/audio/${id}/file`,
    CATEGORIES: '/audio/categories/list',
  },
}  

// Toast configuration
export const TOAST_CONFIG = {
  position: 'top-right' as const,
  duration: 4000,
  style: {
    background: '#363636',
    color: '#fff',
  },
} 

// React Query configuration
export const QUERY_CONFIG = {
  retry: 1,
  refetchOnWindowFocus: false,
}   