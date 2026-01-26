"""
Service d'analyse IA avec Azure OpenAI pour GuardianIQ
Analyse la cohérence entre les réponses du questionnaire et les documents techniques
Fichier modifié pour éviter les formulations "absolues" qui peuvent déclencher la modération
et pour rendre la récupération du JSON plus tolérante côté serveur.
"""

import os
import json
import time
import logging
import re
from typing import Dict, List, Any, Optional
from openai import AzureOpenAI
from django.conf import settings

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class AIAnalysisService:
    """
    Service pour effectuer l'analyse IA des questionnaires de sécurité

    Modifications principales :
    - Prompt système simplifié (moins d'impératifs absolus)
    - Schéma JSON demandé dans le message user (formulation souple)
    - Robustification du parsing JSON (tentatives de réparation)
    - Logging du prompt utilisé (sans clés/API)
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
        documents_content: Optional[List[str]] = None,
        language: str = 'fr'
    ) -> Dict[str, Any]:
        """
        Analyse la cohérence entre les réponses et les documents techniques

        Args:
            questionnaire_data: Données du questionnaire (titre, description)
            answers: Liste des réponses (question_text, answer_text)
            documents_content: Contenu extrait des documents techniques (optionnel)
            language: Langue de l'analyse ('fr' ou 'en')

        Returns:
            Dict contenant les résultats de l'analyse
        """
        start_time = time.time()

        # Construire le prompt utilisateur (souple) et le prompt système court
        prompt = self._build_analysis_prompt(questionnaire_data, answers, documents_content, language)
        system_prompt = self._get_system_prompt(language)

        # Construire le message user en demandant le format JSON de façon non-absolute
        preferred_schema = self._get_preferred_schema_text(language)
        user_message = prompt + "\n\n" + preferred_schema

        # Log (sans clefs) pour debug — utile pour reproduire les cas de modération
        try:
            logger.info("Sending prompt to Azure OpenAI (truncated): %s", user_message[:2000])
        except Exception:
            pass

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                response_format={"type": "json_object"},
                max_completion_tokens=2000
            )

            # Extraire et parser la réponse de façon robuste
            ai_message_content = response.choices[0].message.content
            analysis_result = self._safe_parse_json(ai_message_content)

            # Si on n'a pas un dict valide, retourner une structure d'erreur
            if not isinstance(analysis_result, dict):
                raise ValueError("Impossible de parser une réponse JSON valide de l'IA")

            # Calculer le temps de traitement
            processing_time = time.time() - start_time

            # Ajouter les métadonnées
            analysis_result['model_used'] = self.model
            analysis_result['processing_time'] = processing_time

            return analysis_result

        except Exception as e:
            logger.exception("Erreur lors de l'appel Azure OpenAI: %s", str(e))
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
        """Retourne un prompt système court et descriptif (moins impératif)."""

        if language == 'en':
            return (
                "You are an experienced IT security analyst. Be precise, objective and safety-conscious. "
                "Analyze the consistency between questionnaire answers and technical documents when provided."
            )
        else:
            return (
                "Tu es un expert en sécurité informatique, précis et prudent. "
                "Analyse la cohérence entre les réponses au questionnaire et les documents techniques fournis si disponibles."
            )

    def _get_preferred_schema_text(self, language: str = 'fr') -> str:
        """Texte décrivant le schéma JSON demandé de manière souple (pour message user)."""
        if language == 'en':
            return (
                "Preferred output format (if possible):\n"
                "Return a JSON object containing the following fields: \n"
                "- coherence_score: number (0-100)\n"
                "- confidentiality_score: number (0-100)\n"
                "- integrity_score: number (0-100)\n"
                "- availability_score: number (0-100)\n"
                "- analysis_summary: short text (2-3 sentences)\n"
                "- inconsistencies: list of {type, description, severity} objects\n"
                "- strengths: list of strings\n"
                "- weaknesses: list of strings\n"
                "- recommendations: list of {priority, category, recommendation} objects\n"
                "- question_analysis: map question_number -> {assessment, risk_level, comment}\n\n"
                "If you cannot produce strictly valid JSON, give a brief diagnostic explaining why, then provide the most structured output you can."
            )
        else:
            return (
                "Format de sortie souhaité (si possible):\n"
                "Retourne un objet JSON contenant les champs suivants :\n"
                "- coherence_score : nombre (0-100)\n"
                "- confidentiality_score : nombre (0-100)\n"
                "- integrity_score : nombre (0-100)\n"
                "- availability_score : nombre (0-100)\n"
                "- analysis_summary : texte court (2-3 phrases)\n"
                "- inconsistencies : liste d'objets {type, description, severity}\n"
                "- strengths : liste de chaînes\n"
                "- weaknesses : liste de chaînes\n"
                "- recommendations : liste d'objets {priority, category, recommendation}\n"
                "- question_analysis : map numéro_question -> {assessment, risk_level, comment}\n\n"
                "Si tu ne peux pas produire strictement un JSON valide, donne d'abord un bref diagnostic expliquant pourquoi, puis fournis la sortie la plus structurée possible."
            )

    def _build_analysis_prompt(
        self,
        questionnaire_data: Dict[str, Any],
        answers: List[Dict[str, str]],
        documents_content: Optional[List[str]] = None,
        language: str = 'fr'
    ) -> str:
        """Construit le prompt utilisateur pour l'analyse dans la langue demandée (sans impératifs absolus)."""

        if language == 'en':
            prompt = f"""# GuardianIQ Security Analysis

## Questionnaire: {questionnaire_data.get('title', 'Untitled')}

**Questionnaire description:**
{questionnaire_data.get('description', 'No description')}

---

## Project Manager Responses

"""
            for idx, answer in enumerate(answers, 1):
                prompt += f"""

### Question {idx}
**Q:** {answer.get('question_text', 'N/A')}
**A:** {answer.get('answer_text', 'No answer')}

"""

            if documents_content and len(documents_content) > 0:
                prompt += "\n---\n\n## Technical Architecture Documents\n\n"
                for idx, doc_content in enumerate(documents_content, 1):
                    truncated_content = doc_content[:3000] if len(doc_content) > 3000 else doc_content
                    prompt += f"""

### Document {idx}
{truncated_content}
{'[...]' if len(doc_content) > 3000 else ''}

"""
            else:
                prompt += "\n---\n\n**Note:** No technical architecture documents provided. Analysis based solely on responses.\n\n"

            prompt += "\n---\n\n## Analysis Instructions\n\nPerform an in-depth analysis of:\n1. Coherence between the provided responses and technical documents (if available)\n2. Security risks identified in the responses\n3. Security maturity level of the project\n4. Recommendations to improve the security posture\n\nProvide your analysis and prefer the JSON format described."

        else:
            prompt = f"""# Analyse de Sécurité GuardianIQ

## Questionnaire: {questionnaire_data.get('title', 'Sans titre')}

**Description du questionnaire:**
{questionnaire_data.get('description', 'Aucune description')}

---

## Réponses du Chef de Projet

"""
            for idx, answer in enumerate(answers, 1):
                prompt += f"""

### Question {idx}
**Q:** {answer.get('question_text', 'N/A')}
**R:** {answer.get('answer_text', 'Pas de réponse')}

"""

            if documents_content and len(documents_content) > 0:
                prompt += "\n---\n\n## Documents d'Architecture Technique\n\n"
                for idx, doc_content in enumerate(documents_content, 1):
                    truncated_content = doc_content[:3000] if len(doc_content) > 3000 else doc_content
                    prompt += f"""

### Document {idx}
{truncated_content}
{'[...]' if len(doc_content) > 3000 else ''}

"""
            else:
                prompt += "\n---\n\n**Note:** Aucun document d'architecture technique n'a été fourni. Analyse basée uniquement sur les réponses.\n\n"

            prompt += "\n---\n\n## Instructions d'Analyse\n\nAnalyse en profondeur :\n1. La cohérence entre les réponses fournies et les documents techniques (si disponibles)\n2. Les risques de sécurité identifiés dans les réponses\n3. Le niveau de maturité sécurité du projet\n4. Les recommandations pour améliorer la posture de sécurité\n\nPréférez fournir la sortie au format JSON décrit dans les instructions (voir fin du message)."

        return prompt

    def _safe_parse_json(self, text: str) -> Any:
        """Tente plusieurs stratégies pour parser le JSON renvoyé par le modèle.

        - Première tentative : json.loads direct
        - Si échec : extraire le premier bloc JSON trouvé via regex
        - Si échec : tenter de nettoyer les caractères non-ASCII/contrôles puis réessayer
        - Enfin : retourner la chaîne d'origine si aucune réparation n'est possible
        """
        # 1) Tentative directe
        try:
            return json.loads(text)
        except Exception:
            pass

        # 2) Extraction du premier bloc JSON (cherche { ... } ou [ ... ])
        try:
            # Trouver le premier '{' et le dernier '}' correspondant en utilisant une approche simple
            json_candidates = re.findall(r"\{(?:[^{}]|(?R))*\}", text)
            if json_candidates:
                for cand in json_candidates:
                    try:
                        return json.loads(cand)
                    except Exception:
                        continue
        except re.error:
            # si la regex récursive n'est pas supportée, utiliser une extraction plus simple
            try:
                # extrait le contenu entre le premier { et le dernier }
                start = text.find('{')
                end = text.rfind('}')
                if start != -1 and end != -1 and end > start:
                    cand = text[start:end+1]
                    return json.loads(cand)
            except Exception:
                pass

        # 3) Nettoyage basique et tentative finale
        try:
            cleaned = ''.join(ch for ch in text if ord(ch) >= 32 or ch in '\n\t\r')
            return json.loads(cleaned)
        except Exception:
            # 4) Aucun JSON réussi — retourner une structure informative
            return {
                'raw_response': text,
                'parse_error': 'Unable to parse JSON from model response'
            }


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
