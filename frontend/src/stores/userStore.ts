export type UserRole = 'parent' | 'teacher' | 'super_admin';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  position?: string;
  approved?: boolean;
}

// Seed demo accounts so the demo credentials on LoginPage always work
const users: StoredUser[] = [
  { id: 'demo-parent',  name: 'Demo Parent',  email: 'parent@demo.church',  password: 'Parent@123',  role: 'parent',      phone: '0711111111', approved: true },
  { id: 'demo-teacher', name: 'Demo Teacher', email: 'teacher@demo.church', password: 'Teacher@123', role: 'teacher',     phone: '0722222222', approved: true },
  { id: 'demo-admin',   name: 'Demo Admin',   email: 'admin@demo.church',   password: 'Admin@123',   role: 'super_admin', phone: '0733333333', position: 'Chairperson', approved: true },
];

let lastLoginUser: StoredUser | null = null;

export const userStore = {

  register(data: Omit<StoredUser, 'id' | 'approved'>) {
    const user: StoredUser = {
      ...data,
      id: Date.now().toString(),
      approved: data.role === 'teacher' ? false : true,
    };
    users.push(user);
    return user;
  },

  emailExists(email: string): boolean {
    return users.some(u => u.email.toLowerCase() === email.toLowerCase());
  },

  findByEmail(email: string): StoredUser | undefined {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  // _role is optional — LoginPage passes it but we find by email+password only
  login(email: string, password: string, _role?: string): StoredUser | null {
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (user) {
      lastLoginUser = user;
      sessionStorage.setItem('currentUser', JSON.stringify({
        id:    user.id,
        name:  user.name,
        email: user.email,
        phone: user.phone ?? '',
        role:  user.role,
      }));
    }
    return user ?? null;
  },

  getLastLogin(): StoredUser | null {
    return lastLoginUser;
  },

  getAll(): StoredUser[] {
    return [...users];
  },

  getByRole(role: UserRole): StoredUser[] {
    return users.filter(u => u.role === role);
  },

  approveTeacher(id: string): boolean {
    const user = users.find(u => u.id === id);
    if (user && user.role === 'teacher') {
      user.approved = true;
      return true;
    }
    return false;
  },
};