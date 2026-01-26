# Guide de Traduction Backend - GuardianIQ

## ✅ Système Implémenté

### Fichier créé : `backend/users/message_translations.py`

Ce fichier contient :
- **Dictionnaires de messages** organisés par catégorie :
  - `AUTH_MESSAGES` : Authentification
  - `PASSWORD_MESSAGES` : Gestion mots de passe
  - `PROFILE_MESSAGES` : Gestion profil
  - `ACCOUNT_MESSAGES` : Gestion comptes
  - `GOOGLE_MESSAGES` : OAuth Google
  - `GENERIC_MESSAGES` : Messages génériques

- **Fonctions utilitaires** :
  - `get_message(category, key, lang='fr', **kwargs)` : Récupère un message traduit
  - `get_user_language(user=None, request=None)` : Détermine la langue de l'utilisateur

---

## 📝 Comment Utiliser

### 1. Importer les fonctions

```python
from .message_translations import get_message, get_user_language
```

### 2. Déterminer la langue dans chaque vue

```python
def post(self, request):
    lang = get_user_language(request=request)
    # ... reste du code
```

### 3. Remplacer les messages hardcodés

**Avant** :
```python
return Response(
    {'error': 'Identifiants invalides'},
    status=status.HTTP_401_UNAUTHORIZED
)
```

**Après** :
```python
return Response(
    {'error': get_message('auth', 'invalid_credentials', lang)},
    status=status.HTTP_401_UNAUTHORIZED
)
```

---

## 🔄 Modifications à Faire dans `users/views.py`

### ✅ DÉJÀ FAIT

**LoginView** (lignes 32-63) :
- ✅ Import du système de traduction
- ✅ Détection de la langue
- ✅ Messages `invalid_credentials` et `account_disabled` traduits

### 🔄 À FAIRE

#### LogoutView (lignes 66-92)

```python
def post(self, request):
    lang = get_user_language(user=request.user, request=request)
    try:
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response(
                {'error': get_message('auth', 'refresh_token_required', lang)},  # ← MODIFIER
                status=status.HTTP_400_BAD_REQUEST
            )

        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response(
            {'message': get_message('auth', 'logout_success', lang)},  # ← MODIFIER
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
```

#### RegisterView (lignes 95-130)

```python
def create(self, request, *args, **kwargs):
    lang = get_user_language(request=request)
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    # Génération des tokens pour auto-login après registration
    refresh = RefreshToken.for_user(user)

    # Envoyer l'email de bienvenue
    try:
        email_service.send_welcome_email(
            email=user.email,
            username=user.username,
            role=user.role,
            language=lang  # ← AJOUTER le paramètre language
        )
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email de bienvenue: {str(e)}")

    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        },
        'message': get_message('auth', 'user_created', lang)  # ← MODIFIER
    }, status=status.HTTP_201_CREATED)
```

#### ChangePasswordView (lignes 144-170)

```python
def post(self, request):
    lang = get_user_language(user=request.user, request=request)
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = request.user

    # Vérification de l'ancien mot de passe
    if not user.check_password(serializer.validated_data['old_password']):
        return Response(
            {'error': get_message('password', 'old_password_incorrect', lang)},  # ← MODIFIER
            status=status.HTTP_400_BAD_REQUEST
        )

    # Mise à jour du mot de passe
    user.set_password(serializer.validated_data['new_password'])
    user.save()

    return Response(
        {'message': get_message('password', 'password_changed', lang)},  # ← MODIFIER
        status=status.HTTP_200_OK
    )
```

#### UpdateProfilePictureView (lignes 178-204)

```python
def patch(self, request):
    lang = get_user_language(user=request.user, request=request)
    # ... code existant ...

    return Response({
        'user': serializer.data,
        'message': get_message('profile', 'profile_picture_updated', lang)  # ← MODIFIER
    }, status=status.HTTP_200_OK)
```

#### DeleteAccountView (lignes 206-268)

