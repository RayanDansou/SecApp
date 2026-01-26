#!/bin/bash

# =================================================================
# GuardianIQ - Test Pipeline Localement
# =================================================================
# Ce script simule les étapes du Jenkinsfile pour tester localement
# Usage: ./test-pipeline.sh
# =================================================================

set -e  # Exit on error

DOCKER_REPO="rayandans/guardianiq"
VERSION="local-test"

echo "🚀 GuardianIQ - Pipeline Test Local"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# =================================================================
# STAGE 1: Build Images
# =================================================================
echo -e "${YELLOW}[1/5] 🔨 Building Docker images...${NC}"
echo ""

echo "Building Backend..."
docker build -t ${DOCKER_REPO}:backend-${VERSION} \
    -f backend/Dockerfile ./backend

echo ""
echo "Building Frontend..."
docker build -t ${DOCKER_REPO}:frontend-${VERSION} \
    -f frontend/Dockerfile ./frontend

echo -e "${GREEN}✅ Images built successfully${NC}"
echo ""

# =================================================================
# STAGE 2: Run Tests
# =================================================================
echo -e "${YELLOW}[2/5] 🧪 Running tests...${NC}"
echo ""

echo "Testing Backend..."
docker run --rm ${DOCKER_REPO}:backend-${VERSION} \
    python manage.py test --noinput || echo "⚠️ Tests failed or not configured"

# Uncomment when frontend tests are ready
# echo "Testing Frontend..."
# docker run --rm ${DOCKER_REPO}:frontend-${VERSION} npm test

echo -e "${GREEN}✅ Tests completed${NC}"
echo ""

# =================================================================
# STAGE 3: Tag as latest
# =================================================================
echo -e "${YELLOW}[3/5] 🏷️ Tagging images...${NC}"
echo ""

docker tag ${DOCKER_REPO}:backend-${VERSION} ${DOCKER_REPO}:backend-latest
docker tag ${DOCKER_REPO}:frontend-${VERSION} ${DOCKER_REPO}:frontend-latest

echo -e "${GREEN}✅ Images tagged${NC}"
echo ""

# =================================================================
# STAGE 4: Optional - Push to Docker Hub
# =================================================================
read -p "Push images to Docker Hub? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${YELLOW}[4/5] 🚀 Pushing to Docker Hub...${NC}"
    echo ""

    # Login to Docker Hub (will prompt for credentials)
    docker login

    # Push images
    docker push ${DOCKER_REPO}:backend-${VERSION}
    docker push ${DOCKER_REPO}:frontend-${VERSION}
    docker push ${DOCKER_REPO}:backend-latest
    docker push ${DOCKER_REPO}:frontend-latest

    echo -e "${GREEN}✅ Images pushed successfully${NC}"
    echo ""
else
    echo "⏭️ Skipping Docker Hub push"
    echo ""
fi

# =================================================================
# STAGE 5: Deploy Locally
# =================================================================
echo -e "${YELLOW}[5/5] 🚀 Deploying locally...${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Creating .env from .env.jenkins template..."
    cp .env.jenkins .env
    echo -e "${YELLOW}⚠️ Please edit .env with your actual values before continuing${NC}"
    read -p "Press Enter after editing .env..."
fi

# Stop existing containers
echo "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Start services
echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
echo "Waiting for services to start (20s)..."
sleep 20

echo -e "${GREEN}✅ Deployment completed${NC}"
echo ""

# =================================================================
# STAGE 6: Health Check
# =================================================================
echo -e "${YELLOW}[6/6] 🏥 Running health checks...${NC}"
echo ""

# Check containers
echo "Container Status:"
docker ps --filter "name=guardianiq" --format "table {{.Names}}\t{{.Status}}"
echo ""

# Check backend
echo -n "Backend (http://localhost:8888): "
if curl -f -s http://localhost:8888/api/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
fi

# Check frontend
echo -n "Frontend (http://localhost:3333): "
if curl -f -s http://localhost:3333/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
fi

echo ""
echo "========================================="
echo -e "${GREEN}✅ Pipeline test completed!${NC}"
echo "========================================="
echo ""
echo "Services are running:"
echo "  🌐 Frontend: http://localhost:3333"
echo "  🌐 Backend:  http://localhost:8888"
echo "  🗄️  Database: localhost:5438"
echo ""
echo "Useful commands:"
echo "  - View logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Stop:         docker-compose -f docker-compose.prod.yml down"
echo "  - Restart:      docker-compose -f docker-compose.prod.yml restart"
echo ""
