# Configuration Google OAuth pour SecApp/GuardianIQ

Ce guide vous explique comment configurer l'authentification Google (SSO) pour votre application SecApp/GuardianIQ.

## Modifications apportées

### Backend (Django)
1. **Dépendances ajoutées** ([requirements.txt](backend/requirements.txt)):
   - `django-allauth` - Framework d'authentification sociale
   - `dj-rest-auth[with_social]` - API REST pour allauth
   - `google-auth` - Bibliothèques Google OAuth
   - `google-auth-oauthlib`
   - `google-auth-httplib2`

2. **Configuration Django** ([backend/secapp/settings.py](backend/secapp/settings.py)):
   - Ajout de `django.contrib.sites` et des apps allauth
   - Configuration des backends d'authentification
   - Configuration des providers sociaux (Google)

3. **Nouveaux endpoints** ([backend/users/google_auth.py](backend/users/google_auth.py)):
   - `POST /api/auth/google/login/` - Connexion avec Google
   - `POST /api/auth/google/register/` - Inscription avec Google (avec sélection de rôle)

### Frontend (React)
1. **Dépendances ajoutées** ([frontend/package.json](frontend/package.json)):
   - `@react-oauth/google` - Composants React pour Google OAuth

2. **Modifications de l'interface**:
   - [Login.js](frontend/src/pages/Login.js) - Bouton "Se connecter avec Google"
   - [Register.js](frontend/src/pages/Register.js) - Bouton "S'inscrire avec Google"
   - Styles CSS mis à jour pour les deux pages

3. **Services** ([frontend/src/services/authService.js](frontend/src/services/authService.js)):
   - Nouvelles méthodes `googleLogin()` et `googleRegister()`

## Étapes de configuration

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API "Google+ API" (ou "Google Identity Services")

### 2. Créer des identifiants OAuth 2.0

1. Dans la console Google Cloud, allez dans **APIs & Services** > **Credentials**
2. Cliquez sur **Create Credentials** > **OAuth 2.0 Client ID**
3. Configurez l'écran de consentement OAuth si ce n'est pas déjà fait:
   - Type d'application: **External** (ou Internal si vous avez un Google Workspace)
   - Remplissez les informations requises
   - Ajoutez les scopes: `email`, `profile`, `openid`

4. Créez l'identifiant OAuth 2.0:
   - Type d'application: **Web application**
   - Nom: `SecApp` (ou le nom de votre choix)
   - **Authorized JavaScript origins**:
     - `http://localhost:3333` (développement)
     - Votre URL de production si applicable
   - **Authorized redirect URIs**:
     - `http://localhost:3333` (développement)
     - `http://localhost:3333/login`
     - `http://localhost:3333/register`
     - Vos URLs de production si applicable

5. Récupérez votre **Client ID** et **Client Secret**

### 3. Configurer les variables d'environnement

#### Backend (.env)
Modifiez le fichier `.env` à la racine du projet:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=votre-client-id-google.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-client-secret-google
```

#### Frontend (frontend/.env)
Modifiez le fichier `frontend/.env`:

```bash
REACT_APP_GOOGLE_CLIENT_ID=votre-client-id-google.apps.googleusercontent.com
```

**Important**: Le Client ID doit être le même dans les deux fichiers!

### 4. Installer les dépendances

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

### 5. Appliquer les migrations Django

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### 6. Lancer l'application

Utilisez Docker Compose comme d'habitude:
```bash
docker-compose up --build
```

Ou lancez manuellement:

**Backend**:
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

**Frontend**:
```bash
cd frontend
npm start
```

## Utilisation

### Connexion avec Google

1. Sur la page de connexion, cliquez sur le bouton **"Se connecter avec Google"**
2. Sélectionnez votre compte Google
3. Autorisez l'application
4. Vous serez automatiquement connecté et redirigé vers le dashboard

**Note**: Si c'est votre première connexion avec ce compte Google, un utilisateur sera créé automatiquement avec le rôle `CHEF_PROJET` par défaut.

### Inscription avec Google

1. Sur la page d'inscription, sélectionnez d'abord votre rôle (Chef de Projet, Analyste, Business Owner)
2. Cliquez sur le bouton **"S'inscrire avec Google"**
3. Sélectionnez votre compte Google
4. Autorisez l'application
5. Votre compte sera créé avec le rôle sélectionné et vous serez automatiquement connecté

## Architecture technique

### Flow d'authentification Google

1. **Frontend**: L'utilisateur clique sur le bouton Google
2. **Google**: Popup d'authentification Google
3. **Frontend**: Réception du token Google (JWT credential)
4. **Frontend → Backend**: Envoi du token à `/api/auth/google/login/` ou `/api/auth/google/register/`
5. **Backend**: Vérification du token Google auprès des serveurs Google
6. **Backend**: Création/récupération de l'utilisateur dans la base de données
7. **Backend → Frontend**: Retour des tokens JWT (access + refresh) de l'application
8. **Frontend**: Stockage des tokens et redirection vers le dashboard

### Endpoints API

#### POST /api/auth/google/login/
Authentifie un utilisateur avec Google. Si l'utilisateur n'existe pas, il est créé automatiquement.

**Request**:
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU5M..."
}
```

**Response**:
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "CHEF_PROJET",
    "first_name": "John",
    "last_name": "Doe"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "created": false,
  "message": "Connexion réussie"
}
```

#### POST /api/auth/google/register/
Crée un nouvel utilisateur avec Google et un rôle spécifique.

**Request**:
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU5M...",
  "role": "ANALYSTE"
}
```

**Response**:
```json
{
  "user": {
    "id": 2,
    "username": "jane_smith",
    "email": "jane@example.com",
    "role": "ANALYSTE",
    "first_name": "Jane",
    "last_name": "Smith"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "message": "Compte créé avec succès"
}
```

## Sécurité

- Les tokens Google sont vérifiés côté backend auprès des serveurs Google
- Les tokens JWT de l'application sont générés uniquement après vérification réussie
- Les informations sensibles (Client Secret) ne sont jamais exposées au frontend
- Les tokens ont une durée de vie limitée (1h pour access, 7 jours pour refresh)

## Limitations et notes

- Un email ne peut être associé qu'à un seul compte
- Les utilisateurs créés via Google n'ont pas de mot de passe (authentification uniquement via Google)
- Le rôle `ADMIN` ne peut pas être sélectionné lors de l'inscription Google (pour des raisons de sécurité)
- One Tap Login est activé sur la page de connexion (connexion automatique si déjà connecté à Google)

## Troubleshooting

### Erreur "Token invalide"
- Vérifiez que le `GOOGLE_CLIENT_ID` est correct dans les deux fichiers .env
- Vérifiez que les URLs autorisées sont correctes dans Google Cloud Console

### Erreur "Configuration Google OAuth manquante"
- Assurez-vous que les variables `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont définies dans le fichier `.env` du backend

### Le bouton Google ne s'affiche pas
- Vérifiez que `REACT_APP_GOOGLE_CLIENT_ID` est défini dans `frontend/.env`
- Redémarrez le serveur de développement frontend après modification du .env

### Erreur CORS
- Ajoutez votre URL frontend dans la liste `CORS_ALLOWED_ORIGINS` de `backend/secapp/settings.py`

## Support

Pour toute question ou problème, consultez la documentation:
- [Google Identity Platform](https://developers.google.com/identity)
- [Django Allauth](https://django-allauth.readthedocs.io/)
- [@react-oauth/google](https://github.com/MomenSherif/react-oauth)
