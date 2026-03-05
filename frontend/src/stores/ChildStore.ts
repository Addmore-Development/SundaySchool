// src/stores/childStore.ts

export interface StoredChild {
  // Core identifiers
  id: string;
  registeredDate: string;
  isNew: boolean;

  // Learner personal info (from ChildRegisterForm)
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  schoolName: string;
  grade: string;
  physicalAddress: string;

  // Medical
  hasAllergies: string;
  allergiesDetails?: string;
  hasMedicalCondition: string;
  medicalDetails?: string;

  // Emergency contact
  contactFirstName: string;
  contactLastName: string;
  contactGender?: string;
  contactDob?: string;
  relationship: string;
  relationshipOther?: string;
  employmentStatus?: string;
  contactNumber: string;
  altContactNumber?: string;
  atChurch?: string;
  parentIdNumber?: string;

  // Consent
  consentActivities: string;
  consentMedical: string;
  guardianSignature: string;
  signatureDate: string;

  // Dashboard stats (populated later)
  attendanceRate?: number;
  fedCount?: number;
  totalSessions?: number;
  welfareFlags?: number;

  // Misc
  registeredBy?: string;
  [key: string]: unknown;
}

const children: StoredChild[] = [];

export const childStore = {
  // Accept the raw form data object — flexible signature
  add(data: Record<string, unknown>): StoredChild {
    const child: StoredChild = {
      ...(data as Omit<StoredChild, 'id' | 'registeredDate' | 'isNew'>),
      id: `child-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      registeredDate: new Date().toLocaleDateString('en-ZA'),
      isNew: true,
    } as StoredChild;
    children.push(child);
    return child;
  },

  register(data: Record<string, unknown>): StoredChild {
    return childStore.add(data);
  },

  getAll(): StoredChild[] {
    return [...children];
  },

  getById(id: string): StoredChild | undefined {
    return children.find(c => c.id === id);
  },

  markSeen(id: string): void {
    const c = children.find(c => c.id === id);
    if (c) c.isNew = false;
  },

  update(id: string, updates: Partial<StoredChild>): StoredChild | null {
    const idx = children.findIndex(c => c.id === id);
    if (idx === -1) return null;
    children[idx] = { ...children[idx], ...updates };
    return children[idx];
  },

  remove(id: string): boolean {
    const before = children.length;
    children.splice(0, children.length, ...children.filter(c => c.id !== id));
    return children.length < before;
  },

  count(): number {
    return children.length;
  },
};