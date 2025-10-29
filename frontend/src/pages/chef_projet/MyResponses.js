import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import questionnaireService from '../../services/questionnaireService';
import StatusBadge from '../../components/questionnaires/StatusBadge';
import './MyResponses.css';

const MyResponses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    // Afficher un message de succès si on vient de soumettre un questionnaire
    if (location.state?.message) {
      setSuccess(location.state.message);
      setTimeout(() => setSuccess(''), 5000);
      // Nettoyer le state pour éviter de réafficher le message
      window.history.replaceState({}, document.title);
    }

    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      const data = await questionnaireService.getResponses();
      setResponses(data);
    } catch (err) {
      setError(err.error || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewResponse = (id) => {
    navigate(`/response/${id}`);
  };

  const handleContinueResponse = (id) => {
    navigate(`/response/${id}/edit`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (loading) {
    return (
      <div className="my-responses">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="my-responses">
      <div className="page-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← {t('common.back')}
        </button>
        <div className="header-content">
          <h1>{t('questionnaire.myResponses')}</h1>
          <p className="subtitle">{t('dashboard.chefProjet.myResponsesSubtitle', { defaultValue: 'Consultez l\'état de vos questionnaires de sécurité' })}</p>
        </div>
        <button onClick={() => navigate('/available-questionnaires')} className="btn-new">
          + {t('dashboard.chefProjet.startQuestionnaire')}
        </button>
      </div>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      {responses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>{t('questionnaire.noResponses')}</h2>
          <p>{t('questionnaire.noResponsesMessage', { defaultValue: 'Vous n\'avez pas encore rempli de questionnaire' })}</p>
          <button onClick={() => navigate('/available-questionnaires')} className="btn-start">
            {t('dashboard.chefProjet.startQuestionnaire')}
          </button>
        </div>
      ) : (
        <div className="responses-list">
          {responses.map((response) => (
            <div key={response.id} className="response-card">
              <div className="card-header">
                <div className="card-title-section">
                  <h3>{response.questionnaire.title}</h3>
                  <StatusBadge status={response.status} />
                </div>
              </div>

              <div className="card-body">
                {response.questionnaire.description && (
                  <p className="card-description">{truncateText(response.questionnaire.description)}</p>
                )}

                <div className="card-meta">
                  <div className="meta-row">
                    <span className="meta-label">{t('common.date')}:</span>
                    <span className="meta-value">{formatDate(response.created_at)}</span>
                  </div>
                  {response.submitted_at && (
                    <div className="meta-row">
                      <span className="meta-label">{t('questionnaire.submittedOn')}:</span>
                      <span className="meta-value">{formatDate(response.submitted_at)}</span>
                    </div>
                  )}
                  {response.updated_at && (
                    <div className="meta-row">
                      <span className="meta-label">{t('questionnaire.lastModified')}:</span>
                      <span className="meta-value">{formatDate(response.updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button onClick={() => handleViewResponse(response.id)} className="btn-view">
                  {t('questionnaire.viewDetails')}
                </button>
                {response.status === 'BROUILLON' && (
                  <button onClick={() => handleContinueResponse(response.id)} className="btn-continue">
                    {t('questionnaire.continueQuestionnaire')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResponses;
