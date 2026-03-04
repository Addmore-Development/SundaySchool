// frontend/src/features/auth/LoginPage.tsx
// Centered login form — no left panel.

import React, { useState, useEffect, useCallback } from 'react'

type UserRole = 'parent' | 'teacher' | 'super_admin'

interface MockUser {
  id: string; name: string; email: string; role: UserRole; phone: string; password: string
}
interface Toast {
  id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string
}
interface LoginPageProps {
  onSuccess:  (role: UserRole) => void
  onRegister: () => void
  onBack:     () => void
}

const MOCK_USERS: MockUser[] = [
  { id: 'u-001', name: 'Nomsa Dlamini',    email: 'parent@demo.church',  password: 'Parent@123',  role: 'parent',      phone: '+27 82 111 2233' },
  { id: 'u-002', name: 'Thabo Mokoena',    email: 'teacher@demo.church', password: 'Teacher@123', role: 'teacher',     phone: '+27 73 444 5566' },
  { id: 'u-003', name: 'Pastor Sipho Nkosi', email: 'admin@demo.church', password: 'Admin@123',   role: 'super_admin', phone: '+27 71 777 8899' },
]

function mockLogin(email: string, password: string): Promise<MockUser> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      )
      user ? resolve(user) : reject(new Error('Invalid email or password. Please try again.'))
    }, 900)
  })
}

function validate(email: string, password: string) {
  const e: Record<string, string> = {}
  if (!email.trim()) e.email = 'Email address is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address.'
  if (!password) e.password = 'Password is required.'
  else if (password.length < 6) e.password = 'Password must be at least 6 characters.'
  return e
}

const IconMail = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const IconLock = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)
const IconEye = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconEyeOff = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const IconSpinner = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: 'lp-spin 0.75s linear infinite', display: 'block' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
  </svg>
)
const IconShield = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const TOAST_COLORS: Record<Toast['type'], { bg: string; border: string; icon: string }> = {
  success: { bg: 'rgba(10,50,22,0.97)',  border: '#4ade80', icon: '#4ade80' },
  error:   { bg: 'rgba(60,12,12,0.97)',  border: '#f87171', icon: '#f87171' },
  warning: { bg: 'rgba(55,38,5,0.97)',   border: '#fbbf24', icon: '#fbbf24' },
  info:    { bg: 'rgba(8,35,65,0.97)',   border: '#60a5fa', icon: '#60a5fa' },
}
const TOAST_SVG: Record<Toast['type'], string> = {
  success: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
  error:   `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`,
  warning: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
  info:    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 16v-4m0-4h.01"/></svg>`,
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const c = TOAST_COLORS[toast.type]
  const D = 4000
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const t1 = setTimeout(() => setExiting(true), D)
    const t2 = setTimeout(() => onRemove(toast.id), D + 350)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [toast.id, onRemove])
  const dismiss = () => { setExiting(true); setTimeout(() => onRemove(toast.id), 350) }
  return (
    <div role="alert" onClick={dismiss} style={{
      position: 'relative', overflow: 'hidden',
      background: c.bg, border: `1px solid ${c.border}`, borderLeft: `4px solid ${c.border}`,
      borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start',
      minWidth: 280, maxWidth: 360, boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
      cursor: 'pointer', marginBottom: 8,
      transform: visible && !exiting ? 'translateX(0) scale(1)' : 'translateX(110%) scale(0.94)',
      opacity: visible && !exiting ? 1 : 0,
      transition: 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1), opacity 0.32s ease',
    }}>
      <span style={{ color: c.icon, flexShrink: 0, marginTop: 1 }} dangerouslySetInnerHTML={{ __html: TOAST_SVG[toast.type] }}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: toast.message ? 2 : 0 }}>{toast.title}</div>
        {toast.message && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>{toast.message}</div>}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, background: c.border, opacity: 0.6, animation: `lp-progress ${D}ms linear forwards` }}/>
    </div>
  )
}

function ToastStack({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      {toasts.map(t => <div key={t.id} style={{ pointerEvents: 'all' }}><ToastItem toast={t} onRemove={onRemove}/></div>)}
    </div>
  )
}

