from rest_framework import status, generics
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
    PasswordResetConfirmSerializer
)
from .email_service import email_service


class LoginView(APIView):
    """
    Endpoint de connexion - POST /api/auth/login/
    Retourne access et refresh tokens
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {'error': 'Identifiants invalides'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'Compte désactivé'},
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
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {'message': 'Déconnexion réussie'},
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
                role=user.role
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
            'message': 'Utilisateur créé avec succès'
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
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        # Vérification de l'ancien mot de passe
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Ancien mot de passe incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mise à jour du mot de passe
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response(
            {'message': 'Mot de passe modifié avec succès'},
            status=status.HTTP_200_OK
        )


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
        try:
            # Si user_id est fourni, c'est un admin qui supprime un autre compte
            if user_id:
                # Vérifier que l'utilisateur est admin
                if request.user.role != User.Role.ADMIN:
                    return Response(
                        {'error': 'Seuls les administrateurs peuvent supprimer d\'autres comptes'},
                        status=status.HTTP_403_FORBIDDEN
                    )

                # Vérifier que l'utilisateur cible existe
                try:
                    user_to_delete = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    return Response(
                        {'error': 'Utilisateur non trouvé'},
                        status=status.HTTP_404_NOT_FOUND
                    )

                # Empêcher un admin de se supprimer lui-même via cette route
                if user_to_delete.id == request.user.id:
                    return Response(
                        {'error': 'Utilisez l\'endpoint sans user_id pour supprimer votre propre compte'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                deleted_username = user_to_delete.username
                user_to_delete.delete()

                return Response(
                    {'message': f'Compte de {deleted_username} supprimé avec succès'},
                    status=status.HTTP_200_OK
                )

            # Sinon, l'utilisateur supprime son propre compte
            else:
                deleted_username = request.user.username
                request.user.delete()

                return Response(
                    {'message': f'Votre compte {deleted_username} a été supprimé avec succès'},
                    status=status.HTTP_200_OK
                )

        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la suppression du compte: {str(e)}'},
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
                    username=user.username
                )
            except Exception as e:
                print(f"Erreur lors de l'envoi de l'email: {str(e)}")
                # On continue même si l'email échoue pour ne pas révéler si l'utilisateur existe

            return Response(
                {'message': 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.'},
                status=status.HTTP_200_OK
            )

        except User.DoesNotExist:
            # Pour des raisons de sécurité, on retourne le même message
            # que si l'utilisateur existe (pour ne pas révéler l'existence du compte)
            return Response(
                {'message': 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.'},
                status=status.HTTP_200_OK
            )


class PasswordResetConfirmView(APIView):
    """
    Endpoint pour confirmer la réinitialisation de mot de passe - POST /api/auth/password-reset/confirm/
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
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
                    {'error': 'Le lien de réinitialisation est invalide ou a expiré.'},
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
                {'message': 'Mot de passe réinitialisé avec succès.'},
                status=status.HTTP_200_OK
            )

        except PasswordResetToken.DoesNotExist:
            return Response(
                {'error': 'Le lien de réinitialisation est invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )
