import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import questionnaireService from '../../services/questionnaireService';
import StatusBadge from '../../components/questionnaires/StatusBadge';
import './ValidatedResponses.css';

const ValidatedResponses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, validated, rejected
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
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
    navigate(`/business-owner/response/${id}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFilteredResponses = () => {
    if (filter === 'all') return responses;
    if (filter === 'validated') {
      return responses.filter(r => r.status === 'VALIDE');
    }
    if (filter === 'rejected') {
      return responses.filter(r => r.status === 'REJETE');
    }
    return responses;
  };

  const filteredResponses = getFilteredResponses();

  if (loading) {
    return (
      <div className="validated-responses">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="validated-responses">
      <div className="page-header">
        <div className="header-content">
          <h1>{t('businessOwner.validatedResponses')}</h1>
          <p className="subtitle">{t('businessOwner.validatedResponsesSubtitle')}</p>
        </div>
      </div>

      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t('businessOwner.filterAll')} ({responses.length})
        </button>
        <button
          className={`filter-btn ${filter === 'validated' ? 'active' : ''}`}
          onClick={() => setFilter('validated')}
        >
          {t('businessOwner.filterValidated')} ({responses.filter(r => r.status === 'VALIDE').length})
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          {t('analyste.filterRejected')} ({responses.filter(r => r.status === 'REJETE').length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredResponses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>{t('businessOwner.noValidatedResponses')}</h2>
          <p>{t('businessOwner.noValidatedResponsesMessage')}</p>
        </div>
      ) : (
        <div className="responses-list">
          {filteredResponses.map((response) => (
            <div key={response.id} className="response-card">
              <div className="card-header">
                <div className="card-title-section">
                  <h3>{response.questionnaire.title}</h3>
                  <StatusBadge status={response.status} />
                </div>
              </div>

              <div className="card-body">
                <div className="project-info">
                  <span className="project-label">{t('analyste.projectManager', { defaultValue: 'Chef de projet' })}:</span>
                  <span className="project-name">
                    {response.responder.first_name} {response.responder.last_name}
                  </span>
                </div>

                <div className="card-meta">
                  <div className="meta-row">
                    <span className="meta-label">{t('questionnaire.submittedOn')}:</span>
                    <span className="meta-value">
                      {response.submitted_at ? formatDate(response.submitted_at) : '-'}
                    </span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">{t('businessOwner.analyzedBy', { defaultValue: 'Analysé par' })}:</span>
                    <span className="meta-value">
                      {response.questionnaire.created_by?.first_name} {response.questionnaire.created_by?.last_name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button onClick={() => handleViewResponse(response.id)} className="btn-view">
                  {t('questionnaire.viewDetails')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ValidatedResponses;
