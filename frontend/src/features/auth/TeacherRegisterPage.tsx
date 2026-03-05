// src/features/auth/TeacherRegisterPage.tsx
// Teacher registration form — matches the teacher role from RegisterModal.tsx
// Requires Super Admin approval before access is granted.
// v2: updated gold/green palette, required SA ID with Luhn checksum, localStorage save

import React, { useState } from 'react';

interface TeacherRegisterPageProps {
  onBack: () => void;
  onLoginInstead: () => void;
  onSuccess: () => void;
}

const GRADES_TAUGHT = ['Grade R', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.75rem', fontWeight: 600,
  color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', letterSpacing: '0.2px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 0.9rem', borderRadius: '9px',
  border: '1.5px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)', color: '#fff',
  fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem',
  outline: 'none', transition: 'border-color 0.2s',
  colorScheme: 'dark' as any,
};
const errStyle: React.CSSProperties = {
  fontSize: '0.72rem', color: '#f87171', marginTop: '0.3rem', display: 'block',
};

// ── SA format helpers ──────────────────────────────────────────────────────────
const formatSAPhone = (raw: string): string => {
  let digits = raw.replace(/[^\d]/g, '');
  if (digits.startsWith('0')) digits = '27' + digits.slice(1);
  if (!digits.startsWith('27')) digits = '27' + digits;
  digits = digits.slice(0, 11);
  return '+' + digits;
};

const validateSAPhone = (val: string): boolean =>
  /^\+27\d{9}$/.test(val.replace(/\s/g, ''));

const validateSAID = (val: string): boolean => /^\d{13}$/.test(val);

