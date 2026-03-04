// src/features/auth/RegisterPage.tsx
// Rendered after the user picks a role in RegisterModal.
// Receives the role via React Router params: /register/:role
// or via prop if not using a router yet.

import { useState } from 'react';

type Role = 'parent' | 'teacher' | 'admin';

interface RegisterPageProps {
  role?: Role;             // passed as prop if no router yet
  onBack?: () => void;    // go back to landing / modal
  onSuccess?: () => void; // after successful registration
}

// ─── Role meta ────────────────────────────────────────────────────────────────
const ROLE_META = {
  parent: {
    icon: '👨‍👩‍👧',
    label: 'Parent / Caregiver',
    color: '#34d399',
    colorBg: 'rgba(52,211,153,0.08)',
    colorBorder: 'rgba(52,211,153,0.25)',
    note: 'Your account will be active immediately after registration.',
    extraFields: false,
    requiresApproval: false,
  },
  teacher: {
    icon: '🧑‍🏫',
    label: 'Teacher',
    color: '#f0c000',
    colorBg: 'rgba(240,192,0,0.08)',
    colorBorder: 'rgba(240,192,0,0.25)',
    note: 'Your account will be reviewed and approved by a Super Admin before access is granted.',
    extraFields: true,
    requiresApproval: true,
  },
  admin: {
    icon: '🛡️',
    label: 'Super Admin',
    color: '#a78bfa',
    colorBg: 'rgba(167,139,250,0.08)',
    colorBorder: 'rgba(167,139,250,0.25)',
    note: 'Reserved for Chairperson, Deputy, Secretary & Deputy Secretary. Requires existing admin verification.',
    extraFields: true,
    requiresApproval: true,
  },
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  // Teacher / Admin extras
  churchRole: string;
  accessCode: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
};

const empty: FormData = {
  firstName: '', lastName: '', email: '', phone: '',
  password: '', confirmPassword: '',
  churchRole: '', accessCode: '',
  agreeTerms: false, agreePrivacy: false,
};

