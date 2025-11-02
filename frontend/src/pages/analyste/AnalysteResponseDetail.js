import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Brain, Loader } from 'lucide-react';
import questionnaireService from '../../services/questionnaireService';
import StatusBadge from '../../components/questionnaires/StatusBadge';
import StatusHistory from '../../components/questionnaires/StatusHistory';
import CommentsList from '../../components/questionnaires/CommentsList';
import DocumentsManager from '../../components/questionnaires/DocumentsManager';
import AIAnalysisResults from '../../components/questionnaires/AIAnalysisResults';
import './AnalysteResponseDetail.css';

const AnalysteResponseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  // AI Analysis state
  const [aiAnalyses, setAiAnalyses] = useState([]);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [analyzingWithAI, setAnalyzingWithAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('fr');

  useEffect(() => {
    loadResponse();
    loadAIAnalyses();
  }, [id]);

  const loadResponse = async () => {
    try {
      const data = await questionnaireService.getResponse(id);
      setResponse(data);
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.error || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const loadAIAnalyses = async () => {
    try {
      const analyses = await questionnaireService.getAIAnalyses(id);
      setAiAnalyses(analyses);
      if (analyses && analyses.length > 0) {
        setLatestAnalysis(analyses[0]); // La plus récente en premier
      }
    } catch (err) {
      // Silencieux si pas encore d'analyse
      console.log('No AI analyses yet');
    }
  };

  const handleAIAnalysis = async () => {
    setAnalyzingWithAI(true);
    setAiError('');

    try {
      const analysis = await questionnaireService.triggerAIAnalysis(id, selectedLanguage);
      setLatestAnalysis(analysis);
      setAiAnalyses([analysis, ...aiAnalyses]);
    } catch (err) {
      setAiError(err.error || t('aiAnalysis.error', { defaultValue: 'Erreur lors de l\'analyse IA' }));
    } finally {
      setAnalyzingWithAI(false);
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
        { value: 'EN_ATTENTE', label: t('analyste.setPending', { defaultValue: 'Mettre en attente' }) },
        { value: 'REJETE', label: t('analyste.reject') }
      ],
      'EN_ATTENTE': [
        { value: 'EN_VALIDATION', label: t('analyste.setInValidation', { defaultValue: 'Mettre en validation' }) },
        { value: 'REJETE', label: t('analyste.reject') }
      ],
      'EN_VALIDATION': [
        { value: 'VALIDE', label: t('analyste.validate') },
        { value: 'REJETE', label: t('analyste.reject') }
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
      setError(t('errors.selectStatus', { defaultValue: 'Veuillez sélectionner un statut' }));
      return;
    }

    // Demander confirmation
    const confirmMessage = statusChange.new_status === 'REJETE'
      ? t('analyste.confirmReject', { defaultValue: 'Êtes-vous sûr de vouloir rejeter ce questionnaire ?' })
      : statusChange.new_status === 'VALIDE'
      ? t('analyste.confirmValidate', { defaultValue: 'Êtes-vous sûr de vouloir valider ce questionnaire ?' })
      : t('analyste.confirmStatusChange', { defaultValue: 'Êtes-vous sûr de vouloir changer le statut ?' });

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
      setError(err.error || t('errors.generic'));
    } finally {
      setChangingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="analyste-response-detail">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="analyste-response-detail">
        <div className="error-message">{t('errors.notFound')}</div>
        <button onClick={() => navigate('/analyste/submitted-responses')} className="btn-back">
          {t('common.back')}
        </button>
      </div>
    );
  }

  const availableStatuses = getAvailableStatuses(response.status);

  return (
    <div className="analyste-response-detail">
      <div className="page-header">
        <button onClick={() => navigate('/analyste/submitted-responses')} className="btn-back">
          ← {t('common.back')}
        </button>
        <div className="header-content">
          <div className="header-left">
            <h1>{response.questionnaire.title}</h1>
            <div className="responder-info">
              {t('analyste.projectManager', { defaultValue: 'Chef de projet' })}: <strong>{response.responder.first_name} {response.responder.last_name}</strong>
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

      {/* AI Analysis Section */}
      <div className="ai-analysis-section">
        <div className="ai-analysis-header">
          <h3>
            <Brain size={20} />
            {t('aiAnalysis.title', { defaultValue: 'Analyse IA - Cohérence Architecture' })}
          </h3>

          <div className="ai-analysis-controls">
            {/* Language selector */}
            <div className="language-selector">
              <label>{t('aiAnalysis.selectLanguage', { defaultValue: 'Langue de l\'analyse :' })}</label>
              <div className="language-buttons">
                <button
                  type="button"
                  className={`language-btn ${selectedLanguage === 'fr' ? 'active' : ''}`}
                  onClick={() => setSelectedLanguage('fr')}
                  disabled={analyzingWithAI}
                >
                  Français
                </button>
                <button
                  type="button"
                  className={`language-btn ${selectedLanguage === 'en' ? 'active' : ''}`}
                  onClick={() => setSelectedLanguage('en')}
                  disabled={analyzingWithAI}
                >
                  English
                </button>
              </div>
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAIAnalysis}
              disabled={analyzingWithAI || response?.status === 'BROUILLON'}
              className="btn-ai-analyze"
              title={response?.status === 'BROUILLON' ? t('aiAnalysis.cannotAnalyzeDraft', { defaultValue: 'Impossible d\'analyser un brouillon' }) : ''}
            >
              {analyzingWithAI ? (
                <>
                  <Loader size={18} className="spinner" />
                  {t('aiAnalysis.analyzing', { defaultValue: 'Analyse en cours...' })}
                </>
              ) : (
                <>
                  <Brain size={18} />
                  {latestAnalysis
                    ? t('aiAnalysis.reanalyze', { defaultValue: 'Relancer l\'analyse IA' })
                    : t('aiAnalysis.analyze', { defaultValue: 'Analyser avec IA' })
                  }
                </>
              )}
            </button>
          </div>
        </div>

        {aiError && <div className="error-message">{aiError}</div>}

        {latestAnalysis && (
          <>
            <AIAnalysisResults analysis={latestAnalysis} />

            {/* Quick validation button after AI analysis */}
            {response?.status !== 'VALIDE' && response?.status !== 'REJETE' && (
              <div className="ai-quick-validation">
                <p className="quick-validation-hint">
                  {t('aiAnalysis.quickValidationHint', { defaultValue: 'Analyse terminée. Vous pouvez maintenant valider ou rejeter le questionnaire.' })}
                </p>
                <div className="quick-validation-actions">
                  <button
                    onClick={() => handleOpenStatusModal('VALIDE')}
                    className="btn-quick-validate"
                    disabled={changingStatus}
                  >
                    {t('analyste.validateQuestionnaire', { defaultValue: 'Valider le questionnaire' })}
                  </button>
                  <button
                    onClick={() => handleOpenStatusModal('REJETE')}
                    className="btn-quick-reject"
                    disabled={changingStatus}
                  >
                    {t('analyste.rejectQuestionnaire', { defaultValue: 'Rejeter le questionnaire' })}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {!latestAnalysis && !analyzingWithAI && (
          <div className="ai-analysis-placeholder">
            <Brain size={48} />
            <p>{t('aiAnalysis.noAnalysisYet', { defaultValue: 'Aucune analyse IA disponible. Cliquez sur le bouton ci-dessus pour déclencher une analyse.' })}</p>
          </div>
        )}
      </div>

      {/* Actions de changement de statut */}
      {availableStatuses.length > 0 && (
        <div className="status-actions">
          <h3>{t('analyste.validationActions')}</h3>
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
        <h2>{t('common.information', { defaultValue: 'Informations' })}</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">{t('common.date')}:</span>
            <span className="info-value">{formatDate(response.created_at)}</span>
          </div>
          {response.submitted_at && (
            <div className="info-item">
              <span className="info-label">{t('questionnaire.submittedOn')}:</span>
              <span className="info-value">{formatDate(response.submitted_at)}</span>
            </div>
          )}
          <div className="info-item">
            <span className="info-label">{t('questionnaire.lastModified')}:</span>
            <span className="info-value">{formatDate(response.updated_at)}</span>
          </div>
        </div>
      </div>

      <div className="answers-section">
        <h2>{t('analyste.projectManagerAnswers', { defaultValue: 'Réponses du chef de projet' })}</h2>
        {response.answers && response.answers.length > 0 ? (
          response.answers.map((answer, index) => (
            <div key={answer.id} className="answer-item">
              <div className="answer-header">
                <span className="answer-number">{t('questionnaire.questionNumber', { number: index + 1 })}</span>
                {answer.question?.is_required && <span className="required-mark">*</span>}
              </div>
              <div className="question-text">{answer.question?.text}</div>
              <div className="answer-text">{answer.answer_text}</div>
            </div>
          ))
        ) : (
          <p className="no-answers">{t('questionnaire.noResponses')}</p>
        )}
      </div>

      <DocumentsManager
        documents={documents}
        onUpload={() => {}}
        onDelete={() => {}}
        canUpload={false}
        canDelete={false}
        title={t('documents.technicalDocuments', { defaultValue: 'Documents d\'architecture technique' })}
      />

      {response.questionnaire.documents && response.questionnaire.documents.length > 0 && (
        <DocumentsManager
          documents={response.questionnaire.documents}
          onUpload={() => {}}
          onDelete={() => {}}
          canUpload={false}
          canDelete={false}
          title={t('documents.referenceDocuments')}
        />
      )}

      <StatusHistory responseId={response.id} />

      <CommentsList responseId={response.id} />

      {/* Modal de changement de statut */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={handleCloseStatusModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('analyste.changeStatus', { defaultValue: 'Changer le statut' })}</h3>
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
                  {t('analyste.comment')} {statusChange.new_status === 'REJETE' && <span className="required">*</span>}
                </label>
                <textarea
                  id="comment"
                  value={statusChange.comment}
                  onChange={(e) => setStatusChange(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder={
                    statusChange.new_status === 'VALIDE'
                      ? t('analyste.commentPlaceholderValidate', { defaultValue: 'Ajoutez vos recommandations ou validations...' })
                      : statusChange.new_status === 'REJETE'
                      ? t('analyste.commentPlaceholderReject', { defaultValue: 'Expliquez les raisons du rejet...' })
                      : t('analyste.commentPlaceholder')
                  }
                  rows="5"
                  required={statusChange.new_status === 'REJETE'}
                />
              </div>

              {statusChange.new_status === 'REJETE' && !statusChange.comment.trim() && (
                <div className="warning-message">
                  {t('analyste.commentRequiredForReject', { defaultValue: 'Un commentaire est obligatoire pour un rejet' })}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={handleCloseStatusModal} className="btn-secondary" disabled={changingStatus}>
                {t('common.cancel')}
              </button>
              <button
                onClick={handleStatusChange}
                className="btn-primary"
                disabled={changingStatus || (statusChange.new_status === 'REJETE' && !statusChange.comment.trim())}
              >
                {changingStatus ? t('analyste.changing', { defaultValue: 'Changement...' }) : t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysteResponseDetail;
