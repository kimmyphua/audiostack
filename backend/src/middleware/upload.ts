import fs from 'fs';
import multer from 'multer';
import path from 'path';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const INVALID_FILE_TYPE_ERROR =
  'Invalid file type. Only audio files are allowed.';
// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/mp4',
      'audio/aac',
      'audio/flac',
      'audio/webm',
      'video/mp4', // Some audio files might be uploaded as video
      'video/webm',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(INVALID_FILE_TYPE_ERROR));
    }
  },
});

// Error handling middleware for multer
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
  // Handle multer-specific errors
  if (err instanceof multer.MulterError) {
    const errorMessages: Record<string, string> = {
      LIMIT_FILE_SIZE: 'File too large', // 25MB
      LIMIT_FILE_COUNT: 'Too many files', // 1
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field', // audio
      LIMIT_FIELD_KEY: 'Field name too long', // 100 characters
      LIMIT_FIELD_VALUE: 'Field value too long', // 1MB
    };

    const message = errorMessages[err.code] || err.message;
    return res.status(400).json({ error: message });
  }

  // Handle custom file type validation errors
  if (err.message === INVALID_FILE_TYPE_ERROR) {
    return res.status(400).json({ error: err.message });
  }

  next(err);
};
