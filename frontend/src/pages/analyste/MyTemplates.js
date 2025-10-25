import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import questionnaireService from '../../services/questionnaireService';
import StatusBadge from '../../components/questionnaires/StatusBadge';
import './MyTemplates.css';

const MyTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await questionnaireService.getQuestionnaires();
      setTemplates(data);
    } catch (err) {
      setError(err.error || 'Erreur lors du chargement des templates');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await questionnaireService.updateQuestionnaire(id, { is_active: !currentStatus });
      setTemplates(templates.map(t =>
        t.id === id ? { ...t, is_active: !currentStatus } : t
      ));
    } catch (err) {
      setError(err.error || 'Erreur lors de la modification du template');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      return;
    }

    try {
      await questionnaireService.deleteQuestionnaire(id);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      setError(err.error || 'Erreur lors de la suppression du template');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFilteredTemplates = () => {
    if (filter === 'all') return templates;
    if (filter === 'active') return templates.filter(t => t.is_active);
    if (filter === 'inactive') return templates.filter(t => !t.is_active);
    return templates;
  };

  const filteredTemplates = getFilteredTemplates();

  if (loading) {
    return (
      <div className="my-templates">
        <div className="loading">Chargement des templates...</div>
      </div>
    );
  }

  return (
    <div className="my-templates">
      <div className="page-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Retour au tableau de bord
        </button>
        <div className="header-content">
          <h1>Mes templates</h1>
          <p className="subtitle">Gérez vos questionnaires de sécurité</p>
        </div>
        <button onClick={() => navigate('/analyste/create-template')} className="btn-create">
          + Créer un template
        </button>
      </div>

      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tous ({templates.length})
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Actifs ({templates.filter(t => t.is_active).length})
        </button>
        <button
          className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
          onClick={() => setFilter('inactive')}
        >
          Inactifs ({templates.filter(t => !t.is_active).length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredTemplates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>Aucun template</h2>
          <p>
            {filter === 'all'
              ? "Vous n'avez pas encore créé de template"
              : `Aucun template ${filter === 'active' ? 'actif' : 'inactif'}`}
          </p>
          <button onClick={() => navigate('/analyste/create-template')} className="btn-primary">
            Créer mon premier template
          </button>
        </div>
      ) : (
        <div className="templates-list">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="template-card">
              <div className="card-header">
                <div className="card-title-section">
                  <h3>{template.title}</h3>
                  <div className="status-indicator">
                    {template.is_active ? (
                      <span className="badge badge-active">Actif</span>
                    ) : (
                      <span className="badge badge-inactive">Inactif</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-body">
                {template.description && (
                  <p className="template-description">{template.description}</p>
                )}

                <div className="card-meta">
                  <div className="meta-row">
                    <span className="meta-label">Questions:</span>
                    <span className="meta-value">{template.question_count || 0}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Documents:</span>
                    <span className="meta-value">{template.document_count || template.documents?.length || 0}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Créé le:</span>
                    <span className="meta-value">{formatDate(template.created_at)}</span>
                  </div>
                  {template.updated_at && (
                    <div className="meta-row">
                      <span className="meta-label">Modifié le:</span>
                      <span className="meta-value">{formatDate(template.updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => handleToggleActive(template.id, template.is_active)}
                  className={`btn-toggle ${template.is_active ? 'btn-deactivate' : 'btn-activate'}`}
                >
                  {template.is_active ? 'Désactiver' : 'Activer'}
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="btn-delete"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTemplates;
