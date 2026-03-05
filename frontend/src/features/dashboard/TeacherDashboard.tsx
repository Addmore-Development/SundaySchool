// src/features/dashboard/TeacherDashboard.tsx
// Updated: centered layout, inline attendance dropdowns, register override popup,
// fed filter, SA ID/phone format, report synced to attendance tab, green palette
// v2: updated color palette + localStorage profile loading

import { useState, useMemo, useRef, useEffect } from 'react';

interface MockUser { name: string; email: string; phone: string; role: string; idNumber?: string; church?: string; gradesSelected?: string[]; }
interface TeacherDashboardProps { user?: MockUser; onLogout?: () => void; onRegisterFamily?: () => void; }

interface Child {
  id: string; firstName: string; lastName: string; grade: string;
  dateOfBirth: string; age: number; gender: 'male' | 'female' | 'other';
  hasAllergies: boolean; allergiesDetails?: string;
  hasMedicalCondition: boolean; medicalDetails?: string;
  parentName: string; parentPhone: string; parentEmail: string;
  idNumber?: string;
  parentIdNumber?: string;
  employmentStatus?: string;
  attendanceRate: number; welfareFlags: number;
  registeredBy: 'parent' | 'teacher';
  guardianRelationship?: string; address?: string; emergencyContact?: string;
  notes?: string; registeredDate?: string;
}

