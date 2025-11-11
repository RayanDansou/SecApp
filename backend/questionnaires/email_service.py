"""
Service d'envoi d'emails pour les notifications
Utilise Resend pour l'envoi
"""
import os
import resend
from django.conf import settings
from .notification_messages import get_notification_message, NOTIFICATION_MESSAGES


# Configurer Resend avec la clé API
resend.api_key = os.getenv('RESEND_API_KEY', '')


def send_notification_email(recipient_email, recipient_name, recipient_language, notification_type, **context):
    """
    Envoie un email de notification à un utilisateur

    Args:
        recipient_email: Email du destinataire
        recipient_name: Nom du destinataire
        recipient_language: Langue préférée ('fr' ou 'en')
        notification_type: Type de notification (NEW_RESPONSE, RESPONSE_VALIDATED, etc.)
        **context: Variables contextuelles (user, questionnaire, status, etc.)

    Returns:
        dict: Réponse de Resend ou None en cas d'erreur
    """
    if not resend.api_key:
        print("[EMAIL WARNING] RESEND_API_KEY not configured")
        return None

    # Récupérer le titre et le message traduits
    title, message = get_notification_message(notification_type, lang=recipient_language, **context)

    # Déterminer le sujet de l'email selon le type
    subject = f"GuardianIQ - {title}"

    # Créer le contenu HTML de l'email
    html_content = generate_email_html(
        recipient_name=recipient_name,
        title=title,
        message=message,
        notification_type=notification_type,
        language=recipient_language,
        **context
    )

    try:
        # Envoyer l'email via Resend
        params = {
            "from": "GuardianIQ <noreply@guardianiq.cloud>",
            "to": [recipient_email],
            "subject": subject,
            "html": html_content,
        }

        response = resend.Emails.send(params)
        print(f"[EMAIL] Email envoyé à {recipient_email}: {title}")
        return response

    except Exception as e:
        print(f"[EMAIL ERROR] Erreur lors de l'envoi à {recipient_email}: {str(e)}")
        return None


def generate_email_html(recipient_name, title, message, notification_type, language, **context):
    """
    Génère le contenu HTML d'un email de notification

    Args:
        recipient_name: Nom du destinataire
        title: Titre de la notification
        message: Message de la notification
        notification_type: Type de notification
        language: Langue ('fr' ou 'en')
        **context: Contexte additionnel

    Returns:
        str: Contenu HTML de l'email
    """
    # Traductions pour les boutons et textes génériques
    translations = {
        'fr': {
            'hello': 'Bonjour',
            'view_questionnaire': 'Voir le questionnaire',
            'footer_text': 'Vous recevez cet email car vous avez une notification sur GuardianIQ.',
            'unsubscribe': 'Se désabonner des notifications',
            'regards': 'Cordialement,',
            'team': "L'équipe GuardianIQ"
        },
        'en': {
            'hello': 'Hello',
            'view_questionnaire': 'View questionnaire',
            'footer_text': 'You are receiving this email because you have a notification on GuardianIQ.',
            'unsubscribe': 'Unsubscribe from notifications',
            'regards': 'Best regards,',
            'team': 'The GuardianIQ Team'
        }
    }

    t = translations.get(language, translations['fr'])

    # Récupérer l'URL du frontend depuis les variables d'environnement
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3333')

    # Construire l'URL du questionnaire si disponible
    questionnaire_link = ''
    if 'response_id' in context:
        questionnaire_link = f"{frontend_url}/response/{context['response_id']}"

    # Template HTML responsive
    html = f"""
    <!DOCTYPE html>
    <html lang="{language}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #0D8FDB 0%, #0B7AC2 100%);
                color: #ffffff;
                padding: 30px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }}
            .content {{
                padding: 40px 30px;
            }}
            .notification-badge {{
                display: inline-block;
                padding: 8px 16px;
                background-color: #e3f2fd;
                color: #0D8FDB;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                margin-bottom: 20px;
            }}
            .message {{
                font-size: 16px;
                color: #555555;
                margin: 20px 0;
                line-height: 1.8;
            }}
            .button {{
                display: inline-block;
                padding: 14px 28px;
                background: linear-gradient(135deg, #0D8FDB 0%, #0B7AC2 100%);
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                transition: transform 0.2s;
            }}
            .button:hover {{
                transform: translateY(-2px);
            }}
            .footer {{
                background-color: #f8f9fa;
                padding: 30px;
                text-align: center;
                font-size: 14px;
                color: #6c757d;
                border-top: 1px solid #e9ecef;
            }}
            .footer a {{
                color: #0D8FDB;
                text-decoration: none;
            }}
            @media only screen and (max-width: 600px) {{
                .container {{
                    margin: 20px;
                    border-radius: 4px;
                }}
                .content {{
                    padding: 20px;
                }}
                .header {{
                    padding: 20px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>GuardianIQ</h1>
            </div>
            <div class="content">
                <div class="notification-badge">{notification_type.replace('_', ' ')}</div>
                <h2 style="color: #333333; margin: 0 0 10px 0;">{t['hello']} {recipient_name},</h2>
                <div class="message">
                    <strong style="color: #0D8FDB; font-size: 18px;">{title}</strong><br><br>
                    {message}
                </div>
                {f'<a href="{questionnaire_link}" class="button">{t["view_questionnaire"]}</a>' if questionnaire_link else ''}
            </div>
            <div class="footer">
                <p>{t['regards']}<br>{t['team']}</p>
                <p style="margin-top: 20px; font-size: 12px;">{t['footer_text']}</p>
            </div>
        </div>
    </body>
    </html>
    """

    return html
