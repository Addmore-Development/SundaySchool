// src/stores/ChildStore.ts
// Pre-seeded with realistic demo data so the SuperAdmin dashboard
// is fully populated on first load without any manual registration.

export interface StoredChild {
  // Core identifiers
  id: string;
  registeredDate: string;
  isNew: boolean;

  // Learner personal info
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

  // Dashboard stats
  attendanceRate?: number;
  fedCount?: number;
  totalSessions?: number;
  welfareFlags?: number;

  // Misc
  registeredBy?: string;
  [key: string]: unknown;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_CHILDREN: StoredChild[] = [
  {
    id: 'child-seed-001',
    registeredDate: '12 Jan 2025',
    isNew: false,
    firstName: 'Amara',
    lastName: 'Dlamini',
    gender: 'Female',
    dateOfBirth: '2016-03-14',
    schoolName: 'Soweto Primary School',
    grade: 'Grade 3',
    physicalAddress: '14 Jacaranda Street, Soweto, 1804',
    hasAllergies: 'Yes',
    allergiesDetails: 'Peanuts',
    hasMedicalCondition: 'No',
    contactFirstName: 'Nomsa',
    contactLastName: 'Dlamini',
    relationship: 'Mother',
    employmentStatus: 'Employed (Full-time)',
    contactNumber: '0821112233',
    altContactNumber: '0829991111',
    parentIdNumber: '8801015009087',
    consentActivities: 'Yes',
    consentMedical: 'Yes',
    guardianSignature: 'N. Dlamini',
    signatureDate: '2025-01-12',
    attendanceRate: 92,
    fedCount: 11,
    totalSessions: 12,
    welfareFlags: 0,
    registeredBy: 'Parent',
  },
  {
    id: 'child-seed-002',
    registeredDate: '12 Jan 2025',
    isNew: false,
    firstName: 'Sipho',
    lastName: 'Dlamini',
    gender: 'Male',
    dateOfBirth: '2014-07-22',
    schoolName: 'Soweto Primary School',
    grade: 'Grade 5',
    physicalAddress: '14 Jacaranda Street, Soweto, 1804',
    hasAllergies: 'No',
    hasMedicalCondition: 'Yes',
    medicalDetails: 'Asthma — has inhaler in bag',
    contactFirstName: 'Nomsa',
    contactLastName: 'Dlamini',
    relationship: 'Mother',
    employmentStatus: 'Employed (Full-time)',
    contactNumber: '0821112233',
    altContactNumber: '0829991111',
    parentIdNumber: '8801015009087',
    consentActivities: 'Yes',
    consentMedical: 'Yes',
    guardianSignature: 'N. Dlamini',
    signatureDate: '2025-01-12',
    attendanceRate: 78,
    fedCount: 9,
    totalSessions: 12,
    welfareFlags: 1,
    registeredBy: 'Parent',
  },
  {
    id: 'child-seed-003',
    registeredDate: '03 Feb 2025',
    isNew: false,
    firstName: 'Lerato',
    lastName: 'Mokoena',
    gender: 'Female',
    dateOfBirth: '2015-11-08',
    schoolName: 'Tembisa Combined School',
    grade: 'Grade 4',
    physicalAddress: '8 Protea Avenue, Tembisa, 1632',
    hasAllergies: 'No',
    hasMedicalCondition: 'No',
    contactFirstName: 'James',
    contactLastName: 'Mokoena',
    relationship: 'Father',
    employmentStatus: 'Self-employed',
    contactNumber: '0712223344',
    altContactNumber: '0718882222',
    parentIdNumber: '7903125009081',
    consentActivities: 'Yes',
    consentMedical: 'Yes',
    guardianSignature: 'J. Mokoena',
    signatureDate: '2025-02-03',
    attendanceRate: 88,
    fedCount: 10,
    totalSessions: 12,
    welfareFlags: 0,
    registeredBy: 'Parent',
  },
  {
    id: 'child-seed-004',
    registeredDate: '20 Jan 2025',
    isNew: false,
    firstName: 'Thabo',
    lastName: 'Sithole',
    gender: 'Male',
    dateOfBirth: '2013-05-17',
    schoolName: 'Sandton Academy',
    grade: 'Grade 6',
    physicalAddress: '22 Bougainvillea Road, Sandton, 2191',
    hasAllergies: 'No',
    hasMedicalCondition: 'No',
    contactFirstName: 'Grace',
    contactLastName: 'Sithole',
    relationship: 'Mother',
    employmentStatus: 'Employed (Full-time)',
    contactNumber: '0833334455',
    altContactNumber: '0837773333',
    parentIdNumber: '8504230009083',
    consentActivities: 'Yes',
    consentMedical: 'Yes',
    guardianSignature: 'G. Sithole',
    signatureDate: '2025-01-20',
    attendanceRate: 95,
    fedCount: 12,
    totalSessions: 12,
    welfareFlags: 0,
    registeredBy: 'Parent',
  },
  {
    id: 'child-seed-005',
    registeredDate: '01 Mar 2025',
    isNew: false,
    firstName: 'Naledi',
    lastName: 'Khumalo',
    gender: 'Female',
    dateOfBirth: '2015-09-03',
    schoolName: 'Alexandra Primary',
    grade: 'Grade 4',
    physicalAddress: '5 Ndlovu Street, Alexandra, 2090',
    hasAllergies: 'Yes',
    allergiesDetails: 'Dairy and eggs',
    hasMedicalCondition: 'No',
    contactFirstName: 'Ruth',
    contactLastName: 'Khumalo',
    relationship: 'Mother',
    employmentStatus: 'Unemployed',
    contactNumber: '0724445566',
    altContactNumber: '0726664444',
    parentIdNumber: '9002145009086',
    consentActivities: 'Yes',
    consentMedical: 'No',
    guardianSignature: 'R. Khumalo',
    signatureDate: '2025-03-01',
    attendanceRate: 70,
    fedCount: 8,
    totalSessions: 12,
    welfareFlags: 0,
    registeredBy: 'Parent',
  },
  {
    id: 'child-seed-006',
    registeredDate: '15 Apr 2025',
    isNew: false,
    firstName: 'Kabelo',
    lastName: 'Mahlangu',
    gender: 'Male',
    dateOfBirth: '2014-12-01',
    schoolName: 'Midrand Primary',
    grade: 'Grade 5',
    physicalAddress: '31 Impala Crescent, Midrand, 1685',
    hasAllergies: 'No',
    hasMedicalCondition: 'No',
    contactFirstName: 'Peter',
    contactLastName: 'Mahlangu',
    relationship: 'Father',
    employmentStatus: 'Employed (Part-time)',
    contactNumber: '0845556677',
    altContactNumber: '0845555555',
    parentIdNumber: '7706085009082',
    consentActivities: 'Yes',
    consentMedical: 'Yes',
    guardianSignature: 'P. Mahlangu',
    signatureDate: '2025-04-15',
    attendanceRate: 83,
    fedCount: 10,
    totalSessions: 12,
    welfareFlags: 0,
    registeredBy: 'Teacher',
  },
  {
    id: 'child-seed-007',
    registeredDate: '20 Apr 2025',
    isNew: false,
    firstName: 'Zintle',
    lastName: 'Mthembu',
    gender: 'Female',
    dateOfBirth: '2016-01-25',
    schoolName: 'Katlehong Combined',
    grade: 'Grade 3',
    physicalAddress: '77 Thabo Nkosi Road, Katlehong, 1431',
    hasAllergies: 'No',
    hasMedicalCondition: 'No',
    contactFirstName: 'Faith',
    contactLastName: 'Mthembu',
    relationship: 'Grandmother',
    employmentStatus: 'Pensioner',
    contactNumber: '0736667788',
    altContactNumber: '0734446666',
    parentIdNumber: '5509155009089',
    consentActivities: 'Yes',
    consentMedical: 'Yes',
    guardianSignature: 'F. Mthembu',
    signatureDate: '2025-04-20',
    attendanceRate: 60,
    fedCount: 7,
    totalSessions: 12,
    welfareFlags: 2,
    registeredBy: 'Teacher',
  },
  {
    id: 'child-seed-008',
    registeredDate: '05 Feb 2025',
    isNew: false,
    firstName: 'Lethiwe',
    lastName: 'Ndlovu',
    gender: 'Female',
    dateOfBirth: '2013-08-19',
    schoolName: 'Tembisa High Prep',
    grade: 'Grade 6',
    physicalAddress: '3 Sunflower Close, Tembisa, 1632',
    hasAllergies: 'No',
    hasMedicalCondition: 'Yes',
    medicalDetails: 'Epilepsy — managed with medication',
    contactFirstName: 'Bongani',
    contactLastName: 'Ndlovu',
    relationship: 'Father',
    employmentStatus: 'Employed (Full-time)',
    contactNumber: '0811223344',
    parentIdNumber: '7812085009084',
    consentActivities: 'Yes',
    consentMedical: 'Yes',
    guardianSignature: 'B. Ndlovu',
    signatureDate: '2025-02-05',
    attendanceRate: 85,
    fedCount: 10,
    totalSessions: 12,
    welfareFlags: 0,
    registeredBy: 'Parent',
  },
  {
    id: 'child-seed-009',
    registeredDate: '10 Jan 2025',
    isNew: false,
    firstName: 'Mpho',
    lastName: 'Zulu',
    gender: 'Male',
    dateOfBirth: '2017-04-02',
    schoolName: 'Soweto ECD Centre',
    grade: 'Grade R',
    physicalAddress: '19 Mango Street, Soweto, 1804',
    hasAllergies: 'Yes',
    allergiesDetails: 'Tree nuts',
    hasMedicalCondition: 'No',
    contactFirstName: 'Ntombi',
    contactLastName: 'Zulu',
    relationship: 'Mother',
    employmentStatus: 'Unemployed',
    contactNumber: '0799887766',
    parentIdNumber: '9306155009085',
    consentActivities: 'Yes',
    consentMedical: 'Yes',
    guardianSignature: 'N. Zulu',
    signatureDate: '2025-01-10',
    attendanceRate: 75,
    fedCount: 9,
    totalSessions: 12,
    welfareFlags: 0,
    registeredBy: 'Parent',
  },
  {
    id: 'child-seed-010',
    registeredDate: '22 Jan 2025',
    isNew: false,
    firstName: 'Ayanda',
    lastName: 'Nkosi',
    gender: 'Male',
    dateOfBirth: '2014-02-28',
    schoolName: 'Soweto Primary School',
    grade: 'Grade 5',
    physicalAddress: '7 Msomi Street, Soweto, 1804',
    hasAllergies: 'No',
    hasMedicalCondition: 'No',
    contactFirstName: 'Faith',
    contactLastName: 'Nkosi',
    relationship: 'Mother',
    employmentStatus: 'Employed (Part-time)',
    contactNumber: '0766667788',
    parentIdNumber: '8812055009088',
    consentActivities: 'Yes',
    consentMedical: 'Yes',
    guardianSignature: 'F. Nkosi',
    signatureDate: '2025-01-22',
    attendanceRate: 50,
    fedCount: 6,
    totalSessions: 12,
    welfareFlags: 1,
    registeredBy: 'Parent',
  },
  {
    id: 'child-seed-011',
    registeredDate: '14 Feb 2025',
    isNew: false,
    firstName: 'Precious',
    lastName: 'Molefe',
    gender: 'Female',
    dateOfBirth: '2015-06-11',
    schoolName: 'Eldorado Park Primary',
    grade: 'Grade 4',
    physicalAddress: '45 Rose Avenue, Eldorado Park, 1811',
    hasAllergies: 'No',
    hasMedicalCondition: 'No',
    contactFirstName: 'Simon',
    contactLastName: 'Molefe',
    relationship: 'Father',
    employmentStatus: 'Self-employed',
    contactNumber: '0823456789',
    parentIdNumber: '8003125009090',
    consentActivities: 'Yes',
    consentMedical: 'Yes',
    guardianSignature: 'S. Molefe',
    signatureDate: '2025-02-14',
    attendanceRate: 91,
    fedCount: 11,
    totalSessions: 12,
    welfareFlags: 0,
    registeredBy: 'Parent',
  },
  {
    id: 'child-seed-012',
    registeredDate: '18 Mar 2025',
    isNew: false,
    firstName: 'Tshepo',
    lastName: 'Moagi',
    gender: 'Male',
    dateOfBirth: '2016-09-30',
    schoolName: 'Diepkloof Primary',
    grade: 'Grade 3',
    physicalAddress: '2 Daisy Street, Diepkloof, 1864',
    hasAllergies: 'No',
    hasMedicalCondition: 'No',
    contactFirstName: 'Mary',
    contactLastName: 'Moagi',
    relationship: 'Mother',
    employmentStatus: 'Employed (Full-time)',
    contactNumber: '0765554433',
    parentIdNumber: '9107095009091',
    consentActivities: 'Yes',
    consentMedical: 'Yes',
    guardianSignature: 'M. Moagi',
    signatureDate: '2025-03-18',
    attendanceRate: 66,
    fedCount: 8,
    totalSessions: 12,
    welfareFlags: 0,
    registeredBy: 'Parent',
  },
  {
    id: 'child-seed-013',
    registeredDate: '09 Apr 2025',
    isNew: false,
    firstName: 'Zanele',
    lastName: 'Radebe',
    gender: 'Female',
    dateOfBirth: '2013-12-05',
    schoolName: 'Orange Farm Secondary Prep',
    grade: 'Grade 7',
    physicalAddress: '60 Peach Street, Orange Farm, 1803',
    hasAllergies: 'Yes',
    allergiesDetails: 'Shellfish',
    hasMedicalCondition: 'No',
    contactFirstName: 'Thandi',
    contactLastName: 'Radebe',
    relationship: 'Mother',
    employmentStatus: 'Unemployed',
    contactNumber: '0789012345',
    parentIdNumber: '8806195009092',
    consentActivities: 'Yes',
    consentMedical: 'Yes',
    guardianSignature: 'T. Radebe',
    signatureDate: '2025-04-09',
    attendanceRate: 80,
    fedCount: 9,
    totalSessions: 12,
    welfareFlags: 0,
    registeredBy: 'Parent',
  },
  {
    id: 'child-seed-014',
    registeredDate: '28 Jan 2025',
    isNew: false,
    firstName: 'Litha',
    lastName: 'Petersen',
    gender: 'Male',
    dateOfBirth: '2015-03-22',
    schoolName: 'Lenasia Primary',
    grade: 'Grade 4',
    physicalAddress: '12 Protea Hill Road, Lenasia, 1827',
    hasAllergies: 'No',
    hasMedicalCondition: 'Yes',
    medicalDetails: 'Type 1 Diabetes — insulin pen in bag',
    contactFirstName: 'Johan',
    contactLastName: 'Petersen',
    relationship: 'Father',
    employmentStatus: 'Employed (Full-time)',
    contactNumber: '0834567890',
    parentIdNumber: '7501125009093',
    consentActivities: 'Yes',
    consentMedical: 'Yes',
    guardianSignature: 'J. Petersen',
    signatureDate: '2025-01-28',
    attendanceRate: 87,
    fedCount: 10,
    totalSessions: 12,
    welfareFlags: 0,
    registeredBy: 'Parent',
  },
  {
    id: 'child-seed-015',
    registeredDate: '06 May 2025',
    isNew: true,
    firstName: 'Simphiwe',
    lastName: 'Cele',
    gender: 'Male',
    dateOfBirth: '2016-07-14',
    schoolName: 'Ivory Park Primary',
    grade: 'Grade 3',
    physicalAddress: '88 Ivory Road, Ivory Park, 1618',
    hasAllergies: 'No',
    hasMedicalCondition: 'No',
    contactFirstName: 'Lindiwe',
    contactLastName: 'Cele',
    relationship: 'Mother',
    employmentStatus: 'Self-employed',
    contactNumber: '0712345678',
    parentIdNumber: '9210205009094',
    consentActivities: 'Yes',
    consentMedical: 'Yes',
    guardianSignature: 'L. Cele',
    signatureDate: '2025-05-06',
    attendanceRate: 58,
    fedCount: 7,
    totalSessions: 12,
    welfareFlags: 0,
    registeredBy: 'Parent',
  },
];

// ─── In-memory store (seeded on module load) ──────────────────────────────────
const children: StoredChild[] = [...SEED_CHILDREN];

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