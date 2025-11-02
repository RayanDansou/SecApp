"""
Service d'analyse IA avec Azure OpenAI pour GuardianIQ
Analyse la cohérence entre les réponses du questionnaire et les documents techniques
"""

import os
import json
import time
from typing import Dict, List, Any
from openai import AzureOpenAI
from django.conf import settings


class AIAnalysisService:
    """
    Service pour effectuer l'analyse IA des questionnaires de sécurité
    """

    def __init__(self):
        """Initialise le client Azure OpenAI"""
        self.client = AzureOpenAI(
            api_key=os.getenv('AZURE_OPENAI_KEY'),
            api_version=os.getenv('AZURE_OPENAI_API_VERSION', '2024-02-15-preview'),
            azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT')
        )
        self.model = os.getenv('AZURE_OPENAI_MODEL', 'gpt-4o-mini')

    def analyze_questionnaire_response(
        self,
        questionnaire_data: Dict[str, Any],
        answers: List[Dict[str, str]],
        documents_content: List[str] = None,
        language: str = 'fr'
    ) -> Dict[str, Any]:
        """
        Analyse la cohérence entre les réponses et les documents techniques

        Args:
            questionnaire_data: Données du questionnaire (titre, description)
            answers: Liste des réponses (question, answer_text)
            documents_content: Contenu extrait des documents techniques (optionnel)
            language: Langue de l'analyse ('fr' ou 'en')

        Returns:
            Dict contenant les résultats de l'analyse
        """
        start_time = time.time()

        # Construire le prompt pour l'IA
        prompt = self._build_analysis_prompt(questionnaire_data, answers, documents_content, language)

        try:
            # Appeler Azure OpenAI
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": self._get_system_prompt(language)
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                max_completion_tokens=4000
            )

            # Extraire et parser la réponse
            ai_response = response.choices[0].message.content
            analysis_result = json.loads(ai_response)

            # Calculer le temps de traitement
            processing_time = time.time() - start_time

            # Ajouter les métadonnées
            analysis_result['model_used'] = self.model
            analysis_result['processing_time'] = processing_time

            return analysis_result

        except Exception as e:
            # En cas d'erreur, retourner une réponse par défaut
            return {
                'error': str(e),
                'coherence_score': 0,
                'confidentiality_score': 0,
                'integrity_score': 0,
                'availability_score': 0,
                'analysis_summary': f"Erreur lors de l'analyse IA: {str(e)}",
                'inconsistencies': [],
                'strengths': [],
                'weaknesses': [],
                'recommendations': [],
                'question_analysis': {},
                'model_used': self.model,
                'processing_time': time.time() - start_time
            }

    def _get_system_prompt(self, language: str = 'fr') -> str:
        """Retourne le prompt système pour l'IA dans la langue demandée"""

        if language == 'en':
            return """You are an IT security expert specialized in analyzing the coherence of technical architectures.

Your role is to analyze the responses to a security questionnaire and compare them with the technical architecture documents provided (if available).

You must evaluate:
1. The overall coherence between responses and documents
2. CIA security scores (Confidentiality, Integrity, Availability) from 0 to 100
3. Potential inconsistencies
4. Architecture strengths
5. Weaknesses and risks
6. Concrete recommendations to improve security

ALWAYS provide your response in the following strict JSON format:
{
    "coherence_score": <score 0-100>,
    "confidentiality_score": <score 0-100>,
    "integrity_score": <score 0-100>,
    "availability_score": <score 0-100>,
    "analysis_summary": "<summary in 2-3 sentences>",
    "inconsistencies": [
        {
            "type": "<inconsistency type>",
            "description": "<detailed description>",
            "severity": "<low|medium|high|critical>"
        }
    ],
    "strengths": [
        "<strength 1>",
        "<strength 2>"
    ],
    "weaknesses": [
        "<weakness 1>",
        "<weakness 2>"
    ],
    "recommendations": [
        {
            "priority": "<high|medium|low>",
            "category": "<security category>",
            "recommendation": "<detailed recommendation>"
        }
    ],
    "question_analysis": {
        "<question number>": {
            "assessment": "<response assessment>",
            "risk_level": "<low|medium|high>",
            "comment": "<comment>"
        }
    }
}"""
        else:  # French (default)
            return """Tu es un expert en sécurité informatique spécialisé dans l'analyse de cohérence des architectures techniques.

Ton rôle est d'analyser les réponses à un questionnaire de sécurité et de les comparer avec les documents d'architecture technique fournis (si disponibles).

Tu dois évaluer:
1. La cohérence globale entre les réponses et les documents
2. Les scores de sécurité CIA (Confidentialité, Intégrité, Disponibilité) de 0 à 100
3. Les incohérences potentielles
4. Les points forts de l'architecture
5. Les points faibles et risques
6. Des recommandations concrètes pour améliorer la sécurité

Fournis TOUJOURS ta réponse au format JSON strict suivant:
{
    "coherence_score": <score 0-100>,
    "confidentiality_score": <score 0-100>,
    "integrity_score": <score 0-100>,
    "availability_score": <score 0-100>,
    "analysis_summary": "<résumé en 2-3 phrases>",
    "inconsistencies": [
        {
            "type": "<type d'incohérence>",
            "description": "<description détaillée>",
            "severity": "<low|medium|high|critical>"
        }
    ],
    "strengths": [
        "<point fort 1>",
        "<point fort 2>"
    ],
    "weaknesses": [
        "<point faible 1>",
        "<point faible 2>"
    ],
    "recommendations": [
        {
            "priority": "<high|medium|low>",
            "category": "<categorie de sécurité>",
            "recommendation": "<recommandation détaillée>"
        }
    ],
    "question_analysis": {
        "<numéro question>": {
            "assessment": "<évaluation de la réponse>",
            "risk_level": "<low|medium|high>",
            "comment": "<commentaire>"
        }
    }
}"""

    def _build_analysis_prompt(
        self,
        questionnaire_data: Dict[str, Any],
        answers: List[Dict[str, str]],
        documents_content: List[str] = None,
        language: str = 'fr'
    ) -> str:
        """Construit le prompt utilisateur pour l'analyse dans la langue demandée"""

        if language == 'en':
            prompt = f"""# GuardianIQ Security Analysis

## Questionnaire: {questionnaire_data.get('title', 'Untitled')}

**Questionnaire description:**
{questionnaire_data.get('description', 'No description')}

---

## Project Manager Responses

"""

            # Add questions and answers
            for idx, answer in enumerate(answers, 1):
                prompt += f"""
### Question {idx}
**Q:** {answer.get('question_text', 'N/A')}
**A:** {answer.get('answer_text', 'No answer')}

"""

            # Add documents if available
            if documents_content and len(documents_content) > 0:
                prompt += """
---

## Technical Architecture Documents

"""
                for idx, doc_content in enumerate(documents_content, 1):
                    truncated_content = doc_content[:3000] if len(doc_content) > 3000 else doc_content
                    prompt += f"""
### Document {idx}
{truncated_content}
{'[...]' if len(doc_content) > 3000 else ''}

"""
            else:
                prompt += """
---

**Note:** No technical architecture documents provided. Analysis based solely on responses.

"""

            prompt += """
---

## Analysis Instructions

Perform an in-depth analysis of:
1. Coherence between the provided responses and technical documents (if available)
2. Security risks identified in the responses
3. Security maturity level of the project
4. Recommendations to improve the security posture

Provide your analysis in the JSON format requested in the system instructions.
"""

        else:  # French (default)
            prompt = f"""# Analyse de Sécurité GuardianIQ

## Questionnaire: {questionnaire_data.get('title', 'Sans titre')}

**Description du questionnaire:**
{questionnaire_data.get('description', 'Aucune description')}

---

## Réponses du Chef de Projet

"""

            # Ajouter les questions et réponses
            for idx, answer in enumerate(answers, 1):
                prompt += f"""
### Question {idx}
**Q:** {answer.get('question_text', 'N/A')}
**R:** {answer.get('answer_text', 'Pas de réponse')}

"""

            # Ajouter les documents si disponibles
            if documents_content and len(documents_content) > 0:
                prompt += """
---

## Documents d'Architecture Technique

"""
                for idx, doc_content in enumerate(documents_content, 1):
                    # Limiter la longueur du contenu du document
                    truncated_content = doc_content[:3000] if len(doc_content) > 3000 else doc_content
                    prompt += f"""
### Document {idx}
{truncated_content}
{'[...]' if len(doc_content) > 3000 else ''}

"""
            else:
                prompt += """
---

**Note:** Aucun document d'architecture technique n'a été fourni. Analyse basée uniquement sur les réponses.

"""

            prompt += """
---

## Instructions d'Analyse

Analyse en profondeur:
1. La cohérence entre les réponses fournies et les documents techniques (si disponibles)
2. Les risques de sécurité identifiés dans les réponses
3. Le niveau de maturité sécurité du projet
4. Les recommandations pour améliorer la posture de sécurité

Fournis ton analyse au format JSON demandé dans les instructions système.
"""

        return prompt


