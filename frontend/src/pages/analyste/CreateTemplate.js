import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import questionnaireService from '../../services/questionnaireService';
import DocumentsManager from '../../components/questionnaires/DocumentsManager';
import './CreateTemplate.css';

const CreateTemplate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_active: true
  });

  const [questions, setQuestions] = useState([
    { text: '', order: 1, is_required: true }
  ]);

  const [documents, setDocuments] = useState([]);
  const [createdTemplateId, setCreatedTemplateId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      text: '',
      order: questions.length + 1,
      is_required: true
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      setError(t('template.atLeastOneQuestion'));
      setTimeout(() => setError(''), 3000);
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    // Réorganiser les ordres
    newQuestions.forEach((q, i) => q.order = i + 1);
    setQuestions(newQuestions);
  };

  const moveQuestion = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    [newQuestions[index], newQuestions[targetIndex]] =
    [newQuestions[targetIndex], newQuestions[index]];

    // Réorganiser les ordres
    newQuestions.forEach((q, i) => q.order = i + 1);
    setQuestions(newQuestions);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError(t('template.titleRequired'));
      return false;
    }

    if (formData.title.trim().length < 3) {
      setError(t('template.titleMinLength'));
      return false;
    }

    const emptyQuestions = questions.filter(q => !q.text.trim());
    if (emptyQuestions.length > 0) {
      setError(t('template.allQuestionsRequired'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const templateData = {
        ...formData,
        questions: questions.map(q => ({
          text: q.text,
          order: q.order,
          is_required: q.is_required
        }))
      };

      const createdTemplate = await questionnaireService.createQuestionnaire(templateData);
      setCreatedTemplateId(createdTemplate.id);
      setSuccess(t('template.templateCreated') + ' ! Redirection...');

      // Redirection vers la page des templates
      setTimeout(() => {
        navigate('/analyste/my-templates');
      }, 1500);
    } catch (err) {
      setError(err.error || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (file) => {
    if (!createdTemplateId) {
      throw new Error(t('template.createFirst', { defaultValue: 'Veuillez d\'abord créer le template' }));
    }

    try {
      const doc = await questionnaireService.uploadQuestionnaireDocument(createdTemplateId, file);
      setDocuments(prev => [...prev, doc]);
      setSuccess(t('documents.documentUploaded'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      throw err;
    }
  };

  const handleDocumentDelete = async (docId) => {
    try {
      await questionnaireService.deleteQuestionnaireDocument(createdTemplateId, docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      setSuccess(t('documents.documentDeleted'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      throw err;
    }
  };

  const handleFinish = () => {
    navigate('/analyste/submitted-responses');
  };

  return (
    <div className="create-template">
      <div className="page-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← {t('common.back')}
        </button>
        <h1>{t('template.createTemplate')}</h1>
        <p className="subtitle">{t('template.createTemplateSubtitle', { defaultValue: 'Définissez les questions de sécurité pour les chefs de projet' })}</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {!createdTemplateId ? (
        <form onSubmit={handleSubmit} className="template-form">
          <div className="form-section">
            <h2>{t('template.templateInfo')}</h2>

            <div className="form-group">
              <label htmlFor="title">
                {t('template.templateTitle')} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t('template.titlePlaceholder', { defaultValue: 'Ex: Évaluation de sécurité applicative' })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">{t('template.templateDescription')}</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder={t('template.descriptionPlaceholder', { defaultValue: 'Description du questionnaire et de son objectif...' })}
              />
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                <span>{t('template.isActive')}</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h2>{t('questionnaire.questions')} ({questions.length})</h2>
              <button type="button" onClick={addQuestion} className="btn-add">
                + {t('template.addQuestion')}
              </button>
            </div>

            <div className="questions-list">
              {questions.map((question, index) => (
                <div key={index} className="question-item">
                  <div className="question-header">
                    <span className="question-number">{t('questionnaire.questionNumber', { number: index + 1 })}</span>
                    <div className="question-actions">
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, 'up')}
                        disabled={index === 0}
                        className="btn-icon"
                        title={t('template.moveUp')}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, 'down')}
                        disabled={index === questions.length - 1}
                        className="btn-icon"
                        title={t('template.moveDown')}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="btn-icon btn-delete"
                        title={t('template.removeQuestion')}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t('template.questionText')}</label>
                    <textarea
                      value={question.text}
                      onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                      placeholder={t('template.questionPlaceholder', { defaultValue: 'Ex: Le système est-il accessible depuis Internet ?' })}
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={question.is_required}
                        onChange={(e) => handleQuestionChange(index, 'is_required', e.target.checked)}
                      />
                      <span>{t('template.isRequired')}</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t('template.creating') : t('template.createTemplateBtn')}
            </button>
          </div>
        </form>
      ) : (
        <div className="template-created">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h2>{t('template.templateCreated')} !</h2>
            <p>{t('template.templateCreatedMessage')}</p>
          </div>

          <DocumentsManager
            documents={documents}
            onUpload={handleDocumentUpload}
            onDelete={handleDocumentDelete}
            canUpload={true}
            canDelete={true}
            title={t('documents.referenceDocuments')}
          />

          <div className="form-actions">
            <button onClick={handleFinish} className="btn-primary">
              {t('template.finish')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTemplate;
