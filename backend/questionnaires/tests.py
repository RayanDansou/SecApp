from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from users.models import User
from .models import (
    Questionnaire,
    Question,
    QuestionnaireDocument,
    QuestionnaireResponse,
    Answer,
    ResponseDocument,
    Comment,
    StatusHistory
)


class QuestionnaireModelTest(TestCase):
    """Tests pour le modèle Questionnaire (template)"""

    def setUp(self):
        self.analyste = User.objects.create_user(
            username='analyste',
            email='analyste@example.com',
            password='TestPass123!',
            role=User.Role.ANALYSTE
        )

    def test_create_questionnaire_template(self):
        """Test de création d'un questionnaire template"""
        questionnaire = Questionnaire.objects.create(
            title='Template Sécurité',
            description='Template pour évaluation sécurité',
            created_by=self.analyste,
            is_active=True
        )
        self.assertEqual(questionnaire.title, 'Template Sécurité')
        self.assertEqual(questionnaire.created_by, self.analyste)
        self.assertTrue(questionnaire.is_active)

    def test_questionnaire_string_representation(self):
        """Test de la représentation en string"""
        questionnaire = Questionnaire.objects.create(
            title='Template Test',
            created_by=self.analyste
        )
        self.assertEqual(str(questionnaire), 'Template Test')


class QuestionnaireResponseModelTest(TestCase):
    """Tests pour le modèle QuestionnaireResponse"""

    def setUp(self):
        self.analyste = User.objects.create_user(
            username='analyste',
            email='analyste@example.com',
            password='TestPass123!',
            role=User.Role.ANALYSTE
        )
        self.chef_projet = User.objects.create_user(
            username='chef',
            email='chef@example.com',
            password='TestPass123!',
            role=User.Role.CHEF_PROJET
        )
        self.questionnaire = Questionnaire.objects.create(
            title='Template Test',
            created_by=self.analyste
        )

    def test_create_response(self):
        """Test de création d'une réponse"""
        response = QuestionnaireResponse.objects.create(
            questionnaire=self.questionnaire,
            responder=self.chef_projet,
            status=QuestionnaireResponse.Status.BROUILLON
        )
        self.assertEqual(response.questionnaire, self.questionnaire)
        self.assertEqual(response.responder, self.chef_projet)
        self.assertEqual(response.status, QuestionnaireResponse.Status.BROUILLON)

    def test_unique_response_per_user(self):
        """Test qu'un utilisateur ne peut pas créer deux réponses au même questionnaire"""
        QuestionnaireResponse.objects.create(
            questionnaire=self.questionnaire,
            responder=self.chef_projet,
            status=QuestionnaireResponse.Status.BROUILLON
        )

        # Tenter de créer une deuxième réponse devrait échouer
        with self.assertRaises(Exception):
            QuestionnaireResponse.objects.create(
                questionnaire=self.questionnaire,
                responder=self.chef_projet,
                status=QuestionnaireResponse.Status.BROUILLON
            )

    def test_response_statuses(self):
        """Test des différents statuts"""
        statuses = [
            QuestionnaireResponse.Status.BROUILLON,
            QuestionnaireResponse.Status.SOUMIS,
            QuestionnaireResponse.Status.EN_ATTENTE,
            QuestionnaireResponse.Status.EN_VALIDATION,
            QuestionnaireResponse.Status.VALIDE,
            QuestionnaireResponse.Status.REJETE
        ]
        for idx, status_choice in enumerate(statuses):
            # Créer un questionnaire différent pour chaque statut
            q = Questionnaire.objects.create(
                title=f'Q{idx}',
                created_by=self.analyste
            )
            response = QuestionnaireResponse.objects.create(
                questionnaire=q,
                responder=self.chef_projet,
                status=status_choice
            )
            self.assertEqual(response.status, status_choice)


