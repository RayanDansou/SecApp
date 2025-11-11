"""
Système de traduction pour les messages API
Permet de retourner les messages d'erreur et de succès dans la langue de l'utilisateur
"""

# Messages d'authentification
AUTH_MESSAGES = {
    'invalid_credentials': {
        'fr': 'Identifiants invalides',
        'en': 'Invalid credentials'
    },
    'account_disabled': {
        'fr': 'Compte désactivé',
        'en': 'Account disabled'
    },
    'refresh_token_required': {
        'fr': 'Refresh token requis',
        'en': 'Refresh token required'
    },
    'logout_success': {
        'fr': 'Déconnexion réussie',
        'en': 'Logout successful'
    },
    'user_created': {
        'fr': 'Utilisateur créé avec succès',
        'en': 'User created successfully'
    },
}

# Messages de gestion de mot de passe
PASSWORD_MESSAGES = {
    'old_password_incorrect': {
        'fr': 'Ancien mot de passe incorrect',
        'en': 'Old password is incorrect'
    },
    'password_changed': {
        'fr': 'Mot de passe modifié avec succès',
        'en': 'Password changed successfully'
    },
    'reset_link_sent': {
        'fr': 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
        'en': 'If an account exists with this email, you will receive a reset link.'
    },
    'reset_link_invalid': {
        'fr': 'Le lien de réinitialisation est invalide ou a expiré.',
        'en': 'The reset link is invalid or has expired.'
    },
    'password_reset_success': {
        'fr': 'Mot de passe réinitialisé avec succès.',
        'en': 'Password reset successfully.'
    },
    'reset_token_invalid': {
        'fr': 'Le lien de réinitialisation est invalide.',
        'en': 'The reset link is invalid.'
    },
}

# Messages de gestion de profil
PROFILE_MESSAGES = {
    'profile_picture_updated': {
        'fr': 'Photo de profil mise à jour avec succès',
        'en': 'Profile picture updated successfully'
    },
}

# Messages de gestion de compte
ACCOUNT_MESSAGES = {
    'admin_only': {
        'fr': 'Seuls les administrateurs peuvent supprimer d\'autres comptes',
        'en': 'Only administrators can delete other accounts'
    },
    'user_not_found': {
        'fr': 'Utilisateur non trouvé',
        'en': 'User not found'
    },
    'cannot_delete_self': {
        'fr': 'Utilisez l\'endpoint sans user_id pour supprimer votre propre compte',
        'en': 'Use the endpoint without user_id to delete your own account'
    },
    'account_deleted': {
        'fr': 'Compte de {username} supprimé avec succès',
        'en': 'Account of {username} deleted successfully'
    },
    'self_account_deleted': {
        'fr': 'Votre compte {username} a été supprimé avec succès',
        'en': 'Your account {username} has been deleted successfully'
    },
    'delete_error': {
        'fr': 'Erreur lors de la suppression du compte: {error}',
        'en': 'Error deleting account: {error}'
    },
}

# Messages Google OAuth
GOOGLE_MESSAGES = {
    'google_credential_required': {
        'fr': 'Google credential requis',
        'en': 'Google credential required'
    },
    'google_config_missing': {
        'fr': 'Configuration Google OAuth manquante',
        'en': 'Google OAuth configuration missing'
    },
    'invalid_google_token': {
        'fr': 'Token Google invalide',
        'en': 'Invalid Google token'
    },
    'email_not_provided': {
        'fr': 'Email non fourni par Google',
        'en': 'Email not provided by Google'
    },
    'account_exists': {
        'fr': 'Un compte existe déjà avec cet email. Utilisez la connexion Google.',
        'en': 'An account already exists with this email. Use Google sign in.'
    },
    'google_auth_success': {
        'fr': 'Authentification Google réussie',
        'en': 'Google authentication successful'
    },
    'account_created': {
        'fr': 'Compte créé avec succès',
        'en': 'Account created successfully'
    },
    'invalid_role': {
        'fr': 'Rôle invalide. Choisissez parmi: {roles}',
        'en': 'Invalid role. Choose from: {roles}'
    },
}

# Messages génériques
GENERIC_MESSAGES = {
    'generic_error': {
        'fr': 'Une erreur est survenue',
        'en': 'An error occurred'
    },
    'success': {
        'fr': 'Opération réussie',
        'en': 'Operation successful'
    },
}


def get_message(category, key, lang='fr', **kwargs):
    """
    Récupère un message traduit

    Args:
        category (str): Catégorie du message (AUTH_MESSAGES, PASSWORD_MESSAGES, etc.)
        key (str): Clé du message
        lang (str): Langue ('fr' ou 'en')
        **kwargs: Arguments pour le formatage du message

    Returns:
        str: Message traduit et formaté
    """
    # Mapper les catégories
    categories = {
        'auth': AUTH_MESSAGES,
        'password': PASSWORD_MESSAGES,
        'profile': PROFILE_MESSAGES,
        'account': ACCOUNT_MESSAGES,
        'google': GOOGLE_MESSAGES,
        'generic': GENERIC_MESSAGES,
    }

    # Récupérer la catégorie
    messages = categories.get(category, GENERIC_MESSAGES)

    # Récupérer le message
    message_dict = messages.get(key, GENERIC_MESSAGES.get('generic_error'))

    # Récupérer la traduction
    message = message_dict.get(lang, message_dict.get('fr'))

    # Formater le message avec les arguments
    if kwargs:
        try:
            message = message.format(**kwargs)
        except KeyError:
            pass  # Si le formatage échoue, retourner le message non formaté

    return message


def get_user_language(user=None, request=None):
    """
    Détermine la langue préférée de l'utilisateur

    Args:
        user: Objet utilisateur Django (optionnel)
        request: Objet requête Django (optionnel)

    Returns:
        str: Code langue ('fr' ou 'en')
    """
    # 1. Vérifier si l'utilisateur a une langue préférée dans son profil
    if user and hasattr(user, 'preferred_language'):
        return user.preferred_language

    # 2. Vérifier le header Accept-Language de la requête
    if request and hasattr(request, 'headers'):
        accept_language = request.headers.get('Accept-Language', '')
        if 'en' in accept_language.lower():
            return 'en'

    # 3. Par défaut, retourner français
    return 'fr'
