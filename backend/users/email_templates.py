"""
Templates d'emails multilingues pour GuardianIQ
Support FR et EN
"""

# ========================================
# EMAIL DE RÉINITIALISATION DE MOT DE PASSE
# ========================================

PASSWORD_RESET_TEMPLATES = {
    'fr': {
        'subject': '🔐 Réinitialisation de votre mot de passe - GuardianIQ',
        'title': 'Réinitialisation de votre mot de passe',
        'greeting': 'Bonjour',
        'message_1': 'Vous avez demandé la réinitialisation de votre mot de passe pour votre compte GuardianIQ.',
        'message_2': 'Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :',
        'button_text': '🔐 Réinitialiser mon mot de passe',
        'warning_title': '⚠️ Important',
        'warning_message': 'Ce lien expirera dans 1 heure.',
        'footer_message': 'Si vous n\'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.',
    },
    'en': {
        'subject': '🔐 Reset your password - GuardianIQ',
        'title': 'Reset your password',
        'greeting': 'Hello',
        'message_1': 'You requested a password reset for your GuardianIQ account.',
        'message_2': 'Click the button below to create a new password:',
        'button_text': '🔐 Reset my password',
        'warning_title': '⚠️ Important',
        'warning_message': 'This link will expire in 1 hour.',
        'footer_message': 'If you didn\'t request this reset, you can safely ignore this email.',
    }
}

# ========================================
# EMAIL DE BIENVENUE
# ========================================

WELCOME_EMAIL_TEMPLATES = {
    'fr': {
        'subject': '🎉 Bienvenue sur GuardianIQ !',
        'title': '🎉 Bienvenue sur GuardianIQ !',
        'greeting': 'Bonjour',
        'message_1': 'Nous sommes ravis de vous accueillir sur <strong>GuardianIQ</strong>, votre nouvelle plateforme de gestion de la sécurité !',
        'message_2': 'Votre compte a été créé avec succès. Voici vos informations :',
        'username_label': 'Nom d\'utilisateur :',
        'email_label': 'Email :',
        'role_label': 'Rôle :',
        'message_3': 'Vous pouvez maintenant vous connecter et commencer à utiliser toutes les fonctionnalités de la plateforme.',
        'button_text': '🚀 Accéder à la plateforme',
        'tip_title': '💡 Astuce :',
        'tip_message': 'N\'hésitez pas à explorer l\'interface et à contacter notre équipe de support si vous avez des questions.',
        'footer_message': 'Nous vous souhaitons une excellente expérience sur GuardianIQ !',
    },
    'en': {
        'subject': '🎉 Welcome to GuardianIQ!',
        'title': '🎉 Welcome to GuardianIQ!',
        'greeting': 'Hello',
        'message_1': 'We\'re excited to welcome you to <strong>GuardianIQ</strong>, your new security management platform!',
        'message_2': 'Your account has been successfully created. Here\'s your information:',
        'username_label': 'Username:',
        'email_label': 'Email:',
        'role_label': 'Role:',
        'message_3': 'You can now log in and start using all platform features.',
        'button_text': '🚀 Access the platform',
        'tip_title': '💡 Tip:',
        'tip_message': 'Feel free to explore the interface and contact our support team if you have questions.',
        'footer_message': 'We wish you an excellent experience on GuardianIQ!',
    }
}

# ========================================
# TRADUCTIONS COMMUNES
# ========================================

COMMON_TRANSLATIONS = {
    'fr': {
        'automated_email': 'Cet email a été envoyé automatiquement, merci de ne pas y répondre.',
        'copyright': '© 2025 <strong>GuardianIQ</strong> - Solution de gestion de la sécurité',
        'platform_link': 'Accéder à la plateforme',
        'contact_link': 'Contact',
    },
    'en': {
        'automated_email': 'This email was sent automatically, please do not reply.',
        'copyright': '© 2025 <strong>GuardianIQ</strong> - Security management solution',
        'platform_link': 'Access the platform',
        'contact_link': 'Contact',
    }
}

# ========================================
# TRADUCTIONS DES RÔLES
# ========================================

ROLE_TRANSLATIONS = {
    'CHEF_PROJET': {
        'fr': 'Chef de Projet',
        'en': 'Project Manager'
    },
    'ANALYSTE': {
        'fr': 'Analyste Sécurité',
        'en': 'Security Analyst'
    },
    'BUSINESS_OWNER': {
        'fr': 'Business Owner',
        'en': 'Business Owner'
    },
    'ADMIN': {
        'fr': 'Administrateur',
        'en': 'Administrator'
    }
}

ROLE_EMOJIS = {
    'CHEF_PROJET': '👨‍💼',
    'ANALYSTE': '🛡️',
    'BUSINESS_OWNER': '📊',
    'ADMIN': '⚙️'
}


def get_email_template(template_name, language='fr'):
    """
    Récupère un template d'email traduit

    Args:
        template_name (str): Nom du template ('password_reset' ou 'welcome')
        language (str): Code langue ('fr' ou 'en')

    Returns:
        dict: Dictionnaire contenant toutes les traductions du template
    """
    templates = {
        'password_reset': PASSWORD_RESET_TEMPLATES,
        'welcome': WELCOME_EMAIL_TEMPLATES,
    }

    template_dict = templates.get(template_name, PASSWORD_RESET_TEMPLATES)
    return template_dict.get(language, template_dict.get('fr'))


def get_role_display(role, language='fr'):
    """
    Récupère le nom traduit d'un rôle

    Args:
        role (str): Code du rôle (CHEF_PROJET, ANALYSTE, etc.)
        language (str): Code langue ('fr' ou 'en')

    Returns:
        str: Nom traduit du rôle
    """
    role_dict = ROLE_TRANSLATIONS.get(role, ROLE_TRANSLATIONS['CHEF_PROJET'])
    return role_dict.get(language, role_dict.get('fr'))


def get_role_emoji(role):
    """
    Récupère l'emoji associé à un rôle

    Args:
        role (str): Code du rôle (CHEF_PROJET, ANALYSTE, etc.)

    Returns:
        str: Emoji du rôle
    """
    return ROLE_EMOJIS.get(role, '👤')


def get_common_translations(language='fr'):
    """
    Récupère les traductions communes (footer, etc.)

    Args:
        language (str): Code langue ('fr' ou 'en')

    Returns:
        dict: Dictionnaire des traductions communes
    """
    return COMMON_TRANSLATIONS.get(language, COMMON_TRANSLATIONS.get('fr'))
