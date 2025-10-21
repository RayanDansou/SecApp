# SecApp - Plateforme de Gestion de Questionnaires de Sécurité

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

## Description

**SecApp** est une plateforme web complète permettant aux chefs de projet de soumettre des questionnaires de sécurité, aux analystes de les valider, et aux business owners de consulter les résultats et recommandations générées par IA.

### Fonctionnalités principales

- Gestion des questionnaires de sécurité avec workflow de validation
- Upload et gestion de documents d'architecture technique
- Génération automatique de recommandations de sécurité via Azure OpenAI
- Scoring CIA (Confidentialité, Intégrité, Disponibilité)
- Système de messagerie intégré entre les différents acteurs
- Notifications automatiques par email via Resend
- Traçabilité complète avec logs d'audit
- Gestion des utilisateurs avec 4 rôles : Admin, Chef de projet, Analyste, Business Owner

## Architecture

### Stack Technique

**Backend**
- Django 5.0 + Django REST Framework
- PostgreSQL 16
- Azure OpenAI (GPT-4o-mini)
- Resend (notifications email)

**Frontend**
- Next.js 14 (React 18)
- TailwindCSS
- TypeScript

**Infrastructure**
- Docker & Docker Compose
- Jenkins (CI/CD)
- Gunicorn (WSGI server)

### Structure du projet

```
secapp/
│
├── backend/                    # Application Django
│   ├── Dockerfile
│   ├── manage.py
│   ├── requirements.txt
│   ├── secapp/                # Configuration Django
│   ├── questionnaires/        # App questionnaires
│   └── users/                 # App utilisateurs
│
├── frontend/                   # Application Next.js
│   ├── Dockerfile
│   ├── package.json
│   ├── pages/                 # Pages Next.js
│   ├── components/            # Composants React
│   ├── services/              # Services API
│   └── styles/                # Styles CSS
│
├── database/                   # Configuration PostgreSQL
│
├── docker-compose.yml         # Orchestration des services
├── Jenkinsfile               # Pipeline CI/CD
├── .env.example              # Template variables d'environnement
│
├── build.sh                  # Script de build
├── start.sh                  # Script de démarrage
├── test.sh                   # Script de tests
└── stop.sh                   # Script d'arrêt
```

## Prérequis

- **Docker** >= 24.0
- **Docker Compose** >= 2.20
- **Git**
- **Bash** (pour les scripts shell)

### Optionnel (pour développement local)
- Python 3.11+
- Node.js 20+
- PostgreSQL 16+

## Installation

### 1. Cloner le repository

```bash
git clone <repository-url>
cd SecApp
```

### 2. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env et renseigner vos valeurs
nano .env  # ou vim, code, etc.
```

### Variables d'environnement importantes à configurer :

```bash
# Django
DJANGO_SECRET_KEY=votre-cle-secrete-django

# Base de données
POSTGRES_PASSWORD=votre-mot-de-passe-securise

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://votre-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=votre-cle-api-azure

# Resend (emails)
RESEND_API_KEY=re_votre_cle_resend
RESEND_FROM_EMAIL=SecApp <noreply@votredomaine.com>
```

### 3. Générer une clé secrète Django

```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## Démarrage rapide

### Utilisation des scripts shell (recommandé)

```bash
# 1. Rendre les scripts exécutables (une seule fois)
chmod +x build.sh start.sh test.sh stop.sh

# 2. Builder les images Docker
./build.sh

# 3. Démarrer l'application
./start.sh

# 4. Exécuter les tests
./test.sh
```

### Ou avec Docker Compose directement

```bash
# Build des images
docker-compose build

# Démarrage des services
docker-compose up -d

# Vérifier l'état des services
docker-compose ps

# Voir les logs
docker-compose logs -f
```

## Accès à l'application

Une fois l'application démarrée :

- **Frontend (UI)** : http://localhost:3000
- **Backend (API)** : http://localhost:8000
- **Admin Django** : http://localhost:8000/admin
- **API Documentation** : http://localhost:8000/api/docs/
- **Database** : localhost:5432

