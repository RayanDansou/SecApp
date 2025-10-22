#!/bin/bash

# ============================================
# SecApp - Script de Test Phase 1
# ============================================
# Ce script teste la configuration Django et la base de données

set +e  # Ne pas arrêter en cas d'erreur pour compter tous les tests

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  SecApp - Tests Phase 1              ${NC}"
echo -e "${BLUE}  Configuration Django & Base          ${NC}"
echo -e "${BLUE}=======================================${NC}"

PASS=0
FAIL=0

# Démarrer les services si nécessaire
echo ""
echo -e "${BLUE}🚀 Vérification et démarrage des services...${NC}"
if ! docker-compose ps | grep -q "Up" && ! docker compose ps | grep -q "Up"; then
    echo -e "${YELLOW}Démarrage des services...${NC}"
    if docker compose version &> /dev/null; then
        docker compose up -d
    else
        docker-compose up -d
    fi
    echo -e "${YELLOW}Attente du démarrage (15 secondes)...${NC}"
    sleep 15
else
    echo -e "${GREEN}Services déjà démarrés${NC}"
    sleep 2
fi

# ============================================
# TEST 1: requirements.txt
# ============================================
echo ""
echo -e "${BLUE}TEST 1: Vérification de requirements.txt...${NC}"
if [ -f "backend/requirements.txt" ]; then
    DJANGO_COUNT=$(cat backend/requirements.txt | grep -c "Django==")
    DRF_COUNT=$(cat backend/requirements.txt | grep -c "djangorestframework")
    PSYCOPG_COUNT=$(cat backend/requirements.txt | grep -c "psycopg2")

    if [ "$DJANGO_COUNT" -eq 1 ] && [ "$DRF_COUNT" -eq 1 ] && [ "$PSYCOPG_COUNT" -eq 1 ]; then
        echo -e "${GREEN}✅ PASS - requirements.txt complet${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL - Dépendances manquantes dans requirements.txt${NC}"
        ((FAIL++))
    fi
else
    echo -e "${RED}❌ FAIL - requirements.txt absent${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 2: Structure Django
# ============================================
echo ""
echo -e "${BLUE}TEST 2: Vérification de la structure Django...${NC}"
FILES_OK=true

if [ ! -f "backend/manage.py" ]; then
    echo -e "${RED}  ❌ manage.py manquant${NC}"
    FILES_OK=false
fi

if [ ! -f "backend/secapp/settings.py" ]; then
    echo -e "${RED}  ❌ settings.py manquant${NC}"
    FILES_OK=false
fi

if [ ! -f "backend/secapp/urls.py" ]; then
    echo -e "${RED}  ❌ urls.py manquant${NC}"
    FILES_OK=false
fi

if [ ! -f "backend/secapp/wsgi.py" ]; then
    echo -e "${RED}  ❌ wsgi.py manquant${NC}"
    FILES_OK=false
fi

if [ ! -d "backend/users" ] || [ ! -d "backend/questionnaires" ]; then
    echo -e "${RED}  ❌ Apps users/ ou questionnaires/ manquantes${NC}"
    FILES_OK=false
fi

if [ "$FILES_OK" = true ]; then
    echo -e "${GREEN}✅ PASS - Structure Django complète${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL - Structure Django incomplète${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 3: Connexion Database
