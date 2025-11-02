# Guide d'utilisation de l'Analyse IA GuardianIQ

## Vue d'ensemble

La fonctionnalité d'analyse IA de GuardianIQ permet aux analystes de sécurité de déclencher une analyse automatique pour évaluer la cohérence entre les réponses d'un questionnaire de sécurité et les documents d'architecture technique fournis.

## Fonctionnalités

L'analyse IA évalue automatiquement :

### 1. Score de Cohérence Global (0-100%)
- Évalue la cohérence globale entre les réponses et les documents techniques
- Affichage visuel avec cercle de score coloré
- Interprétation : Excellent (≥80%), Bon (≥60%), Moyen (≥40%), Faible (<40%)

### 2. Scores CIA (Confidentialité, Intégrité, Disponibilité)
- **Confidentialité** : Évaluation des mesures de protection des données
- **Intégrité** : Évaluation des contrôles d'intégrité des données
- **Disponibilité** : Évaluation de la résilience et disponibilité du système
- Chaque score sur 100 points avec barre de progression colorée

### 3. Détection d'Incohérences
- Identifie les incohérences entre réponses et documents
- Classées par sévérité : Critical, High, Medium, Low
- Chaque incohérence comprend :
  - Type d'incohérence
  - Description détaillée
  - Niveau de sévérité

### 4. Points Forts et Points Faibles
- **Points Forts** : Aspects positifs de l'architecture
- **Points Faibles** : Zones nécessitant des améliorations
- Présentation claire et visuelle

### 5. Recommandations de Sécurité
- Recommandations prioritaires pour améliorer la sécurité
- Classées par priorité : High, Medium, Low
- Chaque recommandation comprend :
  - Niveau de priorité
  - Catégorie de sécurité
  - Recommandation détaillée

### 6. Analyse par Question (optionnel)
- Évaluation détaillée question par question
- Niveau de risque par question
- Commentaires spécifiques

## Configuration Azure OpenAI

### Prérequis

1. **Compte Azure** avec accès à Azure OpenAI Service
2. **Ressource Azure OpenAI** créée
3. **Déploiement d'un modèle** (recommandé : gpt-4o-mini ou gpt-4)

### Étapes de configuration

#### 1. Créer une ressource Azure OpenAI

```bash
# Via Azure Portal
1. Accéder à portal.azure.com
2. Créer une nouvelle ressource "Azure OpenAI"
3. Choisir votre région et groupe de ressources
4. Attendre la création de la ressource
```

#### 2. Déployer un modèle

```bash
# Via Azure Portal
1. Accéder à votre ressource Azure OpenAI
2. Aller dans "Model deployments"
3. Cliquer "Create new deployment"
4. Choisir le modèle (recommandé : gpt-4o-mini)
5. Donner un nom au déploiement
6. Configurer les limites de tokens si nécessaire
```

#### 3. Récupérer les clés d'API

```bash
# Via Azure Portal
1. Accéder à votre ressource Azure OpenAI
2. Aller dans "Keys and Endpoint"
3. Copier :
   - KEY 1 ou KEY 2 → AZURE_OPENAI_KEY
   - Endpoint → AZURE_OPENAI_ENDPOINT
```

#### 4. Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` :

```bash
# Azure OpenAI Settings
AZURE_OPENAI_KEY=votre-cle-api-azure-openai
AZURE_OPENAI_ENDPOINT=https://votre-ressource.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_MODEL=gpt-4o-mini
```

## Utilisation pour les Analystes

### Déclencher une analyse IA

1. **Accéder au questionnaire soumis**
   - Se connecter en tant qu'analyste
   - Naviguer vers "Réponses Soumises"
   - Cliquer sur un questionnaire soumis

2. **Lancer l'analyse IA**
   - Dans la page de détails, repérer la section "Analyse IA"
   - Cliquer sur le bouton "Analyser avec IA"
   - Attendre quelques secondes (l'analyse peut prendre 10-30 secondes)

3. **Consulter les résultats**
   - Les résultats s'affichent automatiquement
   - Consulter les différentes sections :
     * Score de cohérence global
     * Scores CIA
     * Incohérences détectées
     * Points forts et faibles
     * Recommandations

4. **Relancer une analyse**
   - Il est possible de relancer une analyse à tout moment
   - Cliquer sur "Relancer l'analyse IA"
   - Une nouvelle analyse sera créée avec les données actuelles

### Interprétation des résultats

#### Score de Cohérence
- **80-100%** : Excellente cohérence, peu ou pas de divergences
- **60-79%** : Bonne cohérence, quelques ajustements mineurs nécessaires
- **40-59%** : Cohérence moyenne, plusieurs points à clarifier
- **0-39%** : Faible cohérence, révision majeure nécessaire

#### Scores CIA
Les scores CIA évaluent la maturité sécurité selon trois piliers :
- **Confidentialité** : Chiffrement, contrôle d'accès, classification des données
- **Intégrité** : Contrôles d'intégrité, validation, non-répudiation
- **Disponibilité** : Redondance, sauvegarde, plan de continuité

#### Niveaux de Sévérité
- **Critical** : Nécessite une action immédiate, risque majeur
- **High** : Doit être traité rapidement, risque important
- **Medium** : À traiter dans un délai raisonnable
- **Low** : Amélioration recommandée, faible risque

## Architecture Technique

### Backend

#### Modèle de données (`AIAnalysis`)
```python
class AIAnalysis(models.Model):
    response = ForeignKey(QuestionnaireResponse)
    analyst = ForeignKey(User)
    coherence_score = IntegerField()
    confidentiality_score = IntegerField()
    integrity_score = IntegerField()
    availability_score = IntegerField()
    analysis_summary = TextField()
    inconsistencies = JSONField()
    strengths = JSONField()
    weaknesses = JSONField()
    recommendations = JSONField()
    question_analysis = JSONField()
    model_used = CharField()
    processing_time = FloatField()
    created_at = DateTimeField()
```

#### Service IA (`ai_service.py`)
- Classe `AIAnalysisService` pour gérer les appels Azure OpenAI
- Fonction `analyze_questionnaire_response()` pour l'analyse complète
- Fonction `extract_document_content()` pour extraire le texte des documents
- Gestion d'erreurs robuste

#### Endpoints API
```
POST /api/responses/{id}/analyze_with_ai/  # Déclencher analyse
GET  /api/responses/{id}/ai_analyses/      # Récupérer analyses
```

### Frontend

#### Composant `AIAnalysisResults`
- Affichage du score de cohérence en cercle
- Barres de progression pour les scores CIA
- Liste des incohérences avec icônes de sévérité
- Cartes pour points forts/faibles
- Liste des recommandations avec priorités

#### Intégration dans `AnalysteResponseDetail`
- Bouton "Analyser avec IA" avec animation de chargement
- Gestion des états (loading, error, success)
- Affichage des résultats en temps réel
- Placeholder si pas encore d'analyse

## Dépendances

### Python (Backend)
```bash
openai>=1.0.0          # Client Azure OpenAI
python-dotenv>=1.0.0   # Variables d'environnement
PyPDF2>=3.0.0         # Extraction PDF (optionnel)
python-docx>=1.0.0    # Extraction DOCX (optionnel)
```

### JavaScript (Frontend)
```bash
lucide-react          # Icônes
react-i18next         # Internationalisation
```

## Installation et Migration

### 1. Installer les dépendances Python

```bash
cd backend
pip install openai python-dotenv
# Optionnel pour extraction de documents
pip install PyPDF2 python-docx
```

### 2. Créer et appliquer les migrations

```bash
cd backend
python manage.py makemigrations questionnaires
python manage.py migrate
```

### 3. Redémarrer le serveur Django

```bash
python manage.py runserver
```

### 4. Le frontend est déjà configuré

Les composants React ont été ajoutés et sont prêts à l'emploi.

## Limites et Considérations

### Limites Techniques
- **Temps de traitement** : 10-30 secondes selon la taille des données
- **Coût** : Chaque analyse consomme des tokens Azure OpenAI
- **Extraction de documents** : Actuellement limitée aux fichiers TXT (PDF/DOCX nécessitent bibliothèques additionnelles)

### Recommandations
- **Utiliser gpt-4o-mini** pour un bon rapport qualité/coût
- **Limiter les analyses** aux questionnaires réellement soumis
- **Surveiller les coûts** Azure OpenAI via le portail Azure
- **Implémenter un cache** pour éviter les analyses répétitives

## Sécurité

### Bonnes Pratiques
- ✅ Ne jamais committer le fichier `.env`
- ✅ Utiliser des clés API séparées pour dev/prod
- ✅ Limiter les permissions aux analystes seulement
- ✅ Journaliser toutes les analyses IA
- ✅ Nettoyer régulièrement les anciennes analyses

### Données Sensibles
- Les données envoyées à Azure OpenAI peuvent contenir des informations confidentielles
- S'assurer que votre contrat Azure OpenAI inclut la confidentialité des données
- Configurer Azure OpenAI pour ne PAS utiliser les données pour l'entraînement

## Dépannage

### Erreur "API Key Invalid"
```
Solution : Vérifier AZURE_OPENAI_KEY dans .env
```

### Erreur "Model not found"
```
Solution : Vérifier que AZURE_OPENAI_MODEL correspond au nom du déploiement
```

### Erreur "Endpoint not accessible"
```
Solution : Vérifier AZURE_OPENAI_ENDPOINT et les pare-feu
```

### Analyse très lente
```
Solution :
- Vérifier la taille des documents
- Considérer l'utilisation d'un modèle plus rapide
- Implémenter un timeout
```

## Support

Pour toute question ou problème :
1. Consulter la documentation Azure OpenAI officielle
2. Vérifier les logs Django (`python manage.py runserver`)
3. Inspecter la console navigateur pour les erreurs frontend

---

**Développé avec** ❤️ **pour GuardianIQ**
