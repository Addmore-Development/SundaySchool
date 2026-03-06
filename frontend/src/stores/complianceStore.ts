// src/stores/complianceStore.ts
// POPIA & Child Safeguarding compliance engine.
// Handles: audit trails, data access requests, welfare reports, consent records.

export type AuditAction =
  | 'VIEW_CHILD_PROFILE'
  | 'VIEW_MEDICAL_INFO'
  | 'VIEW_WELFARE_FLAG'
  | 'EDIT_CHILD_RECORD'
  | 'DELETE_CHILD_RECORD'
  | 'FLAG_WELFARE_CONCERN'
  | 'RESOLVE_WELFARE_FLAG'
  | 'EXPORT_DATA'
  | 'LOGIN'
  | 'LOGOUT'
  | 'APPROVE_TEACHER'
  | 'REJECT_TEACHER'
  | 'DATA_REQUEST_SUBMITTED'
  | 'DATA_REQUEST_RESOLVED'
  | 'CONSENT_UPDATED';

export type DataRequestType = 'ACCESS' | 'CORRECTION' | 'DELETION';
export type DataRequestStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type WelfareReportStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ESCALATED'
  | 'RESOLVED';

export interface AuditEntry {
  id: string;
  timestamp: string;         // ISO 8601
  actorId: string;
  actorName: string;
  actorRole: 'super_admin' | 'teacher' | 'parent';
  action: AuditAction;
  targetId?: string;         // child ID, welfare flag ID, etc.
  targetName?: string;       // human-readable label
  detail?: string;           // free-text note
  ipTag?: string;            // session tag (not real IP — browser only)
}

export interface DataRequest {
  id: string;
  submittedAt: string;
  requesterName: string;
  requesterEmail: string;
  requesterRole: 'super_admin' | 'teacher' | 'parent';
  type: DataRequestType;
  description: string;
  status: DataRequestStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
}

export interface MandatoryWelfareReport {
  id: string;
  createdAt: string;
  createdBy: string;         // actor name
  createdByRole: 'super_admin' | 'teacher' | 'parent';
  childId: string;
  childName: string;
  concern: string;
  severity: 'low' | 'medium' | 'high';
  witnessedOn: string;       // ISO date
  actionTaken: string;
  referredExternally: boolean;
  referralDetail?: string;   // e.g. social worker, police, doctor
  status: WelfareReportStatus;
  statusHistory: { at: string; by: string; status: WelfareReportStatus; note?: string }[];
  reviewedBy?: string;
  reviewedAt?: string;
  resolvedAt?: string;
}

// ─── Seed audit data so the log is never empty ────────────────────────────────
const SEED_AUDIT: AuditEntry[] = [
  { id:'a-001', timestamp:'2026-01-12T08:04:11Z', actorId:'u-admin-001', actorName:'Pastor David Mokoena', actorRole:'super_admin', action:'LOGIN', detail:'Session started' },
  { id:'a-002', timestamp:'2026-01-12T08:06:32Z', actorId:'u-admin-001', actorName:'Pastor David Mokoena', actorRole:'super_admin', action:'VIEW_CHILD_PROFILE', targetId:'child-seed-001', targetName:'Amara Dlamini' },
  { id:'a-003', timestamp:'2026-01-12T08:07:14Z', actorId:'u-admin-001', actorName:'Pastor David Mokoena', actorRole:'super_admin', action:'VIEW_MEDICAL_INFO', targetId:'child-seed-002', targetName:'Sipho Dlamini', detail:'Reviewed asthma medication notes' },
  { id:'a-004', timestamp:'2026-02-09T09:15:00Z', actorId:'u-teacher-002', actorName:'Nomvula Dlamini', actorRole:'teacher', action:'FLAG_WELFARE_CONCERN', targetId:'w1', targetName:'Sipho Dlamini', detail:'Visible bruising — high severity' },
  { id:'a-005', timestamp:'2026-02-16T10:22:45Z', actorId:'u-teacher-003', actorName:'James Mokoena', actorRole:'teacher', action:'VIEW_WELFARE_FLAG', targetId:'w2', targetName:'Zintle Mthembu' },
  { id:'a-006', timestamp:'2026-02-23T08:55:00Z', actorId:'u-admin-001', actorName:'Pastor David Mokoena', actorRole:'super_admin', action:'EXPORT_DATA', detail:'Attendance report exported — CSV' },
  { id:'a-007', timestamp:'2026-03-02T09:00:00Z', actorId:'u-teacher-002', actorName:'Nomvula Dlamini', actorRole:'teacher', action:'RESOLVE_WELFARE_FLAG', targetId:'w3', targetName:'Zintle Mthembu', detail:'Spoke with grandmother — situation improving' },
  { id:'a-008', timestamp:'2026-03-02T11:30:00Z', actorId:'u-admin-002', actorName:'Sister Nomvula Sithole', actorRole:'super_admin', action:'APPROVE_TEACHER', targetId:'u-teacher-004', targetName:'Grace Sithole' },
  { id:'a-009', timestamp:'2026-03-04T14:00:00Z', actorId:'u-parent-005', actorName:'Ruth Khumalo', actorRole:'parent', action:'CONSENT_UPDATED', targetId:'child-seed-005', targetName:'Naledi Khumalo', detail:'Medical consent granted' },
];

