// src/features/auth/SuperAdminRegisterPage.tsx
import { useState, useRef } from 'react';
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
  idNumber: string;
  position: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
};

const POSITIONS = [
  { value: 'Chairperson',        label: 'Chairperson',        icon: '👑' },
  { value: 'Deputy Chairperson', label: 'Deputy Chairperson', icon: '🤝' },
  { value: 'Secretary',          label: 'Secretary',          icon: '📋' },
  { value: 'Deputy Secretary',   label: 'Deputy Secretary',   icon: '📌' },
];

// ── SA Phone helpers ──────────────────────────────────────────────────────────
const formatSAPhone = (raw: string): string => {
  // Strip everything except digits and leading +
  let val = raw.replace(/[^\d+]/g, '');
  // Ensure it starts with +27
  if (!val.startsWith('+')) {
    if (val.startsWith('27')) val = '+' + val;
    else if (val.startsWith('0')) val = '+27' + val.slice(1);
    else val = '+27' + val;
  }
  // Limit to +27 + 9 digits = 12 chars
  if (val.length > 12) val = val.slice(0, 12);
  return val;
};

const validateSAPhone = (val: string): string | null => {
  const cleaned = val.replace(/\s/g, '');
  if (!cleaned || cleaned === '+27') return 'Phone number is required';
  if (!/^\+27\d{9}$/.test(cleaned)) return 'Enter a valid SA number: +27 followed by 9 digits';
  return null;
};

// ── SA ID Validation ──────────────────────────────────────────────────────────
const validateSAID = (id: string): string | null => {
  const cleaned = id.replace(/\s/g, '');
  if (!cleaned) return 'SA ID number is required';
  if (!/^\d{13}$/.test(cleaned)) return 'SA ID must be exactly 13 digits';
  const mm = parseInt(cleaned.slice(2, 4));
  const dd = parseInt(cleaned.slice(4, 6));
  if (mm < 1 || mm > 12) return 'SA ID contains invalid birth month';
  const yy = parseInt(cleaned.slice(0, 2));
  const daysInMonth = new Date(2000 + yy, mm, 0).getDate();
  if (dd < 1 || dd > daysInMonth) return 'SA ID contains invalid birth day';
  // Luhn algorithm
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let digit = parseInt(cleaned[i]);
    if (i % 2 === 1) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
  }
  if (sum % 10 !== 0) return 'SA ID number is invalid (failed checksum)';
  return null;
};

// ── Password strength ─────────────────────────────────────────────────────────
const getStrength = (pw: string) => {
  if (!pw) return null;
  const score =
    (pw.length >= 8  ? 1 : 0) +
    (pw.length >= 12 ? 1 : 0) +
    (/[A-Z]/.test(pw) ? 1 : 0) +
    (/[0-9]/.test(pw) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);
  if (score <= 1) return { pct: '20%', color: '#6b7280', label: 'Weak' };
  if (score <= 2) return { pct: '45%', color: '#fbbf24', label: 'Fair' };
  if (score <= 3) return { pct: '70%', color: '#f0c000', label: 'Good' };
  return              { pct: '100%', color: '#34d399', label: 'Strong' };
};

