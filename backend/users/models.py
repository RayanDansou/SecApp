"""
User models for SecApp
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model with role-based access control
    """
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrateur'
        CHEF_PROJET = 'CHEF_PROJET', 'Chef de Projet'
        ANALYSTE = 'ANALYSTE', 'Analyste Sécurité'
        BUSINESS_OWNER = 'BUSINESS_OWNER', 'Business Owner'

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CHEF_PROJET,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_chef_projet(self):
        return self.role == self.Role.CHEF_PROJET

    @property
    def is_analyste(self):
        return self.role == self.Role.ANALYSTE

    @property
    def is_business_owner(self):
        return self.role == self.Role.BUSINESS_OWNER

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN