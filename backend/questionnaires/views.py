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
    AIAnalysis,
    Notification
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
    NotificationSerializer,
)
from .ai_service import AIAnalysisService, extract_document_content
from .export_service import ReportExportService
from django.http import FileResponse


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

        # L'analyste peut voir les réponses soumises uniquement pour les questionnaires qu'il a créés
        if user.role == 'ANALYSTE' and obj.status != QuestionnaireResponse.Status.BROUILLON:
            # Vérifier que l'analyste a créé le questionnaire template
            return obj.questionnaire.created_by == user

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
        """Retourne les questionnaires actifs pour tous, uniquement les questionnaires créés par l'analyste pour ANALYSTE"""
        if self.request.user.role == 'ANALYSTE':
            # L'analyste ne voit que les questionnaires qu'il a créés
            return Questionnaire.objects.filter(created_by=self.request.user).order_by('-created_at')
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
# Export Mixin (à définir AVANT son utilisation)
# ===========================

class QuestionnaireResponseExportMixin:
    """
    Mixin pour ajouter les fonctionnalités d'export PDF/Word
    aux réponses de questionnaires validés/rejetés.
    """

    @action(detail=True, methods=['get'], url_path='export/pdf')
    def export_pdf(self, request, pk=None):
        """
        Exporte le rapport d'analyse en PDF.
        GET /api/responses/{id}/export/pdf/

        Accessible aux:
        - Chef de projet (propriétaire)
        - Analyste
        - Business Owner
        """
        response_obj = self.get_object()

        # Vérifier que le questionnaire est validé ou rejeté
        if response_obj.status not in ['VALIDE', 'REJETE']:
            return Response(
                {'error': 'Le rapport ne peut être exporté que pour les questionnaires validés ou rejetés.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier les permissions
        if not self._can_export(request.user, response_obj):
            raise PermissionDenied("Vous n'avez pas la permission d'exporter ce rapport.")

        try:
            # Générer le PDF
            export_service = ReportExportService(response_obj.id)
            pdf_file = export_service.generate_pdf()
            filename = export_service.get_filename('pdf')

            # Retourner le fichier
            response = FileResponse(
                pdf_file,
                content_type='application/pdf',
                as_attachment=True,
                filename=filename
            )

            return response

        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la génération du PDF: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], url_path='export/docx')
    def export_docx(self, request, pk=None):
        """
        Exporte le rapport d'analyse en Word (DOCX).
        GET /api/responses/{id}/export/docx/

        Accessible aux:
        - Chef de projet (propriétaire)
        - Analyste
        - Business Owner
        """
        response_obj = self.get_object()

        # Vérifier que le questionnaire est validé ou rejeté
        if response_obj.status not in ['VALIDE', 'REJETE']:
            return Response(
                {'error': 'Le rapport ne peut être exporté que pour les questionnaires validés ou rejetés.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier les permissions
        if not self._can_export(request.user, response_obj):
            raise PermissionDenied("Vous n'avez pas la permission d'exporter ce rapport.")

        try:
            # Générer le DOCX
            export_service = ReportExportService(response_obj.id)
            docx_file = export_service.generate_docx()
            filename = export_service.get_filename('docx')

            # Retourner le fichier
            response = FileResponse(
                docx_file,
                content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                as_attachment=True,
                filename=filename
            )

            return response

        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la génération du Word: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _can_export(self, user, response_obj):
        """
        Vérifie si l'utilisateur peut exporter ce rapport.

        Returns:
            bool: True si l'utilisateur peut exporter
        """
        # Chef de projet (propriétaire)
        if user == response_obj.responder:
            return True

        # Analyste ou Business Owner
        if user.role in ['ANALYSTE', 'BUSINESS_OWNER']:
            return True

        # Admin
        if user.is_staff or user.is_superuser:
            return True

        return False


# ===========================
# Questionnaire Response ViewSets (CHEF_PROJET)
# ===========================

class QuestionnaireResponseViewSet(QuestionnaireResponseExportMixin, viewsets.ModelViewSet):
    """
    ViewSet pour les réponses aux questionnaires

    Permissions:
    - list: utilisateur voit ses propres réponses, ANALYSTE voit les soumises, BUSINESS_OWNER voit validées/rejetées
    - retrieve: selon CanViewResponse
    - create: CHEF_PROJET uniquement
    - update: propriétaire uniquement, et seulement en BROUILLON
    - destroy: propriétaire uniquement, et seulement en BROUILLON

    Actions supplémentaires:
    - export_pdf: Exporte le rapport en PDF (VALIDE/REJETE uniquement)
    - export_docx: Exporte le rapport en Word (VALIDE/REJETE uniquement)
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
            # L'analyste voit uniquement les réponses aux questionnaires qu'il a créés (pas les brouillons)
            return QuestionnaireResponse.objects.filter(
                questionnaire__created_by=user
            ).exclude(
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

    def create(self, request, *_args, **_kwargs):
        """Surcharge pour retourner le détail complet après création"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Utiliser le DetailSerializer pour la réponse
        response_instance = serializer.instance
        detail_serializer = QuestionnaireResponseDetailSerializer(
            response_instance,
            context={'request': request}
        )
        headers = self.get_success_headers(detail_serializer.data)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

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


# ===========================
# Notification ViewSet
# ===========================

class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les notifications de l'utilisateur

    Permissions:
    - list: utilisateur voit ses propres notifications
    - retrieve: utilisateur voit uniquement ses propres notifications
    - update/partial_update: utilisateur peut marquer ses notifications comme lues
    - destroy: utilisateur peut supprimer ses propres notifications
    - create: non autorisé (les notifications sont créées automatiquement via signals)
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']  # Pas de POST/PUT

    def get_queryset(self):
        """Retourne uniquement les notifications de l'utilisateur connecté"""
        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """
        Retourne le nombre de notifications non lues
        GET /api/notifications/unread_count/
        """
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """
        Marque toutes les notifications de l'utilisateur comme lues
        POST /api/notifications/mark_all_read/
        """
        updated = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)

        return Response(
            {'message': f'{updated} notification(s) marquée(s) comme lue(s)'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Marque une notification spécifique comme lue
        POST /api/notifications/{id}/mark_read/
        """
        notification = self.get_object()
        notification.is_read = True
        notification.save()

        return Response(
            NotificationSerializer(notification).data,
            status=status.HTTP_200_OK
        )
