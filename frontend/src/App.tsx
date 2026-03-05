import { useState } from 'react';
import './index.css';

import LandingPage            from './features/landingpage/LandingPage';
import LoginPage              from './features/auth/LoginPage';
import RegisterModal          from './components/ui/RegisterModal';
import SuperAdminRegisterPage from './features/auth/SuperAdminRegisterPage';
import SuperAdminDashboard    from './features/dashboard/SuperAdminDashboard';
import ParentRegisterPage     from './features/auth/ParentRegisterPage';
import ParentDashboard        from './features/dashboard/ParentDashboard';
import TeacherRegisterPage    from './features/auth/TeacherRegisterPage';
import TeacherDashboard       from './features/dashboard/TeacherDashboard';
import ChildRegisterForm      from './features/children/ChildRegisterForm';
import { userStore }          from './stores/userStore';

type UserRole = 'parent' | 'teacher' | 'super_admin';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

type Screen =
  | 'landing'
  | 'login'
  | 'admin-register'
  | 'admin-dashboard'
  | 'teacher-register'
  | 'teacher-register-pending'
  | 'teacher-dashboard'
  | 'parent-register'
  | 'parent-dashboard'
  | 'child-register';

export default function App() {
  const [screen, setScreen]               = useState<Screen>('landing');
  const [showRegisterModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser]     = useState<CurrentUser | null>(null);
  const [adminName, setAdminName]         = useState('Admin');
  const [adminPosition, setAdminPosition] = useState('Super Admin');

  const handleRoleSelected = (role: 'parent' | 'teacher' | 'admin') => {
    setShowModal(false);
    if (role === 'admin')   setScreen('admin-register');
    if (role === 'teacher') setScreen('teacher-register');
    if (role === 'parent')  setScreen('parent-register');
  };

  // Called after SuperAdminRegisterPage saves user + sessionStorage, then calls onSuccess
  const handleAdminRegisterSuccess = () => {
    // Read from sessionStorage — written by SuperAdminRegisterPage just before calling us
    try {
      const stored = sessionStorage.getItem('currentUser');
      if (stored) {
        const u = JSON.parse(stored) as CurrentUser;
        setCurrentUser(u);
        setAdminName(u.name || 'Admin');

        // Also fetch position from userStore (richer data)
        const su = userStore.findByEmail(u.email) as any;
        setAdminPosition(su?.position || 'Super Admin');

        setScreen('admin-dashboard');
        return;
      }
    } catch (_) {}

    // Fallback: read last registered super_admin from userStore
    const allUsers = userStore.getAll();
    const admins   = allUsers.filter((u: any) => u.role === 'super_admin');
    const last     = admins[admins.length - 1];

    if (last) {
      setAdminName(last.name);
      setAdminPosition((last as any).position || 'Super Admin');
      setCurrentUser({
        id:    last.id,
        name:  last.name,
        email: last.email,
        phone: (last as any).phone ?? '',
        role:  'super_admin',
      });
    }

    setScreen('admin-dashboard'); // always navigate
  };

  const handleLoginSuccess = (role: UserRole) => {
    try {
      const stored = sessionStorage.getItem('currentUser');
      if (stored) {
        const u = JSON.parse(stored) as CurrentUser;
        setCurrentUser(u);
        if (role === 'super_admin') {
          const su = userStore.findByEmail(u.email) as any;
          setAdminName(u.name || 'Admin');
          setAdminPosition(su?.position || 'Super Admin');
        }
      }
    } catch (_) {}

    if (role === 'super_admin') setScreen('admin-dashboard');
    if (role === 'teacher')     setScreen('teacher-dashboard');
    if (role === 'parent')      setScreen('parent-dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    setCurrentUser(null);
    setAdminName('Admin');
    setAdminPosition('Super Admin');
    setScreen('landing');
  };

  return (
    <>
      {screen === 'landing' && (
        <>
          <LandingPage
            onLogin={() => setScreen('login')}
            onRegister={() => setShowModal(true)}
          />
          <RegisterModal
            isOpen={showRegisterModal}
            onClose={() => setShowModal(false)}
            onContinue={handleRoleSelected}
          />
        </>
      )}

      {screen === 'login' && (
        <LoginPage
          onSuccess={handleLoginSuccess}
          onRegister={() => { setScreen('landing'); setShowModal(true); }}
          onBack={() => setScreen('landing')}
        />
      )}

      {screen === 'admin-register' && (
        <SuperAdminRegisterPage
          onBack={() => { setScreen('landing'); setShowModal(true); }}
          onLoginInstead={() => setScreen('login')}
          onSuccess={handleAdminRegisterSuccess}
        />
      )}

      {screen === 'admin-dashboard' && (
        <SuperAdminDashboard
          adminName={adminName}
          adminPosition={adminPosition}
          onLogout={handleLogout}
          onRegisterChild={() => setScreen('child-register')}
        />
      )}

      {screen === 'teacher-register' && (
        <TeacherRegisterPage
          onBack={() => { setScreen('landing'); setShowModal(true); }}
          onLoginInstead={() => setScreen('login')}
          onSuccess={() => setScreen('teacher-register-pending')}
        />
      )}

      {screen === 'teacher-register-pending' && (
        <PendingApproval
          onBack={() => setScreen('login')}
          onGoToDashboard={() => setScreen('teacher-dashboard')}
        />
      )}

      {screen === 'teacher-dashboard' && (
        <TeacherDashboard
          user={currentUser ?? undefined}
          onLogout={handleLogout}
        />
      )}

      {screen === 'parent-register' && (
        <ParentRegisterPage
          onBack={() => { setScreen('landing'); setShowModal(true); }}
          onLoginInstead={() => setScreen('login')}
          onSuccess={() => setScreen('parent-dashboard')}
        />
      )}

      {screen === 'parent-dashboard' && (
        <ParentDashboard
          user={currentUser ?? undefined}
          onLogout={handleLogout}
          onRegisterChild={() => {}}
        />
      )}

      {screen === 'child-register' && (
        <ChildRegisterForm onBack={() => setScreen('admin-dashboard')} />
      )}
    </>
  );
}

function PendingApproval({ onBack, onGoToDashboard }: { onBack: () => void; onGoToDashboard: () => void }) {
  return (
    <div style={{ minHeight: '100dvh', width: '100%', background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 65%), #060f08', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", color: '#fff', padding: '24px' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.028)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 'clamp(28px,5vw,48px)', boxShadow: '0 32px 80px rgba(0,0,0,0.55)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>⏳</div>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>Application Submitted!</div>
        <p style={{ color: 'rgba(184,212,220,0.7)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 20 }}>
          Your teacher registration is under review. A <strong style={{ color: '#60a5fa' }}>Super Admin</strong> will approve your account before you can sign in.
        </p>
        <div style={{ padding: '12px 16px', borderRadius: 9, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
          ℹ This is required for safeguarding and POPIA compliance.
        </div>
        <div style={{ padding: '12px 16px', borderRadius: 9, marginBottom: 16, background: 'rgba(251,191,36,0.06)', border: '1px dashed rgba(251,191,36,0.3)' }}>
          <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>🧪 Testing Only</div>
          <button onClick={onGoToDashboard} style={{ width: '100%', padding: '0.72rem', borderRadius: 8, border: '1px solid rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.12)', color: '#fbbf24', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>My Dashboard →</button>
        </div>
        <button onClick={onBack} style={{ width: '100%', padding: '0.82rem', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #60a5fa, #2563eb)', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Back to Sign In</button>
      </div>
    </div>
  );
}