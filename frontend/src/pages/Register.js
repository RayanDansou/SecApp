import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

const Register = () => {
  const { t } = useTranslation();
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

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>{t('common.appName')}</h1>
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

        <div className="register-footer">
          <p>
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login">{t('auth.signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
