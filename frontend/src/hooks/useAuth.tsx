import { useQuery, useQueryClient } from 'react-query';
import { authAPI } from '../lib/api';
import { authStorage } from '../utils/apiHelpers';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: loading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      // Check if we have user data in session storage
      const storedUser = authStorage.getUser();
      const accessToken = authStorage.getAccessToken();

      if (storedUser && accessToken) {
        try {
          const response = await authAPI.getMe();
          return response.data.user;
        } catch (error: any) {
          // If token is invalid, clear storage
          if (error.response?.status === 401) {
            authStorage.clear();
          }
          throw error;
        }
      }

      return null;
    },
    onError: (error: any) => {
      console.error('Failed to restore user session:', error);
      // If token is invalid (expired)
      if (error.response?.status === 401) {
        authStorage.clear();
      }
    },
    refetchOnMount: false, // Don't refetch on mount to prevent infinite loops
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: false, // Disable retries to prevent infinite loops
    staleTime: 4 * 60 * 1000, // Consider data refresh after 4 minutes
  });

  // Note: Removed proactive refresh to prevent token reuse issues
  // The response interceptor will handle token refresh when needed

  const login = async (credentials: { username: string; password: string }) => {
    // Clear any old tokens to ensure fresh login with new token format
    authStorage.clear();

    const response = await authAPI.login(credentials);

    authStorage.setAccessToken(response.data.accessToken);
    authStorage.setUser(response.data.user);

    queryClient.setQueryData(['user'], response.data.user);

    return response.data;
  };

  const registerUser = async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    authStorage.clear();

    const response = await authAPI.register(userData);

    authStorage.setAccessToken(response.data.accessToken);
    authStorage.setUser(response.data.user);

    queryClient.setQueryData(['user'], response.data.user);

    return response.data;
  };

  const updateProfile = async (
    userId: string,
    userData: { username: string; email: string; password?: string }
  ) => {
    const response = await authAPI.updateUser(userId, userData);

    authStorage.setUser(response.data.user);
    queryClient.setQueryData(['user'], response.data.user);

    return response.data;
  };

  const deleteUser = async (userId: string) => {
    const response = await authAPI.deleteUser(userId);
    return response.data;
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate refresh token
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      authStorage.clear();
      queryClient.invalidateQueries(['user']);
      queryClient.clear();
    }
  };

  const logoutAll = async () => {
    try {
      await authAPI.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      authStorage.clear();
      queryClient.invalidateQueries(['user']);
      queryClient.clear();
    }
  };

  return {
    user,
    loading,
    login,
    registerUser,
    logout,
    logoutAll,
    updateProfile,
    deleteUser,
    isAuthenticated: !!user,
  };
}
