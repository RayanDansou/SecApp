from rest_framework import serializers
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
from users.serializers import UserSerializer


# ===========================
# Questionnaire Template Serializers (ANALYSTE)
# ===========================

class QuestionSerializer(serializers.ModelSerializer):
    """
    Serializer pour les questions du questionnaire template
    """
    class Meta:
        model = Question
        fields = ('id', 'text', 'order', 'is_required', 'created_at')
        read_only_fields = ('id', 'created_at')


class QuestionnaireDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer pour les documents du questionnaire template
    """
    class Meta:
        model = QuestionnaireDocument
        fields = ('id', 'file', 'filename', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')


class QuestionnaireListSerializer(serializers.ModelSerializer):
    """
    Serializer pour la liste des questionnaires (templates)
    Vue simplifiée pour l'affichage en liste
    """
    created_by = UserSerializer(read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Questionnaire
        fields = (
            'id',
            'title',
            'description',
            'created_by',
            'is_active',
            'created_at',
            'updated_at',
            'question_count'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'created_by')

    def get_question_count(self, obj):
        """Retourne le nombre de questions"""
        return obj.questions.count()


class QuestionnaireDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour un questionnaire (template)
    Inclut les questions et documents associés
    """
    created_by = UserSerializer(read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    documents = QuestionnaireDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Questionnaire
        fields = (
            'id',
            'title',
            'description',
            'created_by',
            'is_active',
            'created_at',
            'updated_at',
            'questions',
            'documents'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'created_by')


class QuestionnaireCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour la création d'un questionnaire template par l'ANALYSTE
    Peut inclure des questions lors de la création
    """
    questions = QuestionSerializer(many=True, required=False)

    class Meta:
        model = Questionnaire
        fields = ('title', 'description', 'is_active', 'questions')

    def validate_title(self, value):
        """Validation du titre"""
        if not value.strip():
            raise serializers.ValidationError("Le titre ne peut pas être vide")
        if len(value) < 3:
            raise serializers.ValidationError("Le titre doit contenir au moins 3 caractères")
        return value

    def create(self, validated_data):
        """Création du questionnaire avec questions si fournies"""
        questions_data = validated_data.pop('questions', [])
        questionnaire = Questionnaire.objects.create(**validated_data)

        # Créer les questions
        for question_data in questions_data:
            Question.objects.create(questionnaire=questionnaire, **question_data)

        return questionnaire


class QuestionnaireUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour la mise à jour d'un questionnaire template
    """
    class Meta:
        model = Questionnaire
        fields = ('title', 'description', 'is_active')

    def validate_title(self, value):
        """Validation du titre"""
        if not value.strip():
            raise serializers.ValidationError("Le titre ne peut pas être vide")
        if len(value) < 3:
            raise serializers.ValidationError("Le titre doit contenir au moins 3 caractères")
        return value


# ===========================
# Questionnaire Response Serializers (CHEF_PROJET)
# ===========================

class AnswerSerializer(serializers.ModelSerializer):
    """
    Serializer pour les réponses aux questions
    """
    question = QuestionSerializer(read_only=True)
    question_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Answer
        fields = ('id', 'question', 'question_id', 'answer_text', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class ResponseDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer pour les documents d'architecture uploadés par le CHEF_PROJET
    """
    class Meta:
        model = ResponseDocument
        fields = ('id', 'file', 'filename', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer pour les commentaires/recommandations
    """
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'author', 'content', 'created_at')
        read_only_fields = ('id', 'author', 'created_at')


class StatusHistorySerializer(serializers.ModelSerializer):
    """
    Serializer pour l'historique des changements de statut
    """
    changed_by = UserSerializer(read_only=True)
    old_status_display = serializers.CharField(source='get_old_status_display', read_only=True)
    new_status_display = serializers.CharField(source='get_new_status_display', read_only=True)

    class Meta:
        model = StatusHistory
        fields = (
            'id',
            'old_status',
            'old_status_display',
            'new_status',
            'new_status_display',
            'changed_by',
            'comment',
            'changed_at'
        )
        read_only_fields = ('id', 'changed_at', 'changed_by')


class QuestionnaireResponseListSerializer(serializers.ModelSerializer):
    """
    Serializer pour la liste des réponses aux questionnaires
    Vue simplifiée pour l'affichage en liste
    """
    questionnaire = QuestionnaireListSerializer(read_only=True)
    responder = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = QuestionnaireResponse
        fields = (
            'id',
            'questionnaire',
            'responder',
            'status',
            'status_display',
            'submitted_at',
            'created_at',
            'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'responder', 'submitted_at')


class QuestionnaireResponseDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour une réponse au questionnaire
    Inclut toutes les données: questionnaire, réponses, documents, commentaires, historique
    """
    questionnaire = QuestionnaireDetailSerializer(read_only=True)
    responder = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    documents = ResponseDocumentSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    status_history = StatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = QuestionnaireResponse
        fields = (
            'id',
            'questionnaire',
            'responder',
            'status',
            'status_display',
            'submitted_at',
            'created_at',
            'updated_at',
            'answers',
            'documents',
            'comments',
            'status_history'
        )
        read_only_fields = (
            'id',
            'created_at',
            'updated_at',
            'responder',
            'submitted_at',
            'status_history'
        )


class QuestionnaireResponseCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour la création d'une réponse au questionnaire par le CHEF_PROJET
    """
    questionnaire_id = serializers.IntegerField(write_only=True)
    answers = AnswerSerializer(many=True, required=False)

    class Meta:
        model = QuestionnaireResponse
        fields = ('questionnaire_id', 'answers')

    def validate_questionnaire_id(self, value):
        """Vérifie que le questionnaire existe et est actif"""
        try:
            questionnaire = Questionnaire.objects.get(id=value)
            if not questionnaire.is_active:
                raise serializers.ValidationError("Ce questionnaire n'est plus actif")
        except Questionnaire.DoesNotExist:
            raise serializers.ValidationError("Ce questionnaire n'existe pas")
        return value

    def validate(self, data):
        """Vérifie que l'utilisateur n'a pas déjà répondu à ce questionnaire"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            questionnaire_id = data.get('questionnaire_id')
            if QuestionnaireResponse.objects.filter(
                questionnaire_id=questionnaire_id,
                responder=request.user
            ).exists():
                raise serializers.ValidationError(
                    "Vous avez déjà répondu à ce questionnaire"
                )
        return data

    def create(self, validated_data):
        """Création de la réponse avec les answers si fournis"""
        answers_data = validated_data.pop('answers', [])
        questionnaire_id = validated_data.pop('questionnaire_id')

        # Créer la réponse
        response = QuestionnaireResponse.objects.create(
            questionnaire_id=questionnaire_id,
            **validated_data
        )

        # Créer les réponses
        for answer_data in answers_data:
            Answer.objects.create(response=response, **answer_data)

        # Créer l'historique initial
        StatusHistory.objects.create(
            response=response,
            old_status=None,
            new_status=response.status,
            changed_by=response.responder,
            comment="Création du questionnaire"
        )

        return response


class QuestionnaireResponseUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour la mise à jour d'une réponse au questionnaire
    Permet de modifier les réponses tant que le statut est BROUILLON
    """
    answers = AnswerSerializer(many=True, required=False)

    class Meta:
        model = QuestionnaireResponse
        fields = ('answers',)

    def validate(self, data):
        """Vérifie que la réponse est en brouillon"""
        if self.instance and self.instance.status != QuestionnaireResponse.Status.BROUILLON:
            raise serializers.ValidationError(
                "Les réponses ne peuvent être modifiées qu'en mode brouillon"
            )
        return data

    def update(self, instance, validated_data):
        """Mise à jour des réponses"""
        answers_data = validated_data.pop('answers', [])

        # Mettre à jour ou créer les réponses
        for answer_data in answers_data:
            question_id = answer_data.pop('question_id')
            Answer.objects.update_or_create(
                response=instance,
                question_id=question_id,
                defaults=answer_data
            )

        instance.save()
        return instance


class QuestionnaireResponseSubmitSerializer(serializers.Serializer):
    """
    Serializer pour la soumission d'une réponse au questionnaire
    Change le statut de BROUILLON à SOUMIS
    """
    def validate(self, data):
        """Vérifie que toutes les questions obligatoires ont une réponse"""
        response = self.instance

        if response.status != QuestionnaireResponse.Status.BROUILLON:
            raise serializers.ValidationError(
                "Seuls les questionnaires en brouillon peuvent être soumis"
            )

        # Vérifier que toutes les questions obligatoires ont une réponse
        required_questions = response.questionnaire.questions.filter(is_required=True)
        answered_questions = response.answers.values_list('question_id', flat=True)

        missing_questions = required_questions.exclude(id__in=answered_questions)
        if missing_questions.exists():
            raise serializers.ValidationError(
                f"Toutes les questions obligatoires doivent avoir une réponse. "
                f"{missing_questions.count()} question(s) manquante(s)."
            )

        return data


class QuestionnaireResponseStatusChangeSerializer(serializers.Serializer):
    """
    Serializer pour le changement de statut par l'ANALYSTE
    """
    new_status = serializers.ChoiceField(choices=QuestionnaireResponse.Status.choices)
    comment = serializers.CharField(required=False, allow_blank=True)

    def validate_new_status(self, value):
        """Valide le changement de statut"""
        response = self.instance
        current_status = response.status

        # Définir les transitions valides
        valid_transitions = {
            QuestionnaireResponse.Status.SOUMIS: [
                QuestionnaireResponse.Status.EN_ATTENTE,
                QuestionnaireResponse.Status.REJETE
            ],
            QuestionnaireResponse.Status.EN_ATTENTE: [
                QuestionnaireResponse.Status.EN_VALIDATION,
                QuestionnaireResponse.Status.REJETE
            ],
            QuestionnaireResponse.Status.EN_VALIDATION: [
                QuestionnaireResponse.Status.VALIDE,
                QuestionnaireResponse.Status.REJETE
            ],
        }

        if current_status in valid_transitions:
            if value not in valid_transitions[current_status]:
                raise serializers.ValidationError(
                    f"Transition de {current_status} vers {value} non autorisée"
                )
        else:
            raise serializers.ValidationError(
                f"Aucune transition possible depuis le statut {current_status}"
            )

        return value
