import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, LogOut, Moon, Sun } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate('/dashboard')}>
        <h2>{t('common.appName')}</h2>
      </div>

      <div className="nav-user">
        <span className="user-name">{user?.username}</span>

        {/* --- Bouton Langue --- */}
        <button
          onClick={toggleLanguage}
          className="btn btn-language btn-icon-only"
          title={t('navbar.language')}
        >
          <span className="language-flag">{i18n.language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
        </button>

        {/* --- Bouton Dark Mode --- */}
        <button
          onClick={toggleTheme}
          className="btn btn-theme btn-icon-only"
          title={isDarkMode ? t('navbar.lightMode') : t('navbar.darkMode')}
        >
          {isDarkMode ? <Sun size={20} strokeWidth={2.2} /> : <Moon size={20} strokeWidth={2.2} />}
        </button>

        {/* --- Bouton Profil --- */}
        <button
          onClick={() => navigate('/profile')}
          className="btn btn-profile btn-icon-only"
          title={t('navbar.profile')}
        >
          <User size={20} strokeWidth={2.2} />
        </button>

        {/* --- Bouton Déconnexion --- */}
        <button
          onClick={handleLogout}
          className="btn btn-logout btn-icon-only"
          title={t('navbar.logout')}
        >
          <LogOut size={20} strokeWidth={2.2} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
