// src/features/dashboard/SuperAdminDashboard.tsx
import { useState, useMemo } from 'react';
import { userStore } from '../../stores/userStore';

interface Props {
  adminName?: string;
  adminPosition?: string;
  onLogout: () => void;
  onRegisterChild?: () => void;
}

type Tab = 'overview' | 'teachers' | 'parents' | 'families' | 'children' | 'welfare' | 'reports' | 'settings';

interface Child {
  id: string; firstName: string; lastName: string; grade: string;
  school: string; dateOfBirth: string; gender: string; address: string;
  hasAllergies: boolean; allergiesDetails?: string;
  hasMedicalCondition: boolean; medicalDetails?: string;
  contactName: string; contactNumber: string; relationship: string;
  consentActivities: boolean; consentMedical: boolean;
  attendanceRate: number; fedCount: number; totalSessions: number;
  welfareFlags: number; registeredDate: string;
  parentId?: string; parentEmail?: string;
}

interface Parent {
  id: string; name: string; email: string; phone: string;
  children: number; consentComplete: boolean; lastActive: string;
  address?: string; idNumber?: string; relationship?: string;
}

interface WelfareFlag {
  id: string; childName: string; concern: string;
  severity: 'low' | 'medium' | 'high'; date: string; resolved: boolean;
  flaggedBy: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_PARENTS_DATA: Parent[] = [
  { id:'p1', name:'Nomsa Dlamini',  email:'nomsa@demo.church',  phone:'+27821112233', children:2, consentComplete:true,  lastActive:'2026-03-02', address:'14 Jacaranda St, Soweto',    idNumber:'8001015009087', relationship:'Mother'   },
  { id:'p2', name:'James Mokoena', email:'james@church.co.za', phone:'+27712223344', children:1, consentComplete:true,  lastActive:'2026-03-02', address:'8 Protea Ave, Tembisa',      idNumber:'7506145009083', relationship:'Father'   },
  { id:'p3', name:'Grace Sithole', email:'grace@church.co.za', phone:'+27833334455', children:1, consentComplete:true,  lastActive:'2026-02-23', address:'22 Bougainvillea Rd, Sandton',idNumber:'7912200009088', relationship:'Mother'   },
  { id:'p4', name:'Ruth Khumalo',  email:'ruth@church.co.za',  phone:'+27724445566', children:1, consentComplete:false, lastActive:'2026-02-16', address:'5 Ndlovu St, Alex',           idNumber:'',             relationship:'Mother'   },
  { id:'p5', name:'Peter Mahlangu',email:'peter@church.co.za', phone:'+27845556677', children:1, consentComplete:true,  lastActive:'2026-03-02', address:'31 Impala Cres, Midrand',     idNumber:'8503155009082', relationship:'Father'   },
  { id:'p6', name:'Faith Nkosi',   email:'faith@church.co.za', phone:'+27766667788', children:1, consentComplete:true,  lastActive:'2026-01-19', address:'7 Msomi St, Soweto',          idNumber:'',             relationship:'Mother'   },
];

const MOCK_CHILDREN: Child[] = [
  { id:'c1', firstName:'Amara',  lastName:'Dlamini',  grade:'Grade 3', school:'Sunflower Primary', dateOfBirth:'2016-03-14', gender:'Female', address:'14 Jacaranda St, Soweto',      hasAllergies:true,  allergiesDetails:'Peanuts',             hasMedicalCondition:false, contactName:'Nomsa Dlamini',  contactNumber:'+27821112233', relationship:'Mother', consentActivities:true,  consentMedical:true,  attendanceRate:92, fedCount:11, totalSessions:12, welfareFlags:0, registeredDate:'2025-01-12', parentId:'p1', parentEmail:'nomsa@demo.church'  },
  { id:'c2', firstName:'Sipho',  lastName:'Dlamini',  grade:'Grade 5', school:'Sunflower Primary', dateOfBirth:'2014-07-22', gender:'Male',   address:'14 Jacaranda St, Soweto',      hasAllergies:false,                                         hasMedicalCondition:true,  medicalDetails:'Asthma — has inhaler',   contactName:'Nomsa Dlamini',  contactNumber:'+27821112233', relationship:'Mother', consentActivities:true,  consentMedical:true,  attendanceRate:78, fedCount:9,  totalSessions:12, welfareFlags:1, registeredDate:'2025-01-12', parentId:'p1', parentEmail:'nomsa@demo.church'  },
  { id:'c3', firstName:'Lerato', lastName:'Mokoena',  grade:'Grade 4', school:'Protea Primary',    dateOfBirth:'2015-11-08', gender:'Female', address:'8 Protea Ave, Tembisa',        hasAllergies:false,                                         hasMedicalCondition:false,                                          contactName:'James Mokoena', contactNumber:'+27712223344', relationship:'Father', consentActivities:true,  consentMedical:true,  attendanceRate:88, fedCount:10, totalSessions:12, welfareFlags:0, registeredDate:'2025-02-03', parentId:'p2', parentEmail:'james@church.co.za' },
  { id:'c4', firstName:'Thabo',  lastName:'Sithole',  grade:'Grade 6', school:'Sandton Primary',   dateOfBirth:'2013-05-17', gender:'Male',   address:'22 Bougainvillea Rd, Sandton',  hasAllergies:false,                                         hasMedicalCondition:false,                                          contactName:'Grace Sithole', contactNumber:'+27833334455', relationship:'Mother', consentActivities:true,  consentMedical:true,  attendanceRate:95, fedCount:12, totalSessions:12, welfareFlags:0, registeredDate:'2025-01-20', parentId:'p3' },
  { id:'c5', firstName:'Naledi', lastName:'Khumalo',  grade:'Grade 2', school:'Alex Primary',      dateOfBirth:'2017-09-03', gender:'Female', address:'5 Ndlovu St, Alex',            hasAllergies:true,  allergiesDetails:'Dairy, eggs',         hasMedicalCondition:false,                                          contactName:'Ruth Khumalo',  contactNumber:'+27724445566', relationship:'Mother', consentActivities:true,  consentMedical:false, attendanceRate:70, fedCount:8,  totalSessions:12, welfareFlags:2, registeredDate:'2025-03-01', parentId:'p4', parentEmail:'ruth@church.co.za'  },
  { id:'c6', firstName:'Kabelo', lastName:'Mahlangu', grade:'Grade 3', school:'Midrand Primary',   dateOfBirth:'2016-12-01', gender:'Male',   address:'31 Impala Cres, Midrand',      hasAllergies:false,                                         hasMedicalCondition:false,                                          contactName:'Peter Mahlangu',contactNumber:'+27845556677', relationship:'Father', consentActivities:true,  consentMedical:true,  attendanceRate:83, fedCount:10, totalSessions:12, welfareFlags:0, registeredDate:'2025-04-15', parentId:'p5' },
  { id:'c7', firstName:'Zanele', lastName:'Nkosi',    grade:'Grade 1', school:'Soweto Primary',    dateOfBirth:'2018-06-22', gender:'Female', address:'7 Msomi St, Soweto',           hasAllergies:false,                                         hasMedicalCondition:true,  medicalDetails:'Epilepsy — medicated',   contactName:'Faith Nkosi',   contactNumber:'+27766667788', relationship:'Mother', consentActivities:true,  consentMedical:true,  attendanceRate:60, fedCount:7,  totalSessions:12, welfareFlags:3, registeredDate:'2025-05-10', parentId:'p6', parentEmail:'faith@church.co.za' },
];

const MOCK_WELFARE: WelfareFlag[] = [
  { id:'w1', childName:'Sipho Dlamini',  concern:'Child arrived with visible bruising on arm. Parent unavailable for comment.', severity:'high',   date:'2026-02-23', resolved:false, flaggedBy:'Teacher Mokoena' },
  { id:'w2', childName:'Naledi Khumalo', concern:'Child has not eaten at home before arriving. Appearing underweight.',          severity:'medium', date:'2026-03-02', resolved:false, flaggedBy:'Teacher Sithole' },
  { id:'w3', childName:'Naledi Khumalo', concern:'Parent has not signed medical consent. Follow-up required.',                  severity:'low',    date:'2026-02-16', resolved:true,  flaggedBy:'Admin' },
  { id:'w4', childName:'Zanele Nkosi',   concern:'Child missed 3 consecutive Sundays. No communication from parent.',           severity:'medium', date:'2026-01-19', resolved:false, flaggedBy:'Teacher Dlamini' },
  { id:'w5', childName:'Zanele Nkosi',   concern:'Child disclosed feeling unsafe at home during session.',                      severity:'high',   date:'2026-02-09', resolved:false, flaggedBy:'Teacher Dlamini' },
  { id:'w6', childName:'Zanele Nkosi',   concern:'Medication not brought to session — spoke to parent.',                        severity:'low',    date:'2026-03-02', resolved:true,  flaggedBy:'Teacher Mokoena' },
];

const ATTENDANCE_TREND = [
  { week:'Jan 5',  rate:72 }, { week:'Jan 12', rate:78 }, { week:'Jan 19', rate:75 },
  { week:'Jan 26', rate:81 }, { week:'Feb 2',  rate:83 }, { week:'Feb 9',  rate:79 },
  { week:'Feb 16', rate:85 }, { week:'Feb 23', rate:82 }, { week:'Mar 2',  rate:88 },
];

// ─── SA ID Validation ─────────────────────────────────────────────────────────
const validateSAID = (id: string): string | null => {
  const cleaned = id.replace(/\s/g, '');
  if (!cleaned) return null; // optional field — only validate if provided
  if (!/^\d{13}$/.test(cleaned)) return 'SA ID must be exactly 13 digits';
  const mm = parseInt(cleaned.slice(2, 4));
  const dd = parseInt(cleaned.slice(4, 6));
  if (mm < 1 || mm > 12) return 'SA ID contains invalid birth month';
  const yy = parseInt(cleaned.slice(0, 2));
  const daysInMonth = new Date(2000 + yy, mm, 0).getDate();
  if (dd < 1 || dd > daysInMonth) return 'SA ID contains invalid birth day';
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let digit = parseInt(cleaned[i]);
    if (i % 2 === 1) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
  }
  if (sum % 10 !== 0) return 'SA ID number is invalid (failed checksum)';
  return null;
};

