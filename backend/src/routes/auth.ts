import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { ErrorResponses, handleValidationErrors } from '../utils/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Login route
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      console.log('Login attempt:', {
        username: req.body.username,
        timestamp: new Date().toISOString(),
      });

      if (handleValidationErrors(req, res)) {
        return;
      }

      const { username, password } = req.body;

      // Find user by username or email
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email: username }],
        },
      });

      if (!user) {
        console.log(
          'Login failed: User not found for username/email:',
          username
        );
        return res.status(401).json(ErrorResponses.invalidCredentials());
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log('Login failed: Invalid password for user:', user.username);
        return res.status(401).json(ErrorResponses.invalidCredentials());
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      const responseData = {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };

      console.log('Login successful for user:', user.username);
      res.json(responseData);
    } catch (error) {
      console.error('Login error:', error);
      res
        .status(500)
        .json(
          ErrorResponses.internalServerError(
            'An unexpected error occurred during login'
          )
        );
    }
  }
);

// Register route
router.post(
  '/register',
  [
    body('username')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        'Username can only contain letters, numbers, and underscores'
      ),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
  ],
  async (req: Request, res: Response) => {
    try {
      console.log('Registration attempt:', {
        username: req.body.username,
        email: req.body.email,
        timestamp: new Date().toISOString(),
      });

      // Handle validation errors
      if (handleValidationErrors(req, res)) {
        return;
      }

      const { username, password, email } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (existingUser) {
        const conflictField =
          existingUser.username === username ? 'username' : 'email';
        console.log(
          'Registration failed: User already exists with',
          conflictField,
          existingUser[conflictField]
        );
        return res
          .status(400)
          .json(ErrorResponses.userAlreadyExists(conflictField));
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          email,
        },
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      console.log('Registration successful for user:', user.username);
      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res
        .status(500)
        .json(
          ErrorResponses.internalServerError(
            'An unexpected error occurred during registration'
          )
        );
    }
  }
);

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('Get user failed: No token provided');
      return res.status(401).json(ErrorResponses.authenticationRequired());
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch (jwtError) {
      console.log('Get user failed: Invalid token');
      return res.status(401).json(ErrorResponses.invalidToken());
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    if (!user) {
      console.log('Get user failed: User not found for token');
      return res.status(401).json(ErrorResponses.userNotFound());
    }

    console.log('Get user successful for:', user.username);
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res
      .status(500)
      .json(
        ErrorResponses.internalServerError(
          'An unexpected error occurred while fetching user data'
        )
      );
  }
});

export default router;