const luhnCheck = (val: string): boolean => {
  if (!/^\d{13}$/.test(val)) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let digit = parseInt(val[i], 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
};

export default function TeacherRegisterPage({ onBack, onLoginInstead, onSuccess }: TeacherRegisterPageProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 1 — personal info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('+27');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);

  // Step 2 — teaching details
  const [idNumber, setIdNumber]             = useState('');
  const [church, setChurch]                 = useState('');
  const [yearsExp, setYearsExp]             = useState('');
  const [gradesSelected, setGradesSelected] = useState<string[]>([]);
  const [dbs, setDbs]                       = useState(false);
  const [safeguarding, setSafeguarding]     = useState(false);
  const [motivation, setMotivation]         = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleGrade = (g: string) =>
    setGradesSelected(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const handlePhoneChange = (raw: string) => {
    const formatted = formatSAPhone(raw);
    setPhone(formatted);
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim())  e.firstName = 'First name is required.';
    if (!lastName.trim())   e.lastName  = 'Last name is required.';
    if (!email.trim())      e.email     = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email.';
    if (!phone.trim())      e.phone     = 'Phone number is required.';
    else if (!validateSAPhone(phone)) e.phone = 'Enter a valid SA number: +27 followed by 9 digits.';
    if (!password)          e.password  = 'Password is required.';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (password !== confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!idNumber.trim())             e.idNumber = 'SA ID Number is required.';
    else if (!validateSAID(idNumber)) e.idNumber = 'SA ID must be exactly 13 digits.';
    else if (!luhnCheck(idNumber))    e.idNumber = 'Invalid SA ID number (checksum failed).';
    if (!church.trim())               e.church     = 'Church / ministry name is required.';
    if (gradesSelected.length === 0)  e.grades     = 'Select at least one grade.';
    if (!motivation.trim())           e.motivation = 'Please provide a short motivation.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    // Save to localStorage
    const profile = {
      id: `teacher_${Date.now()}`,
      role: 'teacher',
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      idNumber,
      church,
      yearsExp,
      gradesSelected,
      dbs,
      safeguarding,
      motivation,
      status: 'pending_approval',
      registeredAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('ssp_current_user', JSON.stringify({
        id: profile.id,
        role: 'teacher',
        name: profile.name,
        email: profile.email,
        status: 'pending_approval',
      }));
      localStorage.setItem('ssp_teacher_profile', JSON.stringify(profile));
    } catch {}

    setSubmitted(true);
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <style>{CSS}</style>
        <div className="tr-root">
          <div className="tr-blob tr-blob-1" />
          <div className="tr-blob tr-blob-2" />

          <div className="tr-card tr-success-card">
            <div className="tr-success-icon">⏳</div>
            <h2 className="tr-success-title">Application Submitted!</h2>
            <p className="tr-success-body">
              Your teacher registration is under review. A{' '}
              <strong className="tr-success-admin">Super Admin</strong>{' '}
              will approve your account before you can sign in. You'll be notified via email once approved.
            </p>

            <div className="tr-notice" style={{ marginBottom: 0 }}>
              <span>i</span>
              <span>This is required for safeguarding and POPIA compliance. Thank you for your patience.</span>
            </div>

            {/* TESTING ONLY bypass block */}
            <div className="tr-testing-block">
              <div className="tr-testing-label">TESTING ONLY</div>
              <p className="tr-testing-sub">Bypass approval to preview the teacher dashboard.</p>
              <button className="tr-btn-testing" onClick={onSuccess}>
                My Dashboard →
              </button>
            </div>

            <button className="tr-btn-primary" onClick={onBack} style={{ marginTop: 4 }}>
              Back to Sign In
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="tr-root">

        <div className="tr-blob tr-blob-1" />
        <div className="tr-blob tr-blob-2" />

        <div className="tr-card">

          {/* Header */}
          <div className="tr-card-header">
            <div className="tr-brand">
              <div className="tr-brand-badge">🧑‍🏫</div>
              <div>
                <div className="tr-brand-name">Sunday School Portal</div>
                <div className="tr-brand-sub">Teacher Registration</div>
              </div>
            </div>
            <button className="tr-back" onClick={onBack}>← Back</button>
          </div>

          {/* Step indicator */}
          <div className="tr-steps">
            {['Personal Info', 'Teaching Details'].map((s, i) => (
              <div key={s} className={`tr-step${step === i + 1 ? ' tr-step--active' : step > i + 1 ? ' tr-step--done' : ''}`}>
                <div className="tr-step-num">{step > i + 1 ? '✓' : i + 1}</div>
                <span className="tr-step-label">{s}</span>
              </div>
            ))}
            <div className="tr-step-line" />
          </div>

          {/* Approval notice */}
          <div className="tr-notice">
            <span>i</span>
            <span>Teacher accounts require approval from a Super Admin before access is granted.</span>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={e => { e.preventDefault(); handleNext(); }} className="tr-form">

              <div className="tr-section-label">PERSONAL INFORMATION</div>

              <div className="tr-row-2">
                <div className="tr-field">
                  <label style={labelStyle}>First Name *</label>
                  <input style={{ ...inputStyle, borderColor: errors.firstName ? '#f87171' : 'rgba(255,255,255,0.1)' }}
                    placeholder="e.g. Thabo" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  {errors.firstName && <span style={errStyle}>{errors.firstName}</span>}
                </div>
                <div className="tr-field">
                  <label style={labelStyle}>Last Name *</label>
                  <input style={{ ...inputStyle, borderColor: errors.lastName ? '#f87171' : 'rgba(255,255,255,0.1)' }}
                    placeholder="e.g. Mokoena" value={lastName} onChange={e => setLastName(e.target.value)} />
                  {errors.lastName && <span style={errStyle}>{errors.lastName}</span>}
                </div>
              </div>

              <div className="tr-field">
                <label style={labelStyle}>Email Address *</label>
                <input style={{ ...inputStyle, borderColor: errors.email ? '#f87171' : 'rgba(255,255,255,0.1)' }}
                  type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                {errors.email && <span style={errStyle}>{errors.email}</span>}
              </div>

              <div className="tr-field">
                <label style={labelStyle}>Phone Number * <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>(+27 format)</span></label>
                <input
                  style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.5px', borderColor: errors.phone ? '#f87171' : 'rgba(255,255,255,0.1)' }}
                  type="tel" placeholder="+27831234567" value={phone} maxLength={12}
                  onChange={e => handlePhoneChange(e.target.value)}
                />
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem' }}>
                  Format: +27 followed by 9 digits · e.g. +27831234567
                </span>
                {errors.phone && <span style={errStyle}>{errors.phone}</span>}
              </div>

              <div className="tr-row-2">
                <div className="tr-field">
                  <label style={labelStyle}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...inputStyle, paddingRight: '2.8rem', borderColor: errors.password ? '#f87171' : 'rgba(255,255,255,0.1)' }}
                      type={showPw ? 'text' : 'password'} placeholder="Min 8 characters"
                      value={password} onChange={e => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.8rem' }}>
                      {showPw ? '🙈' : '👁'}
                    </button>
                  </div>
                  {errors.password && <span style={errStyle}>{errors.password}</span>}
                </div>
                <div className="tr-field">
                  <label style={labelStyle}>Confirm Password *</label>
                  <input style={{ ...inputStyle, borderColor: errors.confirm ? '#f87171' : 'rgba(255,255,255,0.1)' }}
                    type="password" placeholder="Repeat password"
                    value={confirm} onChange={e => setConfirm(e.target.value)} />
                  {errors.confirm && <span style={errStyle}>{errors.confirm}</span>}
                </div>
              </div>

              <button type="submit" className="tr-btn-primary">
                Next: Teaching Details →
              </button>

              <div className="tr-login-row">
                Already have an account?{' '}
                <button type="button" className="tr-link-btn" onClick={onLoginInstead}>Sign in instead</button>
              </div>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="tr-form">

              <div className="tr-section-label">MINISTRY INFORMATION</div>

              <div className="tr-row-2">
                <div className="tr-field">
                  <label style={labelStyle}>
                    SA ID Number * <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>(13 digits)</span>
                  </label>
                  <input
                    style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '1px', borderColor: errors.idNumber ? '#f87171' : 'rgba(255,255,255,0.1)' }}
                    placeholder="e.g. 9001015009087"
                    value={idNumber}
                    maxLength={13}
                    onChange={e => setIdNumber(e.target.value.replace(/\D/g, '').slice(0, 13))}
                  />
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem', display: 'block' }}>
                    e.g. 9001015009087 (13 digits)
                  </span>
                  {errors.idNumber && <span style={errStyle}>{errors.idNumber}</span>}
                </div>
                <div className="tr-field">
                  <label style={labelStyle}>Years of Experience</label>
                  <select style={inputStyle} value={yearsExp} onChange={e => setYearsExp(e.target.value)}>
                    <option value="">Select range</option>
                    {['Less than 1 year', '1–2 years', '3–5 years', '6–10 years', '10+ years'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="tr-field">
                <label style={labelStyle}>Church / Ministry Name *</label>
                <input style={{ ...inputStyle, borderColor: errors.church ? '#f87171' : 'rgba(255,255,255,0.1)' }}
                  placeholder="e.g. Grace Community Church" value={church} onChange={e => setChurch(e.target.value)} />
                {errors.church && <span style={errStyle}>{errors.church}</span>}
              </div>

              <div className="tr-field">
                <label style={labelStyle}>Grades You Can Teach * <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>(select all that apply)</span></label>
                <div className="tr-grade-grid">
                  {GRADES_TAUGHT.map(g => (
                    <button key={g} type="button" onClick={() => toggleGrade(g)}
                      className={`tr-grade-btn${gradesSelected.includes(g) ? ' tr-grade-btn--active' : ''}`}>
                      {g}
                    </button>
                  ))}
                </div>
                {errors.grades && <span style={errStyle}>{errors.grades}</span>}
              </div>

              <div className="tr-section-label" style={{ marginTop: '0.5rem' }}>CERTIFICATIONS</div>

              {[
                { label: 'I have a valid DBS / police clearance certificate', value: dbs, set: setDbs },
                { label: 'I have completed safeguarding training', value: safeguarding, set: setSafeguarding },
              ].map(({ label, value, set }) => (
                <div key={label} onClick={() => set(!value)} className={`tr-toggle-row${value ? ' tr-toggle-row--active' : ''}`}>
                  <div className="tr-toggle-dot" style={{ background: value ? '#f0c000' : 'rgba(255,255,255,0.08)', borderColor: value ? '#f0c000' : 'rgba(255,255,255,0.15)' }}>
                    {value && '✓'}
                  </div>
                  <span style={{ fontSize: '0.875rem', color: value ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)' }}>{label}</span>
                </div>
              ))}

              <div className="tr-field">
                <label style={labelStyle}>Motivation / Short Bio *</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 90, resize: 'vertical', borderColor: errors.motivation ? '#f87171' : 'rgba(255,255,255,0.1)' } as any}
                  placeholder="Why do you want to teach Sunday school? Share your heart..."
                  value={motivation} onChange={e => setMotivation(e.target.value)}
                />
                {errors.motivation && <span style={errStyle}>{errors.motivation}</span>}
              </div>

              <div className="tr-popia">
                <span>🔒</span>
                <span>Your information is collected under POPIA and used solely for vetting and ministry administration.</span>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button type="button" onClick={() => setStep(1)} className="tr-btn-ghost">← Back</button>
                <button type="submit" className="tr-btn-primary" style={{ flex: 1 }}>Submit Application</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { min-height: 100dvh; width: 100%; background: #071a0d; color: #fff; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }

@keyframes tr-fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

.tr-root {
  min-height: 100dvh; width: 100vw;
  display: flex; align-items: center; justify-content: center;
  padding: 24px 16px; position: relative; overflow: hidden;
  background: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(240,192,0,0.1) 0%, transparent 65%), #071a0d;
}

.tr-blob { position: absolute; border-radius: 50%; pointer-events: none; }
.tr-blob-1 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(240,192,0,0.07) 0%, transparent 70%); top: -120px; right: -80px; }
.tr-blob-2 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%); bottom: -80px; left: -60px; }

