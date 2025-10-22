# 🧪 Guide de Tests - Phase 0 Bootstrap

Ce document décrit tous les tests à effectuer pour valider la Phase 0 de SecApp.

## ✅ Critères de validation Phase 0

La Phase 0 est considérée comme réussie si:

1. ✅ `docker compose up` démarre tous les services sans erreur
2. ✅ Le frontend est accessible et affiche "It works"
3. ✅ Le backend répond sur `/api/healthz/`
4. ✅ `docker compose config` ne retourne aucune erreur
5. ✅ Le pipeline CI/CD s'exécute avec succès

---

## 🔧 Tests de configuration

### Test 1: Validation de la configuration Docker Compose

**Objectif:** Vérifier que le fichier `docker-compose.yml` est valide

```bash
# Exécuter
docker compose config

# Résultat attendu
# Le fichier YAML devrait être affiché sans erreur
# Aucun message d'erreur ne devrait apparaître
```

**Statut:** ✅ Passe si aucune erreur n'est affichée

---

### Test 2: Vérification des fichiers requis

**Objectif:** S'assurer que tous les fichiers nécessaires sont présents

```bash
# Vérifier les fichiers principaux
ls -la docker-compose.yml
ls -la .env.example
ls -la Jenkinsfile
ls -la README.md

# Vérifier les dossiers
ls -la backend/
ls -la frontend/
ls -la database/
ls -la scripts/

# Vérifier les Dockerfiles
ls -la backend/Dockerfile
ls -la frontend/Dockerfile
ls -la database/Dockerfile
```

**Statut:** ✅ Passe si tous les fichiers existent

---

## 🐳 Tests de conteneurisation

### Test 3: Build des images Docker

**Objectif:** Construire toutes les images Docker sans erreur

```bash
# Option 1: Utiliser le script
./scripts/build.sh

# Option 2: Build manuel
docker build -t secapp-backend:test ./backend
docker build -t secapp-frontend:test ./frontend
docker build -t secapp-db:test ./database

# Vérifier que les images sont créées
docker images | grep secapp
```

**Résultat attendu:**
```
secapp-backend    latest/test    ...    ...    ...
secapp-frontend   latest/test    ...    ...    ...
secapp-db         latest/test    ...    ...    ...
```

**Statut:** ✅ Passe si toutes les images sont construites

---

### Test 4: Démarrage des services

**Objectif:** Démarrer tous les services avec Docker Compose

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Démarrer les services
./scripts/start.sh

# OU manuellement
docker compose up -d

# Attendre que les services démarrent
sleep 30

# Vérifier le statut
docker compose ps
```

**Résultat attendu:**
```
NAME                IMAGE                    STATUS         PORTS
secapp-backend      secapp-backend:latest    Up (healthy)   0.0.0.0:8000->8000/tcp
secapp-db           secapp-db:latest         Up (healthy)   0.0.0.0:5432->5432/tcp
secapp-frontend     secapp-frontend:latest   Up (healthy)   0.0.0.0:3000->3000/tcp
```

**Statut:** ✅ Passe si les 3 services sont "Up (healthy)"

---

## 🏥 Tests de santé (Health Checks)

### Test 5: Health Check de la base de données

**Objectif:** Vérifier que PostgreSQL est opérationnel

```bash
# Test 1: Avec pg_isready
docker compose exec db pg_isready -U secapp_user -d secapp

# Résultat attendu
# db:5432 - accepting connections

# Test 2: Connexion directe
docker compose exec db psql -U secapp_user -d secapp -c "SELECT 1;"

# Résultat attendu
#  ?column?
# ----------
#         1
# (1 row)
```

**Statut:** ✅ Passe si les deux commandes réussissent

---

### Test 6: Health Check du backend

**Objectif:** Vérifier que l'API Django répond correctement

```bash
# Test avec curl
curl -v http://localhost:8000/api/healthz/

# Résultat attendu (format JSON)
{
  "status": "healthy",
  "service": "SecApp Backend",
  "version": "1.0.0-phase0"
}

# Test avec httpie (si installé)
http GET http://localhost:8000/api/healthz/

# Vérifier aussi le readiness check
curl -v http://localhost:8000/api/readyz/
```

**Résultat attendu:**
- Status HTTP: `200 OK`
- Content-Type: `application/json`
- Body contient `"status": "healthy"` ou `"status": "ready"`

**Statut:** ✅ Passe si la réponse est 200 avec le JSON correct

---

### Test 7: Health Check du frontend

**Objectif:** Vérifier que Next.js est accessible et affiche la page d'accueil

```bash
# Test avec curl
curl -I http://localhost:3000

