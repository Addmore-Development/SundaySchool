import React from 'react';
import LANDING_BG_IMAGE from './landingImage';
import './LandingPage.css';

const FEATURES = [
  {
    id: 'visibility',
    title: 'Visibility',
    description: 'Real-time insights into children served and their needs.',
  },
  {
    id: 'accountability',
    title: 'Accountability',
    description: 'Accurate records for leadership, donors, and safeguarding.',
  },
  {
    id: 'pastoral',
    title: 'Pastoral Care',
    description: 'Early identification of vulnerable children and families.',
  },
];

interface LandingPageProps {
  onLogin?: () => void;
  onRegister?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onLogin = () => alert('Login coming soon'),
  onRegister = () => alert('Register coming soon'),
}) => {
  return (
    <div className="landing">

      {/* ══ FULL SCREEN HERO ══════════════════════════════════ */}
      <section className="landing__hero">

        {/* Background image */}
        <div
          className="landing__hero-bg"
          style={{ backgroundImage: `url(${LANDING_BG_IMAGE})` }}
          aria-hidden="true"
        />

        {/* Dark overlay */}
        <div className="landing__hero-overlay" aria-hidden="true" />

        {/* ── Navbar ── */}
        <header className="landing__nav">
          <div className="landing__nav-brand">
            <div className="landing__nav-logo">SS</div>
            <span className="landing__nav-name">Sunday School Portal</span>
          </div>
          <div className="landing__nav-actions">
            <button className="landing__nav-login" onClick={onLogin}>
              Login
            </button>
            <button className="landing__nav-register" onClick={onRegister}>
              Register
            </button>
          </div>
        </header>

        {/* ── Hero content ── */}
        <div className="landing__hero-content">
          <h1 className="landing__hero-heading">
            <span className="landing__hero-heading--white">Empowering the</span>
            <br />
            <span className="landing__hero-heading--gold">Next Generation</span>
          </h1>

          <p className="landing__hero-subheading">
            A secure, mobile-first platform for church Sunday school
            registration, attendance, feeding schemes, and welfare tracking.
          </p>

          {/* Feature cards */}
          <div className="landing__feature-cards">
            {FEATURES.map((f, i) => (
              <div
                key={f.id}
                className="landing__feature-card"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <h3 className="landing__feature-card-title">{f.title}</h3>
                <p className="landing__feature-card-desc">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Trust bar ── */}
        <div className="landing__trust-bar">
          <span>POPIA COMPLIANT</span>
          <span className="landing__trust-dot">•</span>
          <span>SECURE DATA HANDLING</span>
          <span className="landing__trust-dot">•</span>
          <span>CHURCH LEADERSHIP APPROVED</span>
        </div>

      </section>
    </div>
  );
};

export default LandingPage;