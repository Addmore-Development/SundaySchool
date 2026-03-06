// src/features/landingpage/LandingPage.tsx
// No modal logic here — just calls onLogin / onRegister props from App.tsx

import React, { useState, useRef, useEffect } from 'react';
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

// ── Gallery ────────────────────────────────────────────────────────────────────
const GALLERY_SETS: string[][] = [
  [
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80',
    'https://images.unsplash.com/photo-1571210862729-78a52d3779a2?w=600&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80',
    'https://images.unsplash.com/photo-1560785496-3c9d27877182?w=600&q=80',
    'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=600&q=80',
    'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=600&q=80',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80',
  ],
];

function getWeekGallery(): string[] {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week  = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return GALLERY_SETS[week % GALLERY_SETS.length];
}

// ── Donation form ──────────────────────────────────────────────────────────────
const DONATION_AMOUNTS = ['R50', 'R100', 'R250', 'R500', 'R1000', 'Other'];

const formatSAPhone = (raw: string): string => {
  let digits = raw.replace(/[^\d]/g, '');
  if (digits.startsWith('0')) digits = '27' + digits.slice(1);
  if (!digits.startsWith('27')) digits = '27' + digits;
  digits = digits.slice(0, 11);
  return '+' + digits;
};
const validateSAPhone = (val: string) =>
  val === '+27' || /^\+27\d{9}$/.test(val.replace(/\s/g, ''));

interface DonationFormProps {
  onClose: () => void;
}

