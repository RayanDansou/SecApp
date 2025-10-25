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

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>SecApp</h2>
        </div>
        <div className="nav-user">
          <span className="user-name">{user?.username}</span>
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
            <h3>Questionnaires</h3>
            <p>Gérez vos questionnaires de sécurité</p>
            <button className="btn btn-secondary" disabled>
              Voir les questionnaires
            </button>
          </div>

          {user?.role === 'ANALYSTE' && (
            <div className="card">
              <h3>Validations</h3>
              <p>Questionnaires en attente de validation</p>
              <button className="btn btn-secondary" disabled>
                Voir les validations
              </button>
            </div>
          )}

          {user?.role === 'BUSINESS_OWNER' && (
            <div className="card">
              <h3>Rapports</h3>
              <p>Consultez les rapports de sécurité</p>
              <button className="btn btn-secondary" disabled>
                Voir les rapports
              </button>
            </div>
          )}
        </div>

        <div className="info-message">
          <p>
            Cette interface sera enrichie avec les fonctionnalités de gestion des questionnaires
            dans les prochaines phases du projet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
