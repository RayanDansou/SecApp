#!/bin/bash

# ============================================
# SecApp - Script de Build
# ============================================
# Ce script build toutes les images Docker du projet

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  SecApp - Build des images Docker  ${NC}"
echo -e "${BLUE}======================================${NC}"

# Vérification de la présence de Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

# Vérification de la présence de docker-compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

# Vérification du fichier .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé${NC}"
    echo -e "${YELLOW}Copie de .env.example vers .env${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  ATTENTION: Veuillez configurer vos variables d'environnement dans .env${NC}"
fi

echo ""
echo -e "${BLUE}📦 Nettoyage des anciennes images...${NC}"
docker-compose down --remove-orphans || docker compose down --remove-orphans || true

echo ""
echo -e "${BLUE}🔨 Build de l'image Backend (Django)...${NC}"
docker-compose build --no-cache backend || docker compose build --no-cache backend

echo ""
echo -e "${BLUE}🔨 Build de l'image Frontend (Next.js)...${NC}"
docker-compose build --no-cache frontend || docker compose build --no-cache frontend

echo ""
echo -e "${BLUE}🔨 Pull de l'image Database (PostgreSQL)...${NC}"
docker-compose pull database || docker compose pull database

echo ""
echo -e "${GREEN}✅ Build terminé avec succès !${NC}"
echo ""
echo -e "${YELLOW}Pour démarrer l'application, utilisez:${NC}"
echo -e "${YELLOW}  ./start.sh${NC}"
echo ""
