// src/features/dashboard/TeacherDashboard.tsx
// Teacher dashboard — register families, mark attendance, record feeding, flag welfare concerns.

import { useState } from 'react';

interface MockUser {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface TeacherDashboardProps {
  user?: MockUser;
  onLogout?: () => void;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  dateOfBirth: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  hasAllergies: boolean;
  allergiesDetails?: string;
  hasMedicalCondition: boolean;
  medicalDetails?: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  attendanceRate: number;
  welfareFlags: number;
  registeredBy: 'parent' | 'teacher';
}

interface AttendanceEntry {
  childId: string;
  status: 'present' | 'absent' | 'late' | null;
  fed: boolean;
}

interface WelfareFlag {
  id: string;
  childId: string;
  childName: string;
  concern: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  resolved: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate  = (d: string) => new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
const todayStr = () => new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const todayISO = () => new Date().toISOString().split('T')[0];
const initials = (f: string, l: string) => `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase();
const calcAge  = (dob: string) => Math.max(0, Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)));

const AVATAR_PALETTE = ['#2d6a4f','#1e6091','#6d3e91','#a05c34','#1a6b6b','#8b3a3a','#4a6741','#1a5276','#6e2f8a'];
const PRESET_COLORS: Record<string, string> = {
  k1: '#2d6a4f', k2: '#1e6091', k3: '#6d3e91', k4: '#a05c34',
  k5: '#1a6b6b', k6: '#8b3a3a', k7: '#4a6741',
};
const avatarColor = (id: string, idx: number) => PRESET_COLORS[id] ?? AVATAR_PALETTE[idx % AVATAR_PALETTE.length];

const GRADES = ['Grade R','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7'];

// ─── Initial mock data ─────────────────────────────────────────────────────────
const INITIAL_CHILDREN: Child[] = [
  { id: 'k1', firstName: 'Amara',  lastName: 'Dlamini',  grade: 'Grade 3', dateOfBirth: '2016-03-14', age: 7,  gender: 'female', hasAllergies: true,  allergiesDetails: 'Peanuts',       hasMedicalCondition: false, parentName: 'Nomsa Dlamini',  parentPhone: '+27 82 111 2233', parentEmail: 'parent@demo.church',  attendanceRate: 92, welfareFlags: 0, registeredBy: 'parent' },
  { id: 'k2', firstName: 'Sipho',  lastName: 'Dlamini',  grade: 'Grade 3', dateOfBirth: '2014-07-22', age: 9,  gender: 'male',   hasAllergies: false,                                    hasMedicalCondition: true,  medicalDetails: 'Asthma',     parentName: 'Nomsa Dlamini',  parentPhone: '+27 82 111 2233', parentEmail: 'parent@demo.church',  attendanceRate: 78, welfareFlags: 1, registeredBy: 'parent' },
  { id: 'k3', firstName: 'Lerato', lastName: 'Mokoena',  grade: 'Grade 3', dateOfBirth: '2015-11-08', age: 8,  gender: 'female', hasAllergies: false,                                    hasMedicalCondition: false,                               parentName: 'James Mokoena',  parentPhone: '+27 71 222 3344', parentEmail: 'james@church.co.za',  attendanceRate: 88, welfareFlags: 0, registeredBy: 'parent' },
  { id: 'k4', firstName: 'Thabo',  lastName: 'Sithole',  grade: 'Grade 3', dateOfBirth: '2013-05-17', age: 10, gender: 'male',   hasAllergies: false,                                    hasMedicalCondition: false,                               parentName: 'Grace Sithole',  parentPhone: '+27 83 333 4455', parentEmail: 'grace@church.co.za',  attendanceRate: 95, welfareFlags: 0, registeredBy: 'parent' },
  { id: 'k5', firstName: 'Naledi', lastName: 'Khumalo',  grade: 'Grade 3', dateOfBirth: '2015-09-03', age: 8,  gender: 'female', hasAllergies: true,  allergiesDetails: 'Dairy, eggs',   hasMedicalCondition: false,                               parentName: 'Ruth Khumalo',   parentPhone: '+27 72 444 5566', parentEmail: 'ruth@church.co.za',   attendanceRate: 70, welfareFlags: 0, registeredBy: 'parent' },
  { id: 'k6', firstName: 'Kabelo', lastName: 'Mahlangu', grade: 'Grade 3', dateOfBirth: '2014-12-01', age: 9,  gender: 'male',   hasAllergies: false,                                    hasMedicalCondition: false,                               parentName: 'Peter Mahlangu', parentPhone: '+27 84 555 6677', parentEmail: 'peter@church.co.za',  attendanceRate: 83, welfareFlags: 0, registeredBy: 'parent' },
  { id: 'k7', firstName: 'Zintle', lastName: 'Mthembu',  grade: 'Grade 3', dateOfBirth: '2016-01-25', age: 7,  gender: 'female', hasAllergies: false,                                    hasMedicalCondition: false,                               parentName: 'Faith Mthembu',  parentPhone: '+27 73 666 7788', parentEmail: 'faith@church.co.za',  attendanceRate: 60, welfareFlags: 2, registeredBy: 'parent' },
];

const INITIAL_WELFARE: WelfareFlag[] = [
  { id: 'w1', childId: 'k2', childName: 'Sipho Dlamini',  concern: 'Child appeared withdrawn and had visible bruising on left arm.', severity: 'high',   date: '2026-03-01', resolved: false },
  { id: 'w2', childId: 'k7', childName: 'Zintle Mthembu', concern: 'Child mentioned not eating at home. Appears underweight.',         severity: 'medium', date: '2026-02-23', resolved: false },
  { id: 'w3', childId: 'k7', childName: 'Zintle Mthembu', concern: 'Arrived in dirty clothing for second week in a row.',               severity: 'low',    date: '2026-02-16', resolved: true  },
];

// ─── Shared inline style constants ────────────────────────────────────────────
const FL: React.CSSProperties = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', letterSpacing: '0.2px' };
const FI: React.CSSProperties = { width: '100%', padding: '0.72rem 0.9rem', borderRadius: '9px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: '0.9rem', outline: 'none', colorScheme: 'dark' as any };
const FE: React.CSSProperties = { fontSize: '0.72rem', color: '#f87171', marginTop: '0.3rem', display: 'block' };

const BTN_BLUE: React.CSSProperties  = { width: '100%', padding: '0.8rem', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg,#60a5fa,#2563eb)', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' };
const BTN_GHOST: React.CSSProperties = { padding: '0.8rem 1.25rem', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.55)', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' };

// ─── Register Family Modal ─────────────────────────────────────────────────────
interface RegisterFamilyModalProps {
  onClose: () => void;
  onRegister: (child: Child) => void;
  existingCount: number;
}

function RegisterFamilyModal({ onClose, onRegister, existingCount }: RegisterFamilyModalProps) {
  const [step, setStep]   = useState<1 | 2 | 3>(1);
  const [saved, setSaved] = useState(false);

  // Step 1 — Guardian
  const [parentFirstName, setParentFirstName] = useState('');
  const [parentLastName,  setParentLastName]  = useState('');
  const [parentPhone,     setParentPhone]     = useState('');
  const [parentEmail,     setParentEmail]     = useState('');
  const [relationship,    setRelationship]    = useState('');

  // Step 2 — Child
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName,  setChildLastName]  = useState('');
  const [dob,            setDob]            = useState('');
  const [gender,         setGender]         = useState<'male'|'female'|'other'|''>('');
  const [grade,          setGrade]          = useState('');

  // Step 3 — Medical & consent
  const [hasAllergies,       setHasAllergies]       = useState(false);
  const [allergiesDetails,   setAllergiesDetails]   = useState('');
  const [hasMedical,         setHasMedical]         = useState(false);
  const [medicalDetails,     setMedicalDetails]     = useState('');
  const [consentActivities,  setConsentActivities]  = useState(true);
  const [consentMedical,     setConsentMedical]     = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate1 = () => {
    const e: Record<string,string> = {};
    if (!parentFirstName.trim()) e.pFN = 'Required.';
    if (!parentLastName.trim())  e.pLN = 'Required.';
    if (!parentPhone.trim())     e.pPH = 'Required.';
    if (!relationship)           e.rel = 'Required.';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const validate2 = () => {
    const e: Record<string,string> = {};
    if (!childFirstName.trim()) e.cFN   = 'Required.';
    if (!childLastName.trim())  e.cLN   = 'Required.';
    if (!dob)                   e.dob   = 'Required.';
    if (!gender)                e.gender= 'Required.';
    if (!grade)                 e.grade = 'Required.';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleNext1 = () => { if (validate1()) { setErrors({}); setStep(2); } };
  const handleNext2 = () => { if (validate2()) { setErrors({}); setStep(3); } };

  const handleSubmit = () => {
    const newChild: Child = {
      id: `k${Date.now()}`,
      firstName: childFirstName.trim(),
      lastName:  childLastName.trim(),
      grade,
      dateOfBirth: dob,
      age:  calcAge(dob),
      gender: gender as 'male'|'female'|'other',
      hasAllergies,
      allergiesDetails:    hasAllergies ? allergiesDetails : undefined,
      hasMedicalCondition: hasMedical,
      medicalDetails:      hasMedical   ? medicalDetails   : undefined,
      parentName:  `${parentFirstName.trim()} ${parentLastName.trim()}`,
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(),
      attendanceRate: 0,
      welfareFlags:   0,
      registeredBy:   'teacher',
    };
    setSaved(true);
    setTimeout(() => { onRegister(newChild); onClose(); }, 900);
  };

  const STEP_LABELS = ['Guardian Info', 'Child Details', 'Medical & Consent'];

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.82)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background:'#040e18', border:'1px solid rgba(96,165,250,0.2)', borderRadius:'18px', width:'100%', maxWidth:'540px', maxHeight:'90vh', overflow:'auto', boxShadow:'0 32px 80px rgba(0,0,0,0.75)' }}>

        {/* Modal header */}
        <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.3rem', color:'#60a5fa', letterSpacing:1.5 }}>REGISTER FAMILY</div>
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', marginTop:2 }}>Step {step} of 3 — {STEP_LABELS[step-1]}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'1.3rem', cursor:'pointer', lineHeight:1 }}>✕</button>
        </div>

        {/* Progress bar */}
        <div style={{ height:3, background:'rgba(255,255,255,0.06)' }}>
          <div style={{ height:'100%', width:`${(step/3)*100}%`, background:'linear-gradient(90deg,#60a5fa,#2563eb)', transition:'width 0.35s ease' }} />
        </div>

        <div style={{ padding:'1.5rem' }}>

          {/* ── STEP 1: Guardian ── */}
          {step === 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
              <div style={{ fontSize:'0.68rem', fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:2, textTransform:'uppercase' }}>PARENT / GUARDIAN INFORMATION</div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                <div>
                  <label style={FL}>First Name *</label>
                  <input style={{ ...FI, borderColor: errors.pFN ? '#f87171' : 'rgba(255,255,255,0.1)' }} placeholder="e.g. Nomsa" value={parentFirstName} onChange={e => setParentFirstName(e.target.value)} />
                  {errors.pFN && <span style={FE}>{errors.pFN}</span>}
                </div>
                <div>
                  <label style={FL}>Last Name *</label>
                  <input style={{ ...FI, borderColor: errors.pLN ? '#f87171' : 'rgba(255,255,255,0.1)' }} placeholder="e.g. Dlamini" value={parentLastName} onChange={e => setParentLastName(e.target.value)} />
                  {errors.pLN && <span style={FE}>{errors.pLN}</span>}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                <div>
                  <label style={FL}>Phone Number *</label>
                  <input style={{ ...FI, borderColor: errors.pPH ? '#f87171' : 'rgba(255,255,255,0.1)' }} type="tel" placeholder="+27 82 111 2233" value={parentPhone} onChange={e => setParentPhone(e.target.value)} />
                  {errors.pPH && <span style={FE}>{errors.pPH}</span>}
                </div>
                <div>
                  <label style={FL}>Relationship *</label>
                  <select style={{ ...FI, borderColor: errors.rel ? '#f87171' : 'rgba(255,255,255,0.1)' }} value={relationship} onChange={e => setRelationship(e.target.value)}>
                    <option value="">Select</option>
                    {['Mother','Father','Grandmother','Grandfather','Aunt','Uncle','Guardian','Other'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.rel && <span style={FE}>{errors.rel}</span>}
                </div>
              </div>

              <div>
                <label style={FL}>Email <span style={{ color:'rgba(255,255,255,0.3)', fontWeight:400 }}>(optional)</span></label>
                <input style={FI} type="email" placeholder="parent@example.com" value={parentEmail} onChange={e => setParentEmail(e.target.value)} />
              </div>

              <button onClick={handleNext1} style={BTN_BLUE}>Next: Child Details →</button>
            </div>
          )}

          {/* ── STEP 2: Child ── */}
          {step === 2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
              <div style={{ fontSize:'0.68rem', fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:2, textTransform:'uppercase' }}>CHILD INFORMATION</div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                <div>
                  <label style={FL}>First Name *</label>
                  <input style={{ ...FI, borderColor: errors.cFN ? '#f87171' : 'rgba(255,255,255,0.1)' }} placeholder="e.g. Amara" value={childFirstName} onChange={e => setChildFirstName(e.target.value)} />
                  {errors.cFN && <span style={FE}>{errors.cFN}</span>}
                </div>
                <div>
                  <label style={FL}>Last Name *</label>
                  <input style={{ ...FI, borderColor: errors.cLN ? '#f87171' : 'rgba(255,255,255,0.1)' }} placeholder="e.g. Mokoena" value={childLastName} onChange={e => setChildLastName(e.target.value)} />
                  {errors.cLN && <span style={FE}>{errors.cLN}</span>}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                <div>
                  <label style={FL}>Date of Birth *</label>
                  <input type="date" style={{ ...FI, borderColor: errors.dob ? '#f87171' : 'rgba(255,255,255,0.1)' }} value={dob} onChange={e => setDob(e.target.value)} max={todayISO()} />
                  {errors.dob && <span style={FE}>{errors.dob}</span>}
                </div>
                <div>
                  <label style={FL}>Gender *</label>
                  <select style={{ ...FI, borderColor: errors.gender ? '#f87171' : 'rgba(255,255,255,0.1)' }} value={gender} onChange={e => setGender(e.target.value as any)}>
                    <option value="">Select</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <span style={FE}>{errors.gender}</span>}
                </div>
              </div>

              <div>
                <label style={FL}>Grade *</label>
                <select style={{ ...FI, borderColor: errors.grade ? '#f87171' : 'rgba(255,255,255,0.1)' }} value={grade} onChange={e => setGrade(e.target.value)}>
                  <option value="">Select grade</option>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.grade && <span style={FE}>{errors.grade}</span>}
              </div>

              {/* Live preview */}
              {childFirstName && childLastName && (
                <div style={{ display:'flex', alignItems:'center', gap:'0.85rem', padding:'0.85rem 1rem', borderRadius:'10px', background:'rgba(96,165,250,0.06)', border:'1px solid rgba(96,165,250,0.15)' }}>
                  <div style={{ width:42, height:42, borderRadius:'50%', background: AVATAR_PALETTE[existingCount % AVATAR_PALETTE.length], display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',sans-serif", fontSize:'1rem', color:'#fff', flexShrink:0 }}>
                    {initials(childFirstName, childLastName)}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:'#fff', fontSize:'0.95rem' }}>{childFirstName} {childLastName}</div>
                    <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.4)', marginTop:1 }}>
                      {grade || 'Grade TBD'} · {dob ? `Age ${calcAge(dob)}` : 'DOB TBD'} · Guardian: {parentFirstName} {parentLastName}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display:'flex', gap:'0.65rem' }}>
                <button onClick={() => { setErrors({}); setStep(1); }} style={BTN_GHOST}>← Back</button>
                <button onClick={handleNext2} style={{ ...BTN_BLUE, flex:1 }}>Next: Medical & Consent →</button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Medical & consent ── */}
          {step === 3 && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
              <div style={{ fontSize:'0.68rem', fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:2, textTransform:'uppercase' }}>MEDICAL INFORMATION</div>

              {/* Allergies toggle */}
              <div onClick={() => setHasAllergies(v => !v)} style={{ display:'flex', alignItems:'flex-start', gap:'0.85rem', padding:'0.9rem 1rem', borderRadius:'10px', cursor:'pointer', background: hasAllergies ? 'rgba(251,191,36,0.07)' : 'rgba(255,255,255,0.03)', border:`1px solid ${hasAllergies ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.08)'}`, transition:'all 0.2s' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, background: hasAllergies ? '#fbbf24' : 'rgba(255,255,255,0.08)', border:`2px solid ${hasAllergies ? '#fbbf24' : 'rgba(255,255,255,0.15)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', color:'#042a15', fontWeight:900, transition:'all 0.2s' }}>{hasAllergies && '✓'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.875rem', fontWeight:600, color: hasAllergies ? '#fbbf24' : 'rgba(255,255,255,0.65)' }}>⚠ Child has allergies</div>
                  {hasAllergies && (
                    <input style={{ ...FI, marginTop:'0.6rem', borderColor:'rgba(251,191,36,0.3)' }} placeholder="e.g. Peanuts, dairy" value={allergiesDetails}
                      onChange={e => { e.stopPropagation(); setAllergiesDetails(e.target.value); }}
                      onClick={e => e.stopPropagation()} />
                  )}
                </div>
              </div>

