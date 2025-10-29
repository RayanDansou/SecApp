import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import questionnaireService from '../../services/questionnaireService';
import './AvailableQuestionnaires.css';

const AvailableQuestionnaires = () => {
  const { t } = useTranslation();
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  const loadQuestionnaires = async () => {
    try {
      const data = await questionnaireService.getQuestionnaires();
      setQuestionnaires(data);
    } catch (err) {
      setError(err.error || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuestionnaire = (id) => {
    navigate(`/fill-questionnaire/${id}`);
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (loading) {
    return (
      <div className="available-questionnaires">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="available-questionnaires">
      <div className="page-header">
        <h1>{t('questionnaire.availableQuestionnaires')}</h1>
        <p className="subtitle">{t('dashboard.chefProjet.startQuestionnaire')}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {questionnaires.length === 0 ? (
        <div className="empty-state">
          <p>{t('questionnaire.noQuestionnaires')}</p>
        </div>
      ) : (
        <div className="questionnaires-grid">
          {questionnaires.map((questionnaire) => (
            <div key={questionnaire.id} className="questionnaire-card">
              <div className="card-header">
                <h3>{questionnaire.title}</h3>
                {questionnaire.question_count && (
                  <span className="question-count">
                    {t('questionnaire.totalQuestions', { count: questionnaire.question_count })}
                  </span>
                )}
              </div>

              {questionnaire.description && (
                <p className="card-description">{truncateText(questionnaire.description)}</p>
              )}

              <div className="card-meta">
                <div className="meta-item">
                  <span className="meta-label">{t('questionnaire.createdBy')}:</span>
                  <span className="meta-value">
                    {questionnaire.created_by?.first_name} {questionnaire.created_by?.last_name}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">{t('common.date')}:</span>
                  <span className="meta-value">
                    {new Date(questionnaire.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleStartQuestionnaire(questionnaire.id)}
                className="start-button"
              >
                {t('questionnaire.startQuestionnaire')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableQuestionnaires;
