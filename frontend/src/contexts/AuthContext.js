import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialisation : vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      const token = localStorage.getItem('access_token');

      if (currentUser && token) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Connexion de l'utilisateur
   */
  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true, data };
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error };
    }
  };

  /**
   * Déconnexion de l'utilisateur
   */
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Inscription d'un nouvel utilisateur
   */
  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  };

  /**
   * Mise à jour du profil utilisateur
   */
  const updateProfile = async (profileData) => {
    try {
      const data = await authService.updateProfile(profileData);
      setUser(data);
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  };

  /**
   * Rafraîchir les données du profil
   */
  const refreshProfile = async () => {
    try {
      const data = await authService.getProfile();
      setUser(data);
      return { success: true, data };
    } catch (error) {
      // Si le refresh échoue, déconnecter l'utilisateur
      logout();
      return { success: false, error };
    }
  };

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Vérifier si l'utilisateur a au moins un des rôles spécifiés
   */
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    updateProfile,
    refreshProfile,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export default AuthContext;
