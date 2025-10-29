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
  const [loadingProfile, setLoadingProfile] = useState(false);
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
    <div className="settings-container">
      <div className="settings-content">
        {/* Header */}
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Customize your account and preferences.</p>
        </div>

        {/* Layout avec sidebar */}
        <div className="settings-layout">
          {/* Sidebar */}
          <div className="settings-sidebar">
            <button
              className={`sidebar-tab ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              Account
            </button>
            <button
              className={`sidebar-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>

          {/* Contenu principal */}
          <div className="settings-main">
            {activeTab === 'account' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2>Profile</h2>
                  <p>Edit your profile and information.</p>
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
                    <label>Username</label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      disabled={savingUsername}
                    />
                    <span className="field-hint">Your username will be visible to everyone.</span>
                  </div>
                  <button
                    className="btn-save"
                    onClick={() => handleSaveField('username', profileData.username, setSavingUsername)}
                    disabled={savingUsername}
                  >
                    {savingUsername ? 'Saving...' : 'Save'}
                  </button>
                </div>

                {/* Email */}
                <div className="field-row">
                  <div className="field-info">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={savingEmail}
                    />
                    <span className="field-hint">Your email is used for login and password recovery.</span>
                  </div>
                  <button
                    className="btn-save"
                    onClick={() => handleSaveField('email', profileData.email, setSavingEmail)}
                    disabled={savingEmail}
                  >
                    {savingEmail ? 'Saving...' : 'Save'}
                  </button>
                </div>

                {/* First name */}
                <div className="field-row">
                  <div className="field-info">
                    <label>First name</label>
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                      placeholder="First name"
                      disabled={savingFirstName}
                    />
                  </div>
                  <button
                    className="btn-save"
                    onClick={() => handleSaveField('first_name', profileData.first_name, setSavingFirstName)}
                    disabled={savingFirstName}
                  >
                    {savingFirstName ? 'Saving...' : 'Save'}
                  </button>
                </div>

                {/* Last name */}
                <div className="field-row">
                  <div className="field-info">
                    <label>Last name</label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                      placeholder="Last name"
                      disabled={savingLastName}
                    />
                  </div>
                  <button
                    className="btn-save"
                    onClick={() => handleSaveField('last_name', profileData.last_name, setSavingLastName)}
                    disabled={savingLastName}
                  >
                    {savingLastName ? 'Saving...' : 'Save'}
                  </button>
                </div>

                {/* Account info (read-only) */}
                <div className="field-row read-only">
                  <div className="field-info">
                    <label>Role</label>
                    <span className="role-badge">{getRoleDisplayName(user?.role)}</span>
                  </div>
                </div>

                <div className="field-row read-only">
                  <div className="field-info">
                    <label>Joined on</label>
                    <span className="info-text">
                      {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2>Password & Security</h2>
                  <p>Manage your password and account security.</p>
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
                  <h3>Change Password</h3>

                  <div className="form-group">
                    <label htmlFor="old_password">Current password</label>
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
                    <label htmlFor="new_password">New password</label>
                    <input
                      type="password"
                      id="new_password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      disabled={loadingPassword}
                      placeholder="Password"
                      className={passwordErrors.new_password ? 'input-error' : ''}
                    />
                    {passwordErrors.new_password && (
                      <span className="error-message">{passwordErrors.new_password}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="new_password2">Confirm password</label>
                    <input
                      type="password"
                      id="new_password2"
                      name="new_password2"
                      value={passwordData.new_password2}
                      onChange={handlePasswordChange}
                      disabled={loadingPassword}
                      placeholder="Confirm password"
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
                    {loadingPassword ? 'Changing...' : 'Change password'}
                  </button>
                </form>

                {/* Danger Zone */}
                <div className="danger-zone-section">
                  <h3>Danger Zone</h3>
                  <div className="danger-content">
                    <p className="danger-warning">
                      This action is irreversible. All your data will be permanently deleted.
                    </p>
                    <button
                      className="btn btn-danger"
                      onClick={handleOpenDeleteModal}
                    >
                      Delete my account
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
              <h2>Confirm Account Deletion</h2>
              <button className="modal-close" onClick={handleCloseDeleteModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-warning">
                This action is irreversible. All your data will be permanently deleted.
              </p>
              <p className="modal-instruction">
                Please type <strong>{user?.username}</strong> to confirm deletion.
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
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={loadingDelete || deleteConfirmUsername !== user?.username}
              >
                {loadingDelete ? 'Deleting...' : 'Delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
