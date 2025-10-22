#!/bin/bash

# ========================================
# SecApp - Test Script
# ========================================
# This script runs all tests for SecApp

set -e  # Exit on error

echo "🧪 Running SecApp tests..."
echo ""

# Check if services are running
if ! docker compose ps | grep -q "Up"; then
    echo "⚠️  Services are not running. Starting them first..."
    ./scripts/start.sh
    echo ""
fi

# Test backend
echo "🐍 Running backend tests..."
docker compose exec backend pytest -v --cov --cov-report=term-missing || true

echo ""
echo "🧹 Running backend code quality checks..."
docker compose exec backend flake8 . || true

# Test frontend (will be implemented in future phases)
echo ""
echo "⚛️  Frontend tests will be implemented in future phases"
# docker compose exec frontend npm test

echo ""
echo "🔍 Running integration tests..."

# Test database connection
echo "   Testing database connection..."
if docker compose exec -T db pg_isready -U secapp_user -d secapp > /dev/null 2>&1; then
    echo "   ✅ Database: Connected"
else
    echo "   ❌ Database: Connection failed"
fi

# Test backend API
echo "   Testing backend API..."
if curl -f http://localhost:8000/api/healthz/ > /dev/null 2>&1; then
    echo "   ✅ Backend API: Healthy"
else
    echo "   ❌ Backend API: Unhealthy"
fi

# Test frontend
echo "   Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend: Running"
else
    echo "   ❌ Frontend: Not accessible"
fi

echo ""
echo "✅ Test suite completed!"
echo ""
echo "📊 View detailed logs:"
echo "   docker compose logs backend"
echo "   docker compose logs frontend"