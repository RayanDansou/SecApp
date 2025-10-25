import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

const Register = () => {
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
      newErrors.username = "Le nom d'utilisateur est requis";
    } else if (formData.username.length < 3) {
      newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    // Validation email
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    // Validation password
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    // Validation password2
    if (!formData.password2) {
      newErrors.password2 = "La confirmation du mot de passe est requise";
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = "Les mots de passe ne correspondent pas";
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
          setErrors({ general: 'Une erreur est survenue lors de l\'inscription' });
        }
      }
    } catch (err) {
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>SecApp</h1>
          <p>Créez votre compte</p>
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
                Nom d'utilisateur <span className="required">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                placeholder="Nom d'utilisateur"
                className={errors.username ? 'input-error' : ''}
              />
              {errors.username && (
                <span className="error-message">{errors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="email@example.com"
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">Prénom</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={loading}
                placeholder="Prénom"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Nom</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={loading}
                placeholder="Nom"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">
              Rôle <span className="required">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="CHEF_PROJET">Chef de Projet</option>
              <option value="ANALYSTE">Analyste Sécurité</option>
              <option value="BUSINESS_OWNER">Business Owner</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                Mot de passe <span className="required">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                placeholder="Minimum 8 caractères"
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password2">
                Confirmer le mot de passe <span className="required">*</span>
              </label>
              <input
                type="password"
                id="password2"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                disabled={loading}
                placeholder="Confirmer le mot de passe"
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
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Vous avez déjà un compte ?{' '}
            <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
