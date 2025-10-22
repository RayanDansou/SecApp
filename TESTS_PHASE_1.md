# Guide de Tests - Phase 1 : Backend - Configuration Django & Base de Données

## Vue d'ensemble

Ce guide détaille tous les tests à effectuer pour valider la **Phase 1 - Backend : Configuration Django & Base de Données** du projet SecApp.

**Durée estimée des tests :** 45-60 minutes

---

## Prérequis

Avant de commencer les tests, assurez-vous d'avoir :

- [ ] Phase 0 complétée et validée
- [ ] Docker et Docker Compose fonctionnels
- [ ] Fichier .env configuré avec les bonnes valeurs
- [ ] Les conteneurs peuvent être démarrés

### Vérification des prérequis

```bash
# Vérifier que la Phase 0 est complète
./test_phase_0.sh

# Vérifier que .env existe et est configuré
test -f .env && echo "✅ .env présent" || echo "❌ .env manquant"

# Vérifier que Docker est disponible
docker-compose ps || docker compose ps
```

---

## Tests à Effectuer

### ✅ TEST 1 : Vérification du fichier requirements.txt

**Objectif :** Vérifier que toutes les dépendances Python sont définies.

**Commande :**

```bash
# Vérifier l'existence
ls -lh backend/requirements.txt

# Compter le nombre de dépendances
cat backend/requirements.txt | grep -v "^#" | grep -v "^$" | wc -l
```

**Critères de validation :**

- [ ] Le fichier existe
- [ ] Contient au moins 25 dépendances
- [ ] Django==5.0.1 est présent
- [ ] djangorestframework est présent
- [ ] psycopg2-binary est présent
- [ ] djangorestframework-simplejwt est présent
- [ ] django-cors-headers est présent
- [ ] gunicorn est présent

**Vérification des packages critiques :**

```bash
cat backend/requirements.txt | grep -E "Django==|djangorestframework|psycopg2|simplejwt|cors|gunicorn"
```

**Résultat attendu :** ✅ PASS (tous les packages critiques sont présents)

---

### ✅ TEST 2 : Structure des applications Django

**Objectif :** Vérifier que la structure Django est correcte.

**Commande :**

```bash
# Vérifier la structure
tree backend -L 2 -I "__pycache__|*.pyc"
# ou
find backend -maxdepth 2 -type f -name "*.py" | sort
```

**Fichiers attendus :**

```
backend/
├── manage.py
├── requirements.txt
├── secapp/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── asgi.py
│   └── views.py
├── users/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py
│   ├── admin.py
│   ├── views.py
│   └── tests.py
└── questionnaires/
    ├── __init__.py
    ├── apps.py
    ├── models.py
    ├── admin.py
    ├── views.py
    └── tests.py
```

**Critères de validation :**

- [ ] manage.py existe
- [ ] secapp/ contient tous les fichiers de configuration
- [ ] users/ contient tous les fichiers de base
- [ ] questionnaires/ contient tous les fichiers de base

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 3 : Build de l'image Docker Backend

**Objectif :** Vérifier que l'image Docker du backend se construit sans erreur.

**Commande :**

```bash
# Build de l'image backend
docker-compose build backend
# ou
docker compose build backend
```

**Critères de validation :**

- [ ] Le build se termine sans erreur
- [ ] Toutes les dépendances pip sont installées
- [ ] L'image est créée avec succès

**Résultat attendu :** ✅ PASS (build successful)

---

### ✅ TEST 4 : Démarrage des conteneurs

**Objectif :** Vérifier que tous les conteneurs démarrent correctement.

**Commande :**

```bash
# Démarrer tous les services
./start.sh

# Ou manuellement
docker-compose up -d

# Vérifier l'état
docker-compose ps
```

**Critères de validation :**

- [ ] Le conteneur database démarre (State: Up)
- [ ] Le conteneur backend démarre (State: Up)
- [ ] Aucun conteneur n'est en état "Exit" ou "Restarting"

**Sortie attendue :**

```
NAME                 STATUS              PORTS
secapp-database      Up                  5432/tcp
secapp-backend       Up                  8000/tcp
secapp-frontend      Up                  3000/tcp
```

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 5 : Connexion à la base de données PostgreSQL

**Objectif :** Vérifier que le backend peut se connecter à PostgreSQL.

**Commande :**

```bash
# Vérifier la connexion PostgreSQL depuis le conteneur database
docker exec secapp-database pg_isready -U secapp_user -d secapp

# Vérifier que Django peut se connecter
docker exec secapp-backend python manage.py check --database default
```

**Critères de validation :**

- [ ] PostgreSQL est prêt à accepter les connexions
- [ ] Django peut se connecter à la base de données
- [ ] Aucune erreur de configuration

**Résultat attendu :**