              {/* Medical toggle */}
              <div onClick={() => setHasMedical(v => !v)} style={{ display:'flex', alignItems:'flex-start', gap:'0.85rem', padding:'0.9rem 1rem', borderRadius:'10px', cursor:'pointer', background: hasMedical ? 'rgba(248,113,113,0.07)' : 'rgba(255,255,255,0.03)', border:`1px solid ${hasMedical ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.08)'}`, transition:'all 0.2s' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, background: hasMedical ? '#f87171' : 'rgba(255,255,255,0.08)', border:`2px solid ${hasMedical ? '#f87171' : 'rgba(255,255,255,0.15)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', color:'#fff', fontWeight:900, transition:'all 0.2s' }}>{hasMedical && '✓'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.875rem', fontWeight:600, color: hasMedical ? '#f87171' : 'rgba(255,255,255,0.65)' }}>⚕ Child has a medical condition</div>
                  {hasMedical && (
                    <input style={{ ...FI, marginTop:'0.6rem', borderColor:'rgba(248,113,113,0.3)' }} placeholder="e.g. Asthma — has inhaler" value={medicalDetails}
                      onChange={e => { e.stopPropagation(); setMedicalDetails(e.target.value); }}
                      onClick={e => e.stopPropagation()} />
                  )}
                </div>
              </div>

              <div style={{ fontSize:'0.68rem', fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:2, textTransform:'uppercase', marginTop:'0.25rem' }}>CONSENT</div>

              {([
                { label:'Consent to participate in Sunday school activities', value: consentActivities, set: setConsentActivities },
                { label:'Authorise emergency medical treatment if parent is unavailable', value: consentMedical, set: setConsentMedical },
              ] as const).map(({ label, value, set }) => (
                <div key={label} onClick={() => set(!value)} style={{ display:'flex', alignItems:'center', gap:'0.85rem', padding:'0.85rem 1rem', borderRadius:'10px', cursor:'pointer', background: value ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.03)', border:`1px solid ${value ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.08)'}`, transition:'all 0.2s' }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, background: value ? '#34d399' : 'rgba(255,255,255,0.08)', border:`2px solid ${value ? '#34d399' : 'rgba(255,255,255,0.15)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', color:'#042a15', fontWeight:900, transition:'all 0.2s' }}>{value && '✓'}</div>
                  <span style={{ fontSize:'0.875rem', color: value ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)' }}>{label}</span>
                </div>
              ))}

