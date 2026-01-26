from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle User
    """
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'first_name', 'last_name', 'date_joined', 'is_active',
                  'avatar', 'profile_picture', 'profile_picture_url')
        read_only_fields = ('id', 'date_joined', 'profile_picture_url')


    def get_profile_picture_url(self, obj):
        """
        Retourne l'URL de la photo de profil
        """
        return obj.get_profile_picture_url()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'enregistrement d'un nouvel utilisateur
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'role', 'first_name', 'last_name')

    def validate(self, attrs):
        """
        Validation des mots de passe
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Les mots de passe ne correspondent pas."}
            )
        return attrs

    def create(self, validated_data):
        """
        Création d'un nouvel utilisateur avec mot de passe hashé
        """
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer pour la connexion
    """
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer pour le changement de mot de passe
    """
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password2 = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """
        Validation des mots de passe
        """
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError(
                {"new_password": "Les nouveaux mots de passe ne correspondent pas."}
            )
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer pour la demande de réinitialisation de mot de passe
    """
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer pour la confirmation de réinitialisation de mot de passe
    """
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password2 = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """
        Validation des mots de passe
        """
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError(
                {"new_password": "Les mots de passe ne correspondent pas."}
            )
        return attrs


class ProfilePictureSerializer(serializers.ModelSerializer):
    """
    Serializer pour la mise à jour de la photo de profil
    """
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('avatar', 'profile_picture', 'profile_picture_url')

    def get_profile_picture_url(self, obj):
        """
        Retourne l'URL de la photo de profil
        """
        return obj.get_profile_picture_url()

    def validate(self, attrs):
        """
        S'assure qu'on ne peut pas avoir à la fois un avatar et une photo personnalisée
        """
        # Si une photo personnalisée est uploadée, on retire l'avatar
        if 'profile_picture' in attrs and attrs['profile_picture']:
            attrs['avatar'] = None
        # Si un avatar est sélectionné, on retire la photo personnalisée
        elif 'avatar' in attrs and attrs['avatar']:
            attrs['profile_picture'] = None

        return attrs
