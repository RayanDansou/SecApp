# Guide de Traduction des Emails - GuardianIQ

## ✅ Fichiers Créés

### 1. `backend/users/email_templates.py`

Contient tous les templates d'emails traduits :
- **PASSWORD_RESET_TEMPLATES** (FR/EN)
- **WELCOME_EMAIL_TEMPLATES** (FR/EN)
- **COMMON_TRANSLATIONS** (footer, liens, etc.)
- **ROLE_TRANSLATIONS** (noms de rôles traduits)

### Fonctions utilitaires :
- `get_email_template(template_name, language)` - Récupère un template traduit
- `get_role_display(role, language)` - Récupère le nom traduit d'un rôle
- `get_role_emoji(role)` - Récupère l'emoji d'un rôle
- `get_common_translations(language)` - Récupère les traductions communes

---

## 🔧 Modifications à Faire dans `email_service.py`

### 1. Ajouter les imports

**Au début du fichier** (après ligne 4) :

```python
from .email_templates import (
    get_email_template,
    get_role_display,
    get_role_emoji,
    get_common_translations
)
```

### 2. Modifier la méthode `get_email_template_base()`

**Ligne 26 - Ajouter le paramètre `language`** :

```python
@staticmethod
def get_email_template_base(content, language='fr'):
    """
    Template de base pour tous les emails avec logo GuardianIQ

    Args:
        content (str): Contenu HTML de l'email
        language (str): Code langue ('fr' ou 'en')

    Returns:
        str: Template HTML complet
    """
    # Récupérer les traductions communes
    common = get_common_translations(language)

    # Définir la langue du HTML
    html_lang = language

    return f"""
    <!DOCTYPE html>
    <html lang="{html_lang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GuardianIQ</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
            <!-- En-tête avec logo -->
            <tr>
                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #0D8FDB 0%, #0B7AC2 100%);">
                    <!-- Logo SVG (inchangé) -->
                    <svg width="80" height="80" viewBox="0 0 200 200">
                        <!-- ... SVG content ... -->
                    </svg>
                    <h1 style="color: #FFFFFF; font-size: 28px; margin: 15px 0 0 0; font-weight: 300;">
                        Guardian<span style="font-weight: 800;">IQ</span>
                    </h1>
                </td>
            </tr>

            <!-- Contenu principal -->
            <tr>
                <td style="padding: 40px; background-color: #FFFFFF;">
                    {content}
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 15px 0; color: #6c757d; font-size: 13px;">
                        {common['footer_auto_email']}
                    </p>
                    <p style="margin: 0 0 20px 0; color: #495057; font-size: 14px;">
                        {common['footer_copyright']}
                    </p>
                    <div style="margin-top: 20px;">
                        <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3333')}"
                           style="color: #0D8FDB; text-decoration: none; margin: 0 15px; font-size: 13px;">
                            {common['link_platform']}
                        </a>
                        <span style="color: #dee2e6;">•</span>
                        <a href="mailto:contact@guardianiq.com"
                           style="color: #0D8FDB; text-decoration: none; margin: 0 15px; font-size: 13px;">
                            {common['link_contact']}
                        </a>
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
```

### 3. Modifier `send_password_reset_email()`

**Ajouter le paramètre `language='fr'`** (ligne 98) :

```python
@staticmethod
def send_password_reset_email(email, reset_link, username, language='fr'):
    """
    Envoie un email de réinitialisation de mot de passe

    Args:
        email (str): Adresse email du destinataire
        reset_link (str): Lien de réinitialisation
        username (str): Nom d'utilisateur
        language (str): Langue de l'email ('fr' ou 'en')

    Returns:
        dict: Réponse de l'API Resend
    """
    # Récupérer le template traduit
    t = get_email_template('password_reset', language)

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
            <!-- Bouton CTA -->
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
            <!-- Avertissement -->
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
```

### 4. Modifier `send_welcome_email()`

**Ajouter le paramètre `language='fr'`** (ligne 161) :

