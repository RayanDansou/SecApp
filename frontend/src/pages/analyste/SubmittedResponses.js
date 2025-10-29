import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import questionnaireService from '../../services/questionnaireService';
import StatusBadge from '../../components/questionnaires/StatusBadge';
import './SubmittedResponses.css';

const SubmittedResponses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, validated, rejected
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
    navigate(`/analyste/response/${id}`);
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
    if (filter === 'pending') {
      return responses.filter(r => ['SOUMIS', 'EN_ATTENTE', 'EN_VALIDATION'].includes(r.status));
    }
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
      <div className="submitted-responses">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="submitted-responses">
      <div className="page-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← {t('common.back')}
        </button>
        <div className="header-content">
          <h1>{t('analyste.submittedResponses')}</h1>
          <p className="subtitle">{t('analyste.submittedResponsesSubtitle')}</p>
        </div>
      </div>

      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t('analyste.filterAll')} ({responses.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          {t('analyste.filterPending')} ({responses.filter(r => ['SOUMIS', 'EN_ATTENTE', 'EN_VALIDATION'].includes(r.status)).length})
        </button>
        <button
          className={`filter-btn ${filter === 'validated' ? 'active' : ''}`}
          onClick={() => setFilter('validated')}
        >
          {t('analyste.filterApproved')} ({responses.filter(r => r.status === 'VALIDE').length})
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
          <h2>{t('analyste.noResponses')}</h2>
          <p>{t('analyste.noResponsesMessage')}</p>
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
                <div className="responder-info">
                  <span className="responder-label">{t('questionnaire.respondent')}:</span>
                  <span className="responder-name">
                    {response.responder.first_name} {response.responder.last_name}
                  </span>
                  <span className="responder-email">({response.responder.email})</span>
                </div>

                <div className="card-meta">
                  <div className="meta-row">
                    <span className="meta-label">{t('questionnaire.submittedOn')}:</span>
                    <span className="meta-value">
                      {response.submitted_at ? formatDate(response.submitted_at) : t('status.draft')}
                    </span>
                  </div>
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
                  {t('analyste.viewResponse')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmittedResponses;