export default function LoginPage({ onSuccess, onRegister, onBack }: LoginPageProps) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [touched, setTouched]   = useState<Record<string, boolean>>({})
  const [toasts, setToasts]     = useState<Toast[]>([])
  const [mounted, setMounted]   = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    setToasts(prev => [{ ...t, id: `${Date.now()}-${Math.random()}` }, ...prev].slice(0, 3))
  }, [])
  const removeToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), [])

  const toast = {
    success: (title: string, msg?: string) => addToast({ type: 'success', title, message: msg }),
    error:   (title: string, msg?: string) => addToast({ type: 'error',   title, message: msg }),
    warning: (title: string, msg?: string) => addToast({ type: 'warning', title, message: msg }),
  }

  const handleBlur = (f: string) => setTouched(p => ({ ...p, [f]: true }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    const errs = validate(email, password)
    if (Object.keys(errs).length) { setErrors(errs); toast.warning('Check your details', 'Fix the errors below before continuing.'); return }
    setErrors({})
    setLoading(true)
    try {
      const user = await mockLogin(email, password)
      sessionStorage.setItem('currentUser', JSON.stringify(user))
      toast.success('Welcome back!', `Signed in as ${user.name}`)
      setTimeout(() => onSuccess(user.role), 800)
    } catch (err) {
      toast.error('Login failed', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <ToastStack toasts={toasts} onRemove={removeToast}/>

      <div className="lp-root" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.45s ease' }}>
        <div className="lp-card">

          {/* Brand */}
          <div className="lp-brand">
            <div className="lp-brand-badge"><IconShield/></div>
            <div>
              <div className="lp-brand-name">Sunday School</div>
              <div className="lp-brand-sub">Management Portal</div>
            </div>
          </div>

          <div className="lp-form-header">
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to access the portal</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="lp-form">

            {/* Email */}
            <div className={`lp-field${touched.email && errors.email ? ' lp-field-err' : ''}`}>
              <label htmlFor="lp-email">Email Address</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon"><IconMail/></span>
                <input
                  id="lp-email" type="email" autoComplete="email"
                  placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')} disabled={loading}
                  aria-invalid={!!(touched.email && errors.email)}
                />
              </div>
              {touched.email && errors.email && <span className="lp-err-msg" role="alert">⚠ {errors.email}</span>}
            </div>

            {/* Password */}
            <div className={`lp-field${touched.password && errors.password ? ' lp-field-err' : ''}`}>
              <div className="lp-label-row">
                <label htmlFor="lp-password">Password</label>
                <button type="button" className="lp-forgot" tabIndex={-1}>Forgot password?</button>
              </div>
              <div className="lp-input-wrap">
                <span className="lp-input-icon"><IconLock/></span>
                <input
                  id="lp-password" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')} disabled={loading}
                  aria-invalid={!!(touched.password && errors.password)}
                />
                <button type="button" className="lp-eye" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide' : 'Show'}>
                  {showPw ? <IconEyeOff/> : <IconEye/>}
                </button>
              </div>
              {touched.password && errors.password && <span className="lp-err-msg" role="alert">⚠ {errors.password}</span>}
            </div>

            <button type="submit" className="lp-btn-submit" disabled={loading}>
              {loading ? <><IconSpinner/> Signing in…</> : <>Sign In <span className="lp-arrow">→</span></>}
            </button>

          </form>

          <div className="lp-register-row">
            Don't have an account?{' '}
            <button type="button" className="lp-register-link" onClick={onRegister}>Create account</button>
          </div>

          <div className="lp-hint">
            <span className="lp-hint-badge">DEMO</span>
            <span>
              <strong style={{ color: 'rgba(253,228,44,0.85)' }}>parent@demo.church</strong> / Parent@123
              {' · '}
              <strong style={{ color: 'rgba(253,228,44,0.85)' }}>teacher@demo.church</strong> / Teacher@123
              {' · '}
              <strong style={{ color: 'rgba(253,228,44,0.85)' }}>admin@demo.church</strong> / Admin@123
            </span>
          </div>

          <button className="lp-back" onClick={onBack}>← Back to home</button>

        </div>
      </div>
    </>
  )
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root {
  min-height: 100dvh;
  width: 100%;
  background: #060f08; color: #fff;
  font-family: 'DM Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased;
}
:focus-visible { outline: 2px solid #fde42c; outline-offset: 2px; }
::selection { background: rgba(253,228,44,0.22); color: #fff; }

@keyframes lp-spin     { to { transform: rotate(360deg); } }
@keyframes lp-progress { from { width: 100%; } to { width: 0%; } }
@keyframes lp-fadeUp   { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes lp-slideDown{ from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

/* ── Root — full-screen centered ── */
.lp-root {
  min-height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background:
    radial-gradient(ellipse 70% 60% at 50% 0%, rgba(13,96,48,0.45) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 50% 100%, rgba(34,197,94,0.12) 0%, transparent 60%),
    #060f08;
}

/* ── Card ── */
.lp-card {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  background: rgba(255,255,255,0.028);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: clamp(28px,5vw,44px);
  box-shadow: 0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04);
  animation: lp-fadeUp 0.55s ease both;
}

/* Brand */
.lp-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.lp-brand-badge {
  width: 42px; height: 42px; border-radius: 11px;
  background: linear-gradient(135deg, #fde42c, #f5c800);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 0 4px rgba(253,228,44,0.14); color: #0a4d20; flex-shrink: 0;
}
.lp-brand-name { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 15px; color: #fff; letter-spacing: -0.2px; line-height: 1.2; }
.lp-brand-sub  { font-size: 11px; color: rgba(184,212,193,0.55); text-transform: uppercase; letter-spacing: 0.6px; margin-top: 2px; }

/* Header */
.lp-form-header { margin-bottom: 26px; }
.lp-form-header h2 { font-family: 'Sora', sans-serif; font-size: clamp(18px,2.5vw,24px); font-weight: 800; color: #fff; letter-spacing: -0.4px; margin-bottom: 4px; }
.lp-form-header p  { color: rgba(184,212,193,0.55); font-size: 13.5px; }

/* Form */
.lp-form { display: flex; flex-direction: column; gap: 17px; }
.lp-field { display: flex; flex-direction: column; gap: 6px; }
.lp-field label { font-size: 12.5px; font-weight: 600; color: rgba(255,255,255,0.75); }
.lp-label-row { display: flex; align-items: center; justify-content: space-between; }
.lp-forgot { background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 12px; color: rgba(253,228,44,0.6); cursor: pointer; padding: 0; transition: color 0.18s; }
.lp-forgot:hover { color: #fde42c; }

/* Inputs */
.lp-input-wrap { position: relative; display: flex; align-items: center; }
.lp-input-icon { position: absolute; left: 13px; color: rgba(184,212,193,0.45); display: flex; pointer-events: none; transition: color 0.2s; }
.lp-input-wrap:focus-within .lp-input-icon { color: #fde42c; }
.lp-input-wrap input {
  width: 100%; padding: 13px 44px; border-radius: 10px;
  border: 1.5px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03);
  color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14.5px;
  outline: none; transition: all 0.2s ease; -webkit-appearance: none;
}
.lp-input-wrap input::placeholder { color: rgba(255,255,255,0.2); }
.lp-input-wrap input:focus { border-color: #fde42c; background: rgba(253,228,44,0.04); box-shadow: 0 0 0 3px rgba(253,228,44,0.1); }
.lp-input-wrap input:disabled { opacity: 0.5; cursor: not-allowed; }
.lp-field-err .lp-input-wrap input { border-color: #f87171; background: rgba(248,113,113,0.06); }
.lp-field-err .lp-input-wrap input:focus { box-shadow: 0 0 0 3px rgba(248,113,113,0.13); }
.lp-err-msg { font-size: 12px; color: #f87171; animation: lp-slideDown 0.2s ease; }
.lp-eye { position: absolute; right: 11px; background: none; border: none; cursor: pointer; color: rgba(184,212,193,0.45); display: flex; padding: 6px; border-radius: 6px; transition: color 0.2s, background 0.2s; }
.lp-eye:hover { color: #fde42c; background: rgba(253,228,44,0.08); }

/* Submit */
.lp-btn-submit {
  margin-top: 6px; width: 100%; padding: 14px; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #fde42c 0%, #f0d200 100%);
  color: #0a4d20; font-family: 'Sora', sans-serif; font-weight: 800; font-size: 14.5px;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 4px 22px rgba(253,228,44,0.26); transition: all 0.2s ease;
}
.lp-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(253,228,44,0.4); }
.lp-btn-submit:active:not(:disabled) { transform: translateY(0); }
.lp-btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }
.lp-arrow { font-size: 17px; line-height: 1; }

/* Register row */
.lp-register-row { margin-top: 18px; text-align: center; font-size: 13px; color: rgba(255,255,255,0.35); }
.lp-register-link { background: none; border: none; color: #fde42c; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; padding: 0; text-decoration: underline; text-underline-offset: 2px; transition: opacity 0.18s; }
.lp-register-link:hover { opacity: 0.75; }

/* Demo hint */
.lp-hint { margin-top: 14px; display: flex; align-items: flex-start; gap: 9px; padding: 11px 13px; border-radius: 9px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: rgba(255,255,255,0.38); line-height: 1.6; }
.lp-hint-badge { flex-shrink: 0; font-size: 9px; font-weight: 700; font-family: 'Sora', sans-serif; padding: 3px 7px; border-radius: 4px; background: rgba(253,228,44,0.1); color: #fde42c; border: 1px solid rgba(253,228,44,0.18); letter-spacing: 0.5px; margin-top: 2px; }

/* Back */
.lp-back { display: block; margin: 18px auto 0; background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 12.5px; color: rgba(255,255,255,0.3); cursor: pointer; padding: 0; transition: color 0.18s; }
.lp-back:hover { color: rgba(255,255,255,0.7); }

@media (max-width: 480px) {
  .lp-card { padding: 24px 20px; border-radius: 16px; }
}
`