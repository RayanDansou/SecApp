# SecApp



# Architecture Technique de la Solution

## Vue fonctionnelle
- Utilisateurs finaux : chefs de projet et analystes sécurité
- Actions principales : saisie du questionnaire, validation, consultation des scores de sécurité

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
