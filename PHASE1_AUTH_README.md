# Phase 1 : Authentification et Gestion des Utilisateurs

## Vue d'ensemble

Cette phase implémente le système d'authentification complet pour SecApp avec :
- Modèle utilisateur personnalisé avec 4 rôles (CHEF_PROJET, ANALYSTE, BUSINESS_OWNER, ADMIN)
- Authentification JWT avec access et refresh tokens
- Endpoints d'authentification sécurisés
- Interface frontend React avec protection des routes
- Tests unitaires complets

## Structure des fichiers créés

### Backend

```
backend/
├── users/                          # Application Django pour la gestion des utilisateurs
│   ├── models.py                   # Modèle User personnalisé avec rôles
│   ├── serializers.py              # Serializers pour API (User, Login, Register, etc.)
│   ├── views.py                    # Views pour les endpoints d'authentification
│   ├── urls.py                     # URLs de l'app users
│   ├── admin.py                    # Configuration admin Django
│   └── tests.py                    # Tests unitaires complets
├── secapp/
│   ├── settings.py                 # Configuration Django (JWT, CORS, DB, etc.)
│   └── urls.py                     # URLs principales du projet
└── requirements.txt                # Dépendances Python mises à jour
```

### Frontend

```
frontend/
├── src/
│   ├── services/
│   │   ├── api.js                  # Configuration axios avec intercepteurs JWT
│   │   └── authService.js          # Service d'authentification
│   ├── contexts/
│   │   └── AuthContext.js          # Contexte React pour gestion auth globale
│   ├── components/
│   │   └── ProtectedRoute.js       # Composant pour protéger les routes
│   ├── pages/
│   │   ├── Login.js                # Page de connexion
│   │   ├── Login.css               # Styles de la page login
│   │   ├── Dashboard.js            # Page dashboard (protégée)
│   │   └── Dashboard.css           # Styles du dashboard
│   └── App.js                      # Configuration des routes
├── .env                            # Variables d'environnement
└── package.json                    # Dépendances npm (axios, react-router-dom)
```

## Endpoints API créés

### Authentification

#### POST `/api/auth/login/`
Connexion utilisateur - Retourne JWT tokens

**Request:**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "CHEF_PROJET",
    "first_name": "Test",
    "last_name": "User"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJ...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJ..."
  }
}
```

**Erreurs:**
- 401: Identifiants invalides
- 403: Compte désactivé

#### POST `/api/auth/logout/`
Déconnexion - Blacklist le refresh token

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJ..."
}
```

**Response (200 OK):**
```json
{
  "message": "Déconnexion réussie"
}
```

#### POST `/api/auth/register/`
Inscription d'un nouvel utilisateur

**Request:**
```json
{
  "username": "newuser",
  "email": "new@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "role": "CHEF_PROJET",
  "first_name": "New",
  "last_name": "User"
}
```

**Response (201 CREATED):**
```json
{
  "user": { ... },
  "tokens": { ... },
  "message": "Utilisateur créé avec succès"
}
```

#### POST `/api/auth/refresh/`
Rafraîchissement du access token

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJ..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJ..."
}
```

### Gestion du profil

#### GET `/api/auth/profile/`
Récupération du profil utilisateur

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "role": "CHEF_PROJET",
  "first_name": "Test",
  "last_name": "User",
  "date_joined": "2025-10-25T10:00:00Z",
  "is_active": true
}
```

#### PUT/PATCH `/api/auth/profile/`
Mise à jour du profil

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "first_name": "Updated",
  "last_name": "Name"
}
```

#### POST `/api/auth/change-password/`
Changement de mot de passe

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "old_password": "OldPass123!",
  "new_password": "NewPass123!",
  "new_password2": "NewPass123!"
}
```

## Configuration

### Backend (.env)

```bash
# Django
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=secapp
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
```

### Frontend (.env)

```bash
REACT_APP_API_URL=http://localhost:8000
```

## Installation et lancement

### Backend

