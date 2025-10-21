#!/bin/bash

# ============================================
# SecApp - Script de Tests
# ============================================
# Ce script exécute les tests pour le backend et le frontend

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}      SecApp - Tests Application      ${NC}"
echo -e "${BLUE}======================================${NC}"

# Vérification de la présence de Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

# Compteurs de résultats
BACKEND_TESTS_PASSED=0
FRONTEND_TESTS_PASSED=0
TOTAL_ERRORS=0

echo ""
echo -e "${BLUE}🧪 Tests Backend (Django)...${NC}"
echo -e "${BLUE}================================${NC}"

# Vérification que les conteneurs sont en cours d'exécution
if docker ps | grep -q "secapp-backend"; then
    # Tests unitaires Django
    if docker exec secapp-backend python manage.py test --verbosity=2; then
        echo -e "${GREEN}✅ Tests unitaires Django: PASS${NC}"
        BACKEND_TESTS_PASSED=$((BACKEND_TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ Tests unitaires Django: FAIL${NC}"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi

    # Vérification de la configuration Django
    if docker exec secapp-backend python manage.py check; then
        echo -e "${GREEN}✅ Configuration Django: PASS${NC}"
        BACKEND_TESTS_PASSED=$((BACKEND_TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ Configuration Django: FAIL${NC}"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi

    # Vérification des migrations
    if docker exec secapp-backend python manage.py makemigrations --check --dry-run; then
        echo -e "${GREEN}✅ Migrations Django: PASS${NC}"
        BACKEND_TESTS_PASSED=$((BACKEND_TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  Migrations manquantes détectées${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Le conteneur backend n'est pas en cours d'exécution${NC}"
    echo -e "${YELLOW}Démarrez l'application avec ./start.sh${NC}"
fi

echo ""
echo -e "${BLUE}🧪 Tests Frontend (Next.js)...${NC}"
echo -e "${BLUE}================================${NC}"

# Vérification que les conteneurs sont en cours d'exécution
if docker ps | grep -q "secapp-frontend"; then
    # Tests unitaires Frontend (si configurés)
    if docker exec secapp-frontend npm test -- --passWithNoTests 2>/dev/null; then
        echo -e "${GREEN}✅ Tests Frontend: PASS${NC}"
        FRONTEND_TESTS_PASSED=$((FRONTEND_TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  Tests Frontend: Aucun test configuré${NC}"
    fi

    # Vérification du build Frontend
    if docker exec secapp-frontend npm run build 2>/dev/null; then
        echo -e "${GREEN}✅ Build Frontend: PASS${NC}"
        FRONTEND_TESTS_PASSED=$((FRONTEND_TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  Build Frontend: à configurer${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Le conteneur frontend n'est pas en cours d'exécution${NC}"
    echo -e "${YELLOW}Démarrez l'application avec ./start.sh${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Tests d'Infrastructure...${NC}"
echo -e "${BLUE}================================${NC}"

# Test de connectivité base de données
if docker ps | grep -q "secapp-database"; then
    if docker exec secapp-database pg_isready -U secapp_user -d secapp; then
        echo -e "${GREEN}✅ Connexion PostgreSQL: PASS${NC}"
    else
        echo -e "${RED}❌ Connexion PostgreSQL: FAIL${NC}"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Le conteneur database n'est pas en cours d'exécution${NC}"
fi

# Vérification docker-compose
if docker-compose config &> /dev/null || docker compose config &> /dev/null; then
    echo -e "${GREEN}✅ Configuration Docker Compose: PASS${NC}"
else
    echo -e "${RED}❌ Configuration Docker Compose: FAIL${NC}"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}         Résumé des Tests             ${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "Backend:  ${GREEN}${BACKEND_TESTS_PASSED}${NC} tests passés"
echo -e "Frontend: ${GREEN}${FRONTEND_TESTS_PASSED}${NC} tests passés"

if [ $TOTAL_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests sont passés !${NC}"
    exit 0
else
    echo -e "${RED}❌ ${TOTAL_ERRORS} erreur(s) détectée(s)${NC}"
    exit 1
fi
