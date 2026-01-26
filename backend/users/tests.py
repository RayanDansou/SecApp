from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import User


class UserModelTest(TestCase):
    """Tests pour le modèle User"""

    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'role': User.Role.CHEF_PROJET
        }

    def test_create_user(self):
        """Test de création d'un utilisateur"""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.username, self.user_data['username'])
        self.assertEqual(user.email, self.user_data['email'])
        self.assertEqual(user.role, self.user_data['role'])
        self.assertTrue(user.check_password(self.user_data['password']))

    def test_user_string_representation(self):
        """Test de la représentation en string d'un utilisateur"""
        user = User.objects.create_user(**self.user_data)
        expected = f"{user.username} (Chef de Projet)"
        self.assertEqual(str(user), expected)

    def test_user_roles(self):
        """Test des différents rôles utilisateur"""
        roles = [
            User.Role.CHEF_PROJET,
            User.Role.ANALYSTE,
            User.Role.BUSINESS_OWNER,
            User.Role.ADMIN
        ]
        for role in roles:
            user = User.objects.create_user(
                username=f'user_{role}',
                email=f'{role}@example.com',
                password='TestPass123!',
                role=role
            )
            self.assertEqual(user.role, role)


class AuthenticationAPITest(APITestCase):
    """Tests pour les endpoints d'authentification"""

    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse('users:login')
        self.logout_url = reverse('users:logout')
        self.register_url = reverse('users:register')
        self.profile_url = reverse('users:profile')

        # Créer un utilisateur de test
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'role': User.Role.CHEF_PROJET
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_user_login_success(self):
        """Test de connexion avec des identifiants valides"""
        data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], self.user_data['username'])

    def test_user_login_invalid_credentials(self):
        """Test de connexion avec des identifiants invalides"""
        data = {
            'username': self.user_data['username'],
            'password': 'WrongPassword123!'
        }
        response = self.client.post(self.login_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_user_login_missing_fields(self):
        """Test de connexion avec des champs manquants"""
        data = {'username': self.user_data['username']}
        response = self.client.post(self.login_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_success(self):
        """Test d'inscription avec des données valides"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'NewPass123!',
            'password2': 'NewPass123!',
            'role': User.Role.ANALYSTE,
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(self.register_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], data['username'])
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_user_registration_password_mismatch(self):
        """Test d'inscription avec des mots de passe différents"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'NewPass123!',
            'password2': 'DifferentPass123!',
            'role': User.Role.ANALYSTE
        }
        response = self.client.post(self.register_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username='newuser').exists())

    def test_user_registration_duplicate_username(self):
        """Test d'inscription avec un nom d'utilisateur existant"""
        data = {
            'username': self.user_data['username'],
            'email': 'different@example.com',
            'password': 'NewPass123!',
            'password2': 'NewPass123!',
            'role': User.Role.ANALYSTE
        }
        response = self.client.post(self.register_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_protected_route_without_token(self):
        """Test d'accès à une route protégée sans token"""
        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_route_with_valid_token(self):
        """Test d'accès à une route protégée avec un token valide"""
        # Se connecter pour obtenir le token
        login_data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        token = login_response.data['tokens']['access']

        # Accéder au profil avec le token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user_data['username'])

    def test_protected_route_with_invalid_token(self):
        """Test d'accès à une route protégée avec un token invalide"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token_here')
        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_with_valid_token(self):
        """Test de déconnexion avec un token valide"""
        # Se connecter pour obtenir les tokens
        login_data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        access_token = login_response.data['tokens']['access']
        refresh_token = login_response.data['tokens']['refresh']

        # Se déconnecter
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        logout_data = {'refresh_token': refresh_token}
        response = self.client.post(self.logout_url, logout_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_profile(self):
        """Test de mise à jour du profil utilisateur"""
        # Se connecter pour obtenir le token
        login_data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        token = login_response.data['tokens']['access']

        # Mettre à jour le profil
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        response = self.client.patch(self.profile_url, update_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Updated')
        self.assertEqual(response.data['last_name'], 'Name')


class TokenRefreshTest(APITestCase):
    """Tests pour le rafraîchissement de token"""

    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse('users:login')
        self.refresh_url = reverse('users:token_refresh')

        # Créer un utilisateur de test
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'role': User.Role.CHEF_PROJET
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_refresh_token_success(self):
        """Test de rafraîchissement du token avec un refresh token valide"""
        # Se connecter pour obtenir les tokens
        login_data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        refresh_token = login_response.data['tokens']['refresh']

        # Rafraîchir le token
        refresh_data = {'refresh': refresh_token}
        response = self.client.post(self.refresh_url, refresh_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_refresh_token_invalid(self):
        """Test de rafraîchissement avec un token invalide"""
        refresh_data = {'refresh': 'invalid_refresh_token'}
        response = self.client.post(self.refresh_url, refresh_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
