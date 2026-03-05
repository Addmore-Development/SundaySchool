// src/features/auth/SuperAdminRegisterPage.tsx
import { useState } from 'react';
import { userStore } from '../../stores/userStore';

interface Props {
  onBack?: () => void;
  onLoginInstead?: () => void;
  onSuccess?: () => void;
}

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
};

const POSITIONS = [
  { value: 'chairperson',        label: 'Chairperson',        icon: '👑' },
  { value: 'deputy-chairperson', label: 'Deputy Chairperson', icon: '🤝' },
  { value: 'secretary',          label: 'Secretary',          icon: '📋' },
  { value: 'deputy-secretary',   label: 'Deputy Secretary',   icon: '📌' },
];

const getStrength = (pw: string) => {
  if (!pw) return null;
  const score =
    (pw.length >= 8  ? 1 : 0) +
    (pw.length >= 12 ? 1 : 0) +
    (/[A-Z]/.test(pw) ? 1 : 0) +
    (/[0-9]/.test(pw) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);
  if (score <= 1) return { pct: '20%', color: '#f87171', label: 'Weak' };
  if (score <= 2) return { pct: '45%', color: '#fbbf24', label: 'Fair' };
  if (score <= 3) return { pct: '70%', color: '#f0c000', label: 'Good' };
  return              { pct: '100%', color: '#34d399', label: 'Strong' };
};

