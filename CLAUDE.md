# SecApp

# Architecture Technique de la Solution

## Vue fonctionnelle
- Utilisateurs finaux : chefs de projet, analystes sécurité et business owner  
- Actions principales : saisie du questionnaire, validation, consultation des scores de sécurité  

### Chef de projet
- Peut remplir un questionnaire de sécurité  
- Peut uploader un document d’architecture technique (ex : Word, PDF)  
- Peut consulter l’état d’avancement du questionnaire (brouillon, en attente, en validation, validé, rejeté)  
- Peut échanger avec l’analyste via un système de communication intégré (notification, messagerie ou mail automatique)  

### Analyste sécurité
- Peut créer un questionnaire de sécurité 
- reçoit une notification lorsqu'un questionnaire qu'il a créé est rempli
- Peut accéder aux questionnaires remplis par les chefs de projet  
- Peut consulter les documents d’architecture technique associés  
- Peut valider ou rejeter un questionnaire de sécurité (workflow de validation)  
- Peut fournir des recommandations de sécurité à partir des données collectées (questionnaire + documents)  
- Peut envoyer un retour au chef de projet via le système de communication intégré  

### Business owner
- Peut consulter les questionnaires validés/rejetés et leurs recommandations  
- Porte une attention particulière aux besoins non fonctionnels (intégrité, disponibilité, confidentialité)  
- Peut envoyer des retours à l’analyste via un système de communication intégré  

---

## Processus métier
1. Le chef de projet initie un projet et remplit le questionnaire de sécurité sur la plateforme  
2. Il joint un document d'architecture technique  
3. Le système compile les données du questionnaire et du document et transmet le tout à l'analyste  
4. L'analyste consulte, valide ou rejette le questionnaire (IA intervient ici pour scoring et reco)  
5. La plateforme notifie le chef de projet  
6. Les résultats finaux sont accessibles au business owner  
7. Tout au long du processus, les échanges se font par emails automatiques via **Resend**  

---

