# 🚀 Plan de Développement — SecApp (MVP itératif & testable)

---

## 🧩 Vue d’ensemble

**Durée totale estimée :** 8 à 10 semaines
**Structure du plan :**

* **Phase 0 →** Bootstrap & Infrastructure minimale
* **Phases 1–2 →** Authentification & CRUD questionnaire
* **Phases 3–4 →** Remplissage, Upload & Soumission IA
* **Phases 5–6 →** Validation Analyste & Consultation BO
* **Phase 7 →** Messagerie interne
* **Phase 8 →** Notifications emails
* **Phase 9 →** Qualité, sécurité & tests globaux
* **Phase 10 →** Documentation, UAT & livraison MVP

**Livrables finaux :**

* MVP complet, testable et déployable
* 3 conteneurs Docker (frontend, backend, database)
* Pipeline CI/CD opérationnel
* Tests unitaires + E2E > 80 %
* Documentation complète et démo fonctionnelle

---
## 🔹 Phase -3 — Backend basique (Hello World)

**Durée estimée :** 1 jour

### Objectif
Vérifier que le backend Django fonctionne et répond à une requête simple.

### Étapes
* Initialiser un projet Django : `django-admin startproject backend`
* Créer une app `core`
* Ajouter endpoint `/hello/` → renvoie JSON `{ "message": "Hello World" }`
* Configurer `settings.py` minimal : SQLite, timezone, debug=True
* Tester via Docker

### ✅ Tests
*  Conteneur up et fonctionnel
* Accéder à `http://localhost:8000/hello/` → renvoie `{ "message": "Hello World" }`
* CI simple : build + test endpoint OK

---

## 🔹 Phase -2 — Frontend basique (React / Next.js)

**Durée estimée :** 1 jour

### Objectif
Vérifier que le frontend fonctionne et peut afficher un composant minimal.

### Étapes
* Initialiser un projet Next.js / React : `npx create-next-app frontend`
* Ajouter une page `/` avec “Hello Frontend”
* Vérifier que le projet build + run local : `npm run dev`
* Optionnel : configurer ESLint + Prettier

### ✅ Tests
* Accéder à `http://localhost:3000/` → texte “Hello Frontend” visible
* Build OK : `npm run build`

---

## 🔹 Phase -1 — Base de données basique + endpoint test

**Durée estimée :** 1 jour

### Objectif
Tester la connexion et la création d’une table générique pour validation initiale.

### Étapes
* Créer une base de données SQLite/PostgreSQL (selon stack finale)
* Ajouter un modèle test : `TestModel(id, name, created_at)`
* Appliquer migrations : `python manage.py makemigrations && migrate`
* Créer endpoint `/api/test/` qui liste les instances `TestModel`
* Tester CRUD minimal

### ✅ Tests
* POST + GET sur `/api/test/` fonctionne
* Connexion DB OK, logs de migration corrects

---

## ⚙️ Phase 0 — Bootstrap & Environnement exécutable

**Durée estimée :** 2–3 jours

### Étapes

* Créer l’arborescence du projet (`frontend/`, `backend/`, `db/`)
* Initialiser Docker (`Dockerfile`, `docker-compose.yml`, `.env.example`)
* Ajouter scripts (`build.sh`, `start.sh`, `test.sh`)
* Configurer le `Jenkinsfile` de base pour build/test
* Mettre un healthcheck `/healthz` dans le backend Django
* Ajouter une page d’accueil “It works” sur Next.js

### ✅ Tests

* `docker compose up` → front accessible et backend répond `/healthz`
* `docker-compose config` sans erreur
* CI pipeline : build + test basiques passent

---

## 🔐 Phase 1 — Authentification (Backend + Frontend)

**Durée estimée :** 3–4 jours

### Étapes

* Créer modèle `User` (rôles : CHEF_PROJET, ANALYSTE, BUSINESS_OWNER, ADMIN)
* Configurer JWT (`djangorestframework-simplejwt`)
* Créer endpoints : `/auth/login`, `/auth/refresh`, `/auth/logout`
* CORS et sécurité basiques
* Frontend :

  * Page Login
  * AuthContext (stockage JWT)
  * Protection routes (redirection login si non authentifié)

### ✅ Tests

* Login avec user valide → JWT retourné
* Routes protégées refusent token manquant/invalide (401)
* Frontend : redirection auto si session expirée
* Pipeline CI : tests unitaires auth passent

---

## 📋 Phase 2 — CRUD Questionnaire (Chef de Projet)

**Durée estimée :** 3–4 jours

### Étapes

* Backend :

  * Modèles `Questionnaire(id, title, status, owner)`
  * Endpoints :

    * `GET /api/questionnaires/`
    * `POST /api/questionnaires/`
    * `GET /api/questionnaires/{id}/`
  * Permissions : seul le propriétaire voit ses questionnaires
* Frontend :

  * Page Liste + bouton “Nouveau”
  * Page Détail simple (titre, statut)
* Intégration CI/CD

### ✅ Tests

* Création et lecture questionnaire (Analyste sécurité)
* Permission : utilisateur ne peut pas voir celui d’un autre
* E2E : login → créer → voir dans la liste

---

## 🧾 Phase 3 — Questions, Réponses et Upload Documents

