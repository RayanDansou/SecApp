import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import questionnaireService from '../services/questionnaireService';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation();
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
    return t(`roles.${role}`, role);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'BROUILLON': 'draft',
      'SOUMIS': 'submitted',
      'EN_ATTENTE': 'pending',
      'EN_VALIDATION': 'in_analysis',
      'VALIDE': 'validated',
      'REJETE': 'rejected'
    };
    return t(`status.${statusMap[status] || status.toLowerCase()}`, status);
  };

  const renderRoleSpecificCards = () => {
    switch (user?.role) {
      case 'CHEF_PROJET':
        return (
          <>
            <div className="card">
              <h3>{t('dashboard.chefProjet.availableQuestionnaires')}</h3>
              <p>{t('questionnaire.availableQuestionnaires')}</p>
              <button className="btn btn-primary" onClick={() => navigate('/available-questionnaires')}>
                {t('questionnaire.viewDetails')}
              </button>
            </div>

            <div className="card">
              <h3>{t('dashboard.chefProjet.myResponses')}</h3>
              <p>{t('questionnaire.myResponses')}</p>
              <button className="btn btn-primary" onClick={() => navigate('/my-responses')}>
                {t('questionnaire.myResponses')}
              </button>
            </div>
          </>
        );

      case 'ANALYSTE':
        return (
          <>
            <div className="card">
              <h3>{t('dashboard.analyste.submittedResponses')}</h3>
              <p>{t('analyste.submittedResponsesSubtitle')}</p>
              <button className="btn btn-primary" onClick={() => navigate('/analyste/submitted-responses')}>
                {t('analyste.viewResponse')}
              </button>
            </div>

            <div className="card">
              <h3>{t('dashboard.analyste.createTemplate')}</h3>
              <p>{t('template.createTemplate')}</p>
              <button className="btn btn-primary" onClick={() => navigate('/analyste/create-template')}>
                {t('questionnaire.createQuestionnaire')}
              </button>
            </div>

            <div className="card">
              <h3>{t('dashboard.analyste.myTemplates')}</h3>
              <p>{t('template.myTemplates')}</p>
              <button className="btn btn-primary" onClick={() => navigate('/analyste/my-templates')}>
                {t('dashboard.analyste.myTemplates')}
              </button>
            </div>
          </>
        );

      case 'BUSINESS_OWNER':
        return (
          <div className="card">
            <h3>{t('dashboard.businessOwner.validatedResponses')}</h3>
            <p>{t('businessOwner.validatedResponsesSubtitle')}</p>
            <button className="btn btn-primary" onClick={() => navigate('/business-owner/validated-responses')}>
              {t('dashboard.businessOwner.viewAll')}
            </button>
          </div>
        );

      case 'ADMIN':
        return (
          <div className="card">
            <h3>{t('admin.userManagement')}</h3>
            <p>{t('admin.manageUsers')}</p>
            <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>
              {t('admin.userList')}
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
          <p className="loading-text">{t('common.loading')}</p>
        </div>
      );
    }

    if (user?.role === 'ANALYSTE') {
      return (
        <>
          {recentTemplates.length > 0 && (
            <div className="recent-section">
              <div className="recent-header">
                <h2>{t('dashboard.analyste.latestTemplates')}</h2>
                <button className="btn-link" onClick={() => navigate('/analyste/my-templates')}>
                  {t('dashboard.businessOwner.viewAll')} →
                </button>
              </div>
              <div className="recent-items">
                {recentTemplates.map((template) => (
                  <div key={template.id} className="recent-item" onClick={() => navigate('/analyste/my-templates')}>
                    <div className="item-header">
                      <h4>{template.title}</h4>
                      <span className={`badge ${template.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {template.is_active ? t('template.active') : t('template.inactive')}
                      </span>
                    </div>
                    {template.description && (
                      <p className="item-description">{template.description}</p>
                    )}
                    <div className="item-meta">
                      <span>{t('questionnaire.totalQuestions', { count: template.question_count || 0 })}</span>
                      <span>•</span>
                      <span>{formatDate(template.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentResponses.length > 0 && (
            <div className="recent-section">
              <div className="recent-header">
                <h2>{t('dashboard.analyste.recentResponses')}</h2>
                <button className="btn-link" onClick={() => navigate('/analyste/submitted-responses')}>
                  {t('dashboard.businessOwner.viewAll')} →
                </button>
              </div>
              <div className="recent-items">
                {recentResponses.map((response) => (
                  <div key={response.id} className="recent-item" onClick={() => navigate(`/analyste/response/${response.id}`)}>
                    <div className="item-header">
                      <h4>{response.questionnaire?.title || t('common.title')}</h4>
                      <span className={`badge badge-status-${response.status.toLowerCase()}`}>
                        {getStatusLabel(response.status)}
                      </span>
                    </div>
                    {response.responder && (
                      <p className="item-description">
                        {response.responder.first_name} {response.responder.last_name}
                      </p>
                    )}
                    <div className="item-meta">
                      <span>{t('questionnaire.totalQuestions', { count: response.answer_count || response.answers?.length || 0 })}</span>
                      <span>•</span>
                      <span>
                        {response.submitted_at
                          ? `${t('questionnaire.submittedOn')} ${formatDate(response.submitted_at)}`
                          : formatDate(response.created_at)
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
            <h2>{t('dashboard.recentActivity')}</h2>
            <button className="btn-link" onClick={() => navigate('/my-responses')}>
              {t('dashboard.businessOwner.viewAll')} →
            </button>
          </div>
          <div className="recent-items">
            {recentResponses.map((response) => (
              <div key={response.id} className="recent-item" onClick={() => navigate(`/response/${response.id}`)}>
                <div className="item-header">
                  <h4>{response.questionnaire?.title || t('common.title')}</h4>
                  <span className={`badge badge-status-${response.status.toLowerCase()}`}>
                    {getStatusLabel(response.status)}
                  </span>
                </div>
                {response.questionnaire?.description && (
                  <p className="item-description">{response.questionnaire.description}</p>
                )}
                <div className="item-meta">
                  <span>{t('questionnaire.totalQuestions', { count: response.answer_count || response.answers?.length || 0 })}</span>
                  <span>•</span>
                  <span>
                    {response.submitted_at
                      ? `${t('questionnaire.submittedOn')} ${formatDate(response.submitted_at)}`
                      : formatDate(response.created_at)
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
      <div className="dashboard-content">
        <div className="welcome-card">
          <h1>{t('dashboard.welcome', { name: user?.first_name || user?.username })}</h1>
          <div className="user-info">
            <div className="info-item">
              <span className="info-label">{t('auth.username')}:</span>
              <span className="info-value">{user?.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('auth.email')}:</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('auth.role')}:</span>
              <span className="info-value role-badge">{getRoleDisplayName(user?.role)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('common.status')}:</span>
              <span className="info-value status-active">{t('template.active')}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-cards">
          <div className="card">
            <h3>{t('profile.title')}</h3>
            <p>{t('profile.subtitle')}</p>
            <button className="btn btn-secondary" onClick={() => navigate('/profile')}>
              {t('navbar.profile')}
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
