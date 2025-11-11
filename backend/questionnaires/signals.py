from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import QuestionnaireResponse, Comment, Notification


@receiver(pre_save, sender=QuestionnaireResponse)
def detect_status_change(sender, instance, **kwargs):
    """
    Détecte les changements de statut d'une réponse
    """
    if instance.pk:  # Si l'objet existe déjà (modification)
        try:
            old_instance = QuestionnaireResponse.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
        except QuestionnaireResponse.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None


@receiver(post_save, sender=QuestionnaireResponse)
def create_response_notifications(sender, instance, created, **kwargs):
    """
    Crée des notifications lors de la création ou modification d'une réponse
    """
    # Notification pour l'analyste lors d'une nouvelle réponse
    if created and instance.status == QuestionnaireResponse.Status.SOUMIS:
        Notification.objects.create(
            recipient=instance.questionnaire.created_by,
            sender=instance.responder,
            notification_type='NEW_RESPONSE',
            title=f"Nouvelle réponse reçue",
            message=f"{instance.responder.get_full_name() or instance.responder.username} a soumis une réponse au questionnaire '{instance.questionnaire.title}'.",
            response=instance
        )

    # Notification pour le chef de projet lors d'un changement de statut
    if not created and hasattr(instance, '_old_status'):
        old_status = instance._old_status
        new_status = instance.status

        if old_status != new_status and old_status is not None:
            # Notification pour le chef de projet
            if new_status == QuestionnaireResponse.Status.VALIDE:
                Notification.objects.create(
                    recipient=instance.responder,
                    sender=None,  # Système
                    notification_type='RESPONSE_VALIDATED',
                    title="Questionnaire validé",
                    message=f"Votre réponse au questionnaire '{instance.questionnaire.title}' a été validée.",
                    response=instance
                )
            elif new_status == QuestionnaireResponse.Status.REJETE:
                Notification.objects.create(
                    recipient=instance.responder,
                    sender=None,  # Système
                    notification_type='RESPONSE_REJECTED',
                    title="Questionnaire rejeté",
                    message=f"Votre réponse au questionnaire '{instance.questionnaire.title}' a été rejetée.",
                    response=instance
                )
            else:
                # Pour les autres changements de statut
                status_labels = {
                    QuestionnaireResponse.Status.BROUILLON: 'Brouillon',
                    QuestionnaireResponse.Status.SOUMIS: 'Soumis',
                    QuestionnaireResponse.Status.EN_ATTENTE: 'En attente',
                    QuestionnaireResponse.Status.EN_VALIDATION: 'En validation'
                }
                Notification.objects.create(
                    recipient=instance.responder,
                    sender=None,
                    notification_type='STATUS_CHANGE',
                    title="Changement de statut",
                    message=f"Le statut de votre réponse au questionnaire '{instance.questionnaire.title}' est passé à '{status_labels.get(new_status, new_status)}'.",
                    response=instance
                )


@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    """
    Crée une notification lors de l'ajout d'un commentaire
    """
    if created:
        response = instance.response

        # Notifier le chef de projet (propriétaire de la réponse)
        if instance.author != response.responder:
            Notification.objects.create(
                recipient=response.responder,
                sender=instance.author,
                notification_type='NEW_COMMENT',
                title="Nouveau commentaire",
                message=f"{instance.author.get_full_name() or instance.author.username} a ajouté un commentaire sur votre questionnaire '{response.questionnaire.title}'.",
                response=response,
                comment=instance
            )

        # Notifier l'analyste (créateur du questionnaire) si ce n'est pas lui qui commente
        if instance.author != response.questionnaire.created_by and response.responder != response.questionnaire.created_by:
            Notification.objects.create(
                recipient=response.questionnaire.created_by,
                sender=instance.author,
                notification_type='NEW_COMMENT',
                title="Nouveau commentaire",
                message=f"{instance.author.get_full_name() or instance.author.username} a ajouté un commentaire sur le questionnaire '{response.questionnaire.title}'.",
                response=response,
                comment=instance
            )


def delete_old_notifications():
    """
    Supprime les notifications datant de plus de 3 jours.
    Cette fonction devrait être appelée par une tâche planifiée (cron ou celery).
    """
    three_days_ago = timezone.now() - timedelta(days=3)
    deleted_count = Notification.objects.filter(created_at__lt=three_days_ago).delete()
    return deleted_count[0] if deleted_count else 0