**Durée estimée :** 4–5 jours

### Étapes

* Backend :

  * Modèles `Question`, `Answer`, `Document`
  * Endpoints :

    * `GET /api/questionnaires/{id}/questions`
    * `POST /api/questionnaires/{id}/answers/`
    * `POST /api/questionnaires/{id}/documents/`
  * Validation fichiers : taille, type MIME
* Frontend :

  * Formulaire simple (quelques questions statiques)
  * Drag & drop upload documents
  * Aperçu fichiers

### ✅ Tests

* Upload PDF/DOCX valide → succès
* Upload non autorisé → 400
* Réponses sauvegardées correctement
* E2E : compléter formulaire + upload → affichage OK

---

## 🤖 Phase 4 — Soumission et Intégration Azure OpenAI

**Durée estimée :** 3–4 jours

### Étapes

* Backend :

  * Endpoint `POST /api/questionnaires/{id}/submit/`
  * Service `ai_service.py` (mockable) pour appel Azure OpenAI
  * Stockage des résultats (`ai_summary`: CIA + recommandations)
  * Passage du `status` → “submitted”
* Frontend :

  * Bouton “Soumettre”
  * Affichage résultats IA (score + reco)

### ✅ Tests

* Mock Azure : renvoie JSON valide
* Erreur API gérée proprement (status `failed_ai`)
* E2E : remplir → soumettre → afficher résultats IA
* Logs audit : soumission capturée

---

## 🧠 Phase 5 — Validation Analyste

**Durée estimée :** 3–4 jours

### Étapes

* Backend :

  * Endpoint `POST /api/questionnaires/{id}/validate/`
  * Status → “validated” ou “rejected”
  * Champ commentaire analyste
  * Permission `IsAnalysteOnly`
* Frontend :

  * Page Analyste : liste des “submitted”
  * Détail avec bouton “Valider/Rejeter” + commentaire
  * Blocage modification après validation

### ✅ Tests

* Analyste valide/rejette → statut mis à jour
* Chef projet ne peut plus modifier → 403
* Logs validation enregistrés
* E2E complet : soumission → validation

---

## 📈 Phase 6 — Consultation Scores (Business Owner)

**Durée estimée :** 2–3 jours

### Étapes

* Backend :

  * Endpoint `GET /api/questionnaires/{id}/score/`
  * Rôle Business Owner : accès read-only sur questionnaires validés
* Frontend :

  * Page Scores avec graphique (CIA) et liste des recommandations
  * Navigation vers détails

### ✅ Tests

* BO accède uniquement aux questionnaires validés
* Graphiques affichés correctement
* E2E : BO login → consultation scores

---

## 💬 Phase 7 — Système de Messagerie Interne

**Durée estimée :** 3 jours

### Étapes

* Backend :

  * Modèle `Message(questionnaire, author, content, created_at)`
  * Endpoints `GET/POST /api/questionnaires/{id}/messages/`
  * Accès restreint aux utilisateurs liés au questionnaire
* Frontend :

  * Composant Chat minimal (liste + envoi)
  * Tri chronologique

### ✅ Tests

* Envoi et affichage messages OK
* Autres utilisateurs → 403
* E2E : échange Chef Projet ↔ Analyste

---

## 📧 Phase 8 — Notifications Emails (Resend)

**Durée estimée :** 2–3 jours

### Étapes

* Backend :

  * Service `email_service.py`
  * Templates simples : soumission, validation, rejet, message
  * Retry + logging erreurs
* Intégration :

  * `on_submit`, `on_validate`, `on_message`
* Tests mocks pour éviter spam réel

### ✅ Tests

* Envois manuels/automatiques OK
* Erreurs loggées sans bloquer process
* E2E : actions → email simulé reçu (mock)

---

## 🧪 Phase 9 — Qualité, Sécurité & Tests Globaux

**Durée estimée :** 3–4 jours

### Étapes

* Tests unitaires + E2E complets
* Tests sécurité (JWT, XSS, upload, permissions)
* CI : couverture > 80 %, rapport coverage généré
* Observabilité : logs structurés, métriques simples
* Responsive design et UX minimale

### ✅ Tests

* Flow complet Chef Projet → Analyste → BO fonctionne
* 10 utilisateurs simultanés testés
* Aucune faille critique détectée

---

## 📚 Phase 10 — Documentation, UAT & Livraison MVP

**Durée estimée :** 2–3 jours

### Étapes

* Documentation :

  * README complet (setup, run, tests, endpoints)
  * Swagger/OpenAPI
  * Guide utilisateur (3 rôles)
* Déploiement staging “frozen”
* Tests d’acceptation utilisateur (UAT)
* Formation / démo live

### ✅ Tests

* README suivi sur machine vierge → tout tourne
* UAT checklist : 100 % validée
* Livraison MVP tag `v1.0.0-mvp`

---

## 🏁 Résultat attendu

> À la fin de la Phase 10, **SecApp** est un **MVP complet, déployé, testable et démontrable** :

* Auth complète (JWT)
* CRUD Questionnaire
* Réponses + Upload
* Soumission IA
* Validation Analyste
* Consultation BO
* Messagerie & Emails
* Sécurité et CI/CD fonctionnels
* Documentation et démo prêtes