const SEED_REQUESTS: DataRequest[] = [
  {
    id:'dr-001',
    submittedAt:'2026-02-10T10:00:00Z',
    requesterName:'Ruth Khumalo',
    requesterEmail:'ruth@church.co.za',
    requesterRole:'parent',
    type:'ACCESS',
    description:'I would like to see all data held about my daughter Naledi Khumalo.',
    status:'RESOLVED',
    resolvedAt:'2026-02-14T09:00:00Z',
    resolvedBy:'Pastor David Mokoena',
    resolution:'Full profile shared securely with parent via in-person meeting.',
  },
  {
    id:'dr-002',
    submittedAt:'2026-03-01T08:30:00Z',
    requesterName:'Faith Nkosi',
    requesterEmail:'faith@church.co.za',
    requesterRole:'parent',
    type:'CORRECTION',
    description:'My son Ayanda\'s contact number is listed incorrectly. Please update to 0812345678.',
    status:'PENDING',
  },
];

const SEED_WELFARE_REPORTS: MandatoryWelfareReport[] = [
  {
    id:'mwr-001',
    createdAt:'2026-02-09T09:20:00Z',
    createdBy:'Nomvula Dlamini',
    createdByRole:'teacher',
    childId:'child-seed-002',
    childName:'Sipho Dlamini',
    concern:'Child arrived with visible bruising on left arm. Was withdrawn and refused to discuss it.',
    severity:'high',
    witnessedOn:'2026-02-09',
    actionTaken:'Separated child from group, spoke privately. Documented injuries with description. Notified Super Admin immediately.',
    referredExternally:true,
    referralDetail:'Referred to Department of Social Development — case number pending.',
    status:'UNDER_REVIEW',
    statusHistory:[
      { at:'2026-02-09T09:20:00Z', by:'Nomvula Dlamini', status:'SUBMITTED', note:'Initial report submitted.' },
      { at:'2026-02-09T11:00:00Z', by:'Pastor David Mokoena', status:'UNDER_REVIEW', note:'Reviewed and escalation to social services initiated.' },
    ],
    reviewedBy:'Pastor David Mokoena',
    reviewedAt:'2026-02-09T11:00:00Z',
  },
  {
    id:'mwr-002',
    createdAt:'2026-02-23T10:15:00Z',
    createdBy:'James Mokoena',
    createdByRole:'teacher',
    childId:'child-seed-007',
    childName:'Zintle Mthembu',
    concern:'Child mentioned not eating at home. Appears noticeably underweight. Arrived in dirty clothing for the second consecutive week.',
    severity:'medium',
    witnessedOn:'2026-02-23',
    actionTaken:'Fed child during session. Spoke with grandmother after class. Admin notified.',
    referredExternally:false,
    status:'RESOLVED',
    statusHistory:[
      { at:'2026-02-23T10:15:00Z', by:'James Mokoena', status:'SUBMITTED' },
      { at:'2026-02-24T08:00:00Z', by:'Pastor David Mokoena', status:'UNDER_REVIEW' },
      { at:'2026-03-02T09:00:00Z', by:'Nomvula Dlamini', status:'RESOLVED', note:'Situation improving — grandmother engaged with feeding programme.' },
    ],
    reviewedBy:'Pastor David Mokoena',
    reviewedAt:'2026-02-24T08:00:00Z',
    resolvedAt:'2026-03-02T09:00:00Z',
  },
];