```
secapp:5432 - accepting connections
System check identified no issues (0 silenced).
```

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 6 : Vérification de la configuration Django

**Objectif :** Vérifier que Django est correctement configuré.

**Commande :**

```bash
# Exécuter le check Django
docker exec secapp-backend python manage.py check

# Vérifier les apps installées
docker exec secapp-backend python manage.py showmigrations
```

**Critères de validation :**

- [ ] `python manage.py check` ne retourne aucune erreur
- [ ] Les apps `users` et `questionnaires` sont reconnues
- [ ] Les migrations Django par défaut sont listées

**Résultat attendu :**

```
System check identified no issues (0 silenced).
```

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 7 : Migrations initiales Django

**Objectif :** Vérifier que les migrations Django peuvent être appliquées.

**Commande :**

```bash
# Créer les migrations (si nécessaire)
docker exec secapp-backend python manage.py makemigrations

# Appliquer les migrations
docker exec secapp-backend python manage.py migrate

# Vérifier l'état des migrations
docker exec secapp-backend python manage.py showmigrations
```

**Critères de validation :**

- [ ] `makemigrations` n'a aucune nouvelle migration à créer (ou réussit)
- [ ] `migrate` applique toutes les migrations avec succès
- [ ] Les tables Django de base sont créées (auth, contenttypes, sessions, admin)

**Sortie attendue :**

```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  ...
```

**Vérification dans PostgreSQL :**

```bash
# Lister les tables créées
docker exec secapp-database psql -U secapp_user -d secapp -c "\dt"
```

**Tables attendues :**

- django_migrations
- django_content_type
- auth_user
- auth_group
- auth_permission
- django_session
- django_admin_log

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 8 : Démarrage du serveur Django

**Objectif :** Vérifier que le serveur Django démarre correctement.

**Commande :**

```bash
# Vérifier que le serveur répond
curl -f http://localhost:8000/api/health/ || echo "❌ Serveur ne répond pas"

# Ou avec wget
wget -q --spider http://localhost:8000/api/health/ && echo "✅ Serveur actif" || echo "❌ Serveur inactif"

# Vérifier les logs
docker logs secapp-backend --tail 50
```

**Critères de validation :**

- [ ] Le serveur Django écoute sur le port 8000
- [ ] Aucune erreur dans les logs
- [ ] Le endpoint de health check répond

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 9 : Test du Health Check Endpoint

**Objectif :** Vérifier que l'endpoint `/api/health/` fonctionne correctement.

**Commande :**

```bash
# Test avec curl
curl -X GET http://localhost:8000/api/health/ -H "Content-Type: application/json" | jq

# Ou sans jq
curl -X GET http://localhost:8000/api/health/
```

**Réponse attendue :**

```json
{
  "status": "healthy",
  "service": "SecApp Backend",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful"
    },
    "configuration": {
      "status": "healthy",
      "message": "All critical settings configured"
    },
    "debug_mode": {
      "status": "info",
      "enabled": true
    },
    "installed_apps": {
      "status": "info",
      "count": 12,
      "apps": ["users.apps.UsersConfig", "questionnaires.apps.QuestionnairesConfig"]
    }
  }
}
```

**Critères de validation :**

- [ ] Status HTTP 200
- [ ] `"status": "healthy"`
- [ ] Database check est "healthy"
- [ ] Configuration check est "healthy"
- [ ] Les apps users et questionnaires sont listées

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 10 : Accès à l'admin Django

**Objectif :** Vérifier que l'interface d'administration Django est accessible.

**Commande :**

```bash
# Créer un superutilisateur
docker exec -it secapp-backend python manage.py createsuperuser --noinput --username admin --email admin@secapp.com || echo "Utilisateur existe déjà"

# Définir le mot de passe
docker exec -it secapp-backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); u = User.objects.get(username='admin'); u.set_password('admin123'); u.save()"

# Tester l'accès
curl -I http://localhost:8000/admin/
```

**Critères de validation :**

- [ ] L'endpoint `/admin/` répond avec un status HTTP 200 ou 302
- [ ] Pas d'erreur 500
- [ ] La page admin est accessible dans le navigateur

**Test dans le navigateur :**

1. Ouvrir http://localhost:8000/admin/
2. Se connecter avec `admin` / `admin123`
3. Vérifier que le dashboard admin s'affiche

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 11 : Documentation API (Swagger)

**Objectif :** Vérifier que la documentation Swagger est accessible.

**Commande :**

```bash
# Tester l'endpoint Swagger
curl -I http://localhost:8000/api/docs/

# Tester le schéma OpenAPI
curl -I http://localhost:8000/api/schema/

# Tester Redoc
curl -I http://localhost:8000/api/redoc/
```

**Critères de validation :**