export default function RegisterPage({
  role = 'parent',
  onBack,
  onSuccess,
}: RegisterPageProps) {
  const [form, setForm] = useState<FormData>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const meta = ROLE_META[role];

  const set = (field: keyof FormData, value: string | boolean) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.password) e.password = 'Required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Required';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (meta.extraFields && !form.churchRole.trim()) e.churchRole = 'Required';
    if (role === 'admin' && !form.accessCode.trim()) e.accessCode = 'Required';
    if (!form.agreeTerms) e.agreeTerms = 'You must accept the terms';
    if (!form.agreePrivacy) e.agreePrivacy = 'You must accept the privacy policy';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log('Register:', { role, ...form });
      setSubmitted(true);
      onSuccess?.();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rp-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #0a2e12;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .rp-wrap { width: 100%; max-width: 520px; }

        /* ── Back ── */
        .rp-back {
          display: flex; align-items: center; gap: 0.5rem;
          background: none; border: none;
          color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem; font-weight: 600; cursor: pointer;
          margin-bottom: 1.5rem; padding: 0; transition: color 0.15s;
        }
        .rp-back:hover { color: #f0c000; }

        /* ── Card ── */
        .rp-card {
          background: #0f3d1a;
          border: 1px solid rgba(240,192,0,0.15);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        /* ── Card header ── */
        .rp-header {
          background: #0d3318;
          border-bottom: 2px solid rgba(240,192,0,0.15);
          padding: 1.5rem 1.75rem;
          display: flex; align-items: center; gap: 1rem;
        }

        .rp-role-icon {
          width: 52px; height: 52px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem; flex-shrink: 0;
        }

        .rp-header-text {}

        .rp-header-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem; letter-spacing: 1.5px;
          color: #fff; line-height: 1;
        }

        .rp-header-sub {
          font-size: 0.78rem; color: rgba(255,255,255,0.4);
          margin-top: 0.25rem;
        }

        /* ── Body ── */
        .rp-body { padding: 1.75rem; }

        /* ── Note banner ── */
        .rp-note {
          background: rgba(0,0,0,0.2);
          border-radius: 9px; padding: 0.8rem 1rem;
          font-size: 0.8rem; color: rgba(255,255,255,0.5);
          display: flex; gap: 0.6rem; align-items: flex-start;
          border-left: 3px solid;
          margin-bottom: 1.5rem;
        }

        /* ── Section heading ── */
        .rp-section {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.95rem; letter-spacing: 1.5px;
          color: #f0c000; margin-bottom: 0.9rem;
          padding-bottom: 0.45rem;
          border-bottom: 1px solid rgba(240,192,0,0.15);
        }

        /* ── Grid ── */
        .rp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        /* ── Field ── */
        .rp-field { display: flex; flex-direction: column; gap: 0; margin-bottom: 1rem; }
        .rp-field:last-child { margin-bottom: 0; }

        .rp-label {
          font-size: 0.7rem; font-weight: 700;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase; letter-spacing: 0.6px;
          margin-bottom: 0.4rem;
        }

        .rp-input {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 0.65rem 0.9rem;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .rp-input:focus {
          border-color: #f0c000;
          box-shadow: 0 0 0 3px rgba(240,192,0,0.12);
        }

        .rp-input.err { border-color: #f87171; }
        .rp-input::placeholder { color: rgba(255,255,255,0.2); }
        .rp-input option { background: #0f3d1a; color: #fff; }

        .rp-error {
          font-size: 0.72rem; color: #f87171;
          margin-top: 0.3rem; font-weight: 500;
        }

        /* ── Password wrapper ── */
        .rp-pw-wrap { position: relative; }
        .rp-pw-wrap .rp-input { padding-right: 2.5rem; }
        .rp-pw-toggle {
          position: absolute; right: 0.75rem; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; color: rgba(255,255,255,0.35);
          cursor: pointer; font-size: 1rem; line-height: 1;
          transition: color 0.15s; padding: 0;
        }
        .rp-pw-toggle:hover { color: #f0c000; }

        /* ── Checkbox ── */
        .rp-check-row {
          display: flex; align-items: flex-start; gap: 0.7rem;
          margin-bottom: 0.75rem;
        }

        .rp-check-row input[type="checkbox"] {
          width: 16px; height: 16px; margin-top: 2px;
          accent-color: #f0c000; flex-shrink: 0; cursor: pointer;
        }

        .rp-check-label {
          font-size: 0.82rem; color: rgba(255,255,255,0.6);
          line-height: 1.5; cursor: pointer;
        }

        .rp-check-label a {
          color: #f0c000; text-decoration: none; font-weight: 600;
        }
        .rp-check-label a:hover { text-decoration: underline; }

        /* ── Divider ── */
        .rp-divider {
          border: none; border-top: 1px solid rgba(255,255,255,0.06);
          margin: 1.5rem 0;
        }

        /* ── Submit btn ── */
        .btn-gold {
          width: 100%;
          background: #f0c000; color: #0a2e12;
          border: none; padding: 0.8rem;
          border-radius: 9px; font-size: 0.95rem; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; letter-spacing: 0.2px;
        }
        .btn-gold:hover:not(:disabled) {
          background: #ffd200;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(240,192,0,0.35);
        }
        .btn-gold:disabled { opacity: 0.35; cursor: not-allowed; }

        /* ── Login link ── */
        .rp-login-link {
          text-align: center; margin-top: 1.25rem;
          font-size: 0.8rem; color: rgba(255,255,255,0.35);
        }
        .rp-login-link button {
          background: none; border: none; color: #f0c000;
          font-weight: 700; cursor: pointer; font-size: 0.8rem;
          font-family: 'DM Sans', sans-serif; text-decoration: underline;
        }
        .rp-login-link button:hover { color: #ffd200; }

        /* ── Success ── */
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        /* ── Approval badge ── */
        .rp-approval-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.2rem 0.65rem; border-radius: 20px;
          font-size: 0.7rem; font-weight: 700;
        }

        @media (max-width: 480px) {
          .rp-grid-2 { grid-template-columns: 1fr; }
          .rp-body { padding: 1.25rem; }
        }
      `}</style>

      <div className="rp-page">
        <div className="rp-wrap">

          {/* ── Back ──────────────────────────────────────────── */}
          <button className="rp-back" onClick={onBack}>
            ← Back
          </button>

          <div className="rp-card">

            {/* ── Header ────────────────────────────────────────── */}
            <div className="rp-header">
              <div
                className="rp-role-icon"
                style={{ background: meta.colorBg, border: `1.5px solid ${meta.colorBorder}` }}
              >
                {meta.icon}
              </div>
              <div className="rp-header-text">
                <div className="rp-header-title" style={{ color: meta.color }}>
                  {meta.label}
                </div>
                <div className="rp-header-sub">Create your account</div>
              </div>
              {meta.requiresApproval && (
                <div
                  className="rp-approval-badge"
                  style={{ background: meta.colorBg, color: meta.color, border: `1px solid ${meta.colorBorder}`, marginLeft: 'auto' }}
                >
                  ⏳ Requires Approval
                </div>
              )}
            </div>

            {/* ── Body ──────────────────────────────────────────── */}
            <div className="rp-body">

              {/* ══ SUCCESS ════════════════════════════════════════ */}
              {submitted && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{
                    width: 68, height: 68, background: meta.color,
                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.25rem',
                    animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                    boxShadow: `0 0 28px ${meta.colorBg}`,
                    color: '#0a2e12', fontWeight: 900,
                  }}>
                    ✓
                  </div>
                  <h2 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '1.5rem', color: meta.color, letterSpacing: 1,
                  }}>
                    {meta.requiresApproval ? 'Request Submitted!' : 'Account Created!'}
                  </h2>
                  <p style={{
                    color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem',
                    maxWidth: 340, margin: '0.75rem auto 0', lineHeight: 1.6,
                  }}>
                    {meta.requiresApproval
                      ? 'Your registration request has been sent. A Super Admin will review and approve your account.'
                      : `Welcome, ${form.firstName}! Your account is ready. You can now log in.`
                    }
                  </p>
                </div>
              )}

              {/* ══ FORM ════════════════════════════════════════════ */}
              {!submitted && (
                <>
                  {/* Note */}
                  <div className="rp-note" style={{ borderLeftColor: meta.color }}>
                    <span>ℹ️</span>
                    <span>{meta.note}</span>
                  </div>

                  {/* ── Personal details ── */}
                  <div className="rp-section">Personal Details</div>

                  <div className="rp-grid-2" style={{ marginBottom: '1rem' }}>
                    <div className="rp-field">
                      <label className="rp-label">First Name *</label>
                      <input
                        className={`rp-input${errors.firstName ? ' err' : ''}`}
                        type="text" placeholder="e.g. Nomsa"
                        value={form.firstName}
                        onChange={e => set('firstName', e.target.value)}
                      />
                      {errors.firstName && <span className="rp-error">{errors.firstName}</span>}
                    </div>
                    <div className="rp-field">
                      <label className="rp-label">Last Name *</label>
                      <input
                        className={`rp-input${errors.lastName ? ' err' : ''}`}
                        type="text" placeholder="e.g. Dlamini"
                        value={form.lastName}
                        onChange={e => set('lastName', e.target.value)}
                      />
                      {errors.lastName && <span className="rp-error">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">Email Address *</label>
                    <input
                      className={`rp-input${errors.email ? ' err' : ''}`}
                      type="email" placeholder="your@email.com"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                    />
                    {errors.email && <span className="rp-error">{errors.email}</span>}
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">Phone Number *</label>
                    <input
                      className={`rp-input${errors.phone ? ' err' : ''}`}
                      type="tel" placeholder="e.g. 071 234 5678"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                    />
                    {errors.phone && <span className="rp-error">{errors.phone}</span>}
                  </div>

                  {/* ── Teacher / Admin extra fields ── */}
                  {meta.extraFields && (
                    <>
                      <div className="rp-field">
                        <label className="rp-label">
                          {role === 'admin' ? 'Leadership Position *' : 'Role at Church *'}
                        </label>
                        {role === 'admin' ? (
                          <select
                            className={`rp-input${errors.churchRole ? ' err' : ''}`}
                            value={form.churchRole}
                            onChange={e => set('churchRole', e.target.value)}
                          >
                            <option value="">Select your position…</option>
                            <option value="chairperson">Chairperson</option>
                            <option value="deputy-chairperson">Deputy Chairperson</option>
                            <option value="secretary">Secretary</option>
                            <option value="deputy-secretary">Deputy Secretary</option>
                          </select>
                        ) : (
                          <input
                            className={`rp-input${errors.churchRole ? ' err' : ''}`}
                            type="text" placeholder="e.g. Grade 3 Teacher, Volunteer"
                            value={form.churchRole}
                            onChange={e => set('churchRole', e.target.value)}
                          />
                        )}
                        {errors.churchRole && <span className="rp-error">{errors.churchRole}</span>}
                      </div>

                      {role === 'admin' && (
                        <div className="rp-field">
                          <label className="rp-label">Admin Access Code *</label>
                          <input
                            className={`rp-input${errors.accessCode ? ' err' : ''}`}
                            type="text" placeholder="Provided by existing Super Admin"
                            value={form.accessCode}
                            onChange={e => set('accessCode', e.target.value)}
                          />
                          {errors.accessCode && <span className="rp-error">{errors.accessCode}</span>}
                        </div>
                      )}
                    </>
                  )}

                  <hr className="rp-divider" />

                  {/* ── Password ── */}
                  <div className="rp-section">Set Password</div>

                  <div className="rp-field">
                    <label className="rp-label">Password *</label>
                    <div className="rp-pw-wrap">
                      <input
                        className={`rp-input${errors.password ? ' err' : ''}`}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimum 8 characters"
                        value={form.password}
                        onChange={e => set('password', e.target.value)}
                      />
                      <button
                        className="rp-pw-toggle"
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.password && <span className="rp-error">{errors.password}</span>}
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">Confirm Password *</label>
                    <input
                      className={`rp-input${errors.confirmPassword ? ' err' : ''}`}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      onChange={e => set('confirmPassword', e.target.value)}
                    />
                    {errors.confirmPassword && <span className="rp-error">{errors.confirmPassword}</span>}
                  </div>

                  <hr className="rp-divider" />

                  {/* ── Consent checkboxes ── */}
                  <div className="rp-section">Agreements</div>

                  <div className="rp-check-row">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={form.agreeTerms}
                      onChange={e => set('agreeTerms', e.target.checked)}
                    />
                    <label className="rp-check-label" htmlFor="agreeTerms">
                      I agree to the{' '}
                      <a href="#terms" onClick={e => e.preventDefault()}>Terms of Service</a>
                    </label>
                  </div>
                  {errors.agreeTerms && <span className="rp-error" style={{ marginBottom: '0.6rem', display: 'block' }}>{errors.agreeTerms}</span>}

                  <div className="rp-check-row">
                    <input
                      type="checkbox"
                      id="agreePrivacy"
                      checked={form.agreePrivacy}
                      onChange={e => set('agreePrivacy', e.target.checked)}
                    />
                    <label className="rp-check-label" htmlFor="agreePrivacy">
                      I accept the{' '}
                      <a href="#privacy" onClick={e => e.preventDefault()}>POPIA Privacy Policy</a>{' '}
                      and consent to my data being stored securely.
                    </label>
                  </div>
                  {errors.agreePrivacy && <span className="rp-error" style={{ marginBottom: '0.75rem', display: 'block' }}>{errors.agreePrivacy}</span>}

                  <hr className="rp-divider" />

                  {/* ── Submit ── */}
                  <button className="btn-gold" onClick={handleSubmit}>
                    {meta.requiresApproval
                      ? `Submit ${meta.label} Registration →`
                      : `Create Account →`
                    }
                  </button>

                  <div className="rp-login-link">
                    Already have an account?{' '}
                    <button onClick={onBack}>Sign in instead</button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── POPIA footer ── */}
          <p style={{
            textAlign: 'center', marginTop: '1rem',
            fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            POPIA: Handle data lawfully &amp; securely. · Sunday School Management Portal
          </p>
        </div>
      </div>
    </>
  );
}