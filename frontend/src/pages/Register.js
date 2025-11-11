import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import Logo from '../components/Logo';
import RoleSelectionModal from '../components/RoleSelectionModal';
import './Register.css';

const Register = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: 'CHEF_PROJET', // Rôle par défaut
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Effacer l'erreur du champ modifié
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation username
    if (!formData.username.trim()) {
      newErrors.username = t('errors.formIncomplete');
    } else if (formData.username.length < 3) {
      newErrors.username = t('errors.validationError');
    }

    // Validation email
    if (!formData.email.trim()) {
      newErrors.email = t('errors.formIncomplete');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('errors.validationError');
    }

    // Validation password
    if (!formData.password) {
      newErrors.password = t('errors.formIncomplete');
    } else if (formData.password.length < 8) {
      newErrors.password = t('errors.validationError');
    }

    // Validation password2
    if (!formData.password2) {
      newErrors.password2 = t('errors.formIncomplete');
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = t('errors.validationError');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation côté client
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await register(formData);

      if (result.success) {
        // Rediriger vers le dashboard après inscription réussie
        navigate('/dashboard');
      } else {
        // Gérer les erreurs du serveur
        if (result.error) {
          const serverErrors = {};

          // Mapper les erreurs du serveur
          Object.keys(result.error).forEach((key) => {
            if (Array.isArray(result.error[key])) {
              serverErrors[key] = result.error[key][0];
            } else {
              serverErrors[key] = result.error[key];
            }
          });

          setErrors(serverErrors);
        } else {
          setErrors({ general: t('errors.generic') });
        }
      }
    } catch (err) {
      setErrors({ general: t('errors.generic') });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    // Stocker le credential et ouvrir le modal de sélection de rôle
    setGoogleCredential(credentialResponse.credential);
    setShowRoleModal(true);
    setErrors({});
  };

  const handleGoogleError = () => {
    setErrors({ general: 'Erreur lors de l\'inscription avec Google' });
  };

  const handleRoleConfirm = async (selectedRole) => {
    setLoading(true);
    setErrors({});

    try {
      const result = await authService.googleRegister(
        googleCredential,
        selectedRole
      );

      if (result.user && result.tokens) {
        // Fermer le modal et recharger le contexte d'authentification
        setShowRoleModal(false);
        window.location.href = '/dashboard';
      } else {
        setErrors({ general: t('errors.generic') });
        setShowRoleModal(false);
      }
    } catch (err) {
      setErrors({ general: err.error || t('errors.generic') });
      setShowRoleModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleModalClose = () => {
    if (!loading) {
      setShowRoleModal(false);
      setGoogleCredential(null);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <Logo size={60} showText={true} />
          </div>
          <p>{t('auth.registerSubtitle')}</p>
        </div>

        {errors.general && (
          <div className="alert alert-error">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">
                {t('auth.username')} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                placeholder={t('auth.username')}
                className={errors.username ? 'input-error' : ''}
              />
              {errors.username && (
                <span className="error-message">{errors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                {t('auth.email')} <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                placeholder={t('auth.email')}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">{t('auth.firstName')}</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={loading}
                placeholder={t('auth.firstName')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">{t('auth.lastName')}</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={loading}
                placeholder={t('auth.lastName')}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">
              {t('auth.role')} <span className="required">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="CHEF_PROJET">{t('roles.CHEF_PROJET')}</option>
              <option value="ANALYSTE">{t('roles.ANALYSTE')}</option>
              <option value="BUSINESS_OWNER">{t('roles.BUSINESS_OWNER')}</option>
              <option value="ADMIN">{t('roles.ADMIN')}</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                {t('auth.password')} <span className="required">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                placeholder={t('auth.password')}
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password2">
                {t('auth.confirmPassword')} <span className="required">*</span>
              </label>
              <input
                type="password"
                id="password2"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                disabled={loading}
                placeholder={t('auth.confirmPassword')}
                className={errors.password2 ? 'input-error' : ''}
              />
              {errors.password2 && (
                <span className="error-message">{errors.password2}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? t('auth.registering') : t('auth.register')}
          </button>
        </form>

        <div className="separator">
          <span>{t('common.or')}</span>
        </div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signup_with"
            shape="rectangular"
            locale={i18n.language}
          />
        </div>

        <div className="register-footer">
          <p>
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login">{t('auth.signIn')}</Link>
          </p>
        </div>
      </div>

      {/* Modal de sélection de rôle pour Google OAuth */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={handleRoleModalClose}
        onConfirm={handleRoleConfirm}
        loading={loading}
      />
    </div>
  );
};

export default Register;
