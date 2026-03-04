export const USER_ROLES = ['parent', 'teacher', 'super_admin'] as const
export type UserRole = typeof USER_ROLES[number]

export interface RegisteredUser {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  phone: string
  position?: string
}

const SEED_USERS: RegisteredUser[] = [
  { id: 'u-001', name: 'Nomsa Dlamini',      email: 'parent@demo.church',  password: 'Parent@123',  role: 'parent',      phone: '+27 82 111 2233' },
  { id: 'u-002', name: 'Thabo Mokoena',      email: 'teacher@demo.church', password: 'Teacher@123', role: 'teacher',     phone: '+27 73 444 5566' },
  { id: 'u-003', name: 'Pastor Sipho Nkosi', email: 'admin@demo.church',   password: 'Admin@123',   role: 'super_admin', phone: '+27 71 777 8899', position: 'Chairperson' },
]

let _users: RegisteredUser[] = [...SEED_USERS]

export const userStore = {
  register(user: Omit<RegisteredUser, 'id'>): RegisteredUser {
    const newUser: RegisteredUser = { ...user, id: `u-${Date.now()}` }
    _users = [..._users, newUser]
    return newUser
  },
  login(email: string, password: string, role: UserRole): RegisteredUser | null {
    return _users.find(
      u =>
        u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        u.password === password &&
        u.role === role
    ) ?? null
  },
  emailExists(email: string): boolean {
    return _users.some(u => u.email.trim().toLowerCase() === email.trim().toLowerCase())
  },
  getAll() {
    return [..._users]
  },
}