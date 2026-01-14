import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Brain,
  Users,
  FileText,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Lock,
  Workflow
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CircularGauge from '../components/CircularGauge';
import '../styles/Landing.css';

const Landing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLearnMore = () => {
    document.getElementById('video').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="landing-container">
          <div className="hero-content">
          <div className="hero-text">
            <span className="hero-tagline">
              <Sparkles size={20} />
              {t('landing.hero.tagline')}
            </span>
            <h1 className="hero-title">
              {t('landing.hero.title')}
            </h1>
            <p className="hero-subtitle">{t('landing.hero.subtitle')}</p>
            <p className="hero-description">
              {t('landing.hero.description')}
            </p>

            <div className="hero-buttons">
              <button className="btn-primary-hero" onClick={handleGetStarted}>
                {t('landing.hero.getStarted')}
                <ArrowRight size={20} />
              </button>
              <button className="btn-secondary-hero" onClick={handleLearnMore}>
                {t('landing.hero.learnMore')}
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card hero-card-main">
              <Shield size={48} className="hero-icon" />
              <h3>Security Score</h3>
              <div className="score-display">
                <CircularGauge value={95} label="C" />
                <CircularGauge value={88} label="I" />
                <CircularGauge value={92} label="A" />
              </div>
            </div>
            <div className="hero-card hero-card-small">
              <Brain size={32} className="hero-icon" />
              <p>AI Analysis</p>
            </div>
            <div className="hero-card hero-card-small">
              <CheckCircle size={32} className="hero-icon" />
              <p>Validated</p>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="landing-container">
          <div className="section-header">
          <h2>{t('landing.features.title')}</h2>
          <p>{t('landing.features.subtitle')}</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Brain size={32} />
            </div>
            <h3>{t('landing.features.aiAnalysis.title')}</h3>
            <p>{t('landing.features.aiAnalysis.description')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Workflow size={32} />
            </div>
            <h3>{t('landing.features.workflow.title')}</h3>
            <p>{t('landing.features.workflow.description')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Users size={32} />
            </div>
            <h3>{t('landing.features.collaboration.title')}</h3>
            <p>{t('landing.features.collaboration.description')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FileText size={32} />
            </div>
            <h3>{t('landing.features.documents.title')}</h3>
            <p>{t('landing.features.documents.description')}</p>
          </div>
        </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles-section">
        <div className="landing-container">
          <div className="section-header">
          <h2>{t('landing.roles.title')}</h2>
          <p>{t('landing.roles.subtitle')}</p>
        </div>

        <div className="roles-grid">
          <div className="role-card">
            <div className="role-header">
              <div className="role-icon role-icon-chef">
                <FileText size={32} />
              </div>
              <h3>{t('landing.roles.chefProjet.title')}</h3>
            </div>
            <p className="role-description">
              {t('landing.roles.chefProjet.description')}
            </p>
            <ul className="role-features">
              {t('landing.roles.chefProjet.features', { returnObjects: true }).map((feature, index) => (
                <li key={index}>
                  <CheckCircle size={18} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="role-card role-card-highlight">
            <div className="role-header">
              <div className="role-icon role-icon-analyste">
                <Shield size={32} />
              </div>
              <h3>{t('landing.roles.analyste.title')}</h3>
            </div>
            <p className="role-description">
              {t('landing.roles.analyste.description')}
            </p>
            <ul className="role-features">
              {t('landing.roles.analyste.features', { returnObjects: true }).map((feature, index) => (
                <li key={index}>
                  <CheckCircle size={18} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="role-card">
            <div className="role-header">
              <div className="role-icon role-icon-business">
                <TrendingUp size={32} />
              </div>
              <h3>{t('landing.roles.businessOwner.title')}</h3>
            </div>
            <p className="role-description">
              {t('landing.roles.businessOwner.description')}
            </p>
            <ul className="role-features">
              {t('landing.roles.businessOwner.features', { returnObjects: true }).map((feature, index) => (
                <li key={index}>
                  <CheckCircle size={18} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="landing-container">
          <div className="section-header">
          <h2>{t('landing.howItWorks.title')}</h2>
          <p>{t('landing.howItWorks.subtitle')}</p>
        </div>

        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>{t('landing.howItWorks.step1.title')}</h3>
              <p>{t('landing.howItWorks.step1.description')}</p>
            </div>
          </div>

          <div className="step-arrow">
            <ArrowRight size={24} />
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>{t('landing.howItWorks.step2.title')}</h3>
              <p>{t('landing.howItWorks.step2.description')}</p>
            </div>
          </div>

          <div className="step-arrow">
            <ArrowRight size={24} />
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>{t('landing.howItWorks.step3.title')}</h3>
              <p>{t('landing.howItWorks.step3.description')}</p>
            </div>
          </div>

          <div className="step-arrow">
            <ArrowRight size={24} />
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>{t('landing.howItWorks.step4.title')}</h3>
              <p>{t('landing.howItWorks.step4.description')}</p>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Video Section */}
      <section id="video" className="video-section" style={{ padding: '4rem 0', backgroundColor: 'var(--bg-secondary, #f8fafc)' }}>
        <div className="landing-container">
          <div className="section-header">
            <h2>{t('landing.video.title')}</h2>
            <p>{t('landing.video.subtitle')}</p>
          </div>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            aspectRatio: '16/9'
          }}>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/kgeCCkqtlH0"
              title={t('landing.video.title')}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="landing-container">
          <div className="cta-content">
          <Lock size={48} className="cta-icon" />
          <h2>{t('landing.cta.title')}</h2>
          <p>{t('landing.cta.description')}</p>
          <button className="btn-cta" onClick={handleGetStarted}>
            {t('landing.cta.button')}
            <ArrowRight size={20} />
          </button>
        </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
