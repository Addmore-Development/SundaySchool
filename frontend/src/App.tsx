// src/App.tsx
import { useState } from 'react';
import './index.css';

import LandingPage            from './features/landingpage/LandingPage';
import LoginPage              from './features/auth/LoginPage';
import RegisterModal          from './components/ui/RegisterModal';
import SuperAdminRegisterPage from './features/auth/SuperAdminRegisterPage';
import SuperAdminDashboard    from './features/dashboard/SuperAdminDashboard';
import ParentRegisterPage     from './features/auth/ParentRegisterPage';
import ParentDashboard        from './features/dashboard/ParentDashboard';
import ChildRegisterForm      from './features/children/ChildRegisterForm';
import { userStore }          from './stores/userStore';

type Screen =
  | 'landing'
  | 'login'
  | 'admin-register'
  | 'admin-dashboard'
  | 'teacher-register'
  | 'parent-register'
  | 'parent-dashboard'
  | 'child-register';

export default function App() {
  const [screen, setScreen]               = useState<Screen>('landing');
  const [showRegisterModal, setShowModal] = useState(false);

  // ── Track logged-in admin info so the dashboard shows the real name/position
  const [adminInfo, setAdminInfo] = useState({ name: 'Admin', position: 'Super Admin' });

  const handleRoleSelected = (role: 'parent' | 'teacher' | 'admin') => {
    setShowModal(false);
    if (role === 'admin')   setScreen('admin-register');
    if (role === 'teacher') setScreen('teacher-register');
    if (role === 'parent')  setScreen('parent-register');
  };

  return (
    <>
      {/* ── LANDING ── */}
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

      {/* ── MAIN LOGIN PAGE (all roles) ── */}
      {screen === 'login' && (
        <LoginPage
          onSuccess={(role) => {
            if (role === 'super_admin') {
              // ── Pull the last registered/seeded admin from the store that matches
              // LoginPage already validated credentials so we just grab from store
              // We can't pass the user object directly through onSuccess(role) but we
              // can look them up from sessionStorage or a simple exported getter.
              // Simplest approach: store the last logged-in user in a module-level ref.
              // Since userStore is in-memory and login already found the user,
              // we look up all users and find the most recently relevant one via
              // a lightweight re-lookup using the email typed (we don't have it here,
              // so instead we expose a lastLogin getter in userStore).
              const last = userStore.getLastLogin();
              if (last) {
                setAdminInfo({ name: last.name, position: last.position ?? 'Super Admin' });
              }
              setScreen('admin-dashboard');
            }
            if (role === 'parent')  setScreen('parent-dashboard');
            if (role === 'teacher') setScreen('parent-dashboard');
          }}
          onRegister={() => setShowModal(true)}
          onBack={() => setScreen('landing')}
        />
      )}

      {/* ── SUPER ADMIN REGISTER ── */}
      {screen === 'admin-register' && (
        <SuperAdminRegisterPage
          onBack={() => { setScreen('landing'); setShowModal(true); }}
          onLoginInstead={() => setScreen('login')}
          onSuccess={() => setScreen('admin-dashboard')}
        />
      )}

      {/* ── SUPER ADMIN DASHBOARD ── */}
      {screen === 'admin-dashboard' && (
        <SuperAdminDashboard
          adminName={adminInfo.name}
          adminPosition={adminInfo.position}
          onLogout={() => setScreen('landing')}
          onRegisterChild={() => setScreen('child-register')}
        />
      )}

      {/* ── PARENT REGISTER ── */}
      {screen === 'parent-register' && (
        <ParentRegisterPage
          onBack={() => { setScreen('landing'); setShowModal(true); }}
          onLoginInstead={() => setScreen('login')}
          onSuccess={() => setScreen('parent-dashboard')}
        />
      )}

      {/* ── PARENT DASHBOARD ── */}
      {screen === 'parent-dashboard' && (
        <ParentDashboard
          onLogout={() => setScreen('landing')}
          onRegisterChild={() => setScreen('parent-register')}
        />
      )}

      {/* ── CHILD REGISTER ── */}
      {screen === 'child-register' && (
        <ChildRegisterForm
          onBack={() => setScreen('admin-dashboard')}
        />
      )}

      {/* ── TEACHER REGISTER (placeholder) ── */}
      {screen === 'teacher-register' && (
        <div style={{
          minHeight: '100vh', width: '100%', background: '#0a2e12',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif", color: '#fff',
          textAlign: 'center', flexDirection: 'column', gap: '1rem',
        }}>
          <div style={{ fontSize: '3rem' }}>🧑‍🏫</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: '#f0c000', letterSpacing: 2 }}>
            Teacher Registration — Coming Soon
          </div>
          <button
            onClick={() => { setScreen('landing'); setShowModal(true); }}
            style={{ marginTop: '1rem', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
          >← Back</button>
        </div>
      )}
    </>
  );
}