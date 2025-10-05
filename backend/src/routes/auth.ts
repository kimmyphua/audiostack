import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ErrorResponses, handleValidationErrors } from '../utils/errorHandler';
import {
  clearUserAccessTokens,
  clearUserRefreshTokens,
  generateAccessToken,
  generateRefreshToken,
  handlePotentialReuse,
  removeRefreshToken,
  trackTokenUsage,
  validateRefreshToken,
} from '../utils/redis';

const router = Router();
const prisma = new PrismaClient();

// Unified cookie configuration
const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

// Helper function to clear refresh token cookie
const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie('refreshToken', { path: '/' });
};

import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 500,
  message: { error: 'Too many login attempts 🤨, try again later!' },
});

// Login route
router.post(
  '/login',
  loginLimiter,
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

      // Invalidate all existing tokens for this user
      await prisma.user.update({
        where: { id: user.id },
        data: { tokenVersion: { increment: 1 } },
      });

      // Clear any existing tokens from Redis
      await clearUserRefreshTokens(user.id);
      await clearUserAccessTokens(user.id);

      // Generate new tokens with tokenId for tracking
      const { accessToken: updatedAccessToken } = await generateAccessToken(
        user.id,
        user.username,
        user.tokenVersion + 1
      );

      const { refreshToken, tokenId: refreshTokenId } =
        await generateRefreshToken(user.id, user.tokenVersion + 1);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, cookieConfig);

      // Track login
      await trackTokenUsage(user.id, 'login');

      const responseData = {
        message: 'Login successful',
        accessToken: updatedAccessToken,
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
          tokenVersion: 1, // Initialize token version
        },
      });

      // Generate tokens with tokenId for tracking
      const { accessToken: updatedAccessToken } = await generateAccessToken(
        user.id,
        user.username,
        user.tokenVersion
      );

      const { refreshToken, tokenId: refreshTokenId } =
        await generateRefreshToken(user.id, user.tokenVersion);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, cookieConfig);

      // Track registration as login
      await trackTokenUsage(user.id, 'login');

      console.log('Registration successful for user:', user.username);
      res.status(201).json({
        message: 'User created successfully',
        accessToken: updatedAccessToken,
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

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  console.log('Refresh token', refreshToken);
  if (!refreshToken) {
    return res.status(401).json(ErrorResponses.authenticationRequired());
  }

  try {
    const decodedCookie = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as any;
    const {
      userId: userIdFromCookie,
      tokenVersion: tokenVersionFromCookie,
      tokenId: tokenIdFromCookie,
    } = decodedCookie;
    console.log('Decoded token', decodedCookie);
    // Check if token exists in Redis
    const storedDataFromRedis = await validateRefreshToken(tokenIdFromCookie);
    console.log('Stored Redis data', storedDataFromRedis);
    if (!storedDataFromRedis) {
      // Token doesn't exist - possible reuse or expired
      await handlePotentialReuse(userIdFromCookie);
      clearRefreshTokenCookie(res);
      return res.status(401).json(ErrorResponses.invalidToken());
    }

    const { userId: storedUserId, tokenVersion: storedVersion } =
      storedDataFromRedis;

    if (
      storedUserId !== userIdFromCookie ||
      storedVersion !== tokenVersionFromCookie
    ) {
      // Token mismatch - potential security issue
      await handlePotentialReuse(userIdFromCookie);
      clearRefreshTokenCookie(res);
      return res.status(401).json(ErrorResponses.invalidToken());
    }

    // Validate user and current token version
    const user = await prisma.user.findUnique({
      where: { id: userIdFromCookie },
      select: { id: true, username: true, email: true, tokenVersion: true },
    });

    if (!user || user.tokenVersion !== tokenVersionFromCookie) {
      // Token version mismatch - token is invalid
      await removeRefreshToken(tokenIdFromCookie);
      clearRefreshTokenCookie(res);
      return res.status(401).json(ErrorResponses.invalidToken());
    }

    // Token is valid - remove from Redis (one-time use)
    await removeRefreshToken(tokenIdFromCookie);

    // Generate new tokens with tokenId for tracking
    const { accessToken: newAccessToken } = await generateAccessToken(
      user.id,
      user.username,
      user.tokenVersion
    );

    const { refreshToken: newRefreshToken, tokenId: newTokenId } =
      await generateRefreshToken(userIdFromCookie, user.tokenVersion);
    console.log('New refresh token generated', newRefreshToken);
    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, cookieConfig);

    // Track refresh
    await trackTokenUsage(userIdFromCookie, 'refresh');

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    clearRefreshTokenCookie(res);
    res.status(401).json(ErrorResponses.invalidToken());
  }
});

// Logout endpoint
router.post('/logout', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      ) as any;
      const { userId, tokenId } = decoded;

      // Remove token from Redis
      await removeRefreshToken(tokenId);

      // Invalidate all refresh tokens for this user
      await prisma.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } },
      });

      // Clear all user's tokens from Redis
      await clearUserRefreshTokens(userId);
      await clearUserAccessTokens(userId);

      // Track logout
      await trackTokenUsage(userId, 'logout');
    } catch (error) {
      // Token is invalid, continue with logout
      console.log('Invalid refresh token during logout:', error);
    }
  }

  // Clear the cookie
  clearRefreshTokenCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// Force logout all sessions (for security incidents)
router.post('/logout-all', async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(ErrorResponses.authenticationRequired());
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    // Invalidate all refresh tokens
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });

    // Clear all user's tokens from Redis
    const clearedRefreshCount = await clearUserRefreshTokens(userId);
    const clearedAccessCount = await clearUserAccessTokens(userId);
    const clearedCount = clearedRefreshCount + clearedAccessCount;

    // Clear the cookie
    clearRefreshTokenCookie(res);

    console.log(
      `Force logout: Cleared ${clearedCount} tokens for user ${userId}`
    );
    res.json({
      message: 'All sessions logged out',
      clearedTokens: clearedCount,
    });
  } catch (error) {
    console.error('Force logout error:', error);
    res.status(401).json(ErrorResponses.invalidToken());
  }
});

// Get current user
router.get(
  '/me',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json(ErrorResponses.authenticationRequired());
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, username: true, email: true, createdAt: true },
      });

      if (!user) {
        console.log('Get user failed: User not found');
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
  }
);

// Debug endpoint to check cookies
router.get('/debug-cookies', async (req: Request, res: Response) => {
  const allCookies = req.headers.cookie;
  const refreshToken = req.cookies.refreshToken;

  console.log('All cookies:', allCookies);
  console.log(
    'Refresh token from cookies:',
    refreshToken ? 'Present' : 'Not found'
  );

  res.json({
    allCookies,
    refreshTokenPresent: !!refreshToken,
    refreshTokenLength: refreshToken ? refreshToken.length : 0,
    message: 'Check server console for detailed cookie info',
  });
});

// Debug endpoint to check token status
router.get(
  '/debug-token',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.decode(token) as any;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = decoded.exp - now;

        res.json({
          tokenValid: true,
          timeUntilExpiry: `${Math.floor(timeUntilExpiry / 60)}m ${timeUntilExpiry % 60}s`,
          tokenVersion: decoded.tokenVersion,
          userId: decoded.userId,
          issuedAt: new Date(decoded.iat * 1000).toISOString(),
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
        });
      } catch (error) {
        res.json({
          tokenValid: false,
          error: 'Token decode failed',
        });
      }
    } else {
      res.json({
        tokenValid: false,
        error: 'No token provided',
      });
    }
  }
);

export default router;