class QuestionnaireAPITest(APITestCase):
    """Tests pour les endpoints d'API des questionnaires templates"""

    def setUp(self):
        self.client = APIClient()

        self.analyste = User.objects.create_user(
            username='analyste',
            email='analyste@example.com',
            password='TestPass123!',
            role=User.Role.ANALYSTE
        )
        self.chef_projet = User.objects.create_user(
            username='chef',
            email='chef@example.com',
            password='TestPass123!',
            role=User.Role.CHEF_PROJET
        )
        self.business_owner = User.objects.create_user(
            username='owner',
            email='owner@example.com',
            password='TestPass123!',
            role=User.Role.BUSINESS_OWNER
        )

    def test_analyste_can_create_questionnaire(self):
        """Test qu'un analyste peut créer un questionnaire template"""
        self.client.force_authenticate(user=self.analyste)

        data = {
            'title': 'Nouveau Template',
            'description': 'Description du template',
            'is_active': True,
            'questions': [
                {'text': 'Question 1', 'order': 1, 'is_required': True},
                {'text': 'Question 2', 'order': 2, 'is_required': False}
            ]
        }

        response = self.client.post('/api/questionnaires/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Questionnaire.objects.count(), 1)
        self.assertEqual(Question.objects.count(), 2)

    def test_chef_projet_cannot_create_questionnaire(self):
        """Test qu'un chef de projet ne peut pas créer de template"""
        self.client.force_authenticate(user=self.chef_projet)

        data = {
            'title': 'Nouveau Template',
            'description': 'Description',
            'is_active': True
        }

        response = self.client.post('/api/questionnaires/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_all_users_can_list_active_questionnaires(self):
        """Test que tous les utilisateurs peuvent lister les questionnaires actifs"""
        # Créer des questionnaires
        Questionnaire.objects.create(
            title='Template Actif',
            created_by=self.analyste,
            is_active=True
        )
        Questionnaire.objects.create(
            title='Template Inactif',
            created_by=self.analyste,
            is_active=False
        )

        # Chef de projet voit seulement les actifs
        self.client.force_authenticate(user=self.chef_projet)
        response = self.client.get('/api/questionnaires/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # Analyste voit tous
        self.client.force_authenticate(user=self.analyste)
        response = self.client.get('/api/questionnaires/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_analyste_can_update_own_questionnaire(self):
        """Test qu'un analyste peut modifier son propre template"""
        questionnaire = Questionnaire.objects.create(
            title='Template Original',
            created_by=self.analyste
        )

        self.client.force_authenticate(user=self.analyste)
        data = {'title': 'Template Modifié', 'description': 'Nouvelle description'}

        response = self.client.put(
            f'/api/questionnaires/{questionnaire.id}/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        questionnaire.refresh_from_db()
        self.assertEqual(questionnaire.title, 'Template Modifié')

    def test_analyste_cannot_update_others_questionnaire(self):
        """Test qu'un analyste ne peut pas modifier le template d'un autre"""
        analyste2 = User.objects.create_user(
            username='analyste2',
            email='analyste2@example.com',
            password='TestPass123!',
            role=User.Role.ANALYSTE
        )
        questionnaire = Questionnaire.objects.create(
            title='Template Autre',
            created_by=analyste2
        )

        self.client.force_authenticate(user=self.analyste)
        data = {'title': 'Tentative Modification'}

        response = self.client.put(
            f'/api/questionnaires/{questionnaire.id}/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class QuestionAPITest(APITestCase):
    """Tests pour les endpoints des questions"""

    def setUp(self):
        self.client = APIClient()

        self.analyste = User.objects.create_user(
            username='analyste',
            email='analyste@example.com',
            password='TestPass123!',
            role=User.Role.ANALYSTE
        )
        self.chef_projet = User.objects.create_user(
            username='chef',
            email='chef@example.com',
            password='TestPass123!',
            role=User.Role.CHEF_PROJET
        )

        self.questionnaire = Questionnaire.objects.create(
            title='Template Test',
            created_by=self.analyste
        )

    def test_analyste_can_add_question(self):
        """Test qu'un analyste peut ajouter une question à son template"""
        self.client.force_authenticate(user=self.analyste)

        data = {
            'text': 'Est-ce que le système est accessible depuis Internet ?',
            'order': 1,
            'is_required': True
        }

        response = self.client.post(
            f'/api/questionnaires/{self.questionnaire.id}/questions/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Question.objects.count(), 1)

    def test_chef_projet_cannot_add_question(self):
        """Test qu'un chef de projet ne peut pas ajouter de question"""
        self.client.force_authenticate(user=self.chef_projet)

        data = {
            'text': 'Question test',
            'order': 1,
            'is_required': True
        }

        response = self.client.post(
            f'/api/questionnaires/{self.questionnaire.id}/questions/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class QuestionnaireResponseAPITest(APITestCase):
    """Tests pour les endpoints des réponses aux questionnaires"""

    def setUp(self):
        self.client = APIClient()

        self.analyste = User.objects.create_user(
            username='analyste',
            email='analyste@example.com',
            password='TestPass123!',
            role=User.Role.ANALYSTE
        )
        self.chef_projet = User.objects.create_user(
            username='chef',
            email='chef@example.com',
            password='TestPass123!',
            role=User.Role.CHEF_PROJET
        )
        self.business_owner = User.objects.create_user(
            username='owner',
            email='owner@example.com',
            password='TestPass123!',
            role=User.Role.BUSINESS_OWNER
        )

        self.questionnaire = Questionnaire.objects.create(
            title='Template Sécurité',
            created_by=self.analyste,
            is_active=True
        )
        self.question1 = Question.objects.create(
            questionnaire=self.questionnaire,
            text='Question 1',
            order=1,
            is_required=True
        )
        self.question2 = Question.objects.create(
            questionnaire=self.questionnaire,
            text='Question 2',
            order=2,
            is_required=True
        )

    def test_chef_projet_can_create_response(self):
        """Test qu'un chef de projet peut créer une réponse"""
        self.client.force_authenticate(user=self.chef_projet)

        data = {
            'questionnaire_id': self.questionnaire.id,
            'answers': [
                {'question_id': self.question1.id, 'answer_text': 'Réponse 1'},
                {'question_id': self.question2.id, 'answer_text': 'Réponse 2'}
            ]
        }

        response = self.client.post('/api/responses/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(QuestionnaireResponse.objects.count(), 1)
        self.assertEqual(Answer.objects.count(), 2)
        self.assertEqual(StatusHistory.objects.count(), 1)  # Historique initial

    def test_analyste_cannot_create_response(self):
        """Test qu'un analyste ne peut pas créer de réponse"""
        self.client.force_authenticate(user=self.analyste)

        data = {
            'questionnaire_id': self.questionnaire.id
        }

        response = self.client.post('/api/responses/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_chef_projet_cannot_create_duplicate_response(self):
        """Test qu'un chef de projet ne peut pas répondre deux fois au même questionnaire"""
        QuestionnaireResponse.objects.create(
            questionnaire=self.questionnaire,
            responder=self.chef_projet,
            status=QuestionnaireResponse.Status.BROUILLON
        )

        self.client.force_authenticate(user=self.chef_projet)

        data = {
            'questionnaire_id': self.questionnaire.id
        }

        response = self.client.post('/api/responses/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_submit_response_workflow(self):
        """Test du workflow de soumission"""
        response_obj = QuestionnaireResponse.objects.create(
            questionnaire=self.questionnaire,
            responder=self.chef_projet,
            status=QuestionnaireResponse.Status.BROUILLON
        )
        # Ajouter les réponses obligatoires
        Answer.objects.create(
            response=response_obj,
            question=self.question1,
            answer_text='Réponse 1'
        )
        Answer.objects.create(
            response=response_obj,
            question=self.question2,
            answer_text='Réponse 2'
        )

        self.client.force_authenticate(user=self.chef_projet)

        response = self.client.post(f'/api/responses/{response_obj.id}/submit/', {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_obj.refresh_from_db()
        self.assertEqual(response_obj.status, QuestionnaireResponse.Status.SOUMIS)
        self.assertIsNotNone(response_obj.submitted_at)
        # Vérifier qu'une entrée d'historique a été créée
        self.assertEqual(StatusHistory.objects.filter(response=response_obj).count(), 2)

    def test_cannot_submit_without_required_answers(self):
        """Test qu'on ne peut pas soumettre sans répondre aux questions obligatoires"""
        response_obj = QuestionnaireResponse.objects.create(
            questionnaire=self.questionnaire,
            responder=self.chef_projet,
            status=QuestionnaireResponse.Status.BROUILLON
        )
        # Ne pas ajouter de réponses

        self.client.force_authenticate(user=self.chef_projet)

        response = self.client.post(f'/api/responses/{response_obj.id}/submit/', {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_chef_projet_sees_own_responses_only(self):
        """Test qu'un chef de projet voit seulement ses propres réponses"""
        chef2 = User.objects.create_user(
            username='chef2',
            email='chef2@example.com',
            password='TestPass123!',
            role=User.Role.CHEF_PROJET
        )

        # Créer des réponses pour différents utilisateurs
        QuestionnaireResponse.objects.create(
            questionnaire=self.questionnaire,
            responder=self.chef_projet,
            status=QuestionnaireResponse.Status.BROUILLON
        )
        QuestionnaireResponse.objects.create(
            questionnaire=self.questionnaire,
            responder=chef2,
            status=QuestionnaireResponse.Status.SOUMIS
        )

        self.client.force_authenticate(user=self.chef_projet)
        response = self.client.get('/api/responses/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_analyste_sees_submitted_responses_only(self):
        """Test qu'un analyste voit les réponses soumises (pas les brouillons)"""
        QuestionnaireResponse.objects.create(
            questionnaire=self.questionnaire,
            responder=self.chef_projet,
            status=QuestionnaireResponse.Status.BROUILLON
        )
        QuestionnaireResponse.objects.create(
            questionnaire=self.questionnaire,
            responder=self.chef_projet,
            status=QuestionnaireResponse.Status.SOUMIS
        )

        # Créer un deuxième questionnaire pour la deuxième réponse
        q2 = Questionnaire.objects.create(
            title='Q2',
            created_by=self.analyste,
            is_active=True
        )
        chef2 = User.objects.create_user(
            username='chef2',
            email='chef2@example.com',
            password='TestPass123!',
            role=User.Role.CHEF_PROJET
        )
        QuestionnaireResponse.objects.create(
            questionnaire=q2,
            responder=chef2,
            status=QuestionnaireResponse.Status.VALIDE
        )

        self.client.force_authenticate(user=self.analyste)
        response = self.client.get('/api/responses/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # SOUMIS et VALIDE, pas BROUILLON

    def test_business_owner_sees_validated_rejected_only(self):
        """Test qu'un business owner voit seulement les réponses validées/rejetées"""
        # Créer des questionnaires pour différentes réponses
        q2 = Questionnaire.objects.create(title='Q2', created_by=self.analyste)
        q3 = Questionnaire.objects.create(title='Q3', created_by=self.analyste)

        QuestionnaireResponse.objects.create(
            questionnaire=self.questionnaire,
            responder=self.chef_projet,
            status=QuestionnaireResponse.Status.SOUMIS
        )
        chef2 = User.objects.create_user(
            username='chef2',
            email='chef2@example.com',
            password='TestPass123!',
            role=User.Role.CHEF_PROJET
        )
        QuestionnaireResponse.objects.create(
            questionnaire=q2,
            responder=chef2,
            status=QuestionnaireResponse.Status.VALIDE
        )
        chef3 = User.objects.create_user(
            username='chef3',
            email='chef3@example.com',
            password='TestPass123!',
            role=User.Role.CHEF_PROJET
        )
        QuestionnaireResponse.objects.create(
            questionnaire=q3,
            responder=chef3,
            status=QuestionnaireResponse.Status.REJETE
        )

        self.client.force_authenticate(user=self.business_owner)
        response = self.client.get('/api/responses/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # VALIDE et REJETE


class StatusChangeTest(APITestCase):
    """Tests pour le changement de statut par l'analyste"""

    def setUp(self):
        self.client = APIClient()

        self.analyste = User.objects.create_user(
            username='analyste',
            email='analyste@example.com',
            password='TestPass123!',
            role=User.Role.ANALYSTE
        )
        self.chef_projet = User.objects.create_user(
            username='chef',
            email='chef@example.com',
            password='TestPass123!',
            role=User.Role.CHEF_PROJET
        )

        self.questionnaire = Questionnaire.objects.create(
            title='Template Test',
            created_by=self.analyste
        )
        self.response_obj = QuestionnaireResponse.objects.create(
            questionnaire=self.questionnaire,
            responder=self.chef_projet,
            status=QuestionnaireResponse.Status.SOUMIS
        )

    def test_analyste_can_change_status(self):
        """Test qu'un analyste peut changer le statut"""
        self.client.force_authenticate(user=self.analyste)

        data = {
            'new_status': QuestionnaireResponse.Status.EN_ATTENTE,
            'comment': 'Passage en revue'
        }

        response = self.client.post(
            f'/api/responses/{self.response_obj.id}/change_status/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.response_obj.refresh_from_db()
        self.assertEqual(self.response_obj.status, QuestionnaireResponse.Status.EN_ATTENTE)

        # Vérifier l'historique
        history = StatusHistory.objects.filter(response=self.response_obj).latest('changed_at')
        self.assertEqual(history.new_status, QuestionnaireResponse.Status.EN_ATTENTE)
        self.assertEqual(history.comment, 'Passage en revue')

    def test_chef_projet_cannot_change_status(self):
        """Test qu'un chef de projet ne peut pas changer le statut"""
        self.client.force_authenticate(user=self.chef_projet)

        data = {
            'new_status': QuestionnaireResponse.Status.EN_ATTENTE
        }

        response = self.client.post(
            f'/api/responses/{self.response_obj.id}/change_status/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_status_transition(self):
        """Test qu'une transition invalide est rejetée"""
        self.client.force_authenticate(user=self.analyste)

        # Essayer de passer directement de SOUMIS à VALIDE (invalide)
        data = {
            'new_status': QuestionnaireResponse.Status.VALIDE
        }

        response = self.client.post(
            f'/api/responses/{self.response_obj.id}/change_status/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_valid_status_workflow(self):
        """Test du workflow complet de validation"""
        self.client.force_authenticate(user=self.analyste)

        # SOUMIS -> EN_ATTENTE
        response = self.client.post(
            f'/api/responses/{self.response_obj.id}/change_status/',
            {'new_status': QuestionnaireResponse.Status.EN_ATTENTE},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # EN_ATTENTE -> EN_VALIDATION
        response = self.client.post(
            f'/api/responses/{self.response_obj.id}/change_status/',
            {'new_status': QuestionnaireResponse.Status.EN_VALIDATION},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # EN_VALIDATION -> VALIDE
        response = self.client.post(
            f'/api/responses/{self.response_obj.id}/change_status/',
            {'new_status': QuestionnaireResponse.Status.VALIDE, 'comment': 'Approuvé'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.response_obj.refresh_from_db()
        self.assertEqual(self.response_obj.status, QuestionnaireResponse.Status.VALIDE)


class CommentAPITest(APITestCase):
    """Tests pour les commentaires"""

    def setUp(self):
        self.client = APIClient()

        self.analyste = User.objects.create_user(
            username='analyste',
            email='analyste@example.com',
            password='TestPass123!',
            role=User.Role.ANALYSTE
        )
        self.chef_projet = User.objects.create_user(
            username='chef',
            email='chef@example.com',
            password='TestPass123!',
            role=User.Role.CHEF_PROJET
        )
        self.business_owner = User.objects.create_user(
            username='owner',
            email='owner@example.com',
            password='TestPass123!',
            role=User.Role.BUSINESS_OWNER
        )

        self.questionnaire = Questionnaire.objects.create(
            title='Template Test',
            created_by=self.analyste
        )
        self.response_obj = QuestionnaireResponse.objects.create(
            questionnaire=self.questionnaire,
            responder=self.chef_projet,
            status=QuestionnaireResponse.Status.SOUMIS
        )

    def test_all_roles_can_comment(self):
        """Test que tous les rôles peuvent commenter"""
        # Analyste
        self.client.force_authenticate(user=self.analyste)
        response = self.client.post(
            f'/api/responses/{self.response_obj.id}/comments/',
            {'content': 'Commentaire analyste'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Chef de projet
        self.client.force_authenticate(user=self.chef_projet)
        response = self.client.post(
            f'/api/responses/{self.response_obj.id}/comments/',
            {'content': 'Commentaire chef'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Changer le statut pour que le business owner puisse voir
        self.response_obj.status = QuestionnaireResponse.Status.VALIDE
        self.response_obj.save()

        # Business owner
        self.client.force_authenticate(user=self.business_owner)
        response = self.client.post(
            f'/api/responses/{self.response_obj.id}/comments/',
            {'content': 'Commentaire owner'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Comment.objects.count(), 3)

    def test_business_owner_cannot_comment_on_non_validated(self):
        """Test qu'un business owner ne peut pas commenter une réponse non validée"""
        self.client.force_authenticate(user=self.business_owner)

        response = self.client.post(
            f'/api/responses/{self.response_obj.id}/comments/',
            {'content': 'Commentaire'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class FileUploadTest(APITestCase):
    """Tests pour l'upload de fichiers"""

    def setUp(self):
        self.client = APIClient()

        self.analyste = User.objects.create_user(
            username='analyste',
            email='analyste@example.com',
            password='TestPass123!',
            role=User.Role.ANALYSTE
        )
        self.chef_projet = User.objects.create_user(
            username='chef',
            email='chef@example.com',
            password='TestPass123!',
            role=User.Role.CHEF_PROJET
        )

        self.questionnaire = Questionnaire.objects.create(
            title='Template Test',
            created_by=self.analyste
        )

    def test_analyste_can_upload_questionnaire_document(self):
        """Test qu'un analyste peut uploader un document pour son template"""
        self.client.force_authenticate(user=self.analyste)

        file = SimpleUploadedFile("document.pdf", b"file_content", content_type="application/pdf")

        response = self.client.post(
            f'/api/questionnaires/{self.questionnaire.id}/documents/',
            {'file': file, 'filename': 'document.pdf'},
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(QuestionnaireDocument.objects.count(), 1)

    def test_chef_projet_can_upload_response_document(self):
        """Test qu'un chef de projet peut uploader un document d'architecture"""
        response_obj = QuestionnaireResponse.objects.create(
            questionnaire=self.questionnaire,
            responder=self.chef_projet,
            status=QuestionnaireResponse.Status.BROUILLON
        )

        self.client.force_authenticate(user=self.chef_projet)

        file = SimpleUploadedFile("architecture.pdf", b"file_content", content_type="application/pdf")

        response = self.client.post(
            f'/api/responses/{response_obj.id}/documents/',
            {'file': file, 'filename': 'architecture.pdf'},
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ResponseDocument.objects.count(), 1)
