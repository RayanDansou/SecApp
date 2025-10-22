# ⚡ Guide de démarrage rapide - SecApp Phase 0

## 🎯 En 5 minutes

### Prérequis
- Docker 24+ installé
- Docker Compose v2+ installé
- Ports 3000, 8000, 5432 disponibles

---

## 🚀 Lancement

### 1️⃣ Cloner et configurer (1 min)

```bash
# Se placer dans le dossier du projet
cd SecApp

# Copier le fichier d'environnement
cp .env.example .env
```

### 2️⃣ Démarrer l'application (3 min)

```bash
# Lancer tous les services
./scripts/start.sh
```

Le script va automatiquement:
- ✅ Créer le fichier .env si nécessaire
- ✅ Démarrer les 3 containers Docker
- ✅ Attendre que les services soient prêts
- ✅ Vérifier leur santé

### 3️⃣ Accéder à l'application (< 1 min)

Ouvrir votre navigateur:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Page "It Works!" |
| **Backend API** | http://localhost:8000/api/healthz/ | Health check |
| **Admin Django** | http://localhost:8000/admin/ | Interface admin |

---

## 🔐 Identifiants par défaut

**Admin Django:**
- Username: `admin`
- Password: `Admin123!`

---

## ✅ Vérification rapide

### Test 1: Frontend fonctionne

```bash
curl http://localhost:3000
```

✅ Devrait retourner du HTML avec "It Works!"

### Test 2: Backend fonctionne

```bash
curl http://localhost:8000/api/healthz/
```

✅ Devrait retourner:
```json
{
  "status": "healthy",
  "service": "SecApp Backend",
  "version": "1.0.0-phase0"
}
```

### Test 3: Base de données fonctionne

```bash
docker compose exec db pg_isready -U secapp_user -d secapp
```

✅ Devrait afficher: `db:5432 - accepting connections`

---

## 🎨 Ce que vous devriez voir

### Page d'accueil (http://localhost:3000)

![Expected Frontend](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=SecApp+-+It+Works!)

Éléments visibles:
- ✅ Logo SecApp avec icône de sécurité
- ✅ Titre "SecApp - Security Assessment Platform"
- ✅ Badge vert "It Works!"
- ✅ Status Frontend: "Running" (vert)
- ✅ Status Backend: "healthy" (vert)
- ✅ Aperçu des fonctionnalités futures
- ✅ Design moderne avec TailwindCSS

### Admin Django (http://localhost:8000/admin/)

- ✅ Page de login Django
- ✅ Connexion avec admin/Admin123!
- ✅ Interface d'administration accessible
- ✅ Section "Users" visible

---

## 🐛 Dépannage rapide

### Problème: Services ne démarrent pas

```bash
# Voir les logs
docker compose logs

# Redémarrer
docker compose restart
```

### Problème: Ports déjà utilisés

Éditer `.env`:
```bash
FRONTEND_PORT=3001
BACKEND_PORT=8001
```

Puis redémarrer:
```bash
docker compose down
docker compose up -d
```

### Problème: Backend ne peut pas se connecter à la DB

```bash
# Vérifier que la DB est prête
docker compose ps db

# Redémarrer le backend
docker compose restart backend

# Attendre 30 secondes
sleep 30
```

### Problème: Permission denied sur les scripts

```bash
chmod +x scripts/*.sh
```

---

## 🧪 Tests rapides

```bash
# Lancer tous les tests
./scripts/test.sh
```

Le script va:
- ✅ Tester le backend (pytest)
- ✅ Vérifier la qualité du code (flake8)
- ✅ Tester la connexion à la DB
- ✅ Tester les health checks

---

## 🛑 Arrêt

```bash
# Arrêter tous les services
./scripts/stop.sh

# OU
docker compose down
```

---

## 🧹 Nettoyage

```bash
# Nettoyer complètement (volumes, images, etc.)
./scripts/clean.sh
```

⚠️ **ATTENTION:** Cette commande supprime TOUTES les données !

---

## 📚 Documentation complète

Pour plus d'informations:

- **Guide complet:** [README.md](README.md)
- **Tests détaillés:** [docs/PHASE0_TESTS.md](docs/PHASE0_TESTS.md)
- **Résumé Phase 0:** [docs/PHASE0_SUMMARY.md](docs/PHASE0_SUMMARY.md)
- **Architecture:** [CLAUDE.md](CLAUDE.md)
- **Plan de développement:** [newplan.md](newplan.md)

---

## 🎯 Prochaines étapes

Une fois Phase 0 validée:

1. Consulter [newplan.md](newplan.md) pour Phase 1
2. Créer une branche: `git checkout -b feature/phase1-auth`
3. Suivre les instructions Phase 1
4. Tester avec `./scripts/test.sh`
5. Créer une Pull Request

---

## ⚙️ Commandes utiles

```bash
# Voir les logs en temps réel
docker compose logs -f

# Redémarrer un service
docker compose restart backend

# Accéder au shell Django
docker compose exec backend python manage.py shell

# Accéder à la base de données
docker compose exec db psql -U secapp_user -d secapp

# Vérifier le statut
docker compose ps
```

---

## 🆘 Besoin d'aide ?

1. Consulter le [README.md](README.md)
2. Vérifier [docs/PHASE0_TESTS.md](docs/PHASE0_TESTS.md)
3. Voir les logs: `docker compose logs`
4. Contacter l'équipe de développement

---

## ✨ C'est tout !

Vous avez maintenant:
- ✅ SecApp qui tourne localement
- ✅ Les 3 services opérationnels
- ✅ L'infrastructure prête pour Phase 1
- ✅ Une base solide pour développer

**Bon développement ! 🚀**

---

**Version:** 1.0.0-phase0
**Date:** 2025-10-22