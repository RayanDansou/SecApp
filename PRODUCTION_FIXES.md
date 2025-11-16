# 🔧 Production Fixes - GuardianIQ

## ✅ Fix 1: Gunicorn manquant

### Problème
```
sh: 5: gunicorn: not found
```

### Cause
Gunicorn n'était pas dans `requirements.txt`

### Solution appliquée
Ajout de `gunicorn` dans [backend/requirements.txt](backend/requirements.txt)

### Actions à faire

#### Option 1: Rebuild via Jenkins (recommandé)
```bash
git add backend/requirements.txt
git commit -m "feat: Add gunicorn for production server"
git push
```
→ Jenkins va rebuild automatiquement

#### Option 2: Rebuild local et push
```bash
cd backend
docker build -t rayandans/guardianiq:backend-latest .
docker push rayandans/guardianiq:backend-latest

# Puis redéployer
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d backend
```

---

## ⚠️ Fix 2: Warnings django-allauth (optionnel)

### Problème
```
WARNINGS:
?: settings.ACCOUNT_AUTHENTICATION_METHOD is deprecated
?: settings.ACCOUNT_EMAIL_REQUIRED is deprecated
?: settings.ACCOUNT_USERNAME_REQUIRED is deprecated
```

### Cause
Vous utilisez une ancienne syntaxe django-allauth

### Solution (à appliquer dans backend/secapp/settings.py)

#### Remplacer:
```python
# ❌ Ancienne syntaxe (dépréciée)
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
```

#### Par:
```python
# ✅ Nouvelle syntaxe (django-allauth 0.50+)
ACCOUNT_LOGIN_METHODS = {'email'}  # Utiliser email pour login
ACCOUNT_SIGNUP_FIELDS = [
    'email*',      # * = requis
    'password1*',
    'password2*',
]
```

### Fichier complet à modifier

```python
# backend/secapp/settings.py

# Django-allauth Configuration
ACCOUNT_LOGIN_METHODS = {'email'}  # Méthode de login
ACCOUNT_SIGNUP_FIELDS = [          # Champs signup
    'email*',
    'password1*',
    'password2*',
]
ACCOUNT_EMAIL_VERIFICATION = 'optional'  # ou 'mandatory'
ACCOUNT_UNIQUE_EMAIL = True

# Social Auth (Google)
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
    }
}
```

---

## 🚀 Checklist Déploiement Production

### Avant le déploiement

- [x] Gunicorn ajouté dans requirements.txt
- [ ] Warnings django-allauth corrigés (optionnel)
- [ ] Variables d'env configurées (`.env`)
- [ ] Secrets sécurisés (pas de valeurs par défaut)
- [ ] DEBUG=False en production
- [ ] ALLOWED_HOSTS configuré
- [ ] CORS_ALLOWED_ORIGINS configuré

### Configuration Docker

- [x] Pas de volumes pour code source en prod
- [x] Healthchecks configurés
- [x] Restart policies configurés
- [x] Networks séparés
- [x] Volumes pour données persistantes

### Pipeline Jenkins

- [x] Credentials Docker Hub configurés
- [x] Build backend + frontend
- [x] Push vers Docker Hub
- [x] Deploy automatique
- [ ] Tests automatisés (à améliorer)
- [ ] Security scans (optionnel)

---

## 🐛 Troubleshooting

### Backend ne démarre pas

```bash
# Vérifier les logs
docker logs guardianiq-backend-prod

# Problèmes fréquents:
# 1. Gunicorn manquant → Ajouter dans requirements.txt
# 2. DB pas prête → Attendre healthcheck
# 3. Migrations non appliquées → Ajouté dans command
# 4. .env manquant → Copier depuis .env.jenkins
```

### Frontend ne démarre pas

```bash
# Vérifier les logs
docker logs guardianiq-frontend-prod

# Problèmes fréquents:
# 1. package.json manquant → Retirer volumes en prod
# 2. node_modules écrasés → Retirer volumes en prod
# 3. Port déjà utilisé → Changer le port mapping
```

### Database connection refused

```bash
# Vérifier que la DB tourne
docker ps | grep guardianiq-db-prod

# Vérifier le healthcheck
docker inspect guardianiq-db-prod | grep -A 10 Health

# Redémarrer la DB
docker-compose -f docker-compose.prod.yml restart db
```

---

## 📊 Configuration recommandée settings.py

### Development (settings.py)
```python
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
CORS_ALLOW_ALL_ORIGINS = True  # Seulement en dev!

# Utiliser runserver
# python manage.py runserver 0.0.0.0:8000
```

### Production (settings.py + .env)
```python
DEBUG = False  # CRITIQUE!
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')

# Utiliser gunicorn
# gunicorn secapp.wsgi:application --bind 0.0.0.0:8000 --workers 3

# Security headers
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# HSTS (après avoir confirmé que HTTPS fonctionne)
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

---

## 🔒 Variables d'environnement Production

### .env (à ne JAMAIS commiter!)

```bash
# Django
DJANGO_SECRET_KEY=<générer-avec-get_random_secret_key>
DEBUG=False
ALLOWED_HOSTS=guardianiq.cloud,api.guardianiq.cloud
CORS_ALLOWED_ORIGINS=https://guardianiq.cloud

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<mot-de-passe-fort>
POSTGRES_DB=guardianiq_db
DB_HOST=db
DB_PORT=5432

# Azure OpenAI
AZURE_OPENAI_KEY=<votre-clé>
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
AZURE_OPENAI_MODEL=gpt-4o-mini

# Resend
RESEND_API_KEY=<votre-clé>
RESEND_FROM_EMAIL=noreply@guardianiq.cloud

# Google OAuth
GOOGLE_CLIENT_ID=<votre-client-id>
GOOGLE_CLIENT_SECRET=<votre-secret>

# URLs
FRONTEND_URL=https://guardianiq.cloud
REACT_APP_API_URL=https://api.guardianiq.cloud
```

### Générer des secrets sécurisés

```bash
# Django Secret Key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Postgres Password
openssl rand -base64 32

# JWT Secret
openssl rand -hex 32
```

---

## 🎯 Commandes utiles

### Rebuild une seule image

```bash
# Backend
docker build -t rayandans/guardianiq:backend-latest ./backend
docker push rayandans/guardianiq:backend-latest

# Frontend
docker build -t rayandans/guardianiq:frontend-latest ./frontend
docker push rayandans/guardianiq:frontend-latest
```

### Redémarrer un seul service

```bash
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart frontend
docker-compose -f docker-compose.prod.yml restart db
```

### Appliquer les migrations manuellement

```bash
docker exec guardianiq-backend-prod python manage.py migrate
docker exec guardianiq-backend-prod python manage.py makemigrations
```

### Créer un superuser

```bash
docker exec -it guardianiq-backend-prod python manage.py createsuperuser
```

### Collecter les fichiers statiques

```bash
docker exec guardianiq-backend-prod python manage.py collectstatic --noinput
```

### Vider les logs

```bash
docker logs guardianiq-backend-prod --tail 100
docker logs guardianiq-frontend-prod --tail 100
docker logs guardianiq-db-prod --tail 100
```

---

## 📈 Monitoring

### Health checks

```bash
# Backend
curl http://localhost:8888/api/

# Frontend
curl http://localhost:3333/

# Database
docker exec guardianiq-db-prod pg_isready -U postgres
```

### Resource usage

```bash
# Voir la consommation
docker stats

# Voir les conteneurs qui tournent
docker ps --filter "name=guardianiq"
```

---

**Dernière mise à jour:** 2025-11-16
**Problème résolu:** Gunicorn manquant en production