# Résultat attendu
# HTTP/1.1 200 OK

# Test complet
curl http://localhost:3000 | grep "It Works"

# Ouvrir dans un navigateur
# http://localhost:3000
```

**Ce que vous devez voir dans le navigateur:**
- ✅ Titre "SecApp - Security Assessment Platform"
- ✅ Message "It Works!" affiché en grand
- ✅ Status "Frontend: Running" en vert
- ✅ Status "Backend: healthy" en vert
- ✅ Aperçu des fonctionnalités à venir

**Statut:** ✅ Passe si la page charge et affiche "It Works!"

---

## 🔗 Tests d'intégration

### Test 8: Communication Frontend ↔ Backend

**Objectif:** Vérifier que le frontend peut appeler le backend

```bash
# Le frontend devrait afficher le statut du backend sur la page d'accueil
# Vérifier dans la console du navigateur (F12)
# Il ne devrait pas y avoir d'erreur CORS

# Test manuel de CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     -v http://localhost:8000/api/healthz/
```

**Résultat attendu:**
- Headers CORS présents dans la réponse
- `Access-Control-Allow-Origin: http://localhost:3000`
- Pas d'erreur CORS dans la console du navigateur

**Statut:** ✅ Passe si CORS fonctionne correctement

---

### Test 9: Backend ↔ Base de données

**Objectif:** Vérifier que Django peut communiquer avec PostgreSQL

```bash
# Exécuter une migration
docker compose exec backend python manage.py migrate

# Résultat attendu
# Operations to perform:
#   Apply all migrations: admin, auth, contenttypes, sessions, users
# Running migrations:
#   ...
#   Applying ... OK

# Vérifier les tables créées
docker compose exec db psql -U secapp_user -d secapp -c "\dt"

# Résultat attendu: liste des tables Django
```

**Statut:** ✅ Passe si les migrations s'appliquent sans erreur

---

## 🔐 Tests d'administration

### Test 10: Accès à l'admin Django

**Objectif:** Vérifier que l'interface d'administration est accessible

```bash
# L'admin devrait être accessible
curl -I http://localhost:8000/admin/

# Résultat attendu
# HTTP/1.1 302 Found (redirection vers login)
```

**Test dans le navigateur:**
1. Ouvrir http://localhost:8000/admin/
2. Vous devriez voir la page de login Django
3. Se connecter avec:
   - Username: `admin`
   - Password: `Admin123!`
4. Vous devriez accéder au panneau d'administration

**Statut:** ✅ Passe si vous pouvez vous connecter à l'admin

---

## 📊 Tests de logs et monitoring

### Test 11: Vérification des logs

**Objectif:** S'assurer que les logs sont générés correctement

```bash
# Voir tous les logs
docker compose logs

# Logs du backend uniquement
docker compose logs backend

# Logs en temps réel
docker compose logs -f backend

# Vérifier qu'il n'y a pas d'erreurs critiques
docker compose logs backend | grep -i error
docker compose logs backend | grep -i exception
```

**Statut:** ✅ Passe si pas d'erreurs critiques dans les logs

---

### Test 12: Health checks Docker

**Objectif:** Vérifier que les health checks Docker fonctionnent

```bash
# Attendre que les services soient "healthy"
docker compose ps

# Tous les services devraient afficher (healthy)
```

**Résultat attendu:**
```
NAME                STATUS
secapp-backend      Up (healthy)
secapp-db           Up (healthy)
secapp-frontend     Up (healthy)
```

**Statut:** ✅ Passe si tous les services sont "healthy"

---

## 🧪 Tests automatisés

### Test 13: Exécution des tests avec le script

**Objectif:** Lancer tous les tests via le script automatisé

```bash
# Exécuter le script de test
./scripts/test.sh
```

**Ce qui devrait être testé:**
- ✅ Backend: Tests unitaires (pytest)
- ✅ Backend: Code quality (flake8)
- ✅ Database: Connection
- ✅ Backend API: Health check
- ✅ Frontend: Accessibility

**Statut:** ✅ Passe si le script termine sans erreur critique

---

## 🚀 Tests CI/CD

### Test 14: Validation du Jenkinsfile

**Objectif:** Vérifier que le pipeline Jenkins est valide

