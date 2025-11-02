from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser


from .models import (
    Questionnaire,
    Question,
    QuestionnaireDocument,
    QuestionnaireResponse,
    Answer,
    ResponseDocument,
    Comment,
    StatusHistory,
    AIAnalysis
)
from .serializers import (
    QuestionnaireListSerializer,
    QuestionnaireDetailSerializer,
    QuestionnaireCreateSerializer,
    QuestionnaireUpdateSerializer,
    QuestionSerializer,
    QuestionnaireDocumentSerializer,
    QuestionnaireResponseListSerializer,
    QuestionnaireResponseDetailSerializer,
    QuestionnaireResponseCreateSerializer,
    QuestionnaireResponseUpdateSerializer,
    QuestionnaireResponseSubmitSerializer,
    QuestionnaireResponseStatusChangeSerializer,
    AnswerSerializer,
    ResponseDocumentSerializer,
    CommentSerializer,
    StatusHistorySerializer,
    AIAnalysisSerializer,
)
from .ai_service import AIAnalysisService, extract_document_content


# ===========================
# Custom Permissions
# ===========================

class IsAnalyste(permissions.BasePermission):
    """Permission: seuls les ANALYSTE peuvent accéder"""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ANALYSTE'


class IsChefProjet(permissions.BasePermission):
    """Permission: seuls les CHEF_PROJET peuvent accéder"""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'CHEF_PROJET'


class IsQuestionnaireOwner(permissions.BasePermission):
    """Permission: seul le créateur du questionnaire template peut le modifier"""

    def has_object_permission(self, request, view, obj):
        # Pour les objets Questionnaire
        if isinstance(obj, Questionnaire):
            return obj.created_by == request.user
        # Pour les objets liés (Question, QuestionnaireDocument)
        if hasattr(obj, 'questionnaire'):
            return obj.questionnaire.created_by == request.user
        return False


class IsResponseOwner(permissions.BasePermission):
    """Permission: seul le répondant peut modifier sa réponse"""

    def has_object_permission(self, request, view, obj):
        # Pour les objets QuestionnaireResponse
        if isinstance(obj, QuestionnaireResponse):
            return obj.responder == request.user
        # Pour les objets liés (Answer, ResponseDocument)
        if hasattr(obj, 'response'):
            return obj.response.responder == request.user
        return False


class CanViewResponse(permissions.BasePermission):
    """Permission: définit qui peut voir une réponse selon le rôle et le statut"""

    def has_object_permission(self, request, view, obj):
        if not isinstance(obj, QuestionnaireResponse):
            # Pour les objets liés, récupérer la réponse
            if hasattr(obj, 'response'):
                obj = obj.response
            else:
                return False

        user = request.user

        # Le répondant peut toujours voir sa propre réponse
        if obj.responder == user:
            return True

        # L'analyste peut voir les réponses soumises
        if user.role == 'ANALYSTE' and obj.status != QuestionnaireResponse.Status.BROUILLON:
            return True

        # Le business owner peut voir les réponses validées ou rejetées
        if user.role == 'BUSINESS_OWNER' and obj.status in [
            QuestionnaireResponse.Status.VALIDE,
            QuestionnaireResponse.Status.REJETE
        ]:
            return True

        return False


# ===========================
# Questionnaire Template ViewSets (ANALYSTE)
# ===========================

class QuestionnaireViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les questionnaires (templates)

    Permissions:
    - list, retrieve: tous les utilisateurs authentifiés (pour voir les templates disponibles)
    - create: ANALYSTE uniquement
    - update, destroy: ANALYSTE propriétaire uniquement
    """

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated(), IsAnalyste()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAnalyste(), IsQuestionnaireOwner()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        """Retourne les questionnaires actifs pour tous, tous les questionnaires pour ANALYSTE"""
        if self.request.user.role == 'ANALYSTE':
            return Questionnaire.objects.all().order_by('-created_at')
        return Questionnaire.objects.filter(is_active=True).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'list':
            return QuestionnaireListSerializer
        elif self.action == 'create':
            return QuestionnaireCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return QuestionnaireUpdateSerializer
        return QuestionnaireDetailSerializer

    def perform_create(self, serializer):
        """Associe le questionnaire à l'analyste connecté"""
        serializer.save(created_by=self.request.user)


class QuestionViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les questions d'un questionnaire template
    Accès: ANALYSTE propriétaire uniquement
    """
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAnalyste, IsQuestionnaireOwner]

    def get_queryset(self):
        questionnaire_id = self.kwargs.get('questionnaire_pk')
        return Question.objects.filter(questionnaire_id=questionnaire_id).order_by('order')

    def perform_create(self, serializer):
        questionnaire_id = self.kwargs.get('questionnaire_pk')
        questionnaire = get_object_or_404(Questionnaire, id=questionnaire_id)

        # Vérifier que l'utilisateur est le propriétaire
        if questionnaire.created_by != self.request.user:
            raise PermissionDenied("Vous n'êtes pas le propriétaire de ce questionnaire")

        serializer.save(questionnaire=questionnaire)


class QuestionnaireDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les documents d'un questionnaire template
    Accès: ANALYSTE propriétaire pour create/delete, tous pour list/retrieve
    """
    serializer_class = QuestionnaireDocumentSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [permissions.IsAuthenticated(), IsAnalyste(), IsQuestionnaireOwner()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        questionnaire_id = self.kwargs.get('questionnaire_pk')
        return QuestionnaireDocument.objects.filter(
            questionnaire_id=questionnaire_id
        ).order_by('-uploaded_at')

    def perform_create(self, serializer):
        questionnaire_id = self.kwargs.get('questionnaire_pk')
        questionnaire = get_object_or_404(Questionnaire, id=questionnaire_id)

        # Vérifier que l'utilisateur est le propriétaire
        if questionnaire.created_by != self.request.user:
            raise PermissionDenied("Vous n'êtes pas le propriétaire de ce questionnaire")

        # Extraire le nom du fichier
        file = self.request.FILES.get('file')
        filename = file.name if file else serializer.validated_data.get('filename', 'document')

        serializer.save(questionnaire=questionnaire, filename=filename)


# ===========================
# Questionnaire Response ViewSets (CHEF_PROJET)
# ===========================

class QuestionnaireResponseViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les réponses aux questionnaires

    Permissions:
    - list: utilisateur voit ses propres réponses, ANALYSTE voit les soumises, BUSINESS_OWNER voit validées/rejetées
    - retrieve: selon CanViewResponse
    - create: CHEF_PROJET uniquement
    - update: propriétaire uniquement, et seulement en BROUILLON
    - destroy: propriétaire uniquement, et seulement en BROUILLON
    """

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsChefProjet()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsResponseOwner()]
        elif self.action in ['submit']:
            return [permissions.IsAuthenticated(), IsResponseOwner()]
        elif self.action in ['change_status']:
            return [permissions.IsAuthenticated(), IsAnalyste()]
        return [permissions.IsAuthenticated(), CanViewResponse()]

    def get_queryset(self):
        """Filtre selon le rôle de l'utilisateur"""
        user = self.request.user

        if user.role == 'CHEF_PROJET':
            # Le chef de projet voit ses propres réponses
            return QuestionnaireResponse.objects.filter(responder=user).order_by('-created_at')

        elif user.role == 'ANALYSTE':
            # L'analyste voit toutes les réponses soumises (pas les brouillons)
            return QuestionnaireResponse.objects.exclude(
                status=QuestionnaireResponse.Status.BROUILLON
            ).order_by('-created_at')

        elif user.role == 'BUSINESS_OWNER':
            # Le business owner voit les réponses validées ou rejetées
            return QuestionnaireResponse.objects.filter(
                status__in=[
                    QuestionnaireResponse.Status.VALIDE,
                    QuestionnaireResponse.Status.REJETE
                ]
            ).order_by('-created_at')

        return QuestionnaireResponse.objects.none()

    def get_serializer_class(self):
        if self.action == 'list':
            return QuestionnaireResponseListSerializer
        elif self.action == 'create':
            return QuestionnaireResponseCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return QuestionnaireResponseUpdateSerializer
        elif self.action == 'submit':
            return QuestionnaireResponseSubmitSerializer
        elif self.action == 'change_status':
            return QuestionnaireResponseStatusChangeSerializer
        return QuestionnaireResponseDetailSerializer

    def perform_create(self, serializer):
        """Associe la réponse au chef de projet connecté"""
        serializer.save(responder=self.request.user)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        Soumet le questionnaire (change le statut de BROUILLON à SOUMIS)
        Accessible uniquement au propriétaire
        """
        response = self.get_object()

        # Vérifier que c'est bien le propriétaire
        if response.responder != request.user:
            raise PermissionDenied("Vous n'êtes pas le propriétaire de cette réponse")

        # Valider avec le serializer
        serializer = self.get_serializer(response, data=request.data)
        serializer.is_valid(raise_exception=True)

        # Changer le statut
        old_status = response.status
        response.status = QuestionnaireResponse.Status.SOUMIS
        response.submitted_at = timezone.now()
        response.save()

        # Créer l'entrée dans l'historique
        StatusHistory.objects.create(
            response=response,
            old_status=old_status,
            new_status=response.status,
            changed_by=request.user,
            comment="Soumission du questionnaire"
        )

        # TODO: Envoyer notification à l'analyste (via Resend plus tard)

        return Response(
            QuestionnaireResponseDetailSerializer(response).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAnalyste])
    def change_status(self, request, pk=None):
        """
        Change le statut d'une réponse (accessible uniquement à l'ANALYSTE)
        Body: {"new_status": "EN_ATTENTE", "comment": "..."}
        """
        response = self.get_object()

        serializer = self.get_serializer(response, data=request.data)
        serializer.is_valid(raise_exception=True)

        # Changer le statut
        old_status = response.status
        new_status = serializer.validated_data['new_status']
        comment = serializer.validated_data.get('comment', '')

        response.status = new_status
        response.save()

        # Créer l'entrée dans l'historique
        StatusHistory.objects.create(
            response=response,
            old_status=old_status,
            new_status=new_status,
            changed_by=request.user,
            comment=comment
        )

        # TODO: Envoyer notification au chef de projet (via Resend plus tard)

        return Response(
            QuestionnaireResponseDetailSerializer(response).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAnalyste])
    def analyze_with_ai(self, request, pk=None):
        """
        Déclenche une analyse IA de la cohérence entre les réponses et les documents techniques
        Accessible uniquement à l'ANALYSTE

        Paramètres (optionnels dans le body):
            - language: 'fr' ou 'en' (défaut: 'fr')
        """
        response_obj = self.get_object()

        # Vérifier que le questionnaire a été soumis
        if response_obj.status == QuestionnaireResponse.Status.BROUILLON:
            return Response(
                {'error': 'Impossible d\'analyser un questionnaire en brouillon'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Récupérer la langue demandée (défaut: français)
            language = request.data.get('language', 'fr')
            if language not in ['fr', 'en']:
                language = 'fr'  # Fallback si langue invalide

            # Préparer les données du questionnaire
            questionnaire_data = {
                'title': response_obj.questionnaire.title,
                'description': response_obj.questionnaire.description
            }

            # Préparer les réponses
            answers = []
            for answer in response_obj.answers.all():
                answers.append({
                    'question_number': answer.question.order,
                    'question_text': answer.question.text,
                    'answer_text': answer.answer_text,
                    'is_required': answer.question.is_required
                })

            # Extraire le contenu des documents techniques (si disponibles)
            documents_content = []
            for doc in response_obj.documents.all():
                try:
                    content = extract_document_content(doc.file.path)
                    documents_content.append(content)
                except Exception as e:
                    # Si extraction échoue, continuer sans ce document
                    documents_content.append(f"[Erreur extraction: {doc.filename}]")

            # Initialiser le service IA
            ai_service = AIAnalysisService()

            # Lancer l'analyse avec la langue demandée
            analysis_result = ai_service.analyze_questionnaire_response(
                questionnaire_data=questionnaire_data,
                answers=answers,
                documents_content=documents_content if documents_content else None,
                language=language
            )

            # Vérifier s'il y a une erreur
            if 'error' in analysis_result and not analysis_result.get('coherence_score'):
                return Response(
                    {'error': analysis_result['error']},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Créer l'entrée AIAnalysis en base de données
            ai_analysis = AIAnalysis.objects.create(
                response=response_obj,
                analyst=request.user,
                coherence_score=analysis_result.get('coherence_score', 0),
                confidentiality_score=analysis_result.get('confidentiality_score', 0),
                integrity_score=analysis_result.get('integrity_score', 0),
                availability_score=analysis_result.get('availability_score', 0),
                analysis_summary=analysis_result.get('analysis_summary', ''),
                inconsistencies=analysis_result.get('inconsistencies', []),
                strengths=analysis_result.get('strengths', []),
                weaknesses=analysis_result.get('weaknesses', []),
                recommendations=analysis_result.get('recommendations', []),
                question_analysis=analysis_result.get('question_analysis', {}),
                model_used=analysis_result.get('model_used', 'gpt-4o-mini'),
                language=language,
                processing_time=analysis_result.get('processing_time', 0)
            )

            # Retourner le résultat sérialisé
            serializer = AIAnalysisSerializer(ai_analysis)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Erreur lors de l\'analyse IA: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def ai_analyses(self, request, pk=None):
        """
        Récupère toutes les analyses IA pour une réponse donnée
        Accessible selon les permissions de visualisation de la réponse
        """
        response_obj = self.get_object()

        # Récupérer toutes les analyses IA pour cette réponse
        analyses = AIAnalysis.objects.filter(response=response_obj).order_by('-created_at')

        serializer = AIAnalysisSerializer(analyses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AnswerViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les réponses aux questions
    Accès: propriétaire de la réponse uniquement, et seulement en BROUILLON pour modification
    """
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticated, IsResponseOwner]

    def get_queryset(self):
        response_id = self.kwargs.get('response_pk')
        return Answer.objects.filter(response_id=response_id).select_related('question')

    def perform_create(self, serializer):
        response_id = self.kwargs.get('response_pk')
        response = get_object_or_404(QuestionnaireResponse, id=response_id)

        # Vérifier que l'utilisateur est le propriétaire
        if response.responder != self.request.user:
            raise PermissionDenied("Vous n'êtes pas le propriétaire de cette réponse")

        # Vérifier que le statut est BROUILLON
        if response.status != QuestionnaireResponse.Status.BROUILLON:
            raise PermissionDenied("Les réponses ne peuvent être modifiées qu'en mode brouillon")

        serializer.save(response=response)

    def perform_update(self, serializer):
        # Vérifier que le statut est BROUILLON
        if serializer.instance.response.status != QuestionnaireResponse.Status.BROUILLON:
            raise PermissionDenied("Les réponses ne peuvent être modifiées qu'en mode brouillon")

        serializer.save()

    def perform_destroy(self, instance):
        # Vérifier que le statut est BROUILLON
        if instance.response.status != QuestionnaireResponse.Status.BROUILLON:
            raise PermissionDenied("Les réponses ne peuvent être supprimées qu'en mode brouillon")

        instance.delete()


class ResponseDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les documents d'architecture d'une réponse
    Accès: propriétaire pour create/delete, CanViewResponse pour list/retrieve
    """
    serializer_class = ResponseDocumentSerializer
    parser_classes = (MultiPartParser, FormParser) 

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [permissions.IsAuthenticated(), IsResponseOwner()]
        return [permissions.IsAuthenticated(), CanViewResponse()]

    def get_queryset(self):
        response_id = self.kwargs.get('response_pk')
        return ResponseDocument.objects.filter(
            response_id=response_id
        ).order_by('-uploaded_at')

    def perform_create(self, serializer):
        response_id = self.kwargs.get('response_pk')
        response = get_object_or_404(QuestionnaireResponse, id=response_id)

        # Vérifier que l'utilisateur est le propriétaire
        if response.responder != self.request.user:
            raise PermissionDenied("Vous n'êtes pas le propriétaire de cette réponse")

        # Extraire le nom du fichier
        file = self.request.FILES.get('file')
        filename = file.name if file else serializer.validated_data.get('filename', 'document')

        serializer.save(response=response, filename=filename)


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les commentaires sur une réponse
    Accès: tous les rôles peuvent créer des commentaires, CanViewResponse pour lire
    """
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), CanViewResponse()]

    def get_queryset(self):
        response_id = self.kwargs.get('response_pk')
        return Comment.objects.filter(response_id=response_id).order_by('created_at')

    def perform_create(self, serializer):
        response_id = self.kwargs.get('response_pk')
        response = get_object_or_404(QuestionnaireResponse, id=response_id)

        # Vérifier que l'utilisateur peut voir cette réponse
        perm = CanViewResponse()
        if not perm.has_object_permission(self.request, self, response):
            raise PermissionDenied("Vous n'avez pas accès à cette réponse")

        serializer.save(response=response, author=self.request.user)


class StatusHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet en lecture seule pour l'historique des statuts
    Accès: CanViewResponse
    """
    serializer_class = StatusHistorySerializer
    permission_classes = [permissions.IsAuthenticated, CanViewResponse]

    def get_queryset(self):
        response_id = self.kwargs.get('response_pk')
        return StatusHistory.objects.filter(
            response_id=response_id
        ).order_by('-changed_at')