## Commandes utiles

### Gestion des services

```bash
# Démarrer
./start.sh
# ou
docker-compose up -d

# Arrêter
./stop.sh
# ou
docker-compose down

# Redémarrer
docker-compose restart

# Voir les logs
docker-compose logs -f [service]
# Exemples:
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Backend Django

```bash
# Accéder au shell Django
docker exec -it secapp-backend python manage.py shell

# Créer un superutilisateur
docker exec -it secapp-backend python manage.py createsuperuser

# Appliquer les migrations
docker exec -it secapp-backend python manage.py migrate

# Créer de nouvelles migrations
docker exec -it secapp-backend python manage.py makemigrations

# Collecter les fichiers statiques
docker exec -it secapp-backend python manage.py collectstatic

# Lancer les tests
docker exec -it secapp-backend python manage.py test

# Accéder au shell bash du conteneur
docker exec -it secapp-backend bash
```

### Frontend Next.js

```bash
# Accéder au shell bash du conteneur
docker exec -it secapp-frontend sh

# Installer une nouvelle dépendance
docker exec -it secapp-frontend npm install <package-name>

# Lancer les tests
docker exec -it secapp-frontend npm test

# Build de production
docker exec -it secapp-frontend npm run build
```

### Base de données

```bash
# Accéder au shell PostgreSQL
docker exec -it secapp-database psql -U secapp_user -d secapp

# Backup de la base de données
docker exec secapp-database pg_dump -U secapp_user secapp > backup.sql

# Restaurer une base de données
docker exec -i secapp-database psql -U secapp_user -d secapp < backup.sql

# Voir les tables
docker exec -it secapp-database psql -U secapp_user -d secapp -c "\dt"
```

## Tests

### Exécuter tous les tests

```bash
./test.sh
```

### Tests Backend uniquement

```bash
docker exec secapp-backend python manage.py test --verbosity=2
```

### Tests Frontend uniquement

```bash
docker exec secapp-frontend npm test
```

### Coverage des tests

```bash
# Backend
docker exec secapp-backend coverage run --source='.' manage.py test
docker exec secapp-backend coverage report
docker exec secapp-backend coverage html

# Frontend
docker exec secapp-frontend npm run test:coverage
```

## API Endpoints

### Authentification

- `POST /api/auth/login/` - Connexion (retourne JWT)
- `POST /api/auth/logout/` - Déconnexion
- `POST /api/auth/refresh/` - Rafraîchir le token

### Questionnaires

- `GET /api/questionnaires/` - Liste des questionnaires
- `POST /api/questionnaires/` - Créer un questionnaire
- `GET /api/questionnaires/{id}/` - Détails d'un questionnaire
- `POST /api/questionnaires/{id}/submit/` - Soumettre un questionnaire
- `POST /api/questionnaires/{id}/validate/` - Valider/Rejeter (Analyste)
- `GET /api/questionnaires/{id}/score/` - Récupérer les scores CIA

### Documents

- `POST /api/questionnaires/{id}/documents/` - Uploader un document
- `GET /api/questionnaires/{id}/documents/` - Liste des documents
- `GET /api/documents/{id}/download/` - Télécharger un document

### Messages

- `GET /api/questionnaires/{id}/messages/` - Liste des messages
- `POST /api/questionnaires/{id}/messages/` - Envoyer un message

### Questions

- `GET /api/questionnaires/{id}/questions/` - Liste des questions
- `POST /api/questionnaires/{id}/questions/` - Ajouter une question

Pour plus de détails, consultez la documentation Swagger à http://localhost:8000/api/docs/

## Workflow de l'application

### 1. Chef de projet
1. Se connecte à l'application
2. Crée un nouveau questionnaire
3. Remplit les questions de sécurité
4. Upload un document d'architecture (PDF, DOCX)
5. Soumet le questionnaire

### 2. Analyste sécurité
1. Reçoit une notification email
2. Consulte le questionnaire et les documents
3. Examine les recommandations IA initiales
4. Valide ou rejette le questionnaire avec commentaires
5. Le système génère le scoring final si validé

### 3. Business Owner
1. Consulte les questionnaires validés
2. Visualise les scores CIA (Confidentialité, Intégrité, Disponibilité)
3. Lit les recommandations finales
4. Peut envoyer des commentaires à l'analyste

## Développement

### Mode développement

Pour le développement local sans Docker :

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Ajouter une nouvelle dépendance

#### Backend

```bash
# Dans le conteneur
docker exec -it secapp-backend pip install <package-name>

