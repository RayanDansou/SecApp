from django.contrib.auth.models import AbstractUser
from django.db import models


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

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CHEF_PROJET,
        verbose_name="Rôle"
    )

    email = models.EmailField(unique=True, verbose_name="Email")

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
