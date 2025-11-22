import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';
import Logo from '../components/Logo';
import './Login.css';

const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError(t('auth.confirmPassword') + ' ' + t('errors.validationError'));
      return;
    }

    if (!token) {
      setError(t('auth.passwordResetError'));
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, formData.password, formData.password2);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.error || t('auth.passwordResetError'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
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
            <h2>{t('common.error')}</h2>
          </div>

          <div className="alert alert-error">
            {t('auth.passwordResetError')}
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
            <h2>{t('common.success')}</h2>
          </div>

          <div className="alert alert-success">
            {t('auth.passwordResetSuccess')}
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
          <h2>{t('auth.resetPasswordTitle')}</h2>
          <p>{t('auth.resetPasswordSubtitle')}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">{t('auth.newPassword')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoFocus
              disabled={loading}
              placeholder={t('auth.newPassword')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password2">{t('auth.confirmPassword')}</label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder={t('auth.confirmPassword')}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? t('auth.resettingPassword') : t('auth.resetPassword')}
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

export default ResetPassword;
