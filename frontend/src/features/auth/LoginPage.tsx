// LoginPage.tsx — Sunday School Management Portal
// Self-contained. Only imports React (required peer dep). Zero other dependencies.
// All logic, styles, mock data, validation, toasts and routing are inline.

import React, { useState, useCallback, useEffect } from 'react'


// ─── Types ────────────────────────────────────────────────────────────────────
type UserRole = 'parent' | 'teacher' | 'super_admin'

interface MockUser {
  id: string
  name: string
  email: string
  role: UserRole
  phone: string
  password: string
}

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

// ─── Mock Users (replace with API call later) ─────────────────────────────────
const MOCK_USERS: MockUser[] = [
  {
    id: 'u-001',
    name: 'Nomsa Dlamini',
    email: 'parent@demo.church',
    password: 'Parent@123',
    role: 'parent',
    phone: '+27 82 111 2233',
  },
  {
    id: 'u-002',
    name: 'Thabo Mokoena',
    email: 'teacher@demo.church',
    password: 'Teacher@123',
    role: 'teacher',
    phone: '+27 73 444 5566',
  },
  {
    id: 'u-003',
    name: 'Pastor Sipho Nkosi',
    email: 'admin@demo.church',
    password: 'Admin@123',
    role: 'super_admin',
    phone: '+27 71 777 8899',
  },
]

const ROLE_META: Record<UserRole, { label: string; desc: string; color: string; glow: string }> = {
  parent: {
    label: 'Parent / Caregiver',
    desc: 'Register children & view attendance',
    color: '#4ade80',
    glow: 'rgba(74,222,128,0.18)',
  },
  teacher: {
    label: 'Teacher',
    desc: 'Attendance, feeding & welfare',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.18)',
  },
  super_admin: {
    label: 'Super Admin',
    desc: 'Full access — reports & governance',
    color: '#fde42c',
    glow: 'rgba(253,228,44,0.18)',
  },
}

const DEMO_CREDS: Record<UserRole, { email: string; password: string }> = {
  parent:      { email: 'parent@demo.church',  password: 'Parent@123' },
  teacher:     { email: 'teacher@demo.church', password: 'Teacher@123' },
  super_admin: { email: 'admin@demo.church',   password: 'Admin@123' },
}

// ─── Inline SVGs ──────────────────────────────────────────────────────────────
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
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
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
    style={{ animation: 'ss-spin 0.75s linear infinite', display: 'block' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
  </svg>
)

const IconShield = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconParent = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const IconTeacher = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
  </svg>
)

const IconAdmin = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const IconCheck = () => (
  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  parent: <IconParent />,
  teacher: <IconTeacher />,
  super_admin: <IconAdmin />,
}

// ─── Toast icons ──────────────────────────────────────────────────────────────
const TOAST_ICONS: Record<Toast['type'], string> = {
  success: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
  error:   `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`,
  warning: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
  info:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 16v-4m0-4h.01"/></svg>`,
}

const TOAST_COLORS: Record<Toast['type'], { bg: string; border: string; icon: string }> = {
  success: { bg: 'rgba(10,50,22,0.97)', border: '#4ade80', icon: '#4ade80' },
  error:   { bg: 'rgba(60,12,12,0.97)', border: '#f87171', icon: '#f87171' },
  warning: { bg: 'rgba(55,38,5,0.97)',  border: '#fbbf24', icon: '#fbbf24' },
  info:    { bg: 'rgba(8,35,65,0.97)',  border: '#60a5fa', icon: '#60a5fa' },
}

// ─── Validate ─────────────────────────────────────────────────────────────────
function validate(email: string, password: string, role: UserRole | null) {
  const errs: Record<string, string> = {}
  if (!email.trim()) errs.email = 'Email address is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email address.'
  if (!password) errs.password = 'Password is required.'
  else if (password.length < 6) errs.password = 'Password must be at least 6 characters.'
  if (!role) errs.role = 'Please select your role to continue.'
  return errs
}

