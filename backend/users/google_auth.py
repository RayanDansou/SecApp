"""
Google OAuth Authentication Views
Gère l'authentification Google et retourne des JWT tokens
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.contrib.auth import get_user_model
import os

User = get_user_model()


class GoogleLoginView(APIView):
    """
    Endpoint pour l'authentification Google via OAuth
    POST /api/auth/google/login/

    Payload:
    {
        "credential": "google_id_token"
    }

    Retourne:
    {
        "user": {...},
        "tokens": {
            "access": "...",
            "refresh": "..."
        }
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # Récupérer le token Google
            google_token = request.data.get('credential')

            if not google_token:
                return Response(
                    {'error': 'Google credential requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Vérifier le token Google
            try:
                google_client_id = os.getenv('GOOGLE_CLIENT_ID')

                if not google_client_id:
                    return Response(
                        {'error': 'Configuration Google OAuth manquante'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

                # Vérifier et décoder le token Google
                idinfo = id_token.verify_oauth2_token(
                    google_token,
                    requests.Request(),
                    google_client_id
                )

                # Vérifier que le token provient bien de Google
                if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                    return Response(
                        {'error': 'Token invalide'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

                # Extraire les informations de l'utilisateur
                email = idinfo.get('email')
                google_id = idinfo.get('sub')
                first_name = idinfo.get('given_name', '')
                last_name = idinfo.get('family_name', '')
                picture = idinfo.get('picture', '')

                if not email:
                    return Response(
                        {'error': 'Email non fourni par Google'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            except ValueError as e:
                return Response(
                    {'error': f'Token Google invalide: {str(e)}'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Chercher ou créer l'utilisateur
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0] + '_' + google_id[:8],
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': User.Role.CHEF_PROJET,  # Rôle par défaut
                }
            )

            # Si l'utilisateur existe déjà, mettre à jour ses informations
            if not created:
                user.first_name = first_name or user.first_name
                user.last_name = last_name or user.last_name
                user.save()

            # Vérifier que le compte est actif
            if not user.is_active:
                return Response(
                    {'error': 'Compte désactivé'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)

            # Importer le serializer ici pour éviter les imports circulaires
            from .serializers import UserSerializer

            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'created': created,
                'message': 'Compte créé avec succès' if created else 'Connexion réussie'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Erreur lors de l\'authentification Google: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GoogleRegisterView(APIView):
    """
    Endpoint pour l'inscription Google avec sélection de rôle
    POST /api/auth/google/register/

    Payload:
    {
        "credential": "google_id_token",
        "role": "CHEF_PROJET"  # ou ANALYSTE, BUSINESS_OWNER
    }

    Retourne:
    {
        "user": {...},
        "tokens": {
            "access": "...",
            "refresh": "..."
        }
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # Récupérer le token Google et le rôle
            google_token = request.data.get('credential')
            role = request.data.get('role', User.Role.CHEF_PROJET)

            if not google_token:
                return Response(
                    {'error': 'Google credential requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Valider le rôle
            valid_roles = [User.Role.CHEF_PROJET, User.Role.ANALYSTE, User.Role.BUSINESS_OWNER]
            if role not in valid_roles:
                return Response(
                    {'error': f'Rôle invalide. Choisissez parmi: {", ".join(valid_roles)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Vérifier le token Google
            try:
                google_client_id = os.getenv('GOOGLE_CLIENT_ID')

                if not google_client_id:
                    return Response(
                        {'error': 'Configuration Google OAuth manquante'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

                # Vérifier et décoder le token Google
                idinfo = id_token.verify_oauth2_token(
                    google_token,
                    requests.Request(),
                    google_client_id
                )

                # Vérifier que le token provient bien de Google
                if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                    return Response(
                        {'error': 'Token invalide'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

                # Extraire les informations de l'utilisateur
                email = idinfo.get('email')
                google_id = idinfo.get('sub')
                first_name = idinfo.get('given_name', '')
                last_name = idinfo.get('family_name', '')

                if not email:
                    return Response(
                        {'error': 'Email non fourni par Google'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            except ValueError as e:
                return Response(
                    {'error': f'Token Google invalide: {str(e)}'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Vérifier si l'utilisateur existe déjà
            if User.objects.filter(email=email).exists():
                return Response(
                    {'error': 'Un compte existe déjà avec cet email. Utilisez la connexion Google.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Créer l'utilisateur
            user = User.objects.create(
                email=email,
                username=email.split('@')[0] + '_' + google_id[:8],
                first_name=first_name,
                last_name=last_name,
                role=role,
            )

            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)

            # Envoyer l'email de bienvenue
            try:
                from .email_service import email_service
                email_service.send_welcome_email(
                    email=user.email,
                    username=user.username,
                    role=user.role
                )
            except Exception as e:
                print(f"Erreur lors de l'envoi de l'email de bienvenue: {str(e)}")
                # On continue même si l'email échoue

            # Importer le serializer ici pour éviter les imports circulaires
            from .serializers import UserSerializer

            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'message': 'Compte créé avec succès'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Erreur lors de l\'inscription Google: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
