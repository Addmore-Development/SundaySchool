// src/stores/userStore.ts
// Pre-seeded with realistic demo users so the SuperAdmin dashboard
// shows populated teachers, pending approvals, and parent accounts.

export type UserRole = 'super_admin' | 'teacher' | 'parent';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  position?: string;
  approved: boolean;
  createdAt: string;
}

const users: StoredUser[] = [
  // ─── Super Admins ────────────────────────────────────────────────────────────
  {
    id: 'u-admin-001',
    name: 'Pastor David Mokoena',
    email: 'admin@demo.church',
    passwordHash: 'Admin@123',
    role: 'super_admin',
    phone: '+27821000001',
    position: 'Chairperson',
    approved: true,
    createdAt: '2025-01-01',
  },
  {
    id: 'u-admin-002',
    name: 'Sister Nomvula Sithole',
    email: 'deputy@demo.church',
    passwordHash: 'Admin@123',
    role: 'super_admin',
    phone: '+27822000002',
    position: 'Deputy Chairperson',
    approved: true,
    createdAt: '2025-01-01',
  },
  {
    id: 'u-admin-003',
    name: 'Deacon Samuel Radebe',
    email: 'secretary@demo.church',
    passwordHash: 'Admin@123',
    role: 'super_admin',
    phone: '+27823000003',
    position: 'Secretary',
    approved: true,
    createdAt: '2025-01-01',
  },

  // ─── Approved Teachers ───────────────────────────────────────────────────────
  {
    id: 'u-teacher-001',
    name: 'Teacher User',
    email: 'teacher@demo.church',
    passwordHash: 'Teacher@123',
    role: 'teacher',
    phone: '+27821000099',
    position: 'Sunday School Teacher',
    approved: true,
    createdAt: '2025-01-01',
  },
  {
    id: 'u-teacher-002',
    name: 'Nomvula Dlamini',
    email: 'nomvula@church.co.za',
    passwordHash: 'Teacher@123',
    role: 'teacher',
    phone: '+27821112233',
    position: 'Grade R & 1 Teacher',
    approved: true,
    createdAt: '2025-01-05',
  },
  {
    id: 'u-teacher-003',
    name: 'James Mokoena',
    email: 'james.t@church.co.za',
    passwordHash: 'Teacher@123',
    role: 'teacher',
    phone: '+27712223344',
    position: 'Grade 3 & 4 Teacher',
    approved: true,
    createdAt: '2025-01-05',
  },
  {
    id: 'u-teacher-004',
    name: 'Grace Sithole',
    email: 'grace.t@church.co.za',
    passwordHash: 'Teacher@123',
    role: 'teacher',
    phone: '+27833334455',
    position: 'Grade 5 & 6 Teacher',
    approved: true,
    createdAt: '2025-01-08',
  },

  // ─── Pending Teacher Approvals ───────────────────────────────────────────────
  {
    id: 'u-teacher-005',
    name: 'Peter Mahlangu',
    email: 'peter.t@church.co.za',
    passwordHash: 'Teacher@123',
    role: 'teacher',
    phone: '+27845556677',
    position: 'Grade 7 Teacher',
    approved: false,
    createdAt: '2026-02-28',
  },
  {
    id: 'u-teacher-006',
    name: 'Ruth Khumalo',
    email: 'ruth.t@church.co.za',
    passwordHash: 'Teacher@123',
    role: 'teacher',
    phone: '+27724445566',
    position: 'Grade 2 Teacher',
    approved: false,
    createdAt: '2026-03-01',
  },
  {
    id: 'u-teacher-007',
    name: 'Bongani Zulu',
    email: 'bongani.t@church.co.za',
    passwordHash: 'Teacher@123',
    role: 'teacher',
    phone: '+27799887766',
    position: 'Assistant Teacher',
    approved: false,
    createdAt: '2026-03-04',
  },

  // ─── Parents ─────────────────────────────────────────────────────────────────
  {
    id: 'u-parent-001',
    name: 'Parent User',
    email: 'parent@demo.church',
    passwordHash: 'Parent@123',
    role: 'parent',
    phone: '+27821000003',
    approved: true,
    createdAt: '2025-01-01',
  },
  {
    id: 'u-parent-002',
    name: 'Nomsa Dlamini',
    email: 'nomsa@demo.church',
    passwordHash: 'Parent@123',
    role: 'parent',
    phone: '+27821112233',
    approved: true,
    createdAt: '2025-01-12',
  },
  {
    id: 'u-parent-003',
    name: 'James Mokoena',
    email: 'james@church.co.za',
    passwordHash: 'Parent@123',
    role: 'parent',
    phone: '+27712223344',
    approved: true,
    createdAt: '2025-02-03',
  },
  {
    id: 'u-parent-004',
    name: 'Grace Sithole',
    email: 'grace@church.co.za',
    passwordHash: 'Parent@123',
    role: 'parent',
    phone: '+27833334455',
    approved: true,
    createdAt: '2025-01-20',
  },
  {
    id: 'u-parent-005',
    name: 'Ruth Khumalo',
    email: 'ruth@church.co.za',
    passwordHash: 'Parent@123',
    role: 'parent',
    phone: '+27724445566',
    approved: true,
    createdAt: '2025-03-01',
  },
  {
    id: 'u-parent-006',
    name: 'Peter Mahlangu',
    email: 'peter@church.co.za',
    passwordHash: 'Parent@123',
    role: 'parent',
    phone: '+27845556677',
    approved: true,
    createdAt: '2025-04-15',
  },
  {
    id: 'u-parent-007',
    name: 'Faith Nkosi',
    email: 'faith@church.co.za',
    passwordHash: 'Parent@123',
    role: 'parent',
    phone: '+27766667788',
    approved: true,
    createdAt: '2025-01-22',
  },
  {
    id: 'u-parent-008',
    name: 'Bongani Ndlovu',
    email: 'bongani@church.co.za',
    passwordHash: 'Parent@123',
    role: 'parent',
    phone: '+27811223344',
    approved: true,
    createdAt: '2025-02-05',
  },
  {
    id: 'u-parent-009',
    name: 'Ntombi Zulu',
    email: 'ntombi@church.co.za',
    passwordHash: 'Parent@123',
    role: 'parent',
    phone: '+27799887766',
    approved: true,
    createdAt: '2025-01-10',
  },
  {
    id: 'u-parent-010',
    name: 'Simon Molefe',
    email: 'simon@church.co.za',
    passwordHash: 'Parent@123',
    role: 'parent',
    phone: '+27823456789',
    approved: true,
    createdAt: '2025-02-14',
  },
];

