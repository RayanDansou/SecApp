import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, AlertCircle, Brain } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import './AIAnalysisResults.css';

const AIAnalysisResults = ({ analysis }) => {
  const { t, i18n } = useTranslation();

  if (!analysis) {
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return t('aiAnalysis.excellent', { defaultValue: 'Excellent' });
    if (score >= 60) return t('aiAnalysis.good', { defaultValue: 'Bon' });
    if (score >= 40) return t('aiAnalysis.medium', { defaultValue: 'Moyen' });
    return t('aiAnalysis.low', { defaultValue: 'Faible' });
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle size={18} className="severity-critical" />;
      case 'high':
        return <AlertTriangle size={18} className="severity-high" />;
      case 'medium':
        return <AlertTriangle size={18} className="severity-medium" />;
      default:
        return <AlertCircle size={18} className="severity-low" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityClass = `priority-${priority}`;
    return <span className={`priority-badge ${priorityClass}`}>{priority.toUpperCase()}</span>;
  };

  return (
    <div className="ai-analysis-results">
      <div className="analysis-header">
        <div className="header-title">
          <Brain size={24} className="brain-icon" />
          <h2>{t('aiAnalysis.title', { defaultValue: 'Analyse IA - Cohérence Architecture' })}</h2>
        </div>
        <div className="analysis-meta">
          <span className="model-badge">
            {analysis.model_used}
          </span>
          <span className="analysis-date">
            {formatDate(analysis.created_at, i18n.language)}
          </span>
          {analysis.processing_time && (
            <span className="processing-time">
              {t('aiAnalysis.processingTime', { defaultValue: 'Temps de traitement' })}: {analysis.processing_time.toFixed(2)}s
            </span>
          )}
        </div>
      </div>

      {/* Score Global de Cohérence */}
      <div className="coherence-section">
        <h3>{t('aiAnalysis.coherenceScore', { defaultValue: 'Score de Cohérence Global' })}</h3>
        <div className="coherence-score-container">
          <div className={`coherence-circle ${getScoreColor(analysis.coherence_score)}`}>
            <div className="score-value">{analysis.coherence_score}%</div>
            <div className="score-label">{getScoreLabel(analysis.coherence_score)}</div>
          </div>
          <div className="coherence-description">
            <p>{analysis.analysis_summary}</p>
          </div>
        </div>
      </div>

      {/* Scores CIA */}
      <div className="cia-scores-section">
        <h3>{t('aiAnalysis.ciaScores', { defaultValue: 'Scores de Sécurité (CIA)' })}</h3>
        <div className="cia-scores-grid">
          <div className="cia-score-card">
            <div className="cia-header">
              <Shield size={20} />
              <h4>{t('aiAnalysis.confidentiality', { defaultValue: 'Confidentialité' })}</h4>
            </div>
            <div className="cia-score-bar">
              <div
                className={`cia-score-fill ${getScoreColor(analysis.confidentiality_score)}`}
                style={{ width: `${analysis.confidentiality_score}%` }}
              >
                <span className="cia-score-text">{analysis.confidentiality_score}%</span>
              </div>
            </div>
          </div>

          <div className="cia-score-card">
            <div className="cia-header">
              <CheckCircle size={20} />
              <h4>{t('aiAnalysis.integrity', { defaultValue: 'Intégrité' })}</h4>
            </div>
            <div className="cia-score-bar">
              <div
                className={`cia-score-fill ${getScoreColor(analysis.integrity_score)}`}
                style={{ width: `${analysis.integrity_score}%` }}
              >
                <span className="cia-score-text">{analysis.integrity_score}%</span>
              </div>
            </div>
          </div>

          <div className="cia-score-card">
            <div className="cia-header">
              <TrendingUp size={20} />
              <h4>{t('aiAnalysis.availability', { defaultValue: 'Disponibilité' })}</h4>
            </div>
            <div className="cia-score-bar">
              <div
                className={`cia-score-fill ${getScoreColor(analysis.availability_score)}`}
                style={{ width: `${analysis.availability_score}%` }}
              >
                <span className="cia-score-text">{analysis.availability_score}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incohérences */}
      {analysis.inconsistencies && analysis.inconsistencies.length > 0 && (
        <div className="inconsistencies-section">
          <h3>
            <AlertTriangle size={20} />
            {t('aiAnalysis.inconsistencies', { defaultValue: 'Incohérences Détectées' })}
          </h3>
          <div className="inconsistencies-list">
            {analysis.inconsistencies.map((inconsistency, index) => (
              <div key={index} className={`inconsistency-item severity-${inconsistency.severity}`}>
                <div className="inconsistency-header">
                  {getSeverityIcon(inconsistency.severity)}
                  <h4>{inconsistency.type}</h4>
                </div>
                <p>{inconsistency.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points Forts et Points Faibles */}
      <div className="strengths-weaknesses-section">
        {analysis.strengths && analysis.strengths.length > 0 && (
          <div className="strengths-card">
            <h3>
              <CheckCircle size={20} className="icon-success" />
              {t('aiAnalysis.strengths', { defaultValue: 'Points Forts' })}
            </h3>
            <ul>
              {analysis.strengths.map((strength, index) => (
                <li key={index}>
                  <CheckCircle size={16} className="list-icon" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.weaknesses && analysis.weaknesses.length > 0 && (
          <div className="weaknesses-card">
            <h3>
              <TrendingDown size={20} className="icon-warning" />
              {t('aiAnalysis.weaknesses', { defaultValue: 'Points Faibles' })}
            </h3>
            <ul>
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index}>
                  <TrendingDown size={16} className="list-icon" />
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommandations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>{t('aiAnalysis.recommendations', { defaultValue: 'Recommandations de Sécurité' })}</h3>
          <div className="recommendations-list">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <div className="recommendation-header">
                  {getPriorityBadge(recommendation.priority)}
                  <span className="recommendation-category">{recommendation.category}</span>
                </div>
                <p>{recommendation.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyste */}
      {analysis.analyst && (
        <div className="analyst-info">
          <p>
            {t('aiAnalysis.analyzedBy', { defaultValue: 'Analysé par' })}:{' '}
            <strong>{analysis.analyst.first_name} {analysis.analyst.last_name}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisResults;
