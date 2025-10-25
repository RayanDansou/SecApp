import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import questionnaireService from '../../services/questionnaireService';
import StatusBadge from '../../components/questionnaires/StatusBadge';
import StatusHistory from '../../components/questionnaires/StatusHistory';
import CommentsList from '../../components/questionnaires/CommentsList';
import DocumentsManager from '../../components/questionnaires/DocumentsManager';
import './AnalysteResponseDetail.css';

const AnalysteResponseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [response, setResponse] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusChange, setStatusChange] = useState({
    new_status: '',
    comment: ''
  });
  const [changingStatus, setChangingStatus] = useState(false);

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

  const getAvailableStatuses = (currentStatus) => {
    const transitions = {
      'SOUMIS': [
        { value: 'EN_ATTENTE', label: 'Mettre en attente' },
        { value: 'REJETE', label: 'Rejeter' }
      ],
      'EN_ATTENTE': [
        { value: 'EN_VALIDATION', label: 'Mettre en validation' },
        { value: 'REJETE', label: 'Rejeter' }
      ],
      'EN_VALIDATION': [
        { value: 'VALIDE', label: 'Valider' },
        { value: 'REJETE', label: 'Rejeter' }
      ]
    };
    return transitions[currentStatus] || [];
  };

  const handleOpenStatusModal = (newStatus) => {
    setStatusChange({ new_status: newStatus, comment: '' });
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setStatusChange({ new_status: '', comment: '' });
    setError('');
  };

  const handleStatusChange = async () => {
    if (!statusChange.new_status) {
      setError('Veuillez sélectionner un statut');
      return;
    }

    // Demander confirmation
    const confirmMessage = statusChange.new_status === 'REJETE'
      ? 'Êtes-vous sûr de vouloir rejeter ce questionnaire ?'
      : statusChange.new_status === 'VALIDE'
      ? 'Êtes-vous sûr de vouloir valider ce questionnaire ?'
      : 'Êtes-vous sûr de vouloir changer le statut ?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setChangingStatus(true);
    setError('');

    try {
      await questionnaireService.changeResponseStatus(id, statusChange);
      handleCloseStatusModal();
      loadResponse(); // Recharger pour voir le nouveau statut
    } catch (err) {
      setError(err.error || 'Erreur lors du changement de statut');
    } finally {
      setChangingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="analyste-response-detail">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="analyste-response-detail">
        <div className="error-message">Réponse non trouvée</div>
        <button onClick={() => navigate('/analyste/submitted-responses')} className="btn-back">
          Retour aux réponses
        </button>
      </div>
    );
  }

  const availableStatuses = getAvailableStatuses(response.status);

  return (
    <div className="analyste-response-detail">
      <div className="page-header">
        <button onClick={() => navigate('/analyste/submitted-responses')} className="btn-back">
          ← Retour aux réponses
        </button>
        <div className="header-content">
          <div className="header-left">
            <h1>{response.questionnaire.title}</h1>
            <div className="responder-info">
              Chef de projet: <strong>{response.responder.first_name} {response.responder.last_name}</strong>
              <span className="separator">•</span>
              {response.responder.email}
            </div>
          </div>
          <div className="header-right">
            <StatusBadge status={response.status} />
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Actions de changement de statut */}
      {availableStatuses.length > 0 && (
        <div className="status-actions">
          <h3>Actions disponibles</h3>
          <div className="action-buttons">
            {availableStatuses.map((statusOption) => (
              <button
                key={statusOption.value}
                onClick={() => handleOpenStatusModal(statusOption.value)}
                className={`btn-status ${statusOption.value === 'VALIDE' ? 'btn-validate' : statusOption.value === 'REJETE' ? 'btn-reject' : 'btn-pending'}`}
              >
                {statusOption.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="response-info">
        <h2>Informations</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Créé le:</span>
            <span className="info-value">{formatDate(response.created_at)}</span>
          </div>
          {response.submitted_at && (
            <div className="info-item">
              <span className="info-label">Soumis le:</span>
              <span className="info-value">{formatDate(response.submitted_at)}</span>
            </div>
          )}
          <div className="info-item">
            <span className="info-label">Dernière modification:</span>
            <span className="info-value">{formatDate(response.updated_at)}</span>
          </div>
        </div>
      </div>

      <div className="answers-section">
        <h2>Réponses du chef de projet</h2>
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

      {/* Modal de changement de statut */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={handleCloseStatusModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Changer le statut</h3>
              <button onClick={handleCloseStatusModal} className="modal-close">×</button>
            </div>

            <div className="modal-body">
              <div className="status-change-info">
                <div className="status-flow">
                  <StatusBadge status={response.status} />
                  <span className="arrow">→</span>
                  <StatusBadge status={statusChange.new_status} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="comment">
                  Commentaire {statusChange.new_status === 'REJETE' && <span className="required">*</span>}
                </label>
                <textarea
                  id="comment"
                  value={statusChange.comment}
                  onChange={(e) => setStatusChange(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder={
                    statusChange.new_status === 'VALIDE'
                      ? 'Ajoutez vos recommandations ou validations...'
                      : statusChange.new_status === 'REJETE'
                      ? 'Expliquez les raisons du rejet...'
                      : 'Ajoutez un commentaire...'
                  }
                  rows="5"
                  required={statusChange.new_status === 'REJETE'}
                />
              </div>

              {statusChange.new_status === 'REJETE' && !statusChange.comment.trim() && (
                <div className="warning-message">
                  Un commentaire est obligatoire pour un rejet
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={handleCloseStatusModal} className="btn-secondary" disabled={changingStatus}>
                Annuler
              </button>
              <button
                onClick={handleStatusChange}
                className="btn-primary"
                disabled={changingStatus || (statusChange.new_status === 'REJETE' && !statusChange.comment.trim())}
              >
                {changingStatus ? 'Changement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysteResponseDetail;
