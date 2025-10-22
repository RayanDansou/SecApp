"""
Users app configuration
"""
from django.apps import AppConfig


class UsersConfig(AppConfig):
    """Configuration pour l'application Users"""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
    verbose_name = 'Gestion des Utilisateurs'

    def ready(self):
        """
        Import des signals quand l'application est prête
        """
        try:
            import users.signals  # noqa
        except ImportError:
            pass
