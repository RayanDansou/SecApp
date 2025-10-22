# 🚀 Plan de Développement – SecApp (MVP Fonctionnel)

---

## 🧩 Vue d’ensemble

**Durée totale estimée :** 8 à 10 semaines  
**Structure du plan :**
- **Phase 0 →** Infrastructure de base  
- **Phases 1–10 →** Backend (Django)  
- **Phases 11–18 →** Frontend (Next.js)  
- **Phase 19 →** Dockerisation  
- **Phase 20 →** CI/CD (Jenkins)  
- **Phases 21–23 →** Documentation, Tests finaux, Livraison  

**Livrables finaux :**
- Application **SecApp** fonctionnelle (MVP)  
- 3 conteneurs Docker (frontend, backend, database)  
- Pipeline Jenkins opérationnel  
- Documentation complète (README, API, guides utilisateurs)  
- Couverture de tests > **80 %** (unitaires + E2E)  

---

## ⚙️ Phase 0 — Configuration Initiale de l’Environnement

**Durée estimée :** 1–2 jours  

### Étapes
- Créer l’arborescence complète du projet  
- Initialiser les fichiers Docker (`Dockerfile`, `docker-compose.yml`)  
- Créer `.env.example` avec toutes les variables d’environnement  
- Ajouter les scripts shell (`build.sh`, `start.sh`, `test.sh`)  
- Créer le `Jenkinsfile` de base  

### ✅ Tests
- Vérifier la conformité de l’arborescence  
- Vérifier la présence des 3 services dans `docker-compose.yml` (frontend, backend, database)  
- `docker-compose config` fonctionne sans erreur  
- Les scripts `.sh` sont exécutables  

---

## 🖥️ Phase 1 — Backend : Configuration Django & Base de Données

**Durée estimée :** 2–3 jours  

### Étapes
- Initialiser le projet Django (`django-admin startproject secapp`)  
- Créer `requirements.txt` avec toutes les dépendances  
- Configurer `settings.py` (`DATABASE_URL`, `SECRET_KEY`, CORS, JWT)  
- Créer les apps Django : `users/` et `questionnaires/`  
- Configurer les URLs racine (`secapp/urls.py`)  

### ✅ Tests
- `pip install -r requirements.txt` s’exécute sans erreur  
- `python manage.py check` ne retourne aucune erreur  
- Vérifier la connexion PostgreSQL  
- Tester le démarrage du serveur : `python manage.py runserver`  

---

## 🏗️ Phase 2 — Backend : Modèles de Données

**Durée estimée :** 2–3 jours  

