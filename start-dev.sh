#!/bin/bash

echo "🚀 Starting AudioStack Development Environment with Hot Reload..."

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose down 2>/dev/null
docker-compose -f docker-compose.dev.yml down 2>/dev/null

# Build and start development environment
echo "🔨 Building development containers..."
docker-compose -f docker-compose.dev.yml build

echo "🌟 Starting development environment..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "📊 Checking service status..."
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5001/api"
echo "🗄️  Database: localhost:5432"
echo ""
echo "📝 View logs: npm run docker:dev:logs"
echo "🛑 Stop services: npm run docker:dev:down"
echo ""
echo "✨ Hot reload is enabled! Make changes to your code and see them instantly!" 