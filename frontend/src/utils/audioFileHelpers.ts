import { getApiBaseUrl } from './apiHelpers';

// Get API base URL for streaming
export const getStreamUrl = (id: string): string => {
  const token = localStorage.getItem('token');
  const baseUrl = `${getApiBaseUrl()}/audio/${id}/file`;
  console.log('baseUrl', baseUrl);
  return `${baseUrl}?token=${token}`;
};

// Validate file size
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

// Check if file is audio/video
export const isAudioVideoFile = (file: File): boolean => {
  return file.type.startsWith('audio/') || file.type.startsWith('video/');
};