```bash
# Si Jenkins est installé, valider la syntaxe
# Sinon, vérification manuelle du fichier

cat Jenkinsfile

# Vérifier:
# - Pas d'erreur de syntaxe
# - Stages définis correctement
# - Environment variables présentes
```

**Statut:** ✅ Passe si le Jenkinsfile est syntaxiquement correct

---

## 🧹 Tests de nettoyage

### Test 15: Arrêt propre des services

**Objectif:** Vérifier que les services s'arrêtent correctement

```bash
# Arrêter les services
./scripts/stop.sh

# OU
docker compose down

# Vérifier qu'aucun container ne tourne
docker compose ps

# Résultat attendu: aucun service actif
```

**Statut:** ✅ Passe si tous les services sont arrêtés

---

### Test 16: Nettoyage complet

**Objectif:** Nettoyer toutes les ressources Docker

```bash
# Nettoyage complet (ATTENTION: supprime tout)
./scripts/clean.sh

# Vérifier que les ressources sont supprimées
docker images | grep secapp
docker volume ls | grep secapp
docker network ls | grep secapp

# Résultat attendu: rien ne devrait être listé
```

**Statut:** ✅ Passe si toutes les ressources sont supprimées

---

## 📋 Checklist finale Phase 0

Cochez chaque élément après validation:

### Configuration
- [ ] `.env` créé à partir de `.env.example`
- [ ] `docker compose config` sans erreur
- [ ] Tous les fichiers requis présents

### Build & Démarrage
- [ ] Images Docker construites (backend, frontend, db)
- [ ] Services démarrent avec `docker compose up -d`
- [ ] Les 3 services affichent "Up (healthy)"

### Tests de santé
- [ ] Database: `pg_isready` répond OK
- [ ] Backend: `/api/healthz/` retourne 200 + JSON
- [ ] Backend: `/api/readyz/` retourne 200 + checks OK
- [ ] Frontend: http://localhost:3000 affiche "It Works!"

### Intégration
- [ ] Frontend affiche le statut du backend
- [ ] Pas d'erreur CORS
- [ ] Backend peut communiquer avec la DB
- [ ] Migrations Django s'appliquent

### Administration
- [ ] Admin Django accessible sur `/admin/`
- [ ] Login avec `admin` / `Admin123!` fonctionne
- [ ] Interface d'admin s'affiche correctement

### Logs & Monitoring
- [ ] Logs générés sans erreurs critiques
- [ ] Health checks Docker tous "healthy"

### Scripts
- [ ] `./scripts/build.sh` fonctionne
- [ ] `./scripts/start.sh` fonctionne
- [ ] `./scripts/test.sh` fonctionne
- [ ] `./scripts/stop.sh` fonctionne
- [ ] `./scripts/clean.sh` fonctionne

### Documentation
- [ ] README.md complet et à jour
- [ ] Ce guide de tests disponible

---

## 🎯 Résultat final

Si **TOUS** les tests passent, la **Phase 0 est validée** ✅

Vous pouvez alors passer à la **Phase 1 - Authentification**

---

## 🐛 Dépannage

### Problème: Services ne démarrent pas

```bash
# Vérifier les logs
docker compose logs

# Reconstruire les images
docker compose build --no-cache

# Nettoyer et redémarrer
docker compose down -v
docker compose up -d
```

### Problème: Backend ne peut pas se connecter à la DB

```bash
# Vérifier que la DB est prête
docker compose exec db pg_isready

# Vérifier les variables d'environnement
docker compose exec backend env | grep DB_

# Redémarrer le backend
docker compose restart backend
```

### Problème: Frontend affiche des erreurs CORS

```bash
# Vérifier la configuration CORS dans settings.py
docker compose exec backend cat secapp/settings.py | grep CORS

# Vérifier l'URL du backend dans le frontend
docker compose exec frontend env | grep API_URL
```

### Problème: Health checks échouent

```bash
# Attendre plus longtemps (services peuvent prendre du temps)
sleep 60

# Vérifier les health checks manuellement
docker compose exec backend curl http://localhost:8000/api/healthz/
docker compose exec frontend node -e "require('http').get('http://localhost:3000')"
```

---

## 📞 Support

Si vous rencontrez des problèmes non couverts par ce guide:

1. Consulter les logs: `docker compose logs -f`
2. Vérifier les issues GitHub
3. Consulter le README.md
4. Contacter l'équipe de développement

---

**Version:** 1.0.0
**Dernière mise à jour:** 2025-10-22
**Phase:** 0 - Bootstrap