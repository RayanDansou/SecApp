import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import './Profile.css';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  // État pour les informations du profil
  const [profileData, setProfileData] = useState({
    email: '',
    first_name: '',
    last_name: '',
  });

  // État pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // État pour la suppression de compte
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState('');
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Charger les données du profil
  useEffect(() => {
    if (user) {
      setProfileData({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user?.username,
      });
    }
  }, [user]);

  // Gestion du formulaire de profil
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
    if (profileErrors[e.target.name]) {
      setProfileErrors({
        ...profileErrors,
        [e.target.name]: null,
      });
    }
    setProfileSuccess('');
  };

  // Gestion du formulaire de mot de passe
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    if (passwordErrors[e.target.name]) {
      setPasswordErrors({
        ...passwordErrors,
        [e.target.name]: null,
      });
    }
    setPasswordSuccess('');
  };

  // Validation du profil
  const validateProfile = () => {
    const errors = {};

    if (!profileData.email.trim()) {
      errors.email = t('errors.formIncomplete');
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = t('errors.validationError');
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validation du mot de passe
  const validatePassword = () => {
    const errors = {};

    if (!passwordData.old_password) {
      errors.old_password = t('errors.formIncomplete');
    }

    if (!passwordData.new_password) {
      errors.new_password = t('errors.formIncomplete');
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = t('errors.validationError');
    }

    if (!passwordData.new_password2) {
      errors.new_password2 = t('errors.formIncomplete');
    } else if (passwordData.new_password !== passwordData.new_password2) {
      errors.new_password2 = t('errors.validationError');
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumettre la modification du profil
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfile()) {
      return;
    }

    setLoadingProfile(true);
    setProfileErrors({});
    setProfileSuccess('');

    try {
      const result = await updateProfile(profileData);

      if (result.success) {
        setProfileSuccess(t('profile.profileUpdated'));
      } else {
        if (result.error) {
          const errors = {};
          Object.keys(result.error).forEach((key) => {
            if (Array.isArray(result.error[key])) {
              errors[key] = result.error[key][0];
            } else {
              errors[key] = result.error[key];
            }
          });
          setProfileErrors(errors);
        } else {
          setProfileErrors({ general: t('errors.generic') });
        }
      }
    } catch (err) {
      setProfileErrors({ general: t('errors.generic') });
    } finally {
      setLoadingProfile(false);
    }
  };

  // Soumettre le changement de mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setLoadingPassword(true);
    setPasswordErrors({});
    setPasswordSuccess('');

    try {
      const result = await authService.changePassword(
        passwordData.old_password,
        passwordData.new_password,
        passwordData.new_password2
      );

      setPasswordSuccess(t('profile.passwordChanged'));
      setPasswordData({
        old_password: '',
        new_password: '',
        new_password2: '',
      });
    } catch (error) {
      if (error.error) {
        setPasswordErrors({ general: error.error });
      } else if (error.old_password) {
        setPasswordErrors({ old_password: Array.isArray(error.old_password) ? error.old_password[0] : error.old_password });
      } else if (error.new_password) {
        setPasswordErrors({ new_password: Array.isArray(error.new_password) ? error.new_password[0] : error.new_password });
      } else {
        setPasswordErrors({ general: t('errors.generic') });
      }
    } finally {
      setLoadingPassword(false);
    }
  };

  const getRoleDisplayName = (role) => {
    return t(`roles.${role}`, role);
  };

  // Ouvrir le modal de confirmation de suppression
  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
    setDeleteConfirmUsername('');
    setDeleteError('');
  };

  // Fermer le modal de confirmation de suppression
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmUsername('');
    setDeleteError('');
  };

  // Supprimer le compte
  const handleDeleteAccount = async () => {
    if (deleteConfirmUsername !== user?.username) {
      setDeleteError(t('profile.usernameDoesNotMatch'));
      return;
    }

    setLoadingDelete(true);
    setDeleteError('');

    try {
      await authService.deleteAccount();
      // Rediriger vers la page de login après suppression
      navigate('/login');
    } catch (error) {
      setDeleteError(error.error || t('errors.generic'));
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <h1>{t('profile.title')}</h1>
          <p>{t('profile.subtitle')}</p>
        </div>

        <div className="profile-grid">
          {/* Section Informations du compte */}
          <div className="profile-card">
            <div className="card-header">
              <h2>{t('profile.accountInfo')}</h2>
            </div>
            <div className="card-body">
              <div className="info-item">
                <span className="info-label">{t('auth.username')}</span>
                <span className="info-value">{user?.username}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('auth.role')}</span>
                <span className="role-badge">{getRoleDisplayName(user?.role)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('profile.joinedOn')}</span>
                <span className="info-value">
                  {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Section Modifier les informations personnelles */}
          <div className="profile-card">
            <div className="card-header">
              <h2>{t('profile.personalInfo')}</h2>
            </div>
            <div className="card-body">
              {profileSuccess && (
                <div className="alert alert-success">
                  {profileSuccess}
                </div>
              )}

              {profileErrors.general && (
                <div className="alert alert-error">
                  {profileErrors.general}
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label htmlFor="email">{t('auth.email')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled={loadingProfile}
                    className={profileErrors.email ? 'input-error' : ''}
                  />
                  {profileErrors.email && (
                    <span className="error-message">{profileErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="first_name">{t('auth.firstName')}</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    disabled={loadingProfile}
                    placeholder={t('auth.firstName')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">{t('auth.lastName')}</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    disabled={loadingProfile}
                    placeholder={t('auth.lastName')}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loadingProfile}
                >
                  {loadingProfile ? t('common.loading') : t('profile.updateProfile')}
                </button>
              </form>
            </div>
          </div>

          {/* Section Changer le mot de passe */}
          <div className="profile-card">
            <div className="card-header">
              <h2>{t('profile.changePassword')}</h2>
            </div>
            <div className="card-body">
              {passwordSuccess && (
                <div className="alert alert-success">
                  {passwordSuccess}
                </div>
              )}

              {passwordErrors.general && (
                <div className="alert alert-error">
                  {passwordErrors.general}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="old_password">{t('profile.currentPassword')}</label>
                  <input
                    type="password"
                    id="old_password"
                    name="old_password"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    disabled={loadingPassword}
                    className={passwordErrors.old_password ? 'input-error' : ''}
                  />
                  {passwordErrors.old_password && (
                    <span className="error-message">{passwordErrors.old_password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="new_password">{t('profile.newPassword')}</label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    disabled={loadingPassword}
                    placeholder={t('auth.password')}
                    className={passwordErrors.new_password ? 'input-error' : ''}
                  />
                  {passwordErrors.new_password && (
                    <span className="error-message">{passwordErrors.new_password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="new_password2">{t('auth.confirmPassword')}</label>
                  <input
                    type="password"
                    id="new_password2"
                    name="new_password2"
                    value={passwordData.new_password2}
                    onChange={handlePasswordChange}
                    disabled={loadingPassword}
                    placeholder={t('auth.confirmPassword')}
                    className={passwordErrors.new_password2 ? 'input-error' : ''}
                  />
                  {passwordErrors.new_password2 && (
                    <span className="error-message">{passwordErrors.new_password2}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loadingPassword}
                >
                  {loadingPassword ? t('common.loading') : t('profile.changePassword')}
                </button>
              </form>
            </div>
          </div>

          {/* Section Zone dangereuse */}
          <div className="profile-card danger-zone">
            <div className="card-header">
              <h2>{t('profile.dangerZone')}</h2>
            </div>
            <div className="card-body">
              <p className="danger-warning">
                {t('profile.deleteAccountWarning')}
              </p>
              <button
                className="btn btn-danger"
                onClick={handleOpenDeleteModal}
              >
                {t('profile.deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('profile.confirmDeleteAccount')}</h2>
              <button className="modal-close" onClick={handleCloseDeleteModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-warning">
                {t('profile.deleteAccountWarning')}
              </p>
              <p className="modal-instruction">
                {t('profile.confirmDeleteAccountMessage', { username: user?.username })}
              </p>

              {deleteError && (
                <div className="alert alert-error">
                  {deleteError}
                </div>
              )}

              <div className="form-group">
                <input
                  type="text"
                  value={deleteConfirmUsername}
                  onChange={(e) => setDeleteConfirmUsername(e.target.value)}
                  placeholder={user?.username}
                  disabled={loadingDelete}
                  className="delete-confirm-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCloseDeleteModal}
                disabled={loadingDelete}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={loadingDelete || deleteConfirmUsername !== user?.username}
              >
                {loadingDelete ? t('profile.deletingAccount') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
