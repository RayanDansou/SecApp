from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from questionnaires.models import Notification


class Command(BaseCommand):
    help = 'Supprime les notifications datant de plus de 3 jours'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=3,
            help='Nombre de jours à conserver (défaut: 3)'
        )

    def handle(self, *args, **options):
        days = options['days']
        cutoff_date = timezone.now() - timedelta(days=days)

        # Compter les notifications à supprimer
        notifications_to_delete = Notification.objects.filter(created_at__lt=cutoff_date)
        count = notifications_to_delete.count()

        # Supprimer les notifications
        notifications_to_delete.delete()

        self.stdout.write(
            self.style.SUCCESS(
                f'{count} notification(s) de plus de {days} jour(s) supprimée(s)'
            )
        )
