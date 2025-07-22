#!/bin/bash

# Database initialization script for ShipTrack
echo "🗄️ Initializing ShipTrack Database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Function to initialize database
init_database() {
    local profile=$1
    local service_name=$2
    
    echo "📦 Starting $profile environment..."
    docker compose --profile $profile up -d $service_name
    
    echo "⏳ Waiting for database to be ready..."
    sleep 10
    
    echo "🔄 Running Prisma migrations..."
    docker compose --profile $profile exec $service_name npx prisma db push
    
    echo "✅ $profile database initialized successfully!"
}

# Check command line argument
if [ "$1" = "dev" ]; then
    echo "🚀 Initializing Development Database..."
    init_database "dev" "shiptrack-app-dev"
elif [ "$1" = "prod" ]; then
    echo "🚀 Initializing Production Database..."
    init_database "prod" "shiptrack-app-prod"
else
    echo "❌ Please specify environment: dev or prod"
    echo "Usage: ./scripts/init-db.sh [dev|prod]"
    exit 1
fi

echo ""
echo "🎉 Database initialization complete!"
echo "🌐 Access your app at:"
if [ "$1" = "dev" ]; then
    echo "   Development: http://localhost:3001"
    echo "   Database: localhost:5433"
else
    echo "   Production: http://localhost:3000"
    echo "   Database: localhost:5432"
fi 