# 🚀 Jenkins Setup Guide - GuardianIQ

## 📋 Prérequis

- Jenkins installé et fonctionnel
- Docker et Docker Compose installés sur le serveur Jenkins
- Compte Docker Hub (pour push des images)

---

## ⚙️ Configuration Jenkins

### 1. Installer les plugins nécessaires

Dans **Manage Jenkins** → **Plugin Manager**, installer:

- ✅ Docker Pipeline
- ✅ Git Plugin
- ✅ Pipeline

### 2. Configurer les credentials Docker Hub

**Manage Jenkins** → **Credentials** → **System** → **Global credentials** → **Add Credentials**

```
Kind:     Username with password
Scope:    Global
ID:       dockerhub-credentials
Username: rayandans
Password: <votre-docker-hub-token>
```

💡 **Créer un token Docker Hub:**
- Allez sur [Docker Hub](https://hub.docker.com/settings/security)
- **New Access Token** → Nommez-le `jenkins-guardianiq`
- Copiez le token et utilisez-le comme password

### 3. Donner les permissions Docker à Jenkins

Sur le serveur Jenkins:

```bash
# Ajouter l'utilisateur Jenkins au groupe docker
sudo usermod -aG docker jenkins

# Redémarrer Jenkins
sudo systemctl restart jenkins
```

---

## 🎯 Créer le job Jenkins

### Option A: Pipeline from SCM (recommandé)

1. **New Item** → `GuardianIQ-Pipeline` → **Pipeline** → OK
2. Cocher **Poll SCM** avec `H/5 * * * *` (check toutes les 5min)
3. Dans **Pipeline**:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/rayandans/guardianiq.git`
   - Branch: `*/main` (ou `*/master`)
   - Script Path: `Jenkinsfile`
4. **Save**

### Option B: Pipeline script direct

1. **New Item** → `GuardianIQ-Pipeline` → **Pipeline** → OK
2. Dans **Pipeline** → Definition: **Pipeline script**
3. Copier-coller le contenu de `Jenkinsfile`
4. **Save**

---

## 🔥 Lancer le pipeline

### Manuellement
- Cliquez sur **Build Now**

### Automatiquement (Git webhook)
Dans votre repo GitHub:
1. **Settings** → **Webhooks** → **Add webhook**
2. Payload URL: `http://<votre-jenkins-url>/github-webhook/`
3. Content type: `application/json`
4. Events: **Just the push event**
5. **Add webhook**

---

## 📊 Structure des images Docker

Le pipeline créera les images suivantes:

```
rayandans/guardianiq:backend-1    (version 1)
rayandans/guardianiq:backend-latest

rayandans/guardianiq:frontend-1   (version 1)
rayandans/guardianiq:frontend-latest
```

---

## 🧪 Tester le pipeline localement

Avant de pousser sur Jenkins, testez les étapes:

```bash
# Build
docker build -t test-backend ./backend
docker build -t test-frontend ./frontend

# Tests
docker run --rm test-backend python manage.py test

# Deploy
docker-compose up -d

# Health check
curl http://localhost:8888/api/
curl http://localhost:3333/
```

---

## 🛠️ Fichiers disponibles

| Fichier | Usage |
|---------|-------|
| `Jenkinsfile` | Pipeline complet (build → test → push → deploy) |
| `Jenkinsfile.minimal` | Version ultra-simple (build → deploy local) |

### Utiliser Jenkinsfile.minimal

Si vous ne voulez **PAS push sur Docker Hub**, utilisez:

Dans Jenkins → **Script Path**: `Jenkinsfile.minimal`

---

## 🐛 Troubleshooting

### Erreur: "docker: command not found"
```bash
# Vérifier que Docker est accessible
sudo -u jenkins docker ps

# Si non, vérifier les permissions
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Erreur: "Cannot connect to Docker daemon"
```bash
# Vérifier que Docker tourne
sudo systemctl status docker

# Redémarrer si nécessaire
sudo systemctl restart docker
```

### Erreur: "docker-compose: command not found"
```bash
# Installer docker-compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Erreur credentials Docker Hub
```bash
# Tester manuellement le login
echo "<votre-token>" | docker login -u rayandans --password-stdin

# Si OK, recréer les credentials dans Jenkins
```

---

## 📈 Améliorations futures

Une fois la base fonctionnelle, vous pouvez ajouter:

- ✅ **Notifications Slack/Discord** (comme votre ancien pipeline)
- ✅ **Security scans** avec Trivy
- ✅ **Tests de couverture** avec coverage.py
- ✅ **Déploiement multi-environnements** (dev, staging, prod)
- ✅ **Rollback automatique** en cas d'échec
- ✅ **Monitoring** avec Prometheus/Grafana

---

## 🎯 Roadmap Pipeline

### Phase 1 (Actuelle) - Basique
```
Build → Test → Deploy local
```

### Phase 2 - Docker Hub
```
Build → Test → Push DockerHub → Deploy
```

### Phase 3 - Security
```
Build → Test → Security Scan → Push → Deploy
```

### Phase 4 - Production
```
Build → Test → Scan → Push → Deploy Staging → Tests E2E → Deploy Prod
```

---

## 📞 Support

- 📚 [Jenkins Documentation](https://www.jenkins.io/doc/)
- 🐳 [Docker Pipeline Plugin](https://plugins.jenkins.io/docker-workflow/)
- 💬 Issues: Créer une issue sur le repo

---

**Dernière mise à jour:** 2025-11-15
