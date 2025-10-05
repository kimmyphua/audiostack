import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
  socket: {
    tls: process.env.REDIS_TLS_ENABLED === 'true',
    rejectUnauthorized: false,
  },
});

// Connect to Redis
redis.connect().catch(console.error);

// Handle Redis connection events
redis.on('error', err => {
  console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('ready', () => {
  console.log('✅ Redis ready for operations');
});

// Token management functions
export const generateRefreshToken = async (
  userId: string,
  tokenVersion: number
) => {
  const tokenId = crypto.randomUUID();
  const payload = {
    userId,
    tokenVersion,
    tokenId,
    iat: Math.floor(Date.now() / 1000),
  };

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: '7d',
  });

  // Store token ID in Redis with same expiration
  await redis.setEx(
    `refresh:${tokenId}`,
    7 * 24 * 60 * 60, // 7 days
    JSON.stringify({ userId, tokenVersion })
  );

  return { refreshToken, tokenId };
};

export const validateRefreshToken = async (tokenId: string) => {
  const storedData = await redis.get(`refresh:${tokenId}`);
  if (!storedData) {
    return null;
  }

  try {
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Error parsing stored token data:', error);
    return null;
  }
};

export const removeRefreshToken = async (tokenId: string) => {
  await redis.del(`refresh:${tokenId}`);
};

export const clearUserRefreshTokens = async (userId: string) => {
  const keys = await redis.keys('refresh:*');
  let clearedCount = 0;
  console.log('Keys', keys);
  for (const key of keys) {
    try {
      const storedData = await redis.get(key);
      if (storedData) {
        const { userId: storedUserId } = JSON.parse(storedData);
        if (storedUserId === userId) {
          await redis.del(key);
          clearedCount++;
        }
      }
    } catch (error) {
      console.error('Error clearing user refresh token:', error);
    }
  }

  return clearedCount;
};

export const handlePotentialReuse = async (userId: string) => {
  console.warn(`Potential refresh token reuse detected for user: ${userId}`);

  // Clear all refresh tokens for this user from Redis
  const clearedCount = await clearUserRefreshTokens(userId);
  console.log(`Cleared ${clearedCount} tokens for user ${userId}`);

  // Note: tokenVersion increment should be handled by the calling function
  // since it requires database access
};

// Access token management functions
export const storeAccessToken = async (
  userId: string,
  tokenId: string,
  tokenVersion: number
) => {
  const key = `access:${tokenId}`;
  await redis.setEx(
    key,
    5 * 60, // 5 minutes (matching JWT expiration)
    JSON.stringify({ userId, tokenVersion })
  );
};

export const validateAccessToken = async (tokenId: string) => {
  const storedData = await redis.get(`access:${tokenId}`);
  if (!storedData) {
    return null;
  }

  try {
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Error parsing stored access token data:', error);
    return null;
  }
};

export const removeAccessToken = async (tokenId: string) => {
  await redis.del(`access:${tokenId}`);
};

export const clearUserAccessTokens = async (userId: string) => {
  const keys = await redis.keys('access:*');
  let clearedCount = 0;

  for (const key of keys) {
    try {
      const storedData = await redis.get(key);
      if (storedData) {
        const { userId: storedUserId } = JSON.parse(storedData);
        if (storedUserId === userId) {
          await redis.del(key);
          clearedCount++;
        }
      }
    } catch (error) {
      console.error('Error clearing user access token:', error);
    }
  }

  return clearedCount;
};

// Enhanced token management functions
export const generateAccessToken = async (
  userId: string,
  username: string,
  tokenVersion: number
) => {
  const tokenId = crypto.randomUUID();
  const payload = {
    userId,
    username,
    tokenId,
    tokenVersion,
    iat: Math.floor(Date.now() / 1000),
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '5m',
  });

  // Store token ID in Redis for immediate invalidation
  await storeAccessToken(userId, tokenId, tokenVersion);

  return { accessToken, tokenId };
};

// Metrics tracking
export const trackTokenUsage = async (
  userId: string,
  action: 'login' | 'refresh' | 'logout'
) => {
  const key = `metrics:${userId}:${action}`;
  await redis.incr(key);
  await redis.expire(key, 24 * 60 * 60); // 24 hours
};

export const getUsageStats = async (userId: string) => {
  const loginCount = (await redis.get(`metrics:${userId}:login`)) || '0';
  const refreshCount = (await redis.get(`metrics:${userId}:refresh`)) || '0';
  const logoutCount = (await redis.get(`metrics:${userId}:logout`)) || '0';

  return {
    loginCount: parseInt(loginCount),
    refreshCount: parseInt(refreshCount),
    logoutCount: parseInt(logoutCount),
  };
};

export default redis;
