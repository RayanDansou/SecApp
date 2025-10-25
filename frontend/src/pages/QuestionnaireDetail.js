import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import questionnaireService from '../services/questionnaireService';
import './QuestionnaireDetail.css';

const QuestionnaireDetail = () => {
  const { id } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    loadQuestionnaire();
  }, [id]);

  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      const data = await questionnaireService.getQuestionnaire(id);
      setQuestionnaire(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du questionnaire');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await questionnaireService.deleteQuestionnaire(id);
      navigate('/questionnaires');
    } catch (err) {
      setError('Erreur lors de la suppression du questionnaire');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'BROUILLON': 'status-brouillon',
      'SOUMIS': 'status-soumis',
      'EN_ANALYSE': 'status-en-analyse',
      'VALIDE': 'status-valide',
      'REJETE': 'status-rejete'
    };
    return classes[status] || 'status-default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="detail-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !questionnaire) {
    return (
      <div className="detail-container">
        <div className="error-container">
          <h2>Erreur</h2>
          <p>{error || 'Questionnaire non trouvé'}</p>
          <button onClick={() => navigate('/questionnaires')} className="btn btn-primary">
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <nav className="detail-nav">
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

      <div className="detail-content">
        <div className="detail-header">
          <div className="header-left">
            <button onClick={() => navigate('/questionnaires')} className="back-button">
              ← Retour
            </button>
            <h1>{questionnaire.title}</h1>
            <span className={`status-badge ${getStatusBadgeClass(questionnaire.status)}`}>
              {questionnaire.status_display}
            </span>
          </div>
          <div className="header-actions">
            <button
              onClick={() => navigate(`/questionnaires/${id}/edit`)}
              className="btn btn-edit"
            >
              ✏️ Modifier
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="btn btn-delete"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <div className="card-header">
              <h2>Informations générales</h2>
            </div>
            <div className="card-body">
              <div className="info-item">
                <span className="info-label">Titre</span>
                <span className="info-value">{questionnaire.title}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Statut</span>
                <span className={`status-badge ${getStatusBadgeClass(questionnaire.status)}`}>
                  {questionnaire.status_display}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Propriétaire</span>
                <span className="info-value">{questionnaire.owner.username}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{questionnaire.owner.email}</span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <div className="card-header">
              <h2>Dates</h2>
            </div>
            <div className="card-body">
              <div className="info-item">
                <span className="info-label">Créé le</span>
                <span className="info-value">{formatDate(questionnaire.created_at)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Modifié le</span>
                <span className="info-value">{formatDate(questionnaire.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de confirmation de suppression */}
        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Confirmer la suppression</h3>
              <p>Êtes-vous sûr de vouloir supprimer ce questionnaire ? Cette action est irréversible.</p>
              <div className="modal-actions">
                <button onClick={() => setDeleteConfirm(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button onClick={handleDelete} className="btn btn-delete">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireDetail;
