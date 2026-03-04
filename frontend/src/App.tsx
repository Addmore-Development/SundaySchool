// src/App.tsx
import { useState } from 'react';
import './index.css';

import LandingPage            from './features/landingpage/LandingPage';
import LoginPage              from './features/auth/LoginPage';
import RegisterModal          from './components/ui/RegisterModal';
import SuperAdminRegisterPage from './features/auth/SuperAdminRegisterPage';
import SuperAdminDashboard    from './features/dashboard/SuperAdminDashboard';

type Screen = 'landing' | 'login' | 'admin-register' | 'admin-dashboard' | 'teacher-register' | 'parent-register';
type ModalRole = 'parent' | 'teacher' | 'admin';

export default function App() {
  const [screen, setScreen]               = useState<Screen>('landing');
  const [showRegisterModal, setShowModal] = useState(false);
  const [adminInfo, setAdminInfo]         = useState({ name: 'Admin', position: 'Chairperson' });

  const handleRoleSelected = (role: ModalRole) => {
    console.log('Role selected:', role);   // ← keep this temporarily
    setShowModal(false);
    switch (role) {
      case 'admin':   setScreen('admin-register');   break;
      case 'teacher': setScreen('teacher-register'); break;
      case 'parent':  setScreen('parent-register');  break;
    }
  };

  const handleLoginSuccess = (user: { name: string; role: string; email: string; position?: string }) => {
    if (user.role === 'super_admin') {
      setAdminInfo({ name: user.name, position: user.position ?? 'Super Admin' });
      setScreen('admin-dashboard');
    }
  };

  const handleOpenRegister = () => {
    console.log('Opening register modal');  // ← keep this temporarily
    setShowModal(true);
  };

  return (
    <>
      {screen === 'landing' && (
        <>
          <LandingPage
            onLogin={() => setScreen('login')}
            onRegister={handleOpenRegister}
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
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setScreen('landing')}
        />
      )}

      {screen === 'admin-register' && (
        <SuperAdminRegisterPage
          onBack={() => { setShowModal(true); setScreen('landing'); }}
          onLoginInstead={() => setScreen('login')}
          onSuccess={() => setScreen('admin-dashboard')}
        />
      )}

      {screen === 'admin-dashboard' && (
        <SuperAdminDashboard
          adminName={adminInfo.name}
          adminPosition={adminInfo.position}
          onLogout={() => setScreen('landing')}
        />
      )}

      {screen === 'teacher-register' && (
        <div style={{ minHeight:'100vh', background:'#0a2e12', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem', color:'#fff', fontFamily:"'DM Sans',sans-serif", textAlign:'center' }}>
          <div style={{ fontSize:'3rem' }}>🧑‍🏫</div>
          <div style={{ fontSize:'1.5rem', color:'#f0c000' }}>Teacher Registration — Coming Soon</div>
          <button onClick={() => { setScreen('landing'); setShowModal(true); }} style={{ marginTop:'1rem', background:'none', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.6)', padding:'0.6rem 1.5rem', borderRadius:'8px', cursor:'pointer' }}>← Back</button>
        </div>
      )}

      {screen === 'parent-register' && (
        <div style={{ minHeight:'100vh', background:'#0a2e12', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem', color:'#fff', fontFamily:"'DM Sans',sans-serif", textAlign:'center' }}>
          <div style={{ fontSize:'3rem' }}>👨‍👩‍👧</div>
          <div style={{ fontSize:'1.5rem', color:'#34d399' }}>Parent Registration — Coming Soon</div>
          <button onClick={() => { setScreen('landing'); setShowModal(true); }} style={{ marginTop:'1rem', background:'none', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.6)', padding:'0.6rem 1.5rem', borderRadius:'8px', cursor:'pointer' }}>← Back</button>
        </div>
      )}
    </>
  );
}