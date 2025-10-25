from django.urls import path
from .views import QuestionnaireListCreateView, QuestionnaireDetailView

app_name = 'questionnaires'

urlpatterns = [
    # Liste et création de questionnaires
    path('', QuestionnaireListCreateView.as_view(), name='questionnaire-list-create'),

    # Détail, mise à jour et suppression d'un questionnaire
    path('<int:pk>/', QuestionnaireDetailView.as_view(), name='questionnaire-detail'),
]
