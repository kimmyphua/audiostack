import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { audioAPI } from '../../../lib/api';
import { AudioFile, AudioFilters } from '../../../types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export const useAudioFiles = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<AudioFilters>({
    search: '',
    category: '',
  });

  const handleSearch = useCallback(
    (search: AudioFilters) => {
      setFilters({ ...filters, ...search });
    },
    [filters]
  );

  const { data: audioFiles, isLoading: isLoadingAudioFiles } = useQuery({
    queryKey: ['audioFiles', filters],
    queryFn: async () => {
      const params: any = {};
      if (filters?.search) params.search = filters.search;
      if (filters?.category) params.category = filters.category;
      const response = await audioAPI.getMyFiles(params);
      return response.data.audioFiles as AudioFile[];
    },
    onError: (error: any) => {
      toast.error('Failed to load audio files');
      console.error('load audio files error', error);
    },
  });

  const { mutate: deleteAudioFile } = useMutation({
    mutationFn: (id: string) => audioAPI.deleteFile(id),
    onSuccess: () => {
      toast.success('Audio file deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['audioFiles'] });
    },
    onError: () => {
      toast.error('Failed to delete audio file');
    },
  });

  const handleDelete = async (
    e: React.MouseEvent,
    id: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    e.stopPropagation(); // Prevent row click from triggering
    if (!confirm('Are you sure you want to delete this audio file?')) {
      onCancel?.();
      return;
    }
    deleteAudioFile(id);
    onConfirm?.();
  };

  return {
    audioFiles,
    isLoadingAudioFiles,
    handleSearch,
    handleDelete,
  };
};
