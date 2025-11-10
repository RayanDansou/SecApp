import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import Logo from '../components/Logo';
import RoleSelectionModal from '../components/RoleSelectionModal';
import './Login.css';

const Login = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        // Rediriger vers le dashboard après connexion réussie
        navigate('/dashboard');
      } else {
        setError(result.error?.error || t('errors.generic'));
      }
    } catch (err) {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    // Stocker le credential et ouvrir le modal de sélection de rôle
    setGoogleCredential(credentialResponse.credential);
    setShowRoleModal(true);
    setError('');
  };

  const handleGoogleError = () => {
    setError('Erreur lors de la connexion avec Google');
  };

  const handleRoleConfirm = async (selectedRole) => {
    setLoading(true);
    setError('');

    try {
      const result = await authService.googleLogin(
        googleCredential,
        selectedRole
      );

      if (result.user && result.tokens) {
        // Fermer le modal et recharger le contexte d'authentification
        setShowRoleModal(false);
        window.location.href = '/dashboard';
      } else {
        setError(t('errors.generic'));
        setShowRoleModal(false);
      }
    } catch (err) {
      setError(err.error || t('errors.generic'));
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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <Logo size={60} showText={true} />
          </div>
          <p>{t('auth.loginSubtitle')}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">{t('auth.username')}</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
              disabled={loading}
              placeholder={t('auth.username')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder={t('auth.password')}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>

        <div className="separator">
          <span>OU</span>
        </div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            locale="fr"
          />
        </div>

        <div className="login-footer">
          <p>
            <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
          </p>
          <p>
            {t('auth.noAccount')}{' '}
            <Link to="/register">{t('auth.signUp')}</Link>
          </p>
        </div>
      </div>

      {/* Modal de sélection de rôle pour Google OAuth (première connexion) */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={handleRoleModalClose}
        onConfirm={handleRoleConfirm}
        loading={loading}
      />
    </div>
  );
};

export default Login;
