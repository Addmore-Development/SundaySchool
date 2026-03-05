// src/features/auth/SuperAdminRegisterPage.tsx
import { useState } from 'react';
import { userStore } from '../../stores/userStore';

interface Props {
  onBack?: () => void;
  onLoginInstead?: () => void;
  // ── onSuccess now passes the new user's name + position back to App ──────
  onSuccess?: (user: { name: string; position: string }) => void;
}

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  password: string;
  confirmPassword: string;
};

const initialForm: FormData = {
  firstName: '', lastName: '', email: '', phone: '',
  position: '', password: '', confirmPassword: '',
};

const POSITIONS = [
  'Chairperson',
  'Deputy Chairperson',
  'Secretary',
  'Deputy Secretary',
];

export default function SuperAdminRegisterPage({ onBack, onLoginInstead, onSuccess }: Props) {
  const [form, setForm]         = useState<FormData>(initialForm);
  const [errors, setErrors]     = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);

  const set = (field: keyof FormData, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.firstName.trim())    e.firstName = 'First name is required';
    if (!form.lastName.trim())     e.lastName  = 'Last name is required';
    if (!form.email.trim())        e.email     = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    else if (userStore.emailExists(form.email)) e.email = 'This email is already registered';
    if (!form.phone.trim())        e.phone    = 'Phone number is required';
    if (!form.position)            e.position = 'Please select your position';
    if (!form.password)            e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword)     e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);

    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;

    // Save to shared store so LoginPage can find this user
    userStore.register({
      name:     fullName,
      email:    form.email.trim().toLowerCase(),
      password: form.password,
      role:     'super_admin',
      phone:    form.phone.trim(),
      position: form.position,
    });

    setSubmitted(true);

    // After brief success screen, navigate — pass name + position back
    setTimeout(() => {
      onSuccess?.({ name: fullName, position: form.position });
    }, 1800);
  };

  // ── Input style helper ────────────────────────────────────────────────────
  const inputStyle = (field: keyof FormData): React.CSSProperties => ({
    width: '100%',
    background: 'rgba(0,0,0,0.25)',
    border: `1.5px solid ${errors[field] ? '#f87171' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: 8,
    padding: '0.65rem 0.9rem',
    color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  });

  const FieldWrap = ({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.45rem' }}>
        {label}{required && <span style={{ color: '#f0c000', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <span style={{ display: 'block', fontSize: '0.73rem', color: '#f87171', marginTop: '0.3rem' }}>⚠ {error}</span>}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sar-page { min-height: 100vh; background: #071a0d; display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; font-family: 'DM Sans', sans-serif; color: #fff; }
        .sar-card { width: 100%; max-width: 560px; background: #0f3d1a; border: 1px solid rgba(240,192,0,0.18); border-radius: 14px; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.55); }
        .sar-header { background: linear-gradient(135deg,#0d3318,#0a2e12); border-bottom: 2px solid rgba(240,192,0,0.25); padding: 1.5rem 2rem; display: flex; align-items: center; gap: 1rem; }
        .sar-logo { width: 42px; height: 42px; background: #f0c000; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue',sans-serif; font-size: 1rem; color: #0a2e12; font-weight: 900; flex-shrink: 0; }
        .sar-title { font-family: 'Bebas Neue',sans-serif; font-size: 1.5rem; letter-spacing: 1.5px; color: #fff; line-height: 1; }
        .sar-subtitle { font-size: 0.75rem; color: rgba(255,255,255,0.38); margin-top: 3px; }
        .sar-body { padding: 2rem; }
        .sar-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .sar-select { width: 100%; background: #0a2e12; border: 1.5px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 0.65rem 0.9rem; color: #fff; font-family: 'DM Sans',sans-serif; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
        .sar-select option { background: #0a2e12; }
        .sar-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 1.25rem 0; }
        .sar-btn { width: 100%; background: #f0c000; color: #0a2e12; border: none; border-radius: 8px; padding: 0.75rem; font-family: 'DM Sans',sans-serif; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .sar-btn:hover:not(:disabled) { background: #ffd200; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(240,192,0,0.35); }
        .sar-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .sar-footer { margin-top: 1.1rem; text-align: center; font-size: 0.82rem; color: rgba(255,255,255,0.35); }
        .sar-link { background: none; border: none; color: #f0c000; cursor: pointer; font-family: 'DM Sans',sans-serif; font-size: 0.82rem; font-weight: 600; padding: 0; text-decoration: underline; transition: opacity 0.18s; }
        .sar-link:hover { opacity: 0.75; }
        .sar-back { display: block; margin: 0.85rem auto 0; background: none; border: none; font-family: 'DM Sans',sans-serif; font-size: 0.8rem; color: rgba(255,255,255,0.28); cursor: pointer; padding: 0; transition: color 0.18s; }
        .sar-back:hover { color: rgba(255,255,255,0.65); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @media (max-width: 500px) { .sar-grid2 { grid-template-columns: 1fr; } .sar-body { padding: 1.25rem; } }
      `}</style>

      <div className="sar-page">
        <div className="sar-card">

          {/* ── Header ── */}
          <div className="sar-header">
            <div className="sar-logo">SS</div>
            <div>
              <div className="sar-title">Create Super Admin Account</div>
              <div className="sar-subtitle">Sunday School Management Portal · Leadership Registration</div>
            </div>
          </div>

          <div className="sar-body">

            {/* ── Success State ── */}
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: 64, height: 64, background: '#f0c000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1rem', animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 0 24px rgba(240,192,0,0.45)', color: '#0a2e12', fontWeight: 900 }}>✓</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.5rem', color: '#f0c000', letterSpacing: 1, marginBottom: '0.5rem' }}>
                  Account Created!
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  Welcome, <strong style={{ color: '#fff' }}>{form.firstName} {form.lastName}</strong>.<br />
                  Redirecting to your dashboard…
                </p>
              </div>
            ) : (
              <>
                {/* ── Personal Info ── */}
                <div className="sar-grid2">
                  <FieldWrap label="First Name" required error={errors.firstName}>
                    <input style={inputStyle('firstName')} type="text" placeholder="e.g. Sipho" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                  </FieldWrap>
                  <FieldWrap label="Last Name" required error={errors.lastName}>
                    <input style={inputStyle('lastName')} type="text" placeholder="e.g. Nkosi" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                  </FieldWrap>
                </div>

                <FieldWrap label="Email Address" required error={errors.email}>
                  <input style={inputStyle('email')} type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </FieldWrap>

                <div className="sar-grid2">
                  <FieldWrap label="Phone Number" required error={errors.phone}>
                    <input style={inputStyle('phone')} type="tel" placeholder="+27 71 234 5678" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </FieldWrap>
                  <FieldWrap label="Position / Role" required error={errors.position}>
                    <select
                      className="sar-select"
                      style={{ borderColor: errors.position ? '#f87171' : 'rgba(255,255,255,0.12)', color: form.position ? '#fff' : 'rgba(255,255,255,0.35)' }}
                      value={form.position}
                      onChange={e => set('position', e.target.value)}
                    >
                      <option value="">Select position…</option>
                      {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </FieldWrap>
                </div>

                <hr className="sar-divider" />

                {/* ── Password ── */}
                <div className="sar-grid2">
                  <FieldWrap label="Password" required error={errors.password}>
                    <input style={inputStyle('password')} type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                  </FieldWrap>
                  <FieldWrap label="Confirm Password" required error={errors.confirmPassword}>
                    <input style={inputStyle('confirmPassword')} type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                  </FieldWrap>
                </div>

                {/* ── Info note ── */}
                <div style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                  <span>ℹ</span>
                  <span>Reserved for: Chairperson, Deputy Chairperson, Secretary, and Deputy Secretary. Your account will have full access to all system features.</span>
                </div>

                {/* ── Submit ── */}
                <button className="sar-btn" onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.75s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/></svg> Creating account…</>
                    : 'Create Account →'
                  }
                </button>

                <div className="sar-footer">
                  Already have an account?{' '}
                  <button className="sar-link" onClick={onLoginInstead}>Sign in instead</button>
                </div>

                <button className="sar-back" onClick={onBack}>← Back</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}