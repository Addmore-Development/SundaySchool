// src/App.tsx
import { useState } from 'react';
import './index.css';

import LandingPage            from './features/landingpage/LandingPage';
import LoginPage              from './features/auth/LoginPage';
import RegisterModal          from './components/ui/RegisterModal';
import SuperAdminRegisterPage from './features/auth/SuperAdminRegisterPage';
import SuperAdminLoginPage    from './features/auth/SuperAdminLoginPage';
import SuperAdminDashboard    from './features/dashboard/SuperAdminDashboard';
import ParentRegisterPage     from './features/auth/ParentRegisterPage';
import ParentDashboard        from './features/dashboard/ParentDashboard';

type Screen =
  | 'landing'
  | 'login'
  | 'admin-register'
  | 'admin-login'
  | 'admin-dashboard'
  | 'teacher-register'
  | 'parent-register'
  | 'parent-dashboard';

export default function App() {
  const [screen, setScreen]               = useState<Screen>('landing');
  const [showRegisterModal, setShowModal] = useState(false);

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
            if (role === 'super_admin') setScreen('admin-dashboard');
            if (role === 'parent')      setScreen('parent-dashboard');
            if (role === 'teacher')     setScreen('parent-dashboard'); // update when TeacherDashboard exists
          }}
          onRegister={() => setShowModal(true)}
          onBack={() => setScreen('landing')}
        />
      )}

      {/* ── SUPER ADMIN REGISTER ── */}
      {screen === 'admin-register' && (
        <SuperAdminRegisterPage
          onBack={() => { setScreen('landing'); setShowModal(true); }}
          onLoginInstead={() => setScreen('admin-login')}
          onSuccess={() => setScreen('admin-dashboard')}
        />
      )}

      {/* ── SUPER ADMIN LOGIN ── */}
      {screen === 'admin-login' && (
        <SuperAdminLoginPage
          onBack={() => setScreen('landing')}
          onRegisterInstead={() => setScreen('admin-register')}
          onSuccess={() => setScreen('admin-dashboard')}
        />
      )}

      {/* ── SUPER ADMIN DASHBOARD ── */}
      {screen === 'admin-dashboard' && (
        <SuperAdminDashboard
          adminName="Chairperson"
          adminPosition="Chairperson"
          onLogout={() => setScreen('landing')}
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