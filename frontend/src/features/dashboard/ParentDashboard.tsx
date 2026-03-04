// src/features/dashboard/ParentDashboard.tsx

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Child {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  school: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  hasAllergies: boolean;
  allergiesDetails?: string;
  hasMedicalCondition: boolean;
  medicalDetails?: string;
  attendanceRate: number;
  welfareFlags: number;
  consentActivities: boolean;
  consentMedical: boolean;
  lastSeen: string;
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
  fedToday: boolean;
  childId: string;
}

interface Notification {
  id: string;
  type: 'welfare' | 'attendance' | 'feeding' | 'info';
  title: string;
  message: string;
  date: string;
  read: boolean;
  childId?: string;
}

interface MockUser {
  name: string;
  email: string;
  phone: string;
}

interface ParentDashboardProps {
  user?: MockUser;
  onLogout?: () => void;
  onRegisterChild?: () => void;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_CHILDREN: Child[] = [
  {
    id: 'c1', firstName: 'Amara', lastName: 'Dlamini', grade: 'Grade 3',
    school: 'Sunflower Primary', dateOfBirth: '2016-03-14',
    gender: 'female', hasAllergies: true, allergiesDetails: 'Peanuts',
    hasMedicalCondition: false, attendanceRate: 92, welfareFlags: 0,
    consentActivities: true, consentMedical: true, lastSeen: '2026-03-02',
  },
  {
    id: 'c2', firstName: 'Sipho', lastName: 'Dlamini', grade: 'Grade 5',
    school: 'Sunflower Primary', dateOfBirth: '2014-07-22',
    gender: 'male', hasAllergies: false, hasMedicalCondition: true,
    medicalDetails: 'Asthma — has inhaler', attendanceRate: 78, welfareFlags: 1,
    consentActivities: true, consentMedical: true, lastSeen: '2026-02-23',
  },
];

const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { date: '2026-03-02', status: 'present', fedToday: true,  childId: 'c1' },
  { date: '2026-03-02', status: 'absent',  fedToday: false, childId: 'c2' },
  { date: '2026-02-23', status: 'present', fedToday: true,  childId: 'c1' },
  { date: '2026-02-23', status: 'present', fedToday: true,  childId: 'c2' },
  { date: '2026-02-16', status: 'present', fedToday: false, childId: 'c1' },
  { date: '2026-02-16', status: 'late',    fedToday: true,  childId: 'c2' },
  { date: '2026-02-09', status: 'absent',  fedToday: false, childId: 'c1' },
  { date: '2026-02-09', status: 'present', fedToday: true,  childId: 'c2' },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', type: 'welfare', title: 'Welfare Update — Sipho',
    message: 'A welfare concern has been logged for Sipho by his teacher. Please contact the school.',
    date: '2026-03-01', read: false, childId: 'c2',
  },
  {
    id: 'n2', type: 'attendance', title: 'Sipho was absent on 2 March',
    message: 'Sipho was marked absent at Sunday school on 2 March 2026.',
    date: '2026-03-02', read: false, childId: 'c2',
  },
  {
    id: 'n3', type: 'feeding', title: 'Feeding scheme — Amara',
    message: 'Amara participated in the feeding scheme today (2 March 2026).',
    date: '2026-03-02', read: true, childId: 'c1',
  },
  {
    id: 'n4', type: 'info', title: 'Consent form reminder',
    message: 'Please update the medical consent form for the upcoming Easter Camp.',
    date: '2026-02-28', read: true,
  },
];