.tr-card {
  width: 100%; max-width: 560px;
  background: rgba(10,36,16,0.9); border: 1px solid rgba(240,192,0,0.12);
  border-radius: 20px; padding: clamp(24px,4vw,40px);
  box-shadow: 0 32px 80px rgba(0,0,0,0.55); animation: tr-fadeUp 0.55s ease both;
}

.tr-success-card { max-width: 460px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 18px; }
.tr-success-icon { font-size: 3.2rem; line-height: 1; filter: drop-shadow(0 0 18px rgba(240,192,0,0.3)); }
.tr-success-title { font-family: 'Sora', sans-serif; font-size: 1.55rem; font-weight: 800; color: #fff; letter-spacing: -0.4px; line-height: 1.2; }
.tr-success-body { font-size: 0.9rem; color: rgba(255,255,255,0.55); line-height: 1.65; max-width: 340px; }
.tr-success-admin { color: #f0c000; font-weight: 700; }

.tr-testing-block {
  width: 100%; border: 1.5px dashed rgba(240,192,0,0.4); border-radius: 12px;
  padding: 16px; background: rgba(240,192,0,0.04);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.tr-testing-label { font-size: 0.75rem; font-weight: 700; color: #f0c000; letter-spacing: 1px; text-transform: uppercase; }
.tr-testing-sub { font-size: 0.8rem; color: rgba(255,255,255,0.4); }
.tr-btn-testing {
  width: 100%; padding: 0.72rem; border-radius: 9px;
  border: 1.5px solid rgba(240,192,0,0.5); background: rgba(240,192,0,0.1);
  color: #f0c000; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 0.875rem;
  cursor: pointer; transition: all 0.2s; margin-top: 4px;
}
.tr-btn-testing:hover { background: rgba(240,192,0,0.18); border-color: #f0c000; }

.tr-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.tr-brand { display: flex; align-items: center; gap: 11px; }
.tr-brand-badge {
  width: 42px; height: 42px; border-radius: 11px;
  background: linear-gradient(135deg, #f0c000, #c89a00);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; box-shadow: 0 0 0 4px rgba(240,192,0,0.14); flex-shrink: 0;
}
.tr-brand-name { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 15px; color: #fff; letter-spacing: -0.2px; line-height: 1.2; }
.tr-brand-sub  { font-size: 11px; color: rgba(255,255,255,0.38); text-transform: uppercase; letter-spacing: 0.6px; margin-top: 2px; }
.tr-back {
  background: none; border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.5);
  font-family: 'DM Sans', sans-serif; font-size: 12.5px; padding: 7px 14px; border-radius: 8px;
  cursor: pointer; transition: all 0.18s; white-space: nowrap;
}
.tr-back:hover { color: #fff; border-color: rgba(255,255,255,0.28); }

.tr-steps { display: flex; align-items: center; gap: 0; margin-bottom: 20px; position: relative; padding-bottom: 2px; }
.tr-step-line { position: absolute; top: 15px; left: 15px; right: 15px; height: 2px; background: rgba(255,255,255,0.08); z-index: 0; }
.tr-step { display: flex; align-items: center; gap: 8px; flex: 1; position: relative; z-index: 1; }
.tr-step-num {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700; border: 2px solid rgba(255,255,255,0.15);
  background: #071a0d; color: rgba(255,255,255,0.35); transition: all 0.3s;
}
.tr-step--active .tr-step-num  { border-color: #f0c000; background: rgba(240,192,0,0.15); color: #f0c000; }
.tr-step--done   .tr-step-num  { border-color: #34d399; background: rgba(52,211,153,0.15); color: #34d399; }
.tr-step-label   { font-size: 0.78rem; font-weight: 600; color: rgba(255,255,255,0.35); transition: color 0.3s; }
.tr-step--active .tr-step-label { color: #f0c000; }
.tr-step--done   .tr-step-label { color: #34d399; }

.tr-notice {
  display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; border-radius: 9px;
  background: rgba(240,192,0,0.07); border: 1px solid rgba(240,192,0,0.2);
  font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-bottom: 22px; line-height: 1.5; width: 100%;
}
.tr-notice span:first-child { color: #f0c000; flex-shrink: 0; font-size: 1rem; }

.tr-form { display: flex; flex-direction: column; gap: 14px; }
.tr-section-label { font-size: 0.68rem; font-weight: 700; color: rgba(255,255,255,0.3); letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
.tr-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.tr-field { display: flex; flex-direction: column; }

.tr-grade-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.4rem; }
.tr-grade-btn {
  padding: 0.35rem 0.85rem; border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.45); font-size: 0.78rem; font-weight: 600; cursor: pointer;
  font-family: 'DM Sans', sans-serif; transition: all 0.15s;
}
.tr-grade-btn:hover { border-color: rgba(240,192,0,0.3); color: rgba(255,255,255,0.75); }
.tr-grade-btn--active { background: rgba(240,192,0,0.12); border-color: #f0c000; color: #f0c000; }

.tr-toggle-row {
  display: flex; align-items: flex-start; gap: 0.85rem; padding: 0.85rem 1rem;
  border-radius: 10px; cursor: pointer;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s;
}
.tr-toggle-row--active { background: rgba(240,192,0,0.07); border-color: rgba(240,192,0,0.25); }
.tr-toggle-dot {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; color: #071a0d; font-weight: 900; border: 2px solid; transition: all 0.2s;
}

.tr-btn-primary {
  width: 100%; padding: 0.82rem; border-radius: 9px; border: none;
  background: linear-gradient(135deg, #f0c000 0%, #c89a00 100%);
  color: #071a0d; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 0.9rem;
  cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 20px rgba(240,192,0,0.25);
}
.tr-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(240,192,0,0.38); background: linear-gradient(135deg, #ffd200 0%, #f0c000 100%); }
.tr-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.tr-btn-ghost {
  padding: 0.82rem 1.25rem; border-radius: 9px;
  border: 1px solid rgba(255,255,255,0.12); background: transparent;
  color: rgba(255,255,255,0.55); font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.tr-btn-ghost:hover { border-color: rgba(255,255,255,0.28); color: #fff; }

.tr-popia {
  display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; border-radius: 9px;
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  font-size: 0.77rem; color: rgba(255,255,255,0.35); line-height: 1.55;
}

.tr-login-row { text-align: center; font-size: 13px; color: rgba(255,255,255,0.35); margin-top: 4px; }
.tr-link-btn {
  background: none; border: none; color: #f0c000; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  padding: 0; text-decoration: underline; text-underline-offset: 2px; transition: opacity 0.18s;
}
.tr-link-btn:hover { opacity: 0.75; }

input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.22); }
input:focus, select:focus, textarea:focus { border-color: #f0c000 !important; outline: none; box-shadow: 0 0 0 3px rgba(240,192,0,0.12); }
select option { background: #0a2410; color: #fff; }

@media (max-width: 520px) {
  .tr-row-2 { grid-template-columns: 1fr; }
  .tr-card  { padding: 22px 18px; }
  .tr-step-label { display: none; }
}
`;