## Besoins fonctionnels
- Gestion des utilisateurs et rôles (admin, chef de projet, analyste, business owner)  
- Questionnaire de sécurité : création, remplissage, sauvegarde partielle, soumission  
- Workflow de validation (brouillon, soumis, en cours d'analyse, validé, rejeté)  
- GED : upload et association de documents à un questionnaire, consultation sécurisée  
- Communication intégrée : notifications automatiques par email (soumission, validation, rejet, commentaire)  
- Assistance IA : génération de recommandations à partir du questionnaire + documents  
- Traçabilité : logs complets des actions, archivage des questionnaires et recommandations  

---

## Besoins non fonctionnels
- Confidentialité : stockage chiffré, HTTPS obligatoire  
- Intégrité : questionnaires et documents non modifiables après soumission hors workflow défini  
- Disponibilité : conteneurisation + orchestration pour garantir uptime  
- Traçabilité : logs complets des actions pour audit  
- Sécurité :  
  - Accès contrôlés par rôle  
  - Droits restreints pour téléchargement et accès aux documents  

---

## Composants techniques
- **Frontend** : React / Next.js  
- **Backend** : Django + Django REST Framework  
- **Base de données** : PostgreSQL (conteneurisée)  
- **IA / Scoring** : Azure OpenAI  
- **Email** : Resend (API REST)  

---

## Authentification
Django Auth customisé avec gestion des rôles.  
Authentification via username/password avec JWT.  

### Endpoints
- `POST /api/auth/login/` → {username, password} → JWT  
- `POST /api/auth/logout/` → invalidation du token  

---

## Endpoints API

### Questionnaires
- `GET /api/questionnaires/` → liste des questionnaires  
- `POST /api/questionnaires/` → création d’un questionnaire  
- `GET /api/questionnaires/{id}/` → détail d’un questionnaire  
- `POST /api/questionnaires/{id}/submit/` → soumission des réponses + envoi vers Azure OpenAI  

#### Exemple de payload JSON de création d'un questionnaire
```json 
{ "title": "Projet CRM Interne", "questions": [ { "text": "Le système est-il accessible depuis Internet ?", "response": "Non" }, { "text": "Les données sont-elles chiffrées ?", "response": "Oui" } ] }
```

### Questions
- `GET /api/questionnaires/{id}/questions/` → récupération des questions  
- `POST /api/questionnaires/{id}/questions/` → ajout d’une question  

### Validation
- `POST /api/questionnaires/{id}/validate/` → validation ou rejet par analyste  

#### Exemple de payload JSON de validation

```json 
{ "status": "validé", "comment": "Les contrôles d’accès sont conformes." }
```

### Scores
- `GET /api/questionnaires/{id}/score/` → récupération des scores finaux  

### Documents
- `POST /api/questionnaires/{id}/documents/` → upload d’un fichier  
- `GET /api/questionnaires/{id}/documents/` → liste des fichiers liés  

### Messages
- `POST /api/questionnaires/{id}/messages/` → envoyer un message  
- `GET /api/questionnaires/{id}/messages/` → récupérer les échanges  

---

## Flow technique
1. Chef de projet crée un questionnaire et ajoute un document (upload via `/documents/`)  
2. Il soumet les réponses via `/submit/`  
3. Backend stocke en base et appelle Azure OpenAI pour recommandations initiales  
4. Notification email envoyée via Resend à l’analyste  
5. Analyste valide ou rejette via `/validate/`  
6. Si validé, scoring final déclenché via Azure OpenAI → sauvegardé en BDD  
7. Résultats accessibles au chef de projet et business owner via `/score/`  
8. Échanges possibles via `/messages/`  

---

## Sécurité technique
- JWT + gestion des rôles côté backend  
- HTTPS obligatoire  
- Validation stricte des fichiers uploadés (MIME type, antivirus, taille max)  
- Logs complets des actions (audit trail)

### Logs applicatifs

Format standard JSON pour audit: <br><br>
```json 
{ "timestamp": "2025-10-21T10:05:12Z", "user": "chef.projet1", "action": "submit_questionnaire", "target": "questionnaire_42", "status": "success" }
```

---

## Diagramme de flux

Chef de projet -> POST /submit + /documents -> Backend
Backend -> PostgreSQL (save)
Backend -> Azure OpenAI (recommandations)
Backend -> Resend (email analyste)
Analyste -> POST /validate -> Backend
Backend -> Azure OpenAI (scoring final)
Backend -> PostgreSQL (store score)
Business owner -> GET /score -> Backend
Tous -> /messages (communication)

---

## Architecture du projet
- Deux services : Frontend et Backend  
- Chaque service conteneurisé avec Docker + Dockerfile dédié  
- `docker-compose.yml` pour lancer :  
  - Frontend  
  - Backend  
  - Base PostgreSQL  

Scripts `.sh` pour build et lancement automatisés  

---

## Pipeline Jenkins
Étapes :  
1. Build des images Docker (frontend, backend)  
2. Lancement des tests unitaires Django + React  
3. Analyse statique (lint, sécurité)  
4. Push des images vers un registre privé  
5. Déploiement automatisé via `docker-compose up` sur l’environnement cible  

---

## Base de données

### Tables principales
#### `users`
- id (PK)  
- username (unique)  
- password (hashé)  
- email (unique)  
- role (enum : CHEF_PROJET, ANALYSTE, BUSINESS_OWNER, ADMIN)  
- date_joined (timestamp)  

#### `questionnaires`
- id (PK)  
- title  
- created_by_id (FK → users.id)  
- status (enum : brouillon, soumis, en_analyse, validé, rejeté)  
- created_at (timestamp)  

#### `questions`
- id (PK)  
- questionnaire_id (FK → questionnaires.id)  
- text  
- response (nullable)  

#### `documents`
- id (PK)  
- questionnaire_id (FK → questionnaires.id)  
- file_path  
- uploaded_at (timestamp)  

#### `scores`
- id (PK)  
- questionnaire_id (FK unique → questionnaires.id)  
- confidentiality (int)  
- integrity (int)  
- availability (int)
- recommendations (varchar)  
- generated_at (timestamp)  

#### `messages`
- id (PK)  
- questionnaire_id (FK → questionnaires.id)  
- sender_id (FK → users.id)  
- content  
- sent_at (timestamp)  

#### `audit_logs`
- id (PK)  
- user_id (FK → users.id)  
- action (varchar)  
- target_type (varchar)  
- target_id (int)  
- timestamp (timestamp)  

---

### Relations
- Un **user** crée plusieurs **questionnaires** (1-N)  
- Un **questionnaire** contient plusieurs **questions** (1-N)  
- Un **questionnaire** peut avoir plusieurs **documents** (1-N)  
- Un **questionnaire** peut avoir plusieurs **messages** (1-N)  
- Un **questionnaire** a un seul **score** final (1-1)  
- Les **logs** enregistrent toutes les actions d’un **user** (N-1)  

---

## Interfaces Frontend (UI / UX)

### Technologies
- React + Next.js (SSR pour performance et SEO)  
- TailwindCSS pour le design  
- Axios / Fetch pour appels API  
- JWT stocké en `localStorage` ou `HttpOnly cookie`  
- Routing géré par Next.js  

---

### Flows utilisateur et écrans principaux

#### 1. Authentification
- **Page Login**  
  - Champs : username, password  
  - Bouton : "Se connecter"  
  - Envoi `POST /api/auth/login/`  
  - Succès → stockage token → redirection dashboard  
  - Échec → message d’erreur  

---

#### 2. Dashboard
- Différent selon rôle (Chef de projet, Analyste, Business Owner)  
- Composants communs :  
  - Liste questionnaires avec statut  
  - Bouton "Nouveau questionnaire"  
  - Notifications récentes  

---

#### 3. Chef de projet
- **Écran Création / Édition**  
  - Formulaire dynamique  
  - Boutons "Sauvegarder" / "Soumettre"  
  - Upload documents drag & drop  

- **Écran Suivi**  
  - Timeline workflow  
  - Messages (chat-like)  
  - Fil des échanges avec analyste  

---

#### 4. Analyste sécurité
- **Liste questionnaires en attente**  
- **Écran Validation**  
  - Onglets : Réponses, Documents, Recommandations IA, Commentaires  
  - Boutons "Valider" / "Rejeter"  
  - Notifications automatiques via Resend  

---

#### 5. Business Owner
- **Consultation**  
  - Liste projets validés/rejetés  
  - Détail questionnaire + scores  
  - Section commentaires (messagerie intégrée)  

---

### Flows front → back

#### Flow 1 : Création et soumission (Chef de projet)
1. Login  
2. Dashboard → "Nouveau questionnaire"  
3. Saisie réponses → `POST /api/questionnaires/`  
4. Upload documents → `POST /documents/`  
5. Soumission → `POST /submit/`  
6. Redirection vers écran suivi  

#### Flow 2 : Validation (Analyste)
1. Login  
2. Dashboard → "En attente d’analyse"  
3. Consultation réponses + docs  
4. Appel IA affiché en front  
5. Valider/Rejeter → `POST /validate/`  
6. MAJ état + notification envoyée 

##### Format d'appel attendu pour l'IA

```python 
response = client.chat.completions.create( model="gpt-4o-mini", messages=[{"role": "system", "content": "Tu es un expert sécurité..."}, {"role": "user", "content": questionnaire_data}], response_format="json")
```
##### Format standard JSON pour l'IA

```json 
{ "confidentiality": 85, "integrity": 90, "availability": 80, "recommendations": "Renforcer le chiffrement des backups." }
```

#### Flow 3 : Consultation (Business Owner)
1. Login  
2. Dashboard → projets validés  
3. Sélection projet → GET `/questionnaires/{id}`  
4. Consultation scores → GET `/score/`  
5. Envoi commentaire → POST `/messages/` 

---

### Interfaces graphiques (composants clés)
- **Navbar** : navigation globale  
- **Tableaux** : listes filtrables / triables  
- **Cards** : résumé projet/questionnaire  
- **Forms dynamiques** : saisie Q/R  
- **Timeline** : suivi workflow  
- **ChatBox** : communication utilisateurs  
- **Charts (Scores)** : visualisation CIA (Confidentialité, Intégrité, Disponibilité)  

---

### Architecture du projet

/secapp/ <br>
│
├── backend/ <br>
    ├── Dockerfile
│   ├── manage.py                # Point d’entrée Django<br>
│   ├── secapp/                  # Configs globales (settings, urls, wsgi)<br>
│   ├── questionnaires/          # App principale (questionnaires, docs, scores)<br>
│   ├── users/                   # App utilisateurs (auth, rôles, JWT)<br>
│   └── requirements.txt<br>
│
├── frontend/<br>
    ├── Dockerfile
│   ├── pages/                   # Pages Next.js (login, dashboard, etc.)<br>
│   ├── components/              # Composants réutilisables (UI)<br>
│   ├── services/                # Fonctions d’appel API centralisées<br>
│   ├── styles/<br>
│   └── package.json<br>
│
├── Database
    ├── Dockerfile
│
├── docker-compose.yml<br>
├── Jenkinsfile<br>
├── .env.example<br>
└── README.md<br>

---

### Variables d'environnement

```bash
# .env
DJANGO_SECRET_KEY=supersecretkey
DATABASE_URL=postgresql://user:password@db:5432/secapp
AZURE_OPENAI_KEY=sk-...
RESEND_API_KEY=re_12345
FRONTEND_URL=https://secapp.example.com
```


