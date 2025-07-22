#!/bin/bash

# Development script for Docker
echo "🚀 Starting ShipTrack Development Environment with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start development environment
echo "📦 Building development container..."
docker compose --profile dev up --build

echo "✅ Development environment started!"
echo "🌐 Access your app at: http://localhost:3001"
echo "📊 Prisma Studio at: http://localhost:5555 (if enabled)"
echo ""
echo "To stop the environment, run: docker-compose down" 