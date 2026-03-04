Here is a clear, realistic **README.md** section focused on **creating the Homepage, Login page, and Register flow** for your Sunday School Management Portal frontend.

You can paste this directly into your `frontend/README.md` (or append it to the main repo README if you prefer one file).

```markdown
# Sunday School Management Portal – Frontend

Mobile-first React + Vite application for church Sunday school administration.

Current color theme (from dashboard & forms):
- Background / cards: dark forest green ≈ `#0a2e12` – `#0f3d1a`
- Accents / headings / buttons / active states: bright gold ≈ `#f0c000` – `#e6b800`
- Text: white / light gray
- Focus rings / selected: gold
- Warnings / medical flags: soft red tones

## Project Structure (relevant parts)

```
src/
├── api/                  # axios/fetch clients + typed endpoints
├── components/
│   └── ui/               # reusable pieces: Button, Card, Modal, Input, etc.
│       ├── RegisterModal.tsx      ← role selection popup
│       └── ... 
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx       ← full form after role selection
│   │   └── RegisterSuccess.tsx    (optional)
│   ├── dashboard/
│   ├── children/
│   │   ├── ChildList.tsx
│   │   ├── ChildProfile.tsx
│   │   └── ChildRegisterForm.tsx
│   └── ...
├── hooks/
├── stores/               # Zustand stores (auth, user role, etc.)
├── types/
└── App.tsx
    main.tsx
```

## Pages to Build – Step-by-step Guide

### 1. Homepage (Landing / Welcome page)

**File**: `src/features/dashboard/HomePage.tsx` (or `src/pages/Home.tsx` if using page-based routing)

**Purpose**:
- Welcome message + church name/logo
- Big "Login" and "Register" buttons
- Short description of what the portal does
- Optional: quick stats carousel or verse of the day (future)

**Minimal code skeleton** (with routing example)

```tsx
// src/features/dashboard/HomePage.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // shadcn/ui or your Button

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a2e12] text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0c000]">
            Sunday School Portal
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Register children • Track attendance • Support families • Glorify God together
          </p>
        </div>

        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full bg-[#f0c000] hover:bg-[#e6b800] text-black font-semibold"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full border-[#f0c000] text-[#f0c000] hover:bg-[#f0c000]/10"
            onClick={() => {/* open RegisterModal or navigate('/register') */}}
          >
            Register
          </Button>
        </div>

        <p className="text-sm text-gray-400 mt-8">
          A secure space for parents, teachers and church leadership
        </p>
      </div>
    </div>
  );
}
```

### 2. Login Page

**File**: `src/features/auth/LoginPage.tsx`

**Purpose**:
- Email / phone + password
- "Forgot password?" link (stub for now)
- "Register instead" link that opens role selection modal

**Example implementation**

```tsx
// src/features/auth/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RegisterModal from '@/components/ui/RegisterModal';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call auth.api.login()
    console.log('Login attempt:', form);
    // on success → navigate('/dashboard')
  };

  return (
    <div className="min-h-screen bg-[#0a2e12] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#f0c000]">Welcome Back</h2>
          <p className="mt-2 text-gray-300">Sign in to manage Sunday School</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email or Phone</Label>
            <Input
              id="email"
              type="text"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-[#0f3d1a] border-gray-600 text-white focus:ring-[#f0c000]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-[#0f3d1a] border-gray-600 text-white focus:ring-[#f0c000]"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-[#f0c000] hover:bg-[#e6b800] text-black">
            Sign In
          </Button>
        </form>

        <div className="text-center space-y-3 text-sm">
          <button className="text-[#f0c000] hover:underline">
            Forgot password?
          </button>
          <div>
            Don't have an account?{' '}
            <button
              onClick={() => setShowRegisterModal(true)}
              className="text-[#f0c000] hover:underline font-medium"
            >
              Register here
            </button>
          </div>
        </div>
      </div>

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onContinue={(role) => {
          setShowRegisterModal(false);
          navigate(`/register/${role.toLowerCase()}`);
        }}
      />
    </div>
  );
}
```

### 3. Register Flow (Modal + Role-specific Form)

**Files involved**:
- `src/components/ui/RegisterModal.tsx`     ← already created (role selector popup)
- `src/features/auth/RegisterPage.tsx`      ← receives role from URL or state

**Recommended flow**:
1. User clicks **Register** → opens `RegisterModal`
2. User selects role (Parent / Teacher / Super Admin)
3. `onContinue(role)` → navigate to `/register/:role`
4. `RegisterPage.tsx` reads role from URL → shows appropriate form

**RegisterPage.tsx skeleton** (basic version – extend per role)

```tsx
// src/features/auth/RegisterPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Role = 'parent' | 'teacher' | 'admin';

export default function RegisterPage() {
  const { role } = useParams<{ role: Role }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const roleTitle = {
    parent: 'Parent / Caregiver',
    teacher: 'Teacher',
    admin: 'Super Admin (Leadership)',
  }[role || 'parent'];

  if (!role || !['parent', 'teacher', 'admin'].includes(role)) {
    return <div>Invalid role</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a2e12] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#f0c000] mb-2">
          Register as {roleTitle}
        </h1>

        {role === 'teacher' && (
          <p className="text-yellow-300 mb-6">
            Note: Teacher accounts must be approved by a Super Admin.
          </p>
        )}

        {role === 'admin' && (
          <p className="text-yellow-300 mb-6">
            Super Admin registration is restricted. Contact the Chairperson.
          </p>
        )}

        {/* Here: conditional form based on role */}
        {/* For parent → embed or link to ChildRegisterForm */}
        {/* For teacher/admin → simple profile + credentials form */}

        <div className="mt-10">
          <Button
            onClick={() => navigate('/login')}
            variant="outline"
            className="border-[#f0c000] text-[#f0c000]"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Routing Setup Example (App.tsx)

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './features/dashboard/HomePage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
// ... other pages

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/:role" element={<RegisterPage />} />
        {/* <Route path="/register/child" element={<ChildRegisterForm />} /> */}
        {/* ... */}
      </Routes>
    </BrowserRouter>
  );
```
- shadcn/ui setup commands (if not already done)

Happy coding!
