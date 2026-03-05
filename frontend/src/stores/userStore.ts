// src/stores/userStore.ts
export type UserRole = 'super_admin' | 'teacher' | 'parent';

export interface StoredUser {
  id: string; name: string; email: string; passwordHash: string;
  role: UserRole; phone?: string; position?: string;
  approved: boolean; createdAt: string;
}

const users: StoredUser[] = [
  { id: 'u-demo-admin',   name: 'Admin User',   email: 'admin@demo.church',   passwordHash: 'Admin@123',   role: 'super_admin', phone: '+27821000001', position: 'Chairperson', approved: true, createdAt: '2025-01-01' },
  { id: 'u-demo-teacher', name: 'Teacher User', email: 'teacher@demo.church', passwordHash: 'Teacher@123', role: 'teacher',     phone: '+27821000002', approved: true, createdAt: '2025-01-01' },
  { id: 'u-demo-parent',  name: 'Parent User',  email: 'parent@demo.church',  passwordHash: 'Parent@123',  role: 'parent',      phone: '+27821000003', approved: true, createdAt: '2025-01-01' },
];

export const userStore = {
  getAll(): StoredUser[] { return [...users]; },
  getByRole(role: UserRole): StoredUser[] { return users.filter(u => u.role === role); },
  emailExists(email: string): boolean { return users.some(u => u.email.toLowerCase() === email.trim().toLowerCase()); },
  findByEmail(email: string): StoredUser | undefined { return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()); },
  getById(id: string): StoredUser | undefined { return users.find(u => u.id === id); },

  register(data: { name: string; email: string; password: string; role: UserRole; phone?: string; position?: string; approved?: boolean; }): StoredUser {
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
    const found = users.find(u => u.email === email.trim().toLowerCase() && u.passwordHash === password);
    if (!found || !found.approved) return null;
    return found;
  },

  approveTeacher(id: string): void {
    const u = users.find(u => u.id === id);
    if (u) u.approved = true;
  },
};