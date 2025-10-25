from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from users.models import User
from .models import Questionnaire


class QuestionnaireModelTest(TestCase):
    """Tests pour le modèle Questionnaire"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            role=User.Role.CHEF_PROJET
        )

    def test_create_questionnaire(self):
        """Test de création d'un questionnaire"""
        questionnaire = Questionnaire.objects.create(
            title='Projet CRM Interne',
            owner=self.user
        )
        self.assertEqual(questionnaire.title, 'Projet CRM Interne')
        self.assertEqual(questionnaire.owner, self.user)
        self.assertEqual(questionnaire.status, Questionnaire.Status.BROUILLON)

    def test_questionnaire_string_representation(self):
        """Test de la représentation en string d'un questionnaire"""
        questionnaire = Questionnaire.objects.create(
            title='Projet CRM',
            owner=self.user,
            status=Questionnaire.Status.SOUMIS
        )
        expected = "Projet CRM (Soumis)"
        self.assertEqual(str(questionnaire), expected)

    def test_questionnaire_statuses(self):
        """Test des différents statuts de questionnaire"""
        statuses = [
            Questionnaire.Status.BROUILLON,
            Questionnaire.Status.SOUMIS,
            Questionnaire.Status.EN_ANALYSE,
            Questionnaire.Status.VALIDE,
            Questionnaire.Status.REJETE
        ]
        for status_choice in statuses:
            questionnaire = Questionnaire.objects.create(
                title=f'Questionnaire {status_choice}',
                owner=self.user,
                status=status_choice
            )
            self.assertEqual(questionnaire.status, status_choice)


class QuestionnaireAPITest(APITestCase):
    """Tests pour les endpoints d'API des questionnaires"""

    def setUp(self):
        self.client = APIClient()

        # Créer deux utilisateurs
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='TestPass123!',
            role=User.Role.CHEF_PROJET
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='TestPass123!',
            role=User.Role.ANALYSTE
        )

        # URLs
        self.list_url = reverse('questionnaires:questionnaire-list-create')

        # Authentifier user1
        self.client.force_authenticate(user=self.user1)

    def test_create_questionnaire(self):
        """Test de création d'un questionnaire"""
        data = {
            'title': 'Nouveau Projet CRM',
            'status': Questionnaire.Status.BROUILLON
        }
        response = self.client.post(self.list_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Questionnaire.objects.count(), 1)
        self.assertEqual(Questionnaire.objects.first().owner, self.user1)
        self.assertEqual(response.data['title'], 'Nouveau Projet CRM')

    def test_create_questionnaire_invalid_title(self):
        """Test de création avec un titre invalide"""
        data = {
            'title': 'AB',  # Trop court
            'status': Questionnaire.Status.BROUILLON
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_questionnaire_unauthenticated(self):
        """Test de création sans authentification"""
        self.client.force_authenticate(user=None)
        data = {
            'title': 'Projet Test',
            'status': Questionnaire.Status.BROUILLON
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_questionnaires(self):
        """Test de récupération de la liste des questionnaires"""
        # Créer quelques questionnaires pour user1
        Questionnaire.objects.create(title='Questionnaire 1', owner=self.user1)
        Questionnaire.objects.create(title='Questionnaire 2', owner=self.user1)
        # Créer un questionnaire pour user2 (ne doit pas apparaître)
        Questionnaire.objects.create(title='Questionnaire 3', owner=self.user2)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Seulement les questionnaires de user1

    def test_list_questionnaires_unauthenticated(self):
        """Test de récupération sans authentification"""
        self.client.force_authenticate(user=None)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_questionnaire_detail(self):
        """Test de récupération des détails d'un questionnaire"""
        questionnaire = Questionnaire.objects.create(
            title='Mon Questionnaire',
            owner=self.user1
        )
        detail_url = reverse('questionnaires:questionnaire-detail', kwargs={'pk': questionnaire.pk})

        response = self.client.get(detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Mon Questionnaire')
        self.assertEqual(response.data['owner']['username'], 'user1')

    def test_get_questionnaire_detail_not_owner(self):
        """Test d'accès à un questionnaire dont on n'est pas propriétaire"""
        questionnaire = Questionnaire.objects.create(
            title='Questionnaire User2',
            owner=self.user2
        )
        detail_url = reverse('questionnaires:questionnaire-detail', kwargs={'pk': questionnaire.pk})

        response = self.client.get(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_questionnaire(self):
        """Test de mise à jour d'un questionnaire"""
        questionnaire = Questionnaire.objects.create(
            title='Titre Original',
            owner=self.user1,
            status=Questionnaire.Status.BROUILLON
        )
        detail_url = reverse('questionnaires:questionnaire-detail', kwargs={'pk': questionnaire.pk})

        data = {
            'title': 'Titre Modifié',
            'status': Questionnaire.Status.SOUMIS
        }
        response = self.client.put(detail_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        questionnaire.refresh_from_db()
        self.assertEqual(questionnaire.title, 'Titre Modifié')
        self.assertEqual(questionnaire.status, Questionnaire.Status.SOUMIS)

    def test_update_questionnaire_not_owner(self):
        """Test de mise à jour d'un questionnaire par un non-propriétaire"""
        questionnaire = Questionnaire.objects.create(
            title='Questionnaire User2',
            owner=self.user2
        )
        detail_url = reverse('questionnaires:questionnaire-detail', kwargs={'pk': questionnaire.pk})

        data = {'title': 'Titre Modifié'}
        response = self.client.patch(detail_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_questionnaire(self):
        """Test de suppression d'un questionnaire"""
        questionnaire = Questionnaire.objects.create(
            title='Questionnaire à Supprimer',
            owner=self.user1
        )
        detail_url = reverse('questionnaires:questionnaire-detail', kwargs={'pk': questionnaire.pk})

        response = self.client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Questionnaire.objects.count(), 0)

    def test_delete_questionnaire_not_owner(self):
        """Test de suppression d'un questionnaire par un non-propriétaire"""
        questionnaire = Questionnaire.objects.create(
            title='Questionnaire User2',
            owner=self.user2
        )
        detail_url = reverse('questionnaires:questionnaire-detail', kwargs={'pk': questionnaire.pk})

        response = self.client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Questionnaire.objects.count(), 1)


class QuestionnairePermissionsTest(APITestCase):
    """Tests spécifiques pour les permissions"""

    def setUp(self):
        self.client = APIClient()

        self.chef_projet = User.objects.create_user(
            username='chef',
            email='chef@example.com',
            password='TestPass123!',
            role=User.Role.CHEF_PROJET
        )

        self.analyste = User.objects.create_user(
            username='analyste',
            email='analyste@example.com',
            password='TestPass123!',
            role=User.Role.ANALYSTE
        )

    def test_owner_can_only_see_own_questionnaires(self):
        """Test qu'un utilisateur ne voit que ses propres questionnaires"""
        # Créer des questionnaires pour différents utilisateurs
        Questionnaire.objects.create(title='Q1', owner=self.chef_projet)
        Questionnaire.objects.create(title='Q2', owner=self.chef_projet)
        Questionnaire.objects.create(title='Q3', owner=self.analyste)

        # Authentifier comme chef_projet
        self.client.force_authenticate(user=self.chef_projet)
        list_url = reverse('questionnaires:questionnaire-list-create')
        response = self.client.get(list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Seulement Q1 et Q2

        # Authentifier comme analyste
        self.client.force_authenticate(user=self.analyste)
        response = self.client.get(list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Seulement Q3
