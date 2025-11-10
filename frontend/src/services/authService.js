import api from './api';

class AuthService {
  /**
   * Connexion de l'utilisateur
   * @param {string} username
   * @param {string} password
   * @returns {Promise} Données utilisateur et tokens
   */
  async login(username, password) {
    try {
      const response = await api.post('/api/auth/login/', {
        username,
        password,
      });

      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur de connexion' };
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/api/auth/logout/', {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Toujours nettoyer le localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise} Données utilisateur et tokens
   */
  async register(userData) {
    try {
      const response = await api.post('/api/auth/register/', userData);

      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de l\'inscription' };
    }
  }

  /**
   * Récupération du profil utilisateur
   * @returns {Promise} Données du profil
   */
  async getProfile() {
    try {
      const response = await api.get('/api/auth/profile/');
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération du profil' };
    }
  }

  /**
   * Mise à jour du profil utilisateur
   * @param {Object} profileData - Nouvelles données du profil
   * @returns {Promise} Données mises à jour
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/api/auth/profile/', profileData);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la mise à jour du profil' };
    }
  }

  /**
   * Changement de mot de passe
   * @param {string} oldPassword
   * @param {string} newPassword
   * @param {string} newPassword2
   * @returns {Promise} Message de confirmation
   */
  async changePassword(oldPassword, newPassword, newPassword2) {
    try {
      const response = await api.post('/api/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors du changement de mot de passe' };
    }
  }

  /**
   * Suppression du compte utilisateur
   * @param {number} userId - ID de l'utilisateur à supprimer (optionnel, pour admin uniquement)
   * @returns {Promise} Message de confirmation
   */
  async deleteAccount(userId = null) {
    try {
      const url = userId
        ? `/api/auth/delete-account/${userId}/`
        : '/api/auth/delete-account/';

      const response = await api.delete(url);

      // Si c'est l'utilisateur qui supprime son propre compte, nettoyer le localStorage
      if (!userId) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la suppression du compte' };
    }
  }

  /**
   * Récupération de la liste des utilisateurs (admin uniquement)
   * @returns {Promise} Liste des utilisateurs
   */
  async getUsers() {
    try {
      const response = await api.get('/api/auth/users/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des utilisateurs' };
    }
  }

  /**
   * Récupération de l'utilisateur actuel depuis le localStorage
   * @returns {Object|null} Données utilisateur ou null
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   * @param {string} role - Rôle à vérifier
   * @returns {boolean}
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Vérifie si l'utilisateur a au moins un des rôles spécifiés
   * @param {Array<string>} roles - Liste des rôles acceptés
   * @returns {boolean}
   */
  hasAnyRole(roles) {
    const user = this.getCurrentUser();
    return roles.includes(user?.role);
  }

  /**
   * Demande de réinitialisation de mot de passe
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise} Message de confirmation
   */
  async requestPasswordReset(email) {
    try {
      const response = await api.post('/api/auth/password-reset/request/', {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la demande de réinitialisation' };
    }
  }

  /**
   * Réinitialisation du mot de passe avec token
   * @param {string} token - Token de réinitialisation
   * @param {string} newPassword - Nouveau mot de passe
   * @param {string} newPassword2 - Confirmation du nouveau mot de passe
   * @returns {Promise} Message de confirmation
   */
  async resetPassword(token, newPassword, newPassword2) {
    try {
      const response = await api.post('/api/auth/password-reset/confirm/', {
        token,
        new_password: newPassword,
        new_password2: newPassword2,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la réinitialisation du mot de passe' };
    }
  }

  /**
   * Connexion avec Google OAuth
   * @param {string} credential - Token Google credential
   * @param {string} role - Rôle de l'utilisateur (optionnel, utilisé seulement si nouveau compte)
   * @returns {Promise} Données utilisateur et tokens
   */
  async googleLogin(credential, role = 'CHEF_PROJET') {
    try {
      const response = await api.post('/api/auth/google/login/', {
        credential,
        role,
      });

      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la connexion Google' };
    }
  }

  /**
   * Inscription avec Google OAuth
   * @param {string} credential - Token Google credential
   * @param {string} role - Rôle de l'utilisateur
   * @returns {Promise} Données utilisateur et tokens
   */
  async googleRegister(credential, role = 'CHEF_PROJET') {
    try {
      const response = await api.post('/api/auth/google/register/', {
        credential,
        role,
      });

      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de l\'inscription Google' };
    }
  }
}

export default new AuthService();
