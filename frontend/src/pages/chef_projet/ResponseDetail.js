import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Brain } from 'lucide-react';
import questionnaireService from '../../services/questionnaireService';
import StatusBadge from '../../components/questionnaires/StatusBadge';
import StatusHistory from '../../components/questionnaires/StatusHistory';
import CommentsList from '../../components/questionnaires/CommentsList';
import DocumentsManager from '../../components/questionnaires/DocumentsManager';
import AIAnalysisResults from '../../components/questionnaires/AIAnalysisResults';
import ExportButtons from '../../components/ExportButtons';
import './ResponseDetail.css';

const ResponseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [response, setResponse] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  const loadAIAnalyses = async () => {
    try {
      const analyses = await questionnaireService.getAIAnalyses(id);
      if (analyses?.length > 0) {
        setLatestAnalysis(analyses[0]);
      }
    } catch (err) {
      // Silencieux si pas encore d'analyse
      console.log('No AI analyses yet');
    }
  };

  useEffect(() => {
    loadResponse();
    loadAIAnalyses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="response-detail">
        <div className="error-message">{t('errors.notFound')}</div>
        <button onClick={() => navigate('/my-responses')} className="btn-back">
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="response-detail">
      <div className="page-header">
        <button onClick={() => navigate('/my-responses')} className="btn-back">
          ← {t('common.back')}
        </button>
        <div className="header-content">
          <h1>{response.questionnaire.title}</h1>
          <StatusBadge status={response.status} />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="response-info">
        <h2>{t('common.information', { defaultValue: 'Informations' })}</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">{t('questionnaire.createdBy')}:</span>
            <span className="info-value">
              {response.responder.first_name} {response.responder.last_name}
            </span>
          </div>
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

      <div className="questionnaire-info">
        <h2>{t('questionnaire.aboutQuestionnaire', { defaultValue: 'À propos du questionnaire' })}</h2>
        {response.questionnaire.description && (
          <p className="questionnaire-description">{response.questionnaire.description}</p>
        )}
        <div className="questionnaire-meta">
          <span>{t('questionnaire.createdBy')}: </span>
          <strong>
            {response.questionnaire.created_by?.first_name} {response.questionnaire.created_by?.last_name}
          </strong>
          <span className="separator">•</span>
          <span>{t('questionnaire.totalQuestions', { count: response.questionnaire.questions?.length || 0 })}</span>
        </div>
      </div>

      <div className="answers-section">
        <h2>{t('questionnaire.answers')}</h2>
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

      {/* AI Analysis Section - visible only for VALIDE or REJETE status */}
      {(response.status === 'VALIDE' || response.status === 'REJETE') && latestAnalysis && (
        <div className="ai-analysis-section">
          <div className="ai-analysis-header">
            <h2>
              <Brain size={20} />
              {t('aiAnalysis.title', { defaultValue: 'Analyse IA - Cohérence Architecture' })}
            </h2>
          </div>
          <AIAnalysisResults analysis={latestAnalysis} />
        </div>
      )}

      {/* Export Buttons - visible only for VALIDE or REJETE status */}
      <ExportButtons responseId={response.id} status={response.status} />

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

      {response.status === 'BROUILLON' && (
        <div className="actions">
          <button onClick={() => navigate(`/response/${response.id}/edit`)} className="btn-edit">
            {t('questionnaire.continueQuestionnaire')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResponseDetail;
