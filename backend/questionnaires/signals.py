from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import QuestionnaireResponse, Comment, Notification
from .notification_messages import get_notification_message, get_status_label


@receiver(pre_save, sender=QuestionnaireResponse)
def detect_status_change(sender, instance, **kwargs):
    """
    Détecte les changements de statut d'une réponse
    """
    print(f"[PRE_SAVE] Response ID={instance.pk}, status={instance.status}")
    if instance.pk:  # Si l'objet existe déjà (modification)
        try:
            old_instance = QuestionnaireResponse.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
            print(f"[PRE_SAVE] Set _old_status={old_instance.status}")
        except QuestionnaireResponse.DoesNotExist:
            instance._old_status = None
            print(f"[PRE_SAVE] Object not found, _old_status=None")
    else:
        instance._old_status = None
        print(f"[PRE_SAVE] New object, _old_status=None")


@receiver(post_save, sender=QuestionnaireResponse)
def create_response_notifications(sender, instance, created, **kwargs):
    """
    Crée des notifications lors de la création ou modification d'une réponse
    """
    print(f"[POST_SAVE] Response ID={instance.id}, created={created}, status={instance.status}")
    print(f"[POST_SAVE] Has _old_status: {hasattr(instance, '_old_status')}")
    if hasattr(instance, '_old_status'):
        print(f"[POST_SAVE] _old_status={instance._old_status}")

    # Notification pour l'analyste lors d'une soumission
    # Cas 1: Création directe avec statut SOUMIS
    # Cas 2: Changement de statut vers SOUMIS (BROUILLON -> SOUMIS)
    if created and instance.status == QuestionnaireResponse.Status.SOUMIS:
        # Création directe en mode SOUMIS
        user_name = instance.responder.get_full_name() or instance.responder.username
        title, message = get_notification_message(
            'NEW_RESPONSE',
            lang='fr',
            user=user_name,
            questionnaire=instance.questionnaire.title
        )
        Notification.objects.create(
            recipient=instance.questionnaire.created_by,
            sender=instance.responder,
            notification_type='NEW_RESPONSE',
            title=title,
            message=message,
            response=instance
        )

    # Notification pour le chef de projet lors d'un changement de statut
    if not created and hasattr(instance, '_old_status'):
        old_status = instance._old_status
        new_status = instance.status

        if old_status != new_status and old_status is not None:
            # IMPORTANT: Détecter la soumission lors du changement BROUILLON -> SOUMIS
            if new_status == QuestionnaireResponse.Status.SOUMIS and old_status == QuestionnaireResponse.Status.BROUILLON:
                # Notifier l'analyste de la soumission
                analyste = instance.questionnaire.created_by
                chef_projet = instance.responder

                # Debug: vérifier les rôles
                print(f"[NOTIFICATION DEBUG] Soumission détectée:")
                print(f"  - Chef de projet (sender): {chef_projet.username} (role: {chef_projet.role})")
                print(f"  - Analyste (recipient): {analyste.username} (role: {analyste.role})")
                print(f"  - Questionnaire: {instance.questionnaire.title}")

                user_name = chef_projet.get_full_name() or chef_projet.username
                title, message = get_notification_message(
                    'NEW_RESPONSE',
                    lang='fr',
                    user=user_name,
                    questionnaire=instance.questionnaire.title
                )

                notification = Notification.objects.create(
                    recipient=analyste,  # L'analyste qui a créé le template
                    sender=chef_projet,  # Le chef de projet qui soumet
                    notification_type='NEW_RESPONSE',
                    title=title,
                    message=message,
                    response=instance
                )
                print(f"  - Notification créée: ID={notification.id}, recipient={notification.recipient.username}")
                print("  ✓ Notification envoyée à l'analyste")

            # Notification pour le chef de projet lors de validation/rejet
            if new_status == QuestionnaireResponse.Status.VALIDE:
                title, message = get_notification_message(
                    'RESPONSE_VALIDATED',
                    lang='fr',
                    questionnaire=instance.questionnaire.title
                )
                Notification.objects.create(
                    recipient=instance.responder,
                    sender=None,  # Système
                    notification_type='RESPONSE_VALIDATED',
                    title=title,
                    message=message,
                    response=instance
                )
            elif new_status == QuestionnaireResponse.Status.REJETE:
                title, message = get_notification_message(
                    'RESPONSE_REJECTED',
                    lang='fr',
                    questionnaire=instance.questionnaire.title
                )
                Notification.objects.create(
                    recipient=instance.responder,
                    sender=None,  # Système
                    notification_type='RESPONSE_REJECTED',
                    title=title,
                    message=message,
                    response=instance
                )
            elif new_status != QuestionnaireResponse.Status.SOUMIS:
                # Pour les autres changements de statut (sauf SOUMIS qui est déjà géré)
                status_label = get_status_label(new_status, lang='fr')
                title, message = get_notification_message(
                    'STATUS_CHANGE',
                    lang='fr',
                    questionnaire=instance.questionnaire.title,
                    status=status_label
                )
                Notification.objects.create(
                    recipient=instance.responder,
                    sender=None,
                    notification_type='STATUS_CHANGE',
                    title=title,
                    message=message,
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
            user_name = instance.author.get_full_name() or instance.author.username
            title, message = get_notification_message(
                'NEW_COMMENT',
                lang='fr',
                user=user_name,
                questionnaire=response.questionnaire.title
            )
            Notification.objects.create(
                recipient=response.responder,
                sender=instance.author,
                notification_type='NEW_COMMENT',
                title=title,
                message=message,
                response=response,
                comment=instance
            )

        # Notifier l'analyste (créateur du questionnaire) si ce n'est pas lui qui commente
        if instance.author != response.questionnaire.created_by and response.responder != response.questionnaire.created_by:
            user_name = instance.author.get_full_name() or instance.author.username
            title, message = get_notification_message(
                'NEW_COMMENT',
                lang='fr',
                user=user_name,
                questionnaire=response.questionnaire.title
            )
            Notification.objects.create(
                recipient=response.questionnaire.created_by,
                sender=instance.author,
                notification_type='NEW_COMMENT',
                title=title,
                message=message,
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
