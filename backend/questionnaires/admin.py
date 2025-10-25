from django.contrib import admin
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


class QuestionInline(admin.TabularInline):
    """Inline pour les questions du questionnaire"""
    model = Question
    extra = 1
    fields = ('text', 'order', 'is_required')
    ordering = ['order']


class QuestionnaireDocumentInline(admin.TabularInline):
    """Inline pour les documents du questionnaire"""
    model = QuestionnaireDocument
    extra = 0
    fields = ('file', 'filename', 'uploaded_at')
    readonly_fields = ('uploaded_at',)


@admin.register(Questionnaire)
class QuestionnaireAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour le modèle Questionnaire (Template)
    """
    list_display = ('title', 'created_by', 'is_active', 'created_at', 'question_count')
    list_filter = ('is_active', 'created_at', 'created_by')
    search_fields = ('title', 'description', 'created_by__username')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = [QuestionInline, QuestionnaireDocumentInline]

    fieldsets = (
        ('Informations principales', {
            'fields': ('title', 'description', 'created_by', 'is_active')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def question_count(self, obj):
        """Nombre de questions"""
        return obj.questions.count()
    question_count.short_description = 'Nb questions'


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Interface d'administration pour les Questions"""
    list_display = ('questionnaire', 'text_preview', 'order', 'is_required', 'created_at')
    list_filter = ('is_required', 'created_at', 'questionnaire')
    search_fields = ('text', 'questionnaire__title')
    ordering = ('questionnaire', 'order')

    def text_preview(self, obj):
        """Aperçu du texte"""
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Question'


class AnswerInline(admin.TabularInline):
    """Inline pour les réponses"""
    model = Answer
    extra = 0
    fields = ('question', 'answer_text', 'updated_at')
    readonly_fields = ('updated_at',)


class ResponseDocumentInline(admin.TabularInline):
    """Inline pour les documents de réponse"""
    model = ResponseDocument
    extra = 0
    fields = ('file', 'filename', 'uploaded_at')
    readonly_fields = ('uploaded_at',)


class CommentInline(admin.TabularInline):
    """Inline pour les commentaires"""
    model = Comment
    extra = 0
    fields = ('author', 'content', 'created_at')
    readonly_fields = ('created_at',)


class StatusHistoryInline(admin.TabularInline):
    """Inline pour l'historique de statut"""
    model = StatusHistory
    extra = 0
    fields = ('old_status', 'new_status', 'changed_by', 'comment', 'changed_at')
    readonly_fields = ('changed_at',)
    ordering = ('-changed_at',)


@admin.register(QuestionnaireResponse)
class QuestionnaireResponseAdmin(admin.ModelAdmin):
    """
    Interface d'administration pour les réponses aux questionnaires
    """
    list_display = ('questionnaire', 'responder', 'status', 'submitted_at', 'created_at')
    list_filter = ('status', 'submitted_at', 'created_at')
    search_fields = ('questionnaire__title', 'responder__username', 'responder__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'submitted_at')
    inlines = [AnswerInline, ResponseDocumentInline, CommentInline, StatusHistoryInline]

    fieldsets = (
        ('Informations principales', {
            'fields': ('questionnaire', 'responder', 'status')
        }),
        ('Dates', {
            'fields': ('submitted_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    """Interface d'administration pour les réponses"""
    list_display = ('response', 'question_preview', 'answer_preview', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('answer_text', 'question__text', 'response__responder__username')
    ordering = ('-updated_at',)

    def question_preview(self, obj):
        """Aperçu de la question"""
        return obj.question.text[:40] + '...' if len(obj.question.text) > 40 else obj.question.text
    question_preview.short_description = 'Question'

    def answer_preview(self, obj):
        """Aperçu de la réponse"""
        return obj.answer_text[:50] + '...' if len(obj.answer_text) > 50 else obj.answer_text
    answer_preview.short_description = 'Réponse'


@admin.register(QuestionnaireDocument)
class QuestionnaireDocumentAdmin(admin.ModelAdmin):
    """Interface d'administration pour les documents de questionnaire"""
    list_display = ('filename', 'questionnaire', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('filename', 'questionnaire__title')
    ordering = ('-uploaded_at',)
    readonly_fields = ('uploaded_at',)


@admin.register(ResponseDocument)
class ResponseDocumentAdmin(admin.ModelAdmin):
    """Interface d'administration pour les documents de réponse"""
    list_display = ('filename', 'response', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('filename', 'response__responder__username')
    ordering = ('-uploaded_at',)
    readonly_fields = ('uploaded_at',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """Interface d'administration pour les commentaires"""
    list_display = ('author', 'response', 'content_preview', 'created_at')
    list_filter = ('created_at', 'author')
    search_fields = ('content', 'author__username', 'response__questionnaire__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    def content_preview(self, obj):
        """Aperçu du contenu"""
        return obj.content[:60] + '...' if len(obj.content) > 60 else obj.content
    content_preview.short_description = 'Contenu'


@admin.register(StatusHistory)
class StatusHistoryAdmin(admin.ModelAdmin):
    """Interface d'administration pour l'historique de statut"""
    list_display = ('response', 'old_status', 'new_status', 'changed_by', 'changed_at')
    list_filter = ('old_status', 'new_status', 'changed_at')
    search_fields = ('response__questionnaire__title', 'response__responder__username', 'comment')
    ordering = ('-changed_at',)
    readonly_fields = ('changed_at',)
