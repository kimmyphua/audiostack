// Format file size from bytes to human readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateString = (str: string, maxLength = 50): string => {
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

// Format date to locale string
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

// Format time from seconds to MM:SS format
export const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const getInitials = (username: string): string => {
  return username.charAt(0).toUpperCase();
};
