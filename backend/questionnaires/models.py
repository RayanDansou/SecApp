from django.db import models
from django.conf import settings


class Questionnaire(models.Model):
    """
    Modèle Questionnaire pour stocker les questionnaires de sécurité.
    """

    class Status(models.TextChoices):
        BROUILLON = 'BROUILLON', 'Brouillon'
        SOUMIS = 'SOUMIS', 'Soumis'
        EN_ANALYSE = 'EN_ANALYSE', 'En cours d\'analyse'
        VALIDE = 'VALIDE', 'Validé'
        REJETE = 'REJETE', 'Rejeté'

    title = models.CharField(
        max_length=255,
        verbose_name="Titre"
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.BROUILLON,
        verbose_name="Statut"
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='questionnaires',
        verbose_name="Propriétaire"
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
        verbose_name = "Questionnaire"
        verbose_name_plural = "Questionnaires"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