export default function SuperAdminRegisterPage({ onBack, onLoginInstead, onSuccess }: Props) {
  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', email: '', phone: '+27', idNumber: '',
    position: '', password: '', confirmPassword: '',
    agreeTerms: false, agreePrivacy: false,
  });
  const [errors, setErrors]   = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const hasSubmitted = useRef(false);

  const set = (field: keyof FormData, value: string | boolean) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const handlePhoneChange = (raw: string) => {
    set('phone', formatSAPhone(raw));
  };

  const handleIDChange = (raw: string) => {
    set('idNumber', raw.replace(/\D/g, '').slice(0, 13));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required';
    if (!form.email.trim())     e.email     = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';

    const phoneErr = validateSAPhone(form.phone);
    if (phoneErr) e.phone = phoneErr;

    const idErr = validateSAID(form.idNumber);
    if (idErr) e.idNumber = idErr;

    if (!form.position) e.position = 'Please select your position';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';

    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

    if (!form.agreeTerms)   e.agreeTerms   = 'You must accept the Terms of Service';
    if (!form.agreePrivacy) e.agreePrivacy = 'You must accept the Privacy Policy';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (hasSubmitted.current || loading) return;
    if (!validate()) return;
    hasSubmitted.current = true;
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);

    const saved = userStore.register({
      name:     `${form.firstName.trim()} ${form.lastName.trim()}`,
      email:    form.email.trim().toLowerCase(),
      password: form.password,
      role:     'super_admin',
      phone:    form.phone.trim(),
      position: form.position,
      idNumber: form.idNumber,
    });

    sessionStorage.setItem('currentUser', JSON.stringify({
      id:    saved.id,
      name:  saved.name,
      email: saved.email,
      phone: saved.phone ?? '',
      role:  saved.role,
    }));

    onSuccess?.();
  };

  const strength    = getStrength(form.password);
  const selectedPos = POSITIONS.find(p => p.value === form.position);

  return (
    <>
      <style>{CSS}</style>
      <div className="sar-page">
        <div className="sar-wrapper">

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
            <div className="sar-approval-tag">⚡ Full System Access</div>
          </div>

          {/* Two-col form */}
          <div className="sar-form-body">

            {/* ── LEFT COLUMN ── */}
            <div className="sar-col">
              <div className="sar-info-box">
                <span>🔒</span>
                <span>Super Admin accounts have <strong style={{ color:'#f0c000' }}>full system access</strong>. All fields are required.</span>
              </div>

              <div className="sar-section-title">Personal Details</div>

              <div className="sar-row2">
                <div className="sar-field">
                  <label className="sar-label">First Name *</label>
                  <input className={`sar-input${errors.firstName?' err':''}`}
                    type="text" placeholder="e.g. Sipho"
                    value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                  {errors.firstName && <span className="sar-error">⚠ {errors.firstName}</span>}
                </div>
                <div className="sar-field">
                  <label className="sar-label">Last Name *</label>
                  <input className={`sar-input${errors.lastName?' err':''}`}
                    type="text" placeholder="e.g. Nkosi"
                    value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                  {errors.lastName && <span className="sar-error">⚠ {errors.lastName}</span>}
                </div>
              </div>

              <div className="sar-field">
                <label className="sar-label">Email Address *</label>
                <input className={`sar-input${errors.email?' err':''}`}
                  type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)} />
                {errors.email && <span className="sar-error">⚠ {errors.email}</span>}
              </div>

              <div className="sar-row2">
                <div className="sar-field">
                  <label className="sar-label">Phone Number * <span style={{ color:'rgba(255,255,255,0.25)', fontWeight:400, textTransform:'none' }}>(+27)</span></label>
                  <input
                    className={`sar-input${errors.phone?' err':''}`}
                    type="tel"
                    placeholder="+27821234567"
                    value={form.phone}
                    maxLength={12}
                    style={{ fontFamily:'monospace', letterSpacing:'0.5px' }}
                    onChange={e => handlePhoneChange(e.target.value)}
                  />
                  {errors.phone
                    ? <span className="sar-error">⚠ {errors.phone}</span>
                    : <span className="sar-hint">+27 followed by 9 digits</span>
                  }
                </div>
                <div className="sar-field">
                  <label className="sar-label">SA ID Number *</label>
                  <input
                    className={`sar-input${errors.idNumber?' err':''}`}
                    type="text"
                    placeholder="13-digit SA ID"
                    value={form.idNumber}
                    maxLength={13}
                    style={{ fontFamily:'monospace', letterSpacing:'0.5px' }}
                    onChange={e => handleIDChange(e.target.value)}
                  />
                  {errors.idNumber
                    ? <span className="sar-error">⚠ {errors.idNumber}</span>
                    : <span className="sar-hint">South African ID — 13 digits</span>
                  }
                </div>
              </div>

              <hr className="sar-hr" />
              <div className="sar-section-title">Leadership Position *</div>

              <div className="sar-pos-grid">
                {POSITIONS.map(pos => (
                  <button key={pos.value} type="button"
                    className={`sar-pos-btn${form.position === pos.value ? ' sel' : ''}`}
                    onClick={() => set('position', pos.value)}>
                    <span style={{ fontSize:'1rem' }}>{pos.icon}</span>{pos.label}
                  </button>
                ))}
              </div>
              {errors.position && <span className="sar-error" style={{ display:'block', marginBottom:'0.5rem' }}>⚠ {errors.position}</span>}
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="sar-col">
              {/* Position preview */}
              {selectedPos ? (
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'rgba(240,192,0,0.07)', border:'1px solid rgba(240,192,0,0.2)', borderRadius:10, padding:'0.75rem 1rem', marginBottom:'1.25rem' }}>
                  <span style={{ fontSize:'1.3rem' }}>{selectedPos.icon}</span>
                  <div>
                    <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#f0c000' }}>{selectedPos.label}</div>
                    {form.firstName && <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', marginTop:1 }}>{form.firstName} {form.lastName}</div>}
                  </div>
                </div>
              ) : (
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1px dashed rgba(255,255,255,0.1)', borderRadius:10, padding:'0.75rem 1rem', marginBottom:'1.25rem', fontSize:'0.8rem', color:'rgba(255,255,255,0.25)', fontStyle:'italic' }}>
                  ← Select a leadership position on the left
                </div>
              )}

              <div className="sar-section-title">Set Password</div>

              <div className="sar-field">
                <label className="sar-label">Password *</label>
                <div className="sar-pw-wrap">
                  <input className={`sar-input${errors.password?' err':''}`}
                    type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
                    value={form.password} onChange={e => set('password', e.target.value)} />
                  <button className="sar-pw-eye" type="button" onClick={() => setShowPw(s => !s)}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {strength && (
                  <>
                    <div className="sar-str-bg"><div className="sar-str-fill" style={{ width:strength.pct, background:strength.color }} /></div>
                    <span className="sar-str-lbl" style={{ color:strength.color }}>{strength.label}</span>
                  </>
                )}
                {errors.password && <span className="sar-error">⚠ {errors.password}</span>}
              </div>

              <div className="sar-field">
                <label className="sar-label">Confirm Password *</label>
                <input className={`sar-input${errors.confirmPassword?' err':''}`}
                  type={showPw ? 'text' : 'password'} placeholder="Repeat your password"
                  value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                {errors.confirmPassword && <span className="sar-error">⚠ {errors.confirmPassword}</span>}
              </div>

              <hr className="sar-hr" />
              <div className="sar-section-title">Agreements *</div>

              <div className="sar-check">
                <input type="checkbox" id="agreeTerms" checked={form.agreeTerms}
                  onChange={e => set('agreeTerms', e.target.checked)} />
                <label className="sar-check-lbl" htmlFor="agreeTerms">
                  I agree to the <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a> and understand my responsibilities as a Super Admin.
                </label>
              </div>
              {errors.agreeTerms && <span className="sar-error" style={{ display:'block', marginBottom:'0.5rem' }}>⚠ {errors.agreeTerms}</span>}

              <div className="sar-check">
                <input type="checkbox" id="agreePrivacy" checked={form.agreePrivacy}
                  onChange={e => set('agreePrivacy', e.target.checked)} />
                <label className="sar-check-lbl" htmlFor="agreePrivacy">
                  I accept the <a href="#" onClick={e => e.preventDefault()}>POPIA Privacy Policy</a> and consent to my data being stored securely.
                </label>
              </div>
              {errors.agreePrivacy && <span className="sar-error" style={{ display:'block', marginBottom:'0.5rem' }}>⚠ {errors.agreePrivacy}</span>}

              <hr className="sar-hr" />

              <button className="btn-gold-full" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.75s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/></svg> Creating account…</>
                  : 'Create Account →'
                }
              </button>

              <div className="sar-login-link">
                Already have an account?{' '}
                <button onClick={onLoginInstead}>Sign in instead</button>
              </div>
            </div>
          </div>

          <p style={{ textAlign:'center', marginTop:'0.75rem', fontSize:'0.65rem', color:'rgba(255,255,255,0.18)' }}>
            POPIA: Handle data lawfully &amp; securely. · Sunday School Management Portal
          </p>
        </div>
      </div>
    </>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { width: 100%; min-height: 100vh; background: #071a0d; }

@keyframes spin { to { transform:rotate(360deg); } }

.sar-page {
  font-family:'DM Sans',sans-serif; min-height:100vh; width:100%;
  background:#071a0d; display:flex; flex-direction:column;
  align-items:center; padding:1.5rem 1.25rem 2.5rem;
}
.sar-wrapper { width:100%; max-width:820px; }

/* ── Topbar ── */
.sar-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; }
.sar-back { display:inline-flex; align-items:center; gap:0.4rem; background:none; border:none; color:rgba(255,255,255,0.4); font-family:'DM Sans',sans-serif; font-size:0.85rem; font-weight:600; cursor:pointer; padding:0; transition:color 0.15s; }
.sar-back:hover { color:#f0c000; }
.sar-brand { display:flex; align-items:center; gap:0.65rem; }
.sar-brand-logo { width:38px; height:38px; background:#f0c000; border-radius:8px; display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:0.95rem; color:#071a0d; }
.sar-brand-name { font-family:'Bebas Neue',sans-serif; font-size:1rem; letter-spacing:1px; color:#f0c000; }

/* ── Header card ── */
.sar-header-card { background:#0d3318; border:1px solid rgba(240,192,0,0.2); border-radius:14px 14px 0 0; border-bottom:2px solid rgba(240,192,0,0.25); padding:1.25rem 2rem; display:flex; align-items:center; gap:1.25rem; flex-wrap:wrap; }
.sar-icon-box { width:50px; height:50px; flex-shrink:0; background:rgba(240,192,0,0.12); border:1.5px solid rgba(240,192,0,0.3); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.6rem; }
.sar-head-title { font-family:'Bebas Neue',sans-serif; font-size:1.7rem; letter-spacing:2px; color:#f0c000; line-height:1; }
.sar-head-sub { font-size:0.73rem; color:rgba(255,255,255,0.35); margin-top:3px; }
.sar-approval-tag { margin-left:auto; background:rgba(240,192,0,0.1); border:1px solid rgba(240,192,0,0.25); color:#f0c000; font-size:0.7rem; font-weight:700; padding:0.3rem 0.85rem; border-radius:20px; white-space:nowrap; }

/* ── Two-col form body ── */
.sar-form-body { background:#0d3318; border:1px solid rgba(240,192,0,0.15); border-top:none; border-radius:0 0 14px 14px; display:grid; grid-template-columns:1fr 1fr; overflow:hidden; }
.sar-col { padding:1.75rem 2rem; }
.sar-col:first-child { border-right:1px solid rgba(255,255,255,0.06); }

/* ── Form elements ── */
.sar-section-title { font-family:'Bebas Neue',sans-serif; font-size:0.9rem; letter-spacing:1.5px; color:#f0c000; margin-bottom:1rem; padding-bottom:0.4rem; border-bottom:1px solid rgba(240,192,0,0.15); }
.sar-info-box { background:rgba(240,192,0,0.06); border:1px solid rgba(240,192,0,0.15); border-radius:9px; padding:0.78rem 0.95rem; font-size:0.8rem; color:rgba(255,255,255,0.5); display:flex; gap:0.55rem; line-height:1.55; margin-bottom:1.25rem; }
.sar-row2 { display:grid; grid-template-columns:1fr 1fr; gap:0.85rem; }
.sar-field { display:flex; flex-direction:column; margin-bottom:0.9rem; }
.sar-label { font-size:0.68rem; font-weight:700; color:rgba(255,255,255,0.45); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:0.4rem; }
.sar-hint { font-size:0.65rem; color:rgba(255,255,255,0.25); margin-top:0.2rem; }

.sar-input { width:100%; background:rgba(0,0,0,0.28); border:1.5px solid rgba(255,255,255,0.12); border-radius:8px; padding:0.65rem 0.9rem; color:#fff; font-family:'DM Sans',sans-serif; font-size:0.9rem; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
.sar-input:focus { border-color:#f0c000; box-shadow:0 0 0 3px rgba(240,192,0,0.1); }
.sar-input.err { border-color:#6b7280 !important; box-shadow:0 0 0 3px rgba(107,114,128,0.12); }
.sar-input::placeholder { color:rgba(255,255,255,0.2); }
.sar-error { font-size:0.72rem; color:#9ca3af; margin-top:0.28rem; font-weight:500; }

.sar-pos-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; margin-bottom:0.5rem; }
.sar-pos-btn { padding:0.72rem 0.8rem; border-radius:9px; border:1.5px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); color:rgba(255,255,255,0.5); font-family:'DM Sans',sans-serif; font-size:0.8rem; font-weight:600; cursor:pointer; text-align:left; display:flex; align-items:center; gap:0.5rem; transition:all 0.15s; }
.sar-pos-btn:hover { border-color:rgba(240,192,0,0.35); color:rgba(255,255,255,0.85); }
.sar-pos-btn.sel { border-color:#f0c000; background:rgba(240,192,0,0.1); color:#f0c000; }

.sar-pw-wrap { position:relative; }
.sar-pw-wrap .sar-input { padding-right:2.6rem; }
.sar-pw-eye { position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); background:none; border:none; color:rgba(255,255,255,0.3); cursor:pointer; font-size:0.95rem; padding:0; transition:color 0.15s; }
.sar-pw-eye:hover { color:#f0c000; }

.sar-str-bg { height:4px; border-radius:2px; background:rgba(255,255,255,0.08); margin:0.35rem 0 0.2rem; overflow:hidden; }
.sar-str-fill { height:100%; border-radius:2px; transition:width 0.35s,background 0.35s; }
.sar-str-lbl { font-size:0.68rem; font-weight:600; }

.sar-hr { border:none; border-top:1px solid rgba(255,255,255,0.07); margin:1.1rem 0; }

.sar-check { display:flex; align-items:flex-start; gap:0.6rem; margin-bottom:0.6rem; }
.sar-check input[type="checkbox"] { width:16px; height:16px; margin-top:3px; accent-color:#f0c000; flex-shrink:0; cursor:pointer; }
.sar-check-lbl { font-size:0.8rem; color:rgba(255,255,255,0.55); line-height:1.5; cursor:pointer; }
.sar-check-lbl a { color:#f0c000; text-decoration:none; font-weight:600; }

.btn-gold-full { width:100%; background:#f0c000; color:#071a0d; border:none; padding:0.85rem; border-radius:9px; font-size:0.95rem; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:0.5rem; }
.btn-gold-full:hover:not(:disabled) { background:#ffd200; transform:translateY(-1px); box-shadow:0 6px 20px rgba(240,192,0,0.35); }
.btn-gold-full:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

.sar-login-link { text-align:center; margin-top:1rem; font-size:0.8rem; color:rgba(255,255,255,0.3); }
.sar-login-link button { background:none; border:none; color:#f0c000; font-weight:700; cursor:pointer; font-size:0.8rem; font-family:'DM Sans',sans-serif; text-decoration:underline; padding:0; }

input, select { color-scheme:dark; }
input::placeholder { color:rgba(255,255,255,0.2); }

@media (max-width:880px) {
  .sar-form-body { grid-template-columns:1fr; }
  .sar-col:first-child { border-right:none; border-bottom:1px solid rgba(255,255,255,0.06); }
  .sar-page { padding:1rem 1.25rem 2rem; }
}
@media (max-width:540px) {
  .sar-row2 { grid-template-columns:1fr; }
  .sar-pos-grid { grid-template-columns:1fr; }
}
`;