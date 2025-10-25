import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'CHEF_PROJET': 'Chef de Projet',
      'ANALYSTE': 'Analyste Sécurité',
      'BUSINESS_OWNER': 'Business Owner',
      'ADMIN': 'Administrateur'
    };
    return roleNames[role] || role;
  };

  const renderRoleSpecificCards = () => {
    switch (user?.role) {
      case 'CHEF_PROJET':
        return (
          <>
            <div className="card">
              <h3>Questionnaires disponibles</h3>
              <p>Consultez les questionnaires de sécurité disponibles</p>
              <button className="btn btn-primary" onClick={() => navigate('/available-questionnaires')}>
                Voir les questionnaires
              </button>
            </div>

            <div className="card">
              <h3>Mes réponses</h3>
              <p>Gérez vos questionnaires remplis et leur statut</p>
              <button className="btn btn-primary" onClick={() => navigate('/my-responses')}>
                Mes questionnaires
              </button>
            </div>
          </>
        );

      case 'ANALYSTE':
        return (
          <>
            <div className="card">
              <h3>Réponses soumises</h3>
              <p>Consultez et validez les questionnaires soumis</p>
              <button className="btn btn-primary" onClick={() => navigate('/analyste/submitted-responses')}>
                Voir les réponses
              </button>
            </div>

            <div className="card">
              <h3>Créer un template</h3>
              <p>Créez de nouveaux questionnaires de sécurité</p>
              <button className="btn btn-secondary" disabled>
                Créer un questionnaire
              </button>
            </div>
          </>
        );

      case 'BUSINESS_OWNER':
        return (
          <div className="card">
            <h3>Questionnaires validés</h3>
            <p>Consultez les résultats des évaluations de sécurité</p>
            <button className="btn btn-primary" onClick={() => navigate('/business-owner/validated-responses')}>
              Voir les résultats
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>SecApp</h2>
        </div>
        <div className="nav-user">
          <span className="user-name">{user?.username}</span>
          <button onClick={() => navigate('/profile')} className="btn btn-profile">
            Mon Profil
          </button>
          <button onClick={handleLogout} className="btn btn-logout">
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h1>Bienvenue, {user?.first_name || user?.username} !</h1>
          <div className="user-info">
            <div className="info-item">
              <span className="info-label">Nom d'utilisateur:</span>
              <span className="info-value">{user?.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Rôle:</span>
              <span className="info-value role-badge">{getRoleDisplayName(user?.role)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Statut:</span>
              <span className="info-value status-active">Actif</span>
            </div>
          </div>
        </div>

        <div className="dashboard-cards">
          <div className="card">
            <h3>Mon Profil</h3>
            <p>Gérez vos informations personnelles et votre mot de passe</p>
            <button className="btn btn-secondary" onClick={() => navigate('/profile')}>
              Accéder au profil
            </button>
          </div>

          {renderRoleSpecificCards()}
        </div>

        <div className="info-message">
          <p>
            Plateforme de gestion des questionnaires de sécurité - Version 2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
