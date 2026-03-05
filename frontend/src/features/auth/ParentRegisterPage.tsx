// src/features/auth/ParentRegisterPage.tsx

import { useState } from 'react';

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
  altPhone: string;
  gender: string;
  dateOfBirth: string;
  idNumber: string;
  physicalAddress: string;
  suburb: string;
  city: string;
  relationshipToChildren: string;
  employmentStatus: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeNotifications: boolean;
};

const initialForm: FormData = {
  firstName: '', lastName: '', email: '', phone: '+27', altPhone: '+27',
  gender: '', dateOfBirth: '', idNumber: '', physicalAddress: '',
  suburb: '', city: '', relationshipToChildren: '', employmentStatus: '',
  password: '', confirmPassword: '',
  agreeTerms: false, agreePrivacy: false, agreeNotifications: false,
};

const STEPS = [
  { id: 1, label: 'Personal Info',  icon: '👤' },
  { id: 2, label: 'Contact',        icon: '📞' },
  { id: 3, label: 'Account',        icon: '🔑' },
];

// ── SA Phone helpers ────────────────────────────────────────────────────────────
const formatSAPhone = (raw: string): string => {
  let digits = raw.replace(/[^\d]/g, '');
  if (digits.startsWith('0')) digits = '27' + digits.slice(1);
  if (!digits.startsWith('27')) digits = '27' + digits;
  digits = digits.slice(0, 11); // 27 + 9 digits
  return '+' + digits;
};
const validateSAPhone = (val: string): boolean =>
  val === '+27' || /^\+27\d{9}$/.test(val.replace(/\s/g, ''));

// ── DOB dd/mm/yyyy helpers ──────────────────────────────────────────────────────
// Format raw digits into dd/mm/yyyy as user types
const formatDOB = (raw: string): string => {
  // Keep only digits
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const validateDOB = (val: string): string | null => {
  if (!val) return 'Required';
  const parts = val.split('/');
  if (parts.length !== 3) return 'Use dd/mm/yyyy format';
  const [dd, mm, yyyy] = parts.map(Number);
  if (!dd || !mm || !yyyy) return 'Use dd/mm/yyyy format';
  if (yyyy.toString().length !== 4) return 'Enter a 4-digit year';
  const currentYear = new Date().getFullYear();
  if (yyyy < 1900 || yyyy > currentYear) return `Year must be between 1900 and ${currentYear}`;
  if (mm < 1 || mm > 12) return 'Month must be between 01 and 12';
  // Days in month (accounting for leap years)
  const daysInMonth = new Date(yyyy, mm, 0).getDate();
  if (dd < 1 || dd > daysInMonth) return `Day must be between 01 and ${daysInMonth}`;
  // Must be at least 16 years old
  const dob = new Date(yyyy, mm - 1, dd);
  const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  if (age < 16) return 'Parent/caregiver must be at least 16 years old';
  return null;
};

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

const lbl: React.CSSProperties = {
  display: 'block', fontSize: '0.68rem', fontWeight: 700,
  color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase',
  letterSpacing: '0.6px', marginBottom: '0.35rem',
};
const errStyle: React.CSSProperties = {
  fontSize: '0.7rem', color: '#f87171', marginTop: '0.25rem', fontWeight: 500,
};
const hintStyle: React.CSSProperties = {
  fontSize: '0.67rem', color: 'rgba(255,255,255,0.28)', marginTop: '0.25rem',
};
const radioOpt: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.5rem 0.9rem', borderRadius: '7px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)',
  fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
};
const radioOptActive: React.CSSProperties = {
  border: '1px solid #34d399', background: 'rgba(52,211,153,0.12)', color: '#34d399',
};