```bash
cd backend

# Installer les dépendances
pip install -r requirements.txt

# Appliquer les migrations
python manage.py makemigrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start
```

Le frontend sera accessible sur `http://localhost:3000`
Le backend sera accessible sur `http://localhost:8000`

## Tests

### Backend

```bash
cd backend

# Lancer tous les tests
python manage.py test

# Lancer uniquement les tests de l'app users
python manage.py test users

# Avec verbose mode
python manage.py test users --verbosity=2
```

**Tests couverts :**
- Création et gestion du modèle User
- Login avec identifiants valides/invalides
- Registration avec validation
- Protection des routes avec JWT
- Refresh token
- Logout avec blacklist
- Mise à jour du profil

### Résultats attendus
Tous les tests doivent passer (✓)

## Fonctionnalités Frontend

### AuthContext

Le contexte d'authentification fournit :
- `user` : Objet utilisateur courant
- `isAuthenticated` : Statut de connexion
- `login(username, password)` : Fonction de connexion
- `logout()` : Fonction de déconnexion
- `register(userData)` : Fonction d'inscription
- `updateProfile(data)` : Mise à jour du profil
- `hasRole(role)` : Vérification de rôle
- `hasAnyRole([roles])` : Vérification multiple de rôles

### ProtectedRoute

Composant pour protéger les routes nécessitant une authentification.

**Usage :**
```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Avec vérification de rôle
<ProtectedRoute allowedRoles={['ANALYSTE', 'ADMIN']}>
  <ValidationPage />
</ProtectedRoute>
```

### Gestion automatique des tokens

L'intercepteur axios gère automatiquement :
- Ajout du token JWT dans les headers
- Rafraîchissement automatique du token expiré
- Redirection vers login si session invalide

## Rôles utilisateurs

| Rôle | Description |
|------|-------------|
| CHEF_PROJET | Peut créer et gérer des questionnaires |
| ANALYSTE | Peut valider/rejeter les questionnaires |
| BUSINESS_OWNER | Peut consulter les rapports et questionnaires validés |
| ADMIN | Accès complet à toutes les fonctionnalités |

## Sécurité

### Backend
- Mots de passe hashés avec Django (PBKDF2)
- JWT avec durée de vie limitée (1h pour access, 7j pour refresh)
- Rotation automatique des refresh tokens
- Blacklist des tokens à la déconnexion
- CORS configuré pour localhost:3000
- HTTPS recommandé en production

### Frontend
- Tokens stockés dans localStorage
- Refresh automatique avant expiration
- Nettoyage complet à la déconnexion
- Routes protégées par authentification
- Validation côté client

## Prochaines étapes

Phase 2 : Gestion des questionnaires
- Modèles Questionnaire, Question, Document
- Endpoints CRUD pour questionnaires
- Workflow de validation
- Interface de création/édition

Phase 3 : Intégration Azure OpenAI
- Scoring automatique
- Génération de recommandations
- Analyse des documents uploadés

Phase 4 : Communication et notifications
- Intégration Resend pour emails
- Système de messagerie interne
- Notifications en temps réel

## Troubleshooting

### Erreur 401 sur les routes protégées
- Vérifier que le token est valide
- Vérifier l'expiration du token
- Vérifier le format du header: `Bearer <token>`

### CORS errors
- Vérifier CORS_ALLOWED_ORIGINS dans settings.py
- S'assurer que le frontend tourne sur http://localhost:3000

### Tests échouent
- Vérifier que la base de données de test peut être créée
- S'assurer que tous les fichiers de migrations sont à jour
- Utiliser `--verbosity=2` pour plus de détails

## Documentation API complète

L'API peut être testée avec :
- Postman (collection disponible sur demande)
- curl
- Interface admin Django : `http://localhost:8000/admin`

## Support

Pour toute question ou problème, consulter :
- [CLAUDE.md](CLAUDE.md) - Architecture complète
- [newplan.md](newplan.md) - Plan de développement
- Tests unitaires - Exemples d'utilisation de l'API
