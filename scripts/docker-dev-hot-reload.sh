#!/bin/bash

# Docker Development with Hot Reloading
# This script ensures proper hot reloading in Docker development environment

set -e

echo "🚀 Starting ShipTrack Development Environment with Hot Reloading..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker compose --profile dev down --remove-orphans 2>/dev/null || true

# Clean up any existing volumes that might interfere
echo "🧹 Cleaning up development volumes..."
docker volume rm shiptrack_postgres_dev_data 2>/dev/null || true

# Initialize database
echo "🗄️  Initializing development database..."
./scripts/init-db.sh dev

# Build and start with proper hot reloading
echo "🔨 Building and starting development environment..."
docker compose --profile dev up --build -d

# Wait for the app to be ready
echo "⏳ Waiting for application to start..."
sleep 10

# Check if the app is running
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ ShipTrack is running at http://localhost:3001"
    echo ""
    echo "🎯 Hot Reloading Features:"
    echo "   • File changes will automatically trigger page refresh"
    echo "   • Next.js Fast Refresh is enabled"
    echo "   • Webpack polling is configured for Docker"
    echo ""
    echo "📝 Development Tips:"
    echo "   • Edit files in your local directory - changes will be reflected immediately"
    echo "   • Check the logs: docker compose logs -f shiptrack-app-dev"
    echo "   • Stop the environment: docker compose --profile dev down"
    echo ""
    echo "🔍 View logs:"
    docker compose logs -f shiptrack-app-dev
else
    echo "❌ Application failed to start. Check logs:"
    docker compose logs shiptrack-app-dev
    exit 1
fi 