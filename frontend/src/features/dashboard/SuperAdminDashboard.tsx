// src/features/dashboard/SuperAdminDashboard.tsx
import { useState, useMemo } from 'react';
import { userStore } from '../../stores/userStore';
import { childStore, type StoredChild } from '../../stores/childStore';

interface Props {
  adminName?: string;
  adminPosition?: string;
  onLogout: () => void;
  onRegisterChild?: () => void;
}

type Tab = 'overview' | 'teachers' | 'family' | 'children' | 'welfare' | 'reports' | 'settings';

interface WelfareFlag {
  id: string; childName: string; concern: string;
  severity: 'low' | 'medium' | 'high'; date: string; resolved: boolean;
  flaggedBy: string;
}

interface FamilyRecord {
  id: string; name: string; email: string; phone: string;
  children: number; consentComplete: boolean; lastActive: string;
  address?: string; relationship?: string;
}

const MOCK_WELFARE: WelfareFlag[] = [
  { id:'w1', childName:'Sipho Dlamini',  concern:'Child arrived with visible bruising on arm. Parent unavailable for comment.', severity:'high',   date:'2026-02-23', resolved:false, flaggedBy:'Teacher Mokoena' },
  { id:'w2', childName:'Naledi Khumalo', concern:'Child has not eaten at home before arriving. Appearing underweight.', severity:'medium', date:'2026-03-02', resolved:false, flaggedBy:'Teacher Sithole' },
  { id:'w3', childName:'Naledi Khumalo', concern:'Parent has not signed medical consent. Follow-up required.', severity:'low', date:'2026-02-16', resolved:true,  flaggedBy:'Admin' },
  { id:'w4', childName:'Zanele Nkosi',   concern:'Child missed 3 consecutive Sundays. No communication from parent.', severity:'medium', date:'2026-01-19', resolved:false, flaggedBy:'Teacher Dlamini' },
  { id:'w5', childName:'Zanele Nkosi',   concern:'Child disclosed feeling unsafe at home during session.', severity:'high', date:'2026-02-09', resolved:false, flaggedBy:'Teacher Dlamini' },
  { id:'w6', childName:'Zanele Nkosi',   concern:'Medication not brought to session — spoke to parent.', severity:'low', date:'2026-03-02', resolved:true,  flaggedBy:'Teacher Mokoena' },
];

const MOCK_FAMILIES: FamilyRecord[] = [
  { id:'p1', name:'Nomsa Dlamini',   email:'nomsa@demo.church',   phone:'+27821112233', children:2, consentComplete:true,  lastActive:'2026-03-02', address:'14 Jacaranda St, Soweto',     relationship:'Mother' },
  { id:'p2', name:'James Mokoena',   email:'james@church.co.za',  phone:'+27712223344', children:1, consentComplete:true,  lastActive:'2026-03-02', address:'8 Protea Ave, Tembisa',        relationship:'Father' },
  { id:'p3', name:'Grace Sithole',   email:'grace@church.co.za',  phone:'+27833334455', children:1, consentComplete:true,  lastActive:'2026-02-23', address:'22 Bougainvillea Rd, Sandton',  relationship:'Mother' },
  { id:'p4', name:'Ruth Khumalo',    email:'ruth@church.co.za',   phone:'+27724445566', children:1, consentComplete:false, lastActive:'2026-02-16', address:'5 Ndlovu St, Alex',             relationship:'Mother' },
  { id:'p5', name:'Peter Mahlangu',  email:'peter@church.co.za',  phone:'+27845556677', children:1, consentComplete:true,  lastActive:'2026-03-02', address:'31 Impala Cres, Midrand',       relationship:'Father' },
  { id:'p6', name:'Faith Nkosi',     email:'faith@church.co.za',  phone:'+27766667788', children:1, consentComplete:true,  lastActive:'2026-01-19', address:'7 Msomi St, Soweto',            relationship:'Mother' },
];

const ATTENDANCE_TREND = [
  { week:'Jan 5',  rate:72 }, { week:'Jan 12', rate:78 }, { week:'Jan 19', rate:75 },
  { week:'Jan 26', rate:81 }, { week:'Feb 2',  rate:83 }, { week:'Feb 9',  rate:79 },
  { week:'Feb 16', rate:85 }, { week:'Feb 23', rate:82 }, { week:'Mar 2',  rate:88 },
];