# Puis mettre à jour requirements.txt
docker exec -it secapp-backend pip freeze > requirements.txt
```

#### Frontend

```bash
# Dans le conteneur
docker exec -it secapp-frontend npm install <package-name>

# Le package.json sera automatiquement mis à jour
```

## CI/CD avec Jenkins

Le projet inclut un `Jenkinsfile` configuré pour :

1. **Build** - Construction des images Docker
2. **Tests** - Exécution des tests unitaires
3. **Lint** - Analyse statique du code
4. **Security Scan** - Scan de vulnérabilités
5. **Push** - Publication des images vers le registre
6. **Deploy** - Déploiement automatique

### Configuration Jenkins

1. Créer un nouveau pipeline dans Jenkins
2. Pointer vers ce repository Git
3. Configurer les credentials nécessaires :
   - `django-secret-key`
   - `postgres-password`
   - `azure-openai-key`
   - `resend-api-key`
   - `docker-hub-credentials`

## Sécurité

### Bonnes pratiques implémentées

- Authentification JWT avec refresh tokens
- Permissions basées sur les rôles (RBAC)
- Validation stricte des uploads de fichiers
- Chiffrement HTTPS (en production)
- CORS configuré de manière restrictive
- Protection CSRF
- Logs d'audit complets
- Variables d'environnement pour les secrets
- Scanning de sécurité dans le pipeline CI/CD

### Checklist avant la production

- [ ] Changer `DJANGO_DEBUG=False`
- [ ] Générer une nouvelle `DJANGO_SECRET_KEY`
- [ ] Configurer des mots de passe forts pour PostgreSQL
- [ ] Activer HTTPS (`DJANGO_SECURE_SSL_REDIRECT=True`)
- [ ] Configurer les cookies sécurisés
- [ ] Restreindre `DJANGO_ALLOWED_HOSTS`
- [ ] Configurer les CORS de manière stricte
- [ ] Mettre en place des backups automatiques
- [ ] Configurer la rotation des logs
- [ ] Activer le rate limiting
- [ ] Scanner les vulnérabilités avec Trivy

## Troubleshooting

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Vérifier l'état
docker-compose ps

# Recréer les conteneurs
docker-compose down -v
docker-compose up -d --build
```

### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est bien démarré
docker-compose ps database

# Vérifier les variables d'environnement
docker exec secapp-backend env | grep DATABASE

# Recréer la base de données
docker-compose down -v
docker-compose up -d database
```

### Problèmes de permissions

```bash
# Sur Linux, ajuster les permissions
sudo chown -R $USER:$USER .

# Reconstruire les images
./build.sh
```

### Les migrations ne s'appliquent pas

```bash
# Supprimer les migrations
docker exec secapp-backend find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
docker exec secapp-backend find . -path "*/migrations/*.pyc" -delete

# Recréer les migrations
docker exec secapp-backend python manage.py makemigrations
docker exec secapp-backend python manage.py migrate
```

## Contribution

1. Forker le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commiter les changements (`git commit -m 'Add AmazingFeature'`)
4. Pousser vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Support

Pour toute question ou problème :

- Ouvrir une issue sur GitHub
- Consulter la documentation technique dans `CLAUDE.md`
- Consulter le plan de développement dans `PLAN.md`

## Auteurs

Développé dans le cadre du Master Cybersécurité - MIKS

---

**SecApp** - Plateforme de Gestion de Questionnaires de Sécurité