const DonationForm: React.FC<DonationFormProps> = ({ onClose }) => {
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('+27');
  const [amount,    setAmount]    = useState('R100');
  const [custom,    setCustom]    = useState('');
  const [message,   setMessage]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())  e.name  = 'Full name is required.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email.';
    if (phone && phone !== '+27' && !validateSAPhone(phone))
      e.phone = 'Enter a valid SA number: +27 followed by 9 digits.';
    if (amount === 'Other' && !custom.trim()) e.custom = 'Enter a valid amount.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className="lp-modal-overlay" ref={overlayRef} onClick={handleOverlay}>
      <div className="lp-modal">
        <button className="lp-modal-close" onClick={onClose} aria-label="Close">✕</button>

        {submitted ? (
          <div className="lp-donate-success">
            <div className="lp-donate-success-icon">🙏</div>
            <h3 className="lp-donate-success-title">Thank You!</h3>
            <p className="lp-donate-success-body">
              Your donation of <strong>{amount === 'Other' ? `R${custom}` : amount}</strong> is
              being processed. A confirmation will be sent to <strong>{email}</strong>.
            </p>
            <button className="lp-donate-btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="lp-modal-header">
              <span className="lp-modal-icon">❤️</span>
              <h2 className="lp-modal-title">Church Cares</h2>
              <p className="lp-modal-subtitle">
                Your generosity directly supports vulnerable children and families in our community.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="lp-donate-form">

              <div className="lp-donate-field">
                <label className="lp-donate-label">Full Name *</label>
                <input
                  className={`lp-donate-input${errors.name ? ' lp-donate-input--err' : ''}`}
                  placeholder="e.g. Thabo Mokoena"
                  value={name} onChange={e => setName(e.target.value)}
                />
                {errors.name && <span className="lp-donate-err">{errors.name}</span>}
              </div>

              <div className="lp-donate-row-2">
                <div className="lp-donate-field">
                  <label className="lp-donate-label">Email Address *</label>
                  <input
                    className={`lp-donate-input${errors.email ? ' lp-donate-input--err' : ''}`}
                    type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                  {errors.email && <span className="lp-donate-err">{errors.email}</span>}
                </div>
                <div className="lp-donate-field">
                  <label className="lp-donate-label">
                    Phone <span className="lp-donate-opt">(optional)</span>
                  </label>
                  <input
                    className={`lp-donate-input${errors.phone ? ' lp-donate-input--err' : ''}`}
                    type="tel"
                    placeholder="+27831234567"
                    value={phone}
                    maxLength={12}
                    style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
                    onChange={e => setPhone(formatSAPhone(e.target.value))}
                  />
                  {errors.phone
                    ? <span className="lp-donate-err">{errors.phone}</span>
                    : <span className="lp-donate-hint">Format: +27 followed by 9 digits</span>
                  }
                </div>
              </div>

              <div className="lp-donate-field">
                <label className="lp-donate-label">Donation Amount *</label>
                <div className="lp-donate-amounts">
                  {DONATION_AMOUNTS.map(a => (
                    <button
                      key={a} type="button"
                      className={`lp-donate-amount-btn${amount === a ? ' lp-donate-amount-btn--active' : ''}`}
                      onClick={() => setAmount(a)}
                    >{a}</button>
                  ))}
                </div>
                {amount === 'Other' && (
                  <div style={{ marginTop: '0.6rem' }}>
                    <input
                      className={`lp-donate-input${errors.custom ? ' lp-donate-input--err' : ''}`}
                      placeholder="Enter amount (e.g. 750)"
                      value={custom}
                      onChange={e => setCustom(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                    {errors.custom && <span className="lp-donate-err">{errors.custom}</span>}
                  </div>
                )}
              </div>

              <div className="lp-donate-field">
                <label className="lp-donate-label">
                  Message <span className="lp-donate-opt">(optional)</span>
                </label>
                <textarea
                  className="lp-donate-input lp-donate-textarea"
                  placeholder="A note with your donation…"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>

              <div className="lp-donate-popia">
                🔒 Your personal information is processed in accordance with POPIA. It will only be
                used to confirm your donation and send your receipt.
              </div>

              <button type="submit" className="lp-donate-btn-primary">
                Donate {amount === 'Other' ? (custom ? `R${custom}` : '') : amount} →
              </button>

            </form>
          </>
        )}
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
interface LandingPageProps {
  onLogin?: () => void;
  onRegister?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onLogin    = () => {},
  onRegister = () => {},
}) => {
  const [showDonation, setShowDonation] = useState(false);
  const galleryPhotos = getWeekGallery();

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

      {/* ══ GALLERY SECTION ═══════════════════════════════════ */}
      <section className="landing__gallery-section">
        <div className="landing__gallery-inner">

          <div className="landing__gallery-label">OUR COMMUNITY</div>
          <h2 className="landing__gallery-heading">Moments That Matter</h2>
          <p className="landing__gallery-sub">
            Glimpses of the children and families we serve each week.
          </p>

          <div className="landing__gallery-grid">
            {galleryPhotos.map((src, i) => (
              <div
                key={i}
                className="landing__gallery-card"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <img
                  src={src}
                  alt={`Community photo ${i + 1}`}
                  className="landing__gallery-img"
                  loading="lazy"
                />
                <div className="landing__gallery-shimmer" />
              </div>
            ))}
          </div>

          <button
            className="landing__church-cares-btn"
            onClick={() => setShowDonation(true)}
          >
            <span className="landing__church-cares-icon">❤️</span>
            Church Cares — Support a Child Today
          </button>

        </div>
      </section>

      {/* ══ FOOTER — slim, no social links ════════════════════ */}
      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <div className="landing__footer-left">
            <div className="landing__footer-logo">SS</div>
            <span className="landing__footer-logo-name">Sunday School Portal</span>
          </div>
          <div className="landing__footer-mid">
            <span>064 017 6321</span>
            <span className="landing__footer-sep">·</span>
            <span>info@sundayschoolportal.co.za</span>
            <span className="landing__footer-sep">·</span>
            <span className="landing__footer-hours">SUNDAYS 08:00–13:00</span>
          </div>
          <p className="landing__footer-copy">
            © {new Date().getFullYear()} Sunday School Portal · All rights reserved
          </p>
        </div>
      </footer>

      {/* ══ DONATION MODAL ════════════════════════════════════ */}
      {showDonation && <DonationForm onClose={() => setShowDonation(false)} />}

    </div>
  );
};

export default LandingPage;