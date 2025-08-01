import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { MAX_FILE_SIZE } from '../../../constants';
import { audioAPI } from '../../../lib/api';
import { validateFileSize } from '../../../utils/audioFileHelpers';

export const useFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Music');
  const navigate = useNavigate();

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        if (!validateFileSize(selectedFile, MAX_FILE_SIZE)) {
          toast.error(
            `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
          );
          return;
        }
        setFile(selectedFile);
      }
    },
    []
  );

  const { mutate: handleUploadAudio, isLoading: isUploading } = useMutation({
    mutationFn: async () => {
      if (!file) {
        toast.error('Please select an audio file');
        return;
      }
      const formData = new FormData();
      formData.append('audio', file, file.name);
      formData.append('description', description);
      formData.append('category', category);
      await audioAPI.upload(formData);
    },
    onSuccess: () => {
      toast.success('Audio file uploaded successfully!');
      navigate('/files');
    },
    onError: (error: any) => {
      toast.error(
        error.response.data?.details
          ?.map((detail: any) => detail.message)
          .join(', ') || 'Failed to load audio file'
      );
    },
  });

  const resetForm = useCallback(() => {
    setFile(null);
    setDescription('');
    setCategory('Music');
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
  }, []);

  return {
    file,
    description,
    category,
    isUploading,
    setDescription,
    setCategory,
    handleFileChange,
    handleUploadAudio,
    resetForm,
    removeFile,
  };
};
