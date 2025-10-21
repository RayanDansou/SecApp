#!/bin/bash

# ============================================
# SecApp - Script de Test Phase 0
# ============================================
# Ce script teste la configuration initiale de l'environnement

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  SecApp - Tests Phase 0              ${NC}"
echo -e "${BLUE}  Configuration Initiale              ${NC}"
echo -e "${BLUE}=======================================${NC}"

PASS=0
FAIL=0

# ============================================
# TEST 1: Arborescence
# ============================================
echo ""
echo -e "${BLUE}TEST 1: Vérification de l'arborescence...${NC}"
if [ -d "backend" ] && [ -d "frontend" ] && [ -d "database" ] && \
   [ -d "backend/secapp" ] && [ -d "backend/questionnaires" ] && [ -d "backend/users" ] && \
   [ -d "frontend/pages" ] && [ -d "frontend/components" ] && [ -d "frontend/services" ] && [ -d "frontend/styles" ]; then
    echo -e "${GREEN}✅ PASS - Arborescence complète${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL - Dossiers manquants${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 2: Dockerfiles
# ============================================
echo ""
echo -e "${BLUE}TEST 2: Vérification des Dockerfiles...${NC}"
if [ -f "backend/Dockerfile" ] && [ -f "frontend/Dockerfile" ]; then
    # Vérifier le contenu du Dockerfile backend
    if grep -q "python:3.11-slim" backend/Dockerfile && grep -q "EXPOSE 8000" backend/Dockerfile; then
        echo -e "${GREEN}✅ PASS - Dockerfile Backend valide${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL - Dockerfile Backend invalide${NC}"
        ((FAIL++))
    fi

    # Vérifier le contenu du Dockerfile frontend
    if grep -q "node:20-alpine" frontend/Dockerfile && grep -q "EXPOSE 3000" frontend/Dockerfile; then
        echo -e "${GREEN}✅ PASS - Dockerfile Frontend valide${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL - Dockerfile Frontend invalide${NC}"
        ((FAIL++))
    fi
else
    echo -e "${RED}❌ FAIL - Dockerfiles manquants${NC}"
    ((FAIL+=2))
fi

# ============================================
# TEST 3: docker-compose.yml
# ============================================
echo ""
echo -e "${BLUE}TEST 3: Vérification de docker-compose.yml...${NC}"
if [ -f "docker-compose.yml" ]; then
    # Tester avec docker compose v2 ou v1
    if docker compose config > /dev/null 2>&1; then
        SERVICES=$(docker compose config --services)
        SERVICE_COUNT=$(echo "$SERVICES" | wc -l)

        if [ "$SERVICE_COUNT" -eq 3 ]; then
            echo -e "${GREEN}✅ PASS - docker-compose.yml valide (3 services)${NC}"
            ((PASS++))
        else
            echo -e "${RED}❌ FAIL - Nombre de services incorrect: $SERVICE_COUNT (attendu: 3)${NC}"
            ((FAIL++))
        fi
    elif docker-compose config > /dev/null 2>&1; then
        SERVICES=$(docker-compose config --services)
        SERVICE_COUNT=$(echo "$SERVICES" | wc -l)

        if [ "$SERVICE_COUNT" -eq 3 ]; then
            echo -e "${GREEN}✅ PASS - docker-compose.yml valide (3 services)${NC}"
            ((PASS++))
        else
            echo -e "${RED}❌ FAIL - Nombre de services incorrect: $SERVICE_COUNT (attendu: 3)${NC}"
            ((FAIL++))
        fi
    else
        echo -e "${RED}❌ FAIL - Impossible de valider docker-compose.yml${NC}"
        ((FAIL++))
    fi
else
    echo -e "${RED}❌ FAIL - docker-compose.yml manquant${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 4: .env.example
# ============================================
echo ""
echo -e "${BLUE}TEST 4: Vérification de .env.example...${NC}"
if [ -f ".env.example" ]; then
    VAR_COUNT=$(grep -c "=" .env.example)

    if [ "$VAR_COUNT" -gt 25 ]; then
        echo -e "${GREEN}✅ PASS - .env.example complet ($VAR_COUNT variables)${NC}"
        ((PASS++))

        # Vérifier les variables critiques
        CRITICAL_VARS="DJANGO_SECRET_KEY POSTGRES_PASSWORD AZURE_OPENAI_API_KEY RESEND_API_KEY NEXT_PUBLIC_API_URL"
        ALL_PRESENT=true

        for VAR in $CRITICAL_VARS; do
            if ! grep -q "^$VAR=" .env.example; then
                echo -e "${YELLOW}⚠️  Variable manquante: $VAR${NC}"
                ALL_PRESENT=false
            fi
        done

        if [ "$ALL_PRESENT" = true ]; then
            echo -e "${GREEN}✅ PASS - Toutes les variables critiques présentes${NC}"
            ((PASS++))
        else
            echo -e "${RED}❌ FAIL - Variables critiques manquantes${NC}"
            ((FAIL++))
        fi
    else
        echo -e "${RED}❌ FAIL - .env.example incomplet ($VAR_COUNT variables, attendu > 25)${NC}"
        ((FAIL+=2))
    fi
else
    echo -e "${RED}❌ FAIL - .env.example manquant${NC}"
    ((FAIL+=2))
fi

