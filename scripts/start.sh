#!/bin/bash

# ========================================
# SecApp - Start Script
# ========================================
# This script starts all SecApp services

set -e  # Exit on error

echo "🚀 Starting SecApp services..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "   Creating .env from .env.example..."
    cp .env.example .env
    echo "   ⚠️  Please update .env with your configuration!"
    echo ""
fi

# Start services
echo "🐳 Starting Docker Compose services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5


# Wait for db to be ready

echo "   Checking database health..."

for i in {1..30}; do
    if nc -z localhost 5438; then
        echo "   ✅ Database is healthy!"
        break
    fi

    if [ $i -eq 30 ]; then
        echo "   ❌ Database failed to start"
        docker compose logs db
        exit 1
    fi
    sleep 2
done


# Wait for frontend to be ready
echo "   Checking backend health..."
for i in {1..30}; do
    if curl -s -o /dev/null http://localhost:8888; then
        echo "   ✅ Backend is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ❌ Backend failed to start"
        docker compose logs backend
        exit 1
    fi
    sleep 2
done

# Wait for frontend to be ready
echo "   Checking frontend health..."
for i in {1..30}; do
    if curl -f http://localhost:3333 > /dev/null 2>&1; then
        echo "   ✅ Frontend is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ❌ Frontend failed to start"
        docker compose logs frontend
        exit 1
    fi
    sleep 2
done

echo ""
echo "✅ SecApp is running!"
echo ""
echo "📍 Services:"
echo "   Frontend:  http://localhost:3333"
echo "   Backend:   http://localhost:8888"
echo "   API Docs:  http://localhost:8888/admin/"
echo "   Database:  localhost:5438"
echo ""
echo "📊 Useful commands:"
echo "   View logs:     docker compose logs -f"
echo "   Stop services: docker compose down"
echo "   Restart:       docker compose restart"
echo "   Run tests:     ./scripts/test.sh"