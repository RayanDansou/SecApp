import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, Moon, Sun, Settings, Shield, ChevronRight, Menu, X } from 'lucide-react';
import Logo from './Logo';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setShowLanguageMenu(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
        setShowLanguageMenu(false);
      }

      // Fermer le menu mobile si on clique en dehors
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
          !event.target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Détecter le scroll pour l'effet floating
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getInitials = (username) => {
    if (!username) return 'U';
    return username.substring(0, 2).toUpperCase();
  };

  // Avatars prédéfinis (même liste que dans ProfilePictureUpload)
  const AVATARS = [
    { id: 'avatar1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4' },
    { id: 'avatar2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede' },
    { id: 'avatar3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Princess&backgroundColor=ffd5dc' },
    { id: 'avatar4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper&backgroundColor=d1d4f9' },
    { id: 'avatar5', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe&backgroundColor=ffdfbf' },
    { id: 'avatar6', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar&backgroundColor=c5e4e7' }
  ];

  const getProfilePictureUrl = () => {
    if (user?.profile_picture) {
      return user.profile_picture;
    } else if (user?.avatar) {
      const avatar = AVATARS.find(a => a.id === user.avatar);
      return avatar?.url || AVATARS[0].url;
    }
    return null; // Pas de photo, on affichera les initiales
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="nav-brand" onClick={() => navigate('/dashboard')}>
          <Logo size={32} showText={true} />
        </div>

        {/* Hamburger Menu Button - Mobile Only */}
        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div ref={mobileMenuRef} className={`nav-links ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <a onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} className="nav-link">
          {t('navbar.dashboard')}
        </a>

        {user?.role === 'CHEF_PROJET' && (
          <>
            <a onClick={() => { navigate('/available-questionnaires'); setMobileMenuOpen(false); }} className="nav-link">
              {t('questionnaire.questionnaires')}
            </a>
            <a onClick={() => { navigate('/my-responses'); setMobileMenuOpen(false); }} className="nav-link">
              {t('questionnaire.myResponses')}
            </a>
          </>
        )}

        {user?.role === 'ANALYSTE' && (
          <>
            <a onClick={() => { navigate('/analyste/submitted-responses'); setMobileMenuOpen(false); }} className="nav-link">
              {t('analyste.submittedResponses')}
            </a>
            <a onClick={() => { navigate('/analyste/my-templates'); setMobileMenuOpen(false); }} className="nav-link">
              {t('template.myTemplates')}
            </a>
          </>
        )}

        {user?.role === 'BUSINESS_OWNER' && (
          <a onClick={() => { navigate('/business-owner/validated-responses'); setMobileMenuOpen(false); }} className="nav-link">
            {t('businessOwner.validatedResponses')}
          </a>
        )}

        {user?.role === 'ADMIN' && (
          <a onClick={() => { navigate('/admin/users'); setMobileMenuOpen(false); }} className="nav-link">
            {t('admin.userManagement')}
          </a>
        )}
      </div>

      <div className="nav-user" ref={userMenuRef}>
        <div className="user-avatar" onClick={() => setShowUserMenu(!showUserMenu)}>
          {getProfilePictureUrl() ? (
            <img
              src={getProfilePictureUrl()}
              alt="Profile"
              className="avatar-image"
            />
          ) : (
            <div className="avatar-circle">
              {getInitials(user?.username)}
            </div>
          )}
        </div>

        {showUserMenu && (
          <div className="user-dropdown-menu">
            <div className="user-info">
              <div className="user-info-name">{user?.username}</div>
              <div className="user-info-email">{user?.email}</div>
            </div>

            <div className="dropdown-divider"></div>

            <button className="dropdown-item" onClick={() => { navigate('/profile'); setShowUserMenu(false); }}>
              <Settings size={18} />
              <span>{t('navbar.settings')}</span>
            </button>

            {user?.role === 'ADMIN' && (
              <button className="dropdown-item" onClick={() => { navigate('/admin/users'); setShowUserMenu(false); }}>
                <Shield size={18} />
                <span>{t('admin.manageUsers')}</span>
              </button>
            )}

            <div className="dropdown-divider"></div>

            <button className="dropdown-item" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{isDarkMode ? t('navbar.lightMode') : t('navbar.darkMode')}</span>
            </button>

            <div
              className="dropdown-item dropdown-submenu"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Language menu clicked, current state:', showLanguageMenu);
                setShowLanguageMenu(!showLanguageMenu);
              }}
            >
              <div className="dropdown-item-content">
                <span className="language-flag-small">{i18n.language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
                <span>{t('navbar.language')}</span>
              </div>
              <ChevronRight size={18} />

              {showLanguageMenu && (
                <div
                  className="language-submenu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={`language-option ${i18n.language === 'fr' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLanguage('fr');
                      setShowLanguageMenu(false);
                    }}
                  >
                    <div className="language-option-content">
                      <span className="language-flag-small">🇫🇷</span>
                      <span>Français</span>
                    </div>
                    <span className="language-checkmark">✓</span>
                  </button>
                  <button
                    className={`language-option ${i18n.language === 'en' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLanguage('en');
                      setShowLanguageMenu(false);
                    }}
                  >
                    <div className="language-option-content">
                      <span className="language-flag-small">🇬🇧</span>
                      <span>English</span>
                    </div>
                    <span className="language-checkmark">✓</span>
                  </button>
                </div>
              )}
            </div>

            <div className="dropdown-divider"></div>

            <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
              <LogOut size={18} />
              <span>{t('navbar.logout')}</span>
            </button>
          </div>
        )}
      </div>
      </div>
    </nav>
  );
};

export default Navbar;
