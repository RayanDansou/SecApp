import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import questionnaireService from '../../services/questionnaireService';
import StatusBadge from '../../components/questionnaires/StatusBadge';
import StatusHistory from '../../components/questionnaires/StatusHistory';
import CommentsList from '../../components/questionnaires/CommentsList';
import DocumentsManager from '../../components/questionnaires/DocumentsManager';
import './ResponseDetail.css';

const ResponseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [response, setResponse] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResponse();
  }, [id]);

  const loadResponse = async () => {
    try {
      const data = await questionnaireService.getResponse(id);
      setResponse(data);
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.error || 'Erreur lors du chargement de la réponse');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="response-detail">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="response-detail">
        <div className="error-message">Réponse non trouvée</div>
        <button onClick={() => navigate('/my-responses')} className="btn-back">
          Retour à mes réponses
        </button>
      </div>
    );
  }

  return (
    <div className="response-detail">
      <div className="page-header">
        <button onClick={() => navigate('/my-responses')} className="btn-back">
          ← Retour
        </button>
        <div className="header-content">
          <h1>{response.questionnaire.title}</h1>
          <StatusBadge status={response.status} />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="response-info">
        <h2>Informations</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Créé par:</span>
            <span className="info-value">
              {response.responder.first_name} {response.responder.last_name}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Date de création:</span>
            <span className="info-value">{formatDate(response.created_at)}</span>
          </div>
          {response.submitted_at && (
            <div className="info-item">
              <span className="info-label">Date de soumission:</span>
              <span className="info-value">{formatDate(response.submitted_at)}</span>
            </div>
          )}
          <div className="info-item">
            <span className="info-label">Dernière modification:</span>
            <span className="info-value">{formatDate(response.updated_at)}</span>
          </div>
        </div>
      </div>

      <div className="questionnaire-info">
        <h2>À propos du questionnaire</h2>
        {response.questionnaire.description && (
          <p className="questionnaire-description">{response.questionnaire.description}</p>
        )}
        <div className="questionnaire-meta">
          <span>Créé par: </span>
          <strong>
            {response.questionnaire.created_by?.first_name} {response.questionnaire.created_by?.last_name}
          </strong>
          <span className="separator">•</span>
          <span>{response.questionnaire.questions?.length || 0} questions</span>
        </div>
      </div>

      <div className="answers-section">
        <h2>Réponses</h2>
        {response.answers && response.answers.length > 0 ? (
          response.answers.map((answer, index) => (
            <div key={answer.id} className="answer-item">
              <div className="answer-header">
                <span className="answer-number">Question {index + 1}</span>
                {answer.question?.is_required && <span className="required-mark">*</span>}
              </div>
              <div className="question-text">{answer.question?.text}</div>
              <div className="answer-text">{answer.answer_text}</div>
            </div>
          ))
        ) : (
          <p className="no-answers">Aucune réponse enregistrée</p>
        )}
      </div>

      <DocumentsManager
        documents={documents}
        onUpload={() => {}}
        onDelete={() => {}}
        canUpload={false}
        canDelete={false}
        title="Documents d'architecture technique"
      />

      {response.questionnaire.documents && response.questionnaire.documents.length > 0 && (
        <DocumentsManager
          documents={response.questionnaire.documents}
          onUpload={() => {}}
          onDelete={() => {}}
          canUpload={false}
          canDelete={false}
          title="Documents de référence du questionnaire"
        />
      )}

      <StatusHistory responseId={response.id} />

      <CommentsList responseId={response.id} />

      {response.status === 'BROUILLON' && (
        <div className="actions">
          <button onClick={() => navigate(`/response/${response.id}/edit`)} className="btn-edit">
            Continuer à remplir
          </button>
        </div>
      )}
    </div>
  );
};

export default ResponseDetail;
