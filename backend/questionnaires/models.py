from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator


class Questionnaire(models.Model):
    """
    Modèle Questionnaire (Template créé par l'analyste).
    Seul l'analyste peut créer un questionnaire template.
    """

    title = models.CharField(
        max_length=255,
        verbose_name="Titre"
    )

    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_questionnaires',
        verbose_name="Créé par (Analyste)",
        limit_choices_to={'role': 'ANALYSTE'}
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Date de modification"
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name="Actif"
    )

    class Meta:
        verbose_name = "Questionnaire (Template)"
        verbose_name_plural = "Questionnaires (Templates)"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} (par {self.created_by.username})"


class Question(models.Model):
    """
    Questions du questionnaire template.
    """

    questionnaire = models.ForeignKey(
        Questionnaire,
        on_delete=models.CASCADE,
        related_name='questions',
        verbose_name="Questionnaire"
    )

    text = models.TextField(
        verbose_name="Texte de la question"
    )

    order = models.PositiveIntegerField(
        default=0,
        verbose_name="Ordre d'affichage"
    )

    is_required = models.BooleanField(
        default=True,
        verbose_name="Obligatoire"
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )

    class Meta:
        verbose_name = "Question"
        verbose_name_plural = "Questions"
        ordering = ['questionnaire', 'order']

    def __str__(self):
        return f"Q{self.order}: {self.text[:50]}..."


class QuestionnaireDocument(models.Model):
    """
    Fichiers associés au questionnaire template (par l'analyste).
    """

    questionnaire = models.ForeignKey(
        Questionnaire,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name="Questionnaire"
    )

    file = models.FileField(
        upload_to='questionnaire_docs/%Y/%m/%d/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'txt'])],
        verbose_name="Fichier"
    )

    filename = models.CharField(
        max_length=255,
        verbose_name="Nom du fichier"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date d'upload"
    )

    class Meta:
        verbose_name = "Document du questionnaire"
        verbose_name_plural = "Documents des questionnaires"
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.filename} ({self.questionnaire.title})"


class QuestionnaireResponse(models.Model):
    """
    Instance de réponse à un questionnaire (rempli par un chef de projet).
    Chaque chef de projet crée sa propre instance de réponse.
    """

    class Status(models.TextChoices):
        BROUILLON = 'BROUILLON', 'Brouillon'
        SOUMIS = 'SOUMIS', 'Soumis'
        EN_ATTENTE = 'EN_ATTENTE', 'En attente'
        EN_VALIDATION = 'EN_VALIDATION', 'En validation'
        VALIDE = 'VALIDE', 'Validé'
        REJETE = 'REJETE', 'Rejeté'

    questionnaire = models.ForeignKey(
        Questionnaire,
        on_delete=models.CASCADE,
        related_name='responses',
        verbose_name="Questionnaire (Template)"
    )

    responder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='questionnaire_responses',
        verbose_name="Rempli par (Chef de projet)",
        limit_choices_to={'role': 'CHEF_PROJET'}
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.BROUILLON,
        verbose_name="Statut"
    )

    submitted_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de soumission"
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Date de modification"
    )

    class Meta:
        verbose_name = "Réponse au questionnaire"
        verbose_name_plural = "Réponses aux questionnaires"
        ordering = ['-created_at']
        unique_together = ['questionnaire', 'responder']

    def __str__(self):
        return f"{self.questionnaire.title} - {self.responder.username} ({self.get_status_display()})"


class Answer(models.Model):
    """
    Réponses aux questions d'un questionnaire.
    """

    response = models.ForeignKey(
        QuestionnaireResponse,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name="Réponse au questionnaire"
    )

    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name="Question"
    )

    answer_text = models.TextField(
        verbose_name="Réponse"
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Date de modification"
    )

    class Meta:
        verbose_name = "Réponse"
        verbose_name_plural = "Réponses"
        unique_together = ['response', 'question']

    def __str__(self):
        return f"Réponse à: {self.question.text[:50]}..."


class ResponseDocument(models.Model):
    """
    Documents d'architecture uploadés par le chef de projet.
    """

    response = models.ForeignKey(
        QuestionnaireResponse,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name="Réponse au questionnaire"
    )

    file = models.FileField(
        upload_to='response_docs/%Y/%m/%d/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])],
        verbose_name="Fichier d'architecture"
    )

    filename = models.CharField(
        max_length=255,
        verbose_name="Nom du fichier"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date d'upload"
    )

    class Meta:
        verbose_name = "Document de réponse"
        verbose_name_plural = "Documents de réponse"
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.filename}"


class Comment(models.Model):
    """
    Commentaires/Recommandations sur une réponse au questionnaire.
    Tous les rôles peuvent commenter.
    """

    response = models.ForeignKey(
        QuestionnaireResponse,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name="Réponse au questionnaire"
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name="Auteur"
    )

    content = models.TextField(
        verbose_name="Commentaire"
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )

    class Meta:
        verbose_name = "Commentaire"
        verbose_name_plural = "Commentaires"
        ordering = ['created_at']

    def __str__(self):
        return f"Commentaire de {self.author.username} - {self.created_at.strftime('%d/%m/%Y')}"


