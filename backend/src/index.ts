import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

// routes
import { authenticateToken } from './middleware/auth';
import audioRoutes from './routes/audio';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

// Load environment variables
dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting behind Railway proxy
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());

// CORS configuration - must come before rate limiting
app.use(
  cors({
    origin: [
      // Development
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      // Production
      'https://audiostack-mu.vercel.app',
      // All Vercel preview URLs
      /^https:\/\/audiostack-.*-kimberlys-projects-.*\.vercel\.app$/,
      // Environment variable (if set)
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(limiter);
app.use(morgan('combined'));

// Handle preflight requests
app.options('*', cors());

// Cookie parser middleware
app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve audio files with authentication
app.use(
  '/audio-files',
  authenticateToken,
  express.static(path.join(__dirname, '../uploads'))
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audio', audioRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Something went wrong!',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Internal server error',
    });
  }
);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully!');

    // Create default admin user if it doesn't exist
    const defaultAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { username: process.env.DEFAULT_ADMIN_USERNAME || 'admin' },
          { email: 'admin@audiostack.com' },
        ],
      },
    });

    if (!defaultAdmin) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(
        process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
        12
      );

      await prisma.user.create({
        data: {
          username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
          password: hashedPassword,
          email: 'admin@audiostack.com',
          tokenVersion: 1,
        },
      });
      console.log('✅ Default admin user created');
    } else {
      console.log('✅ Default admin user already exists');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});
