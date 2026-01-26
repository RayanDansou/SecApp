import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import questionnaireService from '../../services/questionnaireService';
import DocumentsManager from '../../components/questionnaires/DocumentsManager';
import './FillQuestionnaire.css';

const FillQuestionnaire = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [questionnaire, setQuestionnaire] = useState(null);
  const [response, setResponse] = useState(null);
  const [answers, setAnswers] = useState({});
  const [documents, setDocuments] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]); // Fichiers en attente d'upload
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Détecter si on est en mode édition ou création
  const isEditMode = location.pathname.includes('/response/') && location.pathname.includes('/edit');

  useEffect(() => {
    loadQuestionnaire();
  }, [id]);

  const loadQuestionnaire = async () => {
    try {
      if (isEditMode) {
        // Mode édition : charger la réponse existante
        const responseData = await questionnaireService.getResponse(id);
        setResponse(responseData);

        // Charger le questionnaire template associé
        const questionnaireData = await questionnaireService.getQuestionnaire(responseData.questionnaire.id);
        setQuestionnaire(questionnaireData);

        // Charger les réponses existantes
        const answersMap = {};
        responseData.answers.forEach(answer => {
          answersMap[answer.question.id] = answer.answer_text;
        });
        setAnswers(answersMap);
        setDocuments(responseData.documents || []);
      } else {
        // Mode création : charger le questionnaire template
        const data = await questionnaireService.getQuestionnaire(id);
        setQuestionnaire(data);

        // Vérifier si l'utilisateur a déjà une réponse en cours
        try {
          const responses = await questionnaireService.getResponses();
          const existingResponse = responses.find(r => r.questionnaire.id === parseInt(id));

          if (existingResponse) {
            setResponse(existingResponse);
            // Charger les réponses existantes
            const responseData = await questionnaireService.getResponse(existingResponse.id);
            const answersMap = {};
            responseData.answers.forEach(answer => {
              answersMap[answer.question.id] = answer.answer_text;
            });
            setAnswers(answersMap);
            setDocuments(responseData.documents || []);
          }
        } catch (err) {
          // Pas de réponse existante, c'est normal
        }
      }
    } catch (err) {
      setError(err.error || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur peut éditer cette réponse
  useEffect(() => {
    if (response && response.status !== 'BROUILLON') {
      setError(t('errors.cannotEditSubmitted', { defaultValue: 'Vous ne pouvez pas modifier un questionnaire qui a été soumis.' }));
      setTimeout(() => {
        navigate('/my-responses');
      }, 2000);
    }
  }, [response]);

  // Debug: logger les fichiers en attente
  useEffect(() => {
    console.log('PendingFiles state changé:', pendingFiles.length, 'fichiers');
  }, [pendingFiles]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const answersData = Object.entries(answers).map(([questionId, answerText]) => ({
        question_id: parseInt(questionId),
        answer_text: answerText
      }));

      let responseId;

      if (response) {
        // Mettre à jour la réponse existante
        await questionnaireService.updateResponse(response.id, { answers: answersData });
        responseId = response.id;
      } else {
        // Créer une nouvelle réponse
        const questionnaireId = isEditMode ? questionnaire.id : parseInt(id);
        const newResponse = await questionnaireService.createResponse({
          questionnaire_id: questionnaireId,
          answers: answersData
        });
        setResponse(newResponse);
        responseId = newResponse.id;
      }

      // Uploader les fichiers en attente
      if (pendingFiles.length > 0) {
        console.log('Upload de', pendingFiles.length, 'fichiers en attente...');
        for (let i = 0; i < pendingFiles.length; i++) {
          const file = pendingFiles[i];
          console.log(`Upload fichier ${i + 1}/${pendingFiles.length}:`, file.name);
          try {
            const doc = await questionnaireService.uploadResponseDocument(responseId, file);
            console.log('Document uploadé:', doc);
            setDocuments(prev => [...prev, doc]);
          } catch (uploadErr) {
            console.error('Erreur upload fichier:', uploadErr);
            throw uploadErr;
          }
        }
        setPendingFiles([]);
      }

      setSuccess(t('questionnaire.draftSaved') + ' ! Redirection...');

      // Redirection vers la liste des réponses
      setTimeout(() => {
        navigate('/my-responses', { state: { message: t('questionnaire.draftSaved') } });
      }, 1500);
    } catch (err) {
      console.error('Erreur dans handleSave:', err);
      setError(err.error || err.message || t('errors.generic'));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    // Vérifier que toutes les questions obligatoires ont une réponse
    const missingRequired = questionnaire.questions.filter(
      q => q.is_required && !answers[q.id]?.trim()
    );

    if (missingRequired.length > 0) {
      setError(`${t('errors.formIncomplete')} (${missingRequired.length} manquantes)`);
      return;
    }

    if (!window.confirm(t('questionnaire.confirmSubmit', { defaultValue: 'Êtes-vous sûr de vouloir soumettre ce questionnaire ? Vous ne pourrez plus le modifier après soumission.' }))) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let responseId = response?.id;

      // Si pas encore de réponse, la créer
      if (!responseId) {
        console.log('Création de la réponse...');
        const answersData = Object.entries(answers).map(([questionId, answerText]) => ({
          question_id: parseInt(questionId),
          answer_text: answerText
        }));

        const questionnaireId = isEditMode ? questionnaire.id : parseInt(id);
        const newResponse = await questionnaireService.createResponse({
          questionnaire_id: questionnaireId,
          answers: answersData
        });
        responseId = newResponse.id;
        setResponse(newResponse);
        console.log('Réponse créée avec ID:', responseId);

        // Uploader les fichiers en attente
        if (pendingFiles.length > 0) {
          console.log('Upload de', pendingFiles.length, 'fichiers en attente...');
          for (let i = 0; i < pendingFiles.length; i++) {
            const file = pendingFiles[i];
            console.log(`Upload fichier ${i + 1}/${pendingFiles.length}:`, file.name);
            try {
              const doc = await questionnaireService.uploadResponseDocument(responseId, file);
              console.log('Document uploadé:', doc);
            } catch (uploadErr) {
              console.error('Erreur upload fichier:', uploadErr);
              throw uploadErr;
            }
          }
          setPendingFiles([]);
          console.log('Tous les fichiers ont été uploadés');
        }
      }

      // Soumettre la réponse
      console.log('Soumission de la réponse...');
      await questionnaireService.submitResponse(responseId);
      console.log('Réponse soumise avec succès');
      navigate('/my-responses', { state: { message: t('questionnaire.responseSubmitted') } });
    } catch (err) {
      console.error('Erreur dans handleSubmit:', err);
      setError(err.error || err.message || t('errors.generic'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocumentUpload = async (file) => {
    if (!response) {
      // Pas encore de réponse : ajouter à la liste des fichiers en attente
      console.log('Ajout fichier en attente:', file.name, 'Type:', file.type, 'Taille:', file.size);
      setPendingFiles(prev => {
        const newFiles = [...prev, file];
        console.log('Fichiers en attente après ajout:', newFiles.length);
        return newFiles;
      });
      setSuccess(t('documents.documentAddedPending', { defaultValue: 'Document ajouté (sera uploadé lors de la soumission)' }));
      setTimeout(() => setSuccess(''), 3000);
      return;
    }

    try {
      const doc = await questionnaireService.uploadResponseDocument(response.id, file);
      setDocuments(prev => [...prev, doc]);
      setSuccess(t('documents.documentUploaded'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      throw err;
    }
  };

  const handleDocumentDelete = async (docId) => {
    // Vérifier si c'est un fichier en attente
    if (typeof docId === 'string' && docId.startsWith('pending-')) {
      const index = parseInt(docId.replace('pending-', ''));
      setPendingFiles(prev => prev.filter((_, i) => i !== index));
      setSuccess(t('documents.documentRemoved', { defaultValue: 'Document retiré' }));
      setTimeout(() => setSuccess(''), 3000);
      return;
    }

    // Sinon, c'est un document déjà uploadé
    try {
      await questionnaireService.deleteResponseDocument(response.id, docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      setSuccess(t('documents.documentDeleted'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      throw err;
    }
  };

  // Combiner documents uploadés et fichiers en attente pour l'affichage
  const allDocuments = [
    ...documents,
    ...pendingFiles.map((file, index) => ({
      id: `pending-${index}`,
      filename: file.name,
      uploaded_at: new Date().toISOString(),
      file: '#', // Pas besoin de l'URL pour les documents en attente
      isPending: true
    }))
  ];

  // Nettoyage des URL d'objets créés
  useEffect(() => {
    return () => {
      // Nettoyer les URL créées pour les fichiers en attente
      pendingFiles.forEach((file) => {
        if (file instanceof File) {
          const url = URL.createObjectURL(file);
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [pendingFiles]);

  if (loading) {
    return (
      <div className="fill-questionnaire">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="fill-questionnaire">
        <div className="error-message">{t('errors.notFound')}</div>
      </div>
    );
  }

  const isReadOnly = response?.status !== 'BROUILLON' && response?.status;

  return (
    <div className="fill-questionnaire">
      <div className="page-header">
        <h1>{questionnaire.title}</h1>
        {questionnaire.description && (
          <p className="description">{questionnaire.description}</p>
        )}
        {questionnaire.created_by && (
          <div className="creator-info">
            {t('questionnaire.createdBy')}: <strong>{questionnaire.created_by.first_name} {questionnaire.created_by.last_name}</strong>
            {questionnaire.created_by.email && <span className="creator-email"> ({questionnaire.created_by.email})</span>}
          </div>
        )}
        {response && (
          <div className="response-status">
            {t('common.status')}: <strong>{response.status_display || response.status}</strong>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="questions-section">
        <h2>{t('questionnaire.questions')}</h2>
        {questionnaire.questions.map((question, index) => (
          <div key={question.id} className="question-item">
            <div className="question-header">
              <span className="question-number">{t('questionnaire.questionNumber', { number: index + 1 })}</span>
              {question.is_required && <span className="required-mark">*</span>}
            </div>
            <div className="question-text">{question.text}</div>
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={isReadOnly ? '' : t('questionnaire.yourAnswer', { defaultValue: 'Votre réponse...' })}
              rows="4"
              disabled={isReadOnly}
              className={question.is_required && !answers[question.id] ? 'missing-required' : ''}
            />
          </div>
        ))}
      </div>

      <DocumentsManager
        documents={allDocuments}
        onUpload={handleDocumentUpload}
        onDelete={handleDocumentDelete}
        canUpload={!isReadOnly}
        canDelete={!isReadOnly}
        title={t('documents.technicalDocuments', { defaultValue: 'Documents d\'architecture technique' })}
      />

      {!isReadOnly && (
        <div className="actions">
          <button onClick={() => navigate('/my-responses')} className="btn-secondary">
            {t('common.cancel')}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? t('common.saving', { defaultValue: 'Sauvegarde...' }) : t('questionnaire.saveDraft')}
          </button>
          <button onClick={handleSubmit} disabled={submitting} className="btn-submit">
            {submitting ? t('common.submitting', { defaultValue: 'Soumission...' }) : t('questionnaire.submitResponse')}
          </button>
        </div>
      )}
    </div>
  );
};

export default FillQuestionnaire;
