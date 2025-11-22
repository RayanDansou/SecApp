import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';
import Logo from '../components/Logo';
import './Login.css';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.error || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div
              style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Logo size={60} showText={true} />
            </div>
            <h2>{t('auth.resetLinkSent')}</h2>
            <p>{t('auth.forgotPasswordSubtitle')}</p>
          </div>

          <div className="alert alert-success">
            {t('auth.resetLinkSent')}
          </div>

          <div className="login-footer">
            <p>
              <Link to="/login">{t('auth.backToLogin')}</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <Logo size={60} showText={true} />
          </div>
          <h2>{t('auth.forgotPasswordTitle')}</h2>
          <p>{t('auth.forgotPasswordSubtitle')}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              disabled={loading}
              placeholder={t('auth.enterEmail')}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? t('auth.sendingResetLink') : t('auth.sendResetLink')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            <Link to="/login">{t('auth.backToLogin')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