// ─── In-memory stores ─────────────────────────────────────────────────────────
const auditLog: AuditEntry[]               = [...SEED_AUDIT];
const dataRequests: DataRequest[]          = [...SEED_REQUESTS];
const welfareReports: MandatoryWelfareReport[] = [...SEED_WELFARE_REPORTS];

// ─── Public API ───────────────────────────────────────────────────────────────
export const complianceStore = {

  // ── Audit Trail ──────────────────────────────────────────────────────────────
  log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
    const e: AuditEntry = {
      ...entry,
      id: `a-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      timestamp: new Date().toISOString(),
    };
    auditLog.unshift(e); // newest first
    return e;
  },

  getAuditLog(limit = 100): AuditEntry[] {
    return auditLog.slice(0, limit);
  },

  getAuditForTarget(targetId: string): AuditEntry[] {
    return auditLog.filter(e => e.targetId === targetId);
  },

  getAuditForActor(actorId: string): AuditEntry[] {
    return auditLog.filter(e => e.actorId === actorId);
  },

  // ── Data Requests (POPIA right of access / correction / deletion) ────────────
  submitDataRequest(req: Omit<DataRequest, 'id' | 'submittedAt' | 'status'>): DataRequest {
    const r: DataRequest = {
      ...req,
      id: `dr-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
    };
    dataRequests.unshift(r);
    return r;
  },

  getAllDataRequests(): DataRequest[] {
    return [...dataRequests];
  },

  getPendingDataRequests(): DataRequest[] {
    return dataRequests.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS');
  },

  resolveDataRequest(id: string, resolvedBy: string, resolution: string, reject = false): void {
    const r = dataRequests.find(r => r.id === id);
    if (!r) return;
    r.status = reject ? 'REJECTED' : 'RESOLVED';
    r.resolvedAt = new Date().toISOString();
    r.resolvedBy = resolvedBy;
    r.resolution = resolution;
  },

  // ── Mandatory Welfare Reports ─────────────────────────────────────────────────
  submitWelfareReport(report: Omit<MandatoryWelfareReport, 'id' | 'createdAt' | 'status' | 'statusHistory'>): MandatoryWelfareReport {
    const r: MandatoryWelfareReport = {
      ...report,
      id: `mwr-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      createdAt: new Date().toISOString(),
      status: 'SUBMITTED',
      statusHistory: [{
        at: new Date().toISOString(),
        by: report.createdBy,
        status: 'SUBMITTED',
      }],
    };
    welfareReports.unshift(r);
    return r;
  },

  getAllWelfareReports(): MandatoryWelfareReport[] {
    return [...welfareReports];
  },

  getOpenWelfareReports(): MandatoryWelfareReport[] {
    return welfareReports.filter(r => r.status !== 'RESOLVED');
  },

  updateWelfareReportStatus(
    id: string,
    status: WelfareReportStatus,
    by: string,
    note?: string
  ): void {
    const r = welfareReports.find(r => r.id === id);
    if (!r) return;
    r.status = status;
    r.statusHistory.push({ at: new Date().toISOString(), by, status, note });
    if (status === 'RESOLVED') r.resolvedAt = new Date().toISOString();
  },

  // ── Role-based access helper (use in components before showing sensitive data) ──
  canViewMedical(role: 'super_admin' | 'teacher' | 'parent', ownChild = false): boolean {
    if (role === 'super_admin') return true;
    if (role === 'teacher') return true;      // teachers see allergies/conditions for duty of care
    if (role === 'parent' && ownChild) return true;  // parents see only their own child
    return false;
  },

  canViewWelfare(role: 'super_admin' | 'teacher' | 'parent'): boolean {
    return role === 'super_admin' || role === 'teacher';
  },

  canExportData(role: 'super_admin' | 'teacher' | 'parent'): boolean {
    return role === 'super_admin';
  },

  canDeleteRecord(role: 'super_admin' | 'teacher' | 'parent'): boolean {
    return role === 'super_admin';
  },
};