interface AttendanceEntry { childId: string; status: 'present' | 'absent' | 'late' | null; fed: boolean; overrideDate?: string; }
interface DailyAttendanceRecord { date: string; entries: AttendanceEntry[]; saved: boolean; }
interface WelfareFlag { id: string; childId: string; childName: string; concern: string; severity: 'low' | 'medium' | 'high'; date: string; resolved: boolean; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtDateLong = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const todayStr = () => new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const todayISO = () => new Date().toISOString().split('T')[0];
const initials = (f: string, l: string) => `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase();
const getSundaysInRange = (startISO: string, endISO: string): string[] => {
  const result: string[] = [];
  const d = new Date(startISO + 'T00:00:00');
  const end = new Date(endISO + 'T00:00:00');
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
  while (d <= end) { result.push(d.toISOString().split('T')[0]); d.setDate(d.getDate() + 7); }
  return result;
};

// SA validation helpers
const validateSAID = (val: string) => /^\d{13}$/.test(val);
const validateSAPhone = (val: string) => /^\+27\d{9}$/.test(val.replace(/\s/g, ''));

const AVATAR_PALETTE = ['#2d6a4f','#1e6091','#6d3e91','#a05c34','#1a6b6b','#8b3a3a','#4a6741','#1a5276','#6e2f8a'];
const PRESET_COLORS: Record<string, string> = { k1:'#2d6a4f', k2:'#1e6091', k3:'#6d3e91', k4:'#a05c34', k5:'#1a6b6b', k6:'#8b3a3a', k7:'#4a6741' };
const avatarColor = (id: string, idx: number) => PRESET_COLORS[id] ?? AVATAR_PALETTE[idx % AVATAR_PALETTE.length];

const INITIAL_CHILDREN: Child[] = [
  { id:'k1', firstName:'Amara',  lastName:'Dlamini',  grade:'Grade 3', dateOfBirth:'2016-03-14', age:7,  gender:'female', hasAllergies:true,  allergiesDetails:'Peanuts',     hasMedicalCondition:false, parentName:'Nomsa Dlamini',  parentPhone:'+27821112233', parentEmail:'nomsa@demo.church',  idNumber:'0603140123456', parentIdNumber:'8801015009087', employmentStatus:'Employed (Full-time)', attendanceRate:92, welfareFlags:0, registeredBy:'parent', guardianRelationship:'Mother', address:'14 Jacaranda St, Soweto', emergencyContact:'+27829991111', notes:'Loves singing in praise team', registeredDate:'2025-01-12' },
  { id:'k2', firstName:'Sipho',  lastName:'Dlamini',  grade:'Grade 3', dateOfBirth:'2014-07-22', age:9,  gender:'male',   hasAllergies:false,                                  hasMedicalCondition:true,  medicalDetails:'Asthma',   parentName:'Nomsa Dlamini',  parentPhone:'+27821112233', parentEmail:'nomsa@demo.church',  idNumber:'0607220123456', parentIdNumber:'8801015009087', employmentStatus:'Employed (Full-time)', attendanceRate:78, welfareFlags:1, registeredBy:'parent', guardianRelationship:'Mother', address:'14 Jacaranda St, Soweto', emergencyContact:'+27829991111', notes:'Has inhaler — kept in bag', registeredDate:'2025-01-12' },
  { id:'k3', firstName:'Lerato', lastName:'Mokoena',  grade:'Grade 3', dateOfBirth:'2015-11-08', age:8,  gender:'female', hasAllergies:false,                                  hasMedicalCondition:false,                             parentName:'James Mokoena',  parentPhone:'+27712223344', parentEmail:'james@church.co.za',  idNumber:'0511080123456', parentIdNumber:'7903125009081', employmentStatus:'Self-employed', attendanceRate:88, welfareFlags:0, registeredBy:'parent', guardianRelationship:'Father', address:'8 Protea Ave, Tembisa', emergencyContact:'+27718882222', registeredDate:'2025-02-03' },
  { id:'k4', firstName:'Thabo',  lastName:'Sithole',  grade:'Grade 3', dateOfBirth:'2013-05-17', age:10, gender:'male',   hasAllergies:false,                                  hasMedicalCondition:false,                             parentName:'Grace Sithole',  parentPhone:'+27833334455', parentEmail:'grace@church.co.za',  idNumber:'0305170123456', parentIdNumber:'8504230009083', employmentStatus:'Employed (Full-time)', attendanceRate:95, welfareFlags:0, registeredBy:'parent', guardianRelationship:'Mother', address:'22 Bougainvillea Rd, Sandton', emergencyContact:'+27837773333', registeredDate:'2025-01-20' },
  { id:'k5', firstName:'Naledi', lastName:'Khumalo',  grade:'Grade 3', dateOfBirth:'2015-09-03', age:8,  gender:'female', hasAllergies:true,  allergiesDetails:'Dairy, eggs', hasMedicalCondition:false,                             parentName:'Ruth Khumalo',   parentPhone:'+27724445566', parentEmail:'ruth@church.co.za',   idNumber:'0509030123456', parentIdNumber:'9002145009086', employmentStatus:'Unemployed', attendanceRate:70, welfareFlags:0, registeredBy:'parent', guardianRelationship:'Mother', address:'5 Ndlovu St, Alex', emergencyContact:'+27726664444', registeredDate:'2025-03-01' },
  { id:'k6', firstName:'Kabelo', lastName:'Mahlangu', grade:'Grade 3', dateOfBirth:'2014-12-01', age:9,  gender:'male',   hasAllergies:false,                                  hasMedicalCondition:false,                             parentName:'Peter Mahlangu', parentPhone:'+27845556677', parentEmail:'peter@church.co.za',  idNumber:'0412010123456', parentIdNumber:'7706085009082', employmentStatus:'Employed (Part-time)', attendanceRate:83, welfareFlags:0, registeredBy:'teacher', guardianRelationship:'Father', address:'31 Impala Cres, Midrand', emergencyContact:'+27845555555', notes:'Registered by teacher on parent\'s behalf', registeredDate:'2025-04-15' },
  { id:'k7', firstName:'Zintle', lastName:'Mthembu',  grade:'Grade 3', dateOfBirth:'2016-01-25', age:7,  gender:'female', hasAllergies:false,                                  hasMedicalCondition:false,                             parentName:'Faith Mthembu',  parentPhone:'+27736667788', parentEmail:'faith@church.co.za',  idNumber:'0601250123456', parentIdNumber:'5509155009089', employmentStatus:'Pensioner', attendanceRate:60, welfareFlags:2, registeredBy:'teacher', guardianRelationship:'Grandmother', address:'77 Thabo Nkosi Rd, Katlehong', emergencyContact:'+27734446666', notes:'Grandmother is primary caregiver', registeredDate:'2025-04-20' },
];

const INITIAL_WELFARE: WelfareFlag[] = [
  { id:'w1', childId:'k2', childName:'Sipho Dlamini',  concern:'Child appeared withdrawn and had visible bruising on left arm.', severity:'high',   date:'2026-03-01', resolved:false },
  { id:'w2', childId:'k7', childName:'Zintle Mthembu', concern:'Child mentioned not eating at home. Appears underweight.',         severity:'medium', date:'2026-02-23', resolved:false },
  { id:'w3', childId:'k7', childName:'Zintle Mthembu', concern:'Arrived in dirty clothing for second week in a row.',               severity:'low',    date:'2026-02-16', resolved:true  },
];

const MOCK_HISTORICAL: DailyAttendanceRecord[] = [
  { date:'2026-02-02', saved:true, entries:[ {childId:'k1',status:'present',fed:true},{childId:'k2',status:'present',fed:true},{childId:'k3',status:'present',fed:true},{childId:'k4',status:'present',fed:true},{childId:'k5',status:'absent',fed:false},{childId:'k6',status:'present',fed:true},{childId:'k7',status:'absent',fed:false} ] },
  { date:'2026-02-09', saved:true, entries:[ {childId:'k1',status:'present',fed:true},{childId:'k2',status:'late',fed:true},{childId:'k3',status:'present',fed:true},{childId:'k4',status:'present',fed:true},{childId:'k5',status:'present',fed:true},{childId:'k6',status:'absent',fed:false},{childId:'k7',status:'absent',fed:false} ] },
  { date:'2026-02-16', saved:true, entries:[ {childId:'k1',status:'present',fed:true},{childId:'k2',status:'absent',fed:false},{childId:'k3',status:'present',fed:true},{childId:'k4',status:'present',fed:true},{childId:'k5',status:'present',fed:true},{childId:'k6',status:'present',fed:true},{childId:'k7',status:'late',fed:true} ] },
  { date:'2026-02-23', saved:true, entries:[ {childId:'k1',status:'present',fed:true},{childId:'k2',status:'present',fed:true},{childId:'k3',status:'absent',fed:false},{childId:'k4',status:'present',fed:true},{childId:'k5',status:'absent',fed:false},{childId:'k6',status:'present',fed:true},{childId:'k7',status:'absent',fed:false} ] },
];

// ─── Style constants ──────────────────────────────────────────────────────────
const FL: React.CSSProperties = { display:'block', fontSize:'0.75rem', fontWeight:600, color:'rgba(255,255,255,0.6)', marginBottom:'0.4rem', letterSpacing:'0.2px' };
const FI: React.CSSProperties = { width:'100%', padding:'0.72rem 0.9rem', borderRadius:'9px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:'0.9rem', outline:'none', colorScheme:'dark' as any };
const WL: React.CSSProperties = { display:'block', fontSize:'0.75rem', fontWeight:600, color:'rgba(255,255,255,0.6)', marginBottom:'0.4rem' };
const WI: React.CSSProperties = { width:'100%', padding:'0.72rem 0.9rem', borderRadius:'9px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:'0.9rem', outline:'none', colorScheme:'dark' as any };
const WE: React.CSSProperties = { fontSize:'0.72rem', color:'#f87171', marginTop:'0.3rem', display:'block' };

// ─── SVG Pie Chart ────────────────────────────────────────────────────────────
function PieChart({ data, size = 160 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>No data</div>;
  const cx = size / 2, cy = size / 2, r = size / 2 - 8;
  let startAngle = -Math.PI / 2;
  const slices = data.filter(d => d.value > 0).map(d => {
    const angle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    startAngle += angle;
    const x2 = cx + r * Math.cos(startAngle), y2 = cy + r * Math.sin(startAngle);
    const large = angle > Math.PI ? 1 : 0;
    return { ...d, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, angle };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r + 7} fill="rgba(255,255,255,0.02)" />
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} stroke="#0a2410" strokeWidth="2" opacity={0.9} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.52} fill="#0a2410" />
      <text x={cx} y={cy - 5} textAnchor="middle" fill="#fff" fontSize="18" fontFamily="'Bebas Neue',sans-serif">{total}</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="'DM Sans',sans-serif">TOTAL</text>
    </svg>
  );
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ stats }: { stats: { date: string; pct: number; present: number; absent: number; late: number }[] }) {
  if (stats.length === 0) return <div style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', padding:'2rem', fontSize:'0.85rem' }}>No saved attendance records in this range.</div>;
  const maxVal = 100;
  const chartH = 160, barW = Math.min(40, Math.floor(560 / stats.length) - 8);
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={Math.max(560, stats.length * (barW + 10) + 50)} height={chartH + 60} style={{ display: 'block' }}>
        {[0,25,50,75,100].map(p => (
          <g key={p}>
            <line x1={40} y1={chartH - (p / maxVal) * chartH} x2="100%" y2={chartH - (p / maxVal) * chartH} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={35} y={chartH - (p / maxVal) * chartH + 4} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="'DM Sans',sans-serif">{p}%</text>
          </g>
        ))}
        {stats.map((s, i) => {
          const x = 45 + i * (barW + 10);
          const barH = Math.max((s.pct / 100) * chartH, 3);
          const color = s.pct >= 80 ? '#34d399' : s.pct >= 60 ? '#f0c000' : '#e05252';
          const label = new Date(s.date + 'T00:00:00').toLocaleDateString('en-ZA', { day:'numeric', month:'short' });
          return (
            <g key={s.date}>
              <rect x={x} y={chartH - barH} width={barW} height={barH} rx={4} fill={`${color}99`} />
              <rect x={x} y={chartH - barH} width={barW} height={6} rx={4} fill={color} />
              <text x={x + barW / 2} y={chartH - barH - 5} textAnchor="middle" fill={color} fontSize="9" fontFamily="'DM Sans',sans-serif" fontWeight="700">{s.pct}%</text>
              <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="'DM Sans',sans-serif">{label}</text>
            </g>
          );
        })}
        <line x1={40} y1={0} x2={40} y2={chartH} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1={40} y1={chartH} x2="100%" y2={chartH} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </svg>
    </div>
  );
}

// ─── Register Override Popup (Class Register tab only) ────────────────────────
function RegisterOverridePopup({ child, idx, attendanceHistory, savedSundays, onClose, onOverride }: {
  child: Child; idx: number;
  attendanceHistory: DailyAttendanceRecord[];
  savedSundays: string[];
  onClose: () => void;
  onOverride: (childId: string, date: string, status: 'present' | 'absent' | 'late') => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const color = avatarColor(child.id, idx);
  const [overrideDate, setOverrideDate] = useState(todayISO());
  const [overrideStatus, setOverrideStatus] = useState<'present'|'absent'|'late'>('present');
  const [overrideSaved, setOverrideSaved] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const attended = savedSundays.filter(date => {
    const rec = attendanceHistory.find(r => r.date === date);
    const entry = rec?.entries.find(e => e.childId === child.id);
    return entry?.status === 'present' || entry?.status === 'late';
  }).length;
  const pct = savedSundays.length ? Math.round((attended / savedSundays.length) * 100) : 0;
  const pctColor = pct >= 80 ? '#34d399' : pct >= 60 ? '#f0c000' : '#e05252';

  const recentDates = [...savedSundays].reverse().slice(0, 8);

  const handleOverride = () => {
    onOverride(child.id, overrideDate, overrideStatus);
    setOverrideSaved(true);
    setTimeout(() => setOverrideSaved(false), 2000);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div ref={ref} style={{ width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', background:'linear-gradient(145deg,#0d3318,#0a2410)', border:'1px solid rgba(240,192,0,0.2)', borderRadius:20, boxShadow:'0 40px 80px rgba(0,0,0,0.7)', scrollbarWidth:'thin' }}>
        <div style={{ background:`linear-gradient(135deg,${color}40,${color}15)`, borderRadius:'20px 20px 0 0', padding:'1.5rem', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'relative' }}>
          <button onClick={onClose} style={{ position:'absolute', top:'1rem', right:'1rem', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.6)', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" }}>✕</button>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', fontWeight:700, color:'#fff', border:`3px solid ${color}80`, boxShadow:`0 0 20px ${color}40`, flexShrink:0 }}>{initials(child.firstName, child.lastName)}</div>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.5rem', color:'#fff', letterSpacing:'1px' }}>{child.firstName} {child.lastName}</div>
              <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.5)', marginTop:2 }}>{child.grade} · Age {child.age} · {child.gender}</div>
              <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem', flexWrap:'wrap' }}>
                {child.registeredBy === 'teacher' && <span style={{ fontSize:'0.65rem', fontWeight:700, color:'#f0c000', background:'rgba(240,192,0,0.1)', border:'1px solid rgba(240,192,0,0.2)', padding:'0.15rem 0.5rem', borderRadius:20 }}>Registered by Teacher</span>}
                {child.hasAllergies && <span style={{ fontSize:'0.65rem', fontWeight:700, color:'#f0c000', background:'rgba(240,192,0,0.1)', border:'1px solid rgba(240,192,0,0.2)', padding:'0.15rem 0.5rem', borderRadius:20 }}>⚠ Allergy</span>}
                {child.hasMedicalCondition && <span style={{ fontSize:'0.65rem', fontWeight:700, color:'#e05252', background:'rgba(224,82,82,0.1)', border:'1px solid rgba(224,82,82,0.2)', padding:'0.15rem 0.5rem', borderRadius:20 }}>⚕ Medical</span>}
                {child.welfareFlags > 0 && <span style={{ fontSize:'0.65rem', fontWeight:700, color:'#e05252', background:'rgba(224,82,82,0.1)', border:'1px solid rgba(224,82,82,0.2)', padding:'0.15rem 0.5rem', borderRadius:20 }}>🚩 Welfare Flagged</span>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            {[
              { l:'Attendance', v:`${pct}%`, c:pctColor },
              { l:'Sessions', v:`${attended}/${savedSundays.length}`, c:'#f0c000' },
              { l:'Welfare Flags', v:child.welfareFlags, c: child.welfareFlags > 0 ? '#e05252' : 'rgba(255,255,255,0.3)' },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ flex:1, textAlign:'center', padding:'0.75rem', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize:'1.3rem', fontFamily:"'Bebas Neue',sans-serif", color: c as string }}>{v}</div>
                <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.5px', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.065)', borderRadius:12, padding:'0.9rem' }}>
            <div style={{ fontSize:'0.68rem', fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'0.65rem' }}>Recent Sessions</div>
            <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
              {recentDates.length === 0
                ? <span style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.25)' }}>No recorded sessions</span>
                : recentDates.map(date => {
                    const rec = attendanceHistory.find(r => r.date === date);
                    const entry = rec?.entries.find(e => e.childId === child.id);
                    const s = entry?.status;
                    const c = s === 'present' ? '#34d399' : s === 'absent' ? '#e05252' : s === 'late' ? '#f0c000' : 'rgba(255,255,255,0.2)';
                    const icon = s === 'present' ? '✓' : s === 'absent' ? '✗' : s === 'late' ? '~' : '—';
                    return (
                      <div key={date} title={`${fmtDate(date)}: ${s ?? 'no record'}`} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                        <div style={{ width:28, height:28, borderRadius:6, background:`${c}20`, border:`1.5px solid ${c}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:700, color:c }}>
                          {entry?.overrideDate ? '↑' : icon}
                        </div>
                        <div style={{ fontSize:'0.55rem', color:'rgba(255,255,255,0.25)' }}>{new Date(date+'T00:00:00').toLocaleDateString('en-ZA',{day:'numeric',month:'short'})}</div>
                      </div>
                    );
                  })}
            </div>
          </div>

          <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.065)', borderRadius:12, padding:'0.9rem' }}>
            <div style={{ fontSize:'0.68rem', fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'0.65rem' }}>Guardian Info</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
              {[
                { l:'Name', v: child.parentName },
                { l:'Relationship', v: child.guardianRelationship ?? '—' },
                { l:'Phone', v: child.parentPhone },
                { l:'Email', v: child.parentEmail },
                { l:'Address', v: child.address ?? '—' },
                { l:'Emergency', v: child.emergencyContact ?? '—' },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.3)', marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:'0.8rem', color:'#fff', fontWeight:500 }}>{v}</div>
                </div>
              ))}
            </div>
            {child.idNumber && (
              <div style={{ marginTop:'0.6rem', paddingTop:'0.6rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.3)', marginBottom:2 }}>SA ID Number</div>
                <div style={{ fontSize:'0.8rem', color:'#fff', fontWeight:500, fontFamily:'monospace', letterSpacing:'1px' }}>{child.idNumber}</div>
              </div>
            )}
          </div>

          {(child.hasAllergies || child.hasMedicalCondition || child.notes) && (
            <div style={{ background:'rgba(240,192,0,0.05)', border:'1px solid rgba(240,192,0,0.15)', borderRadius:12, padding:'0.9rem' }}>
              <div style={{ fontSize:'0.68rem', fontWeight:700, color:'#f0c000', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'0.6rem' }}>⚠ Health & Notes</div>
              {child.hasAllergies && <div style={{ fontSize:'0.8rem', color:'#f0c000', marginBottom:4 }}>Allergy: {child.allergiesDetails}</div>}
              {child.hasMedicalCondition && <div style={{ fontSize:'0.8rem', color:'#e05252', marginBottom:4 }}>Medical: {child.medicalDetails}</div>}
              {child.notes && <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.5)', fontStyle:'italic' }}>{child.notes}</div>}
            </div>
          )}

          <div style={{ background:'rgba(52,211,153,0.05)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:12, padding:'0.9rem' }}>
            <div style={{ fontSize:'0.68rem', fontWeight:700, color:'#34d399', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'0.75rem' }}>🔓 Override Attendance</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem', marginBottom:'0.75rem' }}>
              <div>
                <label style={{ ...WL, color:'rgba(255,255,255,0.5)', fontSize:'0.7rem' }}>Date</label>
                <input type="date" style={{ ...WI, fontSize:'0.85rem', padding:'0.6rem 0.75rem' }} value={overrideDate} onChange={e => setOverrideDate(e.target.value)} max={todayISO()} />
              </div>
              <div>
                <label style={{ ...WL, color:'rgba(255,255,255,0.5)', fontSize:'0.7rem' }}>Status</label>
                <select style={{ ...WI, fontSize:'0.85rem', padding:'0.6rem 0.75rem' }} value={overrideStatus} onChange={e => setOverrideStatus(e.target.value as any)}>
                  <option value="present">✓ Present</option>
                  <option value="absent">✗ Absent</option>
                  <option value="late">~ Late</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleOverride}
              style={{
                width: '100%', padding: '0.65rem', borderRadius: 8,
                background: overrideSaved ? 'rgba(52,211,153,0.2)' : 'linear-gradient(135deg,#34d399,#1fa370)',
                color: overrideSaved ? '#34d399' : '#fff',
                fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: '0.875rem',
                cursor: 'pointer', transition: 'all 0.2s',
                border: overrideSaved ? '1px solid rgba(52,211,153,0.3)' : '1px solid transparent',
              }}
            >
              {overrideSaved ? '✓ Override Applied' : '↑ Apply Override'}
            </button>
            <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.25)', marginTop:'0.5rem', lineHeight:1.5 }}>
              Overrides update locked records and are included in all report calculations.
            </div>
          </div>

          <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.25)', textAlign:'center' }}>
            Registered {child.registeredDate ? fmtDate(child.registeredDate) : '—'} · {child.registeredBy === 'teacher' ? 'Added by teacher' : 'Self-registered by parent'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Family Profile Card ──────────────────────────────────────────────────────
function FamilyProfileCard({ family, children, idx, onClose }: {
  family: { parentName: string; parentPhone: string; parentEmail: string; registeredBy: 'parent'|'teacher'; address?: string; emergencyContact?: string; parentIdNumber?: string; employmentStatus?: string; guardianRelationship?: string; children: Child[] };
  children: Child[]; idx: number; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div ref={ref} style={{ width:'100%', maxWidth:540, background:'linear-gradient(145deg,#0d3318,#0a2410)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:20, boxShadow:'0 40px 80px rgba(0,0,0,0.7)', overflow:'hidden', maxHeight:'90vh', overflowY:'auto', scrollbarWidth:'thin' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,rgba(52,211,153,0.2),rgba(52,211,153,0.05))', padding:'1.5rem', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'relative' }}>
          <button onClick={onClose} style={{ position:'absolute', top:'1rem', right:'1rem', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.6)', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:'1rem', fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:58, height:58, borderRadius:'50%', background:'linear-gradient(135deg,#34d399,#1fa370)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0, boxShadow:'0 0 20px rgba(52,211,153,0.3)' }}>👨‍👩‍👧</div>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.5rem', color:'#fff', letterSpacing:'1px' }}>{family.parentName}</div>
              <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.45)', marginTop:2 }}>
                {family.guardianRelationship ?? 'Guardian'} · {family.children.length} child{family.children.length !== 1 ? 'ren' : ''} registered
              </div>
              <div style={{ display:'flex', gap:'0.4rem', marginTop:'0.45rem', flexWrap:'wrap' }}>
                <span style={{ display:'inline-block', fontSize:'0.65rem', fontWeight:700, padding:'0.15rem 0.5rem', borderRadius:20, color: family.registeredBy === 'teacher' ? '#f0c000' : '#34d399', background: family.registeredBy === 'teacher' ? 'rgba(240,192,0,0.1)' : 'rgba(52,211,153,0.1)', border:`1px solid ${family.registeredBy === 'teacher' ? 'rgba(240,192,0,0.2)' : 'rgba(52,211,153,0.2)'}` }}>
                  {family.registeredBy === 'teacher' ? 'Teacher-registered' : 'Parent-registered'}
                </span>
                {family.employmentStatus && (
                  <span style={{ display:'inline-block', fontSize:'0.65rem', fontWeight:700, padding:'0.15rem 0.5rem', borderRadius:20, color:'#8bc4e8', background:'rgba(139,196,232,0.1)', border:'1px solid rgba(139,196,232,0.2)' }}>
                    💼 {family.employmentStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>

          {/* Guardian / Parent Details */}
          <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.065)', borderRadius:12, padding:'1rem' }}>
            <div style={{ fontSize:'0.68rem', fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'0.75rem' }}>👤 Guardian Details</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem' }}>
              {[
                { l:'Full Name',        v: family.parentName },
                { l:'Relationship',     v: family.guardianRelationship ?? '—' },
                { l:'📞 Phone',         v: family.parentPhone },
                { l:'✉️ Email',         v: family.parentEmail },
                { l:'🏠 Address',       v: family.address ?? 'Not provided' },
                { l:'🆘 Emergency',     v: family.emergencyContact ?? 'Not provided' },
                { l:'💼 Employment',    v: family.employmentStatus ?? 'Not provided' },
                { l:'🪪 SA ID',         v: family.parentIdNumber ?? 'Not provided' },
              ].map(({ l, v }) => (
                <div key={l} style={{ display:'flex', flexDirection:'column', gap:3 }}>
                  <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.4px' }}>{l}</div>
                  <div style={{ fontSize:'0.82rem', color:'#fff', fontWeight:500, fontFamily: l === '🪪 SA ID' || l === '📞 Phone' ? 'monospace' : "'DM Sans',sans-serif", letterSpacing: l === '🪪 SA ID' ? '1px' : 'normal', wordBreak:'break-all' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Children */}
          <div>
            <div style={{ fontSize:'0.68rem', fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'0.7rem' }}>👶 Children</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              {family.children.map((c, i) => (
                <div key={c.id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.8rem 0.9rem', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:avatarColor(c.id, i), display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.78rem', fontWeight:700, color:'#fff', flexShrink:0 }}>{initials(c.firstName, c.lastName)}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, color:'#fff', fontSize:'0.875rem' }}>{c.firstName} {c.lastName}</div>
                    <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.38)', marginTop:2 }}>{c.grade} · Age {c.age} · {c.gender}</div>
                    {c.idNumber && <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.25)', fontFamily:'monospace', marginTop:2 }}>ID: {c.idNumber}</div>}
                    <div style={{ display:'flex', gap:'0.3rem', flexWrap:'wrap', marginTop:4 }}>
                      {c.hasAllergies && <span style={{ fontSize:'0.6rem', fontWeight:700, color:'#f0c000', background:'rgba(240,192,0,0.1)', border:'1px solid rgba(240,192,0,0.2)', padding:'0.1rem 0.4rem', borderRadius:20 }}>⚠ Allergy</span>}
                      {c.hasMedicalCondition && <span style={{ fontSize:'0.6rem', fontWeight:700, color:'#e05252', background:'rgba(224,82,82,0.1)', border:'1px solid rgba(224,82,82,0.2)', padding:'0.1rem 0.4rem', borderRadius:20 }}>⚕ Medical</span>}
                      {c.welfareFlags > 0 && <span style={{ fontSize:'0.6rem', fontWeight:700, color:'#e05252', background:'rgba(224,82,82,0.1)', border:'1px solid rgba(224,82,82,0.2)', padding:'0.1rem 0.4rem', borderRadius:20 }}>🚩 Welfare</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:'1rem', fontWeight:800, color: c.attendanceRate >= 80 ? '#34d399' : c.attendanceRate >= 60 ? '#f0c000' : '#e05252', fontFamily:"'Bebas Neue',sans-serif" }}>{c.attendanceRate}%</div>
                    <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.3)' }}>attendance</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
type Tab = 'overview' | 'attendance' | 'welfare' | 'register' | 'families' | 'report';

export default function TeacherDashboard({
  user: userProp = { name:'Thabo Mokoena', email:'teacher@demo.church', phone:'+27734445566', role:'teacher' },
  onLogout,
  onRegisterFamily,
}: TeacherDashboardProps) {

  // ── Load profile from localStorage ──────────────────────────────────────────
  const savedProfile = useMemo(() => {
    try {
      const raw = localStorage.getItem('ssp_teacher_profile');
      if (raw) return JSON.parse(raw) as MockUser;
    } catch {}
    return null;
  }, []);

  const user: MockUser = useMemo(() => {
    if (savedProfile) {
      return {
        name: savedProfile.name ?? savedProfile.firstName ? `${(savedProfile as any).firstName} ${(savedProfile as any).lastName}` : userProp.name,
        email: savedProfile.email ?? userProp.email,
        phone: savedProfile.phone ?? userProp.phone,
        role: savedProfile.role ?? 'teacher',
        idNumber: savedProfile.idNumber,
        church: savedProfile.church,
        gradesSelected: savedProfile.gradesSelected,
      };
    }
    return userProp;
  }, [savedProfile, userProp]);

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [children, setChildren] = useState<Child[]>(INITIAL_CHILDREN);
  const [attendanceHistory, setAttendanceHistory] = useState<DailyAttendanceRecord[]>(MOCK_HISTORICAL);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [attendanceFilter, setAttendanceFilter] = useState<'all'|'present'|'absent'|'late'|'unmarked'|'fed'|'notfed'>('all');
  const [attendanceSaved, setAttendanceSaved] = useState(false);
  const [welfare, setWelfare] = useState<WelfareFlag[]>(INITIAL_WELFARE);
  const [welfareForm, setWelfareForm] = useState({ childId:'', concern:'', severity:'medium' as 'low'|'medium'|'high' });
  const [welfareErrors, setWelfareErrors] = useState<Record<string,string>>({});
  const [welfareSaved, setWelfareSaved] = useState(false);
  const [reportStartDate, setReportStartDate] = useState('2026-02-01');
  const [reportEndDate, setReportEndDate] = useState(todayISO());
  const [registerOverrideChildId, setRegisterOverrideChildId] = useState<string | null>(null);
  const [selectedFamilyName, setSelectedFamilyName] = useState<string | null>(null);

  const getCurrentRecord = (date: string): DailyAttendanceRecord => {
    const existing = attendanceHistory.find(r => r.date === date);
    if (existing) return existing;
    return { date, saved:false, entries: children.map(c => ({ childId:c.id, status:null, fed:false })) };
  };
  const currentRecord = useMemo(() => getCurrentRecord(selectedDate), [selectedDate, attendanceHistory, children]);
  const currentEntries: AttendanceEntry[] = useMemo(() => {
    const entries = [...currentRecord.entries];
    children.forEach(c => { if (!entries.find(e => e.childId === c.id)) entries.push({ childId:c.id, status:null, fed:false }); });
    return entries;
  }, [currentRecord, children]);
  const isDateSaved = currentRecord.saved;

  const updateEntry = (childId: string, update: Partial<AttendanceEntry>) => {
    if (isDateSaved) return;
    setAttendanceHistory(prev => {
      const idx = prev.findIndex(r => r.date === selectedDate);
      const newEntries = currentEntries.map(e => e.childId === childId ? { ...e, ...update } : e);
      const newRecord: DailyAttendanceRecord = { date:selectedDate, saved:false, entries:newEntries };
      if (idx >= 0) { const updated = [...prev]; updated[idx] = newRecord; return updated; }
      return [...prev, newRecord];
    });
    setAttendanceSaved(false);
  };

  const setStatus = (childId: string, status: 'present'|'absent'|'late'|'') => {
    if (status === '') { updateEntry(childId, { status: null }); } else { updateEntry(childId, { status }); }
  };
  const toggleFed = (childId: string) => { const e = currentEntries.find(e => e.childId === childId); updateEntry(childId, { fed: !e?.fed }); };
  const presentCount = currentEntries.filter(a => a.status === 'present').length;
  const absentCount  = currentEntries.filter(a => a.status === 'absent').length;
  const lateCount    = currentEntries.filter(a => a.status === 'late').length;
  const fedCount     = currentEntries.filter(a => a.fed).length;
  const notFedCount  = currentEntries.filter(a => !a.fed).length;
  const unmarked     = currentEntries.filter(a => a.status === null).length;

  const filteredChildren = useMemo(() => {
    if (attendanceFilter === 'all') return children;
    return children.filter(c => {
      const entry = currentEntries.find(e => e.childId === c.id);
      if (attendanceFilter === 'unmarked') return !entry?.status;
      if (attendanceFilter === 'fed') return entry?.fed === true;
      if (attendanceFilter === 'notfed') return entry?.fed === false;
      return entry?.status === attendanceFilter;
    });
  }, [children, currentEntries, attendanceFilter]);

  const saveAttendance = () => {
    if (unmarked > 0) return;
    setAttendanceHistory(prev => {
      const idx = prev.findIndex(r => r.date === selectedDate);
      const savedRecord = { ...currentRecord, entries:currentEntries, saved:true };
      if (idx >= 0) { const updated = [...prev]; updated[idx] = savedRecord; return updated; }
      return [...prev, savedRecord];
    });
    setAttendanceSaved(true);
    setTimeout(() => setAttendanceSaved(false), 3000);
  };

  const handleAttendanceOverride = (childId: string, date: string, status: 'present'|'absent'|'late') => {
    setAttendanceHistory(prev => {
      const idx = prev.findIndex(r => r.date === date);
      if (idx >= 0) {
        const rec = prev[idx];
        const entryIdx = rec.entries.findIndex(e => e.childId === childId);
        const newEntries = [...rec.entries];
        if (entryIdx >= 0) {
          newEntries[entryIdx] = { ...newEntries[entryIdx], status, overrideDate: todayISO() };
        } else {
          newEntries.push({ childId, status, fed: false, overrideDate: todayISO() });
        }
        const updated = [...prev];
        updated[idx] = { ...rec, entries: newEntries, saved: true };
        return updated;
      }
      return [...prev, { date, saved:true, entries:[{ childId, status, fed:false, overrideDate:todayISO() }] }];
    });
    setChildren(prev => prev.map(c => {
      if (c.id !== childId) return c;
      return { ...c, attendanceRate: Math.min(100, c.attendanceRate + (status === 'present' || status === 'late' ? 2 : -2)) };
    }));
  };

  const submitWelfare = () => {
    const e: Record<string,string> = {};
    if (!welfareForm.childId) e.childId = 'Please select a child.';
    if (!welfareForm.concern.trim()) e.concern = 'Please describe the concern.';
    setWelfareErrors(e);
    if (Object.keys(e).length) return;
    const child = children.find(c => c.id === welfareForm.childId);
    setWelfare(prev => [{ id:`w${Date.now()}`, childId:welfareForm.childId, childName:child ? `${child.firstName} ${child.lastName}` : '', concern:welfareForm.concern, severity:welfareForm.severity, date:todayISO(), resolved:false }, ...prev]);
    setWelfareForm({ childId:'', concern:'', severity:'medium' });
    setWelfareSaved(true);
    setTimeout(() => setWelfareSaved(false), 3000);
  };
  const resolveFlag = (id: string) => setWelfare(prev => prev.map(w => w.id === id ? { ...w, resolved:true } : w));

  const reportData = useMemo(() => {
    const sundays = getSundaysInRange(reportStartDate, reportEndDate);
    const savedSundays = sundays.filter(s => attendanceHistory.find(r => r.date === s && r.saved));
    const sundayStats = savedSundays.map(date => {
      const rec = attendanceHistory.find(r => r.date === date)!;
      const total   = children.length;
      const present = rec.entries.filter(e => e.status === 'present').length;
      const late    = rec.entries.filter(e => e.status === 'late').length;
      const absent  = rec.entries.filter(e => e.status === 'absent').length;
      const fed     = rec.entries.filter(e => e.fed).length;
      return { date, total, present, late, absent, fed, pct: total ? Math.round(((present + late) / total) * 100) : 0 };
    });
    const childStats = children.map(c => {
      const attended = savedSundays.filter(date => {
        const rec = attendanceHistory.find(r => r.date === date);
        const entry = rec?.entries.find(e => e.childId === c.id);
        return entry?.status === 'present' || entry?.status === 'late';
      }).length;
      const pct = savedSundays.length ? Math.round((attended / savedSundays.length) * 100) : 0;
      return { child:c, attended, total:savedSundays.length, pct };
    }).sort((a, b) => b.pct - a.pct);
    const avgPct = sundayStats.length ? Math.round(sundayStats.reduce((s, r) => s + r.pct, 0) / sundayStats.length) : 0;
    const totalPresent = sundayStats.reduce((s, r) => s + r.present, 0);
    const totalLate    = sundayStats.reduce((s, r) => s + r.late, 0);
    const totalAbsent  = sundayStats.reduce((s, r) => s + r.absent, 0);
    const totalFed     = sundayStats.reduce((s, r) => s + r.fed, 0);
    return { sundays, savedSundays, sundayStats, childStats, avgPct, totalPresent, totalLate, totalAbsent, totalFed };
  }, [reportStartDate, reportEndDate, attendanceHistory, children]);

  const openWelfare = welfare.filter(w => !w.resolved).length;
  const avgAttendance = children.length ? Math.round(children.reduce((s, c) => s + c.attendanceRate, 0) / children.length) : 0;

  const families = useMemo(() => {
    const map = new Map<string, { parentName:string; parentPhone:string; parentEmail:string; registeredBy:'parent'|'teacher'; address?:string; emergencyContact?:string; parentIdNumber?:string; employmentStatus?:string; guardianRelationship?:string; children:Child[] }>();
    children.forEach(c => {
      const key = c.parentName;
      if (!map.has(key)) map.set(key, { parentName:c.parentName, parentPhone:c.parentPhone, parentEmail:c.parentEmail, registeredBy:c.registeredBy, address:c.address, emergencyContact:c.emergencyContact, parentIdNumber:c.parentIdNumber, employmentStatus:c.employmentStatus, guardianRelationship:c.guardianRelationship, children:[] });
      map.get(key)!.children.push(c);
    });
    return Array.from(map.values());
  }, [children]);

  const registerOverrideChild = registerOverrideChildId ? children.find(c => c.id === registerOverrideChildId) ?? null : null;
  const registerOverrideChildIdx = registerOverrideChildId ? children.findIndex(c => c.id === registerOverrideChildId) : 0;
  const selectedFamily = selectedFamilyName ? families.find(f => f.parentName === selectedFamilyName) ?? null : null;

  const livePresent = currentEntries.filter(e => e.status === 'present').length;
  const liveAbsent  = currentEntries.filter(e => e.status === 'absent').length;
  const lateLive    = currentEntries.filter(e => e.status === 'late').length;
  const liveFed     = currentEntries.filter(e => e.fed).length;

  // Derived display values
  const displayName = user.name;
  const gradeLabel = user.gradesSelected?.join(', ') ?? 'Grade 3';
  const churchLabel = user.church ?? '';

  return (
    <>
      <style>{CSS}</style>

      {registerOverrideChild && (
        <RegisterOverridePopup
          child={registerOverrideChild}
          idx={registerOverrideChildIdx}
          attendanceHistory={attendanceHistory}
          savedSundays={reportData.savedSundays}
          onClose={() => setRegisterOverrideChildId(null)}
          onOverride={handleAttendanceOverride}
        />
      )}
      {selectedFamily && (
        <FamilyProfileCard
          family={selectedFamily}
          children={children}
          idx={0}
          onClose={() => setSelectedFamilyName(null)}
        />
      )}

      <div className="td-root">
        {/* Header */}
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
              <div className="td-avatar-sm">{displayName.charAt(0)}</div>
              <div>
                <div className="td-user-name">{displayName}</div>
                <div className="td-user-role">Teacher{churchLabel ? ` · ${churchLabel}` : ''}</div>
              </div>
            </div>
            <button className="td-signout" onClick={onLogout}>Sign out</button>
          </div>
        </header>

        {/* Tabs */}
        <nav className="td-tab-nav">
          {([
            { id:'overview',   label:'🏠 Overview' },
            { id:'attendance', label:`✅ Attendance${unmarked > 0 ? ` (${unmarked} unmarked)` : attendanceSaved ? ' ✓' : ''}` },
            { id:'welfare',    label:`🚨 Welfare${openWelfare > 0 ? ` (${openWelfare})` : ''}` },
            { id:'register',   label:'📋 Class Register' },
            { id:'families',   label:'👨‍👩‍👧 Families' },
            { id:'report',     label:'📊 Report' },
          ] as const).map(tab => (
            <button key={tab.id} className={`td-tab${activeTab === tab.id ? ' td-tab--active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
          ))}
        </nav>

        <main className="td-main">
          <div className="td-content">

            {/* ══ OVERVIEW ══ */}
            {activeTab === 'overview' && (
              <div className="td-fade">
                <div className="td-hero">
                  <div className="td-hero-glow" />
                  <div className="td-hero-pill"><span className="td-hero-dot" />Teacher</div>
                  <h1 className="td-hero-h1">Good morning, <span className="td-accent">{displayName.split(' ')[0]}</span></h1>
                  <p className="td-hero-p">
                    You have <strong style={{ color:'#fff' }}>{children.length} children</strong> in {gradeLabel}.
                    {openWelfare > 0 && <> <strong style={{ color:'#e05252' }}>{openWelfare} welfare concern{openWelfare > 1 ? 's' : ''}</strong> need attention.</>}
                    {unmarked > 0 && <> <strong style={{ color:'#f0c000' }}>Today's attendance</strong> has not been marked yet.</>}
                  </p>
                  <div className="td-hero-chips">
                    {[
                      {l:'Class',   v: gradeLabel},
                      {l:'Church',  v: churchLabel || 'Not set'},
                      {l:'Pupils',  v:`${children.length} registered`},
                      {l:'Avg Att', v:`${avgAttendance}%`},
                      {l:'Today',   v:todayStr()},
                    ].map(({ l, v }) => (
                      <div key={l} className="td-chip"><div className="td-chip-l">{l}</div><div className="td-chip-v">{v}</div></div>
                    ))}
                  </div>
                </div>

                {/* My Profile card — loaded from localStorage */}
                <div className="td-card" style={{ marginBottom:'1.25rem' }}>
                  <div className="td-card-title" style={{ marginBottom:'1rem' }}>👤 My Profile</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'0.75rem' }}>
                    {[
                      { l:'Full Name',  v: user.name },
                      { l:'Email',      v: user.email },
                      { l:'Phone',      v: user.phone,    mono: true },
                      { l:'Church',     v: user.church ?? '—' },
                      { l:'Grades',     v: user.gradesSelected?.join(', ') ?? '—' },
                      { l:'SA ID',      v: user.idNumber ?? '—', mono: true },
                    ].map(({ l, v, mono }) => (
                      <div key={l} style={{ padding:'0.75rem', borderRadius:10, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>{l}</div>
                        <div style={{ fontSize:'0.85rem', color:'#fff', fontWeight:500, fontFamily: mono ? 'monospace' : "'DM Sans',sans-serif", letterSpacing: l === 'SA ID' ? '1px' : 'normal', wordBreak:'break-all' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {!savedProfile && (
                    <div style={{ marginTop:'0.75rem', padding:'0.6rem 0.9rem', borderRadius:8, background:'rgba(240,192,0,0.07)', border:'1px solid rgba(240,192,0,0.2)', fontSize:'0.78rem', color:'#f0c000' }}>
                      ℹ No saved profile found. Register via the teacher registration form to populate your profile here.
                    </div>
                  )}
                </div>

                <div className="td-stats-grid">
                  {[
                    { icon:'👶', label:'Class Size',      value:children.length,                                                          color:'#f0c000' },
                    { icon:'📅', label:'Avg Attendance',  value:`${avgAttendance}%`,                                                      color:'#34d399' },
                    { icon:'🚨', label:'Open Welfare',    value:openWelfare,   color:openWelfare > 0 ? '#e05252' : '#34d399' },
                    { icon:'⚠',  label:'Medical/Allergy', value:children.filter(c => c.hasAllergies || c.hasMedicalCondition).length,     color:'#f0c000' },
                  ].map(s => (
                    <div key={s.label} className="td-stat-card">
                      <div className="td-stat-icon">{s.icon}</div>
                      <div className="td-stat-value" style={{ color:s.color }}>{s.value}</div>
                      <div className="td-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="td-card">
                  <div className="td-card-title">Quick Actions</div>
                  <div className="td-quick-grid">
                    {[
                      { icon:'✅', label:'Mark Attendance',  sub:unmarked>0?`${unmarked} unmarked`:'Up to date',    tab:'attendance' as Tab, urgent:unmarked>0 },
                      { icon:'🚨', label:'Log Welfare',      sub:'Flag a safeguarding issue',                        tab:'welfare'    as Tab, urgent:openWelfare>0 },
                      { icon:'📋', label:'Class Register',   sub:`${children.length} children`,                     tab:'register'   as Tab, urgent:false },
                      { icon:'👨‍👩‍👧', label:'Families',        sub:`${families.length} families`,                   tab:'families'   as Tab, urgent:false },
                      { icon:'📊', label:'Attendance Report',sub:'View trends over time',                            tab:'report'     as Tab, urgent:false },
                    ].map(a => (
                      <button key={a.label} className={`td-quick-btn${a.urgent?' td-quick-btn--urgent':''}`} onClick={() => setActiveTab(a.tab)}>
                        <div className="td-quick-icon">{a.icon}</div>
                        <div className="td-quick-label">{a.label}</div>
                        <div className="td-quick-sub">{a.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {children.some(c => c.hasAllergies || c.hasMedicalCondition) && (
                  <div className="td-card">
                    <div className="td-card-title" style={{ color:'#f0c000' }}>⚠ Medical & Allergy Alerts</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginTop:'0.75rem' }}>
                      {children.filter(c => c.hasAllergies || c.hasMedicalCondition).map((c, idx) => (
                        <div key={c.id} className="td-alert-row">
                          <div className="td-avatar-xs" style={{ background:avatarColor(c.id,idx) }}>{initials(c.firstName,c.lastName)}</div>
                          <div>
                            <div style={{ fontWeight:600, color:'#fff', fontSize:'0.88rem' }}>{c.firstName} {c.lastName}</div>
                            {c.hasAllergies        && <div style={{ fontSize:'0.76rem', color:'#f0c000' }}>⚠ Allergy: {c.allergiesDetails}</div>}
                            {c.hasMedicalCondition && <div style={{ fontSize:'0.76rem', color:'#e05252' }}>⚕ Medical: {c.medicalDetails}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══ ATTENDANCE ══ */}
            {activeTab === 'attendance' && (
              <div className="td-fade">
                <div className="td-page-header">
                  <div>
                    <div className="td-page-title">Attendance & Feeding</div>
                    <div className="td-page-sub">{gradeLabel} · Use dropdowns to mark status and feeding</div>
                  </div>
                  <button className="td-btn-primary" onClick={saveAttendance} disabled={unmarked > 0 || isDateSaved}>
                    {isDateSaved ? '✓ Register Saved' : attendanceSaved ? '✓ Saved!' : unmarked > 0 ? `Save (${unmarked} remaining)` : 'Save Register'}
                  </button>
                </div>

                <div className="td-card" style={{ marginBottom:'1rem', padding:'1rem 1.25rem' }}>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:'1rem', flexWrap:'wrap' }}>
                    <div style={{ flex:1, minWidth:200 }}>
                      <label style={{ ...FL, marginBottom:'0.3rem' }}>📅 Select Sunday Date</label>
                      <input type="date" style={{ ...FI, maxWidth:220 }} value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setAttendanceFilter('all'); setAttendanceSaved(false); }} max={todayISO()} />
                    </div>
                    <div style={{ flexShrink:0, paddingBottom:'0.05rem' }}>
                      <div style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', marginBottom:'0.4rem' }}>{fmtDateLong(selectedDate)}</div>
                      {isDateSaved
                        ? <span style={{ fontSize:'0.72rem', fontWeight:700, color:'#34d399', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)', padding:'0.2rem 0.65rem', borderRadius:20 }}>✓ Saved · Go to Class Register to override</span>
                        : <span style={{ fontSize:'0.72rem', fontWeight:700, color:'#f0c000', background:'rgba(240,192,0,0.1)', border:'1px solid rgba(240,192,0,0.2)', padding:'0.2rem 0.65rem', borderRadius:20 }}>⏳ Not yet saved</span>}
                    </div>
                    <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', paddingBottom:'0.05rem' }}>
                      {[0,7,14,21].map(daysAgo => {
                        const d = new Date(); d.setDate(d.getDate() - daysAgo);
                        while (d.getDay() !== 0) d.setDate(d.getDate() - 1);
                        const iso = d.toISOString().split('T')[0];
                        const label = daysAgo === 0 ? 'This Sunday' : `${daysAgo/7}w ago`;
                        return (
                          <button key={iso} onClick={() => { setSelectedDate(iso); setAttendanceFilter('all'); }} style={{ padding:'0.3rem 0.7rem', borderRadius:7, fontSize:'0.72rem', fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", border:selectedDate===iso?'1px solid #f0c000':'1px solid rgba(255,255,255,0.1)', background:selectedDate===iso?'rgba(240,192,0,0.15)':'transparent', color:selectedDate===iso?'#f0c000':'rgba(255,255,255,0.4)', transition:'all 0.15s' }}>{label}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="td-att-summary">
                  {[
                    {label:'Present', count:presentCount, color:'#34d399'},
                    {label:'Absent',  count:absentCount,  color:'#e05252'},
                    {label:'Late',    count:lateCount,    color:'#f0c000'},
                    {label:'🍽 Fed',  count:fedCount,     color:'#8bc4e8'},
                    {label:'Unmarked',count:unmarked,     color:'rgba(255,255,255,0.3)'}
                  ].map(s => (
                    <div key={s.label} className="td-att-sum-item">
                      <div style={{ fontSize:'1.4rem', fontWeight:800, color:s.color, fontFamily:"'Bebas Neue',sans-serif" }}>{s.count}</div>
                      <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display:'flex', gap:'0.4rem', marginBottom:'0.85rem', flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', marginRight:'0.25rem' }}>Filter:</span>
                  {([
                    { f:'all',      label:'All',     color:'#f0c000', count:children.length },
                    { f:'present',  label:'Present', color:'#34d399', count:currentEntries.filter(e=>e.status==='present').length },
                    { f:'absent',   label:'Absent',  color:'#e05252', count:currentEntries.filter(e=>e.status==='absent').length },
                    { f:'late',     label:'Late',    color:'#f0c000', count:currentEntries.filter(e=>e.status==='late').length },
                    { f:'unmarked', label:'Unmarked',color:'rgba(255,255,255,0.4)', count:unmarked },
                    { f:'fed',      label:'🍽 Fed',  color:'#8bc4e8', count:fedCount },
                    { f:'notfed',   label:'Not Fed', color:'rgba(255,255,255,0.4)', count:notFedCount },
                  ] as const).map(({ f, label, color, count }) => (
                    <button key={f} onClick={() => setAttendanceFilter(f)} style={{ padding:'0.28rem 0.75rem', borderRadius:20, fontSize:'0.72rem', fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", border:`1px solid ${attendanceFilter===f?color:'rgba(255,255,255,0.1)'}`, background:attendanceFilter===f?`${color}18`:'transparent', color:attendanceFilter===f?color:'rgba(255,255,255,0.35)', transition:'all 0.15s' }}>
                      {label} ({count})
                    </button>
                  ))}
                </div>

                {isDateSaved && (
                  <div style={{ padding:'0.7rem 1rem', borderRadius:9, background:'rgba(52,211,153,0.07)', border:'1px solid rgba(52,211,153,0.2)', fontSize:'0.8rem', color:'#34d399', marginBottom:'0.85rem', display:'flex', gap:'0.5rem', alignItems:'center' }}>
                    <span>🔒</span><span>Register saved. Go to the <strong>Class Register</strong> tab to override any entry.</span>
                  </div>
                )}

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
                      {filteredChildren.length === 0
                        ? <tr><td colSpan={5} style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', padding:'2rem', fontSize:'0.85rem' }}>No children match this filter.</td></tr>
                        : filteredChildren.map((child, idx) => {
                            const entry = currentEntries.find(a => a.childId === child.id) ?? { childId:child.id, status:null, fed:false };
                            const statusColor = entry.status==='present'?'#34d399':entry.status==='absent'?'#e05252':entry.status==='late'?'#f0c000':'rgba(255,255,255,0.3)';
                            return (
                              <tr key={child.id} className={`td-att-tr${entry.status?` td-att-tr--${entry.status}`:''}`}>
                                <td>
                                  <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
                                    <div className="td-avatar-xs" style={{ background:avatarColor(child.id,idx) }}>{initials(child.firstName,child.lastName)}</div>
                                    <div>
                                      <div style={{ fontWeight:600, color:'#fff', fontSize:'0.875rem' }}>{child.firstName} {child.lastName}</div>
                                      {entry.overrideDate && <div style={{ fontSize:'0.63rem', color:'#f0c000' }}>↑ Overridden {fmtDate(entry.overrideDate)}</div>}
                                      {(child.hasAllergies||child.hasMedicalCondition) && <div style={{ fontSize:'0.68rem', color:'#f0c000' }}>{child.hasAllergies&&'⚠ Allergy '}{child.hasMedicalCondition&&'⚕ Medical'}</div>}
                                    </div>
                                  </div>
                                </td>
                                <td style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.85rem' }}>{child.age}</td>
                                <td style={{ fontSize:'0.8rem' }}>{child.hasMedicalCondition?<span className="td-tag-warn">⚕ Yes</span>:<span style={{ color:'rgba(255,255,255,0.25)' }}>None</span>}</td>
                                <td>
                                  {isDateSaved ? (
                                    <span className="td-status-pill" style={{ background:`${statusColor}20`, color:statusColor, border:`1px solid ${statusColor}40`, padding:'0.3rem 0.75rem', borderRadius:20, fontWeight:700, textTransform:'capitalize', fontSize:'0.78rem' }}>
                                      {entry.status ?? '—'}
                                    </span>
                                  ) : (
                                    <select
                                      value={entry.status ?? ''}
                                      onChange={e => setStatus(child.id, e.target.value as any)}
                                      style={{
                                        padding:'0.35rem 0.65rem', borderRadius:7, fontSize:'0.78rem', fontWeight:600,
                                        fontFamily:"'DM Sans',sans-serif", cursor:'pointer', outline:'none',
                                        colorScheme:'dark' as any,
                                        border: entry.status === 'present' ? '1px solid #34d399'
                                              : entry.status === 'absent'  ? '1px solid #e05252'
                                              : entry.status === 'late'    ? '1px solid #f0c000'
                                              : '1px solid rgba(255,255,255,0.15)',
                                        background: entry.status === 'present' ? 'rgba(52,211,153,0.15)'
                                                  : entry.status === 'absent'  ? 'rgba(224,82,82,0.15)'
                                                  : entry.status === 'late'    ? 'rgba(240,192,0,0.15)'
                                                  : 'rgba(255,255,255,0.06)',
                                        color: entry.status === 'present' ? '#34d399'
                                             : entry.status === 'absent'  ? '#e05252'
                                             : entry.status === 'late'    ? '#f0c000'
                                             : 'rgba(255,255,255,0.45)',
                                        minWidth: 120,
                                      }}
                                    >
                                      <option value="">— Select —</option>
                                      <option value="present">✓ Present</option>
                                      <option value="absent">✗ Absent</option>
                                      <option value="late">~ Late</option>
                                    </select>
                                  )}
                                </td>
                                <td>
                                  {isDateSaved ? (
                                    <span style={{ fontSize:'0.78rem', fontWeight:600, color:entry.fed?'#8bc4e8':'rgba(255,255,255,0.25)' }}>
                                      {entry.fed?'🍽 Fed':'— Not fed'}
                                    </span>
                                  ) : (
                                    <button
                                      className={`td-fed-btn${entry.fed?' td-fed-btn--active':''}`}
                                      onClick={() => toggleFed(child.id)}
                                    >
                                      {entry.fed?'🍽 Fed':'— Not fed'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                    </tbody>
                  </table>
                </div>

                <div className="td-card">
                  <div className="td-card-title" style={{ color:'#8bc4e8', marginBottom:'0.85rem' }}>🍽 Feeding Summary</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.75rem' }}>
                    {[
                      {label:'Fed Today',    value:fedCount,                                                          color:'#8bc4e8'},
                      {label:'Not Fed',      value:children.length-fedCount,                                          color:'rgba(255,255,255,0.3)'},
                      {label:'Present + Fed',value:currentEntries.filter(a=>a.status==='present'&&a.fed).length,      color:'#34d399'},
                    ].map(s => (
                      <div key={s.label} style={{ textAlign:'center', padding:'0.85rem', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize:'1.6rem', fontWeight:800, color:s.color, fontFamily:"'Bebas Neue',sans-serif" }}>{s.value}</div>
                        <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.5px', marginTop:4 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ WELFARE ══ */}
            {activeTab === 'welfare' && (
              <div className="td-fade">
                <div className="td-page-header">
                  <div><div className="td-page-title">Welfare Concerns</div><div className="td-page-sub">{openWelfare} open · {welfare.length} total logged</div></div>
                </div>
                <div className="td-card">
                  <div className="td-card-title" style={{ marginBottom:'1rem' }}>🚨 Log New Concern</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                      <div>
                        <label style={WL}>Child *</label>
                        <select style={{ ...WI, borderColor:welfareErrors.childId?'#e05252':'rgba(255,255,255,0.1)' }} value={welfareForm.childId} onChange={e => setWelfareForm(f => ({ ...f, childId:e.target.value }))}>
                          <option value="">Select child</option>
                          {children.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                        </select>
                        {welfareErrors.childId && <span style={WE}>{welfareErrors.childId}</span>}
                      </div>
                      <div>
                        <label style={WL}>Severity *</label>
                        <select style={WI} value={welfareForm.severity} onChange={e => setWelfareForm(f => ({ ...f, severity:e.target.value as any }))}>
                          <option value="low">Low — minor concern</option>
                          <option value="medium">Medium — needs monitoring</option>
                          <option value="high">High — urgent / safeguarding</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={WL}>Description *</label>
                      <textarea style={{ ...WI, minHeight:90, resize:'vertical' } as any} placeholder="Describe what you observed..." value={welfareForm.concern} onChange={e => setWelfareForm(f => ({ ...f, concern:e.target.value }))} />
                      {welfareErrors.concern && <span style={WE}>{welfareErrors.concern}</span>}
                    </div>
                    <div style={{ display:'flex', gap:'0.65rem', alignItems:'center' }}>
                      <button onClick={submitWelfare} className="td-btn-danger">{welfareSaved?'✓ Concern Logged':'🚨 Log Concern'}</button>
                      <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.3)' }}>Sent to Super Admin for review.</span>
                    </div>
                  </div>
                </div>
                <div className="td-card">
                  <div className="td-card-title" style={{ marginBottom:'1rem' }}>Previous Concerns</div>
                  {welfare.length === 0
                    ? <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.85rem', textAlign:'center', padding:'1.5rem 0' }}>No concerns logged yet.</div>
                    : <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                        {welfare.map(w => (
                          <div key={w.id} className={`td-welfare-row td-welfare-row--${w.severity}${w.resolved?' td-welfare-row--resolved':''}`}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.75rem', marginBottom:6 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                                <span className={`td-sev-badge td-sev-badge--${w.severity}`}>{w.severity}</span>
                                <span style={{ fontWeight:700, color:'#fff', fontSize:'0.875rem' }}>{w.childName}</span>
                              </div>
                              <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
                                <span style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.3)' }}>{fmtDate(w.date)}</span>
                                {w.resolved?<span className="td-resolved-badge">✓ Resolved</span>:<button className="td-resolve-btn" onClick={() => resolveFlag(w.id)}>Mark resolved</button>}
                              </div>
                            </div>
                            <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.6)', lineHeight:1.55 }}>{w.concern}</div>
                          </div>
                        ))}
                      </div>}
                </div>
              </div>
            )}

            {/* ══ CLASS REGISTER ══ */}
            {activeTab === 'register' && (
              <div className="td-fade">
                <div className="td-page-header">
                  <div>
                    <div className="td-page-title">Class Register</div>
                    <div className="td-page-sub">{gradeLabel} · {children.length} children · Click row to override attendance</div>
                  </div>
                </div>
                <div style={{ padding:'12px 16px', borderRadius:10, background:'rgba(52,211,153,0.07)', border:'1px solid rgba(52,211,153,0.2)', marginBottom:'1rem', display:'flex', gap:'0.6rem', alignItems:'center', fontSize:'0.8rem', color:'rgba(255,255,255,0.5)' }}>
                  <span>🔓</span><span>Click any learner row to open their profile and override attendance records.</span>
                </div>
                <div className="td-card" style={{ padding:0, overflow:'hidden' }}>
                  <table className="td-reg-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>SA ID</th>
                        <th>Gender</th>
                        <th>Today</th>
                        <th>Medical</th>
                        <th>Welfare</th>
                        <th>Parent / Guardian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {children.map((child, idx) => {
                        const entry = currentEntries.find(a => a.childId === child.id);
                        const sc = entry?.status==='present'?'#34d399':entry?.status==='absent'?'#e05252':entry?.status==='late'?'#f0c000':'rgba(255,255,255,0.2)';
                        return (
                          <tr key={child.id} className="td-reg-tr td-clickable-row" onClick={() => setRegisterOverrideChildId(child.id)}>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                                <div className="td-avatar-xs" style={{ background:avatarColor(child.id,idx) }}>{initials(child.firstName,child.lastName)}</div>
                                <div>
                                  <span style={{ fontWeight:600, color:'#fff', fontSize:'0.875rem' }}>{child.firstName} {child.lastName}</span>
                                  {child.registeredBy==='teacher'&&<div style={{ fontSize:'0.65rem', color:'#f0c000' }}>by teacher</div>}
                                </div>
                              </div>
                            </td>
                            <td style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.85rem' }}>{child.age}</td>
                            <td>
                              {child.idNumber
                                ? <span style={{ fontFamily:'monospace', fontSize:'0.75rem', color:'rgba(255,255,255,0.55)', letterSpacing:'0.5px' }}>{child.idNumber}</span>
                                : <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.2)' }}>—</span>}
                            </td>
                            <td><span style={{ fontSize:'1rem' }}>{child.gender==='female'?'👩':'👦'}</span><span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.5)', marginLeft:4 }}>{child.gender}</span></td>
                            <td><span className="td-status-pill" style={{ background:`${sc}20`, color:sc, border:`1px solid ${sc}40` }}>{entry?.status??'—'}</span></td>
                            <td>{(child.hasAllergies||child.hasMedicalCondition)?<span className="td-tag-warn">{child.hasAllergies?'⚠ Yes':'⚕ Yes'}</span>:<span style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.8rem' }}>None</span>}</td>
                            <td>{child.welfareFlags>0?<span className="td-tag-danger">🚩 Flagged</span>:<span style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.8rem' }}>None</span>}</td>
                            <td>
                              <div style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.55)', lineHeight:1.4 }}>
                                <div>{child.parentName}</div>
                                <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.72rem', fontFamily:'monospace' }}>{child.parentPhone}</div>
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

            {/* ══ FAMILIES ══ */}
            {activeTab === 'families' && (
              <div className="td-fade">
                <div className="td-page-header">
                  <div><div className="td-page-title">Family Profiles</div><div className="td-page-sub">{families.length} families · {children.length} children total</div></div>
                  <button
                    className="td-btn-primary"
                    onClick={() => onRegisterFamily?.()}
                    style={{ display:'flex', alignItems:'center', gap:'0.5rem', whiteSpace:'nowrap' }}
                  >
                    <span style={{ fontSize:'1rem' }}>👨‍👩‍👧</span> Register New Family
                  </button>
                </div>
                <div style={{ padding:'14px 18px', borderRadius:12, background:'rgba(52,211,153,0.07)', border:'1px solid rgba(52,211,153,0.2)', marginBottom:'1.25rem', display:'flex', gap:'0.85rem', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'1.3rem', flexShrink:0 }}>ℹ️</span>
                  <div>
                    <div style={{ fontWeight:700, color:'#34d399', fontSize:'0.875rem', marginBottom:4 }}>Family Profiles</div>
                    <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>Click any family card to view their full profile including guardian details, relationship, employment status, and attendance rates. Use <strong style={{ color:'#34d399' }}>Register New Family</strong> to add a family via the parent registration form.</div>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
                  {families.map((family, fIdx) => {
                    const avgAtt = family.children.length ? Math.round(family.children.reduce((s,c) => s+c.attendanceRate,0)/family.children.length) : 0;
                    const attColor = avgAtt>=80?'#34d399':avgAtt>=60?'#f0c000':'#e05252';
                    const hasWelfare = family.children.some(c => c.welfareFlags > 0);
                    return (
                      <div key={family.parentName} onClick={() => setSelectedFamilyName(family.parentName)} style={{ background:'rgba(255,255,255,0.025)', border:`1px solid ${family.registeredBy==='teacher'?'rgba(240,192,0,0.2)':'rgba(255,255,255,0.065)'}`, borderRadius:14, padding:'1.1rem', cursor:'pointer', transition:'all 0.2s', position:'relative', overflow:'hidden' }} className="td-family-card">
                        {family.registeredBy === 'teacher' && <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#f0c000,#ffd200)' }} />}
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'0.75rem', marginBottom:'0.85rem' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                            <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#0a2410,#071a0d)', border:'2px solid rgba(52,211,153,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>👨‍👩‍👧</div>
                            <div>
                              <div style={{ fontWeight:700, color:'#fff', fontSize:'0.95rem' }}>{family.parentName}</div>
                              <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', marginTop:2, fontFamily:'monospace' }}>{family.parentPhone}</div>
                            </div>
                          </div>
                          <div style={{ textAlign:'right', flexShrink:0 }}>
                            <div style={{ fontSize:'1.2rem', fontWeight:800, color:attColor, fontFamily:"'Bebas Neue',sans-serif" }}>{avgAtt}%</div>
                            <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>avg att.</div>
                          </div>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', marginBottom:'0.75rem' }}>
                          {family.children.map((c, i) => (
                            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.45rem 0.7rem', borderRadius:8, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ width:24, height:24, borderRadius:'50%', background:avatarColor(c.id,i), display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', fontWeight:700, color:'#fff', flexShrink:0 }}>{initials(c.firstName,c.lastName)}</div>
                              <span style={{ fontSize:'0.8rem', color:'#fff', fontWeight:500, flex:1 }}>{c.firstName} {c.lastName}</span>
                              <span style={{ fontSize:'0.7rem', color:c.attendanceRate>=80?'#34d399':c.attendanceRate>=60?'#f0c000':'#e05252', fontWeight:700 }}>{c.attendanceRate}%</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                          {family.registeredBy==='teacher'&&<span style={{ fontSize:'0.62rem', fontWeight:700, color:'#f0c000', background:'rgba(240,192,0,0.1)', border:'1px solid rgba(240,192,0,0.2)', padding:'0.12rem 0.45rem', borderRadius:20 }}>By Teacher</span>}
                          {hasWelfare&&<span style={{ fontSize:'0.62rem', fontWeight:700, color:'#e05252', background:'rgba(224,82,82,0.1)', border:'1px solid rgba(224,82,82,0.2)', padding:'0.12rem 0.45rem', borderRadius:20 }}>🚩 Welfare</span>}
                          {family.children.some(c=>c.hasAllergies||c.hasMedicalCondition)&&<span style={{ fontSize:'0.62rem', fontWeight:700, color:'#f0c000', background:'rgba(240,192,0,0.1)', border:'1px solid rgba(240,192,0,0.2)', padding:'0.12rem 0.45rem', borderRadius:20 }}>⚠ Medical</span>}
                          <span style={{ fontSize:'0.62rem', fontWeight:700, color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', padding:'0.12rem 0.45rem', borderRadius:20 }}>{family.children.length} child{family.children.length!==1?'ren':''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ ATTENDANCE REPORT ══ */}
            {activeTab === 'report' && (
              <div className="td-fade">
                <div className="td-page-header">
                  <div><div className="td-page-title">Attendance Report</div><div className="td-page-sub">Trends, charts & per-child breakdown · {gradeLabel}</div></div>
                </div>

                <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(52,211,153,0.07)', border:'1px solid rgba(52,211,153,0.18)', fontSize:'0.78rem', color:'#34d399', marginBottom:'1rem', display:'flex', gap:'0.5rem', alignItems:'center' }}>
                  <span>🔄</span>
                  <span>Report reflects live data from the Attendance tab. Currently selected date: <strong>{fmtDateLong(selectedDate)}</strong> — {isDateSaved ? `✓ Saved (${livePresent} present, ${liveAbsent} absent, ${lateLive} late, ${liveFed} fed)` : '⏳ Unsaved'}</span>
                </div>

                <div className="td-card" style={{ marginBottom:'1rem', padding:'1rem 1.25rem' }}>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:'1rem', flexWrap:'wrap' }}>
                    <div>
                      <label style={{ ...FL, marginBottom:'0.3rem' }}>From Date</label>
                      <input type="date" style={{ ...FI, maxWidth:180 }} value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} max={reportEndDate} />
                    </div>
                    <div>
                      <label style={{ ...FL, marginBottom:'0.3rem' }}>To Date</label>
                      <input type="date" style={{ ...FI, maxWidth:180 }} value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} min={reportStartDate} max={todayISO()} />
                    </div>
                    <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', paddingBottom:'0.05rem' }}>
                      {[{label:'Last 4 weeks',weeks:4},{label:'Last 8 weeks',weeks:8},{label:'Last 3 months',weeks:13}].map(({ label, weeks }) => (
                        <button key={label} onClick={() => { const end=new Date(),start=new Date(); start.setDate(start.getDate()-weeks*7); setReportStartDate(start.toISOString().split('T')[0]); setReportEndDate(end.toISOString().split('T')[0]); }} style={{ padding:'0.5rem 0.85rem', borderRadius:8, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", border:'1px solid rgba(240,192,0,0.2)', background:'rgba(240,192,0,0.07)', color:'#f0c000', transition:'all 0.15s' }}>{label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="td-stats-grid" style={{ marginBottom:'1rem' }}>
                  {[
                    { icon:'📅', label:'Sundays in Range',  value:reportData.sundays.length,      color:'#f0c000' },
                    { icon:'✅', label:'Sessions Recorded', value:reportData.savedSundays.length,  color:'#34d399' },
                    { icon:'📊', label:'Avg Attendance',    value:`${reportData.avgPct}%`,          color:reportData.avgPct>=80?'#34d399':reportData.avgPct>=60?'#f0c000':'#e05252' },
                    { icon:'🍽', label:'Total Fed',         value:reportData.totalFed,              color:'#8bc4e8' },
                  ].map(s => (
                    <div key={s.label} className="td-stat-card">
                      <div className="td-stat-icon">{s.icon}</div>
                      <div className="td-stat-value" style={{ color:s.color }}>{s.value}</div>
                      <div className="td-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                  <div className="td-card">
                    <div className="td-card-title" style={{ marginBottom:'1rem' }}>🥧 Overall Attendance Split</div>
                    {reportData.savedSundays.length === 0
                      ? <div style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', padding:'2rem', fontSize:'0.85rem' }}>No recorded sessions in this range.</div>
                      : <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
                          <PieChart size={150} data={[
                            { label:'Present', value:reportData.totalPresent, color:'#34d399' },
                            { label:'Late',    value:reportData.totalLate,    color:'#f0c000' },
                            { label:'Absent',  value:reportData.totalAbsent,  color:'#e05252' },
                          ]} />
                          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                            {[{label:'Present',value:reportData.totalPresent,color:'#34d399'},{label:'Late',value:reportData.totalLate,color:'#f0c000'},{label:'Absent',value:reportData.totalAbsent,color:'#e05252'}].map(({ label, value, color }) => (
                              <div key={label} style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                                <div style={{ width:10, height:10, borderRadius:2, background:color, flexShrink:0 }} />
                                <span style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.6)', minWidth:55 }}>{label}</span>
                                <span style={{ fontSize:'0.85rem', fontWeight:700, color, fontFamily:"'Bebas Neue',sans-serif" }}>{value}</span>
                              </div>
                            ))}
                            <div style={{ marginTop:'0.25rem', fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:'0.4rem' }}>
                              {reportData.savedSundays.length} session{reportData.savedSundays.length!==1?'s':''}
                            </div>
                          </div>
                        </div>}
                  </div>

                  <div className="td-card">
                    <div className="td-card-title" style={{ marginBottom:'1rem' }}>🍽 Feeding Split</div>
                    {reportData.savedSundays.length === 0
                      ? <div style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', padding:'2rem', fontSize:'0.85rem' }}>No recorded sessions in this range.</div>
                      : (() => {
                          const totalSlots = reportData.savedSundays.length * children.length;
                          const notFed = totalSlots - reportData.totalFed;
                          return (
                            <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
                              <PieChart size={150} data={[
                                { label:'Fed',     value:reportData.totalFed, color:'#8bc4e8' },
                                { label:'Not Fed', value:notFed,              color:'rgba(255,255,255,0.12)' },
                              ]} />
                              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                                {[{label:'Fed',value:reportData.totalFed,color:'#8bc4e8'},{label:'Not Fed',value:notFed,color:'rgba(255,255,255,0.35)'}].map(({ label, value, color }) => (
                                  <div key={label} style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                                    <div style={{ width:10, height:10, borderRadius:2, background:color, flexShrink:0 }} />
                                    <span style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.6)', minWidth:55 }}>{label}</span>
                                    <span style={{ fontSize:'0.85rem', fontWeight:700, color, fontFamily:"'Bebas Neue',sans-serif" }}>{value}</span>
                                  </div>
                                ))}
                                <div style={{ marginTop:'0.25rem', fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:'0.4rem' }}>
                                  {totalSlots} total slots
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                  </div>
                </div>

                <div className="td-card" style={{ marginBottom:'1rem' }}>
                  <div className="td-card-title" style={{ marginBottom:'1.25rem' }}>📊 Attendance % Per Sunday</div>
                  <BarChart stats={reportData.sundayStats} />
                  {reportData.sundayStats.length > 0 && (
                    <div style={{ display:'flex', gap:'1rem', marginTop:'0.85rem', flexWrap:'wrap' }}>
                      {[{color:'#34d399',label:'≥80% Good'},{color:'#f0c000',label:'60-79% Fair'},{color:'#e05252',label:'<60% Low'}].map(l => (
                        <div key={l.label} style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.72rem', color:'rgba(255,255,255,0.45)' }}>
                          <div style={{ width:10, height:10, borderRadius:2, background:l.color }} />{l.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {reportData.sundayStats.length > 0 && (
                  <div className="td-card" style={{ padding:0, overflow:'hidden', marginBottom:'1rem' }}>
                    <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      <div className="td-card-title">Sunday-by-Sunday Detail</div>
                    </div>
                    <table className="td-reg-table">
                      <thead><tr><th>Date</th><th>Present</th><th>Late</th><th>Absent</th><th>🍽 Fed</th><th>Att %</th></tr></thead>
                      <tbody>
                        {reportData.sundayStats.map(s => {
                          const color = s.pct>=80?'#34d399':s.pct>=60?'#f0c000':'#e05252';
                          return (
                            <tr key={s.date} className="td-reg-tr">
                              <td style={{ fontSize:'0.82rem', color:'#fff', fontWeight:600 }}>{new Date(s.date+'T00:00:00').toLocaleDateString('en-ZA',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</td>
                              <td style={{ color:'#34d399', fontWeight:700, fontSize:'0.85rem' }}>{s.present}</td>
                              <td style={{ color:'#f0c000', fontSize:'0.85rem' }}>{s.late}</td>
                              <td style={{ color:'#e05252', fontSize:'0.85rem' }}>{s.absent}</td>
                              <td style={{ color:'#8bc4e8', fontSize:'0.85rem' }}>{s.fed}</td>
                              <td>
                                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                                  <div style={{ flex:1, height:6, borderRadius:3, background:'rgba(255,255,255,0.06)', overflow:'hidden', minWidth:60 }}>
                                    <div style={{ height:'100%', width:`${s.pct}%`, background:color, borderRadius:3 }} />
                                  </div>
                                  <span style={{ fontSize:'0.78rem', fontWeight:700, color, minWidth:36, textAlign:'right' }}>{s.pct}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="td-card" style={{ padding:0, overflow:'hidden' }}>
                  <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <div className="td-card-title">Per-Child Attendance Breakdown</div>
                    <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', marginTop:4 }}>Based on {reportData.savedSundays.length} recorded session{reportData.savedSundays.length!==1?'s':''}. Click row to go to Class Register.</div>
                  </div>
                  {reportData.savedSundays.length === 0
                    ? <div style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', padding:'2rem', fontSize:'0.85rem' }}>No recorded sessions in this date range.</div>
                    : <table className="td-reg-table">
                        <thead><tr><th>Child</th><th>Attended</th><th>Missed</th><th>Att %</th><th>Status</th></tr></thead>
                        <tbody>
                          {reportData.childStats.map((cs, idx) => {
                            const color = cs.pct>=80?'#34d399':cs.pct>=60?'#f0c000':'#e05252';
                            const statusLabel = cs.pct>=80?'Good':cs.pct>=60?'Fair':cs.pct>0?'At Risk':'No Data';
                            return (
                              <tr key={cs.child.id} className="td-reg-tr td-clickable-row" onClick={() => setActiveTab('register')}>
                                <td>
                                  <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                                    <div className="td-avatar-xs" style={{ background:avatarColor(cs.child.id,idx) }}>{initials(cs.child.firstName,cs.child.lastName)}</div>
                                    <div>
                                      <div style={{ fontWeight:600, color:'#fff', fontSize:'0.875rem' }}>{cs.child.firstName} {cs.child.lastName}</div>
                                      <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)' }}>{cs.child.parentName}</div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ color:'#34d399', fontWeight:700, fontSize:'0.85rem' }}>{cs.attended}</td>
                                <td style={{ color:'#e05252', fontSize:'0.85rem' }}>{cs.total-cs.attended}</td>
                                <td>
                                  <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                                    <div style={{ width:80, height:7, borderRadius:4, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                                      <div style={{ height:'100%', width:`${cs.pct}%`, background:color, borderRadius:4 }} />
                                    </div>
                                    <span style={{ fontSize:'0.8rem', fontWeight:700, color }}>{cs.pct}%</span>
                                  </div>
                                </td>
                                <td><span style={{ fontSize:'0.68rem', fontWeight:700, padding:'0.18rem 0.55rem', borderRadius:20, color, background:`${color}15`, border:`1px solid ${color}30` }}>{statusLabel}</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>}
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
html, body, #root { width: 100%; min-height: 100vh; background: #071a0d; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }

.td-auth-center { display:flex; min-height:100vh; width:100%; align-items:center; justify-content:center; background:#071a0d; }

@keyframes tdFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
.td-fade { animation: tdFadeUp 0.25s ease; }
.td-root { display:flex; flex-direction:column; width:100%; min-height:100vh; background:#071a0d; color:#fff; overflow-x:hidden; }

/* Header */
.td-header { width:100%; background:#081e0b; border-bottom:1px solid rgba(240,192,0,0.15); padding:0 clamp(16px,3vw,40px); height:64px; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-shrink:0; }
.td-brand { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.td-brand-badge { width:34px; height:34px; border-radius:9px; background:linear-gradient(135deg,#f0c000,#c89a00); display:flex; align-items:center; justify-content:center; font-size:1.1rem; }
.td-brand-name { font-family:'Bebas Neue',sans-serif; font-size:14px; color:#fff; letter-spacing:0.5px; line-height:1.2; }
.td-brand-sub { font-size:10px; color:rgba(255,255,255,0.38); text-transform:uppercase; letter-spacing:0.6px; }
.td-header-right { display:flex; align-items:center; gap:10px; }
.td-user-chip { display:flex; align-items:center; gap:8px; padding:5px 12px; background:rgba(240,192,0,0.07); border-radius:8px; border:1px solid rgba(240,192,0,0.18); }
.td-avatar-sm { width:28px; height:28px; border-radius:50%; background:#f0c000; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#071a0d; flex-shrink:0; }
.td-user-name { font-size:12.5px; font-weight:600; color:#fff; line-height:1.2; }
.td-user-role { font-size:10.5px; color:rgba(255,255,255,0.4); }
.td-signout { padding:7px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:rgba(255,255,255,0.55); font-size:12.5px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; white-space:nowrap; }
.td-signout:hover { color:#fff; border-color:rgba(255,255,255,0.25); }

/* Tabs */
.td-tab-nav { width:100%; display:flex; background:#081e0b; border-bottom:1px solid rgba(240,192,0,0.12); overflow-x:auto; scrollbar-width:none; flex-shrink:0; padding:0 clamp(16px,3vw,40px); }
.td-tab-nav::-webkit-scrollbar { display:none; }
.td-tab { flex-shrink:0; padding:0 clamp(10px,1.5vw,20px); height:48px; display:flex; align-items:center; background:none; border:none; color:rgba(255,255,255,0.45); font-family:'DM Sans',sans-serif; font-size:0.83rem; font-weight:600; cursor:pointer; transition:all 0.2s; white-space:nowrap; border-bottom:2px solid transparent; }
.td-tab:hover { color:rgba(255,255,255,0.75); }
.td-tab--active { color:#f0c000 !important; border-bottom-color:#f0c000; }

/* Main */
.td-main { flex:1; width:100%; overflow-y:auto; padding:clamp(16px,2.5vw,36px) clamp(16px,3vw,40px); }
.td-content { width:100%; max-width:1400px; margin:0 auto; }

/* Hero */
.td-hero { width:100%; background:linear-gradient(135deg,#0a2410 0%,#071a0d 100%); border-radius:16px; padding:clamp(20px,3vw,40px); margin-bottom:1.25rem; border:1px solid rgba(240,192,0,0.12); box-shadow:0 20px 60px rgba(0,0,0,0.45); position:relative; overflow:hidden; }
.td-hero-glow { position:absolute; top:-50px; right:-50px; width:240px; height:240px; border-radius:50%; background:radial-gradient(circle,rgba(240,192,0,0.08) 0%,transparent 70%); pointer-events:none; }
.td-hero-pill { display:inline-flex; align-items:center; gap:7px; padding:5px 13px; border-radius:100px; background:rgba(240,192,0,0.12); border:1px solid rgba(240,192,0,0.3); color:#f0c000; font-size:11.5px; font-weight:700; font-family:'Bebas Neue',sans-serif; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:16px; }
.td-hero-dot { width:6px; height:6px; border-radius:50%; background:#f0c000; display:inline-block; }
.td-hero-h1 { font-family:'Bebas Neue',sans-serif; font-size:clamp(22px,3.5vw,34px); color:#fff; margin:0 0 10px; line-height:1.2; }
.td-accent { color:#f0c000; }
.td-hero-p { color:rgba(200,220,200,0.8); font-size:14px; line-height:1.65; margin:0 0 22px; }
.td-hero-chips { display:flex; flex-wrap:wrap; gap:10px; }
.td-chip { padding:9px 14px; border-radius:9px; background:rgba(0,0,0,0.3); border:1px solid rgba(240,192,0,0.1); }
.td-chip-l { font-size:10.5px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.4px; margin-bottom:2px; }
.td-chip-v { font-size:13px; font-weight:600; color:#fff; }

/* Stats */
.td-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0.85rem; margin-bottom:1.25rem; }
.td-stat-card { background:#0a2410; border:1px solid rgba(240,192,0,0.1); border-radius:12px; padding:1rem; text-align:center; }
.td-stat-icon { font-size:1.5rem; margin-bottom:6px; }
.td-stat-value { font-family:'Bebas Neue',sans-serif; font-size:1.9rem; line-height:1; }
.td-stat-label { font-size:0.68rem; color:rgba(255,255,255,0.4); font-weight:600; margin-top:4px; text-transform:uppercase; letter-spacing:0.5px; }

/* Cards */
.td-card { background:#0a2410; border:1px solid rgba(240,192,0,0.1); border-radius:14px; padding:clamp(14px,2vw,24px); margin-bottom:1.25rem; }
.td-card-title { font-family:'Bebas Neue',sans-serif; font-size:1rem; letter-spacing:1.5px; color:#f0c000; margin-bottom:0; }

/* Quick grid */
.td-quick-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:0.7rem; margin-top:0.85rem; }
.td-quick-btn { background:rgba(255,255,255,0.02); border:1px solid rgba(240,192,0,0.08); border-radius:12px; padding:0.9rem 0.4rem; text-align:center; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
.td-quick-btn:hover { background:rgba(240,192,0,0.06); border-color:rgba(240,192,0,0.25); }
.td-quick-btn--urgent { border-color:rgba(240,192,0,0.3); background:rgba(240,192,0,0.05); }
.td-quick-icon { font-size:1.4rem; margin-bottom:5px; }
.td-quick-label { font-size:0.76rem; font-weight:700; color:#fff; margin-bottom:2px; }
.td-quick-sub { font-size:0.65rem; color:rgba(255,255,255,0.35); }

/* Alert row */
.td-alert-row { display:flex; align-items:flex-start; gap:0.75rem; padding:0.75rem 0.9rem; border-radius:9px; background:rgba(240,192,0,0.05); border:1px solid rgba(240,192,0,0.15); margin-bottom:0.5rem; transition:all 0.15s; }
.td-alert-row:hover { background:rgba(240,192,0,0.09); }
.td-avatar-xs { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:700; color:#fff; flex-shrink:0; }

/* Page header */
.td-page-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.25rem; }
.td-page-title { font-family:'Bebas Neue',sans-serif; font-size:1.6rem; color:#fff; letter-spacing:1px; }
.td-page-sub { color:rgba(255,255,255,0.4); font-size:0.8rem; margin-top:2px; }

/* Attendance summary bar */
.td-att-summary { display:flex; gap:0; margin-bottom:1rem; background:#0a2410; border:1px solid rgba(240,192,0,0.1); border-radius:12px; overflow:hidden; }
.td-att-sum-item { flex:1; padding:0.9rem 0.5rem; text-align:center; border-right:1px solid rgba(240,192,0,0.07); }
.td-att-sum-item:last-child { border-right:none; }

/* Attendance table */
.td-att-table { width:100%; border-collapse:collapse; }
.td-att-table th { padding:0.75rem 1rem; text-align:left; font-size:0.68rem; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:0.8px; border-bottom:1px solid rgba(240,192,0,0.08); background:rgba(10,36,16,0.8); }
.td-att-tr { border-bottom:1px solid rgba(240,192,0,0.05); transition:background 0.15s; }
.td-att-tr:last-child { border-bottom:none; }
.td-att-tr:hover { background:rgba(240,192,0,0.03); }
.td-att-tr--present { background:rgba(52,211,153,0.04); }
.td-att-tr--absent { background:rgba(224,82,82,0.04); }
.td-att-tr--late { background:rgba(240,192,0,0.04); }
.td-att-table td { padding:0.75rem 1rem; vertical-align:middle; }

/* Clickable rows */
.td-clickable-row { cursor:pointer; }
.td-clickable-row:hover { background:rgba(240,192,0,0.04) !important; }

/* Status buttons (legacy) */
.td-status-btns { display:flex; gap:0.35rem; flex-wrap:wrap; }
.td-status-btn { padding:0.28rem 0.6rem; border-radius:6px; border:1px solid transparent; font-size:0.71rem; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; text-transform:capitalize; }
.td-status-btn--present { border-color:rgba(52,211,153,0.2); color:rgba(52,211,153,0.55); background:transparent; }
.td-status-btn--absent  { border-color:rgba(224,82,82,0.2);  color:rgba(224,82,82,0.55);  background:transparent; }
.td-status-btn--late    { border-color:rgba(240,192,0,0.2);   color:rgba(240,192,0,0.55);   background:transparent; }
.td-status-btn--present.active { background:rgba(52,211,153,0.15); color:#34d399; border-color:#34d399; }
.td-status-btn--absent.active  { background:rgba(224,82,82,0.15);  color:#e05252; border-color:#e05252; }
.td-status-btn--late.active    { background:rgba(240,192,0,0.15);   color:#f0c000; border-color:#f0c000; }

/* Fed button */
.td-fed-btn { padding:0.3rem 0.7rem; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:rgba(255,255,255,0.3); font-size:0.75rem; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; white-space:nowrap; }
.td-fed-btn--active { background:rgba(139,196,232,0.12); border-color:#8bc4e8; color:#8bc4e8; }

/* Primary/danger buttons */
.td-btn-primary { padding:0.65rem 1.25rem; border-radius:8px; border:none; background:linear-gradient(135deg,#f0c000,#c89a00); color:#071a0d; font-family:'DM Sans',sans-serif; font-weight:700; font-size:0.875rem; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
.td-btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 18px rgba(240,192,0,0.35); background:linear-gradient(135deg,#ffd200,#f0c000); }
.td-btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
.td-btn-danger { padding:0.65rem 1.25rem; border-radius:8px; background:rgba(224,82,82,0.15); color:#e05252; border:1px solid rgba(224,82,82,0.3); font-family:'DM Sans',sans-serif; font-weight:700; font-size:0.875rem; cursor:pointer; transition:all 0.2s; }
.td-btn-danger:hover { background:rgba(224,82,82,0.25); }

/* Welfare */
.td-welfare-row { padding:0.9rem 1rem; border-radius:10px; border:1px solid transparent; transition:opacity 0.2s; }
.td-welfare-row--low    { background:rgba(240,192,0,0.06);   border-color:rgba(240,192,0,0.18); }
.td-welfare-row--medium { background:rgba(200,120,60,0.06);  border-color:rgba(200,120,60,0.2); }
.td-welfare-row--high   { background:rgba(224,82,82,0.07);   border-color:rgba(224,82,82,0.25); }
.td-welfare-row--resolved { opacity:0.45; }
.td-sev-badge { padding:0.15rem 0.55rem; border-radius:20px; font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.4px; }
.td-sev-badge--low    { background:rgba(240,192,0,0.12);  color:#f0c000; border:1px solid rgba(240,192,0,0.2); }
.td-sev-badge--medium { background:rgba(200,120,60,0.12); color:#c87838; border:1px solid rgba(200,120,60,0.25); }
.td-sev-badge--high   { background:rgba(224,82,82,0.12);  color:#e05252; border:1px solid rgba(224,82,82,0.25); }
.td-resolve-btn { padding:0.2rem 0.65rem; border-radius:6px; border:1px solid rgba(52,211,153,0.25); background:transparent; color:#34d399; font-size:0.72rem; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
.td-resolve-btn:hover { background:rgba(52,211,153,0.1); }
.td-resolved-badge { padding:0.2rem 0.65rem; border-radius:6px; background:rgba(52,211,153,0.1); color:#34d399; font-size:0.72rem; font-weight:700; }

/* Register table */
.td-reg-table { width:100%; border-collapse:collapse; }
.td-reg-table th { padding:0.75rem 1rem; text-align:left; font-size:0.68rem; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:0.8px; border-bottom:1px solid rgba(240,192,0,0.08); background:rgba(10,36,16,0.8); white-space:nowrap; }
.td-reg-tr { border-bottom:1px solid rgba(240,192,0,0.05); transition:background 0.15s; }
.td-reg-tr:last-child { border-bottom:none; }
.td-reg-tr:hover { background:rgba(240,192,0,0.03); }
.td-reg-table td { padding:0.75rem 1rem; vertical-align:middle; }

/* Pills and tags */
.td-status-pill { padding:0.15rem 0.55rem; border-radius:20px; font-size:0.72rem; font-weight:700; text-transform:capitalize; }
.td-tag-warn    { background:rgba(240,192,0,0.1);   color:#f0c000; border:1px solid rgba(240,192,0,0.2);  padding:0.15rem 0.55rem; border-radius:20px; font-size:0.72rem; font-weight:700; }
.td-tag-danger  { background:rgba(224,82,82,0.1);   color:#e05252; border:1px solid rgba(224,82,82,0.2);   padding:0.15rem 0.55rem; border-radius:20px; font-size:0.72rem; font-weight:700; }

/* Family cards */
.td-family-card:hover { transform:translateY(-2px); box-shadow:0 12px 30px rgba(0,0,0,0.4); border-color:rgba(240,192,0,0.3) !important; }

/* Form inputs */
input::placeholder, textarea::placeholder { color:rgba(255,255,255,0.22); }
input:focus, select:focus, textarea:focus { border-color:#f0c000 !important; outline:none; box-shadow:0 0 0 3px rgba(240,192,0,0.12); }
select option { background:#0a2410; color:#fff; }

/* Scrollbar */
::-webkit-scrollbar { width:5px; height:5px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:rgba(240,192,0,0.2); border-radius:10px; }

/* Responsive */
@media (max-width:1100px) { .td-quick-grid { grid-template-columns:repeat(3,1fr); } }
@media (max-width:900px)  { .td-stats-grid { grid-template-columns:repeat(2,1fr); } .td-quick-grid { grid-template-columns:repeat(3,1fr); } }
@media (max-width:640px)  {
  .td-header { height:auto; padding:10px 16px; }
  .td-user-chip { display:none; }
  .td-main { padding:14px; }
  .td-quick-grid { grid-template-columns:repeat(2,1fr); }
  .td-att-table th:nth-child(3),.td-att-table td:nth-child(3) { display:none; }
  .td-reg-table th:nth-child(8),.td-reg-table td:nth-child(8) { display:none; }
}
@media (max-width:400px) {
  .td-signout { display:none; }
  .td-stats-grid { grid-template-columns:1fr 1fr; }
  .td-quick-grid { grid-template-columns:1fr 1fr; }
}
`;