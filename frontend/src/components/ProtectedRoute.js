import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant pour protéger les routes nécessitant une authentification
 * Redirige vers /login si l'utilisateur n'est pas authentifié
 * Peut également vérifier les rôles autorisés
 */
const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Chargement...</div>
      </div>
    );
  }

  // Si non authentifié, rediriger vers la page de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si des rôles spécifiques sont requis, vérifier le rôle de l'utilisateur
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h1>Accès refusé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    );
  }

  // Si tout est OK, afficher le contenu
  return children;
};

export default ProtectedRoute;
