import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Response, Router } from 'express';
import { body } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ErrorResponses, handleValidationErrors } from '../utils/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get all users (admin only)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            audioFiles: true,
          },
        },
      },
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json(ErrorResponses.internalServerError());
  }
});

// Get user by ID
router.get(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (id !== userId) {
        return res.status(403).json(ErrorResponses.accessDenied());
      }

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              audioFiles: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json(ErrorResponses.userNotFoundById());
      }

      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json(ErrorResponses.internalServerError());
    }
  }
);

// Update user
router.put(
  '/:id',
  [
    authenticateToken,
    body('username')
      .optional()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      // Handle validation errors
      if (handleValidationErrors(req, res)) {
        return;
      }

      const { id } = req.params;
      const userId = req.user?.id;
      const { username, email, password } = req.body;

      // Users can only update their own profile
      if (id !== userId) {
        return res.status(403).json(ErrorResponses.accessDenied());
      }

      // Check if username or email already exists
      if (username || email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(username ? [{ username }] : []),
              ...(email ? [{ email }] : []),
            ],
            NOT: { id },
          },
        });

        if (existingUser) {
          return res.status(400).json(ErrorResponses.usernameOrEmailExists());
        }
      }

      // Prepare update data
      const updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({ message: 'User updated successfully', user });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json(ErrorResponses.internalServerError());
    }
  }
);

// Delete user and all their audio files
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (id !== userId) {
        return res.status(403).json(ErrorResponses.accessDenied());
      }

      await prisma.user.delete({
        where: { id },
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json(ErrorResponses.internalServerError());
    }
  }
);

export default router;
