// src/features/dashboard/SuperAdminDashboard.tsx
import { useState } from 'react';

interface Props {
  adminName?: string;
  adminPosition?: string;
  onLogout?: () => void;
}

type NavSection = 'dashboard' | 'children' | 'attendance' | 'feeding' | 'welfare' | 'users' | 'reports';

const NAV = [
  { id: 'dashboard'  as NavSection, label: 'Dashboard',  icon: '🏠' },
  { id: 'children'   as NavSection, label: 'Children',   icon: '👧' },
  { id: 'attendance' as NavSection, label: 'Attendance', icon: '✅' },
  { id: 'feeding'    as NavSection, label: 'Feeding',    icon: '🍱' },
  { id: 'welfare'    as NavSection, label: 'Welfare',    icon: '🛡️' },
  { id: 'users'      as NavSection, label: 'Users',      icon: '👥' },
  { id: 'reports'    as NavSection, label: 'Reports',    icon: '📊' },
];

const CHILDREN = [
  { name: 'Amahle Dlamini',  age: 7,  grade: 'Grade 2', gender: 'F', status: 'present', welfare: false, medical: false },
  { name: 'Sipho Nkosi',     age: 9,  grade: 'Grade 4', gender: 'M', status: 'absent',  welfare: true,  medical: false },
  { name: 'Lerato Mokoena',  age: 6,  grade: 'Grade 1', gender: 'F', status: 'present', welfare: false, medical: true  },
  { name: 'Thabo Sithole',   age: 11, grade: 'Grade 6', gender: 'M', status: 'present', welfare: false, medical: false },
  { name: 'Naledi Khumalo',  age: 8,  grade: 'Grade 3', gender: 'F', status: 'late',    welfare: false, medical: false },
  { name: 'Kabelo Mahlangu', age: 10, grade: 'Grade 5', gender: 'M', status: 'present', welfare: false, medical: false },
  { name: 'Zintle Mthembu',  age: 7,  grade: 'Grade 2', gender: 'F', status: 'present', welfare: true,  medical: false },
];

const WELFARE_FLAGS = [
  { child: 'Sipho Nkosi',    concern: 'Missed 3 consecutive sessions', severity: 'high',   raised: 'Sis. Nomsa', date: '2 Mar', resolved: false },
  { child: 'Thandi Mthembu', concern: 'Clothing concern noted',        severity: 'medium', raised: 'Bro. James', date: '1 Mar', resolved: false },
  { child: 'Kabelo Sithole', concern: 'Nutrition / feeding concern',   severity: 'low',    raised: 'Sis. Mary',  date: '28 Feb', resolved: false },
  { child: 'Ayanda Moyo',    concern: 'Irregular attendance pattern',  severity: 'medium', raised: 'Bro. Paul',  date: '25 Feb', resolved: true  },
];

const USERS = [
  { name: 'Sister Nomsa Zulu',   role: 'Teacher',     position: 'Grade 3 Teacher', status: 'pending',  time: '2 hours ago' },
  { name: 'Bro. David Mahlangu', role: 'Super Admin', position: 'Secretary',        status: 'pending',  time: '1 day ago'   },
  { name: 'Sis. Ruth Ndlovu',    role: 'Teacher',     position: 'Grade 1 Teacher', status: 'approved', time: '3 days ago'  },
  { name: 'Bro. Paul Khumalo',   role: 'Teacher',     position: 'Grade 5 Teacher', status: 'approved', time: '1 week ago'  },
];

const ATTENDANCE_WEEKS = [
  { week: 'Week 1',  pct: 82 },
  { week: 'Week 2',  pct: 91 },
  { week: 'Week 3',  pct: 78 },
  { week: 'Week 4',  pct: 87 },
  { week: 'This week', pct: 94 },
];

const FEEDING_DATA = [
  { meal: 'Breakfast', served: 108, total: 124, color: '#34d399' },
  { meal: 'Lunch',     served: 96,  total: 124, color: '#f0c000' },
  { meal: 'Snacks',    served: 118, total: 124, color: '#60a5fa' },
];