export default function SuperAdminDashboard({ adminName: adminNameProp = 'Admin', adminPosition: adminPositionProp = 'Super Admin', onLogout, onRegisterChild }: Props) {
  // Read session — written by both LoginPage and SuperAdminRegisterPage
  const _session = (() => { try { return JSON.parse(sessionStorage.getItem('currentUser') || '{}'); } catch { return {}; } })();
  const adminName     = _session.name     || adminNameProp;
  // Use position from session first, then fall back to prop
  const adminPosition = _session.position || adminPositionProp;

  const [activeTab, setActiveTab]         = useState<Tab>('overview');
  const [selectedChild, setSelectedChild] = useState<StoredChild | null>(null);
  const [welfareList, setWelfareList]     = useState<WelfareFlag[]>(MOCK_WELFARE);
  const [approvingId, setApprovingId]     = useState<string | null>(null);
  const [searchQ, setSearchQ]             = useState('');
  const [gradeFilter, setGradeFilter]     = useState('All');
  const [childrenData, setChildrenData]   = useState<StoredChild[]>(() => childStore.getAll());
  const [families, setFamilies]           = useState<FamilyRecord[]>(MOCK_FAMILIES);
  const [editFamily, setEditFamily]       = useState<FamilyRecord | null>(null);
  const [addFamily, setAddFamily]         = useState(false);
  const [smsTarget, setSmsTarget]         = useState<FamilyRecord | null>(null);
  const [smsMsg, setSmsMsg]               = useState('');
  const [smsSent, setSmsSent]             = useState(false);
  const [familySearch, setFamilySearch]   = useState('');
  const [newFam, setNewFam]               = useState<Partial<FamilyRecord>>({});

  // Live-synced user lists — refreshed on approval or tab switch
  const [allUsers, setAllUsers] = useState(() => userStore.getAll());

  const refreshUsers    = () => setAllUsers(userStore.getAll());
  const refreshChildren = () => setChildrenData(childStore.getAll());

  const teachers = allUsers.filter(u => u.role === 'teacher');
  const parents  = allUsers.filter(u => u.role === 'parent');
  const pending  = teachers.filter(u => !u.approved);

  // Merge registered parents into families list (deduplicate by email)
  const mergedFamilies = useMemo(() => {
    const base = [...families];
    parents.forEach(p => {
      if (!base.find(f => f.email === p.email)) {
        base.push({
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone || '—',
          children: 0,
          consentComplete: false,
          lastActive: p.createdAt,
          address: '',
          relationship: p.position || '',
        });
      }
    });
    return base;
  }, [families, allUsers]);

  const initials = adminName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0,2);

  const handleApprove = (id: string) => {
    userStore.approveTeacher(id);
    refreshUsers();   // re-render immediately so badge and table update
    setApprovingId(id);
    setTimeout(() => setApprovingId(null), 1500);
  };

  const resolveWelfare = (id: string) => {
    setWelfareList(prev => prev.map(w => w.id === id ? { ...w, resolved: true } : w));
  };

  const filteredChildren = useMemo(() => {
    return childrenData.filter(c => {
      const matchQ = searchQ === '' || `${c.firstName} ${c.lastName} ${c.grade} ${c.schoolName}`.toLowerCase().includes(searchQ.toLowerCase());
      const matchG = gradeFilter === 'All' || c.grade === gradeFilter;
      return matchQ && matchG;
    });
  }, [searchQ, gradeFilter, childrenData]);

  const filteredFamilies = useMemo(() =>
    mergedFamilies.filter(f => familySearch === '' || f.name.toLowerCase().includes(familySearch.toLowerCase()) || f.email.toLowerCase().includes(familySearch.toLowerCase())),
    [mergedFamilies, familySearch]
  );

  const grades = ['All', ...Array.from(new Set(childrenData.map(c => c.grade))).sort()];
  const openWelfare   = welfareList.filter(w => !w.resolved);
  const highSeverity  = openWelfare.filter(w => w.severity === 'high');
  const avgAttendance = childrenData.length ? Math.round(childrenData.reduce((s,c) => s+(c.attendanceRate??0), 0) / childrenData.length) : 0;
  const totalFed      = childrenData.reduce((s,c) => s+(c.fedCount??0), 0);

  const sendSms = () => {
    setSmsSent(true);
    setTimeout(() => { setSmsSent(false); setSmsTarget(null); setSmsMsg(''); }, 2000);
  };

  const saveFamily = () => {
    if (editFamily) {
      setFamilies(prev => prev.map(f => f.id === editFamily.id ? { ...editFamily } : f));
      setEditFamily(null);
    }
  };

  const addNewFamily = () => {
    if (!newFam.name || !newFam.email) return;
    setFamilies(prev => [...prev, {
      id: Date.now().toString(),
      name: newFam.name!,
      email: newFam.email!,
      phone: newFam.phone || '—',
      children: 0,
      consentComplete: false,
      lastActive: '—',
      address: newFam.address || '',
      relationship: newFam.relationship || '',
    }]);
    setNewFam({});
    setAddFamily(false);
  };



  const NAV: { id: Tab; icon: string; label: string; badge?: number }[] = [
    { id:'overview',  icon:'📊', label:'Overview' },
    { id:'teachers',  icon:'🧑‍🏫', label:'Teachers',  badge: pending.length || 0 },
    { id:'family',    icon:'👨‍👩‍👧', label:'Family' },
    { id:'children',  icon:'👶', label:'Children' },
    { id:'welfare',   icon:'🛡️', label:'Welfare',   badge: openWelfare.length || 0 },
    { id:'reports',   icon:'📄', label:'Reports' },
    { id:'settings',  icon:'⚙️', label:'Settings' },
  ];

  const inp = (err?: boolean): React.CSSProperties => ({
    width: '100%', background: 'rgba(0,0,0,0.3)',
    border: `1px solid ${err ? '#9ca3af' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: 7, padding: '0.55rem 0.8rem',
    color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', outline: 'none',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html,body,#root { width:100%; min-height:100vh; background:#0a2e12; }

        .sad { display:flex; flex-direction:column; min-height:100vh; font-family:'DM Sans',sans-serif; background:#0a2e12; color:#fff; }

        /* ── Top header ── */
        .sad-header { background:#081e0b; border-bottom:1px solid rgba(240,192,0,0.15); flex-shrink:0; }
        .sad-header-top { display:flex; align-items:center; gap:1rem; padding:0.75rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.04); }
        .sad-logo-badge { width:34px; height:34px; background:#f0c000; border-radius:7px; display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:0.85rem; color:#071a0d; flex-shrink:0; }
        .sad-logo-name { font-family:'Bebas Neue',sans-serif; font-size:0.9rem; letter-spacing:1px; color:#f0c000; line-height:1.2; }
        .sad-logo-sub { font-size:0.58rem; color:rgba(255,255,255,0.28); }
        .sad-user-row { margin-left:auto; display:flex; align-items:center; gap:0.75rem; }
        .sad-avatar { width:32px; height:32px; border-radius:50%; background:rgba(240,192,0,0.12); border:1.5px solid rgba(240,192,0,0.3); display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:700; color:#f0c000; flex-shrink:0; }
        .sad-user-name { font-size:0.78rem; font-weight:700; color:#fff; }
        .sad-user-role { font-size:0.6rem; color:rgba(240,192,0,0.65); }
        .sad-logout-btn { padding:0.38rem 0.9rem; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:none; color:rgba(255,255,255,0.4); font-family:'DM Sans',sans-serif; font-size:0.72rem; font-weight:600; cursor:pointer; transition:all 0.15s; }
        .sad-logout-btn:hover { border-color:#9ca3af; color:#9ca3af; }

        /* ── Tab nav ── */
        .sad-tabs { display:flex; align-items:center; gap:0.25rem; padding:0 1.5rem; overflow-x:auto; scrollbar-width:none; }
        .sad-tabs::-webkit-scrollbar { display:none; }
        .sad-tab { display:flex; align-items:center; gap:0.45rem; padding:0.7rem 1.1rem; border:none; background:none; color:rgba(255,255,255,0.38); font-family:'DM Sans',sans-serif; font-size:0.8rem; font-weight:600; cursor:pointer; border-bottom:2px solid transparent; transition:all 0.15s; white-space:nowrap; position:relative; }
        .sad-tab:hover { color:rgba(255,255,255,0.7); }
        .sad-tab.act { color:#f0c000; border-bottom-color:#f0c000; }
        .sad-tab-icon { font-size:0.9rem; }
        .sad-tab-badge { background:#a8a8a8; color:#fff; font-size:0.58rem; font-weight:800; padding:1px 5px; border-radius:10px; min-width:15px; text-align:center; }
        .sad-tab-badge.gold { background:#f0c000; color:#071a0d; }

        /* ── Main ── */
        .sad-main { flex:1; display:flex; flex-direction:column; min-width:0; }
        .sad-topbar { padding:1rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:space-between; background:rgba(0,0,0,0.12); flex-wrap:wrap; gap:0.75rem; }
        .sad-page-title { font-family:'Bebas Neue',sans-serif; font-size:1.35rem; letter-spacing:2px; color:#f0c000; }
        .sad-page-sub { font-size:0.7rem; color:rgba(255,255,255,0.3); margin-top:1px; }
        .sad-content { flex:1; padding:1.5rem; overflow-y:auto; }

        /* ── Stats grid ── */
        .sad-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:0.875rem; margin-bottom:1.5rem; }
        .sad-stat { background:#0a2410; border:1px solid rgba(240,192,0,0.1); border-radius:11px; padding:1.1rem 1.25rem; }
        .sad-stat-lbl { font-size:0.63rem; font-weight:700; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:0.4rem; }
        .sad-stat-val { font-family:'Bebas Neue',sans-serif; font-size:2rem; color:#f0c000; line-height:1; }
        .sad-stat-sub { font-size:0.68rem; color:rgba(255,255,255,0.3); margin-top:0.2rem; }
        .sad-stat.grey .sad-stat-val { color:#9ca3af; }
        .sad-stat.green .sad-stat-val { color:#34d399; }

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
        .pill.red    { background:rgba(156,163,175,0.1); color:#9ca3af; border:1px solid rgba(156,163,175,0.2); }
        .pill.grey   { background:rgba(156,163,175,0.1); color:#9ca3af; border:1px solid rgba(156,163,175,0.2); }

        /* ── Buttons ── */
        .btn-gold { background:#f0c000; color:#071a0d; border:none; padding:0.55rem 1.1rem; border-radius:7px; font-family:'DM Sans',sans-serif; font-size:0.8rem; font-weight:700; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
        .btn-gold:hover { background:#ffd200; transform:translateY(-1px); }
        .btn-sm { padding:0.3rem 0.75rem; border-radius:5px; border:none; font-family:'DM Sans',sans-serif; font-size:0.72rem; font-weight:700; cursor:pointer; transition:all 0.15s; }
        .btn-approve { background:rgba(52,211,153,0.1); color:#34d399; border:1px solid rgba(52,211,153,0.22); }
        .btn-approve:hover { background:rgba(52,211,153,0.2); }
        .btn-resolve { background:rgba(156,163,175,0.1); color:#9ca3af; border:1px solid rgba(156,163,175,0.22); }
        .btn-resolve:hover { background:rgba(156,163,175,0.2); }
        .btn-view { background:rgba(240,192,0,0.08); color:#f0c000; border:1px solid rgba(240,192,0,0.2); }
        .btn-view:hover { background:rgba(240,192,0,0.15); }
        .btn-edit { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.6); border:1px solid rgba(255,255,255,0.12); }
        .btn-edit:hover { background:rgba(255,255,255,0.1); color:#fff; }
        .btn-sms { background:rgba(52,211,153,0.08); color:#34d399; border:1px solid rgba(52,211,153,0.2); }
        .btn-sms:hover { background:rgba(52,211,153,0.15); }

        /* ── Search/filter bar ── */
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

        /* ── Child detail modal ── */
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

        /* ── Empty state ── */
        .sad-empty { text-align:center; padding:2.5rem 1rem; color:rgba(255,255,255,0.22); font-size:0.82rem; }

        /* ── Report card ── */
        .report-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
        .report-card { background:rgba(0,0,0,0.2); border:1px solid rgba(240,192,0,0.12); border-radius:10px; padding:1.25rem; display:flex; flex-direction:column; gap:0.5rem; }
        .report-card-title { font-family:'Bebas Neue',sans-serif; font-size:0.9rem; letter-spacing:1.2px; color:#f0c000; }
        .report-card-desc { font-size:0.75rem; color:rgba(255,255,255,0.4); line-height:1.5; flex:1; }
        .fmt-row { display:flex; gap:0.35rem; margin-top:0.25rem; }
        .fmt-btn { flex:1; padding:0.28rem 0; border-radius:4px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:rgba(255,255,255,0.4); font-family:'DM Sans',sans-serif; font-size:0.65rem; font-weight:700; cursor:pointer; transition:all 0.15s; text-align:center; }
        .fmt-btn.act { background:rgba(240,192,0,0.15); color:#f0c000; border-color:rgba(240,192,0,0.35); }
        .fmt-btn:hover:not(.act) { border-color:rgba(255,255,255,0.25); color:rgba(255,255,255,0.7); }

        /* ── Inline edit form ── */
        .edit-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
        .edit-lbl { font-size:0.65rem; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:0.3rem; }

        /* ── SMS notification dot ── */
        .sms-dot { width:8px; height:8px; background:#34d399; border-radius:50%; display:inline-block; margin-right:4px; animation:pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:0.3;} }

        /* ── Responsive ── */
        @media (max-width:960px) { .sad-stats { grid-template-columns:1fr 1fr; } .report-grid { grid-template-columns:1fr 1fr; } }
        @media (max-width:600px) { .sad-stats { grid-template-columns:1fr; } .sad-modal-grid { grid-template-columns:1fr; } .report-grid { grid-template-columns:1fr; } .sad-content { padding:1rem; } .edit-grid { grid-template-columns:1fr; } }
        select option { background:#0a2410; }
      `}</style>

      {/* ── Child detail modal ── */}
      {selectedChild && (
        <div className="sad-overlay" onClick={() => setSelectedChild(null)}>
          <div className="sad-modal" onClick={e => e.stopPropagation()}>
            <div className="sad-modal-head">
              <div>
                <span className="sad-modal-title">{selectedChild.firstName} {selectedChild.lastName}</span>
                <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', marginTop:3 }}>{selectedChild.grade}{selectedChild.schoolName ? ` · ${selectedChild.schoolName}` : ''} · Registered {selectedChild.registeredDate}</div>
              </div>
              <button className="sad-modal-close" onClick={() => setSelectedChild(null)}>✕</button>
            </div>
            <div className="sad-section-sep">👤 Learner Information</div>
            <div className="sad-modal-grid">
              <div className="sad-modal-field"><span className="sad-modal-lbl">Grade</span><span className="sad-modal-val">{selectedChild.grade}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Gender</span><span className="sad-modal-val">{selectedChild.gender}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Date of Birth</span><span className="sad-modal-val">{selectedChild.dateOfBirth}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">School</span><span className="sad-modal-val">{selectedChild.schoolName || '—'}</span></div>
              <div className="sad-modal-field" style={{ gridColumn:'1/-1' }}><span className="sad-modal-lbl">Address</span><span className="sad-modal-val">{selectedChild.physicalAddress}</span></div>
            </div>
            <div className="sad-section-sep">🏥 Medical Information</div>
            <div className="sad-modal-grid">
              <div className="sad-modal-field"><span className="sad-modal-lbl">Allergies</span><span className="sad-modal-val">{selectedChild.hasAllergies==='Yes' ? `Yes — ${selectedChild.allergiesDetails||'see notes'}` : 'None'}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Medical Conditions</span><span className="sad-modal-val">{selectedChild.hasMedicalCondition==='Yes' ? `Yes — ${selectedChild.medicalDetails||'see notes'}` : 'None'}</span></div>
            </div>
            <div className="sad-section-sep">📞 Emergency Contact</div>
            <div className="sad-modal-grid">
              <div className="sad-modal-field"><span className="sad-modal-lbl">Full Name</span><span className="sad-modal-val">{selectedChild.contactFirstName} {selectedChild.contactLastName}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Relationship</span><span className="sad-modal-val">{selectedChild.relationship}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Contact Number</span><span className="sad-modal-val">{selectedChild.contactNumber}</span></div>
              {selectedChild.altContactNumber && <div className="sad-modal-field"><span className="sad-modal-lbl">Alt. Number</span><span className="sad-modal-val">{selectedChild.altContactNumber}</span></div>}
            </div>
            <div className="sad-section-sep">✍️ Consent & Attendance</div>
            <div className="sad-modal-grid">
              <div className="sad-modal-field"><span className="sad-modal-lbl">Activities Consent</span><span className="sad-modal-val">{selectedChild.consentActivities==='Yes' ? <span className="pill green">✓ Granted</span> : <span className="pill red">✗ Not given</span>}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Medical Consent</span><span className="sad-modal-val">{selectedChild.consentMedical==='Yes' ? <span className="pill green">✓ Granted</span> : <span className="pill red">✗ Not given</span>}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Guardian Signature</span><span className="sad-modal-val" style={{ fontStyle:'italic' }}>{selectedChild.guardianSignature}</span></div>
              <div className="sad-modal-field"><span className="sad-modal-lbl">Signed On</span><span className="sad-modal-val">{selectedChild.signatureDate}</span></div>
              {(selectedChild.attendanceRate??0) > 0 && <>
                <div className="sad-modal-field"><span className="sad-modal-lbl">Attendance Rate</span><span className="sad-modal-val">{selectedChild.attendanceRate}%</span></div>
                <div className="sad-modal-field"><span className="sad-modal-lbl">Fed This Term</span><span className="sad-modal-val">{selectedChild.fedCount} / {selectedChild.totalSessions} sessions</span></div>
              </>}
              <div className="sad-modal-field"><span className="sad-modal-lbl">Welfare Flags</span><span className="sad-modal-val">{(selectedChild.welfareFlags??0)===0 ? <span className="pill green">None</span> : <span className="pill red">{selectedChild.welfareFlags} open</span>}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Family Modal ── */}
      {editFamily && (
        <div className="sad-overlay" onClick={() => setEditFamily(null)}>
          <div className="sad-modal" onClick={e => e.stopPropagation()} style={{ maxWidth:520 }}>
            <div className="sad-modal-head">
              <span className="sad-modal-title">Edit Family</span>
              <button className="sad-modal-close" onClick={() => setEditFamily(null)}>✕</button>
            </div>
            <div className="edit-grid">
              {[['Full Name','name'],['Email','email'],['Phone','phone'],['Address','address'],['Relationship','relationship']].map(([lbl, key]) => (
                <div key={key} style={{ gridColumn: key === 'address' ? '1/-1' : undefined }}>
                  <label className="edit-lbl">{lbl}</label>
                  <input style={inp()} type="text" value={(editFamily as any)[key] || ''} onChange={e => setEditFamily(p => ({ ...p!, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.25rem', justifyContent:'flex-end' }}>
              <button className="btn-sm btn-edit" onClick={() => setEditFamily(null)}>Cancel</button>
              <button className="btn-gold" style={{ padding:'0.45rem 1.25rem', fontSize:'0.82rem' }} onClick={saveFamily}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Family Modal ── */}
      {addFamily && (
        <div className="sad-overlay" onClick={() => setAddFamily(false)}>
          <div className="sad-modal" onClick={e => e.stopPropagation()} style={{ maxWidth:520 }}>
            <div className="sad-modal-head">
              <span className="sad-modal-title">Add New Family</span>
              <button className="sad-modal-close" onClick={() => setAddFamily(false)}>✕</button>
            </div>
            <div className="edit-grid">
              {[['Full Name *','name'],['Email *','email'],['Phone','phone'],['Address','address'],['Relationship','relationship']].map(([lbl, key]) => (
                <div key={key} style={{ gridColumn: key === 'address' ? '1/-1' : undefined }}>
                  <label className="edit-lbl">{lbl}</label>
                  <input style={inp()} type="text" placeholder={`Enter ${(lbl as string).replace(' *','')}…`} value={(newFam as any)[key] || ''} onChange={e => setNewFam(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.25rem', justifyContent:'flex-end' }}>
              <button className="btn-sm btn-edit" onClick={() => setAddFamily(false)}>Cancel</button>
              <button className="btn-gold" style={{ padding:'0.45rem 1.25rem', fontSize:'0.82rem' }} onClick={addNewFamily}>Add Family</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SMS Modal ── */}
      {smsTarget && (
        <div className="sad-overlay" onClick={() => setSmsTarget(null)}>
          <div className="sad-modal" onClick={e => e.stopPropagation()} style={{ maxWidth:440 }}>
            <div className="sad-modal-head">
              <div>
                <span className="sad-modal-title">Send SMS Notification</span>
                <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', marginTop:3 }}>To: {smsTarget.name} · {smsTarget.phone}</div>
              </div>
              <button className="sad-modal-close" onClick={() => setSmsTarget(null)}>✕</button>
            </div>
            <div style={{ background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:9, padding:'0.75rem 1rem', marginBottom:'1rem', fontSize:'0.78rem', color:'rgba(255,255,255,0.5)' }}>
              ⚠ Incomplete profile detected. Use this SMS to request the family complete their registration details.
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.65rem' }}>
                {[
                  'Please complete your child\'s consent forms on the Sunday School portal.',
                  'Your profile is incomplete. Please update your contact and medical details.',
                  'Action required: Missing consent for activities and medical treatment.',
                ].map(t => (
                  <button key={t} onClick={() => setSmsMsg(t)} style={{ padding:'0.35rem 0.65rem', borderRadius:6, border:'1px solid rgba(255,255,255,0.1)', background: smsMsg === t ? 'rgba(240,192,0,0.1)' : 'transparent', color: smsMsg === t ? '#f0c000' : 'rgba(255,255,255,0.45)', fontSize:'0.7rem', cursor:'pointer', textAlign:'left', fontFamily:"'DM Sans',sans-serif" }}>
                    {t.slice(0,45)}…
                  </button>
                ))}
              </div>
              <label className="edit-lbl">Custom Message</label>
              <textarea rows={3} value={smsMsg} onChange={e => setSmsMsg(e.target.value)} placeholder="Type SMS message…" style={{ ...inp(), resize:'vertical' as any }} />
            </div>
            {smsSent ? (
              <div style={{ textAlign:'center', padding:'1rem', color:'#34d399', fontWeight:700 }}>✓ SMS Sent Successfully!</div>
            ) : (
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
                <button className="btn-sm btn-edit" onClick={() => setSmsTarget(null)}>Cancel</button>
                <button className="btn-gold" style={{ padding:'0.45rem 1.25rem', fontSize:'0.82rem' }} onClick={sendSms} disabled={!smsMsg}>Send SMS →</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="sad">
        {/* ── Header ── */}
        <header className="sad-header">
          <div className="sad-header-top">
            <div className="sad-logo-badge">SS</div>
            <div>
              <div className="sad-logo-name">Sunday School</div>
              <div className="sad-logo-sub">Management Portal</div>
            </div>
            <div className="sad-user-row">
              <div className="sad-avatar">{initials}</div>
              <div>
                <div className="sad-user-name">{adminName}</div>
                <div className="sad-user-role">{adminPosition}</div>
              </div>
              <button className="sad-logout-btn" onClick={onLogout}>Sign Out</button>
            </div>
          </div>

          {/* Tab nav */}
          <div className="sad-tabs">
            {NAV.map(item => (
              <button key={item.id} className={`sad-tab${activeTab === item.id ? ' act' : ''}`}
                onClick={() => { setActiveTab(item.id); refreshUsers(); if (item.id === 'children') refreshChildren(); }}>
                <span className="sad-tab-icon">{item.icon}</span>
                {item.label}
                {item.badge ? (
                  <span className={`sad-tab-badge${item.id === 'welfare' ? '' : ' gold'}`}>{item.badge}</span>
                ) : null}
              </button>
            ))}
          </div>
        </header>

        {/* ── Main ── */}
        <main className="sad-main">
          <div className="sad-topbar">
            <div>
              <div className="sad-page-title">
                {activeTab === 'overview'  && 'Dashboard Overview'}
                {activeTab === 'teachers'  && 'Teacher Management'}
                {activeTab === 'family'    && 'Family Accounts'}
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
              {activeTab === 'family' && (
                <button className="btn-gold" onClick={() => setAddFamily(true)}>+ Add Family</button>
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
                    <div className="sad-stat-val">{childrenData.length}</div>
                    <div className="sad-stat-sub">Across all grades</div>
                  </div>
                  <div className="sad-stat green">
                    <div className="sad-stat-lbl">Avg Attendance</div>
                    <div className="sad-stat-val">{avgAttendance}%</div>
                    <div className="sad-stat-sub">This term</div>
                  </div>
                  <div className="sad-stat">
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
                    {pending.length === 0 ? (
                      <div className="sad-empty">✓ All teachers approved</div>
                    ) : (
                      <table className="sad-tbl">
                        <thead><tr><th>Name</th><th>Action</th></tr></thead>
                        <tbody>
                          {pending.slice(0,4).map(t => (
                            <tr key={t.id}>
                              <td>{t.name}<br/><span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.3)' }}>{t.email}</span></td>
                              <td><button className="btn-sm btn-approve" onClick={() => handleApprove(t.id)}>{approvingId === t.id ? '✓ Done' : 'Approve'}</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="sad-card" style={{ marginBottom:0 }}>
                    <div className="sad-card-head">
                      <span className="sad-card-title">Incomplete Family Profiles</span>
                      {families.filter(f=>!f.consentComplete).length > 0 && <span className="pill grey">{families.filter(f=>!f.consentComplete).length} incomplete</span>}
                    </div>
                    {families.filter(f=>!f.consentComplete).length === 0 ? (
                      <div className="sad-empty">✓ All family profiles complete</div>
                    ) : (
                      <table className="sad-tbl">
                        <thead><tr><th>Family</th><th>Action</th></tr></thead>
                        <tbody>
                          {families.filter(f=>!f.consentComplete).map(f => (
                            <tr key={f.id}>
                              <td>{f.name}<br/><span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.3)' }}>{f.phone}</span></td>
                              <td><button className="btn-sm btn-sms" onClick={() => { setSmsTarget(f); setSmsMsg(''); }}>📱 Notify</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Attendance chart */}
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
                          <div key={w.week} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, height:'100%', justifyContent:'flex-end', gap:'3px' }}>
                            <span style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.5)' }}>{w.rate}%</span>
                            <div style={{ width:'100%', borderRadius:'3px 3px 0 0', height:`${(w.rate/100)*52}px`, background: w.rate >= 85 ? 'rgba(52,211,153,0.7)' : w.rate >= 75 ? 'rgba(240,192,0,0.7)' : 'rgba(156,163,175,0.7)', transition:'background 0.2s', cursor:'default' }} />
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
                      {[['rgba(52,211,153,0.7)','≥85% Good'],['rgba(240,192,0,0.7)','≥75% Fair'],['rgba(156,163,175,0.7)','<75% Low']].map(([c,l]) => (
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
                { id:'t1', name:'Nomvula Dlamini',  email:'nomvula@church.co.za', phone:'0821112233', approved:true,  grades:'Grade 1, Grade 2', sessions:12, flags:1 },
                { id:'t2', name:'James Mokoena',    email:'james@church.co.za',   phone:'0712223344', approved:true,  grades:'Grade 3, Grade 4', sessions:12, flags:0 },
                { id:'t3', name:'Grace Sithole',    email:'grace@church.co.za',   phone:'0833334455', approved:true,  grades:'Grade 5, Grade 6', sessions:11, flags:0 },
                { id:'t4', name:'Peter Mahlangu',   email:'peter@church.co.za',   phone:'0845556677', approved:false, grades:'Grade R',           sessions:0,  flags:0 },
                { id:'t5', name:'Ruth Khumalo',     email:'ruth@church.co.za',    phone:'0724445566', approved:false, grades:'Grade 7',           sessions:0,  flags:0 },
              ];
              const allT = [...MOCK_TEACHERS, ...teachers.map(t => ({ id:t.id, name:t.name, email:t.email, phone:(t as any).phone||'—', approved:!!(t as any).approved, grades:'—', sessions:0, flags:0 }))];
              const approvedT = allT.filter(t => t.approved);
              const pendingT  = allT.filter(t => !t.approved);
              return (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.875rem', marginBottom:'1.25rem' }}>
                    <div className="sad-stat"><div className="sad-stat-lbl">Total Teachers</div><div className="sad-stat-val">{allT.length}</div><div className="sad-stat-sub">Registered volunteers</div></div>
                    <div className="sad-stat green"><div className="sad-stat-lbl">Approved</div><div className="sad-stat-val">{approvedT.length}</div><div className="sad-stat-sub">Active this term</div></div>
                    <div className="sad-stat grey"><div className="sad-stat-lbl">Pending</div><div className="sad-stat-val">{pendingT.length}</div><div className="sad-stat-sub">Awaiting approval</div></div>
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
                            <td>{t.approved ? <span className="pill green">✓ Approved</span> : <span className="pill grey">⏳ Pending</span>}</td>
                            <td>{!t.approved && <button className="btn-sm btn-approve" onClick={() => handleApprove(t.id)}>{approvingId === t.id ? '✓ Done!' : 'Approve'}</button>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}

            {/* ════════════ FAMILY ════════════ */}
            {activeTab === 'family' && (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.875rem', marginBottom:'1.25rem' }}>
                  <div className="sad-stat"><div className="sad-stat-lbl">Total Families</div><div className="sad-stat-val">{families.length}</div><div className="sad-stat-sub">Registered caregivers</div></div>
                  <div className="sad-stat green"><div className="sad-stat-lbl">Profiles Complete</div><div className="sad-stat-val">{families.filter(f=>f.consentComplete).length}</div><div className="sad-stat-sub">Both consents signed</div></div>
                  <div className="sad-stat grey"><div className="sad-stat-lbl">Incomplete</div><div className="sad-stat-val">{families.filter(f=>!f.consentComplete).length}</div><div className="sad-stat-sub">Follow-up needed</div></div>
                </div>

                {families.filter(f=>!f.consentComplete).length > 0 && (
                  <div style={{ background:'rgba(156,163,175,0.06)', border:'1px solid rgba(156,163,175,0.2)', borderRadius:10, padding:'0.875rem 1.25rem', marginBottom:'1.1rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem' }}>
                    <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.6)' }}>
                      <span className="sms-dot" /><strong style={{ color:'#fff' }}>{families.filter(f=>!f.consentComplete).length} famil{families.filter(f=>!f.consentComplete).length > 1 ? 'ies have' : 'y has'} incomplete profiles.</strong> Send SMS notifications to prompt them to complete their registration.
                    </div>
                    <button className="btn-gold" style={{ fontSize:'0.78rem' }} onClick={() => { const f = families.find(x=>!x.consentComplete); if (f) { setSmsTarget(f); setSmsMsg('Please complete your child\'s consent forms on the Sunday School portal.'); } }}>
                      📱 Notify All Incomplete
                    </button>
                  </div>
                )}

                <div className="sad-card">
                  <div className="sad-card-head">
                    <span className="sad-card-title">All Families ({families.length})</span>
                    <input className="sad-search" style={{ maxWidth:240, marginBottom:0 }} placeholder="Search families…" value={familySearch} onChange={e => setFamilySearch(e.target.value)} />
                  </div>
                  {filteredFamilies.length === 0 ? (
                    <div className="sad-empty">No families match your search.</div>
                  ) : (
                    <table className="sad-tbl">
                      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Children</th><th>Relationship</th><th>Profile</th><th>Last Active</th><th>Actions</th></tr></thead>
                      <tbody>
                        {filteredFamilies.map(f => (
                          <tr key={f.id}>
                            <td style={{ fontWeight:600 }}>{f.name}</td>
                            <td>{f.email}</td>
                            <td>{f.phone}</td>
                            <td>{f.children}</td>
                            <td>{f.relationship || '—'}</td>
                            <td>{f.consentComplete ? <span className="pill green">✓ Complete</span> : <span className="pill grey">Incomplete</span>}</td>
                            <td style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.78rem' }}>{f.lastActive}</td>
                            <td>
                              <div style={{ display:'flex', gap:'0.4rem' }}>
                                <button className="btn-sm btn-edit" onClick={() => setEditFamily({ ...f })}>Edit</button>
                                {!f.consentComplete && <button className="btn-sm btn-sms" onClick={() => { setSmsTarget(f); setSmsMsg(''); }}>📱</button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
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
                  {onRegisterChild && (
                    <button className="btn-gold" onClick={() => { refreshChildren(); onRegisterChild(); }}>+ Register Child</button>
                  )}
                </div>
                <div className="sad-card">
                  <div className="sad-card-head">
                    <span className="sad-card-title">Children ({filteredChildren.length})</span>
                    <span style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.3)' }}>Click any row to view full profile</span>
                  </div>
                  {filteredChildren.length === 0 ? (
                    <div className="sad-empty">No children match your search.</div>
                  ) : (
                    <table className="sad-tbl">
                      <thead><tr><th>Name</th><th>Grade</th><th>School</th><th>Attendance</th><th>Consent</th><th>Welfare</th><th>Registered</th><th></th></tr></thead>
                      <tbody>
                        {filteredChildren.map(c => (
                          <tr key={c.id} style={{ cursor:'pointer' }}
                            onClick={() => { childStore.markSeen(c.id); setSelectedChild(c); refreshChildren(); }}>
                            <td style={{ fontWeight:600 }}>
                              {c.isNew && <span style={{ display:'inline-block', background:'#f0c000', color:'#071a0d', fontSize:'0.55rem', fontWeight:900, padding:'1px 5px', borderRadius:4, marginRight:5, verticalAlign:'middle', letterSpacing:'0.5px' }}>NEW</span>}
                              {c.firstName} {c.lastName}
                            </td>
                            <td>{c.grade}</td>
                            <td>{c.schoolName || '—'}</td>
                            <td>
                              {(c.attendanceRate ?? 0) > 0 ? (
                                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                                  <div className="att-bar-bg"><div className="att-bar-fill" style={{ width:`${c.attendanceRate}%`, background: (c.attendanceRate??0)>=85?'#34d399':(c.attendanceRate??0)>=70?'#fbbf24':'#9ca3af' }} /></div>
                                  <span style={{ fontSize:'0.72rem' }}>{c.attendanceRate}%</span>
                                </div>
                              ) : <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.75rem' }}>Not yet</span>}
                            </td>
                            <td>{c.consentActivities==='Yes' && c.consentMedical==='Yes' ? <span className="pill green">✓ Full</span> : <span className="pill grey">Incomplete</span>}</td>
                            <td>{(c.welfareFlags??0)===0 ? <span className="pill green">None</span> : <span className="pill red">{c.welfareFlags} flags</span>}</td>
                            <td style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.45)' }}>{c.registeredDate}</td>
                            <td><button className="btn-sm btn-view" onClick={e => { e.stopPropagation(); childStore.markSeen(c.id); setSelectedChild(c); refreshChildren(); }}>View</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* ════════════ WELFARE ════════════ */}
            {activeTab === 'welfare' && (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.875rem', marginBottom:'1.25rem' }}>
                  <div className="sad-stat"><div className="sad-stat-lbl">High Severity</div><div className="sad-stat-val" style={{ color:'#9ca3af' }}>{welfareList.filter(w=>!w.resolved&&w.severity==='high').length}</div></div>
                  <div className="sad-stat yellow"><div className="sad-stat-lbl">Medium Severity</div><div className="sad-stat-val" style={{ color:'#fbbf24' }}>{welfareList.filter(w=>!w.resolved&&w.severity==='medium').length}</div></div>
                  <div className="sad-stat green"><div className="sad-stat-lbl">Resolved</div><div className="sad-stat-val">{welfareList.filter(w=>w.resolved).length}</div></div>
                </div>
                <div className="sad-card">
                  <div className="sad-card-head"><span className="sad-card-title">Open Welfare Flags ({openWelfare.length})</span></div>
                  {openWelfare.length === 0 ? (
                    <div className="sad-empty">✓ No open welfare concerns</div>
                  ) : (
                    <table className="sad-tbl">
                      <thead><tr><th>Child</th><th>Concern</th><th>Severity</th><th>Date</th><th>Flagged By</th><th>Action</th></tr></thead>
                      <tbody>
                        {openWelfare.map(w => (
                          <tr key={w.id}>
                            <td style={{ fontWeight:600, whiteSpace:'nowrap' }}>{w.childName}</td>
                            <td style={{ maxWidth:260, whiteSpace:'normal', lineHeight:1.4 }}>{w.concern}</td>
                            <td><span className={`pill ${w.severity==='high'?'red':w.severity==='medium'?'yellow':'grey'}`}>{w.severity}</span></td>
                            <td style={{ whiteSpace:'nowrap' }}>{w.date}</td>
                            <td style={{ whiteSpace:'nowrap' }}>{w.flaggedBy}</td>
                            <td><button className="btn-sm btn-resolve" onClick={() => resolveWelfare(w.id)}>Mark Resolved</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="sad-card">
                  <div className="sad-card-head"><span className="sad-card-title">Resolved Cases</span></div>
                  {welfareList.filter(w=>w.resolved).length === 0 ? (
                    <div className="sad-empty">No resolved cases yet.</div>
                  ) : (
                    <table className="sad-tbl">
                      <thead><tr><th>Child</th><th>Concern</th><th>Severity</th><th>Date</th></tr></thead>
                      <tbody>
                        {welfareList.filter(w=>w.resolved).map(w => (
                          <tr key={w.id}>
                            <td style={{ fontWeight:600 }}>{w.childName}</td>
                            <td style={{ maxWidth:260, whiteSpace:'normal', lineHeight:1.4, color:'rgba(255,255,255,0.4)' }}>{w.concern}</td>
                            <td><span className={`pill ${w.severity==='high'?'red':w.severity==='medium'?'yellow':'grey'}`}>{w.severity}</span></td>
                            <td>{w.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* ════════════ REPORTS ════════════ */}
            {activeTab === 'reports' && (
              <>
                {/* Term Summary */}
                <div className="sad-card" style={{ marginBottom:'1.5rem' }}>
                  <div className="sad-card-head"><span className="sad-card-title">Term Summary</span></div>
                  <div className="sad-card-body">
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
                      {[
                        { label:'Total Children', value:childrenData.length },
                        { label:'Avg Attendance', value:`${avgAttendance}%` },
                        { label:'Total Meals Served', value:totalFed },
                        { label:'Welfare Cases', value:welfareList.length },
                      ].map(s => (
                        <div key={s.label} style={{ background:'rgba(0,0,0,0.2)', borderRadius:9, padding:'0.875rem', border:'1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'0.35rem' }}>{s.label}</div>
                          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.6rem', color:'#f0c000' }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Report Cards Grid */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
                  {[
                    { key:'attendance', title:'Attendance Report',         desc:'Weekly attendance per child and per grade. Identifies chronic absentees for pastoral follow-up.',              icon:'📊' },
                    { key:'feeding',    title:'Feeding Scheme Report',     desc:'Number of children fed per session and cumulative totals. For donor reporting and planning.',                icon:'🍽️' },
                    { key:'welfare',    title:'Welfare Report',            desc:'All flagged welfare concerns with severity, status and resolution notes. POPIA-compliant.',                  icon:'🛡️' },
                    { key:'children',  title:'Child Registration Summary', desc:'Complete list of registered learners with consent status, medical alerts and contact details.',              icon:'👶' },
                    { key:'teachers',  title:'Teacher Activity Report',    desc:'Attendance marking frequency, welfare flags raised, and session participation per teacher.',                 icon:'🧑‍🏫' },
                    { key:'impact',    title:'Impact Report (Donor)',      desc:'High-level summary for donors — children served, meals provided, welfare interventions.',                    icon:'📄' },
                  ].map(r => (
                    <div key={r.key} style={{
                      background:'rgba(0,0,0,0.2)',
                      border:'1px solid rgba(240,192,0,0.12)',
                      borderRadius:12,
                      padding:'1.5rem',
                      display:'flex',
                      flexDirection:'column',
                      gap:'0.6rem',
                    }}>
                      {/* Icon */}
                      <div style={{ fontSize:'2rem', lineHeight:1, marginBottom:'0.25rem' }}>{r.icon}</div>

                      {/* Title */}
                      <div style={{
                        fontFamily:"'Bebas Neue',sans-serif",
                        fontSize:'0.95rem',
                        letterSpacing:'1.5px',
                        color:'#f0c000',
                      }}>{r.title}</div>

                      {/* Description */}
                      <div style={{
                        fontSize:'0.78rem',
                        color:'rgba(255,255,255,0.45)',
                        lineHeight:1.55,
                        flex:1,
                      }}>{r.desc}</div>

                      {/* Three export buttons side by side */}
                      <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem' }}>
                        {(['PDF','CSV','Excel'] as const).map(fmt => (
                          <button key={fmt} style={{
                            flex:1,
                            padding:'0.5rem 0',
                            borderRadius:6,
                            border:'1px solid rgba(240,192,0,0.25)',
                            background:'rgba(240,192,0,0.07)',
                            color:'#f0c000',
                            fontFamily:"'DM Sans',sans-serif",
                            fontSize:'0.75rem',
                            fontWeight:700,
                            cursor:'pointer',
                            transition:'all 0.15s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(240,192,0,0.18)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(240,192,0,0.07)'; }}
                          >
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
                      { label:'Compliance', value:'POPIA Compliant' },
                      { label:'Data Storage', value:'In-memory (session)' },
                      { label:'Session', value:'Active' },
                    ].map(s => (
                      <div key={s.label} style={{ background:'rgba(0,0,0,0.2)', borderRadius:8, padding:'0.875rem', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'0.25rem' }}>{s.label}</div>
                        <div style={{ fontSize:'0.875rem', color:'#fff', fontWeight:600 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <button className="sad-logout-btn" style={{ width:'auto', padding:'0.6rem 1.5rem' }} onClick={onLogout}>
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