// src/stores/userStore.ts
// Shared in-memory user store — registration and login share the same array.

export type UserRole = 'super_admin' | 'teacher' | 'parent';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;   // stored as plain text for demo (no backend)
  role: UserRole;
  phone?: string;
  position?: string;
  approved: boolean;
  createdAt: string;
}

// ── Demo seed users ──────────────────────────────────────────────────────────
const users: StoredUser[] = [
  {
    id: 'u-demo-admin',
    name: 'Admin User',
    email: 'admin@demo.church',
    passwordHash: 'Admin@123',
    role: 'super_admin',
    phone: '+27821000001',
    position: 'Chairperson',
    approved: true,
    createdAt: '2025-01-01',
  },
  {
    id: 'u-demo-teacher',
    name: 'Teacher User',
    email: 'teacher@demo.church',
    passwordHash: 'Teacher@123',
    role: 'teacher',
    phone: '+27821000002',
    approved: true,
    createdAt: '2025-01-01',
  },
  {
    id: 'u-demo-parent',
    name: 'Parent User',
    email: 'parent@demo.church',
    passwordHash: 'Parent@123',
    role: 'parent',
    phone: '+27821000003',
    approved: true,
    createdAt: '2025-01-01',
  },
];

export const userStore = {
  /** Return a copy of all users */
  getAll(): StoredUser[] {
    return [...users];
  },

  /** Return users filtered by role */
  getByRole(role: UserRole): StoredUser[] {
    return users.filter(u => u.role === role);
  },

  /** Check if email already exists (any role) */
  emailExists(email: string): boolean {
    return users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
  },

  /**
   * Register a new user.
   * - super_admin: approved = true  (set explicitly by SuperAdminRegisterPage)
   * - parent:      approved = true  (auto-approved, can log in immediately)
   * - teacher:     approved = false (must be approved by super_admin first)
   */
  register(data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    position?: string;
    approved?: boolean;
  }): StoredUser {
    // Auto-approval rules per role
    let approved: boolean;
    if (data.approved !== undefined) {
      approved = data.approved;           // explicit override (e.g. super_admin)
    } else if (data.role === 'parent') {
      approved = true;                    // parents log in immediately
    } else if (data.role === 'teacher') {
      approved = false;                   // teachers need admin approval
    } else {
      approved = false;
    }

    const user: StoredUser = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: data.name,
      email: data.email.trim().toLowerCase(),
      passwordHash: data.password,        // plain text for demo
      role: data.role,
      phone: data.phone,
      position: data.position,
      approved,
      createdAt: new Date().toISOString().split('T')[0],
    };
    users.push(user);
    return user;
  },

  /**
   * Login — finds user matching email + password.
   * - Parents & super_admins: log in freely (approved = true on register)
   * - Teachers: blocked until a super_admin approves them
   */
  login(
    email: string,
    password: string,
    _role?: UserRole,   // ignored — we search all roles
  ): StoredUser | null {
    const found = users.find(
      u =>
        u.email === email.trim().toLowerCase() &&
        u.passwordHash === password
    );
    if (!found) return null;
    if (!found.approved) return null;   // unapproved teachers blocked
    return found;
  },

  /** Approve a teacher (called from SuperAdminDashboard) */
  approveTeacher(id: string): void {
    const u = users.find(u => u.id === id);
    if (u) u.approved = true;
  },

  /** Get single user by id */
  getById(id: string): StoredUser | undefined {
    return users.find(u => u.id === id);
  },
};