```python
def delete(self, request, user_id=None):
    lang = get_user_language(user=request.user, request=request)
    try:
        # Si user_id est fourni, c'est un admin qui supprime un autre compte
        if user_id:
            # Vérifier que l'utilisateur est admin
            if request.user.role != User.Role.ADMIN:
                return Response(
                    {'error': get_message('account', 'admin_only', lang)},  # ← MODIFIER
                    status=status.HTTP_403_FORBIDDEN
                )

            # Vérifier que l'utilisateur cible existe
            try:
                user_to_delete = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response(
                    {'error': get_message('account', 'user_not_found', lang)},  # ← MODIFIER
                    status=status.HTTP_404_NOT_FOUND
                )

            # Empêcher un admin de se supprimer lui-même via cette route
            if user_to_delete.id == request.user.id:
                return Response(
                    {'error': get_message('account', 'cannot_delete_self', lang)},  # ← MODIFIER
                    status=status.HTTP_400_BAD_REQUEST
                )

            deleted_username = user_to_delete.username
            user_to_delete.delete()

            return Response(
                {'message': get_message('account', 'account_deleted', lang, username=deleted_username)},  # ← MODIFIER
                status=status.HTTP_200_OK
            )

        # Sinon, l'utilisateur supprime son propre compte
        else:
            deleted_username = request.user.username
            request.user.delete()

            return Response(
                {'message': get_message('account', 'self_account_deleted', lang, username=deleted_username)},  # ← MODIFIER
                status=status.HTTP_200_OK
            )

    except Exception as e:
        return Response(
            {'error': get_message('account', 'delete_error', lang, error=str(e))},  # ← MODIFIER
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

#### PasswordResetRequestView (lignes 285-335)

```python
def post(self, request):
    lang = get_user_language(request=request)
    serializer = self.serializer_class(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email']

    try:
        user = User.objects.get(email=email)

        # Créer un token de réinitialisation
        reset_token = PasswordResetToken.create_token(user)

        # Générer le lien de réinitialisation
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3333')
        reset_link = f"{frontend_url}/reset-password?token={reset_token.token}"

        # Envoyer l'email
        try:
            email_service.send_password_reset_email(
                email=user.email,
                reset_link=reset_link,
                username=user.username,
                language=lang  # ← AJOUTER le paramètre language
            )
        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email: {str(e)}")

        return Response(
            {'message': get_message('password', 'reset_link_sent', lang)},  # ← MODIFIER
            status=status.HTTP_200_OK
        )

    except User.DoesNotExist:
        # Pour des raisons de sécurité, on retourne le même message
        return Response(
            {'message': get_message('password', 'reset_link_sent', lang)},  # ← MODIFIER
            status=status.HTTP_200_OK
        )
```

#### PasswordResetConfirmView (lignes 337-381)

```python
def post(self, request):
    lang = get_user_language(request=request)
    serializer = self.serializer_class(data=request.data)
    serializer.is_valid(raise_exception=True)

    token_str = serializer.validated_data['token']
    new_password = serializer.validated_data['new_password']

    try:
        # Récupérer le token
        reset_token = PasswordResetToken.objects.get(token=token_str)

        # Vérifier si le token est valide
        if not reset_token.is_valid():
            return Response(
                {'error': get_message('password', 'reset_link_invalid', lang)},  # ← MODIFIER
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mettre à jour le mot de passe
        user = reset_token.user
        user.set_password(new_password)
        user.save()

        # Marquer le token comme utilisé
        reset_token.used = True
        reset_token.save()

        return Response(
            {'message': get_message('password', 'password_reset_success', lang)},  # ← MODIFIER
            status=status.HTTP_200_OK
        )

    except PasswordResetToken.DoesNotExist:
        return Response(
            {'error': get_message('password', 'reset_token_invalid', lang)},  # ← MODIFIER
            status=status.HTTP_400_BAD_REQUEST
        )
```

---

## 🔧 Modifications à Faire dans `google_auth.py`

Le fichier `google_auth.py` contient également des messages hardcodés à traduire :

### GoogleCheckAccountView

```python
def post(self, request):
    lang = get_user_language(request=request)
    try:
        google_token = request.data.get('credential')

        if not google_token:
            return Response(
                {'error': get_message('google', 'google_credential_required', lang)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ... reste du code
```

### GoogleLoginView et GoogleRegisterView

Appliquer le même pattern pour tous les messages d'erreur.

---

## 📧 Emails - Prochaine Étape

Les emails dans `users/email_service.py` doivent également être traduits. Deux approches :

### Option 1 : Templates séparés (RECOMMANDÉ)
Créer des fichiers séparés :
- `email_templates_fr.py`
- `email_templates_en.py`

### Option 2 : Dictionnaires dans email_service.py
Ajouter des dictionnaires de traduction directement dans le fichier.

---

## 📊 Progression

### Backend API Messages
- ✅ Système de traduction créé
- ✅ Import dans views.py
- ✅ LoginView traduit (exemple)
- ⏳ Autres vues à traduire (17 messages restants)

### Emails
- ⏳ Système de templates multilingues à créer
- ⏳ Email de bienvenue à traduire
- ⏳ Email de réinitialisation à traduire

---

## 🎯 Pour Finaliser

1. **Appliquer les modifications ci-dessus** à tous les endpoints de `users/views.py`
2. **Appliquer les modifications** à `google_auth.py`
3. **Créer les templates d'emails multilingues** (voir section suivante)
4. **Tester** avec le header `Accept-Language: en` dans les requêtes HTTP

---

## 💡 Astuce - Test avec Postman/cURL

Pour tester les traductions anglaises :

```bash
curl -X POST http://localhost:8888/api/auth/login/ \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{"username":"test","password":"wrong"}'
```

Devrait retourner : `{"error": "Invalid credentials"}`

Sans le header ou avec `Accept-Language: fr` :
Devrait retourner : `{"error": "Identifiants invalides"}`
