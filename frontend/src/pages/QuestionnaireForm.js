import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import questionnaireService from '../services/questionnaireService';
import './QuestionnaireForm.css';

const QuestionnaireForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    status: 'BROUILLON',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      loadQuestionnaire();
    }
  }, [id]);

  const loadQuestionnaire = async () => {
    try {
      setLoadingData(true);
      const data = await questionnaireService.getQuestionnaire(id);
      setFormData({
        title: data.title,
        status: data.status,
      });
    } catch (err) {
      console.error(err);
      navigate('/questionnaires');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Le titre doit contenir au moins 3 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (isEditMode) {
        await questionnaireService.updateQuestionnaire(id, formData);
      } else {
        await questionnaireService.createQuestionnaire(formData);
      }
      navigate('/questionnaires');
    } catch (err) {
      if (err.title) {
        setErrors({ title: Array.isArray(err.title) ? err.title[0] : err.title });
      } else {
        setErrors({ general: err.error || 'Une erreur est survenue' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loadingData) {
    return (
      <div className="form-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <nav className="form-nav">
        <div className="nav-brand">
          <h2>SecApp</h2>
        </div>
        <div className="nav-actions">
          <button onClick={() => navigate('/questionnaires')} className="btn btn-secondary">
            Mes Questionnaires
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            Dashboard
          </button>
          <button onClick={handleLogout} className="btn btn-logout">
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="form-content">
        <div className="form-header">
          <button onClick={() => navigate('/questionnaires')} className="back-button">
            ← Retour
          </button>
          <h1>{isEditMode ? 'Modifier le questionnaire' : 'Nouveau questionnaire'}</h1>
          <p>{isEditMode ? 'Modifiez les informations du questionnaire' : 'Créez un nouveau questionnaire de sécurité'}</p>
        </div>

        <div className="form-card">
          {errors.general && (
            <div className="alert alert-error">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">
                Titre du questionnaire <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                placeholder="Ex: Projet CRM Interne"
                className={errors.title ? 'input-error' : ''}
                autoFocus
              />
              {errors.title && (
                <span className="error-message">{errors.title}</span>
              )}
              <span className="field-help">
                Donnez un titre clair et descriptif à votre questionnaire
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="status">
                Statut <span className="required">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="BROUILLON">Brouillon</option>
                <option value="SOUMIS">Soumis</option>
                <option value="EN_ANALYSE">En cours d'analyse</option>
                <option value="VALIDE">Validé</option>
                <option value="REJETE">Rejeté</option>
              </select>
              <span className="field-help">
                Sélectionnez le statut approprié pour ce questionnaire
              </span>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/questionnaires')}
                className="btn btn-cancel"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Créer le questionnaire')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireForm;
