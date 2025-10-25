import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import questionnaireService from '../services/questionnaireService';
import Navbar from '../components/Navbar';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [recentResponses, setRecentResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentData();
  }, [user?.role]);

  const loadRecentData = async () => {
    try {
      if (user?.role === 'ANALYSTE') {
        const templates = await questionnaireService.getQuestionnaires();
        setRecentTemplates(templates.slice(0, 3)); // Derniers 3 templates
        const responses = await questionnaireService.getResponses();
        setRecentResponses(responses.slice(0, 3)); // Dernières 3 réponses soumises
      } else if (user?.role === 'CHEF_PROJET') {
        const responses = await questionnaireService.getResponses();
        setRecentResponses(responses.slice(0, 3)); // Dernières 3 réponses
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données récentes:', err);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      'BROUILLON': 'Brouillon',
      'SOUMIS': 'Soumis',
      'EN_ATTENTE': 'En attente',
      'EN_VALIDATION': 'En validation',
      'VALIDE': 'Validé',
      'REJETE': 'Rejeté'
    };
    return labels[status] || status;
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
              <button className="btn btn-primary" onClick={() => navigate('/analyste/create-template')}>
                Créer un questionnaire
              </button>
            </div>

            <div className="card">
              <h3>Mes templates</h3>
              <p>Gérez vos templates créés</p>
              <button className="btn btn-primary" onClick={() => navigate('/analyste/my-templates')}>
                Voir mes templates
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

  const renderRecentItems = () => {
    if (loading) {
      return (
        <div className="recent-section">
          <p className="loading-text">Chargement...</p>
        </div>
      );
    }

    if (user?.role === 'ANALYSTE') {
      return (
        <>
          {recentTemplates.length > 0 && (
            <div className="recent-section">
              <div className="recent-header">
                <h2>Derniers templates créés</h2>
                <button className="btn-link" onClick={() => navigate('/analyste/my-templates')}>
                  Voir tous →
                </button>
              </div>
              <div className="recent-items">
                {recentTemplates.map((template) => (
                  <div key={template.id} className="recent-item" onClick={() => navigate('/analyste/my-templates')}>
                    <div className="item-header">
                      <h4>{template.title}</h4>
                      <span className={`badge ${template.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {template.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    {template.description && (
                      <p className="item-description">{template.description}</p>
                    )}
                    <div className="item-meta">
                      <span>{template.question_count || 0} questions</span>
                      <span>•</span>
                      <span>Créé le {formatDate(template.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentResponses.length > 0 && (
            <div className="recent-section">
              <div className="recent-header">
                <h2>Dernières réponses soumises</h2>
                <button className="btn-link" onClick={() => navigate('/analyste/submitted-responses')}>
                  Voir toutes →
                </button>
              </div>
              <div className="recent-items">
                {recentResponses.map((response) => (
                  <div key={response.id} className="recent-item" onClick={() => navigate(`/analyste/response/${response.id}`)}>
                    <div className="item-header">
                      <h4>{response.questionnaire?.title || 'Sans titre'}</h4>
                      <span className={`badge badge-status-${response.status.toLowerCase()}`}>
                        {getStatusLabel(response.status)}
                      </span>
                    </div>
                    {response.responder && (
                      <p className="item-description">
                        Par {response.responder.first_name} {response.responder.last_name}
                      </p>
                    )}
                    <div className="item-meta">
                      <span>{response.answer_count || response.answers?.length || 0} réponses</span>
                      <span>•</span>
                      <span>
                        {response.submitted_at
                          ? `Soumis le ${formatDate(response.submitted_at)}`
                          : `Créé le ${formatDate(response.created_at)}`
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }

    if (user?.role === 'CHEF_PROJET' && recentResponses.length > 0) {
      return (
        <div className="recent-section">
          <div className="recent-header">
            <h2>Derniers questionnaires soumis</h2>
            <button className="btn-link" onClick={() => navigate('/my-responses')}>
              Voir tous →
            </button>
          </div>
          <div className="recent-items">
            {recentResponses.map((response) => (
              <div key={response.id} className="recent-item" onClick={() => navigate(`/response/${response.id}`)}>
                <div className="item-header">
                  <h4>{response.questionnaire?.title || 'Sans titre'}</h4>
                  <span className={`badge badge-status-${response.status.toLowerCase()}`}>
                    {getStatusLabel(response.status)}
                  </span>
                </div>
                {response.questionnaire?.description && (
                  <p className="item-description">{response.questionnaire.description}</p>
                )}
                <div className="item-meta">
                  <span>{response.answer_count || response.answers?.length || 0} réponses</span>
                  <span>•</span>
                  <span>
                    {response.submitted_at
                      ? `Soumis le ${formatDate(response.submitted_at)}`
                      : `Créé le ${formatDate(response.created_at)}`
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="dashboard-container">
      <Navbar />

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

        {renderRecentItems()}

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
