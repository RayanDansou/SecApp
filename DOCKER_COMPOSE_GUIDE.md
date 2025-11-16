# 🐳 Docker Compose - Dev vs Production

## 🔴 Problème rencontré

```
npm error code ENOENT
npm error path /app/package.json
npm error enoent Could not read package.json
```

### Cause racine

En production, les **volumes montaient le dossier local vide** et **écrasaient l'image Docker** buildée!

---

## 📊 Différences Dev vs Prod

### 🧪 docker-compose.yml (DÉVELOPPEMENT)

```yaml
frontend:
  build:                      # ✅ Build depuis le code source
    context: ./frontend
  volumes:
    - ./frontend:/app         # ✅ HOT RELOAD - modifications en temps réel
    - /app/node_modules       # ✅ Évite d'écraser node_modules
  environment:
    - CHOKIDAR_USEPOLLING=true  # ✅ Hot reload dans Docker
```

**Avantages:**
- ✅ Modifications visibles immédiatement
- ✅ Pas besoin de rebuild à chaque changement
- ✅ Idéal pour développement

**Inconvénients:**
- ❌ Dépend du code local
- ❌ Non portable
- ❌ Performance moindre

---

### 🚀 docker-compose.prod.yml (PRODUCTION)

```yaml
frontend:
  image: rayandans/guardianiq:frontend-latest  # ✅ Image pré-buildée
  # PAS DE VOLUMES pour le code source!        # ✅ Code dans l'image
  environment:
    - NODE_ENV=production                      # ✅ Mode production
    # Pas de CHOKIDAR_USEPOLLING               # ✅ Pas de hot reload
```

**Avantages:**
- ✅ Image immuable et testée
- ✅ Déploiement rapide (juste pull)
- ✅ Indépendant du code local
- ✅ Performance optimale

**Inconvénients:**
- ❌ Besoin de rebuild pour chaque changement
- ❌ Plus long à itérer

---

## ⚠️ RÈGLE D'OR

### En PRODUCTION, ne montez JAMAIS le code source via volumes!

#### ❌ INCORRECT (écrase l'image)
```yaml
frontend:
  image: myapp:frontend-latest
  volumes:
    - ./frontend:/app  # ❌ ÉCRASE LE CONTENU DE L'IMAGE!
```

#### ✅ CORRECT (utilise l'image)
```yaml
frontend:
  image: myapp:frontend-latest
  # Pas de volumes pour le code source
```

---

## 📦 Exceptions: Volumes autorisés en PROD

### ✅ 1. Données persistantes

```yaml
db:
  image: postgres:16
  volumes:
    - postgres_data:/var/lib/postgresql/data  # ✅ Données de la DB
```

### ✅ 2. Fichiers uploadés

```yaml
backend:
  image: myapp:backend-latest
  volumes:
    - backend_media:/app/media        # ✅ Uploads utilisateurs
    - backend_static:/app/staticfiles # ✅ Fichiers statiques
```

### ✅ 3. Configuration externe

```yaml
nginx:
  image: nginx:alpine
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro  # ✅ Config externe
    - ./ssl:/etc/nginx/ssl:ro                # ✅ Certificats SSL
```

---

## 🔧 Configuration complète

### docker-compose.yml (DEV)

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:                      # BUILD local
      context: ./backend
    volumes:
      - ./backend:/app/backend  # HOT RELOAD
      - backend_static:/app/staticfiles
    command: python manage.py runserver 0.0.0.0:8000

  frontend:
    build:                      # BUILD local
      context: ./frontend
    volumes:
      - ./frontend:/app         # HOT RELOAD
      - /app/node_modules
    environment:
      - CHOKIDAR_USEPOLLING=true

volumes:
  postgres_data:
  backend_static:
```

### docker-compose.prod.yml (PROD)

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data  # ✅ Données uniquement

  backend:
    image: rayandans/guardianiq:backend-latest  # IMAGE Docker Hub
    volumes:
      - backend_static:/app/staticfiles         # ✅ Fichiers statiques
      - backend_media:/app/media                # ✅ Uploads
    command: gunicorn secapp.wsgi:application --bind 0.0.0.0:8000

  frontend:
    image: rayandans/guardianiq:frontend-latest # IMAGE Docker Hub
    # PAS DE VOLUMES pour le code source
    environment:
      - NODE_ENV=production

volumes:
  postgres_data:
  backend_static:
  backend_media:
```

---

## 🚀 Workflow complet

### Développement local

```bash
# Utiliser docker-compose.yml
docker-compose up -d

# Modifications dans le code → Hot reload automatique
# Pas besoin de rebuild
```

### Build et test

```bash
# Builder les images de production
docker build -t rayandans/guardianiq:backend-latest ./backend
docker build -t rayandans/guardianiq:frontend-latest ./frontend

# Tester avec docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d
```

### Production

```bash
# Push vers Docker Hub (fait par Jenkins)
docker push rayandans/guardianiq:backend-latest
docker push rayandans/guardianiq:frontend-latest

# Sur le serveur de production
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🐛 Troubleshooting

### Erreur: "Could not read package.json"

**Cause:** Volumes qui écrasent l'image en production

**Solution:**
```yaml
# Retirer ces lignes en production:
volumes:
  - ./frontend:/app      # ❌ SUPPRIMER
  - /app/node_modules    # ❌ SUPPRIMER
```

### Erreur: "Module not found"

**Cause:** node_modules pas dans l'image

**Solution:** Vérifier le Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install              # ✅ Doit être présent
COPY . .
CMD ["npm", "start"]
```

### Erreur: "Cannot find module 'django'"

**Cause:** Volumes écrasent le backend

**Solution:** Retirer les volumes de code source en prod
```yaml
backend:
  volumes:
    - ./backend:/app/backend  # ❌ SUPPRIMER en prod
```

---

## 📋 Checklist Migration Dev → Prod

Avant de déployer en production:

- [ ] Retirer tous les volumes de code source
- [ ] Retirer `CHOKIDAR_USEPOLLING`
- [ ] Utiliser `image:` au lieu de `build:`
- [ ] Changer `NODE_ENV=production`
- [ ] Changer commande: `npm start` → `npm run build && serve`
- [ ] Backend: `runserver` → `gunicorn`
- [ ] Ajouter healthchecks
- [ ] Configurer restart policies
- [ ] Variables d'environnement depuis `.env`
- [ ] Secrets sécurisés (pas de valeurs hardcodées)

---

## 🎯 Résumé

| Aspect | Dev (docker-compose.yml) | Prod (docker-compose.prod.yml) |
|--------|--------------------------|--------------------------------|
| **Code source** | Volumes montés (hot reload) | Dans l'image (immutable) |
| **Build** | `build: ./app` | `image: myapp:latest` |
| **Modifications** | Immédiatement visibles | Rebuild + redeploy requis |
| **Performance** | Moyenne | Optimale |
| **Node env** | development | production |
| **Hot reload** | ✅ Activé | ❌ Désactivé |
| **Volumes** | Code + données | Données uniquement |
| **Command** | Dev server | Production server |

---

**Règle simple:**
- 🧪 **Dev:** Code local monté → modifications instantanées
- 🚀 **Prod:** Code dans l'image → déploiement rapide et fiable

---

**Créé le:** 2025-11-16
**Problème résolu:** Frontend npm ENOENT en production
