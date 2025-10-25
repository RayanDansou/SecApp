import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import questionnaireService from '../../services/questionnaireService';
import './AvailableQuestionnaires.css';

const AvailableQuestionnaires = () => {
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
      setError(err.error || 'Erreur lors du chargement des questionnaires');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuestionnaire = (id) => {
    navigate(`/fill-questionnaire/${id}`);
  };

  if (loading) {
    return (
      <div className="available-questionnaires">
        <div className="loading">Chargement des questionnaires...</div>
      </div>
    );
  }

  return (
    <div className="available-questionnaires">
      <div className="page-header">
        <h1>Questionnaires disponibles</h1>
        <p className="subtitle">Sélectionnez un questionnaire pour commencer</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {questionnaires.length === 0 ? (
        <div className="empty-state">
          <p>Aucun questionnaire disponible pour le moment</p>
        </div>
      ) : (
        <div className="questionnaires-grid">
          {questionnaires.map((questionnaire) => (
            <div key={questionnaire.id} className="questionnaire-card">
              <div className="card-header">
                <h3>{questionnaire.title}</h3>
                {questionnaire.question_count && (
                  <span className="question-count">{questionnaire.question_count} questions</span>
                )}
              </div>

              {questionnaire.description && (
                <p className="card-description">{questionnaire.description}</p>
              )}

              <div className="card-meta">
                <div className="meta-item">
                  <span className="meta-label">Créé par:</span>
                  <span className="meta-value">
                    {questionnaire.created_by?.first_name} {questionnaire.created_by?.last_name}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Date:</span>
                  <span className="meta-value">
                    {new Date(questionnaire.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleStartQuestionnaire(questionnaire.id)}
                className="start-button"
              >
                Commencer ce questionnaire
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableQuestionnaires;
