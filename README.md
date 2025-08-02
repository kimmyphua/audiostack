# 🎵 AudioStack

A full-stack audio file hosting web application built with React, Node.js, and TypeScript. Upload, manage, and stream your audio files with a modern, responsive interface.

## 🌐 Live Demo

**🎯 [Try AudioStack Live](https://audiostack-mu.vercel.app/)**

- **Demo Credentials**: `admin` / `admin123`
- **Features**: Upload, play, and manage audio files
- **Backend**: Deployed on Railway
- **Frontend**: Deployed on Vercel

## ✨ Features

- 🎵 **Audio File Upload** - Support for multiple audio formats (MP3, WAV, OGG, MP4, AAC, FLAC, WebM)
- 📁 **File Management** - Organize files with categories and descriptions
- 🎧 **Audio Player** - Built-in player with playback controls
- 🔐 **User Authentication** - JWT-based authentication system
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔍 **Search & Filter** - Find files by category or search terms
- 🗄️ **Database Storage** - PostgreSQL with Prisma ORM
- 🐳 **Docker Support** - Easy deployment with Docker Compose

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Query** - Data fetching and caching
- **Lucide React** - Icon library
- **Sass** - CSS preprocessing
- **React Hot Toast** - Notifications

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **Morgan** - HTTP request logging
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nodemon** - Development auto-restart

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git

### Option 1: Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd audiostack
   ```

2. **Start development environment**

   ```bash
   # Using the convenience script (recommended)
   npm run start-dev

   # Or manually (requires build step)
   docker-compose -f docker-compose.dev.yml build
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001/api
   - Database: localhost:5433

### Option 2: Local Development

1. **Install dependencies**

   ```bash
   npm run install:all
   ```

2. **Set up environment variables**

   ```bash
   # Backend (.env)
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Set up database**

   ```bash
   # Database is automatically set up when using Docker
   # No manual setup required!

   # If running locally (without Docker):
   cd backend
   npm run db:generate
   npm run db:migrate
   ```

4. **Start development servers**

   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start individually
   npm run dev:frontend  # Frontend on port 3000
   npm run dev:backend   # Backend on port 5001
   ```

## 📋 Available Scripts

### Root Level

```bash
npm run dev                    # Start both frontend and backend
npm run dev:frontend          # Start frontend only
npm run dev:backend           # Start backend only
npm run build                 # Build both frontend and backend
npm run install:all           # Install all dependencies
npm run start-dev             # Start Docker development environment
npm run format                # Format code with Prettier
npm run format:check          # Check code formatting
```

### Docker Commands

```bash
npm run docker:dev            # Start development containers
npm run docker:dev:down       # Stop development containers
npm run docker:dev:logs       # View container logs
npm run docker:build          # Build production containers
npm run docker:up             # Start production containers
npm run docker:down           # Stop production containers
```

### Backend Commands

```bash
cd backend
npm run dev                   # Start development server
npm run build                 # Build TypeScript
npm run start                 # Start production server
npm run db:migrate            # Run database migrations (local only)
npm run db:generate           # Generate Prisma client (local only)
npm run db:studio             # Open Prisma Studio (local only)
```

### Frontend Commands

```bash
cd frontend
npm run dev                   # Start development server
npm run build                 # Build for production
npm run preview               # Preview production build
npm run lint                  # Run ESLint
```

## 🗄️ Database Setup

The application uses PostgreSQL with Prisma ORM. The database is automatically set up when using Docker.

### Manual Database Setup

1. Install PostgreSQL
2. Create a database named `audiostack`
3. Update `backend/.env` with your database credentials
4. Run migrations:
   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   ```

## 📁 Project Structure

```
audiostack/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # API and utilities
│   │   ├── styles/         # Global styles
│   │   └── types/          # TypeScript types
│   └── package.json
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Server entry point
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── docker-compose.dev.yml   # Development Docker setup
├── start-dev.sh            # Development startup script
└── package.json            # Root package.json
```

## 🎵 Audio Features

- **Supported Formats**: MP3, WAV, OGG, MP4, AAC, FLAC, WebM
- **File Size Limit**: 25MB per file
- **Categories**: Music, Podcast, Audiobook, Sound Effect, Voice Recording, Interview, Lecture, Other
- **Streaming**: Direct file streaming for playback
- **Metadata**: File descriptions, categories, and timestamps

## 🐳 Docker Deployment

### Development

```bash
npm run start-dev
```

### Production

```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

**AudioStack** - Your personal audio library, simplified! 🎵✨
