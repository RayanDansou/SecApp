# 🚀 GuardianIQ - Jenkins Pipeline

Pipeline CI/CD simplifié pour GuardianIQ - De votre ancien projet complexe vers quelque chose de léger et fonctionnel.

---

## 📦 Fichiers créés pour vous

| Fichier | Description | Quand l'utiliser |
|---------|-------------|------------------|
| **Jenkinsfile** | Pipeline complet (build, test, push, deploy) | ✅ **Production recommandée** |
| **Jenkinsfile.minimal** | Version ultra-simple (build + deploy local) | 🧪 Tests rapides, pas de Docker Hub |
| **docker-compose.prod.yml** | Config production (utilise images Docker Hub) | 🚀 Production |
| **.env.jenkins** | Template variables d'environnement | 📝 Copier en `.env` et remplir |
| **JENKINS_SETUP.md** | Guide complet de configuration Jenkins | 📚 Setup initial |
| **JENKINS_QUICK_REF.md** | Aide-mémoire et troubleshooting | 🔍 Référence rapide |
| **test-pipeline.sh** | Tester le pipeline localement | 🧪 Avant de pousser sur Jenkins |

---

## 🎯 Quick Start (5 minutes)

### 1️⃣ Préparer l'environnement

```bash
# Copier le template d'environnement
cp .env.jenkins .env

# Éditer avec vos vraies valeurs
nano .env  # Ou VSCode, vim, etc.
```

**Variables critiques à remplir:**
- `AZURE_OPENAI_API_KEY` - Votre clé Azure OpenAI
- `RESEND_API_KEY` - Votre clé Resend pour les emails
- `POSTGRES_PASSWORD` - Mot de passe sécurisé
- `DJANGO_SECRET_KEY` - Générer avec `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

### 2️⃣ Tester localement (optionnel mais recommandé)

```bash
# Rendre le script exécutable
chmod +x test-pipeline.sh

# Lancer le test
./test-pipeline.sh
```

Ce script va:
- ✅ Builder les images Docker
- ✅ Lancer les tests
- ✅ Déployer localement
- ✅ Vérifier que tout fonctionne

### 3️⃣ Configurer Jenkins

**Étapes détaillées dans `JENKINS_SETUP.md`**

Résumé ultra-rapide:

```bash
# 1. Donner accès Docker à Jenkins
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# 2. Dans Jenkins Web UI:
#    - Ajouter credentials Docker Hub (ID: dockerhub-credentials)
#    - Créer un Pipeline pointant vers votre repo Git
#    - Script Path: Jenkinsfile

# 3. Build Now!
```

---

## 🔄 Différences avec votre ancien pipeline

### ❌ Supprimé (simplification)
- Gestion complexe de tags Git (f*, b*, d*)
- Multiples environnements (preprod/prod)
- Notifications Discord
- Scans de sécurité Trivy
- Scripts bash complexes
- Gestion de plusieurs Dockerfiles séparés

### ✅ Conservé (essentiel)
- Build des images Docker
- Tests automatisés
- Push vers Docker Hub
- Déploiement automatique
- Health checks

### 🎯 Résultat
- **Avant:** ~300 lignes, 15+ minutes, complexe
- **Maintenant:** ~130 lignes, 8-10 minutes, simple

---

## 📊 Workflow du Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│ 1. GIT PUSH                                                  │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CHECKOUT CODE                                             │
│    - Clone le repository                                     │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. BUILD IMAGES                                              │
│    - Backend:  rayandans/guardianiq:backend-X                │
│    - Frontend: rayandans/guardianiq:frontend-X               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. RUN TESTS                                                 │
│    - Django tests (backend)                                  │
│    - [Future] Frontend tests                                 │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. PUSH TO DOCKER HUB                                        │
│    - Version: backend-X, frontend-X                          │
│    - Latest:  backend-latest, frontend-latest                │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. DEPLOY                                                    │
│    - Pull latest images                                      │
│    - docker-compose up -d                                    │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. HEALTH CHECK                                              │
│    - Backend responding?                                     │
│    - Frontend responding?                                    │
│    - Database healthy?                                       │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
                ✅ SUCCESS!
```

**Durée totale:** ~8-12 minutes

---

## 🛠️ Utilisation Quotidienne

### Déclencher un build

**Automatiquement:**
- Chaque `git push` sur `main` → Build automatique (si webhook configuré)

**Manuellement:**
- Jenkins → Votre Pipeline → **Build Now**

### Voir les logs

```bash
# Backend
docker logs guardianiq-backend-prod -f

# Frontend
docker logs guardianiq-frontend-prod -f

# Tous ensemble
docker-compose -f docker-compose.prod.yml logs -f
```

### Redémarrer un service

```bash
# Un seul service
docker-compose -f docker-compose.prod.yml restart backend

# Tous les services
docker-compose -f docker-compose.prod.yml restart
```

