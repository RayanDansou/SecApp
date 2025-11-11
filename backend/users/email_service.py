"""
Service d'envoi d'emails via l'API Resend
"""
import os
import resend
from django.conf import settings
from .email_templates import (
    get_email_template,
    get_role_display,
    get_role_emoji,
    get_common_translations
)

# Configurer la clé API Resend
resend.api_key = os.getenv('RESEND_API_KEY')


class EmailService:
    """Service pour l'envoi d'emails via Resend"""

    @staticmethod
    def get_email_template_base(content, language='fr'):
        """
        Template de base pour tous les emails avec le branding GuardianIQ

        Args:
            content (str): Contenu HTML de l'email
            language (str): Langue de l'email ('fr' ou 'en')

        Returns:
            str: Template HTML complet
        """
        common = get_common_translations(language)
        return f"""
        <!DOCTYPE html>
        <html lang="{language}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>GuardianIQ</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
                <tr>
                    <td style="padding: 40px 20px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <!-- Header avec logo -->
                            <tr>
                                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #0D8FDB 0%, #0B7AC2 100%); border-radius: 8px 8px 0 0;">
                                    <svg width="60" height="60" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <!-- Shield -->
                                        <path d="M100 10 L180 45 L180 100 C180 145 145 175 100 190 C55 175 20 145 20 100 L20 45 Z" fill="#FFFFFF"/>
                                        <!-- Inner Shield -->
                                        <path d="M100 30 L160 55 L160 100 C160 135 135 160 100 172 C65 160 40 135 40 100 L40 55 Z" fill="#0D8FDB"/>
                                        <!-- Brain -->
                                        <g transform="translate(100, 100)">
                                            <path d="M-25,-35 C-35,-35 -40,-28 -40,-20 C-40,-15 -38,-10 -35,-8 C-38,-5 -40,0 -40,5 C-40,12 -36,18 -30,20 C-32,22 -33,25 -33,28 C-33,33 -29,37 -24,38 C-20,39 -15,37 -13,33 C-10,35 -6,36 -2,36 L-2,25 C-5,25 -8,24 -11,22 C-9,20 -8,17 -8,14 C-8,10 -10,6 -14,4 C-12,2 -11,-1 -11,-4 C-11,-8 -13,-12 -17,-14 C-15,-16 -14,-19 -14,-22 C-14,-27 -18,-32 -25,-35 Z" fill="#FFFFFF"/>
                                            <path d="M25,-35 C35,-35 40,-28 40,-20 C40,-15 38,-10 35,-8 C38,-5 40,0 40,5 C40,12 36,18 30,20 C32,22 33,25 33,28 C33,33 29,37 24,38 C20,39 15,37 13,33 C10,35 6,36 2,36 L2,25 C5,25 8,24 11,22 C9,20 8,17 8,14 C8,10 10,6 14,4 C12,2 11,-1 11,-4 C11,-8 13,-12 17,-14 C15,-16 14,-19 14,-22 C14,-27 18,-32 25,-35 Z" fill="#FFFFFF"/>
                                            <line x1="0" y1="-35" x2="0" y2="38" stroke="#0D8FDB" stroke-width="2"/>
                                        </g>
                                    </svg>
                                    <h1 style="margin: 15px 0 0; color: #FFFFFF; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                        Guardian<span style="font-weight: 800;">IQ</span>
                                    </h1>
                                </td>
                            </tr>

                            <!-- Contenu -->
                            <tr>
                                <td style="padding: 40px;">
                                    {content}
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                                    <p style="margin: 0 0 10px; color: #6c757d; font-size: 12px; text-align: center;">
                                        {common['automated_email']}
                                    </p>
                                    <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
                                        {common['copyright']}
                                    </p>
                                    <p style="margin: 10px 0 0; color: #6c757d; font-size: 11px; text-align: center;">
                                        <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3333')}" style="color: #0D8FDB; text-decoration: none;">{common['platform_link']}</a> •
                                        <a href="mailto:contact@guardianiq.com" style="color: #0D8FDB; text-decoration: none;">{common['contact_link']}</a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

    @staticmethod
    def send_password_reset_email(email, reset_link, username, language='fr'):
        """
        Envoie un email de réinitialisation de mot de passe

        Args:
            email (str): Adresse email du destinataire
            reset_link (str): Lien de réinitialisation du mot de passe
            username (str): Nom d'utilisateur
            language (str): Langue de l'email ('fr' ou 'en')

        Returns:
            dict: Réponse de l'API Resend
        """
        try:
            t = get_email_template('password_reset', language)

            content = f"""
                <h2 style="margin-top: 0; color: #212529; font-size: 24px; font-weight: 600;">
                    {t['title']}
                </h2>
                <p style="margin: 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    {t['greeting']} <strong style="color: #0D8FDB;">{username}</strong>,
                </p>
                <p style="margin: 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    {t['message_1']}
                </p>
                <p style="margin: 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    {t['message_2']}
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto;">
                    <tr>
                        <td style="border-radius: 6px; background: linear-gradient(135deg, #0D8FDB 0%, #0B7AC2 100%);">
                            <a href="{reset_link}"
                               style="border: none;
                                      border-radius: 6px;
                                      color: #ffffff;
                                      display: inline-block;
                                      font-size: 16px;
                                      font-weight: 600;
                                      padding: 14px 32px;
                                      text-decoration: none;
                                      text-align: center;">
                                {t['button_text']}
                            </a>
                        </td>
                    </tr>
                </table>
                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                        <strong>{t['warning_title']}</strong> {t['warning_message']}
                    </p>
                </div>
                <p style="margin: 20px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                    {t['footer_message']}
                </p>
            """

            params = {
                "from": os.getenv('RESEND_FROM_EMAIL', 'noreply@guardianiq.com'),
                "to": [email],
                "subject": t['subject'],
                "html": EmailService.get_email_template_base(content, language)
            }

            response = resend.Emails.send(params)
            return response

        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email de réinitialisation: {str(e)}")
            raise e

    @staticmethod
    def send_welcome_email(email, username, role, language='fr'):
        """
        Envoie un email de bienvenue lors de la création d'un compte

        Args:
            email (str): Adresse email du destinataire
            username (str): Nom d'utilisateur
            role (str): Rôle de l'utilisateur
            language (str): Langue de l'email ('fr' ou 'en')

        Returns:
            dict: Réponse de l'API Resend
        """
        t = get_email_template('welcome', language)
        role_display = get_role_display(role, language)
        role_emoji = get_role_emoji(role)

        try:
            content = f"""
                <h2 style="margin-top: 0; color: #212529; font-size: 24px; font-weight: 600;">
                    {t['title']}
                </h2>
                <p style="margin: 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    {t['greeting']} <strong style="color: #0D8FDB;">{username}</strong>,
                </p>
                <p style="margin: 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    {t['message_1']}
                </p>
                <p style="margin: 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    {t['message_2']}
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; margin: 25px 0;">
                    <tr>
                        <td style="padding: 25px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 8px 0; font-size: 15px; color: #495057;">
                                        <strong>👤 {t['username_label']}</strong>
                                    </td>
                                    <td style="padding: 8px 0; font-size: 15px; color: #212529; text-align: right;">
                                        <strong>{username}</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 15px; color: #495057;">
                                        <strong>📧 {t['email_label']}</strong>
                                    </td>
                                    <td style="padding: 8px 0; font-size: 15px; color: #212529; text-align: right;">
                                        {email}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 15px; color: #495057;">
                                        <strong>{role_emoji} {t['role_label']}</strong>
                                    </td>
                                    <td style="padding: 8px 0; font-size: 15px; text-align: right;">
                                        <span style="background-color: #0D8FDB; color: white; padding: 4px 12px; border-radius: 12px; font-weight: 600;">
                                            {role_display}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <p style="margin: 25px 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    {t['message_3']}
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto;">
                    <tr>
                        <td style="border-radius: 6px; background: linear-gradient(135deg, #0D8FDB 0%, #0B7AC2 100%);">
                            <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3333')}/login"
                               style="border: none;
                                      border-radius: 6px;
                                      color: #ffffff;
                                      display: inline-block;
                                      font-size: 16px;
                                      font-weight: 600;
                                      padding: 14px 32px;
                                      text-decoration: none;
                                      text-align: center;">
                                {t['button_text']}
                            </a>
                        </td>
                    </tr>
                </table>
                <div style="background-color: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 25px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #0c5460; font-size: 14px;">
                        <strong>{t['tip_title']}</strong> {t['tip_message']}
                    </p>
                </div>
                <p style="margin: 20px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                    {t['footer_message']}
                </p>
            """

            params = {
                "from": os.getenv('RESEND_FROM_EMAIL', 'noreply@guardianiq.com'),
                "to": [email],
                "subject": t['subject'],
                "html": EmailService.get_email_template_base(content, language)
            }

            response = resend.Emails.send(params)
            return response

        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email de bienvenue: {str(e)}")
            raise e


email_service = EmailService()
