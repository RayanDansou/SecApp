import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './RoleSelectionModal.css';

const RoleSelectionModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState('CHEF_PROJET');

  const handleConfirm = () => {
    onConfirm(selectedRole);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choisissez votre rôle</h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Veuillez sélectionner le rôle qui correspond à votre fonction dans l'application.
          </p>

          <div className="role-options">
            <label className={`role-option ${selectedRole === 'CHEF_PROJET' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="role"
                value="CHEF_PROJET"
                checked={selectedRole === 'CHEF_PROJET'}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={loading}
              />
              <div className="role-info">
                <div className="role-title">{t('roles.CHEF_PROJET')}</div>
                <div className="role-description">
                  Créer et soumettre des questionnaires de sécurité pour vos projets
                </div>
              </div>
            </label>

            <label className={`role-option ${selectedRole === 'ANALYSTE' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="role"
                value="ANALYSTE"
                checked={selectedRole === 'ANALYSTE'}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={loading}
              />
              <div className="role-info">
                <div className="role-title">{t('roles.ANALYSTE')}</div>
                <div className="role-description">
                  Valider les questionnaires et fournir des recommandations de sécurité
                </div>
              </div>
            </label>

            <label className={`role-option ${selectedRole === 'BUSINESS_OWNER' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="role"
                value="BUSINESS_OWNER"
                checked={selectedRole === 'BUSINESS_OWNER'}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={loading}
              />
              <div className="role-info">
                <div className="role-title">{t('roles.BUSINESS_OWNER')}</div>
                <div className="role-description">
                  Consulter les questionnaires validés et les recommandations
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Création du compte...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