class StatusHistory(models.Model):
    """
    Historique des changements de statut d'une réponse au questionnaire.
    """

    response = models.ForeignKey(
        QuestionnaireResponse,
        on_delete=models.CASCADE,
        related_name='status_history',
        verbose_name="Réponse au questionnaire"
    )

    old_status = models.CharField(
        max_length=20,
        choices=QuestionnaireResponse.Status.choices,
        null=True,
        blank=True,
        verbose_name="Ancien statut"
    )

    new_status = models.CharField(
        max_length=20,
        choices=QuestionnaireResponse.Status.choices,
        verbose_name="Nouveau statut"
    )

    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='status_changes',
        verbose_name="Modifié par"
    )

    comment = models.TextField(
        blank=True,
        verbose_name="Commentaire"
    )

    changed_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de modification"
    )

    class Meta:
        verbose_name = "Historique de statut"
        verbose_name_plural = "Historiques de statut"
        ordering = ['-changed_at']

    def __str__(self):
        return f"{self.old_status or 'Création'} → {self.new_status} ({self.changed_at.strftime('%d/%m/%Y %H:%M')})"


class AIAnalysis(models.Model):
    """
    Résultats de l'analyse IA sur la cohérence entre les réponses et les documents techniques.
    """

    response = models.ForeignKey(
        QuestionnaireResponse,
        on_delete=models.CASCADE,
        related_name='ai_analyses',
        verbose_name="Réponse au questionnaire"
    )

    analyst = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='ai_analyses_requested',
        verbose_name="Analyste demandeur",
        limit_choices_to={'role': 'ANALYSTE'}
    )

    # Score global de cohérence (0-100)
    coherence_score = models.IntegerField(
        verbose_name="Score de cohérence global",
        help_text="Score de 0 à 100 indiquant la cohérence entre réponses et documents"
    )

    # Scores CIA (Confidentialité, Intégrité, Disponibilité)
    confidentiality_score = models.IntegerField(
        verbose_name="Score de confidentialité",
        help_text="Score CIA - Confidentialité"
    )

    integrity_score = models.IntegerField(
        verbose_name="Score d'intégrité",
        help_text="Score CIA - Intégrité"
    )

    availability_score = models.IntegerField(
        verbose_name="Score de disponibilité",
        help_text="Score CIA - Disponibilité"
    )

    # Résultats détaillés de l'analyse
    analysis_summary = models.TextField(
        verbose_name="Résumé de l'analyse",
        help_text="Résumé général de l'analyse IA"
    )

    inconsistencies = models.JSONField(
        verbose_name="Incohérences détectées",
        help_text="Liste des incohérences entre réponses et documents",
        default=list,
        blank=True
    )

    strengths = models.JSONField(
        verbose_name="Points forts",
        help_text="Points positifs identifiés par l'IA",
        default=list,
        blank=True
    )

    weaknesses = models.JSONField(
        verbose_name="Points faibles",
        help_text="Points d'amélioration identifiés par l'IA",
        default=list,
        blank=True
    )

    recommendations = models.JSONField(
        verbose_name="Recommandations",
        help_text="Recommandations de sécurité de l'IA",
        default=list,
        blank=True
    )

    # Analyse par question (optionnel)
    question_analysis = models.JSONField(
        verbose_name="Analyse par question",
        help_text="Analyse détaillée question par question",
        default=dict,
        blank=True
    )

    # Métadonnées
    model_used = models.CharField(
        max_length=100,
        verbose_name="Modèle IA utilisé",
        help_text="Ex: gpt-4o-mini"
    )

    language = models.CharField(
        max_length=10,
        verbose_name="Langue de l'analyse",
        help_text="Langue dans laquelle l'analyse a été générée (fr ou en)",
        default='fr',
        choices=[
            ('fr', 'Français'),
            ('en', 'English')
        ]
    )

    processing_time = models.FloatField(
        verbose_name="Temps de traitement (secondes)",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )

    class Meta:
        verbose_name = "Analyse IA"
        verbose_name_plural = "Analyses IA"
        ordering = ['-created_at']

    def __str__(self):
        return f"Analyse IA - {self.response.questionnaire.title} ({self.coherence_score}%)"


class Notification(models.Model):
    """
    Modèle pour les notifications des utilisateurs.
    Les notifications datant de plus de 3 jours seront automatiquement supprimées.
    """

    class NotificationType(models.TextChoices):
        STATUS_CHANGE = 'STATUS_CHANGE', 'Changement de statut'
        NEW_RESPONSE = 'NEW_RESPONSE', 'Nouvelle réponse'
        NEW_COMMENT = 'NEW_COMMENT', 'Nouveau commentaire'
        RESPONSE_VALIDATED = 'RESPONSE_VALIDATED', 'Réponse validée'
        RESPONSE_REJECTED = 'RESPONSE_REJECTED', 'Réponse rejetée'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name="Destinataire"
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_notifications',
        verbose_name="Expéditeur",
        null=True,
        blank=True
    )

    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        verbose_name="Type de notification"
    )

    title = models.CharField(
        max_length=255,
        verbose_name="Titre"
    )

    message = models.TextField(
        verbose_name="Message"
    )

    # Liens vers les objets concernés
    response = models.ForeignKey(
        'QuestionnaireResponse',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name="Réponse concernée"
    )

    comment = models.ForeignKey(
        'Comment',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name="Commentaire concerné"
    )

    is_read = models.BooleanField(
        default=False,
        verbose_name="Lu"
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f"Notification pour {self.recipient.username}: {self.title}"