# ============================================
# TEST 5: Scripts shell
# ============================================
echo ""
echo -e "${BLUE}TEST 5: Vérification des scripts shell...${NC}"
SCRIPTS=("build.sh" "start.sh" "test.sh" "stop.sh")
ALL_SCRIPTS_OK=true

for SCRIPT in "${SCRIPTS[@]}"; do
    if [ -f "$SCRIPT" ]; then
        if [ -x "$SCRIPT" ]; then
            # Vérifier la syntaxe bash
            if bash -n "$SCRIPT" 2>/dev/null; then
                echo -e "${GREEN}✅ $SCRIPT - Présent, exécutable, syntaxe valide${NC}"
            else
                echo -e "${RED}❌ $SCRIPT - Erreur de syntaxe${NC}"
                ALL_SCRIPTS_OK=false
            fi
        else
            echo -e "${YELLOW}⚠️  $SCRIPT - Non exécutable (chmod +x nécessaire)${NC}"
            ALL_SCRIPTS_OK=false
        fi
    else
        echo -e "${RED}❌ $SCRIPT - Manquant${NC}"
        ALL_SCRIPTS_OK=false
    fi
done

if [ "$ALL_SCRIPTS_OK" = true ]; then
    echo -e "${GREEN}✅ PASS - Tous les scripts sont valides${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL - Certains scripts ont des problèmes${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 6: Jenkinsfile
# ============================================
echo ""
echo -e "${BLUE}TEST 6: Vérification du Jenkinsfile...${NC}"
if [ -f "Jenkinsfile" ]; then
    if grep -q "pipeline" Jenkinsfile && grep -q "stages" Jenkinsfile; then
        STAGE_COUNT=$(grep -c "stage(" Jenkinsfile)

        if [ "$STAGE_COUNT" -ge 5 ]; then
            echo -e "${GREEN}✅ PASS - Jenkinsfile valide ($STAGE_COUNT stages)${NC}"
            ((PASS++))
        else
            echo -e "${RED}❌ FAIL - Jenkinsfile incomplet ($STAGE_COUNT stages, attendu >= 5)${NC}"
            ((FAIL++))
        fi
    else
        echo -e "${RED}❌ FAIL - Jenkinsfile invalide (structure pipeline manquante)${NC}"
        ((FAIL++))
    fi
else
    echo -e "${RED}❌ FAIL - Jenkinsfile manquant${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 7: .gitignore
# ============================================
echo ""
echo -e "${BLUE}TEST 7: Vérification de .gitignore...${NC}"
if [ -f ".gitignore" ]; then
    PATTERNS=(".env" "__pycache__" "node_modules" "*.pyc" "*.log" "media/")
    ALL_PATTERNS_OK=true

    for PATTERN in "${PATTERNS[@]}"; do
        if ! grep -q "$PATTERN" .gitignore; then
            echo -e "${YELLOW}⚠️  Pattern manquant: $PATTERN${NC}"
            ALL_PATTERNS_OK=false
        fi
    done

    if [ "$ALL_PATTERNS_OK" = true ]; then
        echo -e "${GREEN}✅ PASS - .gitignore complet${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL - .gitignore incomplet${NC}"
        ((FAIL++))
    fi
else
    echo -e "${RED}❌ FAIL - .gitignore manquant${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 8: README.md
# ============================================
echo ""
echo -e "${BLUE}TEST 8: Vérification du README.md...${NC}"
if [ -f "README.md" ]; then
    LINE_COUNT=$(wc -l < README.md)
    SECTION_COUNT=$(grep -c "^##" README.md)

    if [ "$LINE_COUNT" -gt 100 ] && [ "$SECTION_COUNT" -gt 10 ]; then
        echo -e "${GREEN}✅ PASS - README.md complet ($LINE_COUNT lignes, $SECTION_COUNT sections)${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL - README.md incomplet ($LINE_COUNT lignes, $SECTION_COUNT sections)${NC}"
        ((FAIL++))
    fi
else
    echo -e "${RED}❌ FAIL - README.md manquant${NC}"
    ((FAIL++))
fi

# ============================================
# TEST 9: Fichiers de documentation
# ============================================
echo ""
echo -e "${BLUE}TEST 9: Vérification des fichiers de documentation...${NC}"
if [ -f "CLAUDE.md" ] && [ -f "PLAN.md" ] && [ -f "TESTS_PHASE_0.md" ]; then
    echo -e "${GREEN}✅ PASS - Documentation complète${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  WARN - Certains fichiers de documentation manquent${NC}"
    echo -e "${YELLOW}(Ce n'est pas bloquant pour la Phase 0)${NC}"
fi

# ============================================
# RÉSUMÉ
# ============================================
echo ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Résumé des Tests Phase 0            ${NC}"
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
    echo -e "${GREEN}║  La Phase 0 est TERMINÉE avec succès  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Prochaines étapes:${NC}"
    echo -e "  1. Créer votre fichier .env : ${BLUE}cp .env.example .env${NC}"
    echo -e "  2. Configurer vos variables d'environnement"
    echo -e "  3. Passer à la Phase 1 : Configuration Django & Base de Données"
    echo ""
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ Certains tests ont échoué         ║${NC}"
    echo -e "${RED}║  Veuillez corriger les erreurs        ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Consultez le guide de tests pour plus de détails:${NC}"
    echo -e "  ${BLUE}cat TESTS_PHASE_0.md${NC}"
    echo ""
    exit 1
fi
