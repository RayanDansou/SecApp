"""
Service d'envoi d'emails via l'API Resend
"""
import os
import resend
from django.conf import settings

# Configurer la clé API Resend
resend.api_key = os.getenv('RESEND_API_KEY')


class EmailService:
    """Service pour l'envoi d'emails via Resend"""

    @staticmethod
    def get_email_template_base(content):
        """
        Template de base pour tous les emails avec le branding GuardianIQ

        Args:
            content (str): Contenu HTML de l'email

        Returns:
            str: Template HTML complet
        """
        return f"""
        <!DOCTYPE html>
        <html lang="fr">
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
                                        Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                                    </p>
                                    <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
                                        © 2025 <strong>GuardianIQ</strong> - Solution de gestion de la sécurité
                                    </p>
                                    <p style="margin: 10px 0 0; color: #6c757d; font-size: 11px; text-align: center;">
                                        <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3333')}" style="color: #0D8FDB; text-decoration: none;">Accéder à la plateforme</a> •
                                        <a href="mailto:contact@guardianiq.com" style="color: #0D8FDB; text-decoration: none;">Contact</a>
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
    def send_password_reset_email(email, reset_link, username):
        """
        Envoie un email de réinitialisation de mot de passe

        Args:
            email (str): Adresse email du destinataire
            reset_link (str): Lien de réinitialisation du mot de passe
            username (str): Nom d'utilisateur

        Returns:
            dict: Réponse de l'API Resend
        """
        try:
            content = f"""
                <h2 style="margin-top: 0; color: #212529; font-size: 24px; font-weight: 600;">
                    Réinitialisation de votre mot de passe
                </h2>
                <p style="margin: 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    Bonjour <strong style="color: #0D8FDB;">{username}</strong>,
                </p>
                <p style="margin: 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    Vous avez demandé la réinitialisation de votre mot de passe pour votre compte <strong>GuardianIQ</strong>.
                </p>
                <p style="margin: 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
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
                                🔐 Réinitialiser mon mot de passe
                            </a>
                        </td>
                    </tr>
                </table>
                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                        <strong>⚠️ Important :</strong> Ce lien expirera dans <strong>1 heure</strong>.
                    </p>
                </div>
                <p style="margin: 20px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                    Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
                    Votre mot de passe ne sera pas modifié.
                </p>
            """

            params = {
                "from": os.getenv('RESEND_FROM_EMAIL', 'noreply@guardianiq.com'),
                "to": [email],
                "subject": "🔐 Réinitialisation de votre mot de passe - GuardianIQ",
                "html": EmailService.get_email_template_base(content)
            }

            response = resend.Emails.send(params)
            return response

        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email de réinitialisation: {str(e)}")
            raise e

    @staticmethod
    def send_welcome_email(email, username, role):
        """
        Envoie un email de bienvenue lors de la création d'un compte

        Args:
            email (str): Adresse email du destinataire
            username (str): Nom d'utilisateur
            role (str): Rôle de l'utilisateur

        Returns:
            dict: Réponse de l'API Resend
        """
        role_display = {
            'CHEF_PROJET': 'Chef de Projet',
            'ANALYSTE': 'Analyste Sécurité',
            'BUSINESS_OWNER': 'Business Owner',
            'ADMIN': 'Administrateur'
        }.get(role, role)

        role_emoji = {
            'CHEF_PROJET': '👨‍💼',
            'ANALYSTE': '🛡️',
            'BUSINESS_OWNER': '📊',
            'ADMIN': '⚙️'
        }.get(role, '👤')

        try:
            content = f"""
                <h2 style="margin-top: 0; color: #212529; font-size: 24px; font-weight: 600;">
                    🎉 Bienvenue sur GuardianIQ !
                </h2>
                <p style="margin: 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    Bonjour <strong style="color: #0D8FDB;">{username}</strong>,
                </p>
                <p style="margin: 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    Nous sommes ravis de vous accueillir sur <strong>GuardianIQ</strong>, votre nouvelle plateforme de gestion de la sécurité !
                </p>
                <p style="margin: 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
                    Votre compte a été créé avec succès. Voici vos informations :
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; margin: 25px 0;">
                    <tr>
                        <td style="padding: 25px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 8px 0; font-size: 15px; color: #495057;">
                                        <strong>👤 Nom d'utilisateur :</strong>
                                    </td>
                                    <td style="padding: 8px 0; font-size: 15px; color: #212529; text-align: right;">
                                        <strong>{username}</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 15px; color: #495057;">
                                        <strong>📧 Email :</strong>
                                    </td>
                                    <td style="padding: 8px 0; font-size: 15px; color: #212529; text-align: right;">
                                        {email}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 15px; color: #495057;">
                                        <strong>{role_emoji} Rôle :</strong>
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
                    Vous pouvez maintenant vous connecter et commencer à utiliser toutes les fonctionnalités de la plateforme.
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
                                🚀 Accéder à la plateforme
                            </a>
                        </td>
                    </tr>
                </table>
                <div style="background-color: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 25px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #0c5460; font-size: 14px;">
                        <strong>💡 Astuce :</strong> N'hésitez pas à explorer l'interface et à contacter notre équipe de support si vous avez des questions.
                    </p>
                </div>
                <p style="margin: 20px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                    Nous vous souhaitons une excellente expérience sur GuardianIQ !
                </p>
            """

            params = {
                "from": os.getenv('RESEND_FROM_EMAIL', 'noreply@guardianiq.com'),
                "to": [email],
                "subject": "🎉 Bienvenue sur GuardianIQ !",
                "html": EmailService.get_email_template_base(content)
            }

            response = resend.Emails.send(params)
            return response

        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email de bienvenue: {str(e)}")
            raise e


email_service = EmailService()
