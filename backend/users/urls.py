from django.urls import path
from .views import (
    LoginView,
    LogoutView,
    RegisterView,
    UserProfileView,
    ChangePasswordView,
    RefreshTokenView,
    DeleteAccountView,
    UserListView
)

app_name = 'users'

urlpatterns = [
    # Authentification
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('refresh/', RefreshTokenView.as_view(), name='token_refresh'),

    # Profil utilisateur
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),

    # Gestion des comptes
    path('delete-account/', DeleteAccountView.as_view(), name='delete_account'),
    path('delete-account/<int:user_id>/', DeleteAccountView.as_view(), name='delete_account_by_admin'),
    path('users/', UserListView.as_view(), name='user_list'),
]