def extract_document_content(document_path: str) -> str:
    """
    Extrait le contenu textuel d'un document

    Args:
        document_path: Chemin vers le document

    Returns:
        Contenu textuel du document
    """
    # TODO: Implémenter l'extraction selon le type de fichier
    # Pour PDF: utiliser PyPDF2 ou pdfplumber
    # Pour DOCX: utiliser python-docx
    # Pour TXT: lecture simple

    try:
        # Pour l'instant, retourner un placeholder
        # Dans une implémentation complète, utiliser des bibliothèques comme:
        # - PyPDF2 pour les PDF
        # - python-docx pour les DOCX
        # - Lecture simple pour les TXT

        extension = document_path.split('.')[-1].lower()

        if extension == 'txt':
            with open(document_path, 'r', encoding='utf-8') as f:
                return f.read()
        elif extension == 'pdf':
            # Placeholder - nécessite PyPDF2
            return f"[Contenu PDF non extrait - chemin: {document_path}]"
        elif extension in ['doc', 'docx']:
            # Placeholder - nécessite python-docx
            return f"[Contenu DOCX non extrait - chemin: {document_path}]"
        else:
            return f"[Format non supporté: {extension}]"

    except Exception as e:
        return f"[Erreur lors de l'extraction: {str(e)}]"