const GRADES = ['Grade R', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];
const AVATAR_PALETTE = ['#2d6a4f','#1e6091','#6d3e91','#a05c34','#1a6b6b','#8b3a3a','#4a6741','#5a4a8a'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcAge = (dob: string) => Math.floor(
  (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
);
const initials = (first: string, last: string) =>
  `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
const today = () => new Date().toISOString().split('T')[0];

const NOTIF_COLORS: Record<Notification['type'], { bg: string; border: string; icon: string }> = {
  welfare:    { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(248,113,113,0.25)', icon: '🚩' },
  attendance: { bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)',  icon: '📅' },
  feeding:    { bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.25)',  icon: '🍽' },
  info:       { bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.25)', icon: 'ℹ️' },
};

// ─── RegisterChildModal ───────────────────────────────────────────────────────
interface RegisterChildModalProps {
  onClose: () => void;
  onRegister: (child: Child) => void;
  existingCount: number;
}

function RegisterChildModal({ onClose, onRegister, existingCount }: RegisterChildModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [saved, setSaved] = useState(false);

  // Step 1 — basic info
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [dob, setDob]               = useState('');
  const [gender, setGender]         = useState<'male' | 'female' | 'other' | ''>('');
  const [grade, setGrade]           = useState('');
  const [school, setSchool]         = useState('');

  // Step 2 — medical & welfare
  const [hasAllergies, setHasAllergies]             = useState(false);
  const [allergiesDetails, setAllergiesDetails]     = useState('');
  const [hasMedical, setHasMedical]                 = useState(false);
  const [medicalDetails, setMedicalDetails]         = useState('');
  const [consentActivities, setConsentActivities]   = useState(true);
  const [consentMedical, setConsentMedical]         = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required.';
    if (!lastName.trim())  e.lastName  = 'Last name is required.';
    if (!dob)              e.dob       = 'Date of birth is required.';
    if (!gender)           e.gender    = 'Please select a gender.';
    if (!grade)            e.grade     = 'Please select a grade.';
    if (!school.trim())    e.school    = 'School name is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = () => {
    const newChild: Child = {
      id: `c${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      grade,
      school: school.trim(),
      dateOfBirth: dob,
      gender: gender as 'male' | 'female' | 'other',
      hasAllergies,
      allergiesDetails: hasAllergies ? allergiesDetails : undefined,
      hasMedicalCondition: hasMedical,
      medicalDetails: hasMedical ? medicalDetails : undefined,
      attendanceRate: 0,
      welfareFlags: 0,
      consentActivities,
      consentMedical,
      lastSeen: today(),
    };
    setSaved(true);
    setTimeout(() => { onRegister(newChild); onClose(); }, 900);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#0a2614',
        border: '1px solid rgba(52,211,153,0.2)',
        borderRadius: '18px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
      }}>

        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.35rem', color: '#34d399', letterSpacing: 1.5 }}>
              REGISTER A CHILD
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>
              Step {step} of 2 — {step === 1 ? 'Basic Information' : 'Medical & Consent'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ height: '100%', width: step === 1 ? '50%' : '100%', background: '#34d399', transition: 'width 0.35s ease', borderRadius: '0 2px 2px 0' }} />
        </div>

        <div style={{ padding: '1.5rem 1.75rem' }}>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input
                    style={{ ...inputStyle, borderColor: errors.firstName ? '#f87171' : 'rgba(255,255,255,0.1)' }}
                    placeholder="e.g. Amara"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                  {errors.firstName && <span style={errStyle}>{errors.firstName}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Last Name *</label>
                  <input
                    style={{ ...inputStyle, borderColor: errors.lastName ? '#f87171' : 'rgba(255,255,255,0.1)' }}
                    placeholder="e.g. Dlamini"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                  {errors.lastName && <span style={errStyle}>{errors.lastName}</span>}
                </div>
              </div>

              {/* DOB + Gender */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Date of Birth *</label>
                  <input
                    type="date"
                    style={{ ...inputStyle, borderColor: errors.dob ? '#f87171' : 'rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    max={today()}
                  />
                  {errors.dob && <span style={errStyle}>{errors.dob}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Gender *</label>
                  <select
                    style={{ ...inputStyle, borderColor: errors.gender ? '#f87171' : 'rgba(255,255,255,0.1)' }}
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <span style={errStyle}>{errors.gender}</span>}
                </div>
              </div>

              {/* Grade + School */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Grade *</label>
                  <select
                    style={{ ...inputStyle, borderColor: errors.grade ? '#f87171' : 'rgba(255,255,255,0.1)' }}
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                  >
                    <option value="">Select grade</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {errors.grade && <span style={errStyle}>{errors.grade}</span>}
                </div>
                <div>
                  <label style={labelStyle}>School *</label>
                  <input
                    style={{ ...inputStyle, borderColor: errors.school ? '#f87171' : 'rgba(255,255,255,0.1)' }}
                    placeholder="e.g. Sunflower Primary"
                    value={school}
                    onChange={e => setSchool(e.target.value)}
                  />
                  {errors.school && <span style={errStyle}>{errors.school}</span>}
                </div>
              </div>

              {/* Preview card */}
              {firstName && lastName && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.85rem 1rem', borderRadius: '10px',
                  background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)',
                  marginTop: '0.25rem',
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: AVATAR_PALETTE[existingCount % AVATAR_PALETTE.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: '#fff', flexShrink: 0,
                  }}>
                    {initials(firstName, lastName)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{firstName} {lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                      {grade || 'Grade TBD'} · {dob ? `Age ${calcAge(dob)}` : 'DOB TBD'} · {gender || 'Gender TBD'}
                    </div>
                  </div>
                </div>
              )}

              <button onClick={handleNext} style={btnPrimaryStyle}>
                Next: Medical & Consent →
              </button>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', letterSpacing: 2, fontFamily: "'DM Sans',sans-serif", marginBottom: '-0.25rem' }}>
                MEDICAL INFORMATION
              </div>

              {/* Allergies */}
              <div
                onClick={() => setHasAllergies(!hasAllergies)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
                  padding: '0.9rem 1rem', borderRadius: '10px', cursor: 'pointer',
                  background: hasAllergies ? 'rgba(251,191,36,0.07)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${hasAllergies ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.2s',
                }}
              >
                <div style={toggleStyle(hasAllergies, '#fbbf24')}>
                  {hasAllergies ? '✓' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: hasAllergies ? '#fbbf24' : 'rgba(255,255,255,0.65)' }}>
                    ⚠ Child has allergies
                  </div>
                  {hasAllergies && (
                    <input
                      style={{ ...inputStyle, marginTop: '0.6rem', borderColor: 'rgba(251,191,36,0.3)' }}
                      placeholder="Describe allergies (e.g. Peanuts, dairy)"
                      value={allergiesDetails}
                      onChange={e => { e.stopPropagation(); setAllergiesDetails(e.target.value); }}
                      onClick={e => e.stopPropagation()}
                    />
                  )}
                </div>
              </div>

              {/* Medical condition */}
              <div
                onClick={() => setHasMedical(!hasMedical)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
                  padding: '0.9rem 1rem', borderRadius: '10px', cursor: 'pointer',
                  background: hasMedical ? 'rgba(248,113,113,0.07)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${hasMedical ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.2s',
                }}
              >
                <div style={toggleStyle(hasMedical, '#f87171')}>
                  {hasMedical ? '✓' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: hasMedical ? '#f87171' : 'rgba(255,255,255,0.65)' }}>
                    ⚕ Child has a medical condition
                  </div>
                  {hasMedical && (
                    <input
                      style={{ ...inputStyle, marginTop: '0.6rem', borderColor: 'rgba(248,113,113,0.3)' }}
                      placeholder="Describe condition (e.g. Asthma — has inhaler)"
                      value={medicalDetails}
                      onChange={e => { e.stopPropagation(); setMedicalDetails(e.target.value); }}
                      onClick={e => e.stopPropagation()}
                    />
                  )}
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', letterSpacing: 2, fontFamily: "'DM Sans',sans-serif", marginTop: '0.25rem' }}>
                CONSENT
              </div>

              {/* Consent toggles */}
              {[
                { label: 'Consent to participate in Sunday school activities', value: consentActivities, set: setConsentActivities },
                { label: 'Authorise emergency medical treatment if unavailable', value: consentMedical, set: setConsentMedical },
              ].map(({ label, value, set }) => (
                <div
                  key={label}
                  onClick={() => set(!value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                    padding: '0.85rem 1rem', borderRadius: '10px', cursor: 'pointer',
                    background: value ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${value ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={toggleStyle(value, '#34d399')}>{value ? '✓' : ''}</div>
                  <span style={{ fontSize: '0.875rem', color: value ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)' }}>{label}</span>
                </div>
              ))}

              {/* POPIA note */}
              <div style={{
                padding: '0.75rem 1rem', borderRadius: '8px',
                background: 'rgba(129,140,248,0.07)', border: '1px solid rgba(129,140,248,0.18)',
                fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', display: 'flex', gap: '0.5rem',
              }}>
                <span>🔒</span>
                <span>Personal information is collected in accordance with POPIA and used solely for Sunday school administration.</span>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.25rem' }}>
                <button onClick={() => setStep(1)} style={btnGhostStyle}>← Back</button>
                <button onClick={handleSubmit} disabled={saved} style={{ ...btnPrimaryStyle, flex: 1 }}>
                  {saved ? '✓ Child Registered!' : 'Register Child'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared form styles ───────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.75rem', fontWeight: 600,
  color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', letterSpacing: '0.2px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.72rem 0.9rem', borderRadius: '9px',
  border: '1.5px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)', color: '#fff',
  fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem',
  outline: 'none', transition: 'border-color 0.2s',
};
const errStyle: React.CSSProperties = {
  fontSize: '0.72rem', color: '#f87171', marginTop: '0.3rem', display: 'block',
};
const btnPrimaryStyle: React.CSSProperties = {
  width: '100%', padding: '0.8rem', borderRadius: '9px', border: 'none',
  background: '#34d399', color: '#042a15',
  fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '0.9rem',
  cursor: 'pointer', transition: 'all 0.2s',
};
const btnGhostStyle: React.CSSProperties = {
  padding: '0.8rem 1.25rem', borderRadius: '9px',
  border: '1px solid rgba(255,255,255,0.12)', background: 'transparent',
  color: 'rgba(255,255,255,0.55)', fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
};
const toggleStyle = (active: boolean, color: string): React.CSSProperties => ({
  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
  background: active ? color : 'rgba(255,255,255,0.08)',
  border: `2px solid ${active ? color : 'rgba(255,255,255,0.15)'}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '0.65rem', color: '#042a15', fontWeight: 900, transition: 'all 0.2s',
});

// ─── Consent Modal ────────────────────────────────────────────────────────────
function ConsentModal({ child, onClose }: { child: Child; onClose: () => void }) {
  const [activities, setActivities] = useState(child.consentActivities);
  const [medical, setMedical]       = useState(child.consentMedical);
  const [photos, setPhotos]         = useState(true);
  const [camps, setCamps]           = useState(false);
  const [saved, setSaved]           = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  const items = [
    { label: 'Consent to participate in Sunday school activities',        value: activities, set: setActivities },
    { label: 'Authorise emergency medical treatment if I am unavailable', value: medical,    set: setMedical    },
    { label: 'Permission to photograph child for ministry records',       value: photos,     set: setPhotos     },
    { label: 'Permission to attend overnight camps and outings',          value: camps,      set: setCamps      },
  ];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#0f3d1a', border: '1px solid rgba(52,211,153,0.2)',
        borderRadius: '16px', width: '100%', maxWidth: '480px',
        maxHeight: '90vh', overflow: 'auto',
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: '#34d399', letterSpacing: 1 }}>
              CONSENT FORM
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              {child.firstName} {child.lastName}
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.3rem', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {items.map(({ label, value, set: setter }) => (
            <div
              key={label}
              onClick={() => setter(!value)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.9rem', borderRadius: '9px', marginBottom: '0.6rem',
                background: value ? 'rgba(52,211,153,0.06)' : 'rgba(0,0,0,0.15)',
                border: `1px solid ${value ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={toggleStyle(value, '#34d399')}>
                {value ? '✓' : ''}
              </div>
              <span style={{ fontSize: '0.85rem', color: value ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)' }}>
                {label}
              </span>
            </div>
          ))}
          <button
            onClick={handleSave}
            style={{ ...btnPrimaryStyle, marginTop: '0.75rem' }}
          >
            {saved ? '✓ Saved!' : 'Save Consent Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ParentDashboard({
  user = { name: 'Nomsa Dlamini', email: 'parent@demo.church', phone: '+27 82 111 2233' },
  onLogout,
}: ParentDashboardProps) {
  const [activeTab, setActiveTab]             = useState<'overview' | 'children' | 'attendance' | 'notifications'>('overview');
  const [children, setChildren]               = useState<Child[]>(INITIAL_CHILDREN);
  const [selectedChild, setSelectedChild]     = useState<Child | null>(null);
  const [consentChild, setConsentChild]       = useState<Child | null>(null);
  const [notifications, setNotifications]     = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [attendanceChild, setAttendanceChild] = useState<string>('all');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const unread = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));

  const handleRegisterChild = (newChild: Child) => {
    setChildren(prev => [...prev, newChild]);
  };

  const avatarColorFor = (id: string, index: number) => {
    // Use preset for original children, palette for new ones
    const presets: Record<string, string> = { c1: '#2d6a4f', c2: '#1e6091' };
    return presets[id] ?? AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  };

  const filteredAttendance = attendanceChild === 'all'
    ? MOCK_ATTENDANCE
    : MOCK_ATTENDANCE.filter(a => a.childId === attendanceChild);

  const getChildName = (id: string) => {
    const c = children.find(ch => ch.id === id);
    return c ? `${c.firstName} ${c.lastName}` : '';
  };

  const openRegister = () => setShowRegisterModal(true);

  return (
    <>
      <style>{CSS}</style>

      {showRegisterModal && (
        <RegisterChildModal
          onClose={() => setShowRegisterModal(false)}
          onRegister={handleRegisterChild}
          existingCount={children.length}
        />
      )}

      {consentChild && (
        <ConsentModal child={consentChild} onClose={() => setConsentChild(null)} />
      )}

      <div className="pd-root">

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="pd-header">
          <div className="pd-header-brand">
            <div className="pd-header-logo">👨‍👩‍👧</div>
            <div>
              <div className="pd-header-title">Sunday School Portal</div>
              <div className="pd-header-sub">Parent Dashboard</div>
            </div>
          </div>

          <div className="pd-header-right">
            <button
              className="pd-bell"
              onClick={() => setActiveTab('notifications')}
              aria-label="Notifications"
            >
              🔔
              {unread > 0 && <span className="pd-bell-badge">{unread}</span>}
            </button>

            <div className="pd-user-chip">
              <div className="pd-user-avatar">{user.name.charAt(0)}</div>
              <div className="pd-user-info">
                <div className="pd-user-name">{user.name}</div>
                <div className="pd-user-role">Parent / Caregiver</div>
              </div>
            </div>

            <button className="pd-signout" onClick={onLogout}>Sign out</button>
          </div>
        </header>

        {/* ── Tab nav ────────────────────────────────────────── */}
        <nav className="pd-tab-nav">
          {([
            { id: 'overview',      label: '🏠 Overview'      },
            { id: 'children',      label: '👶 My Children'   },
            { id: 'attendance',    label: '📅 Attendance'    },
            { id: 'notifications', label: `🔔 Notifications${unread > 0 ? ` (${unread})` : ''}` },
          ] as const).map(tab => (
            <button
              key={tab.id}
              className={`pd-tab${activeTab === tab.id ? ' pd-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── Main ───────────────────────────────────────────── */}
        <main className="pd-main">
          <div className="pd-content">

            {/* ══ OVERVIEW ══════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="pd-fade">

                <div className="pd-hero">
                  <div className="pd-hero-glow" />
                  <div className="pd-hero-pill">
                    <span className="pd-hero-dot" />
                    Parent / Caregiver
                  </div>
                  <h1 className="pd-hero-heading">
                    Welcome back, <span className="pd-green">{user.name.split(' ')[0]}</span>
                  </h1>
                  <p className="pd-hero-body">
                    You have <strong style={{ color: '#fff' }}>{children.length} children</strong> registered.
                    {unread > 0 && (
                      <> There {unread === 1 ? 'is' : 'are'} <strong style={{ color: '#f0c000' }}>
                        {unread} unread notification{unread > 1 ? 's' : ''}
                      </strong> requiring your attention.</>
                    )}
                  </p>
                  <div className="pd-hero-chips">
                    {[
                      { l: 'Email',    v: user.email },
                      { l: 'Phone',    v: user.phone },
                      { l: 'Children', v: `${children.length} registered` },
                    ].map(({ l, v }) => (
                      <div key={l} className="pd-hero-chip">
                        <div className="pd-chip-label">{l}</div>
                        <div className="pd-chip-value">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pd-stats-grid">
                  {[
                    { label: 'Children Registered', value: children.length, color: '#34d399', icon: '👶' },
                    { label: 'Avg Attendance', value: children.length ? `${Math.round(children.reduce((s, c) => s + c.attendanceRate, 0) / children.length)}%` : '—', color: '#f0c000', icon: '📅' },
                    { label: 'Welfare Flags', value: children.reduce((s, c) => s + c.welfareFlags, 0), color: children.some(c => c.welfareFlags > 0) ? '#f87171' : '#34d399', icon: '🚩' },
                    { label: 'Unread Notifications', value: unread, color: unread > 0 ? '#fbbf24' : '#34d399', icon: '🔔' },
                  ].map(stat => (
                    <div key={stat.label} className="pd-stat-card">
                      <div className="pd-stat-icon">{stat.icon}</div>
                      <div className="pd-stat-value" style={{ color: stat.color }}>{stat.value}</div>
                      <div className="pd-stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="pd-card">
                  <div className="pd-card-header">
                    <span className="pd-card-title">My Children</span>
                    <button className="pd-link-btn" onClick={() => setActiveTab('children')}>View all →</button>
                  </div>
                  <div className="pd-child-list">
                    {children.map((child, idx) => {
                      const attColor = child.attendanceRate >= 80 ? '#34d399' : child.attendanceRate >= 60 ? '#fbbf24' : '#f87171';
                      return (
                        <div
                          key={child.id}
                          className="pd-child-row"
                          onClick={() => { setSelectedChild(child); setActiveTab('children'); }}
                        >
                          <div className="pd-avatar" style={{ background: avatarColorFor(child.id, idx) }}>
                            {initials(child.firstName, child.lastName)}
                          </div>
                          <div className="pd-child-info">
                            <div className="pd-child-name">{child.firstName} {child.lastName}</div>
                            <div className="pd-child-meta">{child.grade} · Age {calcAge(child.dateOfBirth)}</div>
                          </div>
                          <div className="pd-child-att">
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: attColor }}>{child.attendanceRate}%</div>
                            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>attendance</div>
                          </div>
                          {child.welfareFlags > 0 && (
                            <span className="tag-danger">🚩 {child.welfareFlags}</span>
                          )}
                          <span className="pd-row-arrow">→</span>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={openRegister} className="pd-register-btn">
                    + Register Another Child
                  </button>
                </div>

                {unread > 0 && (
                  <div className="pd-card">
                    <div className="pd-card-header">
                      <span className="pd-card-title">Recent Alerts</span>
                      <button className="pd-link-btn" onClick={() => setActiveTab('notifications')}>View all →</button>
                    </div>
                    {notifications.filter(n => !n.read).slice(0, 3).map(n => {
                      const colors = NOTIF_COLORS[n.type];
                      return (
                        <div key={n.id} className="pd-notif-row" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                          <span className="pd-notif-icon">{colors.icon}</span>
                          <div className="pd-notif-body">
                            <div className="pd-notif-title">{n.title}</div>
                            <div className="pd-notif-msg">{n.message}</div>
                          </div>
                          <div className="pd-notif-date">{fmtDate(n.date)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══ MY CHILDREN ═══════════════════════════════════ */}
            {activeTab === 'children' && (
              <div className="pd-fade">
                <div className="pd-page-header">
                  <div>
                    <div className="pd-page-title">My Children</div>
                    <div className="pd-page-sub">Manage and view your registered children</div>
                  </div>
                  <button onClick={openRegister} className="btn-green">+ Register Child</button>
                </div>

                {selectedChild ? (
                  <div>
                    <button onClick={() => setSelectedChild(null)} className="pd-back-btn">← All Children</button>
                    <div className="pd-card">
                      <div className="pd-detail-hero">
                        <div className="pd-avatar pd-avatar--lg" style={{ background: avatarColorFor(selectedChild.id, children.findIndex(c => c.id === selectedChild.id)) }}>
                          {initials(selectedChild.firstName, selectedChild.lastName)}
                        </div>
                        <div className="pd-detail-info">
                          <div className="pd-detail-name">{selectedChild.firstName} {selectedChild.lastName}</div>
                          <div className="pd-detail-meta">{selectedChild.grade} · Age {calcAge(selectedChild.dateOfBirth)} · {selectedChild.school}</div>
                          <div className="pd-tag-row">
                            {selectedChild.hasAllergies        && <span className="tag-warn">⚠ Allergy</span>}
                            {selectedChild.hasMedicalCondition && <span className="tag-warn">⚕ Medical</span>}
                            {selectedChild.welfareFlags > 0    && <span className="tag-danger">🚩 {selectedChild.welfareFlags} flag{selectedChild.welfareFlags > 1 ? 's' : ''}</span>}
                            <span className="tag-ok">Last seen {fmtDate(selectedChild.lastSeen)}</span>
                          </div>
                        </div>
                        <button onClick={() => setConsentChild(selectedChild)} className="btn-green btn-green--sm">
                          📋 Consent Form
                        </button>
                      </div>

                      <div className="pd-info-grid">
                        {[
                          { k: 'Date of Birth',   v: fmtDate(selectedChild.dateOfBirth) },
                          { k: 'Gender',          v: selectedChild.gender },
                          { k: 'Grade',           v: selectedChild.grade },
                          { k: 'School',          v: selectedChild.school },
                          { k: 'Attendance Rate', v: `${selectedChild.attendanceRate}%` },
                          { k: 'Welfare Flags',   v: selectedChild.welfareFlags.toString() },
                        ].map(({ k, v }) => (
                          <div key={k} className="pd-info-cell">
                            <div className="pd-info-key">{k}</div>
                            <div className="pd-info-val">{v}</div>
                          </div>
                        ))}
                      </div>

                      {(selectedChild.hasAllergies || selectedChild.hasMedicalCondition) && (
                        <div className="pd-medical-box">
                          <div className="pd-medical-title">Medical Notes</div>
                          {selectedChild.hasAllergies        && <div className="pd-medical-row">⚠ Allergies: {selectedChild.allergiesDetails}</div>}
                          {selectedChild.hasMedicalCondition && <div className="pd-medical-row">⚕ Condition: {selectedChild.medicalDetails}</div>}
                        </div>
                      )}

                      <div className="pd-consent-row">
                        {[
                          { label: 'Activities', granted: selectedChild.consentActivities },
                          { label: 'Medical',    granted: selectedChild.consentMedical    },
                        ].map(({ label, granted }) => (
                          <div key={label} className={`pd-consent-badge ${granted ? 'pd-consent-badge--yes' : 'pd-consent-badge--no'}`}>
                            <span>{granted ? '✓' : '✗'}</span> Consent: {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pd-children-grid">
                    {children.map((child, idx) => {
                      const attColor = child.attendanceRate >= 80 ? '#34d399' : child.attendanceRate >= 60 ? '#fbbf24' : '#f87171';
                      return (
                        <div key={child.id} className="pd-card pd-child-card" onClick={() => setSelectedChild(child)}>
                          <div className="pd-child-card-top">
                            <div className="pd-avatar pd-avatar--md" style={{ background: avatarColorFor(child.id, idx) }}>
                              {initials(child.firstName, child.lastName)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="pd-child-name">{child.firstName} {child.lastName}</div>
                              <div className="pd-child-meta">{child.grade} · {child.school}</div>
                            </div>
                            <button
                              className="pd-action-btn"
                              onClick={e => { e.stopPropagation(); setConsentChild(child); }}
                            >
                              📋 Consent
                            </button>
                          </div>
                          <div className="pd-child-card-stats">
                            <div className="pd-mini-stat">
                              <div className="pd-mini-label">Attendance</div>
                              <div className="pd-mini-value" style={{ color: attColor }}>{child.attendanceRate}%</div>
                            </div>
                            <div className="pd-mini-stat">
                              <div className="pd-mini-label">Welfare</div>
                              <div className="pd-mini-value" style={{ color: child.welfareFlags > 0 ? '#f87171' : '#34d399' }}>
                                {child.welfareFlags === 0 ? '✓ Clear' : `🚩 ${child.welfareFlags}`}
                              </div>
                            </div>
                            <div className="pd-mini-stat">
                              <div className="pd-mini-label">Last Seen</div>
                              <div className="pd-mini-value" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>
                                {fmtDate(child.lastSeen)}
                              </div>
                            </div>
                            {(child.hasAllergies || child.hasMedicalCondition) && (
                              <div className="pd-mini-stat" style={{ marginLeft: 'auto' }}>
                                {child.hasAllergies        && <span className="tag-warn">⚠ Allergy</span>}
                                {child.hasMedicalCondition && <span className="tag-warn" style={{ marginLeft: 4 }}>⚕ Medical</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══ ATTENDANCE ════════════════════════════════════ */}
            {activeTab === 'attendance' && (
              <div className="pd-fade">
                <div className="pd-page-header">
                  <div>
                    <div className="pd-page-title">Attendance Records</div>
                    <div className="pd-page-sub">View attendance and feeding records for your children</div>
                  </div>
                </div>

                <div className="pd-stats-grid" style={{ marginBottom: '1.25rem' }}>
                  {children.map(child => {
                    const attColor = child.attendanceRate >= 80 ? '#34d399' : child.attendanceRate >= 60 ? '#fbbf24' : '#f87171';
                    return (
                      <div
                        key={child.id}
                        className="pd-stat-card"
                        style={{ cursor: 'pointer', borderColor: attendanceChild === child.id ? attColor : '' }}
                        onClick={() => setAttendanceChild(attendanceChild === child.id ? 'all' : child.id)}
                      >
                        <div className="pd-stat-icon" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{child.firstName}</div>
                        <div className="pd-stat-value" style={{ color: attColor }}>{child.attendanceRate}%</div>
                        <div className="pd-stat-label">Attendance Rate</div>
                      </div>
                    );
                  })}
                </div>

                <div className="pd-filter-row">
                  <button
                    onClick={() => setAttendanceChild('all')}
                    className={`pd-filter-btn${attendanceChild === 'all' ? ' pd-filter-btn--active' : ''}`}
                  >
                    All Children
                  </button>
                  {children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => setAttendanceChild(child.id)}
                      className={`pd-filter-btn${attendanceChild === child.id ? ' pd-filter-btn--active' : ''}`}
                    >
                      {child.firstName}
                    </button>
                  ))}
                </div>

                <div className="pd-card">
                  <div className="pd-card-title" style={{ marginBottom: '1rem' }}>Session History</div>
                  <div className="pd-att-list">
                    {filteredAttendance.map((rec, idx) => {
                      const sc = rec.status === 'present' ? '#34d399' : rec.status === 'absent' ? '#f87171' : '#fbbf24';
                      return (
                        <div key={idx} className="pd-att-row">
                          <div className="pd-att-dot" style={{ background: sc }} />
                          <span className="pd-att-date">{fmtDate(rec.date)}</span>
                          {attendanceChild === 'all' && (
                            <span className="pd-att-child">{getChildName(rec.childId)}</span>
                          )}
                          <span className="pd-att-status" style={{ color: sc }}>{rec.status}</span>
                          <span className={`pd-fed-badge${!rec.fedToday ? ' pd-fed-badge--no' : ''}`}>
                            {rec.fedToday ? '🍽 Fed' : '— Not fed'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ══ NOTIFICATIONS ════════════════════════════════ */}
            {activeTab === 'notifications' && (
              <div className="pd-fade">
                <div className="pd-page-header">
                  <div>
                    <div className="pd-page-title">Notifications</div>
                    <div className="pd-page-sub">{unread} unread · {notifications.length} total</div>
                  </div>
                  {unread > 0 && (
                    <button className="pd-ghost-btn" onClick={markAllRead}>Mark all read</button>
                  )}
                </div>

                <div className="pd-notif-list">
                  {notifications.map(n => {
                    const colors = NOTIF_COLORS[n.type];
                    return (
                      <div
                        key={n.id}
                        className="pd-notif-item"
                        style={{
                          background: n.read ? 'rgba(255,255,255,0.02)' : colors.bg,
                          border: `1px solid ${n.read ? 'rgba(255,255,255,0.06)' : colors.border}`,
                          opacity: n.read ? 0.7 : 1,
                        }}
                        onClick={() => setNotifications(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}
                      >
                        <span className="pd-notif-icon">{colors.icon}</span>
                        <div className="pd-notif-body">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 3 }}>
                            <span className="pd-notif-title">{n.title}</span>
                            {!n.read && <span className="pd-unread-dot" />}
                          </div>
                          <div className="pd-notif-msg">{n.message}</div>
                          {n.childId && (
                            <div className="pd-notif-child">Re: {getChildName(n.childId)}</div>
                          )}
                        </div>
                        <div className="pd-notif-date">{fmtDate(n.date)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #root {
  width: 100%;
  min-height: 100vh;
  background: #060f08;
  font-family: 'DM Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.pd-fade { animation: fadeUp 0.25s ease; }

.pd-root {
  display: flex; flex-direction: column;
  width: 100vw; min-height: 100vh;
  background: #060f08; color: #fff; overflow-x: hidden;
}

/* ── Header ── */
.pd-header {
  width: 100%; background: rgba(255,255,255,0.025);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 0 clamp(16px, 3vw, 40px); height: 64px;
  display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-shrink: 0;
}
.pd-header-brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.pd-header-logo {
  width: 34px; height: 34px; border-radius: 9px; background: #34d399;
  display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;
}
.pd-header-title { font-family: 'Bebas Neue', sans-serif; font-size: 14px; color: #fff; letter-spacing: 0.5px; line-height: 1.2; }
.pd-header-sub   { font-size: 10px; color: rgba(255,255,255,0.38); text-transform: uppercase; letter-spacing: 0.6px; }
.pd-header-right { display: flex; align-items: center; gap: 10px; }

.pd-bell {
  position: relative; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
  width: 36px; height: 36px; display: flex; align-items: center;
  justify-content: center; cursor: pointer; font-size: 1rem; flex-shrink: 0;
}
.pd-bell-badge {
  position: absolute; top: -4px; right: -4px;
  background: #f87171; color: #fff; width: 16px; height: 16px;
  border-radius: 50%; font-size: 0.6rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.pd-user-chip {
  display: flex; align-items: center; gap: 8px; padding: 5px 12px;
  background: rgba(255,255,255,0.04); border-radius: 8px; border: 1px solid rgba(255,255,255,0.07);
}
.pd-user-avatar {
  width: 28px; height: 28px; border-radius: 50%; background: #34d399;
  display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #042a15;
}
.pd-user-info  { display: flex; flex-direction: column; }
.pd-user-name  { font-size: 12.5px; font-weight: 600; color: #fff; line-height: 1.2; }
.pd-user-role  { font-size: 10.5px; color: rgba(255,255,255,0.4); }
.pd-signout {
  padding: 7px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
  background: transparent; color: rgba(255,255,255,0.55); font-size: 12.5px; font-weight: 500;
  cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; white-space: nowrap;
}
.pd-signout:hover { color: #fff; border-color: rgba(255,255,255,0.25); }

/* ── Tab nav ── */
.pd-tab-nav {
  width: 100%; display: flex; background: rgba(255,255,255,0.015);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  overflow-x: auto; -webkit-overflow-scrolling: touch;
  scrollbar-width: none; flex-shrink: 0; padding: 0 clamp(16px, 3vw, 40px);
}
.pd-tab-nav::-webkit-scrollbar { display: none; }
.pd-tab {
  flex-shrink: 0; padding: 0 clamp(12px, 1.5vw, 22px); height: 48px;
  display: flex; align-items: center; background: none; border: none;
  color: rgba(255,255,255,0.45); font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
  white-space: nowrap; border-bottom: 2px solid transparent;
}
.pd-tab:hover   { color: rgba(255,255,255,0.75); }
.pd-tab--active { color: #34d399 !important; border-bottom-color: #34d399; }

/* ── Main ── */
.pd-main    { flex: 1; width: 100%; overflow-y: auto; padding: clamp(16px, 2.5vw, 36px) clamp(16px, 3vw, 40px); }
.pd-content { width: 100%; }

/* ── Hero ── */
.pd-hero {
  width: 100%; background: linear-gradient(135deg, #0d5c26 0%, #062914 100%);
  border-radius: 16px; padding: clamp(20px, 3vw, 40px); margin-bottom: 1.25rem;
  border: 1px solid rgba(255,255,255,0.07); box-shadow: 0 20px 60px rgba(0,0,0,0.45);
  position: relative; overflow: hidden;
}
.pd-hero-glow {
  position: absolute; top: -50px; right: -50px; width: 240px; height: 240px;
  border-radius: 50%; background: radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%); pointer-events: none;
}
.pd-hero-pill {
  display: inline-flex; align-items: center; gap: 7px; padding: 5px 13px;
  border-radius: 100px; background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.3);
  color: #34d399; font-size: 11.5px; font-weight: 700; font-family: 'Bebas Neue', sans-serif;
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;
}
.pd-hero-dot     { width: 6px; height: 6px; border-radius: 50%; background: #34d399; display: inline-block; }
.pd-hero-heading { font-family: 'Bebas Neue', sans-serif; font-size: clamp(22px, 3.5vw, 36px); font-weight: 800; color: #fff; margin: 0 0 10px; letter-spacing: -0.5px; line-height: 1.2; }
.pd-green        { color: #34d399; }
.pd-hero-body    { color: rgba(184,212,193,0.8); font-size: 14px; line-height: 1.65; margin: 0 0 22px; }
.pd-hero-chips   { display: flex; flex-wrap: wrap; gap: 10px; }
.pd-hero-chip    { padding: 9px 14px; border-radius: 9px; background: rgba(0,0,0,0.28); border: 1px solid rgba(255,255,255,0.08); }
.pd-chip-label   { font-size: 10.5px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px; }
.pd-chip-value   { font-size: 13px; font-weight: 600; color: #fff; }

/* ── Stats ── */
.pd-stats-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.85rem; margin-bottom: 1.25rem;
}
.pd-stat-card {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; padding: 1rem; text-align: center; transition: border-color 0.2s;
}
.pd-stat-card:hover { border-color: rgba(52,211,153,0.2); }
.pd-stat-icon  { font-size: 1.5rem; margin-bottom: 6px; }
.pd-stat-value { font-family: 'Bebas Neue', sans-serif; font-size: 1.9rem; line-height: 1; }
.pd-stat-label { font-size: 0.68rem; color: rgba(255,255,255,0.4); font-weight: 600; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

/* ── Card ── */
.pd-card {
  background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.065);
  border-radius: 14px; padding: clamp(14px, 2vw, 24px); margin-bottom: 1.25rem;
}
.pd-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.pd-card-title  { font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 1.5px; color: #34d399; }
.pd-link-btn    { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: color 0.15s; padding: 0; }
.pd-link-btn:hover { color: #34d399; }

/* ── Child rows ── */
.pd-child-list { display: flex; flex-direction: column; gap: 0.6rem; }
.pd-child-row  {
  display: flex; align-items: center; gap: 0.85rem; padding: 0.75rem 0.9rem;
  border-radius: 9px; background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.05);
  cursor: pointer; transition: all 0.15s;
}
.pd-child-row:hover { background: rgba(52,211,153,0.05); border-color: rgba(52,211,153,0.15); }
.pd-child-info { flex: 1; min-width: 0; }
.pd-child-name { font-weight: 600; color: #fff; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pd-child-meta { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 1px; }
.pd-child-att  { text-align: right; flex-shrink: 0; }
.pd-row-arrow  { color: rgba(255,255,255,0.2); font-size: 1rem; flex-shrink: 0; }

/* ── Avatars ── */
.pd-avatar {
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #fff; flex-shrink: 0; width: 40px; height: 40px; font-size: 0.85rem;
}
.pd-avatar--md { width: 50px; height: 50px; font-size: 1rem; }
.pd-avatar--lg { width: 60px; height: 60px; font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; }

/* ── Register dashed btn ── */
.pd-register-btn {
  width: 100%; margin-top: 0.85rem; background: transparent;
  border: 1px dashed rgba(52,211,153,0.3); color: #34d399; border-radius: 9px;
  padding: 0.65rem; font-size: 0.85rem; font-weight: 600; cursor: pointer;
  font-family: 'DM Sans', sans-serif; transition: all 0.2s;
}
.pd-register-btn:hover { background: rgba(52,211,153,0.06); border-color: rgba(52,211,153,0.5); }

/* ── Notif rows ── */
.pd-notif-row    { border-radius: 9px; padding: 0.8rem 1rem; margin-bottom: 0.6rem; display: flex; gap: 0.75rem; align-items: flex-start; }
.pd-notif-icon   { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
.pd-notif-body   { flex: 1; min-width: 0; }
.pd-notif-title  { font-weight: 700; color: #fff; font-size: 0.875rem; }
.pd-notif-msg    { font-size: 0.78rem; color: rgba(255,255,255,0.55); margin-top: 2px; line-height: 1.5; }
.pd-notif-date   { font-size: 0.7rem; color: rgba(255,255,255,0.3); flex-shrink: 0; white-space: nowrap; }
.pd-notif-child  { font-size: 0.7rem; color: rgba(255,255,255,0.3); margin-top: 4px; }

.pd-notif-list   { display: flex; flex-direction: column; gap: 0.65rem; }
.pd-notif-item   { border-radius: 10px; padding: 0.95rem 1.1rem; display: flex; gap: 0.85rem; align-items: flex-start; cursor: pointer; transition: all 0.2s; }
.pd-unread-dot   { width: 7px; height: 7px; border-radius: 50%; background: #f0c000; display: inline-block; flex-shrink: 0; }

/* ── Page header ── */
.pd-page-header  { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; }
.pd-page-title   { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; color: #fff; letter-spacing: 1px; }
.pd-page-sub     { color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-top: 2px; }

/* ── Buttons ── */
.btn-green       { background: #34d399; color: #042a15; border: none; padding: 0.6rem 1.25rem; border-radius: 7px; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; white-space: nowrap; }
.btn-green:hover { background: #4ade80; transform: translateY(-1px); box-shadow: 0 5px 14px rgba(52,211,153,0.3); }
.btn-green--sm   { padding: 0.5rem 1rem; font-size: 0.78rem; }

.pd-ghost-btn    { background: transparent; border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.55); padding: 0.45rem 1rem; border-radius: 7px; font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
.pd-ghost-btn:hover { border-color: rgba(255,255,255,0.3); color: #fff; }

.pd-action-btn   { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); padding: 0.35rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
.pd-action-btn:hover { border-color: rgba(52,211,153,0.3); color: #34d399; background: rgba(52,211,153,0.07); }

.pd-back-btn     { display: inline-flex; align-items: center; gap: 0.5rem; background: none; border: none; color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; margin-bottom: 1rem; padding: 0; transition: color 0.15s; }
.pd-back-btn:hover { color: #34d399; }

/* ── Child detail ── */
.pd-detail-hero  { display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
.pd-detail-info  { flex: 1; min-width: 0; }
.pd-detail-name  { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; color: #fff; letter-spacing: 1px; line-height: 1; }
.pd-detail-meta  { color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-top: 4px; }
.pd-tag-row      { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem; }

/* ── Info grid ── */
.pd-info-grid    { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem; }
.pd-info-cell    { background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 0.75rem 1rem; }
.pd-info-key     { font-size: 0.68rem; color: rgba(255,255,255,0.38); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
.pd-info-val     { font-size: 0.9rem; font-weight: 600; color: #fff; text-transform: capitalize; }

.pd-medical-box  { margin-top: 1rem; padding: 0.9rem 1rem; background: rgba(251,191,36,0.07); border: 1px solid rgba(251,191,36,0.2); border-radius: 9px; }
.pd-medical-title{ font-size: 0.72rem; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem; }
.pd-medical-row  { font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 0.25rem; }

.pd-consent-row  { display: flex; gap: 0.65rem; flex-wrap: wrap; margin-top: 1rem; }
.pd-consent-badge{ display: flex; align-items: center; gap: 0.45rem; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
.pd-consent-badge--yes { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25); color: #34d399; }
.pd-consent-badge--no  { background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25); color: #f87171; }

/* ── Children grid ── */
.pd-children-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.pd-child-card    { cursor: pointer; transition: all 0.2s; }
.pd-child-card:hover { border-color: rgba(52,211,153,0.2); background: rgba(52,211,153,0.02); }
.pd-child-card-top   { display: flex; align-items: center; gap: 0.85rem; margin-bottom: 0.9rem; }
.pd-child-card-stats { display: flex; gap: 1rem; flex-wrap: wrap; padding-top: 0.9rem; border-top: 1px solid rgba(255,255,255,0.05); }
.pd-mini-stat  { display: flex; flex-direction: column; gap: 2px; }
.pd-mini-label { font-size: 0.68rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.4px; }
.pd-mini-value { font-size: 1rem; font-weight: 700; }

/* ── Filters ── */
.pd-filter-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
.pd-filter-btn { padding: 0.4rem 0.9rem; border-radius: 20px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.45); font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
.pd-filter-btn:hover      { border-color: rgba(52,211,153,0.25); color: rgba(255,255,255,0.75); }
.pd-filter-btn--active    { background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.3); color: #34d399; }

/* ── Attendance ── */
.pd-att-list   { display: flex; flex-direction: column; gap: 0.5rem; }
.pd-att-row    { display: flex; align-items: center; gap: 0.85rem; background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 0.7rem 1rem; flex-wrap: wrap; }
.pd-att-dot    { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.pd-att-date   { font-size: 0.82rem; color: rgba(255,255,255,0.5); flex: 1; min-width: 90px; }
.pd-att-child  { font-size: 0.78rem; color: rgba(255,255,255,0.55); font-weight: 600; }
.pd-att-status { font-size: 0.8rem; font-weight: 700; text-transform: capitalize; }
.pd-fed-badge     { font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 10px; background: rgba(52,211,153,0.1); color: #34d399; }
.pd-fed-badge--no { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.25); }

/* ── Tags ── */
.tag-ok     { background: rgba(52,211,153,0.1);  color: #34d399; border: 1px solid rgba(52,211,153,0.2);  padding: 0.15rem 0.55rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; }
.tag-warn   { background: rgba(251,191,36,0.1);  color: #fbbf24; border: 1px solid rgba(251,191,36,0.2);  padding: 0.15rem 0.55rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; }
.tag-danger { background: rgba(248,113,113,0.1); color: #f87171; border: 1px solid rgba(248,113,113,0.2); padding: 0.15rem 0.55rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; }

/* ── Form inputs (modal) ── */
input, select {
  color-scheme: dark;
}
input:focus, select:focus {
  border-color: #34d399 !important;
  outline: none;
  box-shadow: 0 0 0 3px rgba(52,211,153,0.12);
}
input::placeholder { color: rgba(255,255,255,0.25); }
select option { background: #0a2614; color: #fff; }

/* ── Responsive ── */
@media (max-width: 1024px) { .pd-children-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 900px)  { .pd-stats-grid { grid-template-columns: repeat(2, 1fr); } .pd-info-grid { grid-template-columns: repeat(2, 1fr); } .pd-children-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px)  { .pd-header { height: auto; padding: 10px 16px; } .pd-user-chip { display: none; } .pd-tab-nav { padding: 0 8px; } .pd-tab { padding: 0 10px; font-size: 0.78rem; } .pd-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 0.65rem; } .pd-info-grid { grid-template-columns: 1fr 1fr; } .pd-hero { padding: 18px; } .pd-main { padding: 14px; } .pd-detail-hero { flex-direction: column; } }
@media (max-width: 400px)  { .pd-signout { display: none; } .pd-stats-grid { grid-template-columns: 1fr 1fr; gap: 0.5rem; } .pd-stat-card { padding: 0.75rem 0.5rem; } .pd-stat-value { font-size: 1.5rem; } .pd-info-grid { grid-template-columns: 1fr; } .pd-hero-heading { font-size: 20px; } }
`;