from django.apps import AppConfig


class QuestionnairesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'questionnaires'

    def ready(self):
        """
        Import signals when the app is ready
        """
        import questionnaires.signals
