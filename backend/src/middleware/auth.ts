import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { removeAccessToken, validateAccessToken } from '../utils/redis';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log(`🔐 Authenticating request to: ${req.method} ${req.path}`);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { userId, tokenId, tokenVersion } = decoded;

    // Validate token against Redis (immediate invalidation check)
    const storedData = await validateAccessToken(tokenId);
    if (!storedData) {
      console.log(
        '❌ Access token not found in Redis - possible reuse or expired'
      );
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { userId: storedUserId, tokenVersion: storedVersion } = storedData;

    // Check if token version matches (prevents use of old tokens after login)
    if (storedUserId !== userId || storedVersion !== tokenVersion) {
      console.log('Token version mismatch - possible concurrent login');
      await removeAccessToken(tokenId);
      return res.status(401).json({ error: 'Token invalidated by new login' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, tokenVersion: true },
    });

    if (!user) {
      await removeAccessToken(tokenId);
      return res.status(401).json({ error: 'User not found' });
    }

    // Final check: ensure token version matches current user token version
    if (user.tokenVersion !== tokenVersion) {
      console.log('User token version mismatch - token invalidated');
      await removeAccessToken(tokenId);
      return res.status(401).json({ error: 'Token invalidated by new login' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };
    console.log('✅ Authentication successful for user:', user.username);
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
