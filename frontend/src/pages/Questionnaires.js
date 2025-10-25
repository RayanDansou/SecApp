import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import questionnaireService from '../services/questionnaireService';
import './Questionnaires.css';

const Questionnaires = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  const loadQuestionnaires = async () => {
    try {
      setLoading(true);
      const data = await questionnaireService.getQuestionnaires();
      setQuestionnaires(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des questionnaires');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'BROUILLON': 'status-brouillon',
      'SOUMIS': 'status-soumis',
      'EN_ANALYSE': 'status-en-analyse',
      'VALIDE': 'status-valide',
      'REJETE': 'status-rejete'
    };
    return classes[status] || 'status-default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="questionnaires-container">
      <nav className="questionnaires-nav">
        <div className="nav-brand">
          <h2>SecApp</h2>
        </div>
        <div className="nav-actions">
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            Dashboard
          </button>
          <button onClick={() => navigate('/profile')} className="btn btn-secondary">
            Mon Profil
          </button>
          <button onClick={handleLogout} className="btn btn-logout">
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="questionnaires-content">
        <div className="questionnaires-header">
          <div>
            <h1>Mes Questionnaires</h1>
            <p>Gérez vos questionnaires de sécurité</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/questionnaires/new')}
          >
            + Nouveau Questionnaire
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Chargement des questionnaires...</p>
          </div>
        ) : questionnaires.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Aucun questionnaire</h3>
            <p>Vous n'avez pas encore créé de questionnaire.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/questionnaires/new')}
            >
              Créer mon premier questionnaire
            </button>
          </div>
        ) : (
          <div className="questionnaires-grid">
            {questionnaires.map((questionnaire) => (
              <div
                key={questionnaire.id}
                className="questionnaire-card"
                onClick={() => navigate(`/questionnaires/${questionnaire.id}`)}
              >
                <div className="card-header">
                  <h3>{questionnaire.title}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(questionnaire.status)}`}>
                    {questionnaire.status_display}
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-info">
                    <span className="info-label">Créé le</span>
                    <span className="info-value">{formatDate(questionnaire.created_at)}</span>
                  </div>
                  <div className="card-info">
                    <span className="info-label">Modifié le</span>
                    <span className="info-value">{formatDate(questionnaire.updated_at)}</span>
                  </div>
                </div>
                <div className="card-footer">
                  <span className="view-link">Voir les détails →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Questionnaires;
