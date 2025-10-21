# Guide de Tests - Phase 0 : Configuration Initiale de l'Environnement

## Vue d'ensemble

Ce guide détaille tous les tests à effectuer pour valider la **Phase 0 - Configuration Initiale de l'Environnement** du projet SecApp.

**Durée estimée des tests :** 30-45 minutes

---

## Prérequis

Avant de commencer les tests, assurez-vous d'avoir :

- [ ] Docker installé (version >= 24.0)
- [ ] Docker Compose installé (version >= 2.20)
- [ ] Git installé
- [ ] Terminal Bash disponible
- [ ] Droits d'exécution sur les scripts shell

### Vérification des prérequis

```bash
# Vérifier Docker
docker --version
# Attendu: Docker version 24.0+ ou supérieure

# Vérifier Docker Compose
docker-compose --version
# ou
docker compose version
# Attendu: Docker Compose version 2.20+ ou supérieure

# Vérifier Git
git --version
# Attendu: git version 2.x.x

# Vérifier Bash
bash --version
# Attendu: GNU bash, version 4.x ou supérieure
```

---

## Tests à Effectuer

### ✅ TEST 1 : Vérification de l'Arborescence du Projet

**Objectif :** Vérifier que tous les dossiers et fichiers de base sont présents.

**Commande :**

```bash
# Depuis la racine du projet
tree -L 2 -a
# ou si tree n'est pas installé :
find . -maxdepth 2 -type d -o -type f | grep -v ".git" | sort
```

**Structure attendue :**

```
.
├── .env.example
├── .gitignore
├── README.md
├── CLAUDE.md
├── PLAN.md
├── TESTS_PHASE_0.md
├── build.sh
├── start.sh
├── stop.sh
├── test.sh
├── docker-compose.yml
├── Jenkinsfile
├── backend/
│   ├── .gitkeep
│   ├── Dockerfile
│   ├── secapp/
│   ├── questionnaires/
│   └── users/
├── frontend/
│   ├── .gitkeep
│   ├── Dockerfile
│   ├── pages/
│   ├── components/
│   ├── services/
│   └── styles/
└── database/
    └── .gitkeep
```

**Critères de validation :**

- [ ] Tous les dossiers principaux existent (backend, frontend, database)
- [ ] Tous les sous-dossiers nécessaires sont présents
- [ ] Les fichiers .gitkeep sont présents dans les dossiers vides
- [ ] Tous les fichiers racine sont présents

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 2 : Vérification des Fichiers Docker

**Objectif :** S'assurer que les Dockerfiles et docker-compose.yml sont correctement créés.

#### Test 2.1 : Dockerfile Backend

**Commande :**

```bash
# Vérifier l'existence
ls -lh backend/Dockerfile

# Vérifier le contenu
cat backend/Dockerfile | head -20
```

**Critères de validation :**

- [ ] Le fichier existe
- [ ] Utilise l'image `python:3.11-slim`
- [ ] Contient l'installation de PostgreSQL client
- [ ] Définit le WORKDIR à `/app`
- [ ] Expose le port 8000
- [ ] Contient la commande CMD pour gunicorn

**Résultat attendu :** ✅ PASS

#### Test 2.2 : Dockerfile Frontend

**Commande :**

```bash
# Vérifier l'existence
ls -lh frontend/Dockerfile

# Vérifier le contenu
cat frontend/Dockerfile | head -20
```

**Critères de validation :**

- [ ] Le fichier existe
- [ ] Utilise l'image `node:20-alpine`
- [ ] Utilise un build multi-stage (base, deps, builder, runner)
- [ ] Expose le port 3000
- [ ] Crée un utilisateur non-root (nextjs)

**Résultat attendu :** ✅ PASS

#### Test 2.3 : docker-compose.yml

**Commande :**

```bash
# Vérifier l'existence
ls -lh docker-compose.yml

# Valider la syntaxe
docker-compose config
# ou
docker compose config
```

**Critères de validation :**

- [ ] Le fichier existe
- [ ] La commande `docker-compose config` s'exécute sans erreur
- [ ] Définit 3 services : database, backend, frontend
- [ ] Chaque service a un healthcheck
- [ ] Les volumes sont correctement définis
- [ ] Le réseau `secapp-network` est créé
- [ ] Les dépendances entre services sont correctes

**Sortie attendue de `docker-compose config` :**

```yaml
services:
  database:
    ...
  backend:
    depends_on:
      database:
        condition: service_healthy
    ...
  frontend:
    depends_on:
      - backend
    ...
```

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 3 : Vérification du Fichier .env.example

**Objectif :** Vérifier que toutes les variables d'environnement nécessaires sont documentées.

**Commande :**

```bash
# Vérifier l'existence
ls -lh .env.example

# Compter le nombre de variables
cat .env.example | grep -E "^[A-Z_]+=" | wc -l
```

