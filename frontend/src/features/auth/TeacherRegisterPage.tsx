// src/features/auth/TeacherRegisterPage.tsx
import { useState } from 'react';
import { userStore } from '../../stores/userStore';

interface Props {
  onBack?: () => void;
  onLoginInstead?: () => void;
  onSuccess?: (role?: string) => void;   // called after success (goes to login screen)
}

function isValidSAPhone(local: string) {
  return /^[6-8][0-9]{8}$/.test(local.replace(/\s/g, ''));
}

function FW({ label, err, children, hint, optional }: { label: string; err?: string; children: React.ReactNode; hint?: string; optional?: boolean }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
        {label} {!optional && <span style={{ color: '#f0c000' }}>*</span>}
        {optional && <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}> (optional)</span>}
      </label>
      {children}
      {err && <span style={{ display: 'block', fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.3rem' }}>⚠ {err}</span>}
      {!err && hint && <span style={{ display: 'block', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.25rem' }}>{hint}</span>}
    </div>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .tr-page { min-height: 100dvh; width: 100%; background: #0a2e12; display: flex; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; color: #fff; padding: 24px; }
  .tr-card { max-width: 780px; width: 100%; background: rgba(0,0,0,0.28); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 36px 40px; box-shadow: 0 32px 80px rgba(0,0,0,0.55); }
  .tr-top { display: flex; align-items: center; gap: 0.875rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .tr-logo-badge { width: 40px; height: 40px; background: #f0c000; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 1rem; color: #071a0d; flex-shrink: 0; }
  .tr-title { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 2px; color: #fff; margin-bottom: 0.15rem; }
  .tr-sub { font-size: 0.75rem; color: rgba(255,255,255,0.35); }
  .tr-cols { display: grid; grid-template-columns: 1fr 1px 1fr; gap: 2rem; }
  .tr-divider { background: rgba(255,255,255,0.07); }
  .tr-section { font-family: 'Bebas Neue', sans-serif; font-size: 0.82rem; letter-spacing: 1.5px; color: #f0c000; border-bottom: 1px solid rgba(240,192,0,0.18); padding-bottom: 0.4rem; margin: 0 0 1rem; }
  .tr-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
  .tr-phone-row { display: flex; border-radius: 7px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); }
  .tr-phone-row.err { border-color: #9ca3af; }
  .tr-phone-prefix { background: rgba(240,192,0,0.1); border-right: 1px solid rgba(255,255,255,0.12); padding: 0 0.75rem; display: flex; align-items: center; font-size: 0.875rem; font-weight: 700; color: #f0c000; white-space: nowrap; flex-shrink: 0; }
  .tr-phone-input { flex: 1; background: rgba(0,0,0,0.3); border: none; padding: 0.62rem 0.85rem; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; outline: none; }
  .pw-wrap { position: relative; }
  .pw-toggle { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 0.8rem; padding: 0; }
  .pw-toggle:hover { color: #fff; }
  .btn-primary { width: 100%; padding: 0.82rem; border-radius: 9px; border: none; background: linear-gradient(135deg, #f0c000, #d4a800); color: #071a0d; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; margin-top: 0.75rem; }
  .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(240,192,0,0.3); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .tr-footer { display: flex; justify-content: space-between; margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.07); font-size: 0.8rem; color: rgba(255,255,255,0.3); flex-wrap: wrap; gap: 0.5rem; align-items: center; }
  .tr-link { color: #f0c000; cursor: pointer; text-decoration: underline; }
  .tr-link:hover { color: #ffd200; }
  select option { background: #0a2e12; }

  /* Success screen */
  .tr-success { text-align: center; padding: 2.5rem 1.5rem; }
  .tr-success-icon { font-size: 3.5rem; margin-bottom: 1.25rem; }
  .tr-success-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 2px; color: #f0c000; margin-bottom: 0.75rem; }
  .tr-success-notice { background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.25); border-radius: 12px; padding: 1.1rem 1.4rem; margin: 1rem auto; max-width: 420px; font-size: 0.82rem; color: rgba(255,255,255,0.65); line-height: 1.7; text-align: left; }
  .tr-success-notice strong { color: #fbbf24; }

  @media (max-width: 680px) { .tr-cols { grid-template-columns: 1fr; } .tr-divider { display: none; } .tr-g2 { grid-template-columns: 1fr; } }
`;

const GRADES = ['Grade R', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Multiple Grades'];

export default function TeacherRegisterPage({ onBack, onLoginInstead }: Props) {
  const [form, setForm] = useState({
    name: '', surname: '', email: '', password: '', confirm: '',
    phone: '', grades: '', experience: '',
  });
  const [errs, setErrs]       = useState<Record<string, string>>({});
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrs(p => ({ ...p, [k]: '' })); };

  const setPhone = (v: string) => {
    let d = v.replace(/[^0-9]/g, '');
    if (d.startsWith('0')) d = d.slice(1);
    if (d.startsWith('27')) d = d.slice(2);
    set('phone', d.slice(0, 9));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())          e.name     = 'First name is required';
    if (!form.surname.trim())       e.surname  = 'Last name is required';
    if (!form.email.includes('@'))  e.email    = 'Valid email required';
    if (userStore.emailExists(form.email)) e.email = 'Email already registered';
    if (form.password.length < 8)   e.password = 'Minimum 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!isValidSAPhone(form.phone)) e.phone   = 'Enter 9 digits after +27';
    if (!form.grades)               e.grades   = 'Please select your grade(s)';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const fullName = `${form.name.trim()} ${form.surname.trim()}`;

      // Register teacher — NOT approved until super_admin approves
      userStore.register({
        name: fullName,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: 'teacher',
        phone: '+27' + form.phone,
        position: form.grades,
        approved: false,    // must wait for admin approval
      });

      setSubmittedName(form.name.trim());
      setLoading(false);
      setDone(true);
      // Do NOT write session or call onSuccess with navigation
      // Teacher must wait for approval then use the login page
    }, 700);
  };

  const inp = (err?: string): React.CSSProperties => ({
    width: '100%',
    background: 'rgba(0,0,0,0.3)',
    border: `1px solid ${err ? '#9ca3af' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: 7,
    padding: '0.62rem 0.85rem',
    color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.875rem',
    outline: 'none',
  });

  return (
    <>
      <style>{STYLES}</style>
      <div className="tr-page">
        <div className="tr-card">

          {/* Header */}
          <div className="tr-top">
            <div className="tr-logo-badge">SS</div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', letterSpacing: '1.5px', color: '#f0c000' }}>Sunday School</div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>Management Portal</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div className="tr-title">Teacher Volunteer Registration</div>
              <div className="tr-sub">Apply to join the teaching team · Subject to approval</div>
            </div>
          </div>

          {/* ── Success state ── */}
          {done ? (
            <div className="tr-success">
              <div className="tr-success-icon">🎉</div>
              <div className="tr-success-title">Application Submitted!</div>
              <div className="tr-success-notice">
                <strong>Hi {submittedName},</strong> your teacher registration has been received.<br /><br />
                ⏳ <strong>Your account is pending approval</strong> by a Super Admin. You will be able to log in once your application has been reviewed.<br /><br />
                Please check back later or contact your church administrator for more information.
              </div>
              <button className="btn-primary" style={{ maxWidth: 280, margin: '1.25rem auto 0' }} onClick={onLoginInstead}>
                Back to Sign In →
              </button>
            </div>
          ) : (
            <>
              {/* Pending notice */}
              <div style={{ padding: '0.7rem 1rem', borderRadius: 9, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)', fontSize: '0.73rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                ⏳ <strong style={{ color: '#fbbf24' }}>Approval required</strong> — Teacher accounts must be approved by a Super Admin before you can log in. You'll be notified once your application is reviewed.
              </div>

              <div className="tr-cols">
                {/* LEFT */}
                <div>
                  <div className="tr-section">Personal Details</div>

                  <div className="tr-g2">
                    <FW label="First Name" err={errs.name}>
                      <input style={inp(errs.name)} type="text" placeholder="e.g. James"
                        value={form.name} onChange={e => set('name', e.target.value)} />
                    </FW>
                    <FW label="Last Name" err={errs.surname}>
                      <input style={inp(errs.surname)} type="text" placeholder="e.g. Mokoena"
                        value={form.surname} onChange={e => set('surname', e.target.value)} />
                    </FW>
                  </div>

                  <FW label="Email Address" err={errs.email}>
                    <input style={inp(errs.email)} type="email" placeholder="you@email.com"
                      value={form.email} onChange={e => set('email', e.target.value)} />
                  </FW>

                  <FW label="Mobile Number" err={errs.phone} hint="9 digits after +27">
                    <div className={`tr-phone-row${errs.phone ? ' err' : ''}`}>
                      <span className="tr-phone-prefix">+27</span>
                      <input className="tr-phone-input" type="tel" placeholder="821234567"
                        value={form.phone} maxLength={9} onChange={e => setPhone(e.target.value)} />
                    </div>
                  </FW>

                  <FW label="Grade(s) You'd Like to Teach" err={errs.grades}>
                    <select style={{ ...inp(errs.grades), background: '#071a0d', color: form.grades ? '#fff' : 'rgba(255,255,255,0.35)' }}
                      value={form.grades} onChange={e => set('grades', e.target.value)}>
                      <option value="">Select grade…</option>
                      {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </FW>

                  <FW label="Years of Teaching/Volunteer Experience" optional>
                    <input style={inp()} type="text" placeholder="e.g. 3 years Sunday School"
                      value={form.experience} onChange={e => set('experience', e.target.value)} />
                  </FW>
                </div>

                {/* Divider */}
                <div className="tr-divider" />

                {/* RIGHT */}
                <div>
                  <div className="tr-section">Security</div>

                  <FW label="Password" err={errs.password} hint="Minimum 8 characters">
                    <div className="pw-wrap">
                      <input style={inp(errs.password)} type={showPw ? 'text' : 'password'} placeholder="Create password"
                        value={form.password} onChange={e => set('password', e.target.value)} />
                      <button className="pw-toggle" onClick={() => setShowPw(p => !p)}>{showPw ? '🙈' : '👁'}</button>
                    </div>
                  </FW>

                  <FW label="Confirm Password" err={errs.confirm}>
                    <div className="pw-wrap">
                      <input style={inp(errs.confirm)} type={showCf ? 'text' : 'password'} placeholder="Repeat password"
                        value={form.confirm} onChange={e => set('confirm', e.target.value)} />
                      <button className="pw-toggle" onClick={() => setShowCf(p => !p)}>{showCf ? '🙈' : '👁'}</button>
                    </div>
                  </FW>

                  <div style={{ padding: '0.75rem 1rem', borderRadius: 9, background: 'rgba(240,192,0,0.05)', border: '1px solid rgba(240,192,0,0.13)', fontSize: '0.73rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                    🔒 Your data is handled in accordance with POPIA. Personal information is only used for Sunday School management purposes.
                  </div>

                  <button className="btn-primary" onClick={submit} disabled={loading}>
                    {loading ? 'Submitting Application…' : 'Submit Application →'}
                  </button>
                </div>
              </div>

              <div className="tr-footer">
                <span>Already registered? <span className="tr-link" onClick={onLoginInstead}>Sign in</span></span>
                {onBack && <span className="tr-link" onClick={onBack}>← Go back</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}