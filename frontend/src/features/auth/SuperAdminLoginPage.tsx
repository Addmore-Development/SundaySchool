// src/features/auth/SuperAdminLoginPage.tsx

import { useState } from 'react';

interface SuperAdminLoginPageProps {
  onBack?: () => void;
  onSuccess?: () => void;
  onRegisterInstead?: () => void;
}

export default function SuperAdminLoginPage({
  onBack,
  onSuccess,
  onRegisterInstead,
}: SuperAdminLoginPageProps) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email.trim())    e.email    = 'Required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password.trim()) e.password = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    setLoading(true);
    // Simulate API call — replace with real auth call
    setTimeout(() => {
      setLoading(false);
      console.log('Super Admin Login:', { email, password });
      onSuccess?.();
    }, 1200);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sal-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #0a2e12;
          background-image:
            radial-gradient(ellipse at 15% 0%, rgba(167,139,250,0.09) 0%, transparent 50%),
            radial-gradient(ellipse at 85% 100%, rgba(10,46,18,0.9) 0%, transparent 50%);
          display: flex; align-items: center; justify-content: center;
          padding: 2rem 1rem;
        }

        .sal-wrap { width: 100%; max-width: 440px; }

        .sal-back {
          display: flex; align-items: center; gap: 0.5rem;
          background: none; border: none; color: rgba(255,255,255,0.35);
          font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
          cursor: pointer; margin-bottom: 1.5rem; padding: 0; transition: color 0.15s;
        }
        .sal-back:hover { color: #a78bfa; }

        .sal-card {
          background: #0f3d1a;
          border: 1px solid rgba(167,139,250,0.18);
          border-radius: 18px; overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.55);
        }

        /* header */
        .sal-header {
          background: linear-gradient(135deg, #0d3318 0%, #110c2a 100%);
          border-bottom: 1px solid rgba(167,139,250,0.18);
          padding: 1.75rem 2rem; position: relative; overflow: hidden;
          display: flex; align-items: center; gap: 1rem;
        }
        .sal-header::after {
          content: '';
          position: absolute; top: -30px; right: -30px;
          width: 150px; height: 150px;
          background: radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%);
          border-radius: 50%;
        }

        .sal-icon {
          width: 52px; height: 52px;
          background: rgba(167,139,250,0.1);
          border: 1.5px solid rgba(167,139,250,0.28);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.65rem; flex-shrink: 0; position: relative; z-index: 1;
        }

        .sal-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.65rem; letter-spacing: 2px;
          color: #a78bfa; line-height: 1; position: relative; z-index: 1;
        }
        .sal-sub { font-size: 0.75rem; color: rgba(255,255,255,0.38); margin-top: 0.25rem; position: relative; z-index: 1; }

        /* body */
        .sal-body { padding: 1.75rem 2rem 2rem; }

        .sal-sec {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.9rem; letter-spacing: 1.5px;
          color: #a78bfa; margin-bottom: 1rem;
          padding-bottom: 0.45rem;
          border-bottom: 1px solid rgba(167,139,250,0.15);
        }

        .sal-field { display: flex; flex-direction: column; margin-bottom: 1rem; }

        .sal-lbl {
          font-size: 0.68rem; font-weight: 700;
          color: rgba(255,255,255,0.38); text-transform: uppercase;
          letter-spacing: 0.6px; margin-bottom: 0.4rem;
        }

        .sal-inp {
          width: 100%; background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 0.65rem 0.9rem;
          color: #fff; font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sal-inp:focus { border-color: #a78bfa; box-shadow: 0 0 0 3px rgba(167,139,250,0.14); }
        .sal-inp.err   { border-color: #f87171 !important; }
        .sal-inp::placeholder { color: rgba(255,255,255,0.2); }

        .sal-err { font-size: 0.72rem; color: #f87171; margin-top: 0.3rem; font-weight: 500; }

        .sal-pw-wrap { position: relative; }
        .sal-pw-wrap .sal-inp { padding-right: 2.75rem; }
        .sal-pw-eye {
          position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: rgba(255,255,255,0.3);
          cursor: pointer; font-size: 1rem; padding: 0; transition: color 0.15s;
        }
        .sal-pw-eye:hover { color: #a78bfa; }

        .sal-forgot {
          text-align: right; margin-bottom: 1.5rem;
        }
        .sal-forgot button {
          background: none; border: none; color: rgba(167,139,250,0.6);
          font-size: 0.75rem; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; padding: 0; transition: color 0.15s;
        }
        .sal-forgot button:hover { color: #a78bfa; }

        .sal-hr { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 1.5rem 0; }

        /* login button */
        .btn-purple {
          width: 100%; background: #a78bfa; color: #fff;
          border: none; padding: 0.8rem;
          border-radius: 9px; font-size: 0.95rem; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .btn-purple:hover:not(:disabled) { background: #b99ffb; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(167,139,250,0.38); }
        .btn-purple:disabled { opacity: 0.6; cursor: not-allowed; }

        /* spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: spin 0.7s linear infinite;
        }

        /* divider */
        .sal-or {
          display: flex; align-items: center; gap: 0.75rem;
          color: rgba(255,255,255,0.2); font-size: 0.75rem; font-weight: 600;
          margin: 1.25rem 0;
        }
        .sal-or::before, .sal-or::after {
          content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.07);
        }

        .btn-ghost {
          width: 100%; background: transparent; color: rgba(255,255,255,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.7rem; border-radius: 9px; font-size: 0.875rem; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: rgba(167,139,250,0.35); color: #a78bfa; }

        /* access notice */
        .sal-notice {
          background: rgba(167,139,250,0.06);
          border: 1px solid rgba(167,139,250,0.15);
          border-radius: 9px; padding: 0.8rem 1rem;
          font-size: 0.78rem; color: rgba(255,255,255,0.5);
          display: flex; gap: 0.6rem; margin-bottom: 1.5rem; line-height: 1.5;
        }
      `}</style>

      <div className="sal-page">
        <div className="sal-wrap">

          <button className="sal-back" onClick={onBack}>← Back to role selection</button>

          <div className="sal-card">

            {/* Header */}
            <div className="sal-header">
              <div className="sal-icon">🛡️</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="sal-title">Super Admin</div>
                <div className="sal-sub">Secure leadership access</div>
              </div>
            </div>

            <div className="sal-body">

              <div className="sal-notice">
                <span>🔒</span>
                <span>
                  This portal is restricted to <strong style={{ color: '#a78bfa' }}>approved Super Admins</strong> only.
                  Your account must be verified before login is permitted.
                </span>
              </div>

              <div className="sal-sec">Sign In</div>

              <div className="sal-field">
                <label className="sal-lbl">Email Address</label>
                <input
                  className={`sal-inp${errors.email ? ' err' : ''}`}
                  type="email" placeholder="your@email.com"
                  value={email} onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: '' })); }}
                />
                {errors.email && <span className="sal-err">{errors.email}</span>}
              </div>

              <div className="sal-field">
                <label className="sal-lbl">Password</label>
                <div className="sal-pw-wrap">
                  <input
                    className={`sal-inp${errors.password ? ' err' : ''}`}
                    type={showPw ? 'text' : 'password'} placeholder="Your password"
                    value={password} onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: '' })); }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button className="sal-pw-eye" type="button" onClick={() => setShowPw(s => !s)}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <span className="sal-err">{errors.password}</span>}
              </div>

              <div className="sal-forgot">
                <button type="button" onClick={() => alert('Password reset coming soon')}>
                  Forgot password?
                </button>
              </div>

              <button className="btn-purple" onClick={handleLogin} disabled={loading}>
                {loading ? <><div className="spinner" /> Signing in…</> : 'Sign In →'}
              </button>

              <div className="sal-or">or</div>

              <button className="btn-ghost" onClick={onRegisterInstead}>
                Request a Super Admin Account
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.18)', fontFamily: "'DM Sans',sans-serif" }}>
            POPIA: Handle data lawfully &amp; securely. · Sunday School Management Portal
          </p>
        </div>
      </div>
    </>
  );
}