              <div style={{ padding:'10px 14px', borderRadius:'9px', background:'rgba(96,165,250,0.07)', border:'1px solid rgba(96,165,250,0.18)', fontSize:'0.78rem', color:'rgba(255,255,255,0.4)', display:'flex', gap:'0.5rem', lineHeight:1.55 }}>
                <span>🔒</span><span>Information collected in accordance with POPIA for Sunday school administration.</span>
              </div>

              <div style={{ display:'flex', gap:'0.65rem' }}>
                <button onClick={() => { setErrors({}); setStep(2); }} style={BTN_GHOST}>← Back</button>
                <button onClick={handleSubmit} disabled={saved} style={{ ...BTN_BLUE, flex:1, opacity: saved ? 0.7 : 1 }}>
                  {saved ? '✓ Family Registered!' : 'Register Family'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
type Tab = 'overview' | 'attendance' | 'welfare' | 'register' | 'families';

export default function TeacherDashboard({
  user = { name: 'Thabo Mokoena', email: 'teacher@demo.church', phone: '+27 73 444 5566', role: 'teacher' },
  onLogout,
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [children,  setChildren]  = useState<Child[]>(INITIAL_CHILDREN);
  const [showRegisterFamily, setShowRegisterFamily] = useState(false);

  // Attendance state — one entry per child
  const [attendance, setAttendance] = useState<AttendanceEntry[]>(
    INITIAL_CHILDREN.map(c => ({ childId: c.id, status: null, fed: false }))
  );
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // Welfare state
  const [welfare,       setWelfare]       = useState<WelfareFlag[]>(INITIAL_WELFARE);
  const [welfareForm,   setWelfareForm]   = useState({ childId: '', concern: '', severity: 'medium' as 'low'|'medium'|'high' });
  const [welfareErrors, setWelfareErrors] = useState<Record<string,string>>({});
  const [welfareSaved,  setWelfareSaved]  = useState(false);

  // ── Attendance helpers ────────────────────────────────────────────────────
  const setStatus = (childId: string, status: 'present'|'absent'|'late') =>
    setAttendance(prev => prev.map(a => a.childId === childId ? { ...a, status } : a));
  const toggleFed = (childId: string) =>
    setAttendance(prev => prev.map(a => a.childId === childId ? { ...a, fed: !a.fed } : a));

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount  = attendance.filter(a => a.status === 'absent').length;
  const lateCount    = attendance.filter(a => a.status === 'late').length;
  const fedCount     = attendance.filter(a => a.fed).length;
  const unmarked     = attendance.filter(a => a.status === null).length;

  const saveAttendance = () => {
    if (unmarked > 0) return;
    setAttendanceSaved(true);
    setTimeout(() => setAttendanceSaved(false), 3000);
  };

  // ── Welfare helpers ───────────────────────────────────────────────────────
  const submitWelfare = () => {
    const e: Record<string,string> = {};
    if (!welfareForm.childId)        e.childId = 'Please select a child.';
    if (!welfareForm.concern.trim()) e.concern  = 'Please describe the concern.';
    setWelfareErrors(e);
    if (Object.keys(e).length) return;
    const child = children.find(c => c.id === welfareForm.childId);
    setWelfare(prev => [{
      id: `w${Date.now()}`,
      childId:   welfareForm.childId,
      childName: child ? `${child.firstName} ${child.lastName}` : '',
      concern:   welfareForm.concern,
      severity:  welfareForm.severity,
      date:      todayISO(),
      resolved:  false,
    }, ...prev]);
    setWelfareForm({ childId: '', concern: '', severity: 'medium' });
    setWelfareSaved(true);
    setTimeout(() => setWelfareSaved(false), 3000);
  };

  const resolveFlag = (id: string) =>
    setWelfare(prev => prev.map(w => w.id === id ? { ...w, resolved: true } : w));

  // ── Register family callback ──────────────────────────────────────────────
  const handleRegisterChild = (newChild: Child) => {
    setChildren(prev => [...prev, newChild]);
    setAttendance(prev => [...prev, { childId: newChild.id, status: null, fed: false }]);
  };

  const openWelfare   = welfare.filter(w => !w.resolved).length;
  const avgAttendance = children.length
    ? Math.round(children.reduce((s, c) => s + c.attendanceRate, 0) / children.length)
    : 0;

  return (
    <>
      <style>{CSS}</style>

      {showRegisterFamily && (
        <RegisterFamilyModal
          onClose={() => setShowRegisterFamily(false)}
          onRegister={handleRegisterChild}
          existingCount={children.length}
        />
      )}

      <div className="td-root">

        {/* ── Header ── */}
        <header className="td-header">
          <div className="td-brand">
            <div className="td-brand-badge">🧑‍🏫</div>
            <div>
              <div className="td-brand-name">Sunday School Portal</div>
              <div className="td-brand-sub">Teacher Dashboard</div>
            </div>
          </div>
          <div className="td-header-right">
            <div className="td-user-chip">
              <div className="td-avatar-sm">{user.name.charAt(0)}</div>
              <div>
                <div className="td-user-name">{user.name}</div>
                <div className="td-user-role">Teacher · Grade 3</div>
              </div>
            </div>
            <button className="td-signout" onClick={onLogout}>Sign out</button>
          </div>
        </header>

        {/* ── Tabs ── */}
        <nav className="td-tab-nav">
          {([
            { id: 'overview',   label: '🏠 Overview' },
            { id: 'attendance', label: `✅ Attendance${unmarked > 0 ? ` (${unmarked} unmarked)` : attendanceSaved ? ' ✓' : ''}` },
            { id: 'welfare',    label: `🚨 Welfare${openWelfare > 0 ? ` (${openWelfare})` : ''}` },
            { id: 'register',   label: '📋 Class Register' },
            { id: 'families',   label: '👨‍👩‍👧 Register Family' },
          ] as const).map(tab => (
            <button key={tab.id} className={`td-tab${activeTab === tab.id ? ' td-tab--active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── Main ── */}
        <main className="td-main">
          <div className="td-content">

            {/* ══ OVERVIEW ══════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="td-fade">
                <div className="td-hero">
                  <div className="td-hero-glow" />
                  <div className="td-hero-pill"><span className="td-hero-dot" />Teacher</div>
                  <h1 className="td-hero-h1">Good morning, <span className="td-blue">{user.name.split(' ')[0]}</span></h1>
                  <p className="td-hero-p">
                    You have <strong style={{ color:'#fff' }}>{children.length} children</strong> in Grade 3.
                    {openWelfare > 0 && <> <strong style={{ color:'#f87171' }}>{openWelfare} welfare concern{openWelfare > 1 ? 's' : ''}</strong> need attention.</>}
                    {unmarked > 0 && <> <strong style={{ color:'#fbbf24' }}>Today's attendance</strong> has not been marked yet.</>}
                  </p>
                  <div className="td-hero-chips">
                    {[
                      { l:'Class',   v:'Grade 3' },
                      { l:'Pupils',  v:`${children.length} registered` },
                      { l:'Avg Att', v:`${avgAttendance}%` },
                      { l:'Today',   v:todayStr() },
                    ].map(({ l, v }) => (
                      <div key={l} className="td-chip"><div className="td-chip-l">{l}</div><div className="td-chip-v">{v}</div></div>
                    ))}
                  </div>
                </div>

                <div className="td-stats-grid">
                  {[
                    { icon:'👶', label:'Class Size',      value: children.length,                                                             color:'#60a5fa' },
                    { icon:'📅', label:'Avg Attendance',  value: `${avgAttendance}%`,                                                         color:'#34d399' },
                    { icon:'🚨', label:'Open Welfare',    value: openWelfare,   color: openWelfare > 0 ? '#f87171' : '#34d399' },
                    { icon:'⚠',  label:'Medical/Allergy', value: children.filter(c => c.hasAllergies || c.hasMedicalCondition).length,         color:'#fbbf24' },
                  ].map(s => (
                    <div key={s.label} className="td-stat-card">
                      <div className="td-stat-icon">{s.icon}</div>
                      <div className="td-stat-value" style={{ color: s.color }}>{s.value}</div>
                      <div className="td-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="td-card">
                  <div className="td-card-title">Quick Actions</div>
                  <div className="td-quick-grid">
                    {[
                      { icon:'✅', label:'Mark Attendance',     sub: unmarked > 0 ? `${unmarked} unmarked` : 'Up to date',  tab:'attendance' as Tab, urgent: unmarked > 0 },
                      { icon:'🍽', label:'Record Feeding',      sub: `${fedCount} fed today`,                               tab:'attendance' as Tab, urgent: false },
                      { icon:'🚨', label:'Log Welfare Concern', sub:'Flag a safeguarding issue',                            tab:'welfare'    as Tab, urgent: openWelfare > 0 },
                      { icon:'📋', label:'Class Register',      sub:`${children.length} children`,                          tab:'register'   as Tab, urgent: false },
                      { icon:'👨‍👩‍👧', label:'Register Family',    sub:'Add child + guardian',                                 tab:'families'   as Tab, urgent: false },
                    ].map(a => (
                      <button key={a.label} className={`td-quick-btn${a.urgent ? ' td-quick-btn--urgent' : ''}`} onClick={() => setActiveTab(a.tab)}>
                        <div className="td-quick-icon">{a.icon}</div>
                        <div className="td-quick-label">{a.label}</div>
                        <div className="td-quick-sub">{a.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {children.some(c => c.hasAllergies || c.hasMedicalCondition) && (
                  <div className="td-card">
                    <div className="td-card-title" style={{ color:'#fbbf24' }}>⚠ Medical & Allergy Alerts</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginTop:'0.75rem' }}>
                      {children.filter(c => c.hasAllergies || c.hasMedicalCondition).map((c, idx) => (
                        <div key={c.id} className="td-alert-row">
                          <div className="td-avatar-xs" style={{ background: avatarColor(c.id, idx) }}>{initials(c.firstName, c.lastName)}</div>
                          <div>
                            <div style={{ fontWeight:600, color:'#fff', fontSize:'0.88rem' }}>{c.firstName} {c.lastName}</div>
                            {c.hasAllergies        && <div style={{ fontSize:'0.76rem', color:'#fbbf24' }}>⚠ Allergy: {c.allergiesDetails}</div>}
                            {c.hasMedicalCondition && <div style={{ fontSize:'0.76rem', color:'#f87171' }}>⚕ Medical: {c.medicalDetails}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══ ATTENDANCE & FEEDING ══════════════════════════════════ */}
            {activeTab === 'attendance' && (
              <div className="td-fade">
                <div className="td-page-header">
                  <div>
                    <div className="td-page-title">Attendance & Feeding</div>
                    <div className="td-page-sub">{todayStr()} · Grade 3</div>
                  </div>
                  <button
                    className="td-btn-primary"
                    onClick={saveAttendance}
                    disabled={unmarked > 0}
                    title={unmarked > 0 ? `${unmarked} children still unmarked` : ''}
                  >
                    {attendanceSaved ? '✓ Saved!' : unmarked > 0 ? `Save (${unmarked} remaining)` : 'Save Attendance'}
                  </button>
                </div>

                {/* Summary strip */}
                <div className="td-att-summary">
                  {[
                    { label:'Present',  count: presentCount, color:'#34d399' },
                    { label:'Absent',   count: absentCount,  color:'#f87171' },
                    { label:'Late',     count: lateCount,    color:'#fbbf24' },
                    { label:'🍽 Fed',   count: fedCount,     color:'#60a5fa' },
                    { label:'Unmarked', count: unmarked,     color:'rgba(255,255,255,0.3)' },
                  ].map(s => (
                    <div key={s.label} className="td-att-sum-item">
                      <div style={{ fontSize:'1.4rem', fontWeight:800, color: s.color, fontFamily:"'Bebas Neue',sans-serif" }}>{s.count}</div>
                      <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="td-card" style={{ padding:0, overflow:'hidden' }}>
                  <table className="td-att-table">
                    <thead>
                      <tr>
                        <th>Child</th>
                        <th>Age</th>
                        <th>Medical</th>
                        <th>Attendance Status</th>
                        <th>🍽 Fed Today</th>
                      </tr>
                    </thead>
                    <tbody>
                      {children.map((child, idx) => {
                        const entry = attendance.find(a => a.childId === child.id) ?? { childId: child.id, status: null, fed: false };
                        return (
                          <tr key={child.id} className={`td-att-tr${entry.status ? ` td-att-tr--${entry.status}` : ''}`}>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
                                <div className="td-avatar-xs" style={{ background: avatarColor(child.id, idx) }}>{initials(child.firstName, child.lastName)}</div>
                                <div>
                                  <div style={{ fontWeight:600, color:'#fff', fontSize:'0.875rem' }}>{child.firstName} {child.lastName}</div>
                                  {child.registeredBy === 'teacher' && <div style={{ fontSize:'0.65rem', color:'#60a5fa' }}>Registered by teacher</div>}
                                  {(child.hasAllergies || child.hasMedicalCondition) && (
                                    <div style={{ fontSize:'0.68rem', color:'#fbbf24' }}>
                                      {child.hasAllergies && '⚠ Allergy '}
                                      {child.hasMedicalCondition && '⚕ Medical'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.85rem' }}>{child.age}</td>
                            <td style={{ fontSize:'0.8rem' }}>
                              {child.hasMedicalCondition
                                ? <span className="td-tag-warn">⚕ Yes</span>
                                : <span style={{ color:'rgba(255,255,255,0.25)' }}>None</span>}
                            </td>
                            <td>
                              <div className="td-status-btns">
                                {(['present','absent','late'] as const).map(s => (
                                  <button
                                    key={s}
                                    className={`td-status-btn td-status-btn--${s}${entry.status === s ? ' active' : ''}`}
                                    onClick={() => setStatus(child.id, s)}
                                  >
                                    {s === 'present' ? '✓' : s === 'absent' ? '✗' : '~'} {s}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td>
                              <button
                                className={`td-fed-btn${entry.fed ? ' td-fed-btn--active' : ''}`}
                                onClick={() => toggleFed(child.id)}
                              >
                                {entry.fed ? '🍽 Fed' : '— Not fed'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Feeding summary */}
                <div className="td-card">
                  <div className="td-card-title" style={{ color:'#60a5fa', marginBottom:'0.85rem' }}>🍽 Feeding Summary</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.75rem' }}>
                    {[
                      { label:'Fed Today',     value: fedCount,                                                             color:'#60a5fa' },
                      { label:'Not Fed',       value: children.length - fedCount,                                          color:'rgba(255,255,255,0.3)' },
                      { label:'Present + Fed', value: attendance.filter(a => a.status === 'present' && a.fed).length,      color:'#34d399' },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign:'center', padding:'0.85rem', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize:'1.6rem', fontWeight:800, color: s.color, fontFamily:"'Bebas Neue',sans-serif" }}>{s.value}</div>
                        <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.5px', marginTop:4 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ WELFARE ═══════════════════════════════════════════════ */}
            {activeTab === 'welfare' && (
              <div className="td-fade">
                <div className="td-page-header">
                  <div>
                    <div className="td-page-title">Welfare Concerns</div>
                    <div className="td-page-sub">{openWelfare} open · {welfare.length} total logged</div>
                  </div>
                </div>

                <div className="td-card">
                  <div className="td-card-title" style={{ marginBottom:'1rem' }}>🚨 Log New Concern</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                      <div>
                        <label style={WL}>Child *</label>
                        <select style={{ ...WI, borderColor: welfareErrors.childId ? '#f87171' : 'rgba(255,255,255,0.1)' }} value={welfareForm.childId} onChange={e => setWelfareForm(f => ({ ...f, childId: e.target.value }))}>
                          <option value="">Select child</option>
                          {children.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                        </select>
                        {welfareErrors.childId && <span style={WE}>{welfareErrors.childId}</span>}
                      </div>
                      <div>
                        <label style={WL}>Severity *</label>
                        <select style={WI} value={welfareForm.severity} onChange={e => setWelfareForm(f => ({ ...f, severity: e.target.value as any }))}>
                          <option value="low">Low — minor concern</option>
                          <option value="medium">Medium — needs monitoring</option>
                          <option value="high">High — urgent / safeguarding</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={WL}>Description of Concern *</label>
                      <textarea style={{ ...WI, minHeight:90, resize:'vertical' } as any} placeholder="Describe what you observed. Be specific — date, behaviour, physical signs..." value={welfareForm.concern} onChange={e => setWelfareForm(f => ({ ...f, concern: e.target.value }))} />
                      {welfareErrors.concern && <span style={WE}>{welfareErrors.concern}</span>}
                    </div>
                    <div style={{ display:'flex', gap:'0.65rem', alignItems:'center' }}>
                      <button onClick={submitWelfare} className="td-btn-danger">
                        {welfareSaved ? '✓ Concern Logged' : '🚨 Log Concern'}
                      </button>
                      <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.3)' }}>This will be sent to the Super Admin for review.</span>
                    </div>
                  </div>
                </div>

                <div className="td-card">
                  <div className="td-card-title" style={{ marginBottom:'1rem' }}>Previous Concerns</div>
                  {welfare.length === 0 ? (
                    <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.85rem', textAlign:'center', padding:'1.5rem 0' }}>No concerns logged yet.</div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                      {welfare.map(w => (
                        <div key={w.id} className={`td-welfare-row td-welfare-row--${w.severity}${w.resolved ? ' td-welfare-row--resolved' : ''}`}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.75rem', marginBottom:6 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                              <span className={`td-sev-badge td-sev-badge--${w.severity}`}>{w.severity}</span>
                              <span style={{ fontWeight:700, color:'#fff', fontSize:'0.875rem' }}>{w.childName}</span>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
                              <span style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.3)' }}>{fmtDate(w.date)}</span>
                              {w.resolved
                                ? <span className="td-resolved-badge">✓ Resolved</span>
                                : <button className="td-resolve-btn" onClick={() => resolveFlag(w.id)}>Mark resolved</button>}
                            </div>
                          </div>
                          <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.6)', lineHeight:1.55 }}>{w.concern}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ CLASS REGISTER ════════════════════════════════════════ */}
            {activeTab === 'register' && (
              <div className="td-fade">
                <div className="td-page-header">
                  <div>
                    <div className="td-page-title">Class Register</div>
                    <div className="td-page-sub">Grade 3 · {children.length} children registered</div>
                  </div>
                  <button className="td-btn-primary" onClick={() => { setActiveTab('families'); setShowRegisterFamily(true); }}>+ Register Family</button>
                </div>

                <div className="td-card" style={{ padding:0, overflow:'hidden' }}>
                  <table className="td-reg-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Grade</th>
                        <th>Gender</th>
                        <th>Today</th>
                        <th>Medical</th>
                        <th>Welfare</th>
                        <th>Parent / Guardian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {children.map((child, idx) => {
                        const entry = attendance.find(a => a.childId === child.id);
                        const sc = entry?.status === 'present' ? '#34d399' : entry?.status === 'absent' ? '#f87171' : entry?.status === 'late' ? '#fbbf24' : 'rgba(255,255,255,0.2)';
                        return (
                          <tr key={child.id} className="td-reg-tr">
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                                <div className="td-avatar-xs" style={{ background: avatarColor(child.id, idx) }}>{initials(child.firstName, child.lastName)}</div>
                                <div>
                                  <span style={{ fontWeight:600, color:'#fff', fontSize:'0.875rem' }}>{child.firstName} {child.lastName}</span>
                                  {child.registeredBy === 'teacher' && <div style={{ fontSize:'0.65rem', color:'#60a5fa' }}>by teacher</div>}
                                </div>
                              </div>
                            </td>
                            <td style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.85rem' }}>{child.age}</td>
                            <td style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem' }}>{child.grade}</td>
                            <td>
                              <span style={{ fontSize:'1rem' }}>{child.gender === 'female' ? '👩' : '👦'}</span>
                              <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.5)', marginLeft:4 }}>{child.gender}</span>
                            </td>
                            <td>
                              <span className="td-status-pill" style={{ background:`${sc}20`, color: sc, border:`1px solid ${sc}40` }}>
                                {entry?.status ?? '—'}
                              </span>
                            </td>
                            <td>
                              {(child.hasAllergies || child.hasMedicalCondition)
                                ? <span className="td-tag-warn">{child.hasAllergies ? '⚠ Yes' : '⚕ Yes'}</span>
                                : <span style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.8rem' }}>None</span>}
                            </td>
                            <td>
                              {child.welfareFlags > 0
                                ? <span className="td-tag-danger">🚩 Flagged</span>
                                : <span style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.8rem' }}>None</span>}
                            </td>
                            <td>
                              <div style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.55)', lineHeight:1.4 }}>
                                <div>{child.parentName}</div>
                                <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.72rem' }}>{child.parentPhone}</div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══ REGISTER FAMILY ═══════════════════════════════════════ */}
            {activeTab === 'families' && (
              <div className="td-fade">
                <div className="td-page-header">
                  <div>
                    <div className="td-page-title">Register Family</div>
                    <div className="td-page-sub">Register a child and their guardian on a parent's behalf</div>
                  </div>
                  <button className="td-btn-primary" onClick={() => setShowRegisterFamily(true)}>+ Register New Family</button>
                </div>

                {/* Info banner */}
                <div style={{ padding:'14px 18px', borderRadius:12, background:'rgba(96,165,250,0.07)', border:'1px solid rgba(96,165,250,0.2)', marginBottom:'1.25rem', display:'flex', gap:'0.85rem', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'1.3rem', flexShrink:0 }}>ℹ️</span>
                  <div>
                    <div style={{ fontWeight:700, color:'#60a5fa', fontSize:'0.875rem', marginBottom:4 }}>Teacher-Assisted Registration</div>
                    <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>
                      As a teacher you can register families on behalf of parents who don't have access to a device. The child immediately appears in your class register, attendance list, welfare log, and all other tools. All data is collected in compliance with POPIA.
                    </div>
                  </div>
                </div>

                {/* Teacher-registered children */}
                <div className="td-card">
                  <div className="td-card-title" style={{ marginBottom:'1rem' }}>
                    Families Registered by You ({children.filter(c => c.registeredBy === 'teacher').length})
                  </div>
                  {children.filter(c => c.registeredBy === 'teacher').length === 0 ? (
                    <div style={{ textAlign:'center', padding:'2rem 0', color:'rgba(255,255,255,0.3)', fontSize:'0.88rem' }}>
                      <div style={{ fontSize:'2.5rem', marginBottom:10 }}>👨‍👩‍👧</div>
                      No families registered by you yet.
                      <div style={{ marginTop:'1rem' }}>
                        <button className="td-btn-primary" style={{ width:'auto', padding:'0.6rem 1.5rem' }} onClick={() => setShowRegisterFamily(true)}>
                          Register First Family
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
                      {children.filter(c => c.registeredBy === 'teacher').map((child, idx) => (
                        <div key={child.id} style={{ display:'flex', alignItems:'center', gap:'0.85rem', padding:'0.85rem 1rem', borderRadius:'10px', background:'rgba(96,165,250,0.05)', border:'1px solid rgba(96,165,250,0.15)' }}>
                          <div className="td-avatar-xs" style={{ background: avatarColor(child.id, idx) }}>{initials(child.firstName, child.lastName)}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:600, color:'#fff', fontSize:'0.9rem' }}>{child.firstName} {child.lastName}</div>
                            <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.4)', marginTop:2 }}>
                              {child.grade} · Age {child.age} · Guardian: {child.parentName} · {child.parentPhone}
                            </div>
                          </div>
                          <span style={{ fontSize:'0.68rem', fontWeight:700, color:'#60a5fa', background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.2)', padding:'0.15rem 0.55rem', borderRadius:20 }}>By Teacher</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* All children */}
                <div className="td-card">
                  <div className="td-card-title" style={{ marginBottom:'1rem' }}>All Registered Children ({children.length})</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                    {children.map((child, idx) => (
                      <div key={child.id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.65rem 0.9rem', borderRadius:'9px', background:'rgba(0,0,0,0.15)', border:'1px solid rgba(255,255,255,0.05)' }}>
                        <div className="td-avatar-xs" style={{ background: avatarColor(child.id, idx) }}>{initials(child.firstName, child.lastName)}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:600, color:'#fff', fontSize:'0.875rem' }}>{child.firstName} {child.lastName}</div>
                          <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.38)', marginTop:1 }}>{child.grade} · {child.parentName}</div>
                        </div>
                        <span style={{
                          fontSize:'0.65rem', fontWeight:700, padding:'0.15rem 0.5rem', borderRadius:20,
                          color:       child.registeredBy === 'teacher' ? '#60a5fa' : '#34d399',
                          background:  child.registeredBy === 'teacher' ? 'rgba(96,165,250,0.1)' : 'rgba(52,211,153,0.1)',
                          border:`1px solid ${child.registeredBy === 'teacher' ? 'rgba(96,165,250,0.2)' : 'rgba(52,211,153,0.2)'}`,
                        }}>
                          {child.registeredBy === 'teacher' ? 'Teacher' : 'Parent'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}

// ─── Welfare form style constants (used in welfare tab) ───────────────────────
const WL: React.CSSProperties = { display:'block', fontSize:'0.75rem', fontWeight:600, color:'rgba(255,255,255,0.6)', marginBottom:'0.4rem' };
const WI: React.CSSProperties = { width:'100%', padding:'0.72rem 0.9rem', borderRadius:'9px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:'0.9rem', outline:'none', colorScheme:'dark' as any };
const WE: React.CSSProperties = { fontSize:'0.72rem', color:'#f87171', marginTop:'0.3rem', display:'block' };

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { width: 100%; min-height: 100vh; background: #060f08; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }

@keyframes tdFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
.td-fade { animation: tdFadeUp 0.25s ease; }

.td-root { display:flex; flex-direction:column; width:100vw; min-height:100vh; background:#060f08; color:#fff; overflow-x:hidden; }

/* ── Header ── */
.td-header { width:100%; background:rgba(255,255,255,0.025); border-bottom:1px solid rgba(255,255,255,0.06); padding:0 clamp(16px,3vw,40px); height:64px; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-shrink:0; }
.td-brand  { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.td-brand-badge { width:34px; height:34px; border-radius:9px; background:linear-gradient(135deg,#60a5fa,#2563eb); display:flex; align-items:center; justify-content:center; font-size:1.1rem; }
.td-brand-name  { font-family:'Bebas Neue',sans-serif; font-size:14px; color:#fff; letter-spacing:0.5px; line-height:1.2; }
.td-brand-sub   { font-size:10px; color:rgba(255,255,255,0.38); text-transform:uppercase; letter-spacing:0.6px; }
.td-header-right { display:flex; align-items:center; gap:10px; }
.td-user-chip   { display:flex; align-items:center; gap:8px; padding:5px 12px; background:rgba(255,255,255,0.04); border-radius:8px; border:1px solid rgba(255,255,255,0.07); }
.td-avatar-sm   { width:28px; height:28px; border-radius:50%; background:#60a5fa; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#0a1628; flex-shrink:0; }
.td-user-name   { font-size:12.5px; font-weight:600; color:#fff; line-height:1.2; }
.td-user-role   { font-size:10.5px; color:rgba(255,255,255,0.4); }
.td-signout     { padding:7px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:rgba(255,255,255,0.55); font-size:12.5px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; white-space:nowrap; }
.td-signout:hover { color:#fff; border-color:rgba(255,255,255,0.25); }

/* ── Tabs ── */
.td-tab-nav { width:100%; display:flex; background:rgba(255,255,255,0.015); border-bottom:1px solid rgba(255,255,255,0.06); overflow-x:auto; scrollbar-width:none; flex-shrink:0; padding:0 clamp(16px,3vw,40px); }
.td-tab-nav::-webkit-scrollbar { display:none; }
.td-tab { flex-shrink:0; padding:0 clamp(10px,1.5vw,20px); height:48px; display:flex; align-items:center; background:none; border:none; color:rgba(255,255,255,0.45); font-family:'DM Sans',sans-serif; font-size:0.83rem; font-weight:600; cursor:pointer; transition:all 0.2s; white-space:nowrap; border-bottom:2px solid transparent; }
.td-tab:hover   { color:rgba(255,255,255,0.75); }
.td-tab--active { color:#60a5fa !important; border-bottom-color:#60a5fa; }

/* ── Main ── */
.td-main    { flex:1; width:100%; overflow-y:auto; padding:clamp(16px,2.5vw,36px) clamp(16px,3vw,40px); }
.td-content { width:100%; }

/* ── Hero ── */
.td-hero { width:100%; background:linear-gradient(135deg,#0a1f5c 0%,#04091e 100%); border-radius:16px; padding:clamp(20px,3vw,40px); margin-bottom:1.25rem; border:1px solid rgba(255,255,255,0.07); box-shadow:0 20px 60px rgba(0,0,0,0.45); position:relative; overflow:hidden; }
.td-hero-glow { position:absolute; top:-50px; right:-50px; width:240px; height:240px; border-radius:50%; background:radial-gradient(circle,rgba(96,165,250,0.12) 0%,transparent 70%); pointer-events:none; }
.td-hero-pill { display:inline-flex; align-items:center; gap:7px; padding:5px 13px; border-radius:100px; background:rgba(96,165,250,0.12); border:1px solid rgba(96,165,250,0.3); color:#60a5fa; font-size:11.5px; font-weight:700; font-family:'Bebas Neue',sans-serif; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:16px; }
.td-hero-dot  { width:6px; height:6px; border-radius:50%; background:#60a5fa; display:inline-block; }
.td-hero-h1   { font-family:'Bebas Neue',sans-serif; font-size:clamp(22px,3.5vw,34px); color:#fff; margin:0 0 10px; line-height:1.2; }
.td-blue      { color:#60a5fa; }
.td-hero-p    { color:rgba(184,212,220,0.8); font-size:14px; line-height:1.65; margin:0 0 22px; }
.td-hero-chips { display:flex; flex-wrap:wrap; gap:10px; }
.td-chip   { padding:9px 14px; border-radius:9px; background:rgba(0,0,0,0.28); border:1px solid rgba(255,255,255,0.08); }
.td-chip-l { font-size:10.5px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.4px; margin-bottom:2px; }
.td-chip-v { font-size:13px; font-weight:600; color:#fff; }

/* ── Stats ── */
.td-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0.85rem; margin-bottom:1.25rem; }
.td-stat-card  { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:1rem; text-align:center; }
.td-stat-icon  { font-size:1.5rem; margin-bottom:6px; }
.td-stat-value { font-family:'Bebas Neue',sans-serif; font-size:1.9rem; line-height:1; }
.td-stat-label { font-size:0.68rem; color:rgba(255,255,255,0.4); font-weight:600; margin-top:4px; text-transform:uppercase; letter-spacing:0.5px; }

/* ── Card ── */
.td-card       { background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.065); border-radius:14px; padding:clamp(14px,2vw,24px); margin-bottom:1.25rem; }
.td-card-title { font-family:'Bebas Neue',sans-serif; font-size:1rem; letter-spacing:1.5px; color:#60a5fa; margin-bottom:0; }

/* ── Quick actions ── */
.td-quick-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:0.7rem; margin-top:0.85rem; }
.td-quick-btn  { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:0.9rem 0.4rem; text-align:center; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
.td-quick-btn:hover { background:rgba(96,165,250,0.06); border-color:rgba(96,165,250,0.2); }
.td-quick-btn--urgent { border-color:rgba(251,191,36,0.3); background:rgba(251,191,36,0.05); }
.td-quick-icon  { font-size:1.4rem; margin-bottom:5px; }
.td-quick-label { font-size:0.76rem; font-weight:700; color:#fff; margin-bottom:2px; }
.td-quick-sub   { font-size:0.65rem; color:rgba(255,255,255,0.35); }

/* ── Alert rows ── */
.td-alert-row { display:flex; align-items:flex-start; gap:0.75rem; padding:0.75rem 0.9rem; border-radius:9px; background:rgba(251,191,36,0.05); border:1px solid rgba(251,191,36,0.15); margin-bottom:0.5rem; }
.td-avatar-xs { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:700; color:#fff; flex-shrink:0; }

/* ── Page header ── */
.td-page-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.25rem; }
.td-page-title  { font-family:'Bebas Neue',sans-serif; font-size:1.6rem; color:#fff; letter-spacing:1px; }
.td-page-sub    { color:rgba(255,255,255,0.4); font-size:0.8rem; margin-top:2px; }

/* ── Attendance summary ── */
.td-att-summary { display:flex; gap:0; margin-bottom:1rem; background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.065); border-radius:12px; overflow:hidden; }
.td-att-sum-item { flex:1; padding:0.9rem 0.5rem; text-align:center; border-right:1px solid rgba(255,255,255,0.05); }
.td-att-sum-item:last-child { border-right:none; }

/* ── Attendance table ── */
.td-att-table   { width:100%; border-collapse:collapse; }
.td-att-table th { padding:0.75rem 1rem; text-align:left; font-size:0.68rem; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:0.8px; border-bottom:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.02); }
.td-att-tr      { border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.15s; }
.td-att-tr:last-child { border-bottom:none; }
.td-att-tr:hover { background:rgba(255,255,255,0.02); }
.td-att-tr--present { background:rgba(52,211,153,0.03); }
.td-att-tr--absent  { background:rgba(248,113,113,0.03); }
.td-att-tr--late    { background:rgba(251,191,36,0.03); }
.td-att-table td { padding:0.75rem 1rem; vertical-align:middle; }

/* ── Status buttons ── */
.td-status-btns { display:flex; gap:0.35rem; flex-wrap:wrap; }
.td-status-btn  { padding:0.28rem 0.6rem; border-radius:6px; border:1px solid transparent; font-size:0.71rem; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; text-transform:capitalize; }
.td-status-btn--present { border-color:rgba(52,211,153,0.2);  color:rgba(52,211,153,0.55);  background:transparent; }
.td-status-btn--absent  { border-color:rgba(248,113,113,0.2); color:rgba(248,113,113,0.55); background:transparent; }
.td-status-btn--late    { border-color:rgba(251,191,36,0.2);  color:rgba(251,191,36,0.55);  background:transparent; }
.td-status-btn--present.active { background:rgba(52,211,153,0.15);  color:#34d399;  border-color:#34d399; }
.td-status-btn--absent.active  { background:rgba(248,113,113,0.15); color:#f87171; border-color:#f87171; }
.td-status-btn--late.active    { background:rgba(251,191,36,0.15);  color:#fbbf24;  border-color:#fbbf24; }

/* ── Fed button ── */
.td-fed-btn { padding:0.3rem 0.7rem; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:rgba(255,255,255,0.3); font-size:0.75rem; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; white-space:nowrap; }
.td-fed-btn--active { background:rgba(96,165,250,0.12); border-color:#60a5fa; color:#60a5fa; }

/* ── Buttons ── */
.td-btn-primary { padding:0.65rem 1.25rem; border-radius:8px; border:none; background:linear-gradient(135deg,#60a5fa,#2563eb); color:#fff; font-family:'DM Sans',sans-serif; font-weight:700; font-size:0.875rem; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
.td-btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 18px rgba(96,165,250,0.35); }
.td-btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
.td-btn-danger  { padding:0.65rem 1.25rem; border-radius:8px; background:rgba(248,113,113,0.15); color:#f87171; border:1px solid rgba(248,113,113,0.3); font-family:'DM Sans',sans-serif; font-weight:700; font-size:0.875rem; cursor:pointer; transition:all 0.2s; }
.td-btn-danger:hover { background:rgba(248,113,113,0.25); }

/* ── Welfare rows ── */
.td-welfare-row { padding:0.9rem 1rem; border-radius:10px; border:1px solid transparent; transition:opacity 0.2s; }
.td-welfare-row--low    { background:rgba(251,191,36,0.06);  border-color:rgba(251,191,36,0.18); }
.td-welfare-row--medium { background:rgba(251,146,60,0.06);  border-color:rgba(251,146,60,0.2); }
.td-welfare-row--high   { background:rgba(248,113,113,0.07); border-color:rgba(248,113,113,0.25); }
.td-welfare-row--resolved { opacity:0.45; }

.td-sev-badge         { padding:0.15rem 0.55rem; border-radius:20px; font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.4px; }
.td-sev-badge--low    { background:rgba(251,191,36,0.12);  color:#fbbf24; border:1px solid rgba(251,191,36,0.2); }
.td-sev-badge--medium { background:rgba(251,146,60,0.12);  color:#fb923c; border:1px solid rgba(251,146,60,0.25); }
.td-sev-badge--high   { background:rgba(248,113,113,0.12); color:#f87171; border:1px solid rgba(248,113,113,0.25); }

.td-resolve-btn  { padding:0.2rem 0.65rem; border-radius:6px; border:1px solid rgba(52,211,153,0.25); background:transparent; color:#34d399; font-size:0.72rem; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
.td-resolve-btn:hover { background:rgba(52,211,153,0.1); }
.td-resolved-badge { padding:0.2rem 0.65rem; border-radius:6px; background:rgba(52,211,153,0.1); color:#34d399; font-size:0.72rem; font-weight:700; }

/* ── Register table ── */
.td-reg-table   { width:100%; border-collapse:collapse; }
.td-reg-table th { padding:0.75rem 1rem; text-align:left; font-size:0.68rem; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:0.8px; border-bottom:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.02); white-space:nowrap; }
.td-reg-tr      { border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.15s; }
.td-reg-tr:last-child { border-bottom:none; }
.td-reg-tr:hover { background:rgba(255,255,255,0.02); }
.td-reg-table td { padding:0.75rem 1rem; vertical-align:middle; }

/* ── Tags / pills ── */
.td-status-pill { padding:0.15rem 0.55rem; border-radius:20px; font-size:0.72rem; font-weight:700; text-transform:capitalize; }
.td-tag-warn    { background:rgba(251,191,36,0.1);  color:#fbbf24; border:1px solid rgba(251,191,36,0.2);  padding:0.15rem 0.55rem; border-radius:20px; font-size:0.72rem; font-weight:700; }
.td-tag-danger  { background:rgba(248,113,113,0.1); color:#f87171; border:1px solid rgba(248,113,113,0.2); padding:0.15rem 0.55rem; border-radius:20px; font-size:0.72rem; font-weight:700; }

input::placeholder, textarea::placeholder { color:rgba(255,255,255,0.22); }
input:focus, select:focus, textarea:focus  { border-color:#60a5fa !important; outline:none; box-shadow:0 0 0 3px rgba(96,165,250,0.12); }
select option { background:#04091e; color:#fff; }

@media (max-width:900px)  { .td-stats-grid { grid-template-columns:repeat(2,1fr); } .td-quick-grid { grid-template-columns:repeat(3,1fr); } }
@media (max-width:640px)  { .td-header { height:auto; padding:10px 16px; } .td-user-chip { display:none; } .td-main { padding:14px; } .td-quick-grid { grid-template-columns:repeat(2,1fr); } .td-att-table th:nth-child(3),.td-att-table td:nth-child(3) { display:none; } .td-reg-table th:nth-child(8),.td-reg-table td:nth-child(8) { display:none; } }
@media (max-width:400px)  { .td-signout { display:none; } .td-stats-grid { grid-template-columns:1fr 1fr; } .td-quick-grid { grid-template-columns:1fr 1fr; } }
`;