### Appliquer des migrations

```bash
docker exec guardianiq-backend-prod python manage.py migrate
```

### Créer un superuser

```bash
docker exec -it guardianiq-backend-prod python manage.py createsuperuser
```

---

## 🔧 Personnalisation

### Ajouter des notifications Discord (comme avant)

Dans le `Jenkinsfile`, ajouter en haut:

```groovy
environment {
    DISCORD_WEBHOOK = credentials('discord-webhook')
}
```

Puis créer une fonction (copiable depuis votre ancien Jenkinsfile):

```groovy
def notifyDiscord(String message) {
    sh """
        curl -X POST -H 'Content-Type: application/json' \
        -d '{"content": "${message}"}' \
        \${DISCORD_WEBHOOK}
    """
}
```

Et l'appeler dans chaque stage:

```groovy
stage('Build Images') {
    steps {
        script {
            notifyDiscord("🔨 Building images...")
            // ... votre code
            notifyDiscord("✅ Images built!")
        }
    }
}
```

### Ajouter Trivy Security Scans

Dans le `Jenkinsfile`, ajouter un stage:

```groovy
stage('Security Scan') {
    steps {
        script {
            sh """
                trivy image --severity CRITICAL,HIGH \
                    ${DOCKER_REPO}:backend-${VERSION}

                trivy image --severity CRITICAL,HIGH \
                    ${DOCKER_REPO}:frontend-${VERSION}
            """
        }
    }
}
```

### Déployer sur un serveur distant

Remplacer le stage `Deploy` par:

```groovy
stage('Deploy to Production') {
    steps {
        sshagent(['ssh-production-server']) {
            sh """
                ssh user@production-server '
                    cd /opt/guardianiq &&
                    docker-compose -f docker-compose.prod.yml pull &&
                    docker-compose -f docker-compose.prod.yml up -d
                '
            """
        }
    }
}
```

---

## 📈 Évolution du Pipeline

### Phase 1: MVP (✅ ACTUELLE)
- Build + Test + Deploy basique
- **Objectif:** Faire fonctionner le pipeline simplement

### Phase 2: Notifications (1-2h)
- Ajouter Discord/Slack notifications
- Rapports de build par email

### Phase 3: Sécurité (2-3h)
- Trivy security scans
- Vulnerability reporting
- Code quality checks (SonarQube)

### Phase 4: Multi-environnements (1-2 jours)
- Environnement Staging
- Environnement Production
- Approval gates

### Phase 5: Advanced (3-5 jours)
- Blue-Green deployment
- Rollback automatique
- Performance testing
- E2E testing avec Cypress

---

## 🐛 Problèmes Courants

### "docker: command not found" dans Jenkins

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### "Cannot connect to Docker daemon"

```bash
# Vérifier que Docker tourne
sudo systemctl status docker

# Si non:
sudo systemctl start docker
```

### "Permission denied" sur les fichiers

```bash
# Sur le serveur Jenkins
sudo chown -R jenkins:jenkins /var/lib/jenkins/workspace/
```

### Images pas trouvées sur Docker Hub

1. Vérifier que le build s'est terminé avec succès
2. Vérifier vos credentials Docker Hub
3. Vérifier que le nom du repo est correct: `rayandans/guardianiq`

### Tests échouent

```bash
# Tester localement d'abord
docker run --rm rayandans/guardianiq:backend-latest python manage.py test

# Voir les logs détaillés
docker logs <container-id>
```

---

## 📚 Ressources

- **Setup complet:** `JENKINS_SETUP.md`
- **Aide-mémoire:** `JENKINS_QUICK_REF.md`
- **Test local:** `./test-pipeline.sh`
- **Documentation Jenkins:** https://www.jenkins.io/doc/
- **Docker Pipeline Plugin:** https://plugins.jenkins.io/docker-workflow/

---

## 🎯 Checklist de Démarrage

- [ ] **.env créé et rempli** avec les vraies valeurs
- [ ] **Jenkins configuré** avec credentials Docker Hub
- [ ] **Pipeline créé** dans Jenkins pointant vers le Jenkinsfile
- [ ] **Test local réussi** avec `./test-pipeline.sh`
- [ ] **Premier build Jenkins** lancé et réussi
- [ ] **Application accessible** sur http://localhost:3333

**Une fois tout coché ✅ → Vous êtes prêt pour la production! 🚀**

---

## 📞 Support

Des questions? Besoin d'aide?

1. Consultez `JENKINS_QUICK_REF.md` pour le troubleshooting
2. Lisez `JENKINS_SETUP.md` pour la configuration détaillée
3. Ouvrez une issue sur GitHub

---

**Version:** 1.0
**Créé le:** 2025-11-15
**Auteur:** Assistant Claude
**Projet:** GuardianIQ
