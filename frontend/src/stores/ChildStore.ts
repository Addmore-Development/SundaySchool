// src/stores/childStore.ts
// Shared in-memory store — every component that imports this gets the SAME array

export interface StoredChild {
  id: string;
  // Learner
  firstName: string; lastName: string; gender: string;
  dateOfBirth: string; schoolName: string; grade: string; physicalAddress: string;
  // Medical
  hasAllergies: string; allergiesDetails: string;
  hasMedicalCondition: string; medicalDetails: string;
  // Emergency contact
  contactFirstName: string; contactLastName: string;
  contactGender: string; contactDob: string;
  relationship: string; relationshipOther: string;
  employmentStatus: string; contactNumber: string;
  altContactNumber: string; atChurch: string;
  // Consent
  consentActivities: string; consentMedical: string;
  guardianSignature: string; signatureDate: string;
  // Meta
  registeredDate: string;
  registeredBy: string;
  isNew: boolean;
  // Attendance / feeding (dashboard stats — seeded only)
  attendanceRate?: number;
  fedCount?: number;
  totalSessions?: number;
  welfareFlags?: number;
}

// Pre-seeded demo children (existing records — isNew: false)
const children: StoredChild[] = [
  { id:'c1', firstName:'Amara', lastName:'Dlamini', gender:'Female', dateOfBirth:'2016-03-14', schoolName:'Sunflower Primary', grade:'Grade 3', physicalAddress:'14 Jacaranda St, Soweto', hasAllergies:'Yes', allergiesDetails:'Peanuts', hasMedicalCondition:'No', medicalDetails:'', contactFirstName:'Nomsa', contactLastName:'Dlamini', contactGender:'Female', contactDob:'1985-06-01', relationship:'Mother', relationshipOther:'', employmentStatus:'Employed (Full-time)', contactNumber:'0821112233', altContactNumber:'', atChurch:'Yes', consentActivities:'Yes', consentMedical:'Yes', guardianSignature:'Nomsa Dlamini', signatureDate:'2025-01-12', registeredDate:'2025-01-12', registeredBy:'Parent', isNew:false, attendanceRate:92, fedCount:11, totalSessions:12, welfareFlags:0 },
  { id:'c2', firstName:'Sipho', lastName:'Dlamini', gender:'Male', dateOfBirth:'2014-07-22', schoolName:'Sunflower Primary', grade:'Grade 5', physicalAddress:'14 Jacaranda St, Soweto', hasAllergies:'No', allergiesDetails:'', hasMedicalCondition:'Yes', medicalDetails:'Asthma — has inhaler in bag', contactFirstName:'Nomsa', contactLastName:'Dlamini', contactGender:'Female', contactDob:'1985-06-01', relationship:'Mother', relationshipOther:'', employmentStatus:'Employed (Full-time)', contactNumber:'0821112233', altContactNumber:'', atChurch:'Yes', consentActivities:'Yes', consentMedical:'Yes', guardianSignature:'Nomsa Dlamini', signatureDate:'2025-01-12', registeredDate:'2025-01-12', registeredBy:'Parent', isNew:false, attendanceRate:78, fedCount:9, totalSessions:12, welfareFlags:1 },
  { id:'c3', firstName:'Lerato', lastName:'Mokoena', gender:'Female', dateOfBirth:'2015-11-08', schoolName:'Protea Primary', grade:'Grade 4', physicalAddress:'8 Protea Ave, Tembisa', hasAllergies:'No', allergiesDetails:'', hasMedicalCondition:'No', medicalDetails:'', contactFirstName:'James', contactLastName:'Mokoena', contactGender:'Male', contactDob:'1980-03-15', relationship:'Father', relationshipOther:'', employmentStatus:'Self-employed', contactNumber:'0712223344', altContactNumber:'0113334455', atChurch:'Yes', consentActivities:'Yes', consentMedical:'Yes', guardianSignature:'James Mokoena', signatureDate:'2025-02-03', registeredDate:'2025-02-03', registeredBy:'Parent', isNew:false, attendanceRate:88, fedCount:10, totalSessions:12, welfareFlags:0 },
  { id:'c4', firstName:'Thabo', lastName:'Sithole', gender:'Male', dateOfBirth:'2013-05-17', schoolName:'Sandton Primary', grade:'Grade 6', physicalAddress:'22 Bougainvillea Rd, Sandton', hasAllergies:'No', allergiesDetails:'', hasMedicalCondition:'No', medicalDetails:'', contactFirstName:'Grace', contactLastName:'Sithole', contactGender:'Female', contactDob:'1982-09-20', relationship:'Mother', relationshipOther:'', employmentStatus:'Employed (Part-time)', contactNumber:'0833334455', altContactNumber:'', atChurch:'No', consentActivities:'Yes', consentMedical:'Yes', guardianSignature:'Grace Sithole', signatureDate:'2025-01-20', registeredDate:'2025-01-20', registeredBy:'Parent', isNew:false, attendanceRate:95, fedCount:12, totalSessions:12, welfareFlags:0 },
  { id:'c5', firstName:'Naledi', lastName:'Khumalo', gender:'Female', dateOfBirth:'2017-09-03', schoolName:'Alex Primary', grade:'Grade 2', physicalAddress:'5 Ndlovu St, Alex', hasAllergies:'Yes', allergiesDetails:'Dairy, eggs', hasMedicalCondition:'No', medicalDetails:'', contactFirstName:'Ruth', contactLastName:'Khumalo', contactGender:'Female', contactDob:'1990-11-30', relationship:'Mother', relationshipOther:'', employmentStatus:'Unemployed', contactNumber:'0724445566', altContactNumber:'', atChurch:'Yes', consentActivities:'Yes', consentMedical:'No', guardianSignature:'Ruth Khumalo', signatureDate:'2025-03-01', registeredDate:'2025-03-01', registeredBy:'Parent', isNew:false, attendanceRate:70, fedCount:8, totalSessions:12, welfareFlags:2 },
  { id:'c6', firstName:'Kabelo', lastName:'Mahlangu', gender:'Male', dateOfBirth:'2016-12-01', schoolName:'Midrand Primary', grade:'Grade 3', physicalAddress:'31 Impala Cres, Midrand', hasAllergies:'No', allergiesDetails:'', hasMedicalCondition:'No', medicalDetails:'', contactFirstName:'Peter', contactLastName:'Mahlangu', contactGender:'Male', contactDob:'1978-04-10', relationship:'Father', relationshipOther:'', employmentStatus:'Employed (Full-time)', contactNumber:'0845556677', altContactNumber:'0115557788', atChurch:'No', consentActivities:'Yes', consentMedical:'Yes', guardianSignature:'Peter Mahlangu', signatureDate:'2025-04-15', registeredDate:'2025-04-15', registeredBy:'Admin', isNew:false, attendanceRate:83, fedCount:10, totalSessions:12, welfareFlags:0 },
  { id:'c7', firstName:'Zanele', lastName:'Nkosi', gender:'Female', dateOfBirth:'2018-06-22', schoolName:'Soweto Primary', grade:'Grade 1', physicalAddress:'7 Msomi St, Soweto', hasAllergies:'No', allergiesDetails:'', hasMedicalCondition:'Yes', medicalDetails:'Epilepsy — medicated, prescription in bag', contactFirstName:'Faith', contactLastName:'Nkosi', contactGender:'Female', contactDob:'1992-08-14', relationship:'Mother', relationshipOther:'', employmentStatus:'Employed (Part-time)', contactNumber:'0766667788', altContactNumber:'', atChurch:'Yes', consentActivities:'Yes', consentMedical:'Yes', guardianSignature:'Faith Nkosi', signatureDate:'2025-05-10', registeredDate:'2025-05-10', registeredBy:'Parent', isNew:false, attendanceRate:60, fedCount:7, totalSessions:12, welfareFlags:3 },
];

export const childStore = {
  getAll(): StoredChild[] {
    return [...children];
  },

  add(data: Omit<StoredChild, 'id' | 'registeredDate' | 'isNew' | 'attendanceRate' | 'fedCount' | 'totalSessions' | 'welfareFlags'>): StoredChild {
    const child: StoredChild = {
      ...data,
      id: `new-${Date.now()}`,
      registeredDate: new Date().toISOString().split('T')[0],
      isNew: true,
      attendanceRate: 0,
      fedCount: 0,
      totalSessions: 0,
      welfareFlags: 0,
    };
    children.unshift(child);
    return child;
  },

  markSeen(id: string) {
    const c = children.find(c => c.id === id);
    if (c) c.isNew = false;
  },
};