// ─── Mock login (simulates async API call) ────────────────────────────────────
function mockLogin(email: string, password: string, role: UserRole): Promise<MockUser> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.trim().toLowerCase()
          && u.password === password
          && u.role === role
      )
      if (user) resolve(user)
      else reject(new Error('Invalid email, password, or role. Please try again.'))
    }, 950)
  })
}

// ─── Toast Item ───────────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const colors = TOAST_COLORS[toast.type]
  const DURATION = 4200

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const t1 = setTimeout(() => setExiting(true), DURATION)
    const t2 = setTimeout(() => onRemove(toast.id), DURATION + 380)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [toast.id, onRemove])

  const dismiss = () => {
    setExiting(true)
    setTimeout(() => onRemove(toast.id), 380)
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      onClick={dismiss}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${colors.border}`,
        borderRadius: '10px',
        padding: '13px 15px',
        display: 'flex',
        gap: '11px',
        alignItems: 'flex-start',
        minWidth: '290px',
        maxWidth: '380px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
        backdropFilter: 'blur(14px)',
        cursor: 'pointer',
        marginBottom: '9px',
        transform: visible && !exiting ? 'translateX(0) scale(1)' : 'translateX(110%) scale(0.94)',
        opacity: visible && !exiting ? 1 : 0,
        transition: 'transform 0.34s cubic-bezier(0.34,1.56,0.64,1), opacity 0.34s ease',
      }}
    >
      <span
        style={{ color: colors.icon, flexShrink: 0, marginTop: 1 }}
        dangerouslySetInnerHTML={{ __html: TOAST_ICONS[toast.type] }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: toast.message ? 3 : 0 }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.68)', lineHeight: 1.45 }}>
            {toast.message}
          </div>
        )}
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: '2px', background: colors.border, opacity: 0.65,
        animation: `ss-progress ${DURATION}ms linear forwards`,
      }} />
    </div>
  )
}

// ─── Logged-in Dashboard ──────────────────────────────────────────────────────
function LoggedInView({ user, onLogout }: { user: MockUser; onLogout: () => void }) {
  const meta = ROLE_META[user.role]
  const features: Record<UserRole, string[]> = {
    parent:      ['👤 Manage your family profile', '📋 View child attendance history', '💊 Update medical information', '✅ Submit digital consent forms', '🔔 Receive SMS / WhatsApp notifications'],
    teacher:     ['✅ Mark weekly attendance', '🍽️ Record feeding scheme participation', '🚨 Flag welfare concerns', '👨‍👩‍👧 Register families and children', '📊 View class-level statistics'],
    super_admin: ['📊 Access full analytics dashboard', '📥 Export PDF / Excel reports for donors', '🛡️ Manage safeguarding workflows', '👥 Approve users and manage roles', '⚙️ Configure classes, feeding & system settings'],
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#060f08', fontFamily: "'DM Sans',sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fde42c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconShield />
          </div>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13.5, color: '#fff', letterSpacing: '-0.2px' }}>Sunday School Portal</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Management Platform</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0a4d20' }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{meta.label}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ padding: '8px 15px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.55)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s' }}
            onMouseOver={e => { (e.currentTarget.style.color = '#fff'); (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)') }}
            onMouseOut={e => { (e.currentTarget.style.color = 'rgba(255,255,255,0.55)'); (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)') }}>
            Sign out
          </button>
        </div>
      </header>

      {/* Body */}
      <main style={{ flex: 1, padding: 'clamp(24px,4vw,52px) clamp(16px,4vw,40px)', maxWidth: 860, margin: '0 auto', width: '100%' }}>
        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg, #0d5c26 0%, #062914 100%)`, borderRadius: 18, padding: 'clamp(28px,4vw,44px)', marginBottom: 24, border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 20px 60px rgba(0,0,0,0.45)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${meta.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 13px', borderRadius: 100, background: `${meta.color}22`, border: `1px solid ${meta.color}44`, color: meta.color, fontSize: 11.5, fontWeight: 700, fontFamily: "'Sora',sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, display: 'inline-block' }} />
            {meta.label}
          </div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(20px,3.5vw,34px)', fontWeight: 800, color: '#fff', margin: '0 0 11px', letterSpacing: '-0.5px', lineHeight: 1.22 }}>
            You are now logged in as <span style={{ color: '#fde42c' }}>{user.name}</span>
          </h1>
          <p style={{ color: 'rgba(184,212,193,0.85)', fontSize: 14.5, lineHeight: 1.65, margin: '0 0 26px' }}>
            {meta.desc} — welcome to your personalised portal.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[{ l: 'Email', v: user.email }, { l: 'Phone', v: user.phone }, { l: 'User ID', v: user.id }].map(({ l, v }) => (
              <div key={l} style={{ padding: '9px 14px', borderRadius: 9, background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: 16, padding: 'clamp(22px,3vw,32px)' }}>
          <div style={{ fontSize: 11, fontFamily: "'Sora',sans-serif", fontWeight: 700, color: '#fde42c', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 16 }}>Your Portal Features</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 9 }}>
            {features[user.role].map(f => (
              <div key={f} style={{ padding: '11px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 13.5, color: 'rgba(255,255,255,0.72)' }}>{f}</div>
            ))}
          </div>
          <div style={{ marginTop: 22, padding: '13px 16px', borderRadius: 9, background: 'rgba(253,228,44,0.055)', border: '1px solid rgba(253,228,44,0.14)', fontSize: 13, color: 'rgba(253,228,44,0.78)', display: 'flex', alignItems: 'center', gap: 9 }}>
            <span>🚧</span>
            <span><strong>Demo mode:</strong> Full features are coming. This confirms successful authentication and role-based routing.</span>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Main LoginPage ───────────────────────────────────────────────────────────
export default function LoginPage() {
  // State
  const [role, setRole]               = useState<UserRole | null>(null)
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPw, setShowPw]           = useState(false)
  const [loading, setLoading]         = useState(false)
  const [errors, setErrors]           = useState<Record<string, string>>({})
  const [touched, setTouched]         = useState<Record<string, boolean>>({})
  const [toasts, setToasts]           = useState<Toast[]>([])
  const [loggedInUser, setLoggedInUser] = useState<MockUser | null>(null)
  const [mounted, setMounted]         = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Toast helpers
  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    setToasts(prev => [{ ...t, id: `${Date.now()}-${Math.random()}` }, ...prev].slice(0, 4))
  }, [])
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    error:   (title: string, message?: string) => addToast({ type: 'error',   title, message }),
    warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    info:    (title: string, message?: string) => addToast({ type: 'info',    title, message }),
  }

  // Role selection
  const selectRole = useCallback((r: UserRole) => {
    setRole(r)
    setErrors({})
    setTouched({})
    setEmail('')
    setPassword('')
  }, [])

  // Fill demo
  const fillDemo = useCallback(() => {
    if (!role) return
    const c = DEMO_CREDS[role]
    setEmail(c.email)
    setPassword(c.password)
    setErrors({})
    toast.info('Demo credentials filled', `Explore as ${ROLE_META[role].label}`)
  }, [role]) // eslint-disable-line

  const handleBlur = (field: string) => setTouched(p => ({ ...p, [field]: true }))

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true, role: true })
    const errs = validate(email, password, role)
    if (Object.keys(errs).length) {
      setErrors(errs)
      toast.warning('Check your details', 'Fix the errors below before continuing.')
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const user = await mockLogin(email, password, role!)
      toast.success('Welcome back!', `Signed in as ${user.name}`)
      setTimeout(() => setLoggedInUser(user), 800)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      toast.error('Login failed', msg)
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const handleLogout = useCallback(() => {
    setLoggedInUser(null)
    setRole(null)
    setEmail('')
    setPassword('')
    setErrors({})
    setTouched({})
    toast.info('Signed out', 'You have been safely signed out.')
  }, []) // eslint-disable-line

  // ── Render logged-in view ──
  if (loggedInUser) {
    return (
      <>
        <style>{CSS}</style>
        <LoggedInView user={loggedInUser} onLogout={handleLogout} />
        <ToastStack toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  const ROLES: UserRole[] = ['parent', 'teacher', 'super_admin']

  // ── Render login ──
  return (
    <>
      <style>{CSS}</style>

      {/* Toast stack */}
      <ToastStack toasts={toasts} onRemove={removeToast} />

      <div className="ss-root" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease' }}>

        {/* ── Left Panel ── */}
        <div className="ss-left">
          <div className="ss-left-inner">
            {/* Brand */}
            <div className="ss-brand">
              <div className="ss-brand-badge">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path fill="#0a4d20" d="M12 2L2 7v5c0 5.25 4.25 10.15 10 11.35C17.75 22.15 22 17.25 22 12V7L12 2z"/>
                  <path fill="#0a4d20" opacity=".35" d="M12 5.5l-7 3.5v3.5c0 3.75 3 7.25 7 8.1 4-.85 7-4.35 7-8.1V9l-7-3.5z"/>
                  <path fill="#0a4d20" d="M12 8l-1.5 3.5H7l2.5 2-1 3.5 3.5-2 3.5 2-1-3.5 2.5-2h-3.5L12 8z"/>
                </svg>
              </div>
              <div>
                <div className="ss-brand-name">Sunday School</div>
                <div className="ss-brand-sub">Management Portal</div>
              </div>
            </div>

            {/* Hero */}
            <h1 className="ss-hero-h1">
              Serving children,<br />
              <span className="ss-gold">empowering<br />communities.</span>
            </h1>
            <p className="ss-hero-p">
              A secure, mobile-first platform for registration, attendance, feeding, and pastoral care — built for the heart of your church.
            </p>

            {/* Pills */}
            <div className="ss-pills">
              {['Child Registration', 'Attendance Tracking', 'Feeding Schemes', 'Welfare Monitoring', 'POPIA Compliant'].map(f => (
                <span key={f} className="ss-pill">{f}</span>
              ))}
            </div>

            {/* Trust */}
            <div className="ss-trust">
              {[
                { icon: '🔒', label: 'POPIA Compliant' },
                { icon: '🛡️', label: 'Role-based Access' },
                { icon: '🔐', label: 'Encrypted & Secure' },
              ].map(({ icon, label }) => (
                <div key={label} className="ss-trust-item">
                  <span>{icon}</span><span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative blobs */}
          <div className="ss-blob ss-blob-1" />
          <div className="ss-blob ss-blob-2" />
          <div className="ss-blob ss-blob-3" />
        </div>

        {/* ── Right Panel ── */}
        <div className="ss-right">
          <div className="ss-form-wrap">

            <div className="ss-form-header">
              <h2>Sign in to your account</h2>
              <p>Select your role, then enter your credentials</p>
            </div>

            {/* Role Cards */}
            <div className="ss-role-section">
              {touched.role && errors.role && (
                <div className="ss-role-err">⚠ {errors.role}</div>
              )}
              <div className="ss-role-grid">
                {ROLES.map(r => {
                  const m = ROLE_META[r]
                  const active = role === r
                  return (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectRole(r)}
                      className={`ss-role-card${active ? ' ss-role-active' : ''}`}
                      style={active ? {
                        borderColor: m.color,
                        background: `${m.color}12`,
                        boxShadow: `0 0 0 3px ${m.glow}, 0 8px 28px rgba(0,0,0,0.35)`,
                      } : {}}
                    >
                      <span className="ss-role-icon" style={active ? { background: `${m.color}20`, color: m.color } : {}}>
                        {ROLE_ICONS[r]}
                      </span>
                      <span className="ss-role-label">{m.label}</span>
                      <span className="ss-role-desc">{m.desc}</span>
                      {active && (
                        <span className="ss-role-check" style={{ background: m.color, color: '#061a0b' }}>
                          <IconCheck />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="ss-form">

              {/* Email */}
              <div className={`ss-field${touched.email && errors.email ? ' ss-field-err' : ''}`}>
                <label htmlFor="ss-email">Email Address</label>
                <div className="ss-input-wrap">
                  <span className="ss-input-icon"><IconMail /></span>
                  <input
                    id="ss-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    disabled={loading}
                    aria-invalid={!!(touched.email && errors.email)}
                    aria-describedby={errors.email ? 'ss-email-err' : undefined}
                  />
                </div>
                {touched.email && errors.email && (
                  <span id="ss-email-err" className="ss-err-msg" role="alert">⚠ {errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className={`ss-field${touched.password && errors.password ? ' ss-field-err' : ''}`}>
                <label htmlFor="ss-password">Password</label>
                <div className="ss-input-wrap">
                  <span className="ss-input-icon"><IconLock /></span>
                  <input
                    id="ss-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    disabled={loading}
                    aria-invalid={!!(touched.password && errors.password)}
                    aria-describedby={errors.password ? 'ss-pw-err' : undefined}
                  />
                  <button
                    type="button"
                    className="ss-eye"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <span id="ss-pw-err" className="ss-err-msg" role="alert">⚠ {errors.password}</span>
                )}
              </div>

              {/* Actions */}
              <div className="ss-actions">
                <button type="submit" className="ss-btn-submit" disabled={loading}>
                  {loading
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconSpinner /> Signing in…</span>
                    : <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Sign In <span style={{ fontSize: 18, lineHeight: 1 }}>→</span></span>
                  }
                </button>

                {role && (
                  <button type="button" className="ss-btn-demo" onClick={fillDemo} disabled={loading}>
                    ⚡ Fill demo credentials
                  </button>
                )}
              </div>
            </form>

            {/* Demo hint */}
            <div className="ss-hint">
              <span className="ss-hint-badge">DEMO</span>
              <span>Select a role above, then click "Fill demo credentials" to explore the portal instantly.</span>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

// ─── Toast Stack ──────────────────────────────────────────────────────────────
function ToastStack({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div style={{ position: 'fixed', top: 18, right: 18, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'all' }}>
          <ToastItem toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  )
}

// ─── All CSS ──────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #root {
  min-height: 100dvh;
  background: #060f08;
  color: #fff;
  font-family: 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

:focus-visible { outline: 2px solid #fde42c; outline-offset: 2px; }
::selection { background: rgba(253,228,44,0.22); color: #fff; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-thumb { background: rgba(253,228,44,0.2); border-radius: 3px; }

@keyframes ss-spin { to { transform: rotate(360deg); } }
@keyframes ss-progress { from { width: 100%; } to { width: 0%; } }
@keyframes ss-popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes ss-slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ss-fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

/* ── Layout ── */
.ss-root {
  display: flex;
  min-height: 100dvh;
}

/* ── Left ── */
.ss-left {
  flex: 0 0 44%;
  background: linear-gradient(160deg, #0d6030 0%, #072c13 55%, #040e07 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(36px,5vw,64px) clamp(28px,4vw,56px);
  position: relative;
  overflow: hidden;
}
.ss-left-inner {
  position: relative;
  z-index: 2;
  max-width: 430px;
  width: 100%;
  animation: ss-fadeUp 0.7s ease both;
}

.ss-blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.ss-blob-1 {
  width: 380px; height: 380px;
  background: radial-gradient(circle, rgba(253,228,44,0.07) 0%, transparent 70%);
  top: -110px; right: -90px;
}
.ss-blob-2 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%);
  bottom: -70px; left: -70px;
}
.ss-blob-3 {
  width: 130px; height: 130px;
  background: rgba(253,228,44,0.035);
  bottom: 28%; right: 12%;
}

/* Brand */
.ss-brand {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: clamp(32px,5vw,54px);
}
.ss-brand-badge {
  width: 50px; height: 50px;
  border-radius: 13px;
  background: linear-gradient(135deg, #fde42c, #f5c800);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 0 6px rgba(253,228,44,0.14);
  flex-shrink: 0;
}
.ss-brand-name {
  font-family: 'Sora', sans-serif;
  font-weight: 800;
  font-size: 17px;
  color: #fff;
  letter-spacing: -0.3px;
  line-height: 1.2;
}
.ss-brand-sub {
  font-size: 11px;
  color: rgba(184,212,193,0.7);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-top: 2px;
}

/* Hero text */
.ss-hero-h1 {
  font-family: 'Sora', sans-serif;
  font-size: clamp(26px, 2.8vw, 38px);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -0.7px;
  color: #fff;
  margin-bottom: 18px;
}
.ss-gold { color: #fde42c; }
.ss-hero-p {
  color: rgba(184,212,193,0.8);
  font-size: clamp(13.5px, 1.2vw, 15px);
  line-height: 1.72;
  margin-bottom: clamp(22px,3vw,36px);
}

/* Pills */
.ss-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: clamp(24px,3vw,38px);
}
.ss-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 100px;
  background: rgba(253,228,44,0.1);
  color: #fde42c;
  border: 1px solid rgba(253,228,44,0.18);
  letter-spacing: 0.2px;
}

/* Trust */
.ss-trust {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.ss-trust-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(184,212,193,0.75);
}

/* ── Right ── */
.ss-right {
  flex: 1;
  background: linear-gradient(180deg, #071f0e 0%, #040d06 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(32px,4vw,56px) clamp(20px,4vw,48px);
  overflow-y: auto;
}
.ss-form-wrap {
  width: 100%;
  max-width: 500px;
  animation: ss-fadeUp 0.65s 0.1s ease both;
}
.ss-form-header {
  margin-bottom: 28px;
}
.ss-form-header h2 {
  font-family: 'Sora', sans-serif;
  font-size: clamp(20px,2.2vw,27px);
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.45px;
  margin-bottom: 5px;
}
.ss-form-header p {
  color: rgba(184,212,193,0.65);
  font-size: 13.5px;
}

/* Role section */
.ss-role-section { margin-bottom: 26px; }
.ss-role-err {
  font-size: 12px;
  color: #f87171;
  margin-bottom: 9px;
}
.ss-role-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.ss-role-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 7px;
  padding: 17px 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1.5px solid rgba(255,255,255,0.07);
  cursor: pointer;
  color: rgba(184,212,193,0.75);
  outline: none;
  transition: all 0.22s ease;
  font-family: 'DM Sans', sans-serif;
}
.ss-role-card:hover:not(.ss-role-active) {
  border-color: rgba(253,228,44,0.3);
  background: rgba(253,228,44,0.04);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(0,0,0,0.3);
}
.ss-role-active {
  color: #fff;
}
.ss-role-icon {
  width: 36px; height: 36px;
  border-radius: 9px;
  background: rgba(255,255,255,0.05);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.22s;
}
.ss-role-label {
  font-family: 'Sora', sans-serif;
  font-size: 11.5px;
  font-weight: 700;
  line-height: 1.3;
}
.ss-role-desc {
  font-size: 10.5px;
  color: rgba(255,255,255,0.4);
  line-height: 1.4;
}
.ss-role-check {
  position: absolute;
  top: 7px; right: 7px;
  width: 19px; height: 19px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  animation: ss-popIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
}

/* Form */
.ss-form {
  display: flex;
  flex-direction: column;
  gap: 17px;
  margin-bottom: 18px;
}
.ss-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ss-field label {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  letter-spacing: 0.2px;
}
.ss-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.ss-input-icon {
  position: absolute;
  left: 13px;
  color: rgba(184,212,193,0.55);
  display: flex;
  pointer-events: none;
  transition: color 0.2s;
}
.ss-input-wrap:focus-within .ss-input-icon { color: #fde42c; }

.ss-input-wrap input {
  width: 100%;
  padding: 13px 44px;
  border-radius: 10px;
  border: 1.5px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.035);
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 14.5px;
  outline: none;
  transition: all 0.2s ease;
  -webkit-appearance: none;
}
.ss-input-wrap input::placeholder { color: rgba(255,255,255,0.22); }
.ss-input-wrap input:focus {
  border-color: #fde42c;
  background: rgba(253,228,44,0.04);
  box-shadow: 0 0 0 3px rgba(253,228,44,0.1);
}
.ss-input-wrap input:disabled { opacity: 0.5; cursor: not-allowed; }

.ss-field-err .ss-input-wrap input {
  border-color: #f87171;
  background: rgba(248,113,113,0.07);
}
.ss-field-err .ss-input-wrap input:focus {
  box-shadow: 0 0 0 3px rgba(248,113,113,0.14);
}

.ss-err-msg {
  font-size: 12px;
  color: #f87171;
  animation: ss-slideDown 0.2s ease;
}

.ss-eye {
  position: absolute;
  right: 11px;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(184,212,193,0.55);
  display: flex;
  padding: 6px;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
}
.ss-eye:hover { color: #fde42c; background: rgba(253,228,44,0.08); }

/* Actions */
.ss-actions {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-top: 4px;
}
.ss-btn-submit {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #fde42c 0%, #f0d200 100%);
  color: #0a4d20;
  font-family: 'Sora', sans-serif;
  font-weight: 800;
  font-size: 14.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 22px rgba(253,228,44,0.28);
  letter-spacing: 0.1px;
  transition: all 0.2s ease;
}
.ss-btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 30px rgba(253,228,44,0.42);
  background: linear-gradient(135deg, #ffe83a 0%, #f5d800 100%);
}
.ss-btn-submit:active:not(:disabled) { transform: translateY(0); }
.ss-btn-submit:disabled { opacity: 0.58; cursor: not-allowed; }

.ss-btn-demo {
  width: 100%;
  padding: 11px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.09);
  background: transparent;
  color: rgba(184,212,193,0.7);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}
.ss-btn-demo:hover:not(:disabled) {
  color: #fde42c;
  border-color: rgba(253,228,44,0.22);
  background: rgba(253,228,44,0.06);
}
.ss-btn-demo:disabled { opacity: 0.4; cursor: not-allowed; }

/* Hint */
.ss-hint {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 9px;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.065);
  font-size: 12.5px;
  color: rgba(255,255,255,0.45);
  line-height: 1.5;
}
.ss-hint-badge {
  flex-shrink: 0;
  font-size: 9.5px;
  font-weight: 700;
  font-family: 'Sora', sans-serif;
  padding: 3px 7px;
  border-radius: 4px;
  background: rgba(253,228,44,0.1);
  color: #fde42c;
  border: 1px solid rgba(253,228,44,0.18);
  letter-spacing: 0.5px;
  margin-top: 1px;
}

/* ── Responsive ── */
@media (max-width: 860px) {
  .ss-root { flex-direction: column; }
  .ss-left {
    flex: none;
    padding: clamp(28px,5vw,40px) clamp(20px,5vw,36px) clamp(24px,4vw,34px);
  }
  .ss-hero-h1 { font-size: clamp(22px,5vw,30px); }
  .ss-trust { flex-direction: row; flex-wrap: wrap; gap: 12px; }
  .ss-right { padding: 28px 20px 44px; }
}

@media (max-width: 520px) {
  .ss-role-grid { grid-template-columns: 1fr; gap: 8px; }
  .ss-role-card { flex-direction: row; text-align: left; padding: 13px 14px; }
  .ss-role-desc { display: none; }
  .ss-role-icon { flex-shrink: 0; }
  .ss-left { padding: 24px 18px 20px; }
  .ss-blob-1, .ss-blob-2, .ss-blob-3 { display: none; }
}

@media (min-width: 1440px) {
  .ss-left { padding: 72px 72px; }
  .ss-hero-h1 { font-size: 42px; }
}
`