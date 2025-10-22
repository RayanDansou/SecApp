"""
Questionnaires app configuration
"""
from django.apps import AppConfig


class QuestionnairesConfig(AppConfig):
    """Configuration pour l'application Questionnaires"""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'questionnaires'
    verbose_name = 'Gestion des Questionnaires de Sécurité'

    def ready(self):
        """
        Import des signals quand l'application est prête
        """
        try:
            import questionnaires.signals  # noqa
        except ImportError:
            pass
