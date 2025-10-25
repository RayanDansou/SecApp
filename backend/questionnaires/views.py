from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Questionnaire
from .serializers import (
    QuestionnaireSerializer,
    QuestionnaireCreateSerializer,
    QuestionnaireUpdateSerializer
)


class IsOwnerPermission(permissions.BasePermission):
    """
    Permission personnalisée : seul le propriétaire peut accéder au questionnaire
    """

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class QuestionnaireListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des questionnaires
    GET /api/questionnaires/ - Liste des questionnaires de l'utilisateur connecté
    POST /api/questionnaires/ - Créer un nouveau questionnaire
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Retourne uniquement les questionnaires de l'utilisateur connecté
        """
        return Questionnaire.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        """
        Utilise différents serializers selon la méthode
        """
        if self.request.method == 'POST':
            return QuestionnaireCreateSerializer
        return QuestionnaireSerializer

    def perform_create(self, serializer):
        """
        Associe automatiquement le questionnaire à l'utilisateur connecté
        """
        serializer.save(owner=self.request.user)


class QuestionnaireDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, mettre à jour ou supprimer un questionnaire
    GET /api/questionnaires/{id}/ - Détails d'un questionnaire
    PUT/PATCH /api/questionnaires/{id}/ - Mettre à jour un questionnaire
    DELETE /api/questionnaires/{id}/ - Supprimer un questionnaire
    """
    permission_classes = [permissions.IsAuthenticated, IsOwnerPermission]
    queryset = Questionnaire.objects.all()

    def get_serializer_class(self):
        """
        Utilise différents serializers selon la méthode
        """
        if self.request.method in ['PUT', 'PATCH']:
            return QuestionnaireUpdateSerializer
        return QuestionnaireSerializer

    def get_object(self):
        """
        Récupère le questionnaire et vérifie les permissions
        """
        obj = super().get_object()

        # Vérifier que l'utilisateur est bien le propriétaire
        if obj.owner != self.request.user:
            raise PermissionDenied("Vous n'avez pas la permission d'accéder à ce questionnaire.")

        return obj
