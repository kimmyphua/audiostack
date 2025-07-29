// Format file size from bytes to human readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format date to locale string
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}

// Format time from seconds to MM:SS format
export const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Get API base URL for streaming
export const getStreamUrl = (id: string): string => {
  const token = localStorage.getItem('token')
  const baseUrl = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? `/api/audio/${id}/file`
    : `http://localhost:5001/api/audio/${id}/file`
  
  return `${baseUrl}?token=${token}`
}

// Get API base URL
export const getApiBaseUrl = (): string => {
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

// Validate file size
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize
}

// Get file extension
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Check if file is audio/video
export const isAudioVideoFile = (file: File): boolean => {
  return file.type.startsWith('audio/') || file.type.startsWith('video/')
}

// Generate initials from username
export const getInitials = (username: string): string => {
  return username.charAt(0).toUpperCase()
}

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Local storage helpers
export const storage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Handle storage errors silently
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Handle storage errors silently
    }
  },
  clear: (): void => {
    try {
      localStorage.clear()
    } catch {
      // Handle storage errors silently
    }
  },
} 