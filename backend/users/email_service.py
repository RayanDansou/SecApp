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
            params = {
                "from": os.getenv('RESEND_FROM_EMAIL', 'noreply@secapp.com'),
                "to": [email],
                "subject": "Réinitialisation de votre mot de passe - SecApp",
                "html": f"""
                    <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h2 style="color: #2563eb;">Réinitialisation de votre mot de passe</h2>
                                <p>Bonjour <strong>{username}</strong>,</p>
                                <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte SecApp.</p>
                                <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="{reset_link}"
                                       style="background-color: #2563eb;
                                              color: white;
                                              padding: 12px 30px;
                                              text-decoration: none;
                                              border-radius: 5px;
                                              display: inline-block;">
                                        Réinitialiser mon mot de passe
                                    </a>
                                </div>
                                <p><strong>Ce lien expirera dans 1 heure.</strong></p>
                                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.</p>
                                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                                <p style="color: #666; font-size: 12px;">
                                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
                                    SecApp - Plateforme de sécurité
                                </p>
                            </div>
                        </body>
                    </html>
                """
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

        try:
            params = {
                "from": os.getenv('RESEND_FROM_EMAIL', 'noreply@secapp.com'),
                "to": [email],
                "subject": "Bienvenue sur SecApp !",
                "html": f"""
                    <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h2 style="color: #2563eb;">Bienvenue sur SecApp !</h2>
                                <p>Bonjour <strong>{username}</strong>,</p>
                                <p>Votre compte a été créé avec succès sur la plateforme SecApp.</p>
                                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                    <p style="margin: 5px 0;"><strong>Nom d'utilisateur :</strong> {username}</p>
                                    <p style="margin: 5px 0;"><strong>Email :</strong> {email}</p>
                                    <p style="margin: 5px 0;"><strong>Rôle :</strong> {role_display}</p>
                                </div>
                                <p>Vous pouvez maintenant vous connecter et commencer à utiliser la plateforme.</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3333')}/login"
                                       style="background-color: #2563eb;
                                              color: white;
                                              padding: 12px 30px;
                                              text-decoration: none;
                                              border-radius: 5px;
                                              display: inline-block;">
                                        Se connecter
                                    </a>
                                </div>
                                <p>Si vous avez des questions, n'hésitez pas à contacter notre équipe de support.</p>
                                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                                <p style="color: #666; font-size: 12px;">
                                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
                                    SecApp - Plateforme de sécurité
                                </p>
                            </div>
                        </body>
                    </html>
                """
            }

            response = resend.Emails.send(params)
            return response

        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email de bienvenue: {str(e)}")
            raise e


email_service = EmailService()
