import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL || process.env.RAILWAY_REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
  socket: {
    tls: process.env.REDIS_TLS_ENABLED === 'true',
    rejectUnauthorized: false,
  },
});

// Connect to Redis
redis.connect().catch((error) => {
  console.error('Failed to connect to Redis:', error);
  // Don't exit the process, let the app continue without Redis
  // The health check will report Redis as disconnected
});

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
  try {
    await redis.setEx(
      `refresh:${tokenId}`,
      7 * 24 * 60 * 60, // 7 days
      JSON.stringify({ userId, tokenVersion })
    );
  } catch (error) {
    console.warn('Failed to store refresh token in Redis:', error);
    // Continue without Redis - the token will still work, just can't be invalidated
  }

  return { refreshToken, tokenId };
};

export const validateRefreshToken = async (tokenId: string) => {
  try {
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
  } catch (error) {
    console.warn('Failed to validate refresh token in Redis:', error);
    // Return null to force re-authentication when Redis is down
    return null;
  }
};

export const removeRefreshToken = async (tokenId: string) => {
  try {
    await redis.del(`refresh:${tokenId}`);
  } catch (error) {
    console.warn('Failed to remove refresh token from Redis:', error);
  }
};

export const clearUserRefreshTokens = async (userId: string) => {
  try {
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
  } catch (error) {
    console.warn('Failed to clear user refresh tokens from Redis:', error);
    return 0;
  }
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
  try {
    const key = `access:${tokenId}`;
    await redis.setEx(
      key,
      5 * 60, // 5 minutes (matching JWT expiration)
      JSON.stringify({ userId, tokenVersion })
    );
  } catch (error) {
    console.warn('Failed to store access token in Redis:', error);
    throw error; // Re-throw to be handled by caller
  }
};

export const validateAccessToken = async (tokenId: string) => {
  try {
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
  } catch (error) {
    console.warn('Failed to validate access token in Redis:', error);
    // Return null to force re-authentication when Redis is down
    return null;
  }
};

export const removeAccessToken = async (tokenId: string) => {
  try {
    await redis.del(`access:${tokenId}`);
  } catch (error) {
    console.warn('Failed to remove access token from Redis:', error);
  }
};

export const clearUserAccessTokens = async (userId: string) => {
  try {
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
  } catch (error) {
    console.warn('Failed to clear user access tokens from Redis:', error);
    return 0;
  }
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
  try {
    await storeAccessToken(userId, tokenId, tokenVersion);
  } catch (error) {
    console.warn('Failed to store access token in Redis:', error);
    // Continue without Redis - the token will still work, just can't be invalidated
  }

  return { accessToken, tokenId };
};

// Metrics tracking
export const trackTokenUsage = async (
  userId: string,
  action: 'login' | 'refresh' | 'logout'
) => {
  try {
    const key = `metrics:${userId}:${action}`;
    await redis.incr(key);
    await redis.expire(key, 24 * 60 * 60); // 24 hours
  } catch (error) {
    console.warn('Failed to track token usage in Redis:', error);
  }
};

export const getUsageStats = async (userId: string) => {
  try {
    const loginCount = (await redis.get(`metrics:${userId}:login`)) || '0';
    const refreshCount = (await redis.get(`metrics:${userId}:refresh`)) || '0';
    const logoutCount = (await redis.get(`metrics:${userId}:logout`)) || '0';

    return {
      loginCount: parseInt(loginCount),
      refreshCount: parseInt(refreshCount),
      logoutCount: parseInt(logoutCount),
    };
  } catch (error) {
    console.warn('Failed to get usage stats from Redis:', error);
    return {
      loginCount: 0,
      refreshCount: 0,
      logoutCount: 0,
    };
  }
};

export default redis;
