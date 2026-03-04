import { useState } from 'react';

type Role = 'parent' | 'teacher' | 'admin';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  // App.tsx should route: parent → ParentRegisterPage, teacher → TeacherRegisterPage, admin → SuperAdminRegisterPage
  onContinue: (role: Role) => void;
}

const ROLES = [
  {
    id: 'parent' as Role,
    emoji: '👨‍👩‍👧',
    title: 'Parent / Caregiver',
    subtitle: 'Register and manage your children',
    color: '#34d399',
    description: 'Leadership — register kids, view attendance & give consent',
    can: [
      'Register and manage your children',
      'View attendance records',
      'Submit consent forms',
      'Receive welfare notifications',
    ],
    note: null,
  },
  {
    id: 'teacher' as Role,
    emoji: '🧑‍🏫',
    title: 'Teacher',
    subtitle: 'Operational admin — manage classes & attendance',
    color: '#f0c000',
    description: 'Operational admin — manage classes & attendance',
    can: [
      'Mark and view attendance',
      'Flag welfare concerns',
      'Record feeding scheme data',
      'Manage class registers',
    ],
    note: 'Requires approval from a Super Admin before access is granted.',
  },
  {
    id: 'admin' as Role,
    emoji: '🛡️',
    title: 'Super Admin',
    subtitle: 'Leadership — full system access & reporting',
    color: '#818cf8',
    description: 'Leadership — full system access & reporting',
    can: [
      'Full access to all data and reports',
      'Approve and manage user accounts',
      'Export PDF / Excel reports for donors',
      'Manage safeguarding and welfare workflows',
      'Configure classes, feeding schemes & settings',
    ],
    note: 'Reserved for Chairperson, Deputy, Secretary & Deputy Secretary.',
  },
];

export default function RegisterModal({ isOpen, onClose, onContinue }: RegisterModalProps) {
  const [selected, setSelected] = useState<Role | null>(null);

  if (!isOpen) return null;

  const activeRole = ROLES.find(r => r.id === selected);

  const handleContinue = () => {
    if (selected) {
      onContinue(selected);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#0f3d1a',
        border: '1px solid rgba(240,192,0,0.2)',
        borderRadius: '16px',
        width: '100%', maxWidth: '860px',
        maxHeight: '90vh', overflow: 'auto',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem 1rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '10px',
            background: '#f0c000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: '#0a2e12',
          }}>SS</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#fff', letterSpacing: 1 }}>
              CREATE ACCOUNT
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
              Sunday School Management Portal
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.4)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1,
            }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {/* Left — role list */}
          <div style={{ padding: '1.5rem', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginBottom: '1rem', fontFamily: "'DM Sans', sans-serif" }}>
              STEP 1 — CHOOSE YOUR ROLE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ROLES.map(role => (
                <div
                  key={role.id}
                  onClick={() => setSelected(role.id)}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    border: `1px solid ${selected === role.id ? role.color : 'rgba(255,255,255,0.08)'}`,
                    background: selected === role.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '8px',
                    background: 'rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem',
                  }}>{role.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: selected === role.id ? role.color : '#fff',
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.95rem',
                    }}>{role.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{role.subtitle}</div>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1rem' }}>→</span>
                </div>
              ))}
            </div>

            {/* POPIA */}
            <div style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              🔒 POPIA: Your data is handled lawfully and securely.
            </div>
          </div>

          {/* Right — role detail */}
          <div style={{ padding: '1.5rem' }}>
            {activeRole ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '10px',
                    background: 'rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>{activeRole.emoji}</div>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: activeRole.color, letterSpacing: 1 }}>
                      {activeRole.title.toUpperCase()}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{activeRole.description}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginBottom: '0.75rem' }}>WHAT YOU CAN DO</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {activeRole.can.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>
                      <span style={{ color: activeRole.color, marginTop: 1 }}>✓</span> {item}
                    </div>
                  ))}
                </div>

                {activeRole.note && (
                  <div style={{
                    background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
                    borderRadius: '8px', padding: '0.75rem 1rem',
                    color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem',
                    display: 'flex', gap: '0.5rem',
                  }}>
                    <span>ℹ</span> {activeRole.note}
                  </div>
                )}
              </>
            ) : (
              <div style={{
                height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', textAlign: 'center',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                ← Select a role to see details
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 2rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
            Already have an account?{' '}
            <span onClick={onClose} style={{ color: '#f0c000', cursor: 'pointer', textDecoration: 'underline' }}>
              Sign in instead
            </span>
          </div>
          <button
            onClick={handleContinue}
            disabled={!selected}
            style={{
              background: selected ? '#f0c000' : 'rgba(255,255,255,0.08)',
              color: selected ? '#0a2e12' : 'rgba(255,255,255,0.3)',
              border: 'none', borderRadius: '8px',
              padding: '0.75rem 1.75rem',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '0.9rem',
              cursor: selected ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {selected ? `Continue as ${ROLES.find(r => r.id === selected)?.title} →` : 'Select a role to continue'}
          </button>
        </div>
      </div>
    </div>
  );
}