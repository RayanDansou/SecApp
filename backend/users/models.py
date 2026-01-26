from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
import secrets


class User(AbstractUser):
    """
    Modèle utilisateur personnalisé avec gestion des rôles.
    Rôles disponibles: CHEF_PROJET, ANALYSTE, BUSINESS_OWNER, ADMIN
    """

    class Role(models.TextChoices):
        CHEF_PROJET = 'CHEF_PROJET', 'Chef de Projet'
        ANALYSTE = 'ANALYSTE', 'Analyste Sécurité'
        BUSINESS_OWNER = 'BUSINESS_OWNER', 'Business Owner'
        ADMIN = 'ADMIN', 'Administrateur'

    class Avatar(models.TextChoices):
        AVATAR_1 = 'avatar1', 'Avatar 1'
        AVATAR_2 = 'avatar2', 'Avatar 2'
        AVATAR_3 = 'avatar3', 'Avatar 3'
        AVATAR_4 = 'avatar4', 'Avatar 4'
        AVATAR_5 = 'avatar5', 'Avatar 5'
        AVATAR_6 = 'avatar6', 'Avatar 6'

    class Language(models.TextChoices):
        FRENCH = 'fr', 'Français'
        ENGLISH = 'en', 'English'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CHEF_PROJET,
        verbose_name="Rôle"
    )

    email = models.EmailField(unique=True, verbose_name="Email")

    preferred_language = models.CharField(
        max_length=2,
        choices=Language.choices,
        default=Language.FRENCH,
        verbose_name="Langue préférée"
    )

    # Champs pour la photo de profil
    avatar = models.CharField(
        max_length=20,
        choices=Avatar.choices,
        null=True,
        blank=True,
        verbose_name="Avatar prédéfini"
    )

    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        null=True,
        blank=True,
        verbose_name="Photo de profil personnalisée"
    )

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    def get_profile_picture_url(self):
        """
        Retourne l'URL de la photo de profil (personnalisée ou avatar)
        """
        # Mapping des avatars vers les URLs DiceBear
        AVATAR_URLS = {
            'avatar1': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
            'avatar2': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede',
            'avatar3': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Princess&backgroundColor=ffd5dc',
            'avatar4': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper&backgroundColor=d1d4f9',
            'avatar5': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe&backgroundColor=ffdfbf',
            'avatar6': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar&backgroundColor=c5e4e7'
        }

        if self.profile_picture:
            return self.profile_picture.url
        elif self.avatar:
            return f'/static/avatars/{self.avatar}.png'
        else:
            return f'/static/avatars/default.png'


class PasswordResetToken(models.Model):
    """
    Modèle pour les tokens de réinitialisation de mot de passe
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Token de réinitialisation"
        verbose_name_plural = "Tokens de réinitialisation"
        ordering = ['-created_at']

    def __str__(self):
        return f"Token pour {self.user.username} - {'Utilisé' if self.used else 'Valide' if not self.is_expired() else 'Expiré'}"

    @staticmethod
    def generate_token():
        """Génère un token sécurisé"""
        return secrets.token_urlsafe(32)

    def is_expired(self):
        """Vérifie si le token a expiré"""
        return timezone.now() > self.expires_at

    def is_valid(self):
        """Vérifie si le token est valide (non utilisé et non expiré)"""
        return not self.used and not self.is_expired()

    @classmethod
    def create_token(cls, user, expiry_hours=1):
        """
        Crée un nouveau token de réinitialisation pour un utilisateur

        Args:
            user: L'utilisateur pour lequel créer le token
            expiry_hours: Nombre d'heures avant expiration (défaut: 1)

        Returns:
            PasswordResetToken: Le token créé
        """
        token = cls.generate_token()
        expires_at = timezone.now() + timedelta(hours=expiry_hours)

        return cls.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
