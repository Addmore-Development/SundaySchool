// src/App.tsx
import { useState } from 'react';
import './index.css';

import LandingPage            from './features/landingpage/LandingPage';
import RegisterModal          from './components/ui/RegisterModal';
import SuperAdminRegisterPage from './features/auth/SuperAdminRegisterPage';
import SuperAdminLoginPage    from './features/auth/SuperAdminLoginPage';
import SuperAdminDashboard    from './features/dashboard/SuperAdminDashboard';

type Screen =
  | 'landing'
  | 'admin-register'
  | 'admin-login'
  | 'admin-dashboard'
  | 'teacher-register'
  | 'parent-register';

export default function App() {
  const [screen, setScreen]               = useState<Screen>('landing');
  const [showRegisterModal, setShowModal] = useState(false);
  // Store admin name from registration to pass to dashboard
  const [adminInfo, setAdminInfo]         = useState({ name: 'Admin', position: 'Chairperson' });

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
            onLogin={() => setScreen('admin-login')}
            onRegister={() => setShowModal(true)}
          />
          <RegisterModal
            isOpen={showRegisterModal}
            onClose={() => setShowModal(false)}
            onContinue={handleRoleSelected}
          />
        </>
      )}

      {/* ── SUPER ADMIN REGISTER — goes to dashboard on success ── */}
      {screen === 'admin-register' && (
        <SuperAdminRegisterPage
          onBack={() => { setScreen('landing'); setShowModal(true); }}
          onLoginInstead={() => setScreen('admin-login')}
          onSuccess={() => setScreen('admin-dashboard')}
        />
      )}

      {/* ── SUPER ADMIN LOGIN — goes to dashboard on success ── */}
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
          adminName={adminInfo.name}
          adminPosition={adminInfo.position}
          onLogout={() => setScreen('landing')}
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

      {/* ── PARENT REGISTER (placeholder) ── */}
      {screen === 'parent-register' && (
        <div style={{
          minHeight: '100vh', width: '100%', background: '#0a2e12',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif", color: '#fff',
          textAlign: 'center', flexDirection: 'column', gap: '1rem',
        }}>
          <div style={{ fontSize: '3rem' }}>👨‍👩‍👧</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: '#34d399', letterSpacing: 2 }}>
            Parent Registration — Coming Soon
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