export default function SuperAdminDashboard({
  adminName = 'Admin',
  adminPosition = 'Chairperson',
  onLogout,
}: Props) {
  const [active, setActive] = useState<NavSection>('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const initials = adminName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; background: #071a0d; }

        .sad-root {
          display: flex; width: 100%; height: 100vh;
          font-family: 'DM Sans', sans-serif; background: #071a0d; color: #fff;
          overflow: hidden;
        }

        /* ── Sidebar ── */
        .sad-sidebar {
          width: 220px; min-width: 220px;
          background: #0a2e12;
          border-right: 1px solid rgba(240,192,0,0.1);
          display: flex; flex-direction: column;
          transition: width 0.22s ease, min-width 0.22s ease;
          overflow: hidden;
        }
        .sad-sidebar.col { width: 58px; min-width: 58px; }

        .sad-brand {
          padding: 1rem 0.85rem;
          border-bottom: 1px solid rgba(240,192,0,0.1);
          display: flex; align-items: center; gap: 0.65rem; overflow: hidden;
        }
        .sad-logo {
          width: 38px; height: 38px; flex-shrink: 0;
          background: #f0c000; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 1rem; color: #0a2e12;
        }
        .sad-brand-txt { overflow: hidden; white-space: nowrap; }
        .sad-brand-name { font-family: 'Bebas Neue', sans-serif; font-size: 0.95rem; letter-spacing: 1px; color: #f0c000; line-height: 1; }
        .sad-brand-sub  { font-size: 0.6rem; color: rgba(255,255,255,0.28); margin-top: 2px; }

        .sad-nav { flex: 1; padding: 0.5rem 0; overflow-y: auto; overflow-x: hidden; }
        .sad-nav-btn {
          width: 100%; display: flex; align-items: center; gap: 0.7rem;
          padding: 0.62rem 0.85rem;
          background: none; border: none; border-left: 3px solid transparent;
          color: rgba(255,255,255,0.42);
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 500;
          cursor: pointer; text-align: left; white-space: nowrap;
          transition: all 0.15s;
        }
        .sad-nav-btn:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.04); }
        .sad-nav-btn.on { color: #f0c000; background: rgba(240,192,0,0.08); border-left-color: #f0c000; }
        .sad-nav-icon { font-size: 1.1rem; flex-shrink: 0; width: 18px; text-align: center; }

        .sad-user-chip {
          margin: 0.65rem;
          padding: 0.7rem 0.75rem;
          background: rgba(240,192,0,0.07); border: 1px solid rgba(240,192,0,0.15);
          border-radius: 10px; overflow: hidden;
        }
        .sad-chip-name { font-size: 0.78rem; font-weight: 700; color: #f0c000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sad-chip-pos  { font-size: 0.65rem; color: rgba(255,255,255,0.32); margin-top: 1px; white-space: nowrap; }
        .sad-signout {
          width: 100%; margin-top: 0.5rem;
          background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2);
          color: rgba(248,113,113,0.7); border-radius: 7px;
          padding: 0.38rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
        }
        .sad-signout:hover { background: rgba(248,113,113,0.2); color: #f87171; }

        /* ── Main ── */
        .sad-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }

        .sad-topbar {
          background: #0a2e12; border-bottom: 1px solid rgba(240,192,0,0.1);
          padding: 0.8rem 1.25rem; display: flex; align-items: center; gap: 0.85rem;
          flex-shrink: 0;
        }
        .sad-toggle {
          background: none; border: none; color: rgba(255,255,255,0.35);
          font-size: 1.1rem; cursor: pointer; padding: 0.2rem; transition: color 0.15s;
        }
        .sad-toggle:hover { color: #f0c000; }
        .sad-topbar-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.25rem; letter-spacing: 1.5px;
        }
        .sad-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 0.65rem; }
        .sad-date { font-size: 0.72rem; color: rgba(255,255,255,0.28); white-space: nowrap; }
        .sad-notif-btn {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(240,192,0,0.08); border: 1px solid rgba(240,192,0,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem; cursor: pointer; position: relative; transition: background 0.15s;
        }
        .sad-notif-btn:hover { background: rgba(240,192,0,0.15); }
        .sad-notif-dot {
          position: absolute; top: 4px; right: 4px;
          width: 7px; height: 7px; border-radius: 50%;
          background: #f87171; border: 1.5px solid #0a2e12;
        }

        .sad-content { flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem; }

        /* ── Shared components ── */
        .sad-sec-hd {
          font-family: 'Bebas Neue', sans-serif; font-size: 0.92rem; letter-spacing: 1.5px;
          color: #f0c000; margin-bottom: 0.85rem;
          display: flex; align-items: center; gap: 0.6rem;
        }
        .sad-sec-hd::after { content:''; flex:1; height:1px; background:rgba(240,192,0,0.12); }

        .sad-panel {
          background: #0f3d1a; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; overflow: hidden;
        }
        .sad-panel-hd {
          padding: 0.85rem 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: space-between;
        }
        .sad-panel-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 0.88rem; letter-spacing: 1px;
          color: rgba(255,255,255,0.7);
        }
        .sad-view-all {
          background: none; border: none; color: #f0c000;
          font-size: 0.7rem; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif; padding: 0; text-decoration: underline;
        }

        /* stat cards */
        .sad-stats { display: grid; grid-template-columns: repeat(6,1fr); gap: 0.85rem; margin-bottom: 1.25rem; }
        .sad-stat {
          background: #0f3d1a; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 11px; padding: 0.9rem 1rem; transition: transform 0.2s;
        }
        .sad-stat:hover { transform: translateY(-2px); }
        .sad-stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
        .sad-stat-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
        .sad-stat-val  { font-family: 'Bebas Neue', sans-serif; font-size: 1.9rem; letter-spacing: 1px; line-height: 1; }
        .sad-stat-lbl  { font-size: 0.7rem; color: rgba(255,255,255,0.45); font-weight: 600; }
        .sad-stat-sub  { font-size: 0.62rem; color: rgba(255,255,255,0.25); margin-top: 2px; }

        /* welcome bar */
        .sad-welcome {
          background: linear-gradient(135deg, #0f3d1a 0%, #0c3015 100%);
          border: 1px solid rgba(240,192,0,0.18); border-radius: 12px;
          padding: 1rem 1.25rem; display: flex; align-items: center; gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .sad-welcome-icon {
          width: 44px; height: 44px; border-radius: 11px;
          background: rgba(240,192,0,0.12); border: 1px solid rgba(240,192,0,0.25);
          display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0;
        }
        .sad-welcome-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; letter-spacing: 1px; color: #f0c000; line-height: 1; }
        .sad-welcome-sub   { font-size: 0.73rem; color: rgba(255,255,255,0.38); margin-top: 2px; }
        .sad-session-tag {
          margin-left: auto; flex-shrink: 0;
          background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25);
          color: #34d399; font-size: 0.7rem; font-weight: 700;
          padding: 0.28rem 0.75rem; border-radius: 20px; white-space: nowrap;
        }

        /* rows */
        .sad-row { display: flex; align-items: center; gap: 0.7rem; padding: 0.65rem 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s; }
        .sad-row:last-child { border-bottom: none; }
        .sad-row:hover { background: rgba(255,255,255,0.03); }

        .sad-avatar {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: rgba(240,192,0,0.12); color: #f0c000;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.72rem;
        }
        .sad-row-name { font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .sad-row-meta { font-size: 0.68rem; color: rgba(255,255,255,0.3); margin-top: 1px; }

        .sad-badge {
          padding: 0.15rem 0.5rem; border-radius: 12px;
          font-size: 0.65rem; font-weight: 700; white-space: nowrap;
        }
        .sad-badge.present  { background: rgba(52,211,153,0.15); color: #34d399; }
        .sad-badge.absent   { background: rgba(248,113,113,0.15); color: #f87171; }
        .sad-badge.late     { background: rgba(251,191,36,0.15);  color: #fbbf24; }
        .sad-badge.pending  { background: rgba(251,146,60,0.15);  color: #fb923c; }
        .sad-badge.approved { background: rgba(52,211,153,0.15);  color: #34d399; }

        .sad-btn-approve {
          background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25);
          color: #34d399; border-radius: 7px;
          padding: 0.28rem 0.7rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem; font-weight: 700; cursor: pointer;
          transition: all 0.15s; white-space: nowrap;
        }
        .sad-btn-approve:hover { background: rgba(52,211,153,0.2); }

        .sad-btn-reject {
          background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2);
          color: rgba(248,113,113,0.7); border-radius: 7px;
          padding: 0.28rem 0.7rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem; font-weight: 700; cursor: pointer;
          transition: all 0.15s; white-space: nowrap;
        }
        .sad-btn-reject:hover { background: rgba(248,113,113,0.15); color: #f87171; }

        .sad-btn-resolve {
          background: none; border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.35); border-radius: 7px;
          padding: 0.25rem 0.6rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.68rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
        }
        .sad-btn-resolve:hover { border-color: rgba(240,192,0,0.3); color: #f0c000; }

        /* severity dot */
        .sev { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .sev.high   { background: #f87171; box-shadow: 0 0 5px rgba(248,113,113,0.5); }
        .sev.medium { background: #fbbf24; }
        .sev.low    { background: #34d399; }

        /* progress bar */
        .sad-bar-bg { height: 8px; border-radius: 4px; background: rgba(255,255,255,0.07); overflow: hidden; flex: 1; }
        .sad-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }

        /* two col */
        .sad-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }
        .sad-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }

        /* tables */
        .sad-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
        .sad-table th { padding: 0.6rem 0.9rem; text-align: left; font-size: 0.65rem; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .sad-table td { padding: 0.65rem 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.75); }
        .sad-table tr:last-child td { border-bottom: none; }
        .sad-table tr:hover td { background: rgba(255,255,255,0.025); }

        /* report card */
        .sad-report-card {
          background: #0f3d1a; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 11px; padding: 1.1rem 1.25rem;
          display: flex; align-items: center; gap: 1rem;
          cursor: pointer; transition: all 0.2s;
        }
        .sad-report-card:hover { border-color: rgba(240,192,0,0.3); transform: translateY(-2px); }
        .sad-report-icon {
          width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
        }
        .sad-report-name { font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.85); }
        .sad-report-desc { font-size: 0.7rem; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .sad-export-btn {
          margin-left: auto; background: rgba(240,192,0,0.1); border: 1px solid rgba(240,192,0,0.25);
          color: #f0c000; border-radius: 7px;
          padding: 0.3rem 0.75rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem; font-weight: 700; cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .sad-export-btn:hover { background: rgba(240,192,0,0.18); }

        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .sad-fade { animation: fadeIn 0.2s ease; }

        @media (max-width: 1100px) { .sad-stats { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 800px)  { .sad-stats { grid-template-columns: repeat(2,1fr); } .sad-2col,.sad-3col { grid-template-columns: 1fr; } }
      `}</style>

      <div className="sad-root">

        {/* ── SIDEBAR ── */}
        <aside className={`sad-sidebar${collapsed ? ' col' : ''}`}>
          <div className="sad-brand">
            <div className="sad-logo">SS</div>
            {!collapsed && (
              <div className="sad-brand-txt">
                <div className="sad-brand-name">Sunday School</div>
                <div className="sad-brand-sub">Management Portal</div>
              </div>
            )}
          </div>

          <nav className="sad-nav">
            {NAV.map(item => (
              <button key={item.id}
                className={`sad-nav-btn${active === item.id ? ' on' : ''}`}
                onClick={() => setActive(item.id)}
              >
                <span className="sad-nav-icon">{item.icon}</span>
                {!collapsed && item.label}
              </button>
            ))}
          </nav>

          {!collapsed && (
            <div className="sad-user-chip">
              <div className="sad-chip-name">🛡️ {adminName}</div>
              <div className="sad-chip-pos">{adminPosition}</div>
              <button className="sad-signout" onClick={onLogout}>Sign Out</button>
            </div>
          )}
        </aside>

        {/* ── MAIN ── */}
        <main className="sad-main">
          <div className="sad-topbar">
            <button className="sad-toggle" onClick={() => setCollapsed(c => !c)}>
              {collapsed ? '▶' : '◀'}
            </button>
            <span className="sad-topbar-title">
              {NAV.find(n => n.id === active)?.icon}{' '}{NAV.find(n => n.id === active)?.label}
            </span>
            <div className="sad-topbar-right">
              <span className="sad-date">
                {new Date().toLocaleDateString('en-ZA', { weekday:'short', day:'numeric', month:'long', year:'numeric' })}
              </span>
              <div className="sad-notif-btn">🔔<div className="sad-notif-dot" /></div>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(240,192,0,0.15)', border: '1.5px solid rgba(240,192,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.72rem', color: '#f0c000',
              }}>{initials}</div>
            </div>
          </div>

          <div className="sad-content">

            {/* ══════════════ DASHBOARD ══════════════ */}
            {active === 'dashboard' && (
              <div className="sad-fade">
                <div className="sad-welcome">
                  <div className="sad-welcome-icon">🛡️</div>
                  <div>
                    <div className="sad-welcome-title">Welcome back, {adminName}</div>
                    <div className="sad-welcome-sub">Here's Sunday School at a glance for today.</div>
                  </div>
                  <div className="sad-session-tag">● Session Active</div>
                </div>

                <div className="sad-sec-hd">Overview</div>
                <div className="sad-stats">
                  {[
                    { label:'Registered Children', val:'124', sub:'+8 this month',         icon:'👧', color:'#34d399' },
                    { label:'Active Teachers',      val:'9',   sub:'2 pending approval',    icon:'🧑‍🏫', color:'#f0c000' },
                    { label:'Attendance Today',     val:'87%', sub:'108 / 124 present',     icon:'✅', color:'#60a5fa' },
                    { label:'Welfare Flags',        val:'3',   sub:'1 urgent, 2 medium',    icon:'🚨', color:'#f87171' },
                    { label:'Fed Today',            val:'102', sub:'of 124 children',       icon:'🍱', color:'#a78bfa' },
                    { label:'Pending Approvals',    val:'2',   sub:'users awaiting review', icon:'⏳', color:'#fb923c' },
                  ].map(s => (
                    <div key={s.label} className="sad-stat" style={{ borderColor: `${s.color}20` }}
                      onClick={() => setActive(s.label.includes('Children') ? 'children' : s.label.includes('Teacher') || s.label.includes('Approval') ? 'users' : s.label.includes('Attend') ? 'attendance' : s.label.includes('Welfare') ? 'welfare' : s.label.includes('Fed') ? 'feeding' : 'users')}
                      style={{ cursor:'pointer', background:'#0f3d1a', border:`1px solid ${s.color}22`, borderRadius:11, padding:'0.9rem 1rem', transition:'transform 0.2s' }}
                    >
                      <div className="sad-stat-top">
                        <div className="sad-stat-icon" style={{ background:`${s.color}15` }}>{s.icon}</div>
                        <div className="sad-stat-val" style={{ color: s.color }}>{s.val}</div>
                      </div>
                      <div className="sad-stat-lbl">{s.label}</div>
                      <div className="sad-stat-sub">{s.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="sad-2col">
                  {/* Today's attendance */}
                  <div className="sad-panel">
                    <div className="sad-panel-hd">
                      <span className="sad-panel-title">👧 Today's Attendance</span>
                      <button className="sad-view-all" onClick={() => setActive('attendance')}>View All →</button>
                    </div>
                    {CHILDREN.slice(0,5).map(c => (
                      <div key={c.name} className="sad-row">
                        {c.welfare && <div style={{ width:6, height:6, borderRadius:'50%', background:'#f87171', flexShrink:0 }} />}
                        <div className="sad-avatar">{c.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div className="sad-row-name">{c.name}</div>
                          <div className="sad-row-meta">{c.grade} · Age {c.age}</div>
                        </div>
                        <span className={`sad-badge ${c.status}`}>{c.status}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    {/* Pending approvals */}
                    <div className="sad-panel">
                      <div className="sad-panel-hd">
                        <span className="sad-panel-title">⏳ Pending Approvals</span>
                        <span style={{ fontSize:'0.65rem', background:'rgba(251,146,60,0.15)', color:'#fb923c', padding:'0.15rem 0.5rem', borderRadius:10, fontWeight:700 }}>
                          {USERS.filter(u=>u.status==='pending').length} NEW
                        </span>
                      </div>
                      {USERS.filter(u=>u.status==='pending').map(u => (
                        <div key={u.name} className="sad-row">
                          <div className="sad-avatar">{u.name.split(' ').filter(w=>!['Sister','Brother','Bro.','Sis.'].includes(w)).slice(0,2).map(w=>w[0]).join('')}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div className="sad-row-name">{u.name}</div>
                            <div className="sad-row-meta">{u.role} · {u.position} · {u.time}</div>
                          </div>
                          <div style={{ display:'flex', gap:'0.4rem' }}>
                            <button className="sad-btn-approve">Approve</button>
                            <button className="sad-btn-reject">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Welfare flags */}
                    <div className="sad-panel">
                      <div className="sad-panel-hd">
                        <span className="sad-panel-title">🚨 Active Welfare Flags</span>
                        <button className="sad-view-all" onClick={() => setActive('welfare')}>View All →</button>
                      </div>
                      {WELFARE_FLAGS.filter(w=>!w.resolved).map(w => (
                        <div key={w.child} className="sad-row">
                          <div className={`sev ${w.severity}`} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <div className="sad-row-name">{w.child}</div>
                            <div className="sad-row-meta">{w.concern} · {w.raised}</div>
                          </div>
                          <button className="sad-btn-resolve">Resolve</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ CHILDREN ══════════════ */}
            {active === 'children' && (
              <div className="sad-fade">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                  <div className="sad-sec-hd" style={{ margin:0, flex:1 }}>All Registered Children</div>
                  <button style={{ background:'#f0c000', color:'#0a2e12', border:'none', borderRadius:8, padding:'0.5rem 1.1rem', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
                    + Register Child
                  </button>
                </div>
                <div className="sad-panel">
                  <table className="sad-table">
                    <thead>
                      <tr>
                        <th>Name</th><th>Age</th><th>Grade</th><th>Gender</th>
                        <th>Today</th><th>Medical</th><th>Welfare</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CHILDREN.map(c => (
                        <tr key={c.name}>
                          <td style={{ fontWeight:600 }}>{c.name}</td>
                          <td>{c.age}</td>
                          <td>{c.grade}</td>
                          <td>{c.gender === 'F' ? '👧 Female' : '👦 Male'}</td>
                          <td><span className={`sad-badge ${c.status}`}>{c.status}</span></td>
                          <td>{c.medical ? <span style={{ color:'#f87171', fontSize:'0.7rem', fontWeight:700 }}>⚠ Yes</span> : <span style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.7rem' }}>None</span>}</td>
                          <td>{c.welfare ? <span style={{ color:'#f87171', fontSize:'0.7rem', fontWeight:700 }}>🚨 Flagged</span> : <span style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.7rem' }}>None</span>}</td>
                          <td>
                            <button className="sad-btn-resolve">View Profile</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══════════════ ATTENDANCE ══════════════ */}
            {active === 'attendance' && (
              <div className="sad-fade">
                <div className="sad-sec-hd">Attendance Overview</div>

                {/* Summary stats */}
                <div className="sad-3col">
                  {[
                    { label:'Present Today',  val:'108', sub:'87% of enrolled', color:'#34d399' },
                    { label:'Absent Today',   val:'12',  sub:'9.7% of enrolled', color:'#f87171' },
                    { label:'Late Arrivals',  val:'4',   sub:'3.2% of enrolled', color:'#fbbf24' },
                  ].map(s => (
                    <div key={s.label} className="sad-stat" style={{ background:'#0f3d1a', border:`1px solid ${s.color}22`, borderRadius:11, padding:'0.9rem 1rem' }}>
                      <div className="sad-stat-val" style={{ color:s.color }}>{s.val}</div>
                      <div className="sad-stat-lbl">{s.label}</div>
                      <div className="sad-stat-sub">{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Weekly trend */}
                <div className="sad-sec-hd">Weekly Trend</div>
                <div className="sad-panel" style={{ marginBottom:'1.25rem' }}>
                  <div style={{ padding:'1rem 1.25rem' }}>
                    {ATTENDANCE_WEEKS.map(w => (
                      <div key={w.week} style={{ marginBottom:'0.75rem' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'rgba(255,255,255,0.4)', marginBottom:'0.35rem' }}>
                          <span>{w.week}</span>
                          <span style={{ color:'#f0c000', fontWeight:700 }}>{w.pct}%</span>
                        </div>
                        <div className="sad-bar-bg">
                          <div className="sad-bar-fill" style={{ width:`${w.pct}%`, background: w.pct >= 90 ? '#34d399' : w.pct >= 80 ? '#f0c000' : '#f87171' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's detail */}
                <div className="sad-sec-hd">Today's Register</div>
                <div className="sad-panel">
                  <table className="sad-table">
                    <thead><tr><th>Child</th><th>Grade</th><th>Status</th><th>Arrival Time</th><th>Marked By</th></tr></thead>
                    <tbody>
                      {CHILDREN.map((c, i) => (
                        <tr key={c.name}>
                          <td style={{ fontWeight:600 }}>{c.name}</td>
                          <td>{c.grade}</td>
                          <td><span className={`sad-badge ${c.status}`}>{c.status}</span></td>
                          <td style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.75rem' }}>{c.status === 'absent' ? '—' : c.status === 'late' ? '09:45 AM' : `0${8+i}:${i*5 < 10 ? '0'+i*5 : i*5} AM`}</td>
                          <td style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.75rem' }}>Sis. Nomsa</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══════════════ FEEDING ══════════════ */}
            {active === 'feeding' && (
              <div className="sad-fade">
                <div className="sad-sec-hd">Feeding Scheme</div>

                <div className="sad-3col">
                  {FEEDING_DATA.map(f => (
                    <div key={f.meal} className="sad-panel" style={{ padding:'1.1rem 1.25rem' }}>
                      <div style={{ fontSize:'0.7rem', fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'0.5rem' }}>{f.meal}</div>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2.2rem', color:f.color, letterSpacing:1, lineHeight:1 }}>{f.served}</div>
                      <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', margin:'0.25rem 0 0.75rem' }}>of {f.total} children ({Math.round(f.served/f.total*100)}%)</div>
                      <div className="sad-bar-bg">
                        <div className="sad-bar-fill" style={{ width:`${Math.round(f.served/f.total*100)}%`, background:f.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="sad-sec-hd">Today's Feeding Log</div>
                <div className="sad-panel">
                  <table className="sad-table">
                    <thead><tr><th>Child</th><th>Grade</th><th>Breakfast</th><th>Lunch</th><th>Snacks</th><th>Notes</th></tr></thead>
                    <tbody>
                      {CHILDREN.map(c => (
                        <tr key={c.name}>
                          <td style={{ fontWeight:600 }}>{c.name}</td>
                          <td>{c.grade}</td>
                          <td><span className="sad-badge present">✓</span></td>
                          <td>{c.status !== 'absent' ? <span className="sad-badge present">✓</span> : <span className="sad-badge absent">✗</span>}</td>
                          <td><span className="sad-badge present">✓</span></td>
                          <td style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.72rem' }}>—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══════════════ WELFARE ══════════════ */}
            {active === 'welfare' && (
              <div className="sad-fade">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                  <div className="sad-sec-hd" style={{ margin:0, flex:1 }}>Welfare Management</div>
                  <button style={{ background:'#f87171', color:'#fff', border:'none', borderRadius:8, padding:'0.5rem 1.1rem', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
                    + Raise Concern
                  </button>
                </div>

                <div className="sad-2col" style={{ marginBottom:'1rem' }}>
                  {[
                    { label:'Active Flags', val: WELFARE_FLAGS.filter(w=>!w.resolved).length, color:'#f87171' },
                    { label:'Resolved',     val: WELFARE_FLAGS.filter(w=>w.resolved).length,  color:'#34d399' },
                  ].map(s => (
                    <div key={s.label} className="sad-stat" style={{ background:'#0f3d1a', border:`1px solid ${s.color}22`, borderRadius:11, padding:'0.9rem 1.25rem' }}>
                      <div className="sad-stat-val" style={{ color:s.color }}>{s.val}</div>
                      <div className="sad-stat-lbl">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="sad-panel">
                  <table className="sad-table">
                    <thead><tr><th>Severity</th><th>Child</th><th>Concern</th><th>Raised By</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {WELFARE_FLAGS.map(w => (
                        <tr key={w.child + w.concern}>
                          <td><div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}><div className={`sev ${w.severity}`} /><span style={{ fontSize:'0.72rem', textTransform:'capitalize', color:'rgba(255,255,255,0.5)' }}>{w.severity}</span></div></td>
                          <td style={{ fontWeight:600 }}>{w.child}</td>
                          <td style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.78rem' }}>{w.concern}</td>
                          <td style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.75rem' }}>{w.raised}</td>
                          <td style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.72rem' }}>{w.date}</td>
                          <td><span className={`sad-badge ${w.resolved ? 'approved' : 'absent'}`}>{w.resolved ? 'Resolved' : 'Open'}</span></td>
                          <td>{!w.resolved && <button className="sad-btn-resolve">Resolve</button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══════════════ USERS ══════════════ */}
            {active === 'users' && (
              <div className="sad-fade">
                <div className="sad-sec-hd">User Management</div>

                <div className="sad-2col" style={{ marginBottom:'1rem' }}>
                  {[
                    { label:'Approved Users',  val: USERS.filter(u=>u.status==='approved').length, color:'#34d399' },
                    { label:'Pending Approval',val: USERS.filter(u=>u.status==='pending').length,  color:'#fb923c' },
                  ].map(s => (
                    <div key={s.label} className="sad-stat" style={{ background:'#0f3d1a', border:`1px solid ${s.color}22`, borderRadius:11, padding:'0.9rem 1.25rem' }}>
                      <div className="sad-stat-val" style={{ color:s.color }}>{s.val}</div>
                      <div className="sad-stat-lbl">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="sad-panel">
                  <table className="sad-table">
                    <thead><tr><th>Name</th><th>Role</th><th>Position</th><th>Registered</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {USERS.map(u => (
                        <tr key={u.name}>
                          <td style={{ fontWeight:600 }}>{u.name}</td>
                          <td><span style={{ fontSize:'0.72rem', color: u.role==='Super Admin' ? '#a78bfa' : '#f0c000', fontWeight:700 }}>{u.role}</span></td>
                          <td style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.78rem' }}>{u.position}</td>
                          <td style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.72rem' }}>{u.time}</td>
                          <td><span className={`sad-badge ${u.status}`}>{u.status}</span></td>
                          <td>
                            {u.status === 'pending' ? (
                              <div style={{ display:'flex', gap:'0.4rem' }}>
                                <button className="sad-btn-approve">Approve</button>
                                <button className="sad-btn-reject">Reject</button>
                              </div>
                            ) : (
                              <button className="sad-btn-resolve">View</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══════════════ REPORTS ══════════════ */}
            {active === 'reports' && (
              <div className="sad-fade">
                <div className="sad-sec-hd">Reports & Exports</div>
                <div className="sad-2col">
                  {[
                    { name:'Attendance Report',    desc:'Weekly & monthly attendance summary for all children', icon:'📋', color:'#60a5fa' },
                    { name:'Feeding Scheme Report',desc:'Daily feeding data, totals, and nutritional tracking',  icon:'🍱', color:'#34d399' },
                    { name:'Welfare Report',        desc:'All flagged welfare concerns and resolution status',    icon:'🛡️', color:'#f87171' },
                    { name:'Child Registration',    desc:'Complete list of registered children with details',     icon:'👧', color:'#f0c000' },
                    { name:'Teacher Activity',      desc:'Teacher logins, attendance marking, and actions',       icon:'🧑‍🏫', color:'#a78bfa' },
                    { name:'Donor / Leadership',    desc:'Summary report formatted for church leadership review', icon:'📊', color:'#fb923c' },
                  ].map(r => (
                    <div key={r.name} className="sad-report-card">
                      <div className="sad-report-icon" style={{ background:`${r.color}15` }}>{r.icon}</div>
                      <div>
                        <div className="sad-report-name">{r.name}</div>
                        <div className="sad-report-desc">{r.desc}</div>
                      </div>
                      <button className="sad-export-btn">Export PDF</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}