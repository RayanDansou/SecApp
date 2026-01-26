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
from .message_translations import get_message, get_user_language

User = get_user_model()


class GoogleCheckAccountView(APIView):
    """
    Endpoint pour vérifier si un compte Google existe
    POST /api/auth/google/check/

    Payload:
    {
        "credential": "google_id_token"
    }

    Retourne:
    {
        "exists": true/false,
        "email": "user@example.com"
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        lang = get_user_language(request=request)
        try:
            # Récupérer le token Google
            google_token = request.data.get('credential')

            if not google_token:
                return Response(
                    {'error': get_message('google', 'google_credential_required', lang)},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Vérifier le token Google
            try:
                google_client_id = os.getenv('GOOGLE_CLIENT_ID')

                if not google_client_id:
                    return Response(
                        {'error': get_message('google', 'google_config_missing', lang)},
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
                        {'error': get_message('google', 'invalid_google_token', lang)},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

                # Extraire l'email
                email = idinfo.get('email')

                if not email:
                    return Response(
                        {'error': get_message('google', 'email_not_provided', lang)},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            except ValueError as e:
                return Response(
                    {'error': get_message('google', 'invalid_google_token', lang)},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Vérifier si l'utilisateur existe
            user_exists = User.objects.filter(email=email).exists()

            return Response({
                'exists': user_exists,
                'email': email
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
        lang = get_user_language(request=request)
        try:
            # Récupérer le token Google et le rôle optionnel
            google_token = request.data.get('credential')
            role = request.data.get('role', User.Role.CHEF_PROJET)

            if not google_token:
                return Response(
                    {'error': get_message('google', 'google_credential_required', lang)},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Vérifier le token Google
            try:
                google_client_id = os.getenv('GOOGLE_CLIENT_ID')

                if not google_client_id:
                    return Response(
                        {'error': get_message('google', 'google_config_missing', lang)},
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
                        {'error': get_message('google', 'invalid_google_token', lang)},
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
                        {'error': get_message('google', 'email_not_provided', lang)},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            except ValueError as e:
                return Response(
                    {'error': get_message('google', 'invalid_google_token', lang)},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Valider le rôle si fourni (pas de rôle ADMIN via Google)
            valid_roles = [User.Role.CHEF_PROJET, User.Role.ANALYSTE, User.Role.BUSINESS_OWNER]
            if role not in valid_roles:
                role = User.Role.CHEF_PROJET

            # Chercher ou créer l'utilisateur
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0] + '_' + google_id[:8],
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': role,  # Utiliser le rôle fourni ou par défaut
                }
            )

            # Si l'utilisateur existe déjà, mettre à jour ses informations
            if not created:
                user.first_name = first_name or user.first_name
                user.last_name = last_name or user.last_name
                user.save()
            else:
                # Si c'est un nouveau compte créé via la connexion Google, envoyer l'email de bienvenue
                try:
                    from .email_service import email_service
                    email_service.send_welcome_email(
                        email=user.email,
                        username=user.username,
                        role=user.role,
                        language=lang
                    )
                except Exception as e:
                    print(f"Erreur lors de l'envoi de l'email de bienvenue: {str(e)}")
                    # On continue même si l'email échoue

            # Vérifier que le compte est actif
            if not user.is_active:
                return Response(
                    {'error': get_message('auth', 'account_disabled', lang)},
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
                'message': get_message('google', 'account_created', lang) if created else get_message('google', 'google_auth_success', lang)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
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
        lang = get_user_language(request=request)
        try:
            # Récupérer le token Google et le rôle
            google_token = request.data.get('credential')
            role = request.data.get('role', User.Role.CHEF_PROJET)

            if not google_token:
                return Response(
                    {'error': get_message('google', 'google_credential_required', lang)},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Valider le rôle
            valid_roles = [User.Role.CHEF_PROJET, User.Role.ANALYSTE, User.Role.BUSINESS_OWNER]
            if role not in valid_roles:
                return Response(
                    {'error': get_message('google', 'invalid_role', lang, roles=", ".join(valid_roles))},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Vérifier le token Google
            try:
                google_client_id = os.getenv('GOOGLE_CLIENT_ID')

                if not google_client_id:
                    return Response(
                        {'error': get_message('google', 'google_config_missing', lang)},
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
                        {'error': get_message('google', 'invalid_google_token', lang)},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

                # Extraire les informations de l'utilisateur
                email = idinfo.get('email')
                google_id = idinfo.get('sub')
                first_name = idinfo.get('given_name', '')
                last_name = idinfo.get('family_name', '')

                if not email:
                    return Response(
                        {'error': get_message('google', 'email_not_provided', lang)},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            except ValueError as e:
                return Response(
                    {'error': get_message('google', 'invalid_google_token', lang)},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Vérifier si l'utilisateur existe déjà
            if User.objects.filter(email=email).exists():
                return Response(
                    {'error': get_message('google', 'account_exists', lang)},
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
                    role=user.role,
                    language=lang
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
                'message': get_message('google', 'account_created', lang)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
