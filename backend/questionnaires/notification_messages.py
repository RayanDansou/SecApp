"""
Messages de notifications avec traductions FR/EN
"""

NOTIFICATION_MESSAGES = {
    'NEW_RESPONSE': {
        'title': {
            'fr': "Nouvelle réponse reçue",
            'en': "New response received"
        },
        'message': {
            'fr': "{user} a soumis une réponse au questionnaire '{questionnaire}'.",
            'en': "{user} submitted a response to the questionnaire '{questionnaire}'."
        }
    },
    'RESPONSE_VALIDATED': {
        'title': {
            'fr': "Questionnaire validé",
            'en': "Questionnaire validated"
        },
        'message': {
            'fr': "Votre réponse au questionnaire '{questionnaire}' a été validée.",
            'en': "Your response to the questionnaire '{questionnaire}' has been validated."
        }
    },
    'RESPONSE_REJECTED': {
        'title': {
            'fr': "Questionnaire rejeté",
            'en': "Questionnaire rejected"
        },
        'message': {
            'fr': "Votre réponse au questionnaire '{questionnaire}' a été rejetée.",
            'en': "Your response to the questionnaire '{questionnaire}' has been rejected."
        }
    },
    'STATUS_CHANGE': {
        'title': {
            'fr': "Changement de statut",
            'en': "Status change"
        },
        'message': {
            'fr': "Le statut de votre réponse au questionnaire '{questionnaire}' est passé à '{status}'.",
            'en': "The status of your response to the questionnaire '{questionnaire}' has changed to '{status}'."
        }
    },
    'NEW_COMMENT': {
        'title': {
            'fr': "Nouveau commentaire",
            'en': "New comment"
        },
        'message': {
            'fr': "{user} a ajouté un commentaire sur le questionnaire '{questionnaire}'.",
            'en': "{user} added a comment on the questionnaire '{questionnaire}'."
        }
    }
}

STATUS_LABELS = {
    'BROUILLON': {
        'fr': 'Brouillon',
        'en': 'Draft'
    },
    'SOUMIS': {
        'fr': 'Soumis',
        'en': 'Submitted'
    },
    'EN_ATTENTE': {
        'fr': 'En attente',
        'en': 'Pending'
    },
    'EN_VALIDATION': {
        'fr': 'En validation',
        'en': 'In validation'
    },
    'VALIDE': {
        'fr': 'Validé',
        'en': 'Validated'
    },
    'REJETE': {
        'fr': 'Rejeté',
        'en': 'Rejected'
    }
}


def get_notification_message(notification_type, lang='fr', **kwargs):
    """
    Récupère le message traduit pour une notification

    Args:
        notification_type: Type de notification (NEW_RESPONSE, RESPONSE_VALIDATED, etc.)
        lang: Langue ('fr' ou 'en')
        **kwargs: Variables à insérer dans le message (user, questionnaire, status, etc.)

    Returns:
        tuple: (title, message)
    """
    if notification_type not in NOTIFICATION_MESSAGES:
        return ("Notification", "You have a new notification")

    messages = NOTIFICATION_MESSAGES[notification_type]
    title = messages['title'].get(lang, messages['title']['fr'])
    message_template = messages['message'].get(lang, messages['message']['fr'])

    # Remplacer les variables dans le message
    message = message_template.format(**kwargs)

    return title, message


def get_status_label(status, lang='fr'):
    """
    Récupère le libellé traduit d'un statut

    Args:
        status: Code du statut (BROUILLON, SOUMIS, etc.)
        lang: Langue ('fr' ou 'en')

    Returns:
        str: Libellé traduit
    """
    if status not in STATUS_LABELS:
        return status

    return STATUS_LABELS[status].get(lang, STATUS_LABELS[status]['fr'])
