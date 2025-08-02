import { useQuery, useQueryClient } from 'react-query';
import { API_ENDPOINTS } from '../constants';
import { api } from '../lib/api';
import { storage } from '../utils/apiHelpers';

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = storage.get('token');
      if (token) {
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get(API_ENDPOINTS.AUTH.ME);
        return response.data.user;
      }
    },
    onError: (error: any) => {
      console.error('Failed to restore user session:', error);
      // If token is invalid eg expired
      if (error.response?.status === 401) {
        storage.remove('token');
        delete api.defaults.headers.common['Authorization'];
      }
    },
    refetchOnMount: true,
  });

  const logout = () => {
    storage.remove('token');
    delete api.defaults.headers.common['Authorization'];
    queryClient.invalidateQueries(['user']);
    queryClient.clear();
  };

  return { user, loading, logout };
}
