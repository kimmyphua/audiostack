// Get API base URL
export const getApiBaseUrl = (): string => {
  // In production (update this with your Railway backend URL)
  if (window.location.hostname !== 'localhost') {
    console.log(
      'Using production API URL: https://audiostack-production.up.railway.app/api'
    );
    return 'https://audiostack-production.up.railway.app/api';
  }

  console.log('Using backend URL: http://localhost:5001/api');
  return 'http://localhost:5001/api';
};

// Local storage helpers (for backward compatibility)
export const authStorage = {
  // Access token (short-lived, stored in sessionStorage)
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },
  setAccessToken: (token: string): void => {
    localStorage.setItem('accessToken', token);
  },
  removeAccessToken: (): void => {
    localStorage.removeItem('accessToken');
  },

  // User data (stored in sessionStorage)
  getUser: (): any => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  setUser: (user: any): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  removeUser: (): void => {
    localStorage.removeItem('user');
  },

  // Clear all auth data
  clear: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },
};
