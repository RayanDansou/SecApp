import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

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
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = "L'email n'est pas valide";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validation du mot de passe
  const validatePassword = () => {
    const errors = {};

    if (!passwordData.old_password) {
      errors.old_password = "L'ancien mot de passe est requis";
    }

    if (!passwordData.new_password) {
      errors.new_password = "Le nouveau mot de passe est requis";
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (!passwordData.new_password2) {
      errors.new_password2 = "La confirmation est requise";
    } else if (passwordData.new_password !== passwordData.new_password2) {
      errors.new_password2 = "Les mots de passe ne correspondent pas";
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
        setProfileSuccess('Profil mis à jour avec succès !');
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
          setProfileErrors({ general: 'Erreur lors de la mise à jour du profil' });
        }
      }
    } catch (err) {
      setProfileErrors({ general: 'Une erreur est survenue' });
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

      setPasswordSuccess('Mot de passe modifié avec succès !');
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
        setPasswordErrors({ general: 'Erreur lors du changement de mot de passe' });
      }
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'CHEF_PROJET': 'Chef de Projet',
      'ANALYSTE': 'Analyste Sécurité',
      'BUSINESS_OWNER': 'Business Owner',
      'ADMIN': 'Administrateur'
    };
    return roleNames[role] || role;
  };

  return (
    <div className="profile-container">
      <nav className="profile-nav">
        <div className="nav-brand">
          <h2>SecApp</h2>
        </div>
        <div className="nav-actions">
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            Retour au Dashboard
          </button>
          <button onClick={handleLogout} className="btn btn-logout">
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="profile-content">
        <div className="profile-header">
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles et votre sécurité</p>
        </div>

        <div className="profile-grid">
          {/* Section Informations du compte */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Informations du compte</h2>
            </div>
            <div className="card-body">
              <div className="info-item">
                <span className="info-label">Nom d'utilisateur</span>
                <span className="info-value">{user?.username}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Rôle</span>
                <span className="role-badge">{getRoleDisplayName(user?.role)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Date d'inscription</span>
                <span className="info-value">
                  {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Section Modifier les informations personnelles */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Informations personnelles</h2>
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
                  <label htmlFor="email">Email</label>
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
                  <label htmlFor="first_name">Prénom</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    disabled={loadingProfile}
                    placeholder="Votre prénom"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Nom</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    disabled={loadingProfile}
                    placeholder="Votre nom"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loadingProfile}
                >
                  {loadingProfile ? 'Mise à jour...' : 'Mettre à jour le profil'}
                </button>
              </form>
            </div>
          </div>

          {/* Section Changer le mot de passe */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Changer le mot de passe</h2>
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
                  <label htmlFor="old_password">Ancien mot de passe</label>
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
                  <label htmlFor="new_password">Nouveau mot de passe</label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    disabled={loadingPassword}
                    placeholder="Minimum 8 caractères"
                    className={passwordErrors.new_password ? 'input-error' : ''}
                  />
                  {passwordErrors.new_password && (
                    <span className="error-message">{passwordErrors.new_password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="new_password2">Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    id="new_password2"
                    name="new_password2"
                    value={passwordData.new_password2}
                    onChange={handlePasswordChange}
                    disabled={loadingPassword}
                    placeholder="Confirmer le mot de passe"
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
                  {loadingPassword ? 'Modification...' : 'Changer le mot de passe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
