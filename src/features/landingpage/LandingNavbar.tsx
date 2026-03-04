import React from 'react';
import './LandingNavbar.css';

interface LandingNavbarProps {
  onLogin: () => void;
  onRegister: () => void;
}

const LandingNavbar: React.FC<LandingNavbarProps> = ({ onLogin, onRegister }) => {
  return (
    <nav className="landing-nav">
      <div className="landing-nav__brand">
        <div className="landing-nav__logo">SS</div>
        <span className="landing-nav__name">Sunday School Portal</span>
      </div>

      <div className="landing-nav__actions">
        <button className="landing-nav__login" onClick={onLogin}>
          Login
        </button>
        <button className="landing-nav__register" onClick={onRegister}>
          Register
        </button>
      </div>
    </nav>
  );
};

export default LandingNavbar;