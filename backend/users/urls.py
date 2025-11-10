from django.urls import path
from .views import (
    LoginView,
    LogoutView,
    RegisterView,
    UserProfileView,
    ChangePasswordView,
    RefreshTokenView,
    DeleteAccountView,
    UserListView,
    PasswordResetRequestView,
    PasswordResetConfirmView
)
from .google_auth import GoogleLoginView, GoogleRegisterView

app_name = 'users'

urlpatterns = [
    # Authentification
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('refresh/', RefreshTokenView.as_view(), name='token_refresh'),

    # Authentification Google
    path('google/login/', GoogleLoginView.as_view(), name='google_login'),
    path('google/register/', GoogleRegisterView.as_view(), name='google_register'),

    # Profil utilisateur
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),

    # Réinitialisation de mot de passe
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),

    # Gestion des comptes
    path('delete-account/', DeleteAccountView.as_view(), name='delete_account'),
    path('delete-account/<int:user_id>/', DeleteAccountView.as_view(), name='delete_account_by_admin'),
    path('users/', UserListView.as_view(), name='user_list'),
]
