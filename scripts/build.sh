#!/bin/bash

# ========================================
# SecApp - Build Script
# ========================================
# This script builds all Docker images for SecApp

set -e  # Exit on error

echo "🏗️  Building SecApp Docker images..."
echo ""

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found, using defaults from .env.example"
    echo "   Run: cp .env.example .env"
fi

##echo ""
##echo "🔨 Building database image..."
##docker build -t secapp-db:latest ../database

echo ""
echo "🔨 Building backend image..."
docker build -t secapp-backend:latest ../backend

echo ""
echo "🔨 Building frontend image..."
docker build -t secapp-frontend:latest ../frontend

echo ""
echo "✅ All images built successfully!"
echo ""
echo "Next steps:"
echo "  1. Run './scripts/start.sh' to start all services"
echo "  2. Or run 'docker compose up -d' directly"