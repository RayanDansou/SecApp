#!/bin/bash

# ============================================
# SecApp - Script d'Arrêt
# ============================================
# Ce script arrête tous les services de l'application

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}     SecApp - Arrêt Application       ${NC}"
echo -e "${BLUE}======================================${NC}"

echo ""
echo -e "${BLUE}🛑 Arrêt des services Docker...${NC}"

# Arrêt avec docker-compose (essai v2 puis v1)
if docker compose version &> /dev/null; then
    docker compose down
else
    docker-compose down
fi

echo ""
echo -e "${GREEN}✅ Application arrêtée avec succès !${NC}"
echo ""
echo -e "${YELLOW}Pour redémarrer l'application:${NC}"
echo -e "  ${BLUE}./start.sh${NC}"
echo ""
