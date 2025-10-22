# SecApp - Security Assessment Platform

[![Phase](https://img.shields.io/badge/Phase-0%20Bootstrap-green)](https://github.com/yourusername/secapp)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

SecApp est une plateforme d'évaluation de sécurité permettant aux chefs de projet de soumettre des questionnaires de sécurité, aux analystes de les valider, et aux business owners de consulter les résultats.

## 🎯 Vue d'ensemble

**Status:** Phase 0 - Bootstrap & Environnement exécutable ✅

### Architecture

- **Frontend:** Next.js 14 + React 18 + TypeScript + TailwindCSS
- **Backend:** Django 5.0 + Django REST Framework + JWT
- **Base de données:** PostgreSQL 16
- **Conteneurisation:** Docker + Docker Compose
- **CI/CD:** Jenkins

### Fonctionnalités actuelles (Phase 0)

- ✅ Infrastructure Docker complète
- ✅ Backend Django avec healthcheck
- ✅ Frontend Next.js avec page d'accueil
- ✅ Base de données PostgreSQL
- ✅ Scripts d'automatisation
- ✅ Pipeline CI/CD de base

### Fonctionnalités à venir

- 🔐 **Phase 1:** Authentification JWT et gestion des rôles
- 📋 **Phase 2:** CRUD Questionnaires
- 📄 **Phase 3:** Questions, réponses et upload de documents
- 🤖 **Phase 4:** Intégration Azure OpenAI
- ✅ **Phase 5:** Validation par analyste
- 📊 **Phase 6:** Consultation des scores (Business Owner)
- 💬 **Phase 7:** Système de messagerie interne
- 📧 **Phase 8:** Notifications emails (Resend)
- 🧪 **Phase 9:** Tests et sécurité
- 📚 **Phase 10:** Documentation et livraison MVP

---

## 🚀 Démarrage rapide

### Prérequis

- Docker 24+ et Docker Compose v2+
- Git
- 4GB RAM minimum
- Ports 3000, 8000, 5432 disponibles

### Installation

1. **Cloner le repository**

```bash
git clone https://github.com/yourusername/secapp.git
cd secapp
```

2. **Configurer les variables d'environnement**

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

3. **Construire les images Docker** (optionnel)

```bash
./scripts/build.sh
```

4. **Démarrer l'application**

```bash
./scripts/start.sh
```

L'application sera accessible sur:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Admin Django:** http://localhost:8000/admin

### Identifiants par défaut

- **Username:** `admin`
- **Password:** `Admin123!`

---

## 📂 Structure du projet

```
SecApp/
├── backend/                    # Application Django
│   ├── secapp/                # Configuration principale
│   │   ├── settings.py        # Settings Django
│   │   ├── urls.py            # URLs principales
│   │   └── wsgi.py            # WSGI application
│   ├── core/                  # App core (healthchecks)
│   ├── users/                 # App utilisateurs (Phase 1+)
│   ├── questionnaires/        # App questionnaires (Phase 2+)
│   ├── requirements.txt       # Dépendances Python
│   ├── Dockerfile             # Image Docker backend
│   └── docker-entrypoint.sh   # Script d'initialisation
│
├── frontend/                   # Application Next.js
│   ├── pages/                 # Pages Next.js
│   │   ├── index.tsx          # Page d'accueil
│   │   ├── _app.tsx           # App wrapper
│   │   └── _document.tsx      # Document HTML
│   ├── components/            # Composants React (Phase 1+)
│   ├── services/              # Services API
│   │   └── api.ts             # Client API centralisé
│   ├── styles/                # Styles globaux
│   ├── package.json           # Dépendances Node
│   └── Dockerfile             # Image Docker frontend
│
├── database/                   # PostgreSQL
│   ├── init/                  # Scripts d'initialisation
│   │   └── 01-init.sql        # Script SQL initial
│   └── Dockerfile             # Image Docker database
│
├── scripts/                    # Scripts d'automatisation
│   ├── build.sh               # Construire les images
│   ├── start.sh               # Démarrer les services
│   ├── stop.sh                # Arrêter les services
│   ├── test.sh                # Lancer les tests
│   └── clean.sh               # Nettoyer les ressources
│
├── docs/                       # Documentation
│   └── PHASE0_TESTS.md        # Guide de tests Phase 0
│
├── docker-compose.yml          # Orchestration Docker
├── .env.example                # Template variables d'env
├── Jenkinsfile                 # Pipeline CI/CD
├── .gitignore                  # Fichiers ignorés
└── README.md                   # Ce fichier
```

---

## 🛠️ Commandes utiles

### Gestion des services

```bash
# Démarrer tous les services
./scripts/start.sh

# Arrêter tous les services
./scripts/stop.sh

# Redémarrer un service spécifique
docker compose restart backend

# Voir les logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Voir le statut des services
docker compose ps
```

### Tests

```bash
# Lancer tous les tests
./scripts/test.sh

# Tests backend uniquement
docker compose exec backend pytest -v

# Tests avec couverture
docker compose exec backend pytest --cov --cov-report=html

# Linting backend
docker compose exec backend flake8 .
```

### Base de données

```bash
# Se connecter à la base de données
docker compose exec db psql -U secapp_user -d secapp

# Créer des migrations
docker compose exec backend python manage.py makemigrations

# Appliquer les migrations
docker compose exec backend python manage.py migrate

# Créer un superuser
docker compose exec backend python manage.py createsuperuser
```

### Développement

```bash
# Mode développement avec hot-reload
docker compose watch

# Accéder au shell Django
docker compose exec backend python manage.py shell

# Accéder au shell Node.js
docker compose exec frontend sh

# Collecter les fichiers statiques
docker compose exec backend python manage.py collectstatic
```

### Nettoyage

```bash
# Nettoyer tout (images, volumes, containers)
./scripts/clean.sh

# Nettoyer uniquement les containers
docker compose down

# Nettoyer containers + volumes
docker compose down -v

# Nettoyer tout + images
docker compose down -v --rmi all
```

---

## 🧪 Tests

Voir le guide détaillé: [docs/PHASE0_TESTS.md](docs/PHASE0_TESTS.md)

### Tests Phase 0

1. **Test de configuration Docker**
   ```bash
   docker compose config
   ```

2. **Test de santé du backend**
   ```bash
   curl http://localhost:8000/api/healthz/
   ```

3. **Test de santé du frontend**
   ```bash
   curl http://localhost:3000
   ```

4. **Test de connexion à la base de données**
   ```bash
   docker compose exec db pg_isready -U secapp_user -d secapp
   ```

---

## 🔒 Sécurité

### Variables d'environnement sensibles

- Générer une clé secrète Django sécurisée:
  ```bash
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```

- Ne JAMAIS commiter le fichier `.env`
- Utiliser des mots de passe forts en production
- Désactiver `DEBUG=False` en production

### Bonnes pratiques

- Les images Docker tournent avec un utilisateur non-root
- CORS configuré strictement
- JWT avec expiration courte (1h)
- Validation stricte des uploads de fichiers
- HTTPS obligatoire en production

---

## 📋 Variables d'environnement

Voir `.env.example` pour la liste complète. Variables principales:

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DJANGO_SECRET_KEY` | Clé secrète Django | `dev-secret-key...` |
| `DEBUG` | Mode debug Django | `True` |
| `DB_NAME` | Nom de la base de données | `secapp` |
| `DB_USER` | Utilisateur PostgreSQL | `secapp_user` |
| `DB_PASSWORD` | Mot de passe PostgreSQL | `secapp_password` |
| `AZURE_OPENAI_KEY` | Clé API Azure OpenAI (Phase 4+) | - |
| `RESEND_API_KEY` | Clé API Resend (Phase 8+) | - |

---

## 🚀 CI/CD

Le pipeline Jenkins (`Jenkinsfile`) exécute automatiquement:

1. ✅ Validation de la configuration
2. 🏗️ Build des images Docker
3. 🧪 Tests unitaires et d'intégration
4. 🧹 Vérifications qualité du code (flake8)
5. 🔒 Scan de sécurité (Trivy)
6. 📦 Push vers le registre Docker (branche main)
7. 🚢 Déploiement staging (branche main)

### Lancer le pipeline localement

```bash
# Simuler les étapes du pipeline
./scripts/build.sh
./scripts/test.sh
```

---

## 🐛 Dépannage

### Problème: Le backend ne démarre pas

```bash
# Vérifier les logs
docker compose logs backend

# Vérifier que la base de données est prête
docker compose exec db pg_isready -U secapp_user

# Redémarrer les services
docker compose restart backend
```

### Problème: Le frontend ne se charge pas

```bash
# Vérifier les logs
docker compose logs frontend

# Reconstruire l'image
docker compose build frontend
docker compose up -d frontend
```

### Problème: Erreur de permissions

```bash
# Sur Linux, donner les bonnes permissions
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

### Problème: Ports déjà utilisés

Éditer `.env` et changer les ports:
```bash
FRONTEND_PORT=3001
BACKEND_PORT=8001
```

---

## 🤝 Contribution

### Workflow Git

1. Créer une branche de feature
   ```bash
   git checkout -b feature/ma-nouvelle-feature
   ```

2. Faire vos modifications et commiter
   ```bash
   git add .
   git commit -m "feat: ajout de ma fonctionnalité"
   ```

3. Pousser et créer une PR
   ```bash
   git push origin feature/ma-nouvelle-feature
   ```

### Standards de code

- **Backend:** Suivre PEP 8 (vérifier avec `flake8`)
- **Frontend:** Suivre les conventions React/TypeScript
- **Commits:** Format conventionnel (`feat:`, `fix:`, `docs:`, etc.)
- **Tests:** Couverture minimale de 80%

---

## 📚 Documentation

- [Guide de tests Phase 0](docs/PHASE0_TESTS.md)
- [Architecture technique](CLAUDE.md)
- [Plan de développement](newplan.md)
- [Documentation API](http://localhost:8000/admin/) (à venir)

---

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE)

---

## 👥 Équipe

- **Développement:** Équipe SecApp
- **Architecture:** [Votre nom]
- **Support:** support@secapp.local

---

## 🎯 Prochaines étapes

### Phase 1 - Authentification (en cours)

- [ ] Modèle User avec rôles
- [ ] Endpoints JWT (login, refresh, logout)
- [ ] Frontend: Page login et AuthContext
- [ ] Protection des routes
- [ ] Tests d'authentification

### Pour contribuer à la Phase 1

1. Consulter le [plan de développement](newplan.md)
2. Créer une branche `feature/phase1-auth`
3. Suivre les spécifications dans `CLAUDE.md`

---

**Version:** 1.0.0-phase0
**Dernière mise à jour:** 2025-10-22
**Status:** ✅ Phase 0 complétée