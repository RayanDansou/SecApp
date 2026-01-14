import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Github, Linkedin } from 'lucide-react';
import Logo from './Logo';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <Logo size={32} showText={true} />
            </div>
            <p className="footer-description">
              {t('footer.description', {
                defaultValue: 'Une solution complète pour la gestion de la sécurité et la validation des questionnaires.'
              })}
            </p>
            <div className="footer-social">
              <a href="https://github.com/RayanDansou/SecApp/tree/main" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="mailto:dansourayan@gmail.com" aria-label="Email">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="footer-section">
            <h4>{t('footer.navigation', { defaultValue: 'Navigation' })}</h4>
            <ul className="footer-links">
              <li>
                <a onClick={() => navigate('/dashboard')}>
                  {t('navbar.dashboard', { defaultValue: 'Tableau de bord' })}
                </a>
              </li>
              <li>
                <a onClick={() => navigate('/available-questionnaires')}>
                  {t('footer.questionnaires', { defaultValue: 'Questionnaires' })}
                </a>
              </li>
              <li>
                <a onClick={() => navigate('/profile')}>
                  {t('footer.profile', { defaultValue: 'Profil' })}
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div className="footer-section">
            <h4>{t('footer.resources', { defaultValue: 'Ressources' })}</h4>
            <ul className="footer-links">
              <li>
                <a href="https://github.com/RayanDansou/SecApp/blob/main/README.md" target="_blank" rel="noopener noreferrer">
                  {t('footer.documentation', { defaultValue: 'Documentation' })}
                </a>
              </li>
              <li>
                <a href="https://github.com/RayanDansou/SecApp/tree/main?tab=readme-ov-file#-api-documentation" target="_blank" rel="noopener noreferrer">
                  {t('footer.api', { defaultValue: 'API' })}
                </a>
              </li>
              <li>
                <a href="mailto:dansourayan@gmail.com">
                  {t('footer.support', { defaultValue: 'Support' })}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="footer-section">
            <h4>{t('footer.legal', { defaultValue: 'Légal' })}</h4>
            <ul className="footer-links">
              <li>
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                  {t('footer.terms', { defaultValue: 'Conditions d\'utilisation' })}
                </a>
              </li>
              <li>
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  {t('footer.privacy', { defaultValue: 'Politique de confidentialité' })}
                </a>
              </li>
              <li>
                <a href="/cookies" target="_blank" rel="noopener noreferrer">
                  {t('footer.cookies', { defaultValue: 'Politique des cookies' })}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} GuardianIQ. {t('footer.rights', { defaultValue: 'Tous droits réservés.' })}
            </p>
            <p className="footer-made">
              {t('footer.madeWith', { defaultValue: 'Fait avec' })} ❤️ {t('footer.byTeam', { defaultValue: 'par l\'équipe GuardianIQ' })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