export default function ParentRegisterPage({ onBack, onLoginInstead, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof FormData, value: string | boolean) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const handleDOBChange = (raw: string) => {
    const formatted = formatDOB(raw);
    set('dateOfBirth', formatted);
  };

  const handlePhoneChange = (field: 'phone' | 'altPhone', raw: string) => {
    set(field, formatSAPhone(raw));
  };

  const validateStep = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (step === 1) {
      if (!form.firstName.trim())  e.firstName  = 'Required';
      if (!form.lastName.trim())   e.lastName   = 'Required';
      if (!form.gender)            e.gender     = 'Required';
      const dobErr = validateDOB(form.dateOfBirth);
      if (dobErr) e.dateOfBirth = dobErr;
      if (!form.relationshipToChildren) e.relationshipToChildren = 'Required';
    }
    if (step === 2) {
      if (!form.phone.trim() || form.phone === '+27') {
        e.phone = 'Required';
      } else if (!validateSAPhone(form.phone)) {
        e.phone = 'Enter a valid SA number: +27 followed by 9 digits';
      }
      if (form.altPhone && form.altPhone !== '+27' && !validateSAPhone(form.altPhone)) {
        e.altPhone = 'Enter a valid SA number: +27 followed by 9 digits';
      }
      if (!form.physicalAddress.trim()) e.physicalAddress = 'Required';
      if (!form.city.trim())           e.city    = 'Required';
    }
    if (step === 3) {
      if (!form.email.trim())   e.email   = 'Required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
      if (!form.password)       e.password = 'Required';
      else if (form.password.length < 8) e.password = 'Minimum 8 characters';
      if (!form.confirmPassword) e.confirmPassword = 'Required';
      else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
      if (!form.agreeTerms)    e.agreeTerms   = 'Required';
      if (!form.agreePrivacy)  e.agreePrivacy = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, 3)); };
  const back = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = () => {
    if (!validateStep()) return;
    console.log('Parent registered:', form);
    setSubmitted(true);
    setTimeout(() => { onSuccess?.(); }, 2000);
  };

  const strength = getStrength(form.password);

  const RadioGroup = ({
    label, field, options,
  }: { label: string; field: keyof FormData; options: { value: string; label: string }[] }) => (
    <div>
      {label && <label style={lbl}>{label}</label>}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: label ? '0.35rem' : 0 }}>
        {options.map(opt => (
          <label key={opt.value} style={{
            ...radioOpt,
            ...(form[field] === opt.value ? radioOptActive : {}),
          }}>
            <input type="radio" name={field} value={opt.value}
              checked={form[field] === opt.value}
              onChange={() => set(field, opt.value)}
              style={{ accentColor: '#34d399' }}
            />
            {opt.label}
          </label>
        ))}
      </div>
      {errors[field] && <span style={errStyle}>{errors[field]}</span>}
    </div>
  );

  if (submitted) {
    return (
      <>
        <style>{BASE_CSS}</style>
        <div style={{
          minHeight: '100vh', background: '#0a2e12',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: 80, height: 80,
              background: 'rgba(52,211,153,0.12)', border: '2px solid #34d399',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '2.5rem',
              margin: '0 auto 1.5rem',
              animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: '0 0 40px rgba(52,211,153,0.2)',
            }}>✅</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#34d399', letterSpacing: 2 }}>
              Account Created!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', maxWidth: 360, margin: '0.75rem auto 0', lineHeight: 1.7 }}>
              Welcome, <strong style={{ color: '#34d399' }}>{form.firstName}</strong>!
              Your parent account is ready. Taking you to your dashboard…
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%', background: '#34d399',
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
      <style>{BASE_CSS}</style>
      <div className="pr-page">
        <div className="pr-wrapper">

          {/* Top bar */}
          <div className="pr-topbar">
            <button className="pr-back" onClick={onBack}>← Back to role selection</button>
            <div className="pr-brand">
              <div className="pr-brand-logo">SS</div>
              <span className="pr-brand-name">Sunday School Portal</span>
            </div>
          </div>

          {/* Header card */}
          <div className="pr-header-card">
            <div className="pr-icon-box">👨‍👩‍👧</div>
            <div>
              <div className="pr-head-title">Parent / Caregiver Registration</div>
              <div className="pr-head-sub">Register to manage your children's Sunday school journey</div>
            </div>
            <div className="pr-step-badge">STEP {step} OF 3</div>
          </div>

          {/* Step nav */}
          <div className="pr-step-nav">
            {STEPS.map((s, i) => (
              <div key={s.id} className="pr-step-item">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className={`pr-step-bubble ${step === s.id ? 'active' : step > s.id ? 'done' : 'pending'}`}>
                    {step > s.id ? '✓' : s.icon}
                  </div>
                  <span className="pr-step-lbl" style={{
                    color: step === s.id ? '#34d399' : step > s.id ? 'rgba(52,211,153,0.55)' : 'rgba(255,255,255,0.22)',
                  }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`pr-step-connector ${step > s.id ? 'done' : 'pending'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="pr-card">
            <div className="pr-body">

              {/* ══ STEP 1 — Personal Info ══ */}
              {step === 1 && (
                <div className="fade-in">
                  <div className="pr-section-title">Personal Information</div>
                  <div style={{ display: 'grid', gap: '1rem' }}>

                    <div className="pr-grid-2">
                      <div>
                        <label style={lbl}>First Name *</label>
                        <input className={`pr-input${errors.firstName ? ' err' : ''}`}
                          type="text" placeholder="e.g. Nomsa"
                          value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                        {errors.firstName && <span style={errStyle}>{errors.firstName}</span>}
                      </div>
                      <div>
                        <label style={lbl}>Last Name *</label>
                        <input className={`pr-input${errors.lastName ? ' err' : ''}`}
                          type="text" placeholder="e.g. Dlamini"
                          value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                        {errors.lastName && <span style={errStyle}>{errors.lastName}</span>}
                      </div>
                    </div>

                    <RadioGroup label="Gender *" field="gender" options={[
                      { value: 'female', label: 'Female' },
                      { value: 'male',   label: 'Male'   },
                      { value: 'other',  label: 'Other'  },
                    ]} />

                    <div className="pr-grid-2">
                      <div>
                        <label style={lbl}>Date of Birth * <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, textTransform: 'none' }}>(dd/mm/yyyy)</span></label>
                        <input
                          className={`pr-input${errors.dateOfBirth ? ' err' : ''}`}
                          type="text"
                          placeholder="dd/mm/yyyy"
                          value={form.dateOfBirth}
                          maxLength={10}
                          style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
                          onChange={e => handleDOBChange(e.target.value)}
                        />
                        {errors.dateOfBirth
                          ? <span style={errStyle}>{errors.dateOfBirth}</span>
                          : <span style={hintStyle}>e.g. 15/06/1990</span>
                        }
                      </div>
                      <div>
                        <label style={lbl}>ID / Passport Number</label>
                        <input className="pr-input" type="text" placeholder="Optional"
                          value={form.idNumber} onChange={e => set('idNumber', e.target.value)} />
                      </div>
                    </div>

                    <div>
                      <label style={lbl}>Relationship to Children *</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
                        {['Mother', 'Father', 'Grandmother', 'Grandfather', 'Aunt', 'Uncle', 'Legal Guardian', 'Other'].map(rel => (
                          <label key={rel} style={{
                            ...radioOpt,
                            ...(form.relationshipToChildren === rel ? radioOptActive : {}),
                          }}>
                            <input type="radio" name="relationshipToChildren" value={rel}
                              checked={form.relationshipToChildren === rel}
                              onChange={() => set('relationshipToChildren', rel)}
                              style={{ accentColor: '#34d399' }} />
                            {rel}
                          </label>
                        ))}
                      </div>
                      {errors.relationshipToChildren && <span style={errStyle}>{errors.relationshipToChildren}</span>}
                    </div>

                    <div>
                      <label style={lbl}>Employment Status</label>
                      <select className="pr-input" value={form.employmentStatus}
                        onChange={e => set('employmentStatus', e.target.value)}>
                        <option value="">Select status…</option>
                        {['Employed (Full-time)', 'Employed (Part-time)', 'Self-employed', 'Unemployed', 'Student', 'Retired'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 2 — Contact Details ══ */}
              {step === 2 && (
                <div className="fade-in">
                  <div className="pr-section-title">Contact & Address</div>
                  <div style={{ display: 'grid', gap: '1rem' }}>

                    <div className="pr-grid-2">
                      <div>
                        <label style={lbl}>Primary Phone Number *</label>
                        <input
                          className={`pr-input${errors.phone ? ' err' : ''}`}
                          type="tel"
                          placeholder="+27831234567"
                          value={form.phone}
                          maxLength={12}
                          style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
                          onChange={e => handlePhoneChange('phone', e.target.value)}
                        />
                        {errors.phone
                          ? <span style={errStyle}>{errors.phone}</span>
                          : <span style={hintStyle}>Format: +27 followed by 9 digits</span>
                        }
                      </div>
                      <div>
                        <label style={lbl}>Alternative Phone <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                        <input
                          className={`pr-input${errors.altPhone ? ' err' : ''}`}
                          type="tel"
                          placeholder="+27831234567"
                          value={form.altPhone}
                          maxLength={12}
                          style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
                          onChange={e => handlePhoneChange('altPhone', e.target.value)}
                        />
                        {errors.altPhone
                          ? <span style={errStyle}>{errors.altPhone}</span>
                          : <span style={hintStyle}>Format: +27 followed by 9 digits</span>
                        }
                      </div>
                    </div>

                    <div>
                      <label style={lbl}>Physical Address *</label>
                      <input className={`pr-input${errors.physicalAddress ? ' err' : ''}`}
                        type="text" placeholder="Street address and number"
                        value={form.physicalAddress} onChange={e => set('physicalAddress', e.target.value)} />
                      {errors.physicalAddress && <span style={errStyle}>{errors.physicalAddress}</span>}
                    </div>

                    <div className="pr-grid-2">
                      <div>
                        <label style={lbl}>Suburb</label>
                        <input className="pr-input" type="text" placeholder="e.g. Soweto"
                          value={form.suburb} onChange={e => set('suburb', e.target.value)} />
                      </div>
                      <div>
                        <label style={lbl}>City *</label>
                        <input className={`pr-input${errors.city ? ' err' : ''}`}
                          type="text" placeholder="e.g. Johannesburg"
                          value={form.city} onChange={e => set('city', e.target.value)} />
                        {errors.city && <span style={errStyle}>{errors.city}</span>}
                      </div>
                    </div>

                    <div className="pr-info-box">
                      <span>📱</span>
                      <span>Your phone number will be used for SMS notifications about your children's attendance and welfare updates.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 3 — Account & Consent ══ */}
              {step === 3 && (
                <div className="fade-in">
                  <div className="pr-section-title">Account Setup</div>
                  <div style={{ display: 'grid', gap: '1rem' }}>

                    <div>
                      <label style={lbl}>Email Address *</label>
                      <input className={`pr-input${errors.email ? ' err' : ''}`}
                        type="email" placeholder="your@email.com"
                        value={form.email} onChange={e => set('email', e.target.value)} />
                      {errors.email && <span style={errStyle}>{errors.email}</span>}
                    </div>

                    <div>
                      <label style={lbl}>Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input className={`pr-input${errors.password ? ' err' : ''}`}
                          type={showPw ? 'text' : 'password'}
                          placeholder="Minimum 8 characters" style={{ paddingRight: '2.75rem' }}
                          value={form.password} onChange={e => set('password', e.target.value)} />
                        <button type="button"
                          onClick={() => setShowPw(s => !s)}
                          style={{
                            position: 'absolute', right: '0.75rem', top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                            cursor: 'pointer', fontSize: '1rem', padding: 0,
                          }}>
                          {showPw ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {strength && (
                        <>
                          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', margin: '0.35rem 0 0.2rem', overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 2, width: strength.pct, background: strength.color, transition: 'width 0.35s, background 0.35s' }} />
                          </div>
                          <span style={{ fontSize: '0.67rem', fontWeight: 600, color: strength.color }}>{strength.label}</span>
                        </>
                      )}
                      {errors.password && <span style={errStyle}>{errors.password}</span>}
                    </div>

                    <div>
                      <label style={lbl}>Confirm Password *</label>
                      <input className={`pr-input${errors.confirmPassword ? ' err' : ''}`}
                        type={showPw ? 'text' : 'password'} placeholder="Repeat your password"
                        value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                      {errors.confirmPassword && <span style={errStyle}>{errors.confirmPassword}</span>}
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0.25rem 0' }} />

                    <div className="pr-section-title" style={{ marginBottom: '0.75rem' }}>Agreements</div>

                    {[
                      { field: 'agreeTerms' as keyof FormData, label: <>I agree to the <a href="#" onClick={e => e.preventDefault()} style={{ color: '#34d399', fontWeight: 700 }}>Terms of Service</a> and understand my responsibilities as a parent/caregiver.</> },
                      { field: 'agreePrivacy' as keyof FormData, label: <>I accept the <a href="#" onClick={e => e.preventDefault()} style={{ color: '#34d399', fontWeight: 700 }}>POPIA Privacy Policy</a> and consent to my data being stored securely.</> },
                      { field: 'agreeNotifications' as keyof FormData, label: 'I agree to receive SMS/WhatsApp notifications about my children\'s attendance, feeding, and welfare updates.' },
                    ].map(({ field, label }) => (
                      <div key={field}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                          <input type="checkbox" id={field} checked={!!form[field]}
                            onChange={e => set(field, e.target.checked)}
                            style={{ width: 15, height: 15, marginTop: 2, accentColor: '#34d399', flexShrink: 0, cursor: 'pointer' }} />
                          <label htmlFor={field} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, cursor: 'pointer' }}>
                            {label}
                          </label>
                        </div>
                        {errors[field] && <span style={{ ...errStyle, display: 'block', marginTop: '0.25rem' }}>{errors[field]}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: '2rem', paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div>
                  {step > 1 && (
                    <button className="btn-outline" onClick={back}>← Back</button>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
                    {step} / {STEPS.length}
                  </span>
                  {step < 3
                    ? <button className="btn-green" onClick={next}>Continue →</button>
                    : <button className="btn-green" onClick={handleSubmit}>Create Account ✓</button>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Login link */}
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
            Already have an account?{' '}
            <button onClick={onLoginInstead}
              style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem', fontFamily: "'DM Sans', sans-serif", textDecoration: 'underline', padding: 0 }}>
              Sign in instead
            </button>
          </p>

          <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.18)' }}>
            POPIA: Handle data lawfully &amp; securely. · Sunday School Management Portal
          </p>
        </div>
      </div>
    </>
  );
}

const BASE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { width: 100%; min-height: 100vh; background: #0a2e12; }

@keyframes popIn  { from { transform:scale(0.4); opacity:0; } to { transform:scale(1); opacity:1; } }
@keyframes pulse  { 0%,100% { opacity:0.3; } 50% { opacity:1; } }
@keyframes fadeIn { from { opacity:0; transform:translateX(8px); } to { opacity:1; transform:translateX(0); } }

.fade-in { animation: fadeIn 0.22s ease; }

.pr-page {
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  background: #0a2e12;
  display: flex; flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem 2rem;
}

.pr-wrapper { width: 100%; max-width: 680px; }

.pr-topbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.25rem;
}
.pr-back {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: none; border: none; color: rgba(255,255,255,0.45);
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
  cursor: pointer; padding: 0; transition: color 0.15s;
}
.pr-back:hover { color: #34d399; }
.pr-brand { display: flex; align-items: center; gap: 0.6rem; }
.pr-brand-logo {
  width: 36px; height: 36px; background: #f0c000;
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-family: 'Bebas Neue', sans-serif; font-size: 0.9rem; color: #0a2e12;
}
.pr-brand-name { font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 1px; color: #f0c000; }

.pr-header-card {
  background: #0d3318;
  border: 1px solid rgba(52,211,153,0.2);
  border-bottom: 2px solid rgba(52,211,153,0.25);
  border-radius: 14px 14px 0 0;
  padding: 1.25rem 1.75rem;
  display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
}
.pr-icon-box {
  width: 48px; height: 48px; flex-shrink: 0;
  background: rgba(52,211,153,0.1); border: 1.5px solid rgba(52,211,153,0.3);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
}
.pr-head-title {
  font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem;
  letter-spacing: 2px; color: #34d399; line-height: 1;
}
.pr-head-sub { font-size: 0.72rem; color: rgba(255,255,255,0.38); margin-top: 3px; }
.pr-step-badge {
  margin-left: auto;
  background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25);
  color: #34d399; font-size: 0.68rem; font-weight: 700;
  padding: 0.28rem 0.75rem; border-radius: 20px; white-space: nowrap;
}

.pr-step-nav {
  display: flex; align-items: center;
  padding: 1rem 1.75rem;
  background: rgba(0,0,0,0.15);
  border-left: 1px solid rgba(52,211,153,0.12);
  border-right: 1px solid rgba(52,211,153,0.12);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.pr-step-item { display: flex; align-items: center; flex: 1; }
.pr-step-bubble {
  width: 30px; height: 30px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 700; flex-shrink: 0;
  transition: all 0.3s; border: 2px solid transparent;
}
.pr-step-bubble.active { background: #34d399; color: #0a2e12; box-shadow: 0 0 14px rgba(52,211,153,0.45); }
.pr-step-bubble.done   { background: transparent; border-color: #34d399; color: #34d399; }
.pr-step-bubble.pending { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.25); }
.pr-step-lbl { font-size: 0.66rem; font-weight: 600; text-align: center; margin-top: 0.2rem; letter-spacing: 0.3px; }
.pr-step-connector { flex: 1; height: 2px; margin: 0 4px; margin-bottom: 14px; border-radius: 1px; transition: background 0.4s; }
.pr-step-connector.done    { background: #34d399; }
.pr-step-connector.pending { background: rgba(255,255,255,0.08); }

.pr-card {
  background: #0d3318;
  border: 1px solid rgba(52,211,153,0.12);
  border-top: none; border-radius: 0 0 14px 14px;
}
.pr-body { padding: 1.75rem 1.75rem 2rem; }

.pr-section-title {
  font-family: 'Bebas Neue', sans-serif; font-size: 1rem;
  letter-spacing: 1.5px; color: #34d399;
  margin-bottom: 1rem; padding-bottom: 0.45rem;
  border-bottom: 1px solid rgba(52,211,153,0.15);
}

.pr-input {
  width: 100%; background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
  padding: 0.62rem 0.85rem; color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 0.875rem; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.pr-input:focus { border-color: #34d399; box-shadow: 0 0 0 3px rgba(52,211,153,0.1); }
.pr-input.err   { border-color: #f87171 !important; }
.pr-input::placeholder { color: rgba(255,255,255,0.2); }
.pr-input option { background: #0d3318; color: #fff; }

.pr-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }

.pr-info-box {
  background: rgba(52,211,153,0.05); border: 1px solid rgba(52,211,153,0.15);
  border-radius: 9px; padding: 0.75rem 0.9rem;
  font-size: 0.78rem; color: rgba(255,255,255,0.55);
  display: flex; gap: 0.55rem; line-height: 1.5;
}

.btn-green {
  background: #34d399; color: #042a15;
  border: none; padding: 0.65rem 1.75rem;
  border-radius: 7px; font-size: 0.875rem; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
}
.btn-green:hover { background: #4ade80; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(52,211,153,0.3); }

.btn-outline {
  background: transparent; color: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.15);
  padding: 0.65rem 1.5rem; border-radius: 7px;
  font-size: 0.875rem; font-weight: 600;
  cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
}
.btn-outline:hover { border-color: rgba(255,255,255,0.35); color: #fff; }

@media (max-width: 540px) {
  .pr-grid-2 { grid-template-columns: 1fr; }
  .pr-body { padding: 1.25rem; }
  .pr-header-card { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  .pr-step-badge { margin-left: 0; }
}
`;