**Critères de validation :**

- [ ] Le fichier existe
- [ ] Contient au moins 30 variables d'environnement
- [ ] Variables Django présentes (SECRET_KEY, DEBUG, ALLOWED_HOSTS)
- [ ] Variables Database présentes (POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD)
- [ ] Variables Azure OpenAI présentes (ENDPOINT, API_KEY, MODEL)
- [ ] Variables Resend présentes (API_KEY, FROM_EMAIL)
- [ ] Variables Frontend présentes (NEXT_PUBLIC_API_URL)
- [ ] Commentaires explicatifs présents

**Variables critiques à vérifier :**

```bash
# Vérifier les variables essentielles
cat .env.example | grep -E "DJANGO_SECRET_KEY|POSTGRES_PASSWORD|AZURE_OPENAI_API_KEY|RESEND_API_KEY|NEXT_PUBLIC_API_URL"
```

**Résultat attendu :** ✅ PASS (toutes les variables sont présentes)

---

### ✅ TEST 4 : Vérification des Scripts Shell

**Objectif :** Vérifier que les scripts shell sont présents et exécutables.

#### Test 4.1 : Présence et permissions

**Commande :**

```bash
# Vérifier la présence
ls -lh *.sh

# Vérifier les permissions d'exécution
ls -l build.sh start.sh test.sh stop.sh | grep "^-rwx"
```

**Critères de validation :**

- [ ] build.sh existe et est exécutable
- [ ] start.sh existe et est exécutable
- [ ] test.sh existe et est exécutable
- [ ] stop.sh existe et est exécutable
- [ ] Tous les scripts ont les permissions `chmod +x`

**Si les permissions ne sont pas correctes :**

```bash
chmod +x build.sh start.sh test.sh stop.sh
```

**Résultat attendu :** ✅ PASS

#### Test 4.2 : Validation syntaxique des scripts

**Commande :**

```bash
# Vérifier la syntaxe bash de chaque script
bash -n build.sh
bash -n start.sh
bash -n test.sh
bash -n stop.sh
```

**Critères de validation :**

