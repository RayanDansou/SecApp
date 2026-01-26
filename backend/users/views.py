from rest_framework import status, generics, parsers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import authenticate
from django.conf import settings
import os
from .models import User, PasswordResetToken
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ProfilePictureSerializer
)
from .email_service import email_service
from .message_translations import get_message, get_user_language


class LoginView(APIView):
    """
    Endpoint de connexion - POST /api/auth/login/
    Retourne access et refresh tokens
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        lang = get_user_language(request=request)
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {'error': get_message('auth', 'invalid_credentials', lang)},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': get_message('auth', 'account_disabled', lang)},
                status=status.HTTP_403_FORBIDDEN
            )

        # Génération des tokens JWT
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Endpoint de déconnexion - POST /api/auth/logout/
    Blacklist le refresh token
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        lang = get_user_language(user=request.user, request=request)
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response(
                    {'error': get_message('auth', 'refresh_token_required', lang)},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {'message': get_message('auth', 'logout_success', lang)},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class RegisterView(generics.CreateAPIView):
    """
    Endpoint d'enregistrement - POST /api/auth/register/
    Crée un nouvel utilisateur
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

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
                language=lang
            )
        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email de bienvenue: {str(e)}")
            # On continue même si l'email échoue

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': get_message('auth', 'user_created', lang)
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Endpoint pour récupérer et mettre à jour le profil - GET/PUT /api/auth/profile/
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """
    Endpoint pour changer le mot de passe - POST /api/auth/change-password/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        lang = get_user_language(user=request.user, request=request)
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        # Vérification de l'ancien mot de passe
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': get_message('password', 'old_password_incorrect', lang)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mise à jour du mot de passe
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response(
            {'message': get_message('password', 'password_changed', lang)},
            status=status.HTTP_200_OK
        )


class UpdateProfilePictureView(generics.UpdateAPIView):
    """
    Endpoint pour mettre à jour la photo de profil - PATCH/PUT /api/auth/profile-picture/
    Supporte l'upload d'une photo personnalisée ou la sélection d'un avatar prédéfini
    """
    serializer_class = ProfilePictureSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        """
        Met à jour la photo de profil de l'utilisateur
        """
        lang = get_user_language(user=request.user, request=request)
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Supprimer l'ancienne photo si une nouvelle est uploadée
        if 'profile_picture' in request.data and instance.profile_picture:
            # Supprimer l'ancien fichier
            if os.path.isfile(instance.profile_picture.path):
                os.remove(instance.profile_picture.path)

        self.perform_update(serializer)

        return Response({
            'message': get_message('profile', 'profile_picture_updated', lang),
            'user': serializer.data
        }, status=status.HTTP_200_OK)


class RefreshTokenView(TokenRefreshView):
    """
    Endpoint pour rafraîchir le token - POST /api/auth/refresh/
    """
    permission_classes = [AllowAny]


class DeleteAccountView(APIView):
    """
    Endpoint pour supprimer un compte utilisateur - DELETE /api/auth/delete-account/<user_id>/
    - Un utilisateur peut supprimer son propre compte (sans user_id)
    - Un admin peut supprimer n'importe quel compte (avec user_id)
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id=None):
        lang = get_user_language(user=request.user, request=request)
        try:
            # Si user_id est fourni, c'est un admin qui supprime un autre compte
            if user_id:
                # Vérifier que l'utilisateur est admin
                if request.user.role != User.Role.ADMIN:
                    return Response(
                        {'error': get_message('account', 'admin_only', lang)},
                        status=status.HTTP_403_FORBIDDEN
                    )

                # Vérifier que l'utilisateur cible existe
                try:
                    user_to_delete = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    return Response(
                        {'error': get_message('account', 'user_not_found', lang)},
                        status=status.HTTP_404_NOT_FOUND
                    )

                # Empêcher un admin de se supprimer lui-même via cette route
                if user_to_delete.id == request.user.id:
                    return Response(
                        {'error': get_message('account', 'cannot_delete_self', lang)},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                deleted_username = user_to_delete.username
                user_to_delete.delete()

                return Response(
                    {'message': get_message('account', 'account_deleted', lang, username=deleted_username)},
                    status=status.HTTP_200_OK
                )

            # Sinon, l'utilisateur supprime son propre compte
            else:
                deleted_username = request.user.username
                request.user.delete()

                return Response(
                    {'message': get_message('account', 'self_account_deleted', lang, username=deleted_username)},
                    status=status.HTTP_200_OK
                )

        except Exception as e:
            return Response(
                {'error': get_message('account', 'delete_error', lang, error=str(e))},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserListView(generics.ListAPIView):
    """
    Endpoint pour lister tous les utilisateurs - GET /api/auth/users/
    Accessible uniquement aux administrateurs
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Seuls les admins peuvent voir la liste de tous les utilisateurs
        if self.request.user.role == User.Role.ADMIN:
            return User.objects.all().order_by('-date_joined')
        else:
            # Les non-admins ne voient que leur propre profil
            return User.objects.filter(id=self.request.user.id)


class PasswordResetRequestView(APIView):
    """
    Endpoint pour demander une réinitialisation de mot de passe - POST /api/auth/password-reset/request/
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

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
                    language=lang
                )
            except Exception as e:
                print(f"Erreur lors de l'envoi de l'email: {str(e)}")
                # On continue même si l'email échoue pour ne pas révéler si l'utilisateur existe

            return Response(
                {'message': get_message('password', 'reset_link_sent', lang)},
                status=status.HTTP_200_OK
            )

        except User.DoesNotExist:
            # Pour des raisons de sécurité, on retourne le même message
            # que si l'utilisateur existe (pour ne pas révéler l'existence du compte)
            return Response(
                {'message': get_message('password', 'reset_link_sent', lang)},
                status=status.HTTP_200_OK
            )


class PasswordResetConfirmView(APIView):
    """
    Endpoint pour confirmer la réinitialisation de mot de passe - POST /api/auth/password-reset/confirm/
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

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
                    {'error': get_message('password', 'reset_link_invalid', lang)},
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
                {'message': get_message('password', 'password_reset_success', lang)},
                status=status.HTTP_200_OK
            )

        except PasswordResetToken.DoesNotExist:
            return Response(
                {'error': get_message('password', 'reset_token_invalid', lang)},
                status=status.HTTP_400_BAD_REQUEST
            )
