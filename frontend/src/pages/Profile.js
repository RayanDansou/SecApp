import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import './Profile.css';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState('account');

  // État pour les informations du profil
  const [profileData, setProfileData] = useState({
    username: '',
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
  const [loadingPassword, setLoadingPassword] = useState(false);

  // États pour la sauvegarde individuelle des champs
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingFirstName, setSavingFirstName] = useState(false);
  const [savingLastName, setSavingLastName] = useState(false);

  // État pour la suppression de compte
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState('');
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Charger les données du profil
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user]);

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

  // Sauvegarder un champ individuel
  const handleSaveField = async (field, value, setSaving) => {
    setSaving(true);
    setProfileErrors({});
    setProfileSuccess('');

    try {
      const result = await updateProfile({ [field]: value });

      if (result.success) {
        setProfileSuccess(t('profile.fieldUpdated'));
        setTimeout(() => setProfileSuccess(''), 3000);
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
      setSaving(false);
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
      await authService.changePassword(
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
    <div className="settings-container">
      <div className="settings-content">
        {/* Header */}
        <div className="settings-header">
          <h1>{t('profile.settings')}</h1>
          <p>{t('profile.customizeAccount')}</p>
        </div>

        {/* Layout avec sidebar */}
        <div className="settings-layout">
          {/* Sidebar */}
          <div className="settings-sidebar">
            <button
              className={`sidebar-tab ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              {t('profile.account')}
            </button>
            <button
              className={`sidebar-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              {t('profile.security')}
            </button>
          </div>

          {/* Contenu principal */}
          <div className="settings-main">
            {activeTab === 'account' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2>{t('profile.profileSection')}</h2>
                  <p>{t('profile.editProfile')}</p>
                </div>

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

                {/* Username */}
                <div className="field-row">
                  <div className="field-info">
                    <label>{t('auth.username')}</label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      disabled={savingUsername}
                    />
                    <span className="field-hint">{t('profile.usernameHint')}</span>
                  </div>
                  <button
                    className="btn-save"
                    onClick={() => handleSaveField('username', profileData.username, setSavingUsername)}
                    disabled={savingUsername}
                  >
                    {savingUsername ? t('profile.saving') : t('common.save')}
                  </button>
                </div>

                {/* Email */}
                <div className="field-row">
                  <div className="field-info">
                    <label>{t('auth.email')}</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={savingEmail}
                    />
                    <span className="field-hint">{t('profile.emailHint')}</span>
                  </div>
                  <button
                    className="btn-save"
                    onClick={() => handleSaveField('email', profileData.email, setSavingEmail)}
                    disabled={savingEmail}
                  >
                    {savingEmail ? t('profile.saving') : t('common.save')}
                  </button>
                </div>

                {/* First name */}
                <div className="field-row">
                  <div className="field-info">
                    <label>{t('auth.firstName')}</label>
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                      placeholder={t('auth.firstName')}
                      disabled={savingFirstName}
                    />
                  </div>
                  <button
                    className="btn-save"
                    onClick={() => handleSaveField('first_name', profileData.first_name, setSavingFirstName)}
                    disabled={savingFirstName}
                  >
                    {savingFirstName ? t('profile.saving') : t('common.save')}
                  </button>
                </div>

                {/* Last name */}
                <div className="field-row">
                  <div className="field-info">
                    <label>{t('auth.lastName')}</label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                      placeholder={t('auth.lastName')}
                      disabled={savingLastName}
                    />
                  </div>
                  <button
                    className="btn-save"
                    onClick={() => handleSaveField('last_name', profileData.last_name, setSavingLastName)}
                    disabled={savingLastName}
                  >
                    {savingLastName ? t('profile.saving') : t('common.save')}
                  </button>
                </div>

                {/* Account info (read-only) */}
                <div className="field-row read-only">
                  <div className="field-info">
                    <label>{t('auth.role')}</label>
                    <span className="role-badge">{getRoleDisplayName(user?.role)}</span>
                  </div>
                </div>

                <div className="field-row read-only">
                  <div className="field-info">
                    <label>{t('profile.joinedOn')}</label>
                    <span className="info-text">
                      {user?.date_joined ? new Date(user.date_joined).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2>{t('profile.passwordSecurity')}</h2>
                  <p>{t('profile.passwordSecuritySubtitle')}</p>
                </div>

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

                {/* Change Password */}
                <form onSubmit={handlePasswordSubmit} className="password-form">
                  <h3>{t('profile.changePassword')}</h3>

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
                    {loadingPassword ? t('profile.changingPassword') : t('profile.changePassword')}
                  </button>
                </form>

                {/* Danger Zone */}
                <div className="danger-zone-section">
                  <h3>{t('profile.dangerZone')}</h3>
                  <div className="danger-content">
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
            )}
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
              <p className="modal-instruction" dangerouslySetInnerHTML={{
                __html: t('profile.confirmDeleteAccountMessage', { username: user?.username })
              }} />

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
                {loadingDelete ? t('profile.deletingAccount') : t('profile.deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