- [ ] Aucune erreur de syntaxe détectée
- [ ] Tous les scripts contiennent `#!/bin/bash`
- [ ] Tous les scripts contiennent `set -e` (arrêt en cas d'erreur)

**Résultat attendu :** ✅ PASS (pas de sortie = pas d'erreur)

#### Test 4.3 : Contenu des scripts

**Commande :**

```bash
# Vérifier que build.sh construit les images
grep -q "docker-compose build" build.sh && echo "✅ build.sh OK" || echo "❌ build.sh KO"

# Vérifier que start.sh démarre les services
grep -q "docker-compose up" start.sh && echo "✅ start.sh OK" || echo "❌ start.sh KO"

# Vérifier que test.sh exécute des tests
grep -q "docker exec.*test" test.sh && echo "✅ test.sh OK" || echo "❌ test.sh KO"

# Vérifier que stop.sh arrête les services
grep -q "docker-compose down" stop.sh && echo "✅ stop.sh OK" || echo "❌ stop.sh KO"
```

**Résultat attendu :** ✅ PASS (tous affichent "OK")

---

### ✅ TEST 5 : Vérification du Jenkinsfile

**Objectif :** Vérifier que le Jenkinsfile est valide et contient toutes les étapes nécessaires.

**Commande :**

```bash
# Vérifier l'existence
ls -lh Jenkinsfile

# Vérifier les stages
cat Jenkinsfile | grep "stage(" | sed "s/.*stage('\(.*\)').*/\1/"
```

**Critères de validation :**

- [ ] Le fichier existe
- [ ] Contient un pipeline avec `agent any`
- [ ] Définit des variables d'environnement
- [ ] Contient les stages suivants :
  - Checkout
  - Environment Setup
  - Build Images
  - Tests
  - Code Quality & Security
  - Push Images
  - Deploy

**Stages attendus :**

```
Checkout
Environment Setup
Build Backend
Build Frontend
Backend Tests
Frontend Tests
Lint Backend
Lint Frontend
Security Scan
Push Images
Deploy
```

**Résultat attendu :** ✅ PASS (tous les stages sont présents)

---

### ✅ TEST 6 : Vérification du Fichier .gitignore

**Objectif :** S'assurer que les fichiers sensibles et temporaires seront ignorés par Git.

**Commande :**

```bash
# Vérifier l'existence
ls -lh .gitignore

# Vérifier les patterns importants
cat .gitignore | grep -E "\.env$|__pycache__|node_modules|\.pyc|\.log"
```

**Critères de validation :**

- [ ] Le fichier existe
- [ ] Ignore les fichiers `.env`
- [ ] Ignore `__pycache__/` et `*.pyc`
- [ ] Ignore `node_modules/`
- [ ] Ignore les fichiers de logs (`*.log`)
- [ ] Ignore les fichiers media et uploads
- [ ] Ignore les dossiers IDE (`.vscode/`, `.idea/`)
- [ ] Conserve `.env.example` (avec `!`)

**Patterns critiques à vérifier :**

```bash
cat .gitignore | grep -E "^\.env$|^__pycache__|^node_modules|^media/|^\.vscode"
```

**Résultat attendu :** ✅ PASS (tous les patterns sont présents)

---

### ✅ TEST 7 : Vérification du README.md

**Objectif :** Vérifier que la documentation de base est complète.

**Commande :**

```bash
# Vérifier l'existence
ls -lh README.md

# Compter les sections principales
cat README.md | grep "^##" | wc -l
```

**Critères de validation :**

- [ ] Le fichier existe
- [ ] Contient au moins 15 sections principales
- [ ] Décrit le projet et ses fonctionnalités
- [ ] Explique l'architecture technique
- [ ] Liste les prérequis
- [ ] Fournit des instructions d'installation
- [ ] Documente les commandes principales
- [ ] Liste les endpoints API
- [ ] Explique le workflow

**Sections attendues :**

```bash
cat README.md | grep "^##"
```

Doit inclure :
- Description
- Architecture
- Prérequis
- Installation
- Démarrage rapide
- Commandes utiles
- API Endpoints
- Tests
- Troubleshooting

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 8 : Test de Configuration Docker Compose

**Objectif :** Valider que docker-compose est correctement configuré.

**Commande :**

```bash
# Valider la configuration
docker-compose config > /dev/null 2>&1 && echo "✅ Configuration valide" || echo "❌ Configuration invalide"

# ou avec docker compose v2
docker compose config > /dev/null 2>&1 && echo "✅ Configuration valide" || echo "❌ Configuration invalide"
```

**Critères de validation :**

- [ ] La commande s'exécute sans erreur
- [ ] Aucun avertissement n'est affiché
- [ ] Les services sont correctement définis
- [ ] Les réseaux sont correctement définis
- [ ] Les volumes sont correctement définis

**Vérifications supplémentaires :**

```bash
# Vérifier le nombre de services
docker-compose config --services | wc -l
# Attendu: 3 (database, backend, frontend)

# Vérifier les services
docker-compose config --services
# Attendu:
# database
# backend
# frontend
```

**Résultat attendu :** ✅ PASS (3 services détectés)

---

### ✅ TEST 9 : Création du Fichier .env

**Objectif :** Créer un fichier .env fonctionnel pour le développement.

**Commande :**

```bash
# Copier .env.example vers .env
cp .env.example .env

# Vérifier la création
ls -lh .env

# Vérifier que .env n'est pas versionné
git status .env 2>/dev/null | grep -q "Untracked" || git check-ignore .env
```

**Critères de validation :**

- [ ] Le fichier .env a été créé
- [ ] Git ignore le fichier .env (vérifié avec `git check-ignore`)
- [ ] Le fichier contient toutes les variables nécessaires

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 10 : Test de Build des Images (Optionnel - Test Complet)

**⚠️ Attention :** Ce test nécessite que Docker soit correctement configuré et peut prendre 5-10 minutes.

**Objectif :** Vérifier que les images Docker peuvent être construites sans erreur.

**Commande :**

```bash
# Test de build du backend
docker build -t secapp-backend-test ./backend

# Test de build du frontend
docker build -t secapp-frontend-test ./frontend

# Vérifier les images créées
docker images | grep secapp
```

**Critères de validation :**

- [ ] L'image backend se construit sans erreur
- [ ] L'image frontend se construit sans erreur
- [ ] Les images apparaissent dans `docker images`

**Nettoyage après le test :**

```bash
docker rmi secapp-backend-test secapp-frontend-test
```

**Résultat attendu :** ✅ PASS (si Docker est disponible)

---

## Récapitulatif des Tests

### Checklist Globale

- [ ] **TEST 1** - Arborescence du projet conforme
- [ ] **TEST 2** - Fichiers Docker correctement créés
- [ ] **TEST 3** - .env.example complet
- [ ] **TEST 4** - Scripts shell présents et exécutables
- [ ] **TEST 5** - Jenkinsfile valide avec tous les stages
- [ ] **TEST 6** - .gitignore correctement configuré
- [ ] **TEST 7** - README.md complet et documenté
- [ ] **TEST 8** - docker-compose.yml valide
- [ ] **TEST 9** - .env créé et ignoré par Git
- [ ] **TEST 10** - Images Docker constructibles (optionnel)

---

## Script de Test Automatisé

Pour faciliter les tests, voici un script bash qui exécute tous les tests automatiquement :

```bash
#!/bin/bash
# test_phase_0.sh - Script de validation de la Phase 0

echo "========================================"
echo "  Tests Phase 0 - SecApp"
echo "========================================"

PASS=0
FAIL=0

# Test 1: Arborescence
echo ""
echo "TEST 1: Vérification de l'arborescence..."
if [ -d "backend" ] && [ -d "frontend" ] && [ -d "database" ]; then
    echo "✅ PASS - Arborescence OK"
    ((PASS++))
else
    echo "❌ FAIL - Dossiers manquants"
    ((FAIL++))
fi

# Test 2: Dockerfiles
echo ""
echo "TEST 2: Vérification des Dockerfiles..."
if [ -f "backend/Dockerfile" ] && [ -f "frontend/Dockerfile" ]; then
    echo "✅ PASS - Dockerfiles présents"
    ((PASS++))
else
    echo "❌ FAIL - Dockerfiles manquants"
    ((FAIL++))
fi

# Test 3: docker-compose.yml
echo ""
echo "TEST 3: Vérification de docker-compose.yml..."
if docker-compose config > /dev/null 2>&1 || docker compose config > /dev/null 2>&1; then
    echo "✅ PASS - docker-compose.yml valide"
    ((PASS++))
else
    echo "❌ FAIL - docker-compose.yml invalide"
    ((FAIL++))
fi

# Test 4: .env.example
echo ""
echo "TEST 4: Vérification de .env.example..."
if [ -f ".env.example" ] && [ $(cat .env.example | grep -c "=") -gt 25 ]; then
    echo "✅ PASS - .env.example complet"
    ((PASS++))
else
    echo "❌ FAIL - .env.example incomplet"
    ((FAIL++))
fi

# Test 5: Scripts shell
echo ""
echo "TEST 5: Vérification des scripts shell..."
if [ -x "build.sh" ] && [ -x "start.sh" ] && [ -x "test.sh" ] && [ -x "stop.sh" ]; then
    echo "✅ PASS - Scripts exécutables"
    ((PASS++))
else
    echo "❌ FAIL - Scripts non exécutables"
    ((FAIL++))
fi

# Test 6: Jenkinsfile
echo ""
echo "TEST 6: Vérification du Jenkinsfile..."
if [ -f "Jenkinsfile" ] && grep -q "pipeline" Jenkinsfile; then
    echo "✅ PASS - Jenkinsfile présent"
    ((PASS++))
else
    echo "❌ FAIL - Jenkinsfile invalide"
    ((FAIL++))
fi

# Test 7: .gitignore
echo ""
echo "TEST 7: Vérification de .gitignore..."
if [ -f ".gitignore" ] && grep -q "\.env" .gitignore; then
    echo "✅ PASS - .gitignore configuré"
    ((PASS++))
else
    echo "❌ FAIL - .gitignore manquant"
    ((FAIL++))
fi

# Test 8: README.md
echo ""
echo "TEST 8: Vérification du README.md..."
if [ -f "README.md" ] && [ $(cat README.md | wc -l) -gt 100 ]; then
    echo "✅ PASS - README.md complet"
    ((PASS++))
else
    echo "❌ FAIL - README.md incomplet"
    ((FAIL++))
fi

# Résumé
echo ""
echo "========================================"
echo "  Résumé des Tests"
echo "========================================"
echo "Tests réussis: $PASS"
echo "Tests échoués: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "✅ Tous les tests sont passés !"
    echo "La Phase 0 est TERMINÉE avec succès."
    exit 0
else
    echo "❌ Certains tests ont échoué."
    echo "Veuillez corriger les erreurs avant de continuer."
    exit 1
fi
```

**Utilisation :**

```bash
# Sauvegarder le script
nano test_phase_0.sh

# Rendre exécutable
chmod +x test_phase_0.sh

# Exécuter
./test_phase_0.sh
```

---

## Résultat Attendu Final

Si tous les tests passent, vous devriez voir :

```
========================================
  Résumé des Tests
========================================
Tests réussis: 8
Tests échoués: 0

✅ Tous les tests sont passés !
La Phase 0 est TERMINÉE avec succès.
```

---

## Prochaines Étapes

Une fois la Phase 0 validée, vous pouvez passer à :

- **Phase 1** : Backend - Configuration Django & Base de Données
- Initialisation du projet Django
- Configuration de PostgreSQL
- Création des apps `users/` et `questionnaires/`

---

## Support

En cas de problème :

1. Vérifier les logs : `docker-compose logs`
2. Consulter le README.md
3. Vérifier les variables d'environnement dans `.env`
4. Nettoyer et reconstruire : `docker-compose down -v && docker-compose up --build`

---

**Date de création :** Phase 0 - Configuration Initiale
**Dernière mise à jour :** 2025-10-21