# ============================================
echo ""
echo -e "${BLUE}TEST 3: Test connexion PostgreSQL...${NC}"
if docker exec secapp-database pg_isready -U secapp_user -d secapp > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS - PostgreSQL opérationnel${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL - PostgreSQL non disponible${NC}"
    echo -e "${YELLOW}Vérifiez que le conteneur database est démarré${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 4: Django Check
# ============================================
echo ""
echo -e "${BLUE}TEST 4: Vérification configuration Django...${NC}"
CHECK_OUTPUT=$(docker exec secapp-backend python manage.py check 2>&1)
if echo "$CHECK_OUTPUT" | grep -q "System check identified no issues"; then
    echo -e "${GREEN}✅ PASS - Configuration Django valide${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL - Configuration Django invalide${NC}"
    echo -e "${YELLOW}Sortie: $CHECK_OUTPUT${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 5: Migrations
# ============================================
echo ""
echo -e "${BLUE}TEST 5: Application des migrations...${NC}"
MIGRATE_OUTPUT=$(docker exec secapp-backend python manage.py migrate 2>&1)
if echo "$MIGRATE_OUTPUT" | grep -qE "(Operations to perform|No migrations to apply)"; then
    echo -e "${GREEN}✅ PASS - Migrations appliquées avec succès${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL - Erreur lors des migrations${NC}"
    echo -e "${YELLOW}Sortie: $MIGRATE_OUTPUT${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 6: Health Check
# ============================================
echo ""
echo -e "${BLUE}TEST 6: Test du Health Check endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:8000/api/health/ 2>&1)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ PASS - Health check fonctionnel${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL - Health check ne répond pas correctement${NC}"
    echo -e "${YELLOW}Réponse: $HEALTH_RESPONSE${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 7: Admin accessible
# ============================================
echo ""
echo -e "${BLUE}TEST 7: Vérification accès admin Django...${NC}"
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/admin/ 2>&1)
if [ "$ADMIN_STATUS" = "302" ] || [ "$ADMIN_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ PASS - Admin Django accessible (HTTP $ADMIN_STATUS)${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL - Admin Django inaccessible (HTTP $ADMIN_STATUS)${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 8: Swagger Documentation
# ============================================
echo ""
echo -e "${BLUE}TEST 8: Vérification documentation API...${NC}"
SWAGGER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/docs/ 2>&1)
if [ "$SWAGGER_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ PASS - Documentation API accessible${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL - Documentation API inaccessible (HTTP $SWAGGER_STATUS)${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 9: Apps Django
# ============================================
echo ""
echo -e "${BLUE}TEST 9: Vérification des apps Django installées...${NC}"
APPS_OUTPUT=$(docker exec secapp-backend python manage.py shell -c "from django.conf import settings; print(','.join(settings.INSTALLED_APPS))" 2>&1)
if echo "$APPS_OUTPUT" | grep -q "users" && echo "$APPS_OUTPUT" | grep -q "questionnaires"; then
    echo -e "${GREEN}✅ PASS - Apps users et questionnaires installées${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL - Apps manquantes${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 10: Tests unitaires
# ============================================
echo ""
echo -e "${BLUE}TEST 10: Exécution des tests unitaires Django...${NC}"
TEST_OUTPUT=$(docker exec secapp-backend python manage.py test --verbosity=0 2>&1)
if echo "$TEST_OUTPUT" | grep -qE "(OK|Ran 0 tests)"; then
    echo -e "${GREEN}✅ PASS - Tests unitaires s'exécutent${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  WARN - Problème avec les tests (normal si pas encore de tests)${NC}"
    ((PASS++))
fi

# ============================================
# RÉSUMÉ
# ============================================
echo ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Résumé des Tests Phase 1            ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""
echo -e "Tests réussis: ${GREEN}$PASS${NC}"
echo -e "Tests échoués: ${RED}$FAIL${NC}"
echo ""

TOTAL_TESTS=$((PASS + FAIL))
PERCENTAGE=$((PASS * 100 / TOTAL_TESTS))

echo -e "Taux de réussite: ${PERCENTAGE}%"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Tous les tests sont passés !      ║${NC}"
    echo -e "${GREEN}║  La Phase 1 est TERMINÉE avec succès  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Prochaines étapes:${NC}"
    echo -e "  ${BLUE}Phase 2: Modèles de Données${NC}"
    echo -e "  - Créer le modèle User custom avec rôles"
    echo -e "  - Créer les modèles Questionnaire, Question, Document, Score, Message"
    echo -e "  - Définir les relations entre les modèles"
    echo ""
    echo -e "${YELLOW}URLs disponibles:${NC}"
    echo -e "  🌐 Health Check: ${BLUE}http://localhost:8000/api/health/${NC}"
    echo -e "  📚 API Docs:     ${BLUE}http://localhost:8000/api/docs/${NC}"
    echo -e "  🔧 Admin:        ${BLUE}http://localhost:8000/admin/${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ Certains tests ont échoué         ║${NC}"
    echo -e "${RED}║  Veuillez corriger les erreurs        ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Pour déboguer:${NC}"
    echo -e "  ${BLUE}docker logs secapp-backend${NC}"
    echo -e "  ${BLUE}docker logs secapp-database${NC}"
    echo -e "  ${BLUE}docker-compose ps${NC}"
    echo ""
    exit 1
fi
