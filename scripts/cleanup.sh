#!/bin/bash

# Cleanup script for ShipTrack
echo "🧹 Cleaning up ShipTrack project..."

# Remove SQLite database files (if any exist)
echo "🗑️ Removing SQLite database files..."
find . -name "*.db" -type f -delete
find . -name "*.sqlite" -type f -delete
find . -name "*.sqlite3" -type f -delete

# Remove Docker volumes (optional)
if [ "$1" = "--docker" ]; then
    echo "🐳 Removing Docker volumes..."
    docker compose --profile dev down -v 2>/dev/null || true
    docker compose --profile prod down -v 2>/dev/null || true
    docker volume prune -f 2>/dev/null || true
fi

# Remove node_modules (optional)
if [ "$1" = "--all" ]; then
    echo "📦 Removing node_modules..."
    rm -rf node_modules
    rm -f package-lock.json
fi

# Remove Next.js build files
echo "🏗️ Removing build files..."
rm -rf .next
rm -rf out

# Remove environment files (optional)
if [ "$1" = "--env" ]; then
    echo "🔐 Removing environment files..."
    rm -f .env
    rm -f .env.local
    rm -f .env.development.local
    rm -f .env.test.local
    rm -f .env.production.local
fi

echo "✅ Cleanup complete!"
echo ""
echo "Usage:"
echo "  ./scripts/cleanup.sh          # Basic cleanup"
echo "  ./scripts/cleanup.sh --docker # Include Docker volumes"
echo "  ./scripts/cleanup.sh --all    # Include node_modules"
echo "  ./scripts/cleanup.sh --env    # Include environment files" 