// src/features/dashboard/TeacherDashboard.tsx
// Teacher dashboard — register families, mark attendance, record feeding, flag welfare concerns.

import { useState, useMemo } from 'react';
import ParentRegisterPage from '../auth/ParentRegisterPage';

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

// Keyed by ISO date string e.g. "2026-03-01"
interface DailyAttendanceRecord {
  date: string;
  entries: AttendanceEntry[];
  saved: boolean;
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
const fmtDateLong = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const todayStr = () => new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const todayISO = () => new Date().toISOString().split('T')[0];
const initials = (f: string, l: string) => `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase();
const calcAge  = (dob: string) => Math.max(0, Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)));

const getSundaysInRange = (startISO: string, endISO: string): string[] => {
  const result: string[] = [];
  const d = new Date(startISO + 'T00:00:00');
  const end = new Date(endISO + 'T00:00:00');
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
  while (d <= end) {
    result.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 7);
  }
  return result;
};

const AVATAR_PALETTE = ['#2d6a4f','#1e6091','#6d3e91','#a05c34','#1a6b6b','#8b3a3a','#4a6741','#1a5276','#6e2f8a'];
const PRESET_COLORS: Record<string, string> = {
  k1: '#2d6a4f', k2: '#1e6091', k3: '#6d3e91', k4: '#a05c34',
  k5: '#1a6b6b', k6: '#8b3a3a', k7: '#4a6741',
};
const avatarColor = (id: string, idx: number) => PRESET_COLORS[id] ?? AVATAR_PALETTE[idx % AVATAR_PALETTE.length];

const GRADES = ['Grade R','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7'];

// ─── Initial mock data ─────────────────────────────────────────────────────────
const INITIAL_CHILDREN: Child[] = [
  { id: 'k1', firstName: 'Amara',  lastName: 'Dlamini',  grade: 'Grade 3', dateOfBirth: '2016-03-14', age: 7,  gender: 'female', hasAllergies: true,  allergiesDetails: 'Peanuts',     hasMedicalCondition: false, parentName: 'Nomsa Dlamini',  parentPhone: '+27 82 111 2233', parentEmail: 'parent@demo.church',  attendanceRate: 92, welfareFlags: 0, registeredBy: 'parent' },
  { id: 'k2', firstName: 'Sipho',  lastName: 'Dlamini',  grade: 'Grade 3', dateOfBirth: '2014-07-22', age: 9,  gender: 'male',   hasAllergies: false,                                  hasMedicalCondition: true,  medicalDetails: 'Asthma',   parentName: 'Nomsa Dlamini',  parentPhone: '+27 82 111 2233', parentEmail: 'parent@demo.church',  attendanceRate: 78, welfareFlags: 1, registeredBy: 'parent' },
  { id: 'k3', firstName: 'Lerato', lastName: 'Mokoena',  grade: 'Grade 3', dateOfBirth: '2015-11-08', age: 8,  gender: 'female', hasAllergies: false,                                  hasMedicalCondition: false,                             parentName: 'James Mokoena',  parentPhone: '+27 71 222 3344', parentEmail: 'james@church.co.za',  attendanceRate: 88, welfareFlags: 0, registeredBy: 'parent' },
  { id: 'k4', firstName: 'Thabo',  lastName: 'Sithole',  grade: 'Grade 3', dateOfBirth: '2013-05-17', age: 10, gender: 'male',   hasAllergies: false,                                  hasMedicalCondition: false,                             parentName: 'Grace Sithole',  parentPhone: '+27 83 333 4455', parentEmail: 'grace@church.co.za',  attendanceRate: 95, welfareFlags: 0, registeredBy: 'parent' },
  { id: 'k5', firstName: 'Naledi', lastName: 'Khumalo',  grade: 'Grade 3', dateOfBirth: '2015-09-03', age: 8,  gender: 'female', hasAllergies: true,  allergiesDetails: 'Dairy, eggs', hasMedicalCondition: false,                             parentName: 'Ruth Khumalo',   parentPhone: '+27 72 444 5566', parentEmail: 'ruth@church.co.za',   attendanceRate: 70, welfareFlags: 0, registeredBy: 'parent' },
  { id: 'k6', firstName: 'Kabelo', lastName: 'Mahlangu', grade: 'Grade 3', dateOfBirth: '2014-12-01', age: 9,  gender: 'male',   hasAllergies: false,                                  hasMedicalCondition: false,                             parentName: 'Peter Mahlangu', parentPhone: '+27 84 555 6677', parentEmail: 'peter@church.co.za',  attendanceRate: 83, welfareFlags: 0, registeredBy: 'parent' },
  { id: 'k7', firstName: 'Zintle', lastName: 'Mthembu',  grade: 'Grade 3', dateOfBirth: '2016-01-25', age: 7,  gender: 'female', hasAllergies: false,                                  hasMedicalCondition: false,                             parentName: 'Faith Mthembu',  parentPhone: '+27 73 666 7788', parentEmail: 'faith@church.co.za',  attendanceRate: 60, welfareFlags: 2, registeredBy: 'parent' },
];

const INITIAL_WELFARE: WelfareFlag[] = [
  { id: 'w1', childId: 'k2', childName: 'Sipho Dlamini',  concern: 'Child appeared withdrawn and had visible bruising on left arm.', severity: 'high',   date: '2026-03-01', resolved: false },
  { id: 'w2', childId: 'k7', childName: 'Zintle Mthembu', concern: 'Child mentioned not eating at home. Appears underweight.',         severity: 'medium', date: '2026-02-23', resolved: false },
  { id: 'w3', childId: 'k7', childName: 'Zintle Mthembu', concern: 'Arrived in dirty clothing for second week in a row.',               severity: 'low',    date: '2026-02-16', resolved: true  },
];

// Mock historical attendance for the report (past Sundays)
const MOCK_HISTORICAL: DailyAttendanceRecord[] = [
  {
    date: '2026-02-02', saved: true,
    entries: [
      { childId: 'k1', status: 'present', fed: true  },
      { childId: 'k2', status: 'present', fed: true  },
      { childId: 'k3', status: 'present', fed: true  },
      { childId: 'k4', status: 'present', fed: true  },
      { childId: 'k5', status: 'absent',  fed: false },
      { childId: 'k6', status: 'present', fed: true  },
      { childId: 'k7', status: 'absent',  fed: false },
    ],
  },
  {
    date: '2026-02-09', saved: true,
    entries: [
      { childId: 'k1', status: 'present', fed: true  },
      { childId: 'k2', status: 'late',    fed: true  },
      { childId: 'k3', status: 'present', fed: true  },
      { childId: 'k4', status: 'present', fed: true  },
      { childId: 'k5', status: 'present', fed: true  },
      { childId: 'k6', status: 'absent',  fed: false },
      { childId: 'k7', status: 'absent',  fed: false },
    ],
  },
  {
    date: '2026-02-16', saved: true,
    entries: [
      { childId: 'k1', status: 'present', fed: true  },
      { childId: 'k2', status: 'absent',  fed: false },
      { childId: 'k3', status: 'present', fed: true  },
      { childId: 'k4', status: 'present', fed: true  },
      { childId: 'k5', status: 'present', fed: true  },
      { childId: 'k6', status: 'present', fed: true  },
      { childId: 'k7', status: 'late',    fed: true  },
    ],
  },
  {
    date: '2026-02-23', saved: true,
    entries: [
      { childId: 'k1', status: 'present', fed: true  },
      { childId: 'k2', status: 'present', fed: true  },
      { childId: 'k3', status: 'absent',  fed: false },
      { childId: 'k4', status: 'present', fed: true  },
      { childId: 'k5', status: 'absent',  fed: false },
      { childId: 'k6', status: 'present', fed: true  },
      { childId: 'k7', status: 'absent',  fed: false },
    ],
  },
];

// ─── Shared inline style constants ────────────────────────────────────────────
const FL: React.CSSProperties = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', letterSpacing: '0.2px' };
const FI: React.CSSProperties = { width: '100%', padding: '0.72rem 0.9rem', borderRadius: '9px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: '0.9rem', outline: 'none', colorScheme: 'dark' as any };
const FE: React.CSSProperties = { fontSize: '0.72rem', color: '#f87171', marginTop: '0.3rem', display: 'block' };

const BTN_BLUE: React.CSSProperties  = { width: '100%', padding: '0.8rem', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg,#60a5fa,#2563eb)', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' };
const BTN_GHOST: React.CSSProperties = { padding: '0.8rem 1.25rem', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.55)', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' };

// ─── Main Dashboard ────────────────────────────────────────────────────────────
type Tab = 'overview' | 'attendance' | 'welfare' | 'register' | 'families' | 'report';

export default function TeacherDashboard({
  user = { name: 'Thabo Mokoena', email: 'teacher@demo.church', phone: '+27 73 444 5566', role: 'teacher' },
  onLogout,
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [children,  setChildren]  = useState<Child[]>(INITIAL_CHILDREN);
  const [showRegisterFamily, setShowRegisterFamily] = useState(false);

  // All historical attendance records keyed by date
  const [attendanceHistory, setAttendanceHistory] = useState<DailyAttendanceRecord[]>(MOCK_HISTORICAL);

  // Currently selected date for the attendance tab
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  // Attendance filter
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'unmarked'>('all');
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // Welfare state
  const [welfare,       setWelfare]       = useState<WelfareFlag[]>(INITIAL_WELFARE);
  const [welfareForm,   setWelfareForm]   = useState({ childId: '', concern: '', severity: 'medium' as 'low'|'medium'|'high' });
  const [welfareErrors, setWelfareErrors] = useState<Record<string,string>>({});
  const [welfareSaved,  setWelfareSaved]  = useState(false);

  // Report state
  const [reportStartDate, setReportStartDate] = useState('2026-02-01');
  const [reportEndDate,   setReportEndDate]   = useState(todayISO());

  // ── Get or create record for selected date ────────────────────────────────
  const getCurrentRecord = (date: string): DailyAttendanceRecord => {
    const existing = attendanceHistory.find(r => r.date === date);
    if (existing) return existing;
    return {
      date,
      saved: false,
      entries: children.map(c => ({ childId: c.id, status: null, fed: false })),
    };
  };

  const currentRecord = useMemo(() => getCurrentRecord(selectedDate), [selectedDate, attendanceHistory, children]);

  const currentEntries: AttendanceEntry[] = useMemo(() => {
    const entries = [...currentRecord.entries];
    children.forEach(c => {
      if (!entries.find(e => e.childId === c.id)) {
        entries.push({ childId: c.id, status: null, fed: false });
      }
    });
    return entries;
  }, [currentRecord, children]);

  const isDateSaved = currentRecord.saved;

  // ── Attendance helpers ────────────────────────────────────────────────────
  const updateEntry = (childId: string, update: Partial<AttendanceEntry>) => {
    setAttendanceHistory(prev => {
      const idx = prev.findIndex(r => r.date === selectedDate);
      const newEntries = currentEntries.map(e =>
        e.childId === childId ? { ...e, ...update } : e
      );
      const newRecord: DailyAttendanceRecord = { date: selectedDate, saved: false, entries: newEntries };
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newRecord;
        return updated;
      }
      return [...prev, newRecord];
    });
    setAttendanceSaved(false);
  };

  const setStatus = (childId: string, status: 'present'|'absent'|'late') => updateEntry(childId, { status });
  const toggleFed = (childId: string) => {
    const entry = currentEntries.find(e => e.childId === childId);
    updateEntry(childId, { fed: !entry?.fed });
  };

  const presentCount = currentEntries.filter(a => a.status === 'present').length;
  const absentCount  = currentEntries.filter(a => a.status === 'absent').length;
  const lateCount    = currentEntries.filter(a => a.status === 'late').length;
  const fedCount     = currentEntries.filter(a => a.fed).length;
  const unmarked     = currentEntries.filter(a => a.status === null).length;

  const filteredChildren = useMemo(() => {
    if (attendanceFilter === 'all') return children;
    return children.filter(c => {
      const entry = currentEntries.find(e => e.childId === c.id);
      if (attendanceFilter === 'unmarked') return !entry?.status;
      return entry?.status === attendanceFilter;
    });
  }, [children, currentEntries, attendanceFilter]);

  const saveAttendance = () => {
    if (unmarked > 0) return;
    setAttendanceHistory(prev => {
      const idx = prev.findIndex(r => r.date === selectedDate);
      const savedRecord = { ...currentRecord, entries: currentEntries, saved: true };
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedRecord;
        return updated;
      }
      return [...prev, savedRecord];
    });
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

  // ── Report calculations ───────────────────────────────────────────────────
  const reportData = useMemo(() => {
    const sundays = getSundaysInRange(reportStartDate, reportEndDate);
    const savedSundays = sundays.filter(s => attendanceHistory.find(r => r.date === s && r.saved));

    const sundayStats = savedSundays.map(date => {
      const rec = attendanceHistory.find(r => r.date === date)!;
      const total   = rec.entries.length;
      const present = rec.entries.filter(e => e.status === 'present' || e.status === 'late').length;
      const absent  = rec.entries.filter(e => e.status === 'absent').length;
      const fed     = rec.entries.filter(e => e.fed).length;
      return { date, total, present, absent, fed, pct: total ? Math.round((present / total) * 100) : 0 };
    });

    const childStats = children.map(c => {
      const attended = savedSundays.filter(date => {
        const rec = attendanceHistory.find(r => r.date === date);
        const entry = rec?.entries.find(e => e.childId === c.id);
        return entry?.status === 'present' || entry?.status === 'late';
      }).length;
      const pct = savedSundays.length ? Math.round((attended / savedSundays.length) * 100) : 0;
      return { child: c, attended, total: savedSundays.length, pct };
    }).sort((a, b) => b.pct - a.pct);

    const avgPct = sundayStats.length
      ? Math.round(sundayStats.reduce((s, r) => s + r.pct, 0) / sundayStats.length)
      : 0;

    return { sundays, savedSundays, sundayStats, childStats, avgPct };
  }, [reportStartDate, reportEndDate, attendanceHistory, children]);

  const openWelfare   = welfare.filter(w => !w.resolved).length;
  const avgAttendance = children.length
    ? Math.round(children.reduce((s, c) => s + c.attendanceRate, 0) / children.length)
    : 0;

  // ── Register Family: use ParentRegisterPage ───────────────────────────────
  if (showRegisterFamily) {
    return (
      <ParentRegisterPage
        onBack={() => setShowRegisterFamily(false)}
        onLoginInstead={() => setShowRegisterFamily(false)}
        onSuccess={() => {
          setShowRegisterFamily(false);
          setActiveTab('families');
        }}
      />
    );
  }

  return (
    <>
      <style>{CSS}</style>
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
            { id: 'report',     label: '📊 Attendance Report' },
          ] as const).map(tab => (
            <button key={tab.id} className={`td-tab${activeTab === tab.id ? ' td-tab--active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── Main ── */}
        <main className="td-main">
          <div className="td-content">

            {/* ══ OVERVIEW ══ */}
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
                    { icon:'👶', label:'Class Size',      value: children.length,                                                     color:'#60a5fa' },
                    { icon:'📅', label:'Avg Attendance',  value: `${avgAttendance}%`,                                                 color:'#34d399' },
                    { icon:'🚨', label:'Open Welfare',    value: openWelfare,   color: openWelfare > 0 ? '#f87171' : '#34d399' },
                    { icon:'⚠',  label:'Medical/Allergy', value: children.filter(c => c.hasAllergies || c.hasMedicalCondition).length, color:'#fbbf24' },
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
                      { icon:'📊', label:'Attendance Report',   sub:'View trends over time',                                tab:'report'     as Tab, urgent: false },
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

            {/* ══ ATTENDANCE & FEEDING ══ */}
            {activeTab === 'attendance' && (
              <div className="td-fade">
                <div className="td-page-header">
                  <div>
                    <div className="td-page-title">Attendance & Feeding</div>
                    <div className="td-page-sub">Grade 3 · Mark attendance for each Sunday session</div>
                  </div>
                  <button
                    className="td-btn-primary"
                    onClick={saveAttendance}
                    disabled={unmarked > 0 || isDateSaved}
                    title={unmarked > 0 ? `${unmarked} children still unmarked` : isDateSaved ? 'Already saved' : ''}
                  >
                    {isDateSaved ? '✓ Register Saved' : attendanceSaved ? '✓ Saved!' : unmarked > 0 ? `Save (${unmarked} remaining)` : 'Save Register'}
                  </button>
                </div>

                {/* Date selector card */}
                <div className="td-card" style={{ marginBottom: '1rem', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <label style={{ ...FL, marginBottom: '0.3rem' }}>📅 Select Sunday Date</label>
                      <input
                        type="date"
                        style={{ ...FI, maxWidth: 220 }}
                        value={selectedDate}
                        onChange={e => { setSelectedDate(e.target.value); setAttendanceFilter('all'); setAttendanceSaved(false); }}
                        max={todayISO()}
                      />
                    </div>
                    <div style={{ flexShrink: 0, paddingBottom: '0.05rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>{fmtDateLong(selectedDate)}</div>
                      {isDateSaved
                        ? <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', padding: '0.2rem 0.65rem', borderRadius: 20 }}>✓ Register saved</span>
                        : <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', padding: '0.2rem 0.65rem', borderRadius: 20 }}>⏳ Not yet saved</span>
                      }
                    </div>
                    {/* Quick Sunday nav */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingBottom: '0.05rem' }}>
                      {[0, 7, 14, 21].map(daysAgo => {
                        const d = new Date();
                        d.setDate(d.getDate() - daysAgo);
                        while (d.getDay() !== 0) d.setDate(d.getDate() - 1);
                        const iso = d.toISOString().split('T')[0];
                        const label = daysAgo === 0 ? 'This Sunday' : `${daysAgo / 7}w ago`;
                        return (
                          <button key={iso} onClick={() => { setSelectedDate(iso); setAttendanceFilter('all'); }}
                            style={{
                              padding: '0.3rem 0.7rem', borderRadius: 7, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                              fontFamily: "'DM Sans',sans-serif",
                              border: selectedDate === iso ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
                              background: selectedDate === iso ? 'rgba(96,165,250,0.15)' : 'transparent',
                              color: selectedDate === iso ? '#60a5fa' : 'rgba(255,255,255,0.4)',
                              transition: 'all 0.15s',
                            }}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
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

                {/* Filter bar */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginRight: '0.25rem' }}>Filter:</span>
                  {(['all', 'present', 'absent', 'late', 'unmarked'] as const).map(f => {
                    const colors: Record<string, string> = { all: '#60a5fa', present: '#34d399', absent: '#f87171', late: '#fbbf24', unmarked: 'rgba(255,255,255,0.4)' };
                    const count = f === 'all' ? children.length : f === 'unmarked' ? unmarked : currentEntries.filter(e => e.status === f).length;
                    return (
                      <button key={f} onClick={() => setAttendanceFilter(f)} style={{
                        padding: '0.28rem 0.75rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                        fontFamily: "'DM Sans',sans-serif", textTransform: 'capitalize',
                        border: `1px solid ${attendanceFilter === f ? colors[f] : 'rgba(255,255,255,0.1)'}`,
                        background: attendanceFilter === f ? `${colors[f]}18` : 'transparent',
                        color: attendanceFilter === f ? colors[f] : 'rgba(255,255,255,0.35)',
                        transition: 'all 0.15s',
                      }}>
                        {f} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Lock notice */}
                {isDateSaved && (
                  <div style={{ padding: '0.7rem 1rem', borderRadius: 9, background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)', fontSize: '0.8rem', color: '#34d399', marginBottom: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span>🔒</span>
                    <span>This register has been saved and is locked. Viewing read-only record for {fmtDateLong(selectedDate)}.</span>
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
                      {filteredChildren.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '2rem', fontSize: '0.85rem' }}>
                            No children match this filter.
                          </td>
                        </tr>
                      ) : filteredChildren.map((child, idx) => {
                        const entry = currentEntries.find(a => a.childId === child.id) ?? { childId: child.id, status: null, fed: false };
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
                              {isDateSaved ? (
                                <span className="td-status-pill" style={{
                                  background: entry.status === 'present' ? 'rgba(52,211,153,0.15)' : entry.status === 'absent' ? 'rgba(248,113,113,0.15)' : entry.status === 'late' ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)',
                                  color: entry.status === 'present' ? '#34d399' : entry.status === 'absent' ? '#f87171' : entry.status === 'late' ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                                  border: `1px solid ${entry.status === 'present' ? '#34d39940' : entry.status === 'absent' ? '#f8717140' : entry.status === 'late' ? '#fbbf2440' : 'rgba(255,255,255,0.1)'}`,
                                  padding: '0.3rem 0.75rem', borderRadius: 20, fontWeight: 700, textTransform: 'capitalize',
                                }}>
                                  {entry.status ?? '—'}
                                </span>
                              ) : (
                                <div className="td-status-btns">
                                  {(['present','absent','late'] as const).map(s => (
                                    <button key={s} className={`td-status-btn td-status-btn--${s}${entry.status === s ? ' active' : ''}`} onClick={() => setStatus(child.id, s)}>
                                      {s === 'present' ? '✓' : s === 'absent' ? '✗' : '~'} {s}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td>
                              {isDateSaved ? (
                                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: entry.fed ? '#60a5fa' : 'rgba(255,255,255,0.25)' }}>
                                  {entry.fed ? '🍽 Fed' : '— Not fed'}
                                </span>
                              ) : (
                                <button className={`td-fed-btn${entry.fed ? ' td-fed-btn--active' : ''}`} onClick={() => toggleFed(child.id)}>
                                  {entry.fed ? '🍽 Fed' : '— Not fed'}
                                </button>
                              )}
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
                      { label:'Fed Today',     value: fedCount,                                                           color:'#60a5fa' },
                      { label:'Not Fed',       value: children.length - fedCount,                                        color:'rgba(255,255,255,0.3)' },
                      { label:'Present + Fed', value: currentEntries.filter(a => a.status === 'present' && a.fed).length, color:'#34d399' },
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

            {/* ══ WELFARE ══ */}
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
                      <textarea style={{ ...WI, minHeight:90, resize:'vertical' } as any} placeholder="Describe what you observed..." value={welfareForm.concern} onChange={e => setWelfareForm(f => ({ ...f, concern: e.target.value }))} />
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

            {/* ══ CLASS REGISTER ══ */}
            {activeTab === 'register' && (
              <div className="td-fade">
                <div className="td-page-header">
                  <div>
                    <div className="td-page-title">Class Register</div>
                    <div className="td-page-sub">Grade 3 · {children.length} children registered</div>
                  </div>
                  <button className="td-btn-primary" onClick={() => setShowRegisterFamily(true)}>+ Register Family</button>
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
                        const entry = currentEntries.find(a => a.childId === child.id);
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

            {/* ══ REGISTER FAMILY ══ */}
            {activeTab === 'families' && (
              <div className="td-fade">
                <div className="td-page-header">
                  <div>
                    <div className="td-page-title">Register Family</div>
                    <div className="td-page-sub">Register a child and their guardian on a parent's behalf</div>
                  </div>
                  <button className="td-btn-primary" onClick={() => setShowRegisterFamily(true)}>+ Register New Family</button>
                </div>

                <div style={{ padding:'14px 18px', borderRadius:12, background:'rgba(96,165,250,0.07)', border:'1px solid rgba(96,165,250,0.2)', marginBottom:'1.25rem', display:'flex', gap:'0.85rem', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'1.3rem', flexShrink:0 }}>ℹ️</span>
                  <div>
                    <div style={{ fontWeight:700, color:'#60a5fa', fontSize:'0.875rem', marginBottom:4 }}>Teacher-Assisted Registration</div>
                    <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>
                      As a teacher you can register families on behalf of parents who don't have access to a device. Clicking "Register New Family" opens the full parent registration form. All data is collected in compliance with POPIA.
                    </div>
                  </div>
                </div>

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

            {/* ══ ATTENDANCE REPORT ══ */}
            {activeTab === 'report' && (
              <div className="td-fade">
                <div className="td-page-header">
                  <div>
                    <div className="td-page-title">Attendance Report</div>
                    <div className="td-page-sub">Track attendance percentage over time · Grade 3</div>
                  </div>
                </div>

                {/* Date range picker */}
                <div className="td-card" style={{ marginBottom: '1rem', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <label style={{ ...FL, marginBottom: '0.3rem' }}>From Date</label>
                      <input type="date" style={{ ...FI, maxWidth: 180 }} value={reportStartDate}
                        onChange={e => setReportStartDate(e.target.value)} max={reportEndDate} />
                    </div>
                    <div>
                      <label style={{ ...FL, marginBottom: '0.3rem' }}>To Date</label>
                      <input type="date" style={{ ...FI, maxWidth: 180 }} value={reportEndDate}
                        onChange={e => setReportEndDate(e.target.value)} min={reportStartDate} max={todayISO()} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '0.05rem' }}>
                      {[
                        { label: 'Last 4 weeks', weeks: 4 },
                        { label: 'Last 8 weeks', weeks: 8 },
                        { label: 'Last 3 months', weeks: 13 },
                      ].map(({ label, weeks }) => (
                        <button key={label} onClick={() => {
                          const end = new Date();
                          const start = new Date();
                          start.setDate(start.getDate() - weeks * 7);
                          setReportStartDate(start.toISOString().split('T')[0]);
                          setReportEndDate(end.toISOString().split('T')[0]);
                        }} style={{
                          padding: '0.5rem 0.85rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                          cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                          border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(96,165,250,0.07)', color: '#60a5fa', transition: 'all 0.15s',
                        }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary stats */}
                <div className="td-stats-grid" style={{ marginBottom: '1rem' }}>
                  {[
                    { icon: '📅', label: 'Sundays in Range',  value: reportData.sundays.length,       color: '#60a5fa' },
                    { icon: '✅', label: 'Sessions Recorded', value: reportData.savedSundays.length,  color: '#34d399' },
                    { icon: '📊', label: 'Avg Attendance',    value: `${reportData.avgPct}%`,          color: reportData.avgPct >= 80 ? '#34d399' : reportData.avgPct >= 60 ? '#fbbf24' : '#f87171' },
                    { icon: '👶', label: 'Children Tracked',  value: children.length,                 color: '#a78bfa' },
                  ].map(s => (
                    <div key={s.label} className="td-stat-card">
                      <div className="td-stat-icon">{s.icon}</div>
                      <div className="td-stat-value" style={{ color: s.color }}>{s.value}</div>
                      <div className="td-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div className="td-card" style={{ marginBottom: '1rem' }}>
                  <div className="td-card-title" style={{ marginBottom: '1.25rem' }}>📈 Attendance % Per Sunday</div>
                  {reportData.sundayStats.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '2rem 0', fontSize: '0.85rem' }}>
                      No saved attendance records in this date range.
                    </div>
                  ) : (
                    <div>
                      <div style={{ position: 'relative', height: 180, marginBottom: '0.5rem' }}>
                        {[0, 25, 50, 75, 100].map(pct => (
                          <div key={pct} style={{
                            position: 'absolute', left: 0, right: 0, bottom: `${pct}%`, height: 1,
                            background: pct === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)', zIndex: 0,
                          }}>
                            <span style={{ position: 'absolute', left: 0, top: -8, fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{pct}%</span>
                          </div>
                        ))}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: '0.35rem', paddingLeft: 28 }}>
                          {reportData.sundayStats.map(s => {
                            const barColor = s.pct >= 80 ? '#34d399' : s.pct >= 60 ? '#fbbf24' : '#f87171';
                            return (
                              <div key={s.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '0.62rem', color: barColor, fontWeight: 700 }}>{s.pct}%</span>
                                <div style={{
                                  width: '100%', borderRadius: '4px 4px 0 0',
                                  background: `linear-gradient(to top, ${barColor}cc, ${barColor}66)`,
                                  height: `${Math.max(s.pct, 3)}%`, transition: 'height 0.5s ease',
                                  minHeight: 4, border: `1px solid ${barColor}40`,
                                }} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem', paddingLeft: 28 }}>
                        {reportData.sundayStats.map(s => (
                          <div key={s.date} style={{ flex: 1, textAlign: 'center', fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {new Date(s.date + 'T00:00:00').toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                        {[{ color: '#34d399', label: '≥80% Good' }, { color: '#fbbf24', label: '60-79% Fair' }, { color: '#f87171', label: '<60% Low' }].map(l => (
                          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                            {l.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sunday detail table */}
                {reportData.sundayStats.length > 0 && (
                  <div className="td-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1rem' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="td-card-title">Sunday-by-Sunday Detail</div>
                    </div>
                    <table className="td-reg-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Present / Total</th>
                          <th>Absent</th>
                          <th>🍽 Fed</th>
                          <th>Attendance %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.sundayStats.map(s => {
                          const color = s.pct >= 80 ? '#34d399' : s.pct >= 60 ? '#fbbf24' : '#f87171';
                          return (
                            <tr key={s.date} className="td-reg-tr">
                              <td style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>
                                {new Date(s.date + 'T00:00:00').toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>{s.present} / {s.total}</td>
                              <td style={{ color: '#f87171', fontSize: '0.85rem' }}>{s.absent}</td>
                              <td style={{ color: '#60a5fa', fontSize: '0.85rem' }}>{s.fed}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', minWidth: 60 }}>
                                    <div style={{ height: '100%', width: `${s.pct}%`, background: color, borderRadius: 3 }} />
                                  </div>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color, minWidth: 36, textAlign: 'right' }}>{s.pct}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Per-child breakdown */}
                <div className="td-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="td-card-title">Per-Child Attendance Breakdown</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                      Based on {reportData.savedSundays.length} recorded session{reportData.savedSundays.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {reportData.savedSundays.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '2rem', fontSize: '0.85rem' }}>
                      No recorded sessions in this date range.
                    </div>
                  ) : (
                    <table className="td-reg-table">
                      <thead>
                        <tr>
                          <th>Child</th>
                          <th>Attended</th>
                          <th>Missed</th>
                          <th>Attendance %</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.childStats.map((cs, idx) => {
                          const color = cs.pct >= 80 ? '#34d399' : cs.pct >= 60 ? '#fbbf24' : '#f87171';
                          const statusLabel = cs.pct >= 80 ? 'Good' : cs.pct >= 60 ? 'Fair' : cs.pct > 0 ? 'At Risk' : 'No Data';
                          return (
                            <tr key={cs.child.id} className="td-reg-tr">
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                  <div className="td-avatar-xs" style={{ background: avatarColor(cs.child.id, idx) }}>
                                    {initials(cs.child.firstName, cs.child.lastName)}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>{cs.child.firstName} {cs.child.lastName}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{cs.child.parentName}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>{cs.attended}</td>
                              <td style={{ color: '#f87171', fontSize: '0.85rem' }}>{cs.total - cs.attended}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                  <div style={{ width: 80, height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${cs.pct}%`, background: color, borderRadius: 4 }} />
                                  </div>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{cs.pct}%</span>
                                </div>
                              </td>
                              <td>
                                <span style={{
                                  fontSize: '0.68rem', fontWeight: 700, padding: '0.18rem 0.55rem', borderRadius: 20,
                                  color, background: `${color}15`, border: `1px solid ${color}30`,
                                }}>
                                  {statusLabel}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}

// ─── Welfare form style constants ─────────────────────────────────────────────
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
.td-tab-nav { width:100%; display:flex; background:rgba(255,255,255,0.015); border-bottom:1px solid rgba(255,255,255,0.06); overflow-x:auto; scrollbar-width:none; flex-shrink:0; padding:0 clamp(16px,3vw,40px); }
.td-tab-nav::-webkit-scrollbar { display:none; }
.td-tab { flex-shrink:0; padding:0 clamp(10px,1.5vw,20px); height:48px; display:flex; align-items:center; background:none; border:none; color:rgba(255,255,255,0.45); font-family:'DM Sans',sans-serif; font-size:0.83rem; font-weight:600; cursor:pointer; transition:all 0.2s; white-space:nowrap; border-bottom:2px solid transparent; }
.td-tab:hover   { color:rgba(255,255,255,0.75); }
.td-tab--active { color:#60a5fa !important; border-bottom-color:#60a5fa; }
.td-main    { flex:1; width:100%; overflow-y:auto; padding:clamp(16px,2.5vw,36px) clamp(16px,3vw,40px); }
.td-content { width:100%; }
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
.td-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0.85rem; margin-bottom:1.25rem; }
.td-stat-card  { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:1rem; text-align:center; }
.td-stat-icon  { font-size:1.5rem; margin-bottom:6px; }
.td-stat-value { font-family:'Bebas Neue',sans-serif; font-size:1.9rem; line-height:1; }
.td-stat-label { font-size:0.68rem; color:rgba(255,255,255,0.4); font-weight:600; margin-top:4px; text-transform:uppercase; letter-spacing:0.5px; }
.td-card       { background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.065); border-radius:14px; padding:clamp(14px,2vw,24px); margin-bottom:1.25rem; }
.td-card-title { font-family:'Bebas Neue',sans-serif; font-size:1rem; letter-spacing:1.5px; color:#60a5fa; margin-bottom:0; }
.td-quick-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:0.7rem; margin-top:0.85rem; }
.td-quick-btn  { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:0.9rem 0.4rem; text-align:center; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
.td-quick-btn:hover { background:rgba(96,165,250,0.06); border-color:rgba(96,165,250,0.2); }
.td-quick-btn--urgent { border-color:rgba(251,191,36,0.3); background:rgba(251,191,36,0.05); }
.td-quick-icon  { font-size:1.4rem; margin-bottom:5px; }
.td-quick-label { font-size:0.76rem; font-weight:700; color:#fff; margin-bottom:2px; }
.td-quick-sub   { font-size:0.65rem; color:rgba(255,255,255,0.35); }
.td-alert-row { display:flex; align-items:flex-start; gap:0.75rem; padding:0.75rem 0.9rem; border-radius:9px; background:rgba(251,191,36,0.05); border:1px solid rgba(251,191,36,0.15); margin-bottom:0.5rem; }
.td-avatar-xs { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:700; color:#fff; flex-shrink:0; }
.td-page-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.25rem; }
.td-page-title  { font-family:'Bebas Neue',sans-serif; font-size:1.6rem; color:#fff; letter-spacing:1px; }
.td-page-sub    { color:rgba(255,255,255,0.4); font-size:0.8rem; margin-top:2px; }
.td-att-summary { display:flex; gap:0; margin-bottom:1rem; background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.065); border-radius:12px; overflow:hidden; }
.td-att-sum-item { flex:1; padding:0.9rem 0.5rem; text-align:center; border-right:1px solid rgba(255,255,255,0.05); }
.td-att-sum-item:last-child { border-right:none; }
.td-att-table   { width:100%; border-collapse:collapse; }
.td-att-table th { padding:0.75rem 1rem; text-align:left; font-size:0.68rem; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:0.8px; border-bottom:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.02); }
.td-att-tr      { border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.15s; }
.td-att-tr:last-child { border-bottom:none; }
.td-att-tr:hover { background:rgba(255,255,255,0.02); }
.td-att-tr--present { background:rgba(52,211,153,0.03); }
.td-att-tr--absent  { background:rgba(248,113,113,0.03); }
.td-att-tr--late    { background:rgba(251,191,36,0.03); }
.td-att-table td { padding:0.75rem 1rem; vertical-align:middle; }
.td-status-btns { display:flex; gap:0.35rem; flex-wrap:wrap; }
.td-status-btn  { padding:0.28rem 0.6rem; border-radius:6px; border:1px solid transparent; font-size:0.71rem; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; text-transform:capitalize; }
.td-status-btn--present { border-color:rgba(52,211,153,0.2);  color:rgba(52,211,153,0.55);  background:transparent; }
.td-status-btn--absent  { border-color:rgba(248,113,113,0.2); color:rgba(248,113,113,0.55); background:transparent; }
.td-status-btn--late    { border-color:rgba(251,191,36,0.2);  color:rgba(251,191,36,0.55);  background:transparent; }
.td-status-btn--present.active { background:rgba(52,211,153,0.15);  color:#34d399;  border-color:#34d399; }
.td-status-btn--absent.active  { background:rgba(248,113,113,0.15); color:#f87171; border-color:#f87171; }
.td-status-btn--late.active    { background:rgba(251,191,36,0.15);  color:#fbbf24;  border-color:#fbbf24; }
.td-fed-btn { padding:0.3rem 0.7rem; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:rgba(255,255,255,0.3); font-size:0.75rem; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; white-space:nowrap; }
.td-fed-btn--active { background:rgba(96,165,250,0.12); border-color:#60a5fa; color:#60a5fa; }
.td-btn-primary { padding:0.65rem 1.25rem; border-radius:8px; border:none; background:linear-gradient(135deg,#60a5fa,#2563eb); color:#fff; font-family:'DM Sans',sans-serif; font-weight:700; font-size:0.875rem; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
.td-btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 18px rgba(96,165,250,0.35); }
.td-btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
.td-btn-danger  { padding:0.65rem 1.25rem; border-radius:8px; background:rgba(248,113,113,0.15); color:#f87171; border:1px solid rgba(248,113,113,0.3); font-family:'DM Sans',sans-serif; font-weight:700; font-size:0.875rem; cursor:pointer; transition:all 0.2s; }
.td-btn-danger:hover { background:rgba(248,113,113,0.25); }
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
.td-reg-table   { width:100%; border-collapse:collapse; }
.td-reg-table th { padding:0.75rem 1rem; text-align:left; font-size:0.68rem; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:0.8px; border-bottom:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.02); white-space:nowrap; }
.td-reg-tr      { border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.15s; }
.td-reg-tr:last-child { border-bottom:none; }
.td-reg-tr:hover { background:rgba(255,255,255,0.02); }
.td-reg-table td { padding:0.75rem 1rem; vertical-align:middle; }
.td-status-pill { padding:0.15rem 0.55rem; border-radius:20px; font-size:0.72rem; font-weight:700; text-transform:capitalize; }
.td-tag-warn    { background:rgba(251,191,36,0.1);  color:#fbbf24; border:1px solid rgba(251,191,36,0.2);  padding:0.15rem 0.55rem; border-radius:20px; font-size:0.72rem; font-weight:700; }
.td-tag-danger  { background:rgba(248,113,113,0.1); color:#f87171; border:1px solid rgba(248,113,113,0.2); padding:0.15rem 0.55rem; border-radius:20px; font-size:0.72rem; font-weight:700; }
input::placeholder, textarea::placeholder { color:rgba(255,255,255,0.22); }
input:focus, select:focus, textarea:focus  { border-color:#60a5fa !important; outline:none; box-shadow:0 0 0 3px rgba(96,165,250,0.12); }
select option { background:#04091e; color:#fff; }
@media (max-width:1100px) { .td-quick-grid { grid-template-columns:repeat(3,1fr); } }
@media (max-width:900px)  { .td-stats-grid { grid-template-columns:repeat(2,1fr); } .td-quick-grid { grid-template-columns:repeat(3,1fr); } }
@media (max-width:640px)  { .td-header { height:auto; padding:10px 16px; } .td-user-chip { display:none; } .td-main { padding:14px; } .td-quick-grid { grid-template-columns:repeat(2,1fr); } .td-att-table th:nth-child(3),.td-att-table td:nth-child(3) { display:none; } .td-reg-table th:nth-child(8),.td-reg-table td:nth-child(8) { display:none; } }
@media (max-width:400px)  { .td-signout { display:none; } .td-stats-grid { grid-template-columns:1fr 1fr; } .td-quick-grid { grid-template-columns:1fr 1fr; } }
`;