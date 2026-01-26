# Guide de démarrage rapide - Phase 1 Authentication

## Prérequis

- Python 3.8+
- Node.js 14+
- PostgreSQL (ou utiliser Docker)
- pip et npm

## Étape 1 : Backend Django

```bash
# Naviguer vers le backend
cd backend

# Installer les dépendances Python
pip install -r requirements.txt

# Appliquer les migrations
python manage.py makemigrations
python manage.py migrate

# Créer un superutilisateur (admin)
python manage.py createsuperuser
# Suivez les instructions pour créer username, email, password

# Lancer le serveur de développement
python manage.py runserver
```

Le backend sera accessible sur **http://localhost:8000**

## Étape 2 : Frontend React

**Ouvrir un nouveau terminal**

```bash
# Naviguer vers le frontend
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start
```

Le frontend s'ouvrira automatiquement sur **http://localhost:3000**

## Étape 3 : Tester l'application

### Créer un utilisateur de test via l'API

**Option 1 : Via l'admin Django**
1. Aller sur http://localhost:8000/admin
2. Se connecter avec le superutilisateur créé
3. Créer un nouvel utilisateur avec un rôle

**Option 2 : Via l'endpoint d'inscription**
Utiliser Postman ou curl :

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "chefprojet1",
    "email": "chef@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "role": "CHEF_PROJET",
    "first_name": "Chef",
    "last_name": "Projet"
  }'
```

### Se connecter sur le frontend

1. Aller sur http://localhost:3000
2. Vous serez redirigé vers /login
3. Entrer le username et password
4. Vous serez redirigé vers le Dashboard

## Étape 4 : Lancer les tests

```bash
# Dans le terminal backend
cd backend
python manage.py test users --verbosity=2
```

Tous les tests devraient passer ✓

## Endpoints API disponibles

| Méthode | URL | Description | Auth requise |
|---------|-----|-------------|--------------|
| POST | /api/auth/login/ | Connexion | Non |
| POST | /api/auth/logout/ | Déconnexion | Oui |
| POST | /api/auth/register/ | Inscription | Non |
| POST | /api/auth/refresh/ | Refresh token | Non |
| GET | /api/auth/profile/ | Voir profil | Oui |
| PUT/PATCH | /api/auth/profile/ | Modifier profil | Oui |
| POST | /api/auth/change-password/ | Changer mot de passe | Oui |

## Tester l'API avec curl

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "chefprojet1", "password": "SecurePass123!"}'
```

Sauvegarder le token access retourné.

### Accéder au profil
```bash
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer <VOTRE_ACCESS_TOKEN>"
```

## Rôles disponibles

- **CHEF_PROJET** : Chef de projet
- **ANALYSTE** : Analyste sécurité
- **BUSINESS_OWNER** : Business owner
- **ADMIN** : Administrateur

## Troubleshooting

### Le backend ne démarre pas
- Vérifier que PostgreSQL est bien lancé
- Vérifier les variables dans `.env`
- Essayer de supprimer `db.sqlite3` si présent

### Le frontend affiche "Network Error"
- Vérifier que le backend tourne sur port 8000
- Vérifier CORS dans `backend/secapp/settings.py`
- Vérifier le fichier `frontend/.env`

### Tests échouent
- S'assurer d'avoir appliqué toutes les migrations
- Vérifier que l'app 'users' est dans INSTALLED_APPS

### Token expiré
- Le access token expire après 1h
- Le refresh token expire après 7 jours
- Le frontend rafraîchit automatiquement

## Prochaine étape

Consulter [PHASE1_AUTH_README.md](PHASE1_AUTH_README.md) pour la documentation complète.

Phase 2 : Implémentation des questionnaires de sécurité.