```python
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
    # Récupérer le template traduit
    t = get_email_template('welcome', language)

    # Récupérer les traductions du rôle
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
            <!-- Carte d'informations -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                   style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; margin: 25px 0;">
                <tr>
                    <td style="padding: 25px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="padding: 8px 0; font-size: 15px; color: #495057;">
                                    <strong>{t['info_username']}</strong>
                                </td>
                                <td style="padding: 8px 0; font-size: 15px; color: #212529; text-align: right;">
                                    <strong>{username}</strong>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 15px; color: #495057;">
                                    <strong>{t['info_email']}</strong>
                                </td>
                                <td style="padding: 8px 0; font-size: 15px; color: #212529; text-align: right;">
                                    {email}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 15px; color: #495057;">
                                    <strong>{t['info_role'].format(role_emoji=role_emoji)}</strong>
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
            <!-- Bouton CTA -->
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
            <!-- Astuce -->
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
```

---

## 🔄 Modifications dans les Vues (views.py)

### RegisterView

**Passer la langue à l'email de bienvenue** (ligne ~110-116) :

```python
# Envoyer l'email de bienvenue
try:
    lang = get_user_language(request=request)  # ← AJOUTER
    email_service.send_welcome_email(
        email=user.email,
        username=user.username,
        role=user.role,
        language=lang  # ← AJOUTER
    )
except Exception as e:
    print(f"Erreur lors de l'envoi de l'email de bienvenue: {str(e)}")
```

### PasswordResetRequestView

**Passer la langue à l'email de réinitialisation** (ligne ~276-284) :

```python
# Envoyer l'email
try:
    lang = get_user_language(request=request)  # ← AJOUTER
    email_service.send_password_reset_email(
        email=user.email,
        reset_link=reset_link,
        username=user.username,
        language=lang  # ← AJOUTER
    )
except Exception as e:
    print(f"Erreur lors de l'envoi de l'email: {str(e)}")
```

### google_auth.py - GoogleLoginView et GoogleRegisterView

**Dans les deux vues, ajouter le paramètre language** :

```python
# Envoyer l'email de bienvenue
try:
    from .email_service import email_service
    from .message_translations import get_user_language

    lang = get_user_language(request=request)  # ← AJOUTER
    email_service.send_welcome_email(
        email=user.email,
        username=user.username,
        role=user.role,
        language=lang  # ← AJOUTER
    )
except Exception as e:
    print(f"Erreur lors de l'envoi de l'email de bienvenue: {str(e)}")
```

---

## 🧪 Tests

### Test email de bienvenue en anglais

Dans Postman/cURL, faire une requête d'inscription avec le header :

```bash
curl -X POST http://localhost:8888/api/auth/register/ \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234!",
    "password2": "Test1234!",
    "role": "CHEF_PROJET"
  }'
```

L'email de bienvenue devrait être en anglais.

### Test email de réinitialisation en anglais

```bash
curl -X POST http://localhost:8888/api/auth/password-reset/request/ \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{"email": "test@example.com"}'
```

L'email de réinitialisation devrait être en anglais.

---

## ✅ Résumé des Fichiers Créés/Modifiés

### Créés ✅
1. `backend/users/message_translations.py` - Système de traduction pour messages API
2. `backend/users/email_templates.py` - Templates d'emails multilingues
3. `backend/BACKEND_TRANSLATIONS_GUIDE.md` - Guide de traduction API
4. `backend/EMAIL_TRANSLATION_GUIDE.md` - Guide de traduction emails

### À Modifier ⏳
1. `backend/users/email_service.py` - Utiliser les templates multilingues
2. `backend/users/views.py` - Passer le paramètre `language` aux emails
3. `backend/users/google_auth.py` - Passer le paramètre `language` aux emails

---

## 🎯 Prochaines Étapes

1. ✅ Appliquer les modifications dans `email_service.py`
2. ⏳ Tester les emails en FR et EN
3. ⏳ Terminer les traductions des messages API dans `views.py`
4. ⏳ Déployer et tester en production

---

## 📞 Support

Si vous avez des questions sur l'implémentation, consultez :
- Les fichiers de template créés (`email_templates.py`, `message_translations.py`)
- La documentation inline dans le code
- Les exemples dans ce guide