// ─── Family Edit Modal ────────────────────────────────────────────────────────
interface FamilyEditModalProps {
  parent: Parent;
  children: Child[];
  mode: 'view' | 'edit' | 'add';
  onClose: () => void;
  onSave: (parent: Parent) => void;
}

function FamilyModal({ parent, children: familyChildren, mode: initialMode, onClose, onSave }: FamilyEditModalProps) {
  const [mode, setMode]             = useState(initialMode);
  const [form, setForm]             = useState<Parent>({ ...parent });
  const [errors, setErrors]         = useState<Partial<Record<keyof Parent, string>>>({});
  const [saved, setSaved]           = useState(false);
  const [notifSent, setNotifSent]   = useState(false);

  const set = (field: keyof Parent, value: string | number | boolean) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const isIncomplete = !parent.idNumber || !parent.consentComplete || !parent.address;

  const validate = () => {
    const e: Partial<Record<keyof Parent, string>> = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^\+27\d{9}$/.test(form.phone.replace(/\s/g,''))) e.phone = 'Must be +27 followed by 9 digits';
    if (form.idNumber) {
      const idErr = validateSAID(form.idNumber);
      if (idErr) e.idNumber = idErr;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaved(true);
    setTimeout(() => { onSave(form); onClose(); }, 700);
  };

  const handleSendNotif = () => {
    setNotifSent(true);
    setTimeout(() => setNotifSent(false), 3000);
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:'#0d3318', border:'1px solid rgba(240,192,0,0.2)', borderRadius:16, width:'100%', maxWidth:680, maxHeight:'90vh', overflowY:'auto' }}>
        {/* Header */}
        <div style={{ padding:'1.25rem 1.75rem', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.3rem', color:'#f0c000', letterSpacing:2 }}>
              {mode === 'add' ? 'ADD FAMILY' : mode === 'edit' ? 'EDIT FAMILY' : 'FAMILY PROFILE'}
            </div>
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', marginTop:2 }}>{form.name}</div>
          </div>
          <div style={{ display:'flex', gap:'0.6rem', alignItems:'center' }}>
            {mode === 'view' && (
              <button onClick={() => setMode('edit')} style={btnSmStyle('#f0c000','rgba(240,192,0,0.1)','rgba(240,192,0,0.25)')}>
                ✎ Edit
              </button>
            )}
            {isIncomplete && mode === 'view' && (
              <button onClick={handleSendNotif}
                style={btnSmStyle('#60a5fa','rgba(96,165,250,0.1)','rgba(96,165,250,0.25)')}>
                {notifSent ? '✓ Sent!' : '📱 Send Reminder'}
              </button>
            )}
            <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'1.3rem', cursor:'pointer' }}>✕</button>
          </div>
        </div>

        {/* Incomplete banner */}
        {isIncomplete && (
          <div style={{ margin:'1rem 1.75rem 0', padding:'0.75rem 1rem', background:'rgba(75,85,99,0.15)', border:'1px solid rgba(75,85,99,0.4)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
              <span style={{ fontSize:'1.1rem' }}>⚠️</span>
              <div>
                <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#9ca3af' }}>Incomplete Family Profile</div>
                <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', marginTop:1 }}>
                  Missing: {[!parent.idNumber && 'ID Number', !parent.consentComplete && 'Consent', !parent.address && 'Address'].filter(Boolean).join(' · ')}
                </div>
              </div>
            </div>
            <button onClick={handleSendNotif}
              style={{ ...btnSmStyle('#60a5fa','rgba(96,165,250,0.1)','rgba(96,165,250,0.25)'), fontSize:'0.75rem' }}>
              {notifSent ? '✓ Notification Sent!' : '📲 Notify Parent'}
            </button>
          </div>
        )}

        <div style={{ padding:'1.5rem 1.75rem' }}>
          {/* ── VIEW MODE ── */}
          {mode === 'view' && (
            <>
              <SectionSep>Parent / Caregiver</SectionSep>
              <div style={modalGrid}>
                <ModalField label="Full Name"     value={form.name} />
                <ModalField label="Email"         value={form.email} />
                <ModalField label="Phone"         value={form.phone} />
                <ModalField label="Relationship"  value={form.relationship || '—'} />
                <ModalField label="ID Number"     value={form.idNumber || <span style={{ color:'#6b7280', fontStyle:'italic' }}>Not provided</span>} />
                <ModalField label="Address"       value={form.address  || <span style={{ color:'#6b7280', fontStyle:'italic' }}>Not provided</span>} />
                <ModalField label="Consent"       value={form.consentComplete ? <span className="pill green">✓ Complete</span> : <span className="pill grey">Incomplete</span>} />
                <ModalField label="Last Active"   value={form.lastActive} />
              </div>

              <SectionSep>Children ({familyChildren.length})</SectionSep>
              {familyChildren.length === 0
                ? <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.28)', padding:'0.75rem 0' }}>No children linked to this parent.</div>
                : familyChildren.map(child => (
                    <div key={child.id} style={{ background:'rgba(0,0,0,0.2)', border:'1px solid rgba(240,192,0,0.08)', borderRadius:9, padding:'0.9rem 1rem', marginBottom:'0.65rem' }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
                        <div>
                          <div style={{ fontWeight:700, color:'#fff', fontSize:'0.95rem' }}>{child.firstName} {child.lastName}</div>
                          <div style={{ fontSize:'0.73rem', color:'rgba(255,255,255,0.4)', marginTop:2 }}>{child.grade} · {child.school} · Age {calcAge(child.dateOfBirth)}</div>
                        </div>
                        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                          {child.hasAllergies && <span className="pill yellow">⚠ Allergy</span>}
                          {child.hasMedicalCondition && <span className="pill yellow">⚕ Medical</span>}
                          {child.welfareFlags > 0 && <span className="pill grey">{child.welfareFlags} flag{child.welfareFlags > 1 ? 's':''}</span>}
                          <span className="pill green">{child.attendanceRate}% att.</span>
                        </div>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem', marginTop:'0.65rem' }}>
                        <ModalField label="DOB"      value={child.dateOfBirth} small />
                        <ModalField label="Gender"   value={child.gender}      small />
                        <ModalField label="Consent"  value={child.consentActivities && child.consentMedical ? '✓ Full' : 'Incomplete'} small />
                        {child.hasAllergies    && <ModalField label="Allergies"  value={child.allergiesDetails!}  small />}
                        {child.hasMedicalCondition && <ModalField label="Medical" value={child.medicalDetails!} small />}
                        <ModalField label="Fed"      value={`${child.fedCount}/${child.totalSessions}`} small />
                      </div>
                    </div>
                  ))
              }
            </>
          )}

          {/* ── EDIT / ADD MODE ── */}
          {(mode === 'edit' || mode === 'add') && (
            <>
              <SectionSep>Parent / Caregiver Details</SectionSep>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.85rem', marginBottom:'1rem' }}>
                <FormField label="Full Name *" error={errors.name}>
                  <input style={inputSt(!!errors.name)} value={form.name} placeholder="e.g. Nomsa Dlamini"
                    onChange={e => set('name', e.target.value)} />
                </FormField>
                <FormField label="Email *" error={errors.email}>
                  <input style={inputSt(!!errors.email)} value={form.email} type="email" placeholder="parent@email.com"
                    onChange={e => set('email', e.target.value)} />
                </FormField>
                <FormField label="Phone * (+27...)" error={errors.phone}>
                  <input style={inputSt(!!errors.phone)} value={form.phone} placeholder="+27821234567" maxLength={12}
                    onChange={e => set('phone', e.target.value.replace(/[^\d+]/g,'').slice(0,12))} />
                </FormField>
                <FormField label="Relationship">
                  <select style={inputSt(false)} value={form.relationship||''} onChange={e => set('relationship', e.target.value)}>
                    <option value="">Select…</option>
                    {['Mother','Father','Grandmother','Grandfather','Aunt','Uncle','Legal Guardian','Other'].map(r=><option key={r}>{r}</option>)}
                  </select>
                </FormField>
                <FormField label="SA ID Number" error={errors.idNumber}>
                  <input style={{ ...inputSt(!!errors.idNumber), fontFamily:'monospace', letterSpacing:'0.5px' }}
                    value={form.idNumber||''} placeholder="13-digit SA ID" maxLength={13}
                    onChange={e => set('idNumber', e.target.value.replace(/\D/g,'').slice(0,13))} />
                </FormField>
                <FormField label="Address">
                  <input style={inputSt(false)} value={form.address||''} placeholder="Street address"
                    onChange={e => set('address', e.target.value)} />
                </FormField>
              </div>
              <div style={{ display:'flex', gap:'0.65rem', marginTop:'0.5rem' }}>
                <button onClick={() => { setMode('view'); setErrors({}); setForm({ ...parent }); }}
                  style={{ padding:'0.72rem 1.25rem', borderRadius:8, border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'rgba(255,255,255,0.5)', fontFamily:"'DM Sans',sans-serif", fontSize:'0.875rem', fontWeight:600, cursor:'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saved}
                  style={{ flex:1, padding:'0.72rem', borderRadius:8, border:'none', background: saved ? '#34d399' : '#f0c000', color:'#071a0d', fontFamily:"'DM Sans',sans-serif", fontSize:'0.875rem', fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
                  {saved ? '✓ Saved!' : mode === 'add' ? 'Add Family' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
const calcAge = (dob: string) => Math.floor((Date.now() - new Date(dob).getTime()) / (1000*60*60*24*365.25));

const btnSmStyle = (color: string, bg: string, border: string): React.CSSProperties => ({
  padding:'0.3rem 0.75rem', borderRadius:6, border:`1px solid ${border}`,
  background:bg, color, fontFamily:"'DM Sans',sans-serif", fontSize:'0.75rem',
  fontWeight:700, cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap',
});

const inputSt = (err: boolean): React.CSSProperties => ({
  width:'100%', background:'rgba(0,0,0,0.3)', border:`1.5px solid ${err?'#6b7280':'rgba(255,255,255,0.12)'}`,
  borderRadius:8, padding:'0.62rem 0.85rem', color:'#fff',
  fontFamily:"'DM Sans',sans-serif", fontSize:'0.875rem', outline:'none',
});

const modalGrid: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' };

function SectionSep({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.85rem', letterSpacing:'1.5px', color:'#f0c000', marginBottom:'0.75rem', paddingBottom:'0.35rem', borderBottom:'1px solid rgba(240,192,0,0.15)', marginTop:'0.25rem' }}>
      {children}
    </div>
  );
}

function ModalField({ label, value, small }: { label: string; value: React.ReactNode; small?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: small ? '0.58rem' : '0.62rem', fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>{label}</div>
      <div style={{ fontSize: small ? '0.78rem' : '0.85rem', color:'#fff' }}>{value}</div>
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'0.35rem' }}>{label}</label>
      {children}
      {error && <span style={{ fontSize:'0.7rem', color:'#9ca3af', marginTop:'0.2rem', display:'block' }}>{error}</span>}
    </div>
  );
}

// ─── Export Modal ─────────────────────────────────────────────────────────────
function ExportModal({ title, onClose }: { title: string; onClose: () => void }) {
  const [selected, setSelected] = useState<'pdf'|'csv'|'excel'|null>(null);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = () => {
    if (!selected) return;
    setExporting(true);
    setTimeout(() => { setExporting(false); setDone(true); setTimeout(onClose, 1000); }, 1200);
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1100, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:'#0d3318', border:'1px solid rgba(240,192,0,0.2)', borderRadius:14, width:'100%', maxWidth:420, padding:'1.75rem' }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.2rem', color:'#f0c000', letterSpacing:2, marginBottom:4 }}>EXPORT REPORT</div>
        <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.4)', marginBottom:'1.25rem' }}>{title}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', marginBottom:'1.25rem' }}>
          {([
            { id:'pdf',   icon:'📄', label:'PDF',   desc:'Formatted for printing and sharing' },
            { id:'csv',   icon:'📊', label:'CSV',   desc:'Raw data for spreadsheet tools' },
            { id:'excel', icon:'📗', label:'Excel', desc:'.xlsx file with full formatting' },
          ] as const).map(opt => (
            <div key={opt.id} onClick={() => setSelected(opt.id)}
              style={{ display:'flex', alignItems:'center', gap:'0.85rem', padding:'0.85rem 1rem', borderRadius:9, cursor:'pointer', border:`1.5px solid ${selected===opt.id?'#f0c000':'rgba(255,255,255,0.08)'}`, background: selected===opt.id?'rgba(240,192,0,0.08)':'rgba(0,0,0,0.15)', transition:'all 0.15s' }}>
              <span style={{ fontSize:'1.3rem' }}>{opt.icon}</span>
              <div>
                <div style={{ fontSize:'0.875rem', fontWeight:700, color: selected===opt.id?'#f0c000':'#fff' }}>{opt.label}</div>
                <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', marginTop:1 }}>{opt.desc}</div>
              </div>
              {selected===opt.id && <span style={{ marginLeft:'auto', color:'#f0c000', fontSize:'1rem' }}>✓</span>}
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:'0.6rem' }}>
          <button onClick={onClose} style={{ padding:'0.7rem 1.25rem', borderRadius:8, border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'rgba(255,255,255,0.5)', fontFamily:"'DM Sans',sans-serif", fontSize:'0.875rem', fontWeight:600, cursor:'pointer' }}>Cancel</button>
          <button onClick={handleExport} disabled={!selected || exporting || done}
            style={{ flex:1, padding:'0.7rem', borderRadius:8, border:'none', background: done?'#34d399':selected?'#f0c000':'rgba(255,255,255,0.1)', color: selected?'#071a0d':'rgba(255,255,255,0.3)', fontFamily:"'DM Sans',sans-serif", fontSize:'0.875rem', fontWeight:700, cursor: selected?'pointer':'not-allowed', transition:'all 0.2s' }}>
            {done ? '✓ Exported!' : exporting ? 'Exporting…' : `Export${selected?' as '+selected.toUpperCase():''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function SuperAdminDashboard({ adminName = 'Admin', adminPosition = 'Super Admin', onLogout, onRegisterChild }: Props) {
  const [activeTab, setActiveTab]         = useState<Tab>('overview');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [welfareList, setWelfareList]     = useState<WelfareFlag[]>(MOCK_WELFARE);
  const [approvingId, setApprovingId]     = useState<string | null>(null);
  const [searchQ, setSearchQ]             = useState('');
  const [gradeFilter, setGradeFilter]     = useState('All');
  const [familyModal, setFamilyModal]     = useState<{ parent: Parent; mode: 'view'|'edit'|'add' } | null>(null);
  const [parents, setParents]             = useState<Parent[]>(MOCK_PARENTS_DATA);
  const [exportModal, setExportModal]     = useState<string | null>(null);
  const [famSearch, setFamSearch]         = useState('');

  const allUsers   = userStore.getAll();
  const teachers   = allUsers.filter(u => u.role === 'teacher');
  const storeParents = allUsers.filter(u => u.role === 'parent');
  const pending    = teachers.filter(u => !(u as any).approved);

  const initials = adminName.split(' ').map((w:string) => w[0]).join('').toUpperCase().slice(0,2);

  const handleApprove = (id: string) => {
    userStore.approveTeacher(id);
    setApprovingId(id);
    setTimeout(() => setApprovingId(null), 1500);
  };

  const resolveWelfare = (id: string) => {
    setWelfareList(prev => prev.map(w => w.id === id ? { ...w, resolved: true } : w));
  };

  const filteredChildren = useMemo(() => MOCK_CHILDREN.filter(c => {
    const matchQ = searchQ === '' || `${c.firstName} ${c.lastName} ${c.grade} ${c.school}`.toLowerCase().includes(searchQ.toLowerCase());
    const matchG = gradeFilter === 'All' || c.grade === gradeFilter;
    return matchQ && matchG;
  }), [searchQ, gradeFilter]);

  const filteredFamilies = useMemo(() => parents.filter(p =>
    famSearch === '' || p.name.toLowerCase().includes(famSearch.toLowerCase()) || p.email.toLowerCase().includes(famSearch.toLowerCase())
  ), [parents, famSearch]);

  const grades = ['All', ...Array.from(new Set(MOCK_CHILDREN.map(c => c.grade))).sort()];
  const openWelfare   = welfareList.filter(w => !w.resolved);
  const highSeverity  = openWelfare.filter(w => w.severity === 'high');
  const avgAttendance = Math.round(MOCK_CHILDREN.reduce((s,c) => s+c.attendanceRate, 0) / MOCK_CHILDREN.length);
  const totalFed      = MOCK_CHILDREN.reduce((s,c) => s+c.fedCount, 0);

  const childrenOf = (parentId: string) => MOCK_CHILDREN.filter(c => c.parentId === parentId);

  const handleSaveFamily = (updated: Parent) => {
    setParents(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleAddFamily = (newParent: Parent) => {
    setParents(prev => [...prev, { ...newParent, id: `p${Date.now()}`, children: 0, consentComplete: false, lastActive: new Date().toISOString().split('T')[0] }]);
  };

  const NAV: { id: Tab; icon: string; label: string; badge?: number }[] = [
    { id:'overview',  icon:'📊', label:'Overview' },
    { id:'teachers',  icon:'🧑‍🏫', label:'Teachers',  badge: pending.length || 0 },
    { id:'parents',   icon:'👨‍👩‍👧', label:'Parents' },
    { id:'families',  icon:'🏠', label:'Families' },
    { id:'children',  icon:'👶', label:'Children' },
    { id:'welfare',   icon:'🛡️', label:'Welfare',   badge: openWelfare.length || 0 },
    { id:'reports',   icon:'📄', label:'Reports' },
    { id:'settings',  icon:'⚙️', label:'Settings' },
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* Child detail modal */}
      {selectedChild && (
        <div className="sad-overlay" onClick={() => setSelectedChild(null)}>
          <div className="sad-modal" onClick={e => e.stopPropagation()}>
            <div className="sad-modal-head">
              <span className="sad-modal-title">{selectedChild.firstName} {selectedChild.lastName}</span>
              <button className="sad-modal-close" onClick={() => setSelectedChild(null)}>✕</button>
            </div>
            <div className="sad-section-sep">Learner Information</div>
            <div className="sad-modal-grid">
              <div className="sad-modal-field"><span className="sad-modal-lbl">Grade</span><span className="sad-modal-val">{selectedChild.grade}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">School</span><span className="sad-modal-val">{selectedChild.school}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Date of Birth</span><span className="sad-modal-val">{selectedChild.dateOfBirth}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Gender</span><span className="sad-modal-val">{selectedChild.gender}</span></div>
              <div className="sad-modal-field" style={{ gridColumn:'1/-1' }}><span className="sad-modal-lbl">Address</span><span className="sad-modal-val">{selectedChild.address}</span></div>
            </div>
            <div className="sad-section-sep">Medical Information</div>
            <div className="sad-modal-grid">
              <div className="sad-modal-field"><span className="sad-modal-lbl">Allergies</span><span className="sad-modal-val">{selectedChild.hasAllergies ? `Yes — ${selectedChild.allergiesDetails}` : 'None'}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Medical Conditions</span><span className="sad-modal-val">{selectedChild.hasMedicalCondition ? `Yes — ${selectedChild.medicalDetails}` : 'None'}</span></div>
            </div>
            <div className="sad-section-sep">Emergency Contact</div>
            <div className="sad-modal-grid">
              <div className="sad-modal-field"><span className="sad-modal-lbl">Name</span><span className="sad-modal-val">{selectedChild.contactName}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Relationship</span><span className="sad-modal-val">{selectedChild.relationship}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Contact Number</span><span className="sad-modal-val">{selectedChild.contactNumber}</span></div>
              {selectedChild.parentEmail && <div className="sad-modal-field"><span className="sad-modal-lbl">Parent Email</span><span className="sad-modal-val">{selectedChild.parentEmail}</span></div>}
            </div>
            <div className="sad-section-sep">Consent & Attendance</div>
            <div className="sad-modal-grid">
              <div className="sad-modal-field"><span className="sad-modal-lbl">Activities Consent</span><span className="sad-modal-val">{selectedChild.consentActivities ? <span className="pill green">✓ Granted</span> : <span className="pill grey">✗ Not given</span>}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Medical Consent</span><span className="sad-modal-val">{selectedChild.consentMedical ? <span className="pill green">✓ Granted</span> : <span className="pill grey">✗ Not given</span>}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Attendance Rate</span><span className="sad-modal-val">{selectedChild.attendanceRate}%</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Fed this term</span><span className="sad-modal-val">{selectedChild.fedCount} / {selectedChild.totalSessions} sessions</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Welfare Flags</span><span className="sad-modal-val">{selectedChild.welfareFlags === 0 ? <span className="pill green">None</span> : <span className="pill grey">{selectedChild.welfareFlags} open</span>}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Registered</span><span className="sad-modal-val">{selectedChild.registeredDate}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Family modal */}
      {familyModal && (
        <FamilyModal
          parent={familyModal.parent}
          children={childrenOf(familyModal.parent.id)}
          mode={familyModal.mode}
          onClose={() => setFamilyModal(null)}
          onSave={familyModal.mode === 'add' ? handleAddFamily : handleSaveFamily}
        />
      )}

      {/* Export modal */}
      {exportModal && (
        <ExportModal title={exportModal} onClose={() => setExportModal(null)} />
      )}

      <div className="sad">
        {/* ── Header + Tab nav ── */}
        <div className="sad-header-wrap">
          <div className="sad-header">
            <div className="sad-logo">
              <div className="sad-logo-badge">SS</div>
              <div>
                <div className="sad-logo-name">Sunday School Portal</div>
                <div className="sad-logo-sub">Management System</div>
              </div>
            </div>
            <div className="sad-header-right">
              <div className="sad-avatar-chip">
                <div className="sad-avatar">{initials}</div>
                <div>
                  <div className="sad-user-name">{adminName}</div>
                  <div className="sad-user-role">{adminPosition}</div>
                </div>
              </div>
              <button className="sad-logout-btn" onClick={onLogout}>Sign Out</button>
            </div>
          </div>

          {/* Tab nav — like screenshot */}
          <nav className="sad-tab-nav">
            {NAV.map(item => (
              <button key={item.id}
                className={`sad-tab${activeTab === item.id ? ' sad-tab--active' : ''}`}
                onClick={() => setActiveTab(item.id)}>
                <span className="sad-tab-icon">{item.icon}</span>
                {item.label}
                {item.badge ? (
                  <span className={`sad-tab-badge${item.id === 'welfare' ? ' grey' : ' gold'}`}>{item.badge}</span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Content ── */}
        <main className="sad-main">
          <div className="sad-topbar">
            <div>
              <div className="sad-page-title">
                {activeTab === 'overview'  && 'Dashboard Overview'}
                {activeTab === 'teachers'  && 'Teacher Management'}
                {activeTab === 'parents'   && 'Parent Accounts'}
                {activeTab === 'families'  && 'Family Management'}
                {activeTab === 'children'  && 'Registered Children'}
                {activeTab === 'welfare'   && 'Welfare & Safeguarding'}
                {activeTab === 'reports'   && 'Reports & Exports'}
                {activeTab === 'settings'  && 'Settings'}
              </div>
              <div className="sad-page-sub">Logged in as {adminName} · {adminPosition}</div>
            </div>
            <div style={{ display:'flex', gap:'0.65rem', flexWrap:'wrap' }}>
              {activeTab === 'overview' && pending.length > 0 && (
                <button className="btn-gold" onClick={() => setActiveTab('teachers')}>
                  ⚠ {pending.length} Pending Approval{pending.length > 1 ? 's' : ''}
                </button>
              )}
              {activeTab === 'families' && (
                <button className="btn-gold" onClick={() => setFamilyModal({
                  parent: { id:'', name:'', email:'', phone:'+27', children:0, consentComplete:false, lastActive:'', address:'', idNumber:'', relationship:'' },
                  mode: 'add'
                })}>+ Add Family</button>
              )}
            </div>
          </div>

          <div className="sad-content">

            {/* ════════════ OVERVIEW ════════════ */}
            {activeTab === 'overview' && (
              <>
                <div className="sad-stats">
                  <div className="sad-stat">
                    <div className="sad-stat-lbl">Registered Children</div>
                    <div className="sad-stat-val">{MOCK_CHILDREN.length}</div>
                    <div className="sad-stat-sub">Across all grades</div>
                  </div>
                  <div className="sad-stat green">
                    <div className="sad-stat-lbl">Avg Attendance</div>
                    <div className="sad-stat-val">{avgAttendance}%</div>
                    <div className="sad-stat-sub">This term</div>
                  </div>
                  <div className={`sad-stat${highSeverity.length > 0 ? ' grey-stat' : ''}`}>
                    <div className="sad-stat-lbl">Open Welfare Flags</div>
                    <div className="sad-stat-val" style={{ color: highSeverity.length > 0 ? '#9ca3af' : '#f0c000' }}>{openWelfare.length}</div>
                    <div className="sad-stat-sub">{highSeverity.length} high severity</div>
                  </div>
                  <div className="sad-stat">
                    <div className="sad-stat-lbl">Feeding Sessions</div>
                    <div className="sad-stat-val">{totalFed}</div>
                    <div className="sad-stat-sub">Meals recorded this term</div>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.25rem' }}>
                  <div className="sad-card" style={{ marginBottom:0 }}>
                    <div className="sad-card-head">
                      <span className="sad-card-title">Pending Approvals</span>
                      {pending.length > 0 && <span className="pill yellow">{pending.length} waiting</span>}
                    </div>
                    {pending.length === 0
                      ? <div className="sad-empty">✓ All teachers approved</div>
                      : <table className="sad-tbl"><thead><tr><th>Name</th><th>Action</th></tr></thead>
                          <tbody>{pending.slice(0,4).map(t => (
                            <tr key={t.id}>
                              <td>{t.name}<br/><span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.3)' }}>{t.email}</span></td>
                              <td><button className="btn-sm btn-approve" onClick={() => handleApprove(t.id)}>{approvingId === t.id ? '✓ Done' : 'Approve'}</button></td>
                            </tr>
                          ))}</tbody>
                        </table>
                    }
                  </div>

                  <div className="sad-card" style={{ marginBottom:0 }}>
                    <div className="sad-card-head">
                      <span className="sad-card-title">High Severity Welfare</span>
                      {highSeverity.length > 0 && <span className="pill grey">{highSeverity.length} urgent</span>}
                    </div>
                    {highSeverity.length === 0
                      ? <div className="sad-empty">✓ No urgent welfare flags</div>
                      : <table className="sad-tbl"><thead><tr><th>Child</th><th>Date</th><th>Action</th></tr></thead>
                          <tbody>{highSeverity.map(w => (
                            <tr key={w.id}>
                              <td>{w.childName}<br/><span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.3)', whiteSpace:'normal' }}>{w.concern.slice(0,50)}…</span></td>
                              <td style={{ whiteSpace:'nowrap' }}>{w.date}</td>
                              <td><button className="btn-sm btn-resolve" onClick={() => resolveWelfare(w.id)}>Resolve</button></td>
                            </tr>
                          ))}</tbody>
                        </table>
                    }
                  </div>
                </div>

                <div className="sad-card">
                  <div className="sad-card-head">
                    <span className="sad-card-title">Attendance Trend (This Term)</span>
                    <span style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.3)' }}>Weekly average %</span>
                  </div>
                  <div className="sad-card-body" style={{ paddingTop:'0.75rem', paddingBottom:'0.875rem' }}>
                    <div style={{ position:'relative', height:70 }}>
                      {[100,75,50,25].map(g => (
                        <div key={g} style={{ position:'absolute', top:`${100-g}%`, left:0, right:0, borderTop:'1px dashed rgba(255,255,255,0.06)', display:'flex', alignItems:'center' }}>
                          <span style={{ fontSize:'0.55rem', color:'rgba(255,255,255,0.2)', marginRight:'0.4rem', lineHeight:1 }}>{g}%</span>
                        </div>
                      ))}
                      <div style={{ display:'flex', alignItems:'flex-end', gap:'0.5rem', height:'100%', paddingLeft:'1.8rem' }}>
                        {ATTENDANCE_TREND.map(w => (
                          <div key={w.week} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, height:'100%', justifyContent:'flex-end', gap:3 }}>
                            <span style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.5)' }}>{w.rate}%</span>
                            <div title={`${w.week}: ${w.rate}%`} style={{ width:'100%', borderRadius:'3px 3px 0 0', height:`${(w.rate/100)*52}px`, background: w.rate >= 85 ? 'rgba(52,211,153,0.7)' : w.rate >= 75 ? 'rgba(240,192,0,0.7)' : 'rgba(107,114,128,0.7)', transition:'background 0.2s', cursor:'default' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'0.5rem', paddingLeft:'1.8rem', marginTop:'0.4rem' }}>
                      {ATTENDANCE_TREND.map(w => (
                        <div key={w.week} style={{ flex:1, textAlign:'center', fontSize:'0.58rem', color:'rgba(255,255,255,0.3)' }}>{w.week}</div>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:'1rem', marginTop:'0.65rem', justifyContent:'flex-end' }}>
                      {[['rgba(52,211,153,0.7)','≥85% Good'],['rgba(240,192,0,0.7)','≥75% Fair'],['rgba(107,114,128,0.7)','<75% Low']].map(([c,l]) => (
                        <div key={l as string} style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}>
                          <div style={{ width:10, height:10, borderRadius:2, background:c as string }} />
                          <span style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.3)' }}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ════════════ TEACHERS ════════════ */}
            {activeTab === 'teachers' && (() => {
              const MOCK_TEACHERS = [
                { id:'t1', name:'Nomvula Dlamini', email:'nomvula@church.co.za', phone:'0821112233', approved:true,  grades:'Grade 1, Grade 2', sessions:12, flags:1 },
                { id:'t2', name:'James Mokoena',   email:'james@church.co.za',   phone:'0712223344', approved:true,  grades:'Grade 3, Grade 4', sessions:12, flags:0 },
                { id:'t3', name:'Grace Sithole',   email:'grace@church.co.za',   phone:'0833334455', approved:true,  grades:'Grade 5, Grade 6', sessions:11, flags:0 },
                { id:'t4', name:'Peter Mahlangu',  email:'peter@church.co.za',   phone:'0845556677', approved:false, grades:'Grade R',           sessions:0,  flags:0 },
                { id:'t5', name:'Ruth Khumalo',    email:'ruth@church.co.za',    phone:'0724445566', approved:false, grades:'Grade 7',           sessions:0,  flags:0 },
              ];
              const allT = [...MOCK_TEACHERS, ...teachers.map(t => ({ id:t.id, name:t.name, email:t.email, phone:(t as any).phone||'—', approved:!!(t as any).approved, grades:'—', sessions:0, flags:0 }))];
              const approvedT = allT.filter(t => t.approved);
              const pendingT  = allT.filter(t => !t.approved);
              return (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.875rem', marginBottom:'1.25rem' }}>
                    <div className="sad-stat"><div className="sad-stat-lbl">Total Teachers</div><div className="sad-stat-val">{allT.length}</div><div className="sad-stat-sub">Registered volunteers</div></div>
                    <div className="sad-stat green"><div className="sad-stat-lbl">Approved</div><div className="sad-stat-val">{approvedT.length}</div><div className="sad-stat-sub">Active this term</div></div>
                    <div className="sad-stat"><div className="sad-stat-lbl">Pending</div><div className="sad-stat-val" style={{ color:'#fbbf24' }}>{pendingT.length}</div><div className="sad-stat-sub">Awaiting approval</div></div>
                  </div>
                  <div className="sad-card">
                    <div className="sad-card-head"><span className="sad-card-title">All Teachers ({allT.length})</span></div>
                    <table className="sad-tbl">
                      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Grades</th><th>Sessions</th><th>Flags</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {allT.map(t => (
                          <tr key={t.id}>
                            <td style={{ fontWeight:600 }}>{t.name}</td>
                            <td>{t.email}</td>
                            <td>{t.phone}</td>
                            <td style={{ fontSize:'0.75rem' }}>{t.grades}</td>
                            <td>{t.sessions}</td>
                            <td>{t.flags > 0 ? <span className="pill yellow">{t.flags}</span> : <span style={{ color:'rgba(255,255,255,0.3)' }}>0</span>}</td>
                            <td>{t.approved ? <span className="pill green">✓ Approved</span> : <span className="pill yellow">⏳ Pending</span>}</td>
                            <td>{!t.approved && <button className="btn-sm btn-approve" onClick={() => handleApprove(t.id)}>{approvingId === t.id ? '✓ Done!' : 'Approve'}</button>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}

            {/* ════════════ PARENTS ════════════ */}
            {activeTab === 'parents' && (() => {
              const allP = [...parents, ...storeParents.map(p => ({ id:p.id, name:p.name, email:p.email, phone:(p as any).phone||'—', children:0, consentComplete:true, lastActive:'—', address:'', idNumber:'', relationship:'' }))];
              return (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.875rem', marginBottom:'1.25rem' }}>
                    <div className="sad-stat"><div className="sad-stat-lbl">Total Parents</div><div className="sad-stat-val">{allP.length}</div><div className="sad-stat-sub">Registered caregivers</div></div>
                    <div className="sad-stat green"><div className="sad-stat-lbl">Consent Complete</div><div className="sad-stat-val">{allP.filter(p=>p.consentComplete).length}</div><div className="sad-stat-sub">Both consents signed</div></div>
                    <div className="sad-stat"><div className="sad-stat-lbl">Consent Incomplete</div><div className="sad-stat-val" style={{ color:'#9ca3af' }}>{allP.filter(p=>!p.consentComplete).length}</div><div className="sad-stat-sub">Follow-up needed</div></div>
                  </div>
                  <div className="sad-card">
                    <div className="sad-card-head"><span className="sad-card-title">All Parents & Caregivers ({allP.length})</span></div>
                    <table className="sad-tbl">
                      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Children</th><th>Consent</th><th>Last Active</th></tr></thead>
                      <tbody>
                        {allP.map(p => (
                          <tr key={p.id}>
                            <td style={{ fontWeight:600 }}>{p.name}</td>
                            <td>{p.email}</td>
                            <td>{p.phone}</td>
                            <td>{p.children}</td>
                            <td>{p.consentComplete ? <span className="pill green">✓ Complete</span> : <span className="pill grey">Incomplete</span>}</td>
                            <td style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.78rem' }}>{p.lastActive}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}

            {/* ════════════ FAMILIES ════════════ */}
            {activeTab === 'families' && (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.875rem', marginBottom:'1.25rem' }}>
                  <div className="sad-stat"><div className="sad-stat-lbl">Total Families</div><div className="sad-stat-val">{parents.length}</div><div className="sad-stat-sub">Registered</div></div>
                  <div className="sad-stat green"><div className="sad-stat-lbl">Complete Profiles</div><div className="sad-stat-val">{parents.filter(p=>p.consentComplete && p.idNumber && p.address).length}</div><div className="sad-stat-sub">All info provided</div></div>
                  <div className="sad-stat"><div className="sad-stat-lbl">Incomplete</div><div className="sad-stat-val" style={{ color:'#9ca3af' }}>{parents.filter(p=>!p.consentComplete||!p.idNumber||!p.address).length}</div><div className="sad-stat-sub">Missing info</div></div>
                  <div className="sad-stat"><div className="sad-stat-lbl">Total Children</div><div className="sad-stat-val">{MOCK_CHILDREN.length}</div><div className="sad-stat-sub">Across all families</div></div>
                </div>

                {/* Incomplete families alert */}
                {parents.filter(p=>!p.consentComplete||!p.idNumber||!p.address).length > 0 && (
                  <div style={{ padding:'0.875rem 1.1rem', background:'rgba(75,85,99,0.1)', border:'1px solid rgba(75,85,99,0.3)', borderRadius:10, marginBottom:'1.1rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
                      <span style={{ fontSize:'1.2rem' }}>⚠️</span>
                      <div>
                        <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#9ca3af' }}>{parents.filter(p=>!p.consentComplete||!p.idNumber||!p.address).length} families have incomplete profiles</div>
                        <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', marginTop:1 }}>Missing ID numbers, consent or address information</div>
                      </div>
                    </div>
                    <button style={btnSmStyle('#60a5fa','rgba(96,165,250,0.1)','rgba(96,165,250,0.25)')}>
                      📲 Send All Reminders
                    </button>
                  </div>
                )}

                <div className="sad-toolbar">
                  <input className="sad-search" placeholder="Search families by name or email…" value={famSearch} onChange={e => setFamSearch(e.target.value)} />
                </div>

                <div className="sad-card">
                  <div className="sad-card-head">
                    <span className="sad-card-title">All Families ({filteredFamilies.length})</span>
                    <span style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.3)' }}>Click a row to view full family profile</span>
                  </div>
                  <table className="sad-tbl">
                    <thead>
                      <tr><th>Parent / Caregiver</th><th>Phone</th><th>ID Number</th><th>Children</th><th>Profile</th><th>Consent</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {filteredFamilies.map(p => {
                        const fc = childrenOf(p.id);
                        const incomplete = !p.idNumber || !p.consentComplete || !p.address;
                        return (
                          <tr key={p.id} style={{ cursor:'pointer' }} onClick={() => setFamilyModal({ parent: p, mode: 'view' })}>
                            <td>
                              <div style={{ fontWeight:600, color:'#fff' }}>{p.name}</div>
                              <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', marginTop:1 }}>{p.email}</div>
                            </td>
                            <td>{p.phone}</td>
                            <td>
                              {p.idNumber
                                ? <span style={{ fontFamily:'monospace', fontSize:'0.78rem', color:'rgba(255,255,255,0.6)' }}>{p.idNumber.slice(0,6)}*******</span>
                                : <span style={{ color:'#6b7280', fontSize:'0.75rem', fontStyle:'italic' }}>Not provided</span>
                              }
                            </td>
                            <td>
                              <div style={{ display:'flex', gap:'0.3rem', flexWrap:'wrap' }}>
                                {fc.length === 0
                                  ? <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.78rem' }}>None</span>
                                  : fc.map(c => <span key={c.id} className="pill blue">{c.firstName}</span>)
                                }
                              </div>
                            </td>
                            <td>
                              {incomplete
                                ? <span className="pill grey">⚠ Incomplete</span>
                                : <span className="pill green">✓ Complete</span>
                              }
                            </td>
                            <td>
                              {p.consentComplete
                                ? <span className="pill green">✓ Signed</span>
                                : <span className="pill grey">Pending</span>
                              }
                            </td>
                            <td onClick={e => e.stopPropagation()}>
                              <div style={{ display:'flex', gap:'0.4rem' }}>
                                <button className="btn-sm btn-view" onClick={() => setFamilyModal({ parent: p, mode: 'view' })}>View</button>
                                <button className="btn-sm btn-approve" onClick={() => setFamilyModal({ parent: p, mode: 'edit' })}>Edit</button>
                                {incomplete && (
                                  <button className="btn-sm btn-resolve" title="Send SMS/contact reminder" onClick={() => setFamilyModal({ parent: p, mode: 'view' })}>
                                    📲
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ════════════ CHILDREN ════════════ */}
            {activeTab === 'children' && (
              <>
                <div className="sad-toolbar">
                  <input className="sad-search" placeholder="Search by name, grade or school…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                  <select className="sad-select" value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
                    {grades.map(g => <option key={g}>{g}</option>)}
                  </select>
                  {onRegisterChild && <button className="btn-gold" onClick={onRegisterChild}>+ Register Child</button>}
                </div>
                <div className="sad-card">
                  <div className="sad-card-head">
                    <span className="sad-card-title">Children ({filteredChildren.length})</span>
                    <span style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.3)' }}>Click a row to view full profile</span>
                  </div>
                  {filteredChildren.length === 0
                    ? <div className="sad-empty">No children match your search.</div>
                    : <table className="sad-tbl">
                        <thead><tr><th>Name</th><th>Grade</th><th>School</th><th>Attendance</th><th>Fed</th><th>Consent</th><th>Welfare</th><th></th></tr></thead>
                        <tbody>
                          {filteredChildren.map(c => (
                            <tr key={c.id} style={{ cursor:'pointer' }} onClick={() => setSelectedChild(c)}>
                              <td style={{ fontWeight:600 }}>{c.firstName} {c.lastName}</td>
                              <td>{c.grade}</td>
                              <td>{c.school}</td>
                              <td>
                                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                                  <div className="att-bar-bg"><div className="att-bar-fill" style={{ width:`${c.attendanceRate}%`, background: c.attendanceRate >= 85 ? '#34d399' : c.attendanceRate >= 70 ? '#fbbf24' : '#6b7280' }} /></div>
                                  <span style={{ fontSize:'0.72rem' }}>{c.attendanceRate}%</span>
                                </div>
                              </td>
                              <td>{c.fedCount}/{c.totalSessions}</td>
                              <td>{c.consentActivities && c.consentMedical ? <span className="pill green">✓ Full</span> : <span className="pill grey">Incomplete</span>}</td>
                              <td>{c.welfareFlags === 0 ? <span className="pill green">None</span> : <span className="pill grey">{c.welfareFlags} flags</span>}</td>
                              <td><button className="btn-sm btn-view" onClick={e => { e.stopPropagation(); setSelectedChild(c); }}>View</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                  }
                </div>
              </>
            )}

            {/* ════════════ WELFARE ════════════ */}
            {activeTab === 'welfare' && (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.875rem', marginBottom:'1.25rem' }}>
                  <div className="sad-stat grey-stat"><div className="sad-stat-lbl">High Severity</div><div className="sad-stat-val" style={{ color:'#9ca3af' }}>{welfareList.filter(w=>!w.resolved&&w.severity==='high').length}</div></div>
                  <div className="sad-stat"><div className="sad-stat-lbl">Medium Severity</div><div className="sad-stat-val" style={{ color:'#fbbf24' }}>{welfareList.filter(w=>!w.resolved&&w.severity==='medium').length}</div></div>
                  <div className="sad-stat green"><div className="sad-stat-lbl">Resolved</div><div className="sad-stat-val">{welfareList.filter(w=>w.resolved).length}</div></div>
                </div>
                <div className="sad-card">
                  <div className="sad-card-head"><span className="sad-card-title">Open Welfare Flags ({openWelfare.length})</span></div>
                  {openWelfare.length === 0
                    ? <div className="sad-empty">✓ No open welfare concerns</div>
                    : <table className="sad-tbl">
                        <thead><tr><th>Child</th><th>Concern</th><th>Severity</th><th>Date</th><th>Flagged By</th><th>Action</th></tr></thead>
                        <tbody>
                          {openWelfare.map(w => (
                            <tr key={w.id}>
                              <td style={{ fontWeight:600, whiteSpace:'nowrap' }}>{w.childName}</td>
                              <td style={{ maxWidth:260, whiteSpace:'normal', lineHeight:1.4 }}>{w.concern}</td>
                              <td><span className={`pill ${w.severity==='high'?'grey':w.severity==='medium'?'yellow':'blue'}`}>{w.severity}</span></td>
                              <td style={{ whiteSpace:'nowrap' }}>{w.date}</td>
                              <td style={{ whiteSpace:'nowrap' }}>{w.flaggedBy}</td>
                              <td><button className="btn-sm btn-resolve" onClick={() => resolveWelfare(w.id)}>Mark Resolved</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                  }
                </div>
                <div className="sad-card">
                  <div className="sad-card-head"><span className="sad-card-title">Resolved Cases</span></div>
                  {welfareList.filter(w=>w.resolved).length === 0
                    ? <div className="sad-empty">No resolved cases yet.</div>
                    : <table className="sad-tbl">
                        <thead><tr><th>Child</th><th>Concern</th><th>Severity</th><th>Date</th></tr></thead>
                        <tbody>
                          {welfareList.filter(w=>w.resolved).map(w => (
                            <tr key={w.id}>
                              <td style={{ fontWeight:600 }}>{w.childName}</td>
                              <td style={{ maxWidth:260, whiteSpace:'normal', lineHeight:1.4, color:'rgba(255,255,255,0.4)' }}>{w.concern}</td>
                              <td><span className={`pill ${w.severity==='high'?'grey':w.severity==='medium'?'yellow':'blue'}`}>{w.severity}</span></td>
                              <td>{w.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                  }
                </div>
              </>
            )}

            {/* ════════════ REPORTS ════════════ */}
            {activeTab === 'reports' && (
              <>
                <div className="sad-card" style={{ marginBottom:'1.25rem' }}>
                  <div className="sad-card-head"><span className="sad-card-title">Term Summary</span></div>
                  <div className="sad-card-body">
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
                      {[
                        { label:'Total Children',    value:MOCK_CHILDREN.length },
                        { label:'Avg Attendance',    value:`${avgAttendance}%` },
                        { label:'Total Meals Served',value:totalFed },
                        { label:'Welfare Cases',     value:welfareList.length },
                      ].map(s => (
                        <div key={s.label} style={{ background:'rgba(0,0,0,0.2)', borderRadius:9, padding:'0.875rem', border:'1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'0.35rem' }}>{s.label}</div>
                          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.6rem', color:'#f0c000' }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="report-grid">
                  {[
                    { title:'Attendance Report',          desc:'Weekly attendance per child and per grade. Identifies chronic absentees for pastoral follow-up.',      icon:'📊' },
                    { title:'Feeding Scheme Report',       desc:'Number of children fed per session and cumulative totals. For donor reporting and planning.',          icon:'🍽️' },
                    { title:'Welfare Report',              desc:'All flagged welfare concerns with severity, status and resolution notes. POPIA-compliant.',            icon:'🛡️' },
                    { title:'Child Registration Summary',  desc:'Complete list of registered learners with consent status, medical alerts and contact details.',        icon:'👶' },
                    { title:'Teacher Activity Report',     desc:'Attendance marking frequency, welfare flags raised, and session participation per teacher.',           icon:'🧑‍🏫' },
                    { title:'Impact Report (Donor)',        desc:'High-level summary for donors — children served, meals provided, welfare interventions.',              icon:'📄' },
                  ].map(r => (
                    <div key={r.title} className="report-card">
                      <div style={{ fontSize:'1.6rem' }}>{r.icon}</div>
                      <div className="report-card-title">{r.title}</div>
                      <div className="report-card-desc">{r.desc}</div>
                      {/* Export format buttons */}
                      <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem', flexWrap:'wrap' }}>
                        {(['PDF','CSV','Excel'] as const).map(fmt => (
                          <button key={fmt} onClick={() => setExportModal(`${r.title} — ${fmt}`)}
                            style={{ flex:1, padding:'0.45rem 0.25rem', borderRadius:6, border:'1px solid rgba(240,192,0,0.25)', background:'rgba(240,192,0,0.07)', color:'#f0c000', fontFamily:"'DM Sans',sans-serif", fontSize:'0.72rem', fontWeight:700, cursor:'pointer', transition:'all 0.15s', textAlign:'center' }}
                            onMouseEnter={e => { (e.target as HTMLElement).style.background='rgba(240,192,0,0.15)'; }}
                            onMouseLeave={e => { (e.target as HTMLElement).style.background='rgba(240,192,0,0.07)'; }}>
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ════════════ SETTINGS ════════════ */}
            {activeTab === 'settings' && (
              <div className="sad-card">
                <div className="sad-card-head"><span className="sad-card-title">Account & System Settings</span></div>
                <div className="sad-card-body">
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem', background:'rgba(240,192,0,0.05)', borderRadius:10, border:'1px solid rgba(240,192,0,0.12)', marginBottom:'1.25rem' }}>
                    <div className="sad-avatar" style={{ width:52, height:52, fontSize:'1.1rem', borderRadius:12 }}>{initials}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'1rem', color:'#fff' }}>{adminName}</div>
                      <div style={{ fontSize:'0.78rem', color:'#f0c000', marginTop:2 }}>{adminPosition}</div>
                    </div>
                    <div style={{ marginLeft:'auto' }}><span className="pill green">⚡ Full Access</span></div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.25rem' }}>
                    {[
                      { label:'Portal Version', value:'v1.0.0' },
                      { label:'Compliance',     value:'POPIA Compliant' },
                      { label:'Data Storage',   value:'In-memory (session)' },
                      { label:'Session',        value:'Active' },
                    ].map(s => (
                      <div key={s.label} style={{ background:'rgba(0,0,0,0.2)', borderRadius:8, padding:'0.875rem', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'0.25rem' }}>{s.label}</div>
                        <div style={{ fontSize:'0.875rem', color:'#fff', fontWeight:600 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <button style={{ padding:'0.6rem 1.5rem', borderRadius:6, border:'1px solid rgba(255,255,255,0.1)', background:'none', color:'rgba(255,255,255,0.4)', fontFamily:"'DM Sans',sans-serif", fontSize:'0.78rem', fontWeight:600, cursor:'pointer' }} onClick={onLogout}>
                    Sign Out of Portal
                  </button>
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
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
html,body,#root { width:100%; min-height:100vh; background:#071a0d; }

.sad { display:flex; flex-direction:column; min-height:100vh; font-family:'DM Sans',sans-serif; background:#071a0d; color:#fff; }

/* ── Header + Tab nav wrapper ── */
.sad-header-wrap { width:100%; background:#081e0b; border-bottom:1px solid rgba(240,192,0,0.12); flex-shrink:0; }

/* ── Header bar ── */
.sad-header { display:flex; align-items:center; justify-content:space-between; padding:0 clamp(16px,3vw,40px); height:64px; gap:1rem; }
.sad-logo { display:flex; align-items:center; gap:0.6rem; }
.sad-logo-badge { width:34px; height:34px; background:#f0c000; border-radius:7px; display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:0.85rem; color:#071a0d; flex-shrink:0; }
.sad-logo-name { font-family:'Bebas Neue',sans-serif; font-size:0.9rem; letter-spacing:1px; color:#f0c000; line-height:1.2; }
.sad-logo-sub { font-size:0.58rem; color:rgba(255,255,255,0.28); }
.sad-header-right { display:flex; align-items:center; gap:0.75rem; }
.sad-avatar-chip { display:flex; align-items:center; gap:0.6rem; padding:5px 12px; background:rgba(240,192,0,0.06); border:1px solid rgba(240,192,0,0.15); border-radius:8px; }
.sad-avatar { width:32px; height:32px; border-radius:50%; background:rgba(240,192,0,0.12); border:1.5px solid rgba(240,192,0,0.3); display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:700; color:#f0c000; flex-shrink:0; }
.sad-user-name { font-size:12.5px; font-weight:600; color:#fff; line-height:1.2; }
.sad-user-role { font-size:10.5px; color:rgba(255,255,255,0.4); }
.sad-logout-btn { padding:7px 14px; border-radius:8px; border:1px solid rgba(240,192,0,0.2); background:transparent; color:rgba(255,255,255,0.55); font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:500; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
.sad-logout-btn:hover { color:#f0c000; border-color:rgba(240,192,0,0.5); }

/* ── Tab nav ── */
.sad-tab-nav { display:flex; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; padding:0 clamp(16px,3vw,40px); border-top:1px solid rgba(255,255,255,0.04); }
.sad-tab-nav::-webkit-scrollbar { display:none; }
.sad-tab { flex-shrink:0; display:flex; align-items:center; gap:0.4rem; height:48px; padding:0 clamp(10px,1.5vw,20px); background:none; border:none; border-bottom:2px solid transparent; color:rgba(255,255,255,0.42); font-family:'DM Sans',sans-serif; font-size:0.82rem; font-weight:600; cursor:pointer; transition:all 0.18s; white-space:nowrap; position:relative; }
.sad-tab:hover { color:rgba(255,255,255,0.75); }
.sad-tab--active { color:#f0c000 !important; border-bottom-color:#f0c000; }
.sad-tab-icon { font-size:0.9rem; }
.sad-tab-badge { display:inline-flex; align-items:center; justify-content:center; min-width:16px; height:16px; border-radius:8px; font-size:0.58rem; font-weight:800; padding:0 4px; }
.sad-tab-badge.gold { background:#f0c000; color:#071a0d; }
.sad-tab-badge.grey { background:#4b5563; color:#fff; }

/* ── Main content ── */
.sad-main { flex:1; display:flex; flex-direction:column; min-width:0; }
.sad-topbar { padding:1rem clamp(16px,3vw,40px); border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:space-between; background:rgba(0,0,0,0.1); flex-wrap:wrap; gap:0.75rem; }
.sad-page-title { font-family:'Bebas Neue',sans-serif; font-size:1.4rem; letter-spacing:2px; color:#f0c000; }
.sad-page-sub { font-size:0.7rem; color:rgba(255,255,255,0.3); margin-top:1px; }
.sad-content { flex:1; padding:1.75rem clamp(16px,3vw,40px); overflow-y:auto; }

/* ── Stats ── */
.sad-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:0.875rem; margin-bottom:1.75rem; }
.sad-stat { background:#0a2410; border:1px solid rgba(240,192,0,0.1); border-radius:11px; padding:1.1rem 1.25rem; }
.sad-stat-lbl { font-size:0.63rem; font-weight:700; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:0.4rem; }
.sad-stat-val { font-family:'Bebas Neue',sans-serif; font-size:2rem; color:#f0c000; line-height:1; }
.sad-stat-sub { font-size:0.68rem; color:rgba(255,255,255,0.3); margin-top:0.2rem; }
.sad-stat.green .sad-stat-val { color:#34d399; }
.sad-stat.grey-stat .sad-stat-val { color:#9ca3af; }

/* ── Card ── */
.sad-card { background:#0a2410; border:1px solid rgba(240,192,0,0.1); border-radius:11px; margin-bottom:1.25rem; overflow:hidden; }
.sad-card-head { padding:0.875rem 1.25rem; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; }
.sad-card-title { font-family:'Bebas Neue',sans-serif; font-size:0.95rem; letter-spacing:1.5px; color:#f0c000; }
.sad-card-body { padding:1.25rem; }

/* ── Table ── */
.sad-tbl { width:100%; border-collapse:collapse; }
.sad-tbl th { font-size:0.6rem; font-weight:700; color:rgba(255,255,255,0.28); text-transform:uppercase; letter-spacing:0.6px; padding:0 0.875rem 0.65rem; text-align:left; white-space:nowrap; }
.sad-tbl td { padding:0.75rem 0.875rem; border-top:1px solid rgba(255,255,255,0.04); font-size:0.82rem; color:rgba(255,255,255,0.72); }
.sad-tbl tr:hover td { background:rgba(240,192,0,0.025); }

/* ── Pills ── */
.pill { display:inline-flex; align-items:center; gap:0.3rem; padding:0.18rem 0.6rem; border-radius:20px; font-size:0.65rem; font-weight:700; white-space:nowrap; }
.pill.green  { background:rgba(52,211,153,0.1);  color:#34d399; border:1px solid rgba(52,211,153,0.2); }
.pill.yellow { background:rgba(251,191,36,0.1);  color:#fbbf24; border:1px solid rgba(251,191,36,0.2); }
.pill.grey   { background:rgba(75,85,99,0.2);    color:#9ca3af; border:1px solid rgba(75,85,99,0.35); }
.pill.blue   { background:rgba(96,165,250,0.1);  color:#60a5fa; border:1px solid rgba(96,165,250,0.2); }

/* ── Buttons ── */
.btn-gold { background:#f0c000; color:#071a0d; border:none; padding:0.55rem 1.1rem; border-radius:7px; font-family:'DM Sans',sans-serif; font-size:0.8rem; font-weight:700; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
.btn-gold:hover { background:#ffd200; transform:translateY(-1px); }
.btn-sm { padding:0.3rem 0.75rem; border-radius:5px; border:none; font-family:'DM Sans',sans-serif; font-size:0.72rem; font-weight:700; cursor:pointer; transition:all 0.15s; }
.btn-approve { background:rgba(52,211,153,0.1); color:#34d399; border:1px solid rgba(52,211,153,0.22); }
.btn-approve:hover { background:rgba(52,211,153,0.2); }
.btn-resolve { background:rgba(96,165,250,0.1); color:#60a5fa; border:1px solid rgba(96,165,250,0.22); }
.btn-resolve:hover { background:rgba(96,165,250,0.2); }
.btn-view { background:rgba(240,192,0,0.08); color:#f0c000; border:1px solid rgba(240,192,0,0.2); }
.btn-view:hover { background:rgba(240,192,0,0.15); }

/* ── Toolbar ── */
.sad-toolbar { display:flex; gap:0.75rem; margin-bottom:1.1rem; flex-wrap:wrap; }
.sad-search { flex:1; min-width:180px; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:0.55rem 0.85rem; color:#fff; font-family:'DM Sans',sans-serif; font-size:0.82rem; outline:none; }
.sad-search:focus { border-color:#f0c000; }
.sad-search::placeholder { color:rgba(255,255,255,0.2); }
.sad-select { background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:0.55rem 0.85rem; color:#fff; font-family:'DM Sans',sans-serif; font-size:0.82rem; outline:none; cursor:pointer; }
.sad-select:focus { border-color:#f0c000; }
.sad-select option { background:#0a2410; }

/* ── Attendance bar ── */
.att-bar-bg { height:6px; border-radius:3px; background:rgba(255,255,255,0.07); overflow:hidden; width:80px; }
.att-bar-fill { height:100%; border-radius:3px; }

/* ── Child modal ── */
.sad-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1rem; }
.sad-modal { background:#0d3318; border:1px solid rgba(240,192,0,0.2); border-radius:14px; width:100%; max-width:600px; max-height:90vh; overflow-y:auto; padding:1.75rem; }
.sad-modal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem; }
.sad-modal-title { font-family:'Bebas Neue',sans-serif; font-size:1.3rem; letter-spacing:2px; color:#f0c000; }
.sad-modal-close { background:none; border:none; color:rgba(255,255,255,0.35); font-size:1.3rem; cursor:pointer; padding:0; }
.sad-modal-close:hover { color:#9ca3af; }
.sad-modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.875rem; margin-bottom:1rem; }
.sad-modal-field { display:flex; flex-direction:column; gap:0.25rem; }
.sad-modal-lbl { font-size:0.62rem; font-weight:700; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.5px; }
.sad-modal-val { font-size:0.85rem; color:#fff; }
.sad-section-sep { font-family:'Bebas Neue',sans-serif; font-size:0.8rem; letter-spacing:1.5px; color:#f0c000; margin:1rem 0 0.75rem; padding-bottom:0.35rem; border-bottom:1px solid rgba(240,192,0,0.15); }

/* ── Empty ── */
.sad-empty { text-align:center; padding:2.5rem 1rem; color:rgba(255,255,255,0.22); font-size:0.82rem; }

/* ── Report grid ── */
.report-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
.report-card { background:rgba(0,0,0,0.2); border:1px solid rgba(240,192,0,0.12); border-radius:10px; padding:1.25rem; display:flex; flex-direction:column; gap:0.5rem; }
.report-card-title { font-family:'Bebas Neue',sans-serif; font-size:0.9rem; letter-spacing:1.2px; color:#f0c000; }
.report-card-desc { font-size:0.75rem; color:rgba(255,255,255,0.4); line-height:1.5; }

/* ── Inputs in modals ── */
input, select { color-scheme:dark; }
input:focus, select:focus { outline:none; }
input::placeholder { color:rgba(255,255,255,0.2); }

/* ── Responsive ── */
@media (max-width:960px) { .sad-stats { grid-template-columns:1fr 1fr; } .report-grid { grid-template-columns:1fr 1fr; } }
@media (max-width:720px) { .sad-tab { font-size:0.75rem; padding:0 8px; } }
@media (max-width:600px) { .sad-stats { grid-template-columns:1fr; } .sad-modal-grid { grid-template-columns:1fr; } .report-grid { grid-template-columns:1fr; } .sad-content { padding:1rem; } .sad-avatar-chip { display:none; } }
`;