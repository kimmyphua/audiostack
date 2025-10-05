import { authStorage, getApiBaseUrl } from './apiHelpers';

// Fetch audio file with authentication and return blob URL
export const getAudioBlobUrl = async (id: string): Promise<string> => {
  try {
    // Use the authenticated API client to fetch the audio file
    const fileUrl = `${getApiBaseUrl()}/audio/${id}/file`;

    // Fetch the audio file with proper authentication
    const audioResponse = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${authStorage.getAccessToken() || ''}`,
      },
    });

    if (!audioResponse.ok) {
      throw new Error(`HTTP error! status: ${audioResponse.status}`);
    }

    const audioBlob = await audioResponse.blob();
    const blobUrl = URL.createObjectURL(audioBlob);
    console.log('Blob URL created:', blobUrl);

    return blobUrl;
  } catch (error) {
    console.error('Error fetching audio file:', error);
    throw error;
  }
};

// Validate file size
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

// Check if file is audio/video
export const isAudioVideoFile = (file: File): boolean => {
  return file.type.startsWith('audio/') || file.type.startsWith('video/');
};
