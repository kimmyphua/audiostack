// Get API base URL
export const getApiBaseUrl = (): string => {
  // In production (update this with your Railway backend URL)
  if (window.location.hostname !== 'localhost') {
    console.log('Using production API URL: https://audiostack-production.up.railway.app');
    return 'https://audiostack-production.up.railway.app';
  }

  console.log('Using backend URL: http://localhost:5001/api');
  return 'http://localhost:5001/api';
};

// Local storage helpers
export const storage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Handle storage errors silently
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Handle storage errors silently
    }
  },
  clear: (): void => {
    try {
      localStorage.clear();
    } catch {
      // Handle storage errors silently
    }
  },
};