export const userStore = {
  getAll(): StoredUser[] {
    return [...users];
  },

  getByRole(role: UserRole): StoredUser[] {
    return users.filter(u => u.role === role);
  },

  emailExists(email: string): boolean {
    return users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
  },

  findByEmail(email: string): StoredUser | undefined {
    return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  },

  getById(id: string): StoredUser | undefined {
    return users.find(u => u.id === id);
  },

  register(data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    position?: string;
    approved?: boolean;
  }): StoredUser {
    let approved: boolean;
    if (data.approved !== undefined) approved = data.approved;
    else if (data.role === 'parent') approved = true;
    else approved = false;

    const user: StoredUser = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: data.name,
      email: data.email.trim().toLowerCase(),
      passwordHash: data.password,
      role: data.role,
      phone: data.phone,
      position: data.position,
      approved,
      createdAt: new Date().toISOString().split('T')[0],
    };
    users.push(user);
    return user;
  },

  login(email: string, password: string, _role?: UserRole): StoredUser | null {
    const found = users.find(
      u => u.email === email.trim().toLowerCase() && u.passwordHash === password
    );
    if (!found || !found.approved) return null;
    return found;
  },

  approveTeacher(id: string): void {
    const u = users.find(u => u.id === id);
    if (u) u.approved = true;
  },

  rejectTeacher(id: string): void {
    // Remove from the users array (rejected teachers are removed)
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) users.splice(idx, 1);
  },
};