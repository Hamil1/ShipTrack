#!/bin/bash

# Database initialization script for ShipTrack
echo "🗄️ Initializing ShipTrack Database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "📦 Starting development environment..."
docker compose up -d shiptrack-db

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🔄 Running Prisma migrations..."
docker compose exec shiptrack-app npx prisma db push

echo "✅ Database initialized successfully!"

echo ""
echo "🎉 Database initialization complete!"
echo "🌐 Access your app at:"
echo "   Development: http://localhost:3001"
echo "   Database: localhost:5433" 