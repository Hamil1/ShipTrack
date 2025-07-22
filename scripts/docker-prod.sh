#!/bin/bash

# Production script for Docker
echo "🚀 Starting ShipTrack Production Environment with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start production environment
echo "📦 Building production container..."
docker compose --profile prod up --build

echo "✅ Production environment started!"
echo "🌐 Access your app at: http://localhost:3000"
echo ""
echo "To stop the environment, run: docker-compose down" 