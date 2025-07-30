import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import fs from 'fs';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { ErrorResponses, handleValidationErrors } from '../utils/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Audio categories
export const AUDIO_CATEGORIES = [
  'Music',
  'Podcast',
  'Audiobook',
  'Sound Effect',
  'Voice Recording',
  'Interview',
  'Lecture',
  'Other'
];

// Upload audio file
router.post('/upload', [
  authenticateToken,
  upload.single('audio'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  body('category').isIn(AUDIO_CATEGORIES).withMessage('Invalid category')
], async (req: AuthRequest, res: Response) => {
  try {
    console.log('Upload request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request headers:', req.headers['content-type']);
    
    // Handle validation errors
    if (handleValidationErrors(req, res)) {
      return;
    }
    
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'No audio file provided'
      });
    }

    const { description, category } = req.body;
    const userId = req.user!.id;

    // Create audio file record
    const audioFile = await prisma.audioFile.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        description: description || null,
        category,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        userId
      }
    });
    res.status(201).json({
      message: 'Audio file uploaded successfully',
      audioFile: {
        id: audioFile.id,
        filename: audioFile.filename,
        originalName: audioFile.originalName,
        description: audioFile.description,
        category: audioFile.category,
        fileSize: audioFile.fileSize,
        mimeType: audioFile.mimeType,
        createdAt: audioFile.createdAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json(ErrorResponses.internalServerError());
  }
});

// Get user's audio files
router.get('/my-files', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, category, search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = { userId };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { originalName: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [audioFiles, total] = await Promise.all([
      prisma.audioFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          filename: true,
          originalName: true,
          description: true,
          category: true,
          fileSize: true,
          mimeType: true,
          duration: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.audioFile.count({ where })
    ]);

    res.json({
      audioFiles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get audio files error:', error);
    res.status(500).json(ErrorResponses.internalServerError());
  }
});

// Get audio file by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const audioFile = await prisma.audioFile.findFirst({
      where: { id, userId },
      select: {
        id: true,
        filename: true,
        originalName: true,
        description: true,
        category: true,
        fileSize: true,
        mimeType: true,
        duration: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!audioFile) {
      return res.status(404).json(ErrorResponses.notFound('Audio file'));
    }

    res.json({ audioFile });
  } catch (error) {
    console.error('Get audio file error:', error);
    res.status(500).json(ErrorResponses.internalServerError());
  }
});

// Update audio file
router.put('/:id', [
  authenticateToken,
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  body('category').optional().isIn(AUDIO_CATEGORIES).withMessage('Invalid category')
], async (req: AuthRequest, res: Response) => {
  try {
    // Handle validation errors
    if (handleValidationErrors(req, res)) {
      return;
    }

    const { id } = req.params;
    const userId = req.user!.id;
    const { description, category } = req.body;

    const audioFile = await prisma.audioFile.findFirst({
      where: { id, userId }
    });

    if (!audioFile) {
      return res.status(404).json(ErrorResponses.notFound('Audio file'));
    }

    const updatedAudioFile = await prisma.audioFile.update({
      where: { id },
      data: {
        description: description !== undefined ? description : audioFile.description,
        category: category || audioFile.category
      },
      select: {
        id: true,
        filename: true,
        originalName: true,
        description: true,
        category: true,
        fileSize: true,
        mimeType: true,
        duration: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Audio file updated successfully',
      audioFile: updatedAudioFile
    });
  } catch (error) {
    console.error('Update audio file error:', error);
    res.status(500).json(ErrorResponses.internalServerError());
  }
});

// Delete audio file
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const audioFile = await prisma.audioFile.findFirst({
      where: { id, userId }
    });

    if (!audioFile) {
      return res.status(404).json(ErrorResponses.notFound('Audio file'));
    }

    // Delete file from filesystem
    if (fs.existsSync(audioFile.filePath)) {
      fs.unlinkSync(audioFile.filePath);
    }

    // Delete from database
    await prisma.audioFile.delete({
      where: { id }
    });

    res.json({ message: 'Audio file deleted successfully' });
  } catch (error) {
    console.error('Delete audio file error:', error);
    res.status(500).json(ErrorResponses.internalServerError());
  }
});

// Get audio categories
router.get('/categories/list', (req: Request, res: Response) => {
  res.json({ categories: AUDIO_CATEGORIES });
});

// Direct file serving for audio playback  
router.get('/:id/file', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('File endpoint called for ID:', id);
    
    // Get token from query parameter
    const queryToken = req.query.token as string;
    
    if (!queryToken) {
      return res.status(401).json(ErrorResponses.authenticationRequired());
    }
    
    // Verify token and get user
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(queryToken, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;
    console.log('User ID from token:', userId);

    const audioFile = await prisma.audioFile.findFirst({
      where: { id, userId }
    });

    if (!audioFile) {
      console.log('Audio file not found for ID:', id, 'User ID:', userId);
      return res.status(404).json(ErrorResponses.notFound('Audio file'));
    }

    console.log('Audio file found:', audioFile.filename);
    const filePath = audioFile.filePath;
    
    if (!fs.existsSync(filePath)) {
      console.log('File does not exist at path:', filePath);
      return res.status(404).json(ErrorResponses.notFound('File'));
    }

    const fileSize = fs.statSync(filePath).size;
    console.log('File path:', filePath, 'File size:', fileSize, 'MIME type:', audioFile.mimeType);

    // Serve the file directly with proper headers
    res.setHeader('Content-Type', audioFile.mimeType);
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    console.log('Headers set, starting file stream...');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
    });
    fileStream.on('end', () => {
      console.log('File stream completed');
    });
    fileStream.pipe(res);
    
    console.log('File stream piped to response');
  } catch (error) {
    console.error('Direct file serving error:', error);
    res.status(500).json(ErrorResponses.internalServerError());
  }
});

export default router; 