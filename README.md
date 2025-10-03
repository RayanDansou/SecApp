# SecApp



# Architecture Technique de la Solution

## Vue fonctionnelle
- Utilisateurs finaux : chefs de projet, analystes sécurité et business owner
- Actions principales : saisie du questionnaire, validation, consultation des scores de sécurité

### Chef de projet
- Peut créer et remplir un questionnaire de sécurité
- Peut uploader un document d’architecture technique (ex : Word, PDF)
- Peut consulter l’état d’avancement du questionnaire (en attente, en validation, validé, rejeté)
- Peut échanger avec l’analyste via un système de communication intégré (notification, messagerie ou mail automatique)

### Analyste sécurité
- Peut accéder aux questionnaires remplis par les chefs de projet.
- Peut consulter les documents d’architecture technique associés.
- Peut valider ou rejeter un questionnaire de sécurité (workflow de validation).
- Peut fournir des recommandations de sécurité à partir des données collectées (questionnaire + documents).
- Peut envoyer un retour au chef de projet via le système de communication intégré (notification, messagerie ou mail automatique)

### Business owner
- rôle limité mais doit pouvoir consulter les questionnaires validés/rejetés et leur recommandations
- porte une attention particulière aux besoins non fonctionnels (intégrité, disponibilité, confidentialité)
- peur envoyer des retours à l'analyste via un système de communication intégré (notification, messagerie ou mail automatique)*

## Processus métier

- Le chef de projet initie un projet et remplit le questionnaire de sécurité sur la plateforme
- Il joint un document d'architecture technique
- Le système compile les données du questionnaire et du document d'architecture technique et transmet le tout à l'analyste
- L'analyste sécurité consulte les éléments et valide ou rejette le questionnaire (c'est ici que l'IA doit intervenir)
- La plateforme notifie le chef de projet
- Les résultats finaux sont accessibles au business owner
- Tout au long du processus, la plateforme doit permettre les échanges (via envoi de mails)

## Besoins fonctionnels

- Gestion des utilisateurs et rôles : création de comptes, affectation de rôles (admin, chef de projet, analyste, business owner), authentification sécurisée
- Questionnaire de sécurité partie 1 : Création, remplissage, sauvegarde partielle, soumission
- Questionnaire de sécurité partie 2 : Workflow de validation (états : brouillon, soumis, en cours d'analyse, validé, rejeté)
- Gestion électronique des documents (GED) : Upload, Association de documents à un questionnaire donné, consultation
- Communication intégrée : notifications automatiques par email (soumission, validation, rejet, commentaire)
- Assistance par IA : Génération de recommandations de sécurité adaptées (sur la base du questionnaire + documents)
- Traçabilité : Historique des échanges mails, Journalisation des validations/rejets, archivage des questionnaires et recommandations

## Besoins non fonctionnels

- Confidentialité : données sensibles protégées (stockage chiffré, transmission sécurisée).

- Intégrité : aucun document ni questionnaire ne doit être modifiable après soumission, sauf via des workflows définis.

- Disponibilité : la plateforme doit être accessible avec un haut niveau de disponibilité.

- Traçabilité : logs complets des actions pour assurer un suivi en cas d’incident.

- Sécurité :
    → Accès limité selon rôles.
    → Prévention des fuites de données (droits de téléchargement, accès limité aux docs).

## Composants techniques
- Frontend : React / Next.js pour le formulaire et le tableau de bord
- Backend API : Django + Django REST Framework
- IA / Scoring : Azure OpenAI pour recommandations et scoring
- Base de données : PostgreSQL pour questionnaires, réponses, scores et logs
- Email : Resend pour notifications

## Modèles Django simplifiés

```python
from django.db import models
from django.contrib.auth.models import User

class Questionnaire(models.Model):
    title = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    validated = models.BooleanField(default=False)

class Question(models.Model):
    questionnaire = models.ForeignKey(Questionnaire, on_delete=models.CASCADE)
    text = models.TextField()
    response = models.TextField(blank=True, null=True)

class Score(models.Model):
    questionnaire = models.OneToOneField(Questionnaire, on_delete=models.CASCADE)
    confidentiality = models.IntegerField()
    integrity = models.IntegerField()
    availability = models.IntegerField()
    generated_at = models.DateTimeField(auto_now_add=True)
```

## Authentification

Django Auth avec username/password

Login : POST /api/auth/login/ avec body { "username": "...", "password": "..." } → retourne token JWT

Logout : POST /api/auth/logout/ avec header Authorization : Bearer <token>

## Endpoints API

GET /api/questionnaires/ → Récupère tous les questionnaires

POST /api/questionnaires/ → Crée un nouveau questionnaire avec body { "title": "..." }

GET /api/questionnaires/{id}/questions/ → Récupère les questions d’un questionnaire

POST /api/questionnaires/{id}/questions/ → Ajoute une question avec body { "text": "..." }

POST /api/questionnaires/{id}/submit/ → Soumet les réponses { "responses": [...] } → trigger IA recommandations

POST /api/questionnaires/{id}/validate/ → Validation { "validated": true/false } → trigger scoring si true

GET /api/questionnaires/{id}/score/ → Récupération des scores finaux { "confidentiality": 0, "integrity": 0, "availability": 0 }

## Flow technique détaillé

Le frontend soumet les réponses via POST /api/questionnaires/{id}/submit/.

Le backend stocke les réponses dans PostgreSQL.

Le backend appelle Azure OpenAI pour générer les recommandations initiales.

Le backend utilise Resend pour envoyer un email à l’analyste avec un lien de validation :

import requests

resend_api_key = "RESEND_API_KEY"
response = requests.post(
    "https://api.resend.com/emails",
    headers={"Authorization": f"Bearer {resend_api_key}"},
    json={
        "from": "no-reply@monapp.com",
        "to": ["analyste@exemple.com"],
        "subject": "Validation requise",
        "html": "<p>Un questionnaire doit être validé.</p>"
    }
)


L’analyste valide via POST /api/questionnaires/{id}/validate/.

Si validé, le backend déclenche le scoring final via Azure OpenAI.

Les résultats sont stockés dans la table Score.

Le chef de projet consulte les scores via GET /api/questionnaires/{id}/score/ et le frontend affiche Confidentialité, Intégrité, Disponibilité.


## Sécurité technique

Authentification via username/password, tokens JWT ou session cookie

HTTPS obligatoire pour toutes les communications

Validation côté backend pour toutes les entrées utilisateur

Journalisation complète des actions : création, soumission, validation, scoring

### Diagramme de flux (linéaire)

Frontend (React)
     |
POST /submit -> Backend (Django REST)
     |                       \
     |                        --> Azure OpenAI (reco initiale)
     |
     --> Resend Email --> Analyste
                               |
POST /validate  ----------------|
     |
Backend -> Azure OpenAI (scoring final)
     |
DB (PostgreSQL) <-- Score final
     |
Frontend -> affichage scores

## Architecture du projet

- 2 Parties : Frontend et backend
- Chaque projet est conteneurisé avec sa propre image et son propre dockerfile 
- Un docker compose permet de démarrer les services suivants
    - Frontend
    - Backend
    - Base de données

- On ajoutera des scripts permettant automatiquement de créer des images pour chaque projet (.sh)
- On ajoutera un script permattant de lancer le docker compose


## pipeline Jenkins 


## base de données
 - On aura une base de données relationnelle PostGreSQL conteneurisée 

## coucou