export default function SuperAdminRegisterPage({ onBack, onLoginInstead, onSuccess }: Props) {
  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', email: '', phone: '',
    position: '', password: '', confirmPassword: '',
    agreeTerms: false, agreePrivacy: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof FormData, value: string | boolean) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim())  e.lastName  = 'Required';
    if (!form.email.trim())     e.email     = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim())     e.phone     = 'Required';
    if (!form.position)         e.position  = 'Select your position';
    if (!form.password)         e.password  = 'Required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (!form.confirmPassword)  e.confirmPassword = 'Required';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.agreeTerms)   e.agreeTerms   = 'Required';
    if (!form.agreePrivacy) e.agreePrivacy = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
  if (!validate()) return
  // Save to shared store so LoginPage can find this user
  userStore.register({
    name: `${form.firstName} ${form.lastName}`,
    email: form.email,
    password: form.password,
    role: 'super_admin',
    phone: form.phone,
    position: form.position,
  })
  setSubmitted(true)
  setTimeout(() => { onSuccess?.() }, 2000)
}

  const strength = getStrength(form.password);
  const selectedPos = POSITIONS.find(p => p.value === form.position);

  if (submitted) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body, #root { width: 100%; min-height: 100vh; background: #0a2e12; }
          @keyframes popIn { from { transform:scale(0.4); opacity:0; } to { transform:scale(1); opacity:1; } }
          @keyframes pulse { 0%,100% { opacity:0.3; } 50% { opacity:1; } }
        `}</style>
        <div style={{
          minHeight: '100vh', width: '100%', background: '#0a2e12',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: 80, height: 80,
              background: 'rgba(240,192,0,0.12)', border: '2px solid #f0c000',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '2.5rem',
              margin: '0 auto 1.5rem',
              animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: '0 0 40px rgba(240,192,0,0.25)',
            }}>✅</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#f0c000', letterSpacing: 2 }}>
              Registration Submitted!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', maxWidth: 360, margin: '0.75rem auto 0', lineHeight: 1.7 }}>
              Welcome, <strong style={{ color: '#f0c000' }}>{form.firstName}</strong>!
              Your <strong style={{ color: '#f0c000' }}>{selectedPos?.label}</strong> account is ready.
              Taking you to your dashboard…
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%', background: '#f0c000',
                  animation: `pulse 1s ${i * 0.2}s ease infinite`,
                }} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; background: #0a2e12; }

        .sar-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          width: 100%;
          background: #0a2e12;
          display: flex;
          flex-direction: column;
          padding: 1.5rem 2rem 2rem;
        }

        /* Top bar */
        .sar-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .sar-back {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: none; border: none; color: rgba(255,255,255,0.45);
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600;
          cursor: pointer; padding: 0; transition: color 0.15s;
        }
        .sar-back:hover { color: #f0c000; }

        .sar-brand {
          display: flex; align-items: center; gap: 0.6rem;
        }
        .sar-brand-logo {
          width: 36px; height: 36px; background: #f0c000; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 0.9rem; color: #0a2e12;
        }
        .sar-brand-name {
          font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 1px; color: #f0c000;
        }

        /* Main layout: header card + two-col form */
        .sar-header-card {
          background: #0d3318;
          border: 1px solid rgba(240,192,0,0.2);
          border-radius: 14px 14px 0 0;
          border-bottom: 2px solid rgba(240,192,0,0.25);
          padding: 1.25rem 1.75rem;
          display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;
        }
        .sar-icon-box {
          width: 48px; height: 48px; flex-shrink: 0;
          background: rgba(240,192,0,0.12); border: 1.5px solid rgba(240,192,0,0.3);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
        }
        .sar-head-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem;
          letter-spacing: 2px; color: #f0c000; line-height: 1;
        }
        .sar-head-sub { font-size: 0.72rem; color: rgba(255,255,255,0.38); margin-top: 3px; }
        .sar-approval-tag {
          margin-left: auto;
          background: rgba(240,192,0,0.1); border: 1px solid rgba(240,192,0,0.25);
          color: #f0c000; font-size: 0.68rem; font-weight: 700;
          padding: 0.28rem 0.75rem; border-radius: 20px; white-space: nowrap;
        }

        /* Two col form body */
        .sar-form-body {
          background: #0d3318;
          border: 1px solid rgba(240,192,0,0.15);
          border-top: none;
          border-radius: 0 0 14px 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          overflow: hidden;
        }

        .sar-col {
          padding: 1.5rem 1.75rem;
        }
        .sar-col:first-child {
          border-right: 1px solid rgba(255,255,255,0.06);
        }

        .sar-section-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 0.9rem;
          letter-spacing: 1.5px; color: #f0c000;
          margin-bottom: 1rem; padding-bottom: 0.4rem;
          border-bottom: 1px solid rgba(240,192,0,0.15);
        }

        .sar-info-box {
          background: rgba(240,192,0,0.06); border: 1px solid rgba(240,192,0,0.15);
          border-radius: 9px; padding: 0.75rem 0.9rem;
          font-size: 0.78rem; color: rgba(255,255,255,0.55);
          display: flex; gap: 0.55rem; line-height: 1.5; margin-bottom: 1.25rem;
        }

        .sar-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.85rem; }
        .sar-field { display: flex; flex-direction: column; margin-bottom: 0.85rem; }
        .sar-field:last-of-type { margin-bottom: 0; }

        .sar-label {
          font-size: 0.65rem; font-weight: 700; color: rgba(255,255,255,0.38);
          text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.35rem;
        }
        .sar-input {
          width: 100%; background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
          padding: 0.62rem 0.85rem; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sar-input:focus { border-color: #f0c000; box-shadow: 0 0 0 3px rgba(240,192,0,0.1); }
        .sar-input.err { border-color: #f87171 !important; }
        .sar-input::placeholder { color: rgba(255,255,255,0.2); }
        .sar-error { font-size: 0.7rem; color: #f87171; margin-top: 0.25rem; font-weight: 500; }

        /* positions */
        .sar-pos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.55rem; margin-bottom: 0.85rem; }
        .sar-pos-btn {
          padding: 0.7rem 0.75rem; border-radius: 9px;
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.2); color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif; font-size: 0.78rem; font-weight: 600;
          cursor: pointer; text-align: left;
          display: flex; align-items: center; gap: 0.5rem; transition: all 0.15s;
        }
        .sar-pos-btn:hover { border-color: rgba(240,192,0,0.35); color: rgba(255,255,255,0.85); }
        .sar-pos-btn.sel  { border-color: #f0c000; background: rgba(240,192,0,0.1); color: #f0c000; }

        /* password */
        .sar-pw-wrap { position: relative; }
        .sar-pw-wrap .sar-input { padding-right: 2.5rem; }
        .sar-pw-eye {
          position: absolute; right: 0.7rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: rgba(255,255,255,0.3);
          cursor: pointer; font-size: 0.95rem; padding: 0; transition: color 0.15s;
        }
        .sar-pw-eye:hover { color: #f0c000; }

        .sar-str-bg { height: 4px; border-radius: 2px; background: rgba(255,255,255,0.08); margin: 0.35rem 0 0.2rem; overflow: hidden; }
        .sar-str-fill { height: 100%; border-radius: 2px; transition: width 0.35s, background 0.35s; }
        .sar-str-lbl { font-size: 0.67rem; font-weight: 600; }

        /* checkboxes */
        .sar-check { display: flex; align-items: flex-start; gap: 0.6rem; margin-bottom: 0.7rem; }
        .sar-check input[type="checkbox"] { width: 15px; height: 15px; margin-top: 2px; accent-color: #f0c000; flex-shrink: 0; cursor: pointer; }
        .sar-check-lbl { font-size: 0.78rem; color: rgba(255,255,255,0.55); line-height: 1.5; cursor: pointer; }
        .sar-check-lbl a { color: #f0c000; text-decoration: none; font-weight: 600; }

        .sar-hr { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 1.1rem 0; }

        .btn-gold {
          width: 100%; background: #f0c000; color: #0a2e12;
          border: none; padding: 0.8rem; border-radius: 9px;
          font-size: 0.95rem; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .btn-gold:hover { background: #ffd200; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(240,192,0,0.3); }

        .sar-login-link { text-align: center; margin-top: 1rem; font-size: 0.78rem; color: rgba(255,255,255,0.3); }
        .sar-login-link button { background: none; border: none; color: #f0c000; font-weight: 700; cursor: pointer; font-size: 0.78rem; font-family: 'DM Sans', sans-serif; text-decoration: underline; padding: 0; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .sar-fade { animation: fadeUp 0.2s ease; }

        @media (max-width: 860px) {
          .sar-form-body { grid-template-columns: 1fr; }
          .sar-col:first-child { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .sar-page { padding: 1rem; }
        }
      `}</style>

      <div className="sar-page">

        {/* Top bar */}
        <div className="sar-topbar">
          <button className="sar-back" onClick={onBack}>← Back to role selection</button>
          <div className="sar-brand">
            <div className="sar-brand-logo">SS</div>
            <span className="sar-brand-name">Sunday School Portal</span>
          </div>
        </div>

        {/* Header card */}
        <div className="sar-header-card">
          <div className="sar-icon-box">🛡️</div>
          <div>
            <div className="sar-head-title">Super Admin Registration</div>
            <div className="sar-head-sub">Chairperson · Deputy Chairperson · Secretary · Deputy Secretary</div>
          </div>
          <div className="sar-approval-tag">⏳ Requires Approval</div>
        </div>

        {/* Two-col form */}
        <div className="sar-form-body sar-fade">

          {/* LEFT — Personal details + Position */}
          <div className="sar-col">
            <div className="sar-info-box">
              <span>🔒</span>
              <span>Super Admin accounts have <strong style={{ color: '#f0c000' }}>full system access</strong>. All registrations require verification before access is granted.</span>
            </div>

            <div className="sar-section-title">Personal Details</div>

            <div className="sar-row2">
              <div className="sar-field">
                <label className="sar-label">First Name *</label>
                <input className={`sar-input${errors.firstName ? ' err' : ''}`}
                  type="text" placeholder="e.g. Thabo"
                  value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                {errors.firstName && <span className="sar-error">{errors.firstName}</span>}
              </div>
              <div className="sar-field">
                <label className="sar-label">Last Name *</label>
                <input className={`sar-input${errors.lastName ? ' err' : ''}`}
                  type="text" placeholder="e.g. Mokoena"
                  value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                {errors.lastName && <span className="sar-error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="sar-field">
              <label className="sar-label">Email Address *</label>
              <input className={`sar-input${errors.email ? ' err' : ''}`}
                type="email" placeholder="your@email.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
              {errors.email && <span className="sar-error">{errors.email}</span>}
            </div>

            <div className="sar-field">
              <label className="sar-label">Phone Number *</label>
              <input className={`sar-input${errors.phone ? ' err' : ''}`}
                type="tel" placeholder="e.g. 071 234 5678"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
              {errors.phone && <span className="sar-error">{errors.phone}</span>}
            </div>

            <hr className="sar-hr" />
            <div className="sar-section-title">Leadership Position *</div>

            <div className="sar-pos-grid">
              {POSITIONS.map(pos => (
                <button key={pos.value} type="button"
                  className={`sar-pos-btn${form.position === pos.value ? ' sel' : ''}`}
                  onClick={() => set('position', pos.value)}
                >
                  <span style={{ fontSize: '1rem' }}>{pos.icon}</span>
                  {pos.label}
                </button>
              ))}
            </div>
            {errors.position && <span className="sar-error" style={{ display: 'block', marginBottom: '0.5rem' }}>{errors.position}</span>}
          </div>

          {/* RIGHT — Password + Agreements + Submit */}
          <div className="sar-col">

            {/* Summary chip if position selected */}
            {selectedPos && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                background: 'rgba(240,192,0,0.07)', border: '1px solid rgba(240,192,0,0.18)',
                borderRadius: '10px', padding: '0.7rem 0.9rem', marginBottom: '1.1rem',
              }}>
                <span style={{ fontSize: '1.2rem' }}>{selectedPos.icon}</span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f0c000' }}>{selectedPos.label}</div>
                  {form.firstName && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{form.firstName} {form.lastName}</div>}
                </div>
              </div>
            )}

            <div className="sar-section-title">Set Password</div>

            <div className="sar-field">
              <label className="sar-label">Password *</label>
              <div className="sar-pw-wrap">
                <input className={`sar-input${errors.password ? ' err' : ''}`}
                  type={showPw ? 'text' : 'password'} placeholder="Minimum 8 characters"
                  value={form.password} onChange={e => set('password', e.target.value)} />
                <button className="sar-pw-eye" type="button" onClick={() => setShowPw(s => !s)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {strength && (
                <>
                  <div className="sar-str-bg">
                    <div className="sar-str-fill" style={{ width: strength.pct, background: strength.color }} />
                  </div>
                  <span className="sar-str-lbl" style={{ color: strength.color }}>{strength.label}</span>
                </>
              )}
              {errors.password && <span className="sar-error">{errors.password}</span>}
            </div>

            <div className="sar-field">
              <label className="sar-label">Confirm Password *</label>
              <input className={`sar-input${errors.confirmPassword ? ' err' : ''}`}
                type={showPw ? 'text' : 'password'} placeholder="Repeat your password"
                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
              {errors.confirmPassword && <span className="sar-error">{errors.confirmPassword}</span>}
            </div>

            <hr className="sar-hr" />
            <div className="sar-section-title">Agreements</div>

            <div className="sar-check">
              <input type="checkbox" id="terms" checked={form.agreeTerms}
                onChange={e => set('agreeTerms', e.target.checked)} />
              <label className="sar-check-lbl" htmlFor="terms">
                I agree to the <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a> and understand my responsibilities as a Super Admin.
              </label>
            </div>
            {errors.agreeTerms && <span className="sar-error" style={{ display:'block', marginBottom:'0.5rem' }}>{errors.agreeTerms}</span>}

            <div className="sar-check">
              <input type="checkbox" id="privacy" checked={form.agreePrivacy}
                onChange={e => set('agreePrivacy', e.target.checked)} />
              <label className="sar-check-lbl" htmlFor="privacy">
                I accept the <a href="#" onClick={e => e.preventDefault()}>POPIA Privacy Policy</a> and consent to my data being stored securely.
              </label>
            </div>
            {errors.agreePrivacy && <span className="sar-error" style={{ display:'block', marginBottom:'0.5rem' }}>{errors.agreePrivacy}</span>}

            <hr className="sar-hr" />

            <button className="btn-gold" onClick={handleSubmit}>
              Submit Super Admin Registration →
            </button>

            <div className="sar-login-link">
              Already have an account?{' '}
              <button onClick={onLoginInstead}>Sign in instead</button>
            </div>

            <p style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.18)' }}>
              POPIA compliant · Sunday School Management Portal
            </p>
          </div>
        </div>

      </div>
    </>
  );
}