- [ ] `/api/docs/` retourne HTTP 200
- [ ] `/api/schema/` retourne HTTP 200
- [ ] `/api/redoc/` retourne HTTP 200

**Test dans le navigateur :**

Ouvrir http://localhost:8000/api/docs/ et vérifier que l'interface Swagger s'affiche.

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 12 : Variables d'environnement

**Objectif :** Vérifier que les variables d'environnement sont correctement chargées.

**Commande :**

```bash
# Vérifier les variables dans le conteneur
docker exec secapp-backend python manage.py shell << EOF
from django.conf import settings
print(f"DEBUG: {settings.DEBUG}")
print(f"DATABASE: {settings.DATABASES['default']['ENGINE']}")
print(f"INSTALLED_APPS count: {len(settings.INSTALLED_APPS)}")
print(f"SECRET_KEY defined: {bool(settings.SECRET_KEY)}")
print(f"CORS_ALLOWED_ORIGINS: {settings.CORS_ALLOWED_ORIGINS}")
EOF
```

**Critères de validation :**

- [ ] DEBUG est défini (True ou False)
- [ ] DATABASE utilise PostgreSQL
- [ ] INSTALLED_APPS contient au moins 10 apps
- [ ] SECRET_KEY est défini
- [ ] CORS_ALLOWED_ORIGINS est configuré

**Résultat attendu :** ✅ PASS (toutes les variables sont chargées)

---

### ✅ TEST 13 : Configuration CORS

**Objectif :** Vérifier que CORS est correctement configuré.

**Commande :**

```bash
# Test CORS avec curl
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     -I http://localhost:8000/api/health/
```

**Critères de validation :**

- [ ] La réponse contient `Access-Control-Allow-Origin: http://localhost:3000`
- [ ] Status HTTP 200

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 14 : Logs de l'application

**Objectif :** Vérifier que les logs sont correctement générés.

**Commande :**

```bash
# Vérifier les logs du backend
docker logs secapp-backend --tail 100

# Vérifier le fichier de logs dans le conteneur
docker exec secapp-backend ls -lh /app/logs/

# Lire les logs
docker exec secapp-backend tail -20 /app/logs/secapp.log
```

**Critères de validation :**

- [ ] Les logs sont affichés sans erreur
- [ ] Le dossier `/app/logs/` existe
- [ ] Le fichier `secapp.log` est créé
- [ ] Les logs contiennent des entrées récentes

**Résultat attendu :** ✅ PASS

---

### ✅ TEST 15 : Tests unitaires Django

**Objectif :** Vérifier que les tests Django peuvent être exécutés.

**Commande :**

```bash
# Exécuter les tests Django
docker exec secapp-backend python manage.py test --verbosity=2

# Exécuter les tests avec coverage (optionnel)
docker exec secapp-backend coverage run --source='.' manage.py test
docker exec secapp-backend coverage report
```

**Critères de validation :**

- [ ] La commande s'exécute sans erreur
- [ ] Aucun test ne fail (pour l'instant 0 tests est OK)
- [ ] Le framework de test fonctionne

**Sortie attendue :**

```
Ran 0 tests in 0.000s

OK
```

**Résultat attendu :** ✅ PASS

---

## Script de Test Automatisé Phase 1

Créons un script pour automatiser tous ces tests :

```bash
#!/bin/bash
# test_phase_1.sh - Script de validation de la Phase 1

echo "========================================"
echo "  SecApp - Tests Phase 1"
echo "  Configuration Django & Base de Données"
echo "========================================"

PASS=0
FAIL=0

# Démarrer les services si nécessaire
echo ""
echo "🚀 Démarrage des services..."
docker-compose up -d || docker compose up -d
sleep 10

# TEST 1: requirements.txt
echo ""
echo "TEST 1: Vérification de requirements.txt..."
if [ -f "backend/requirements.txt" ] && [ $(cat backend/requirements.txt | grep -c "Django==") -eq 1 ]; then
    echo "✅ PASS - requirements.txt présent"
    ((PASS++))
else
    echo "❌ FAIL - requirements.txt problématique"
    ((FAIL++))
fi

# TEST 2: Structure Django
echo ""
echo "TEST 2: Vérification de la structure Django..."
if [ -f "backend/manage.py" ] && [ -f "backend/secapp/settings.py" ] && \
   [ -d "backend/users" ] && [ -d "backend/questionnaires" ]; then
    echo "✅ PASS - Structure Django complète"
    ((PASS++))
else
    echo "❌ FAIL - Structure Django incomplète"
    ((FAIL++))
fi

# TEST 3: Connexion Database
echo ""
echo "TEST 3: Test connexion PostgreSQL..."
if docker exec secapp-database pg_isready -U secapp_user -d secapp > /dev/null 2>&1; then
    echo "✅ PASS - PostgreSQL opérationnel"
    ((PASS++))
else
    echo "❌ FAIL - PostgreSQL non disponible"
    ((FAIL++))
fi

# TEST 4: Django Check
echo ""
echo "TEST 4: Vérification configuration Django..."
if docker exec secapp-backend python manage.py check > /dev/null 2>&1; then
    echo "✅ PASS - Configuration Django valide"
    ((PASS++))
else
    echo "❌ FAIL - Configuration Django invalide"
    ((FAIL++))
fi

# TEST 5: Migrations
echo ""
echo "TEST 5: Application des migrations..."
if docker exec secapp-backend python manage.py migrate > /dev/null 2>&1; then
    echo "✅ PASS - Migrations appliquées"
    ((PASS++))
else
    echo "❌ FAIL - Erreur migrations"
    ((FAIL++))
fi

# TEST 6: Health Check
echo ""
echo "TEST 6: Test du Health Check endpoint..."
HEALTH_STATUS=$(curl -s http://localhost:8000/api/health/ | grep -c "healthy")
if [ "$HEALTH_STATUS" -ge 1 ]; then
    echo "✅ PASS - Health check fonctionnel"
    ((PASS++))
else
    echo "❌ FAIL - Health check ne répond pas"
    ((FAIL++))
fi

# TEST 7: Admin accessible
echo ""
echo "TEST 7: Vérification accès admin Django..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/admin/)
if [ "$ADMIN_STATUS" = "302" ] || [ "$ADMIN_STATUS" = "200" ]; then
    echo "✅ PASS - Admin Django accessible"
    ((PASS++))
else
    echo "❌ FAIL - Admin Django inaccessible"
    ((FAIL++))
fi

# TEST 8: Swagger Documentation
echo ""
echo "TEST 8: Vérification documentation API..."
SWAGGER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/docs/)
if [ "$SWAGGER_STATUS" = "200" ]; then
    echo "✅ PASS - Documentation API accessible"
    ((PASS++))
else
    echo "❌ FAIL - Documentation API inaccessible"
    ((FAIL++))
fi

# Résumé
echo ""
echo "========================================"
echo "  Résumé des Tests Phase 1"
echo "========================================"
echo ""
echo "Tests réussis: $PASS"
echo "Tests échoués: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "╔════════════════════════════════════════╗"
    echo "║  ✅ Tous les tests sont passés !      ║"
    echo "║  La Phase 1 est TERMINÉE avec succès  ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "Prochaines étapes:"
    echo "  - Phase 2: Modèles de Données"
    echo "  - Créer les modèles User et Questionnaire"
    echo ""
    exit 0
else
    echo "╔════════════════════════════════════════╗"
    echo "║  ❌ Certains tests ont échoué         ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    exit 1
fi
```

---

## Checklist Globale

- [ ] **TEST 1** - requirements.txt complet
- [ ] **TEST 2** - Structure Django correcte
- [ ] **TEST 3** - Image Docker backend se build
- [ ] **TEST 4** - Conteneurs démarrent
- [ ] **TEST 5** - Connexion PostgreSQL OK
- [ ] **TEST 6** - Django check sans erreur
- [ ] **TEST 7** - Migrations appliquées
- [ ] **TEST 8** - Serveur Django répond
- [ ] **TEST 9** - Health check fonctionnel
- [ ] **TEST 10** - Admin Django accessible
- [ ] **TEST 11** - Documentation API accessible
- [ ] **TEST 12** - Variables d'environnement chargées
- [ ] **TEST 13** - CORS configuré
- [ ] **TEST 14** - Logs générés
- [ ] **TEST 15** - Tests unitaires exécutables

---

## Résultats Attendus

✅ **Phase 1 complétée avec succès si :**

- Django est installé et configuré
- La connexion à PostgreSQL fonctionne
- Les migrations de base sont appliquées
- Le serveur Django démarre sans erreur
- Le health check répond correctement
- L'admin Django est accessible
- La documentation API est disponible

---

## Troubleshooting

### Problème : Conteneur backend ne démarre pas

```bash
# Vérifier les logs
docker logs secapp-backend

# Reconstruire l'image
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Problème : Erreur de connexion database

```bash
# Vérifier que la database est up
docker-compose ps database

# Vérifier les variables d'environnement
docker exec secapp-backend env | grep DATABASE

# Redémarrer la database
docker-compose restart database
```

### Problème : Migrations échouent

```bash
# Supprimer les migrations et recommencer
docker exec secapp-backend find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
docker exec secapp-backend python manage.py makemigrations
docker exec secapp-backend python manage.py migrate
```

---

**Date de création :** Phase 1 - Configuration Django & Base de Données
**Dernière mise à jour :** 2025-10-22
