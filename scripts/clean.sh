#!/bin/bash

# ========================================
# SecApp - Clean Script
# ========================================
# This script removes all Docker resources

set -e  # Exit on error

echo "🧹 Cleaning SecApp Docker resources..."
echo ""

read -p "This will remove all containers, volumes, and images. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

echo "🛑 Stopping all services..."
docker compose down

echo "🗑️  Removing volumes..."
docker compose down -v

echo "🗑️  Removing images..."
docker rmi secapp-backend:latest secapp-frontend:latest secapp-db:latest 2>/dev/null || true

echo "🗑️  Removing dangling images..."
docker image prune -f

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "To rebuild and start:"
echo "   ./scripts/build.sh"
echo "   ./scripts/start.sh"