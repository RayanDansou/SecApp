from rest_framework import serializers
from .models import Questionnaire
from users.serializers import UserSerializer


class QuestionnaireSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle Questionnaire
    Inclut les informations du propriétaire
    """
    owner = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Questionnaire
        fields = (
            'id',
            'title',
            'status',
            'status_display',
            'owner',
            'created_at',
            'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'owner')


class QuestionnaireCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour la création d'un questionnaire
    """

    class Meta:
        model = Questionnaire
        fields = ('title', 'status')

    def validate_title(self, value):
        """
        Validation du titre
        """
        if not value.strip():
            raise serializers.ValidationError("Le titre ne peut pas être vide")
        if len(value) < 3:
            raise serializers.ValidationError("Le titre doit contenir au moins 3 caractères")
        return value


class QuestionnaireUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour la mise à jour d'un questionnaire
    """

    class Meta:
        model = Questionnaire
        fields = ('title', 'status')

    def validate_title(self, value):
        """
        Validation du titre
        """
        if not value.strip():
            raise serializers.ValidationError("Le titre ne peut pas être vide")
        if len(value) < 3:
            raise serializers.ValidationError("Le titre doit contenir au moins 3 caractères")
        return value