### Étapes
- **users/** : créer modèle User custom avec rôle (CHEF_PROJET, ANALYSTE, BUSINESS_OWNER, ADMIN) et UserManager  
- **questionnaires/** : créer modèles Questionnaire, Question, Document, Score, Message, AuditLog  
- Définir toutes les relations (ForeignKey, OneToOne)  
- Créer les migrations  

### ✅ Tests
- `python manage.py makemigrations` et `migrate` sans erreur  
- Vérifier création des tables dans PostgreSQL  
- Tester création d’objets via `python manage.py shell`  
- Vérifier contraintes (unique, nullable, FK)  

---

## 🔐 Phase 3 — Backend : Authentification & Gestion Utilisateurs

**Durée estimée :** 2–3 jours  

### Étapes
- Configurer JWT (`djangorestframework-simplejwt`)  
- Créer serializers User (`UserSerializer`, `RegisterSerializer`)  
- Vues d’authentification : LoginView, LogoutView  
- Permissions customisées par rôle (IsChefProjet, IsAnalyste, IsBusinessOwner)  
- Configurer URLs auth  

### ✅ Tests
- Création d’un utilisateur test via admin Django  
- Tester login valide → JWT retourné  
- Tester login invalide → 401  
- Tester endpoints protégés avec/sans token  
- Logout invalide le token  

---

## 📋 Phase 4 — Backend : API Questionnaires (CRUD)

**Durée estimée :** 3–4 jours  

### Étapes
- Serializers : `QuestionnaireSerializer`, `QuestionSerializer`, `QuestionnaireDetailSerializer`  
- Viewsets et endpoints :
  - `GET /api/questionnaires/`  
  - `POST /api/questionnaires/`  
  - `GET /api/questionnaires/{id}/`  
  - `GET /api/questionnaires/{id}/questions/`  
  - `POST /api/questionnaires/{id}/questions/`  
- Permissions et audit logging  

### ✅ Tests
- GET/POST endpoints fonctionnels  
- Vérifier logs d’audit  
- Permissions appliquées correctement  

---

## 📂 Phase 5 — Backend : Gestion Documents (Upload)

**Durée estimée :** 2–3 jours  

### Étapes
- Configurer `MEDIA_ROOT` / `MEDIA_URL`  
- Serializer et endpoints pour documents  
- Validation fichiers : type, taille, nom sécurisé  
- Téléchargement sécurisé avec contrôle d’accès  

### ✅ Tests
- Upload PDF/DOCX valide  
- Upload fichier trop gros ou MIME non autorisé → erreur  
- Liste et téléchargement documents sécurisés  

---

## 🤖 Phase 6 — Backend : Intégration Azure OpenAI

**Durée estimée :** 2–3 jours  

### Étapes
- Service `ai_service.py` pour appel Azure OpenAI  
- Format prompt système et questionnaire  
- Parsing réponse JSON : `confidentiality`, `integrity`, `availability`, `recommendations`  
- Endpoint `POST /api/questionnaires/{id}/submit/`  

### ✅ Tests
- Vérifier réponse JSON valide  
- Status change + recommandations stockées  
- Gestion erreurs API  
- Logs d’audit capturent submit  

---

## ✅ Phase 7 — Backend : Workflow de Validation

**Durée estimée :** 2–3 jours  

### Étapes
- Endpoint `POST /api/questionnaires/{id}/validate/` accessible Analyste  
- Status (validé/rejeté) + commentaire  
- Déclenchement scoring final via Azure OpenAI si validé  
- Endpoint `GET /api/questionnaires/{id}/score/` pour scores CIA et recommandations  

### ✅ Tests
- Validation et rejet fonctionnels  
- Chef projet ne peut pas valider → 403  
- Questionnaire validé non modifiable  
- Logs d’audit capturent validation/rejet  

---

## 💬 Phase 8 — Backend : Système de Messagerie

**Durée estimée :** 2 jours  

### Étapes
- Serializer `MessageSerializer`  
- Endpoints :
  - `POST /api/questionnaires/{id}/messages/`  
  - `GET /api/questionnaires/{id}/messages/`  
- Permissions : seuls acteurs du questionnaire peuvent échanger  
- Tri messages chronologique  

### ✅ Tests
- POST et GET messages fonctionnels  
- Permissions correctes  
- Pagination si grand nombre de messages  

---

## 📧 Phase 9 — Backend : Intégration Resend (Emails)

**Durée estimée :** 2–3 jours  

### Étapes
- Service `email_service.py` pour Resend API  
- Templates emails : soumission, validation, rejet, nouveau message  
- Déclenchement automatique sur actions clés  
- Gestion erreurs (retry, logging)  

### ✅ Tests
- Envoi emails manuels et automatiques  
- Vérifier contenu et liens  
- Logs capturent erreurs  

---

## 🧪 Phase 10 — Backend : Tests Unitaires

**Durée estimée :** 3–4 jours  

### Étapes
- Tests modèles, endpoints, CRUD questionnaires, workflow, upload documents, permissions  
- Mock Azure OpenAI et Resend  

### ✅ Tests
- `python manage.py test` → tous tests passent  
- Coverage > 80 %  
- Edge cases et contraintes sécurité testés  

---

## 🖥️ Phase 11 — Frontend : Configuration Next.js & Structure

**Durée estimée :** 1–2 jours  

### Étapes
- Initialiser projet Next.js avec TypeScript  
- Installer dépendances (`axios`, `tailwindcss`, `react-hook-form`)  
- Configurer TailwindCSS  
- Créer structure : `pages/`, `components/`, `services/`, `utils/`  
- `.env.local` avec `NEXT_PUBLIC_API_URL`  

### ✅ Tests
- `npm install` et `npm run dev` sans erreur  
- Routing et Tailwind fonctionnels  

---

## 🖥️ Phase 12 — Frontend : Service API & Authentification

**Durée estimée :** 2–3 jours  

### Étapes
- `services/api.ts` : Axios instance + JWT headers  
- `services/auth.ts` : login, logout, getUser  
- `AuthContext` pour état global utilisateur  
- Page login avec formulaire, POST /api/auth/login/  

### ✅ Tests
- JWT stocké et utilisé  
- Routes protégées fonctionnelles  
- Logout supprime JWT  

---

## 🖥️ Phase 13 — Frontend : Dashboard & Navigation

**Durée estimée :** 2–3 jours  

### Étapes
- Navbar avec affichage conditionnel selon rôle  
- Pages dashboard selon rôle  
- Liste questionnaires (Table), bouton "Nouveau questionnaire"  

### ✅ Tests
- Dashboard correct pour chaque rôle  
- Navbar et navigation fonctionnelles  
- Bouton logout fonctionne  

---

## 📝 Phase 14 — Frontend : Création Questionnaire (Chef Projet)

**Durée estimée :** 3–4 jours  

### Étapes
- Formulaire dynamique pour questions/réponses  
- Upload documents (drag & drop)  
- Boutons sauvegarder/soumettre  
- API integration  

### ✅ Tests
- Création questionnaire, ajout questions, upload documents, soumission  
- Validation formulaire  
- Plusieurs documents supportés  

---

## 📊 Phase 15 — Frontend : Suivi Questionnaire (Chef Projet)

**Durée estimée :** 2–3 jours  

### Étapes
- Affichage détails questionnaire, timeline workflow, documents, messagerie  
- Composants : WorkflowTimeline, ChatBox, DocumentList  

### ✅ Tests
- Affichage correct, téléchargement documents, envoi/réception messages  

---

## 🧾 Phase 16 — Frontend : Validation Questionnaire (Analyste)

**Durée estimée :** 3–4 jours  

### Étapes
- Onglets : Réponses, Documents, Recommandations IA, Commentaires  
- Formulaire validation : status, commentaire  
- API integration  

### ✅ Tests
- Affichage questionnaire complet  
- Validation et rejet fonctionnels  
- Accès limité à Analyste  

---

## 📈 Phase 17 — Frontend : Consultation Scores (Business Owner)

**Durée estimée :** 2 jours  

### Étapes
- Page scores CIA et recommandations finales  
- Composants : ScoreChart, RecommendationsList  
- Messagerie intégrée  
- API integration  

### ✅ Tests
- Affichage scores et recommandations  
- Envoi commentaire  
- Accès limité à Business Owner  

---

## 🎨 Phase 18 — Frontend : Tests E2E & Finalisation UI/UX

**Durée estimée :** 2–3 jours  

### Étapes
- Polir design, loading states, error handling, confirmations, responsive design  
- Tests E2E (Playwright/Cypress) pour tous les rôles  

### ✅ Tests
- Flow complet pour chaque rôle  
- Responsive et accessibilité vérifiés  

---

## 🐳 Phase 19 — Infrastructure : Dockerisation

**Durée estimée :** 2–3 jours  

### Étapes
- Dockerfiles backend, frontend, database  
- Finaliser `docker-compose.yml` avec volumes, réseaux, variables d’env  
- Scripts shell : build.sh, start.sh, test.sh  

### ✅ Tests
- Build et lancement conteneurs sans erreur  
- Communication frontend → backend → database  
- Persistence données  

---

## ⚙️ Phase 20 — Pipeline CI/CD Jenkins

**Durée estimée :** 2–3 jours  

### Étapes
- Jenkinsfile complet : checkout, build, tests, lint, push images, déploiement  
- Configurer credentials et webhooks  
- Déploiement dev/staging/prod  

### ✅ Tests
- Pipeline complet → build success  
- Tests unitaires exécutés  
- Lint, push et déploiement vérifiés  

---

## 📚 Phase 21 — Documentation & README

**Durée estimée :** 1–2 jours  

### Étapes
- README complet : description, architecture, installation, lancement, tests, endpoints, variables d’env, contributions  
- Documentation API (Swagger/OpenAPI)  
- Guide utilisateur par rôle  
- Docstrings Python / JSDoc TS  

### ✅ Tests
- Suivre README sur machine vierge → application fonctionnelle  
- Endpoints et variables d’environnement documentés  
- Payload JSON exemples corrects  

---

## 🔒 Phase 22 — Tests d’Intégration & Sécurité

**Durée estimée :** 2–3 jours  

### Étapes
- Tests intégration E2E pour tous les rôles  
- Tests charge, sécurité, injection SQL, XSS, CSRF  
- Audit sécurité uploads, permissions, chiffrement, HTTPS  
- Tests performance API, fichiers et Azure OpenAI  

### ✅ Tests
- Flow complet testé  
- Messagerie, emails Resend, recommandations IA  
- Sécurité vérifiée  
- Logs d’audit complets  
- 10+ utilisateurs simultanés testés  

---

## 🏁 Phase 23 — Recette & Livraison MVP

**Durée estimée :** 1–2 jours  

### Étapes finales
- Déploiement sur environnement de recette  
- Tests d’acceptation utilisateur (UAT)  
- Corrections bugs critiques  
- Finalisation documentation  
- Formation utilisateurs / démo  
- Livraison MVP  

### ✅ Tests
- Création, soumission, validation, consultation questionnaire fonctionnels  
- Emails envoyés correctement  
- Recommandations IA générées  
- Documents upload/download  
- Messagerie fonctionnelle  
- HTTPS opérationnel  
- Logs d’audit capturent toutes les actions  
