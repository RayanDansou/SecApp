from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuestionnaireViewSet,
    QuestionViewSet,
    QuestionnaireDocumentViewSet,
    QuestionnaireResponseViewSet,
    AnswerViewSet,
    ResponseDocumentViewSet,
    CommentViewSet,
    StatusHistoryViewSet,
    NotificationViewSet,
)

app_name = 'questionnaires'

# Router principal pour les ressources de niveau supérieur
router = DefaultRouter()
router.register(r'questionnaires', QuestionnaireViewSet, basename='questionnaire')
router.register(r'responses', QuestionnaireResponseViewSet, basename='response')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    # Routes principales (questionnaires et responses)
    path('', include(router.urls)),

    # Routes imbriquées pour les questionnaires (templates)
    # Questions d'un questionnaire
    path(
        'questionnaires/<int:questionnaire_pk>/questions/',
        QuestionViewSet.as_view({
            'get': 'list',
            'post': 'create'
        }),
        name='questionnaire-question-list'
    ),
    path(
        'questionnaires/<int:questionnaire_pk>/questions/<int:pk>/',
        QuestionViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        }),
        name='questionnaire-question-detail'
    ),

    # Documents d'un questionnaire
    path(
        'questionnaires/<int:questionnaire_pk>/documents/',
        QuestionnaireDocumentViewSet.as_view({
            'get': 'list',
            'post': 'create'
        }),
        name='questionnaire-document-list'
    ),
    path(
        'questionnaires/<int:questionnaire_pk>/documents/<int:pk>/',
        QuestionnaireDocumentViewSet.as_view({
            'get': 'retrieve',
            'delete': 'destroy'
        }),
        name='questionnaire-document-detail'
    ),

    # Routes imbriquées pour les réponses
    # Réponses (answers) d'une réponse au questionnaire
    path(
        'responses/<int:response_pk>/answers/',
        AnswerViewSet.as_view({
            'get': 'list',
            'post': 'create'
        }),
        name='response-answer-list'
    ),
    path(
        'responses/<int:response_pk>/answers/<int:pk>/',
        AnswerViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        }),
        name='response-answer-detail'
    ),

    # Documents d'architecture d'une réponse
    path(
        'responses/<int:response_pk>/documents/',
        ResponseDocumentViewSet.as_view({
            'get': 'list',
            'post': 'create'
        }),
        name='response-document-list'
    ),
    path(
        'responses/<int:response_pk>/documents/<int:pk>/',
        ResponseDocumentViewSet.as_view({
            'get': 'retrieve',
            'delete': 'destroy'
        }),
        name='response-document-detail'
    ),

    # Commentaires sur une réponse
    path(
        'responses/<int:response_pk>/comments/',
        CommentViewSet.as_view({
            'get': 'list',
            'post': 'create'
        }),
        name='response-comment-list'
    ),
    path(
        'responses/<int:response_pk>/comments/<int:pk>/',
        CommentViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        }),
        name='response-comment-detail'
    ),

    # Historique des statuts d'une réponse (read-only)
    path(
        'responses/<int:response_pk>/history/',
        StatusHistoryViewSet.as_view({
            'get': 'list'
        }),
        name='response-history-list'
    ),
    path(
        'responses/<int:response_pk>/history/<int:pk>/',
        StatusHistoryViewSet.as_view({
            'get': 'retrieve'
        }),
        name='response-history-detail'
    ),
]
