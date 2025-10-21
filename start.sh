#!/bin/bash

# ============================================
# SecApp - Script de Démarrage
# ============================================
# Ce script démarre tous les services de l'application

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}   SecApp - Démarrage Application    ${NC}"
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
    echo -e "${YELLOW}Éditez le fichier .env avant de continuer${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Démarrage des services Docker...${NC}"

# Démarrage avec docker-compose (essai v2 puis v1)
if docker compose version &> /dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi

echo ""
echo -e "${BLUE}⏳ Attente du démarrage des services...${NC}"
sleep 5

echo ""
echo -e "${BLUE}📊 État des services:${NC}"
if docker compose version &> /dev/null; then
    docker compose ps
else
    docker-compose ps
fi

echo ""
echo -e "${GREEN}✅ Application démarrée avec succès !${NC}"
echo ""
echo -e "${YELLOW}Services disponibles:${NC}"
echo -e "  🌐 Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "  🔧 Backend:  ${BLUE}http://localhost:8000${NC}"
echo -e "  🗄️  Database: ${BLUE}localhost:5432${NC}"
echo ""
echo -e "${YELLOW}Commandes utiles:${NC}"
echo -e "  📋 Voir les logs:        ${BLUE}docker-compose logs -f${NC}"
echo -e "  🛑 Arrêter les services: ${BLUE}docker-compose down${NC}"
echo -e "  🔄 Redémarrer:           ${BLUE}docker-compose restart${NC}"
echo -e "  🧪 Lancer les tests:     ${BLUE}./test.sh${NC}"
echo ""
