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
          <h2>{t('roleSelection.title')}</h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            {t('roleSelection.description')}
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
                  {t('roleSelection.descriptions.CHEF_PROJET')}
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
                  {t('roleSelection.descriptions.ANALYSTE')}
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
                  {t('roleSelection.descriptions.BUSINESS_OWNER')}
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
            {t('common.cancel')}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? t('auth.registering') : t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
