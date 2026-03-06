// src/features/dashboard/ComplianceDashboard.tsx
// POPIA & Child Safeguarding compliance panel.
// Plug into SuperAdminDashboard as a new tab: activeTab === 'compliance'
//
// USAGE in SuperAdminDashboard.tsx:
//   1. import ComplianceDashboard from './ComplianceDashboard';
//   2. Add 'compliance' to the Tab type and NAV array
//   3. Render: {activeTab === 'compliance' && <ComplianceDashboard currentUser={...} />}

import { useState, useMemo } from 'react';
import {
  complianceStore,
  type AuditEntry,
  type DataRequest,
  type MandatoryWelfareReport,
  type WelfareReportStatus,
} from '../../stores/complianceStore';

interface CurrentUser {
  id: string;
  name: string;
  role: 'super_admin' | 'teacher' | 'parent';
}

interface Props {
  currentUser: CurrentUser;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDT = (iso: string) =>
  new Date(iso).toLocaleString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
const fmtD = (iso: string) =>
  new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

const ACTION_LABELS: Record<string, string> = {
  VIEW_CHILD_PROFILE:      'Viewed child profile',
  VIEW_MEDICAL_INFO:       'Viewed medical info',
  VIEW_WELFARE_FLAG:       'Viewed welfare flag',
  EDIT_CHILD_RECORD:       'Edited child record',
  DELETE_CHILD_RECORD:     'Deleted child record',
  FLAG_WELFARE_CONCERN:    'Flagged welfare concern',
  RESOLVE_WELFARE_FLAG:    'Resolved welfare flag',
  EXPORT_DATA:             'Exported data',
  LOGIN:                   'Logged in',
  LOGOUT:                  'Logged out',
  APPROVE_TEACHER:         'Approved teacher',
  REJECT_TEACHER:          'Rejected teacher',
  DATA_REQUEST_SUBMITTED:  'Data request submitted',
  DATA_REQUEST_RESOLVED:   'Data request resolved',
  CONSENT_UPDATED:         'Consent updated',
};

const ACTION_COLOR: Record<string, string> = {
  VIEW_CHILD_PROFILE:   '#60a5fa',
  VIEW_MEDICAL_INFO:    '#f0c000',
  VIEW_WELFARE_FLAG:    '#fbbf24',
  FLAG_WELFARE_CONCERN: '#e05252',
  RESOLVE_WELFARE_FLAG: '#34d399',
  EDIT_CHILD_RECORD:    '#a78bfa',
  DELETE_CHILD_RECORD:  '#ef4444',
  EXPORT_DATA:          '#fb923c',
  LOGIN:                '#34d399',
  LOGOUT:               '#9ca3af',
  APPROVE_TEACHER:      '#34d399',
  REJECT_TEACHER:       '#e05252',
  DATA_REQUEST_SUBMITTED:'#60a5fa',
  DATA_REQUEST_RESOLVED: '#34d399',
  CONSENT_UPDATED:      '#34d399',
};

const SEV_COLOR = { low:'#fbbf24', medium:'#fb923c', high:'#e05252' };
const STATUS_COLOR: Record<WelfareReportStatus, string> = {
  DRAFT:        '#9ca3af',
  SUBMITTED:    '#60a5fa',
  UNDER_REVIEW: '#fbbf24',
  ESCALATED:    '#e05252',
  RESOLVED:     '#34d399',
};
const DR_STATUS_COLOR: Record<string, string> = {
  PENDING:     '#fbbf24',
  IN_PROGRESS: '#60a5fa',
  RESOLVED:    '#34d399',
  REJECTED:    '#e05252',
};

// ─── Inline styles ────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: '#0a2410',
  border: '1px solid rgba(240,192,0,0.1)',
  borderRadius: 12,
  marginBottom: '1.25rem',
  overflow: 'hidden',
};
const cardHead: React.CSSProperties = {
  padding: '0.875rem 1.25rem',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  flexWrap: 'wrap', gap: '0.5rem',
};
const cardTitle: React.CSSProperties = {
  fontFamily: "'Bebas Neue',sans-serif",
  fontSize: '0.95rem', letterSpacing: '1.5px', color: '#f0c000',
};
const cardBody: React.CSSProperties = { padding: '1.25rem' };
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const th: React.CSSProperties = {
  fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)',
  textTransform: 'uppercase', letterSpacing: '0.6px',
  padding: '0 0.875rem 0.65rem', textAlign: 'left', whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
  padding: '0.75rem 0.875rem',
  borderTop: '1px solid rgba(255,255,255,0.04)',
  fontSize: '0.82rem', color: 'rgba(255,255,255,0.72)',
};
const pill = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center',
  padding: '0.18rem 0.6rem', borderRadius: 20,
  fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap',
  background: `${color}18`, color, border: `1px solid ${color}30`,
});
const inp: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 7, padding: '0.55rem 0.8rem',
  color: '#fff', fontFamily: "'DM Sans',sans-serif",
  fontSize: '0.82rem', outline: 'none',
};
const btnGold: React.CSSProperties = {
  background: '#f0c000', color: '#071a0d', border: 'none',
  padding: '0.45rem 1.1rem', borderRadius: 7,
  fontFamily: "'DM Sans',sans-serif", fontSize: '0.8rem',
  fontWeight: 700, cursor: 'pointer',
};
const btnSm = (col: string): React.CSSProperties => ({
  padding: '0.3rem 0.75rem', borderRadius: 5, border: 'none',
  fontFamily: "'DM Sans',sans-serif", fontSize: '0.72rem',
  fontWeight: 700, cursor: 'pointer',
  background: `${col}18`, color: col, border: `1px solid ${col}30` as any,
});
const empty: React.CSSProperties = {
  textAlign: 'center', padding: '2.5rem 1rem',
  color: 'rgba(255,255,255,0.22)', fontSize: '0.82rem',
};
const lbl: React.CSSProperties = {
  fontSize: '0.65rem', fontWeight: 700,
  color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
  letterSpacing: '0.5px', display: 'block', marginBottom: '0.3rem',
};

// ─── Sub-sections ─────────────────────────────────────────────────────────────

// 1. Audit Trail
function AuditTrailPanel() {
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const allEntries = complianceStore.getAuditLog(200);

  const filtered = useMemo(() => {
    return allEntries.filter(e => {
      const matchRole   = roleFilter === 'all' || e.actorRole === roleFilter;
      const matchAction = actionFilter === 'all' || e.action === actionFilter;
      const matchSearch = !search ||
        e.actorName.toLowerCase().includes(search.toLowerCase()) ||
        (e.targetName || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.detail || '').toLowerCase().includes(search.toLowerCase());
      return matchRole && matchAction && matchSearch;
    });
  }, [allEntries, search, roleFilter, actionFilter]);

  return (
    <div style={card}>
      <div style={cardHead}>
        <span style={cardTitle}>🔍 Audit Trail</span>
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
          {filtered.length} entries · POPIA-compliant access log
        </span>
      </div>
      <div style={{ padding: '0.875rem 1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <input
          style={{ ...inp, flex: 1, minWidth: 180 }}
          placeholder="Search by name, target or detail…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select style={{ ...inp, width: 'auto' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
        </select>
        <select style={{ ...inp, width: 'auto' }} value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="all">All Actions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      {filtered.length === 0 ? (
        <div style={empty}>No audit entries match your filters.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tbl}>
            <thead>
              <tr>
                {['Timestamp','Actor','Role','Action','Target','Detail'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td style={{ ...td, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{fmtDT(e.timestamp)}</td>
                  <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>{e.actorName}</td>
                  <td style={td}>
                    <span style={pill(e.actorRole === 'super_admin' ? '#a78bfa' : e.actorRole === 'teacher' ? '#60a5fa' : '#34d399')}>
                      {e.actorRole === 'super_admin' ? 'Admin' : e.actorRole === 'teacher' ? 'Teacher' : 'Parent'}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{ color: ACTION_COLOR[e.action] || '#fff', fontWeight: 600, fontSize: '0.78rem' }}>
                      {ACTION_LABELS[e.action] || e.action}
                    </span>
                  </td>
                  <td style={{ ...td, color: 'rgba(255,255,255,0.55)' }}>{e.targetName || '—'}</td>
                  <td style={{ ...td, maxWidth: 220, color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{e.detail || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// 2. POPIA Data Requests
function DataRequestsPanel({ currentUser }: { currentUser: CurrentUser }) {
  const [showForm, setShowForm]       = useState(false);
  const [resolveId, setResolveId]     = useState<string | null>(null);
  const [resolution, setResolution]   = useState('');
  const [reqType, setReqType]         = useState<'ACCESS' | 'CORRECTION' | 'DELETION'>('ACCESS');
  const [reqDesc, setReqDesc]         = useState('');
  const [reqName, setReqName]         = useState('');
  const [reqEmail, setReqEmail]       = useState('');
  const [refresh, setRefresh]         = useState(0);

  const requests = complianceStore.getAllDataRequests();
  const pending  = requests.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS');

  const handleSubmit = () => {
    if (!reqName.trim() || !reqDesc.trim()) return;
    complianceStore.submitDataRequest({
      requesterName: reqName,
      requesterEmail: reqEmail,
      requesterRole: currentUser.role,
      type: reqType,
      description: reqDesc,
    });
    complianceStore.log({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'DATA_REQUEST_SUBMITTED',
      detail: `${reqType} request submitted`,
    });
    setShowForm(false); setReqName(''); setReqEmail(''); setReqDesc('');
    setRefresh(r => r + 1);
  };

  const handleResolve = (id: string, reject = false) => {
    if (!resolution.trim()) return;
    complianceStore.resolveDataRequest(id, currentUser.name, resolution, reject);
    complianceStore.log({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'DATA_REQUEST_RESOLVED',
      targetId: id,
      detail: reject ? `Rejected: ${resolution}` : `Resolved: ${resolution}`,
    });
    setResolveId(null); setResolution('');
    setRefresh(r => r + 1);
  };

  const TYPE_LABELS = { ACCESS: 'Right of Access', CORRECTION: 'Correction', DELETION: 'Right to Delete' };
  const TYPE_COLORS = { ACCESS: '#60a5fa', CORRECTION: '#fbbf24', DELETION: '#e05252' };

  return (
    <div style={card}>
      <div style={cardHead}>
        <span style={cardTitle}>📋 POPIA Data Requests</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {pending.length > 0 && (
            <span style={pill('#fbbf24')}>{pending.length} pending</span>
          )}
          <button style={btnGold} onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Cancel' : '+ New Request'}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ margin: '1rem 1.25rem 0', padding: '0.75rem 1rem', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: 9, fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
        🔒 <strong style={{ color: '#60a5fa' }}>POPIA Section 23–24:</strong> Data subjects have the right to access, correct, or request deletion of their personal information. All requests must be responded to within <strong style={{ color: '#fff' }}>30 days</strong>.
      </div>

      {/* New request form */}
      {showForm && (
        <div style={{ margin: '1rem 1.25rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={lbl}>Full Name *</label>
              <input style={inp} value={reqName} onChange={e => setReqName(e.target.value)} placeholder="Requester's full name" />
            </div>
            <div>
              <label style={lbl}>Email Address</label>
              <input style={inp} value={reqEmail} onChange={e => setReqEmail(e.target.value)} placeholder="requester@email.com" />
            </div>
            <div>
              <label style={lbl}>Request Type *</label>
              <select style={inp} value={reqType} onChange={e => setReqType(e.target.value as any)}>
                <option value="ACCESS">Right of Access — see my data</option>
                <option value="CORRECTION">Correction — update my data</option>
                <option value="DELETION">Right to Delete — remove my data</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={lbl}>Description *</label>
            <textarea
              rows={3}
              style={{ ...inp, resize: 'vertical' as any }}
              value={reqDesc}
              onChange={e => setReqDesc(e.target.value)}
              placeholder="Describe what information you are requesting access to, correcting, or requesting deletion of…"
            />
          </div>
          <button style={btnGold} onClick={handleSubmit} disabled={!reqName.trim() || !reqDesc.trim()}>
            Submit Request
          </button>
        </div>
      )}

      {/* Requests table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tbl}>
          <thead>
            <tr>{['Submitted','Requester','Type','Description','Status','Action'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <>
                <tr key={r.id}>
                  <td style={{ ...td, whiteSpace: 'nowrap', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{fmtD(r.submittedAt)}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{r.requesterName}<br/><span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>{r.requesterEmail}</span></td>
                  <td style={td}><span style={pill(TYPE_COLORS[r.type])}>{TYPE_LABELS[r.type]}</span></td>
                  <td style={{ ...td, maxWidth: 240, whiteSpace: 'normal', lineHeight: 1.4 }}>{r.description}</td>
                  <td style={td}><span style={pill(DR_STATUS_COLOR[r.status])}>{r.status}</span></td>
                  <td style={td}>
                    {(r.status === 'PENDING' || r.status === 'IN_PROGRESS') && currentUser.role === 'super_admin' ? (
                      <button style={btnSm('#60a5fa')} onClick={() => setResolveId(resolveId === r.id ? null : r.id)}>
                        Respond
                      </button>
                    ) : r.resolvedAt ? (
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{fmtD(r.resolvedAt)}</span>
                    ) : null}
                  </td>
                </tr>
                {resolveId === r.id && (
                  <tr key={`${r.id}-resolve`}>
                    <td colSpan={6} style={{ ...td, background: 'rgba(0,0,0,0.15)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                          <label style={lbl}>Resolution note *</label>
                          <textarea rows={2} style={{ ...inp, resize: 'vertical' as any }} value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Describe how this request was handled…" />
                        </div>
                        <button style={btnSm('#34d399')} onClick={() => handleResolve(r.id, false)}>Mark Resolved</button>
                        <button style={btnSm('#e05252')} onClick={() => handleResolve(r.id, true)}>Reject</button>
                      </div>
                    </td>
                  </tr>
                )}
                {r.resolution && (
                  <tr key={`${r.id}-res`}>
                    <td colSpan={6} style={{ ...td, background: 'rgba(52,211,153,0.03)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                      ✓ Resolution by <strong style={{ color: '#34d399' }}>{r.resolvedBy}</strong> on {r.resolvedAt ? fmtD(r.resolvedAt) : '—'}: {r.resolution}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && <div style={empty}>No data requests submitted yet.</div>}
      </div>
    </div>
  );
}

// 3. Mandatory Welfare Reports
function WelfareReportsPanel({ currentUser }: { currentUser: CurrentUser }) {
  const [showForm, setShowForm]     = useState(false);
  const [childName, setChildName]   = useState('');
  const [childId, setChildId]       = useState('');
  const [concern, setConcern]       = useState('');
  const [severity, setSeverity]     = useState<'low' | 'medium' | 'high'>('medium');
  const [witnessed, setWitnessed]   = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [referred, setReferred]     = useState(false);
  const [referralDetail, setReferralDetail] = useState('');
  const [expandId, setExpandId]     = useState<string | null>(null);
  const [updateId, setUpdateId]     = useState<string | null>(null);
  const [updateNote, setUpdateNote] = useState('');
  const [updateStatus, setUpdateStatus] = useState<WelfareReportStatus>('UNDER_REVIEW');
  const [refresh, setRefresh]       = useState(0);

  const reports = complianceStore.getAllWelfareReports();
  const open    = reports.filter(r => r.status !== 'RESOLVED');

  const handleSubmit = () => {
    if (!childName.trim() || !concern.trim() || !witnessed || !actionTaken.trim()) return;
    complianceStore.submitWelfareReport({
      createdBy: currentUser.name,
      createdByRole: currentUser.role,
      childId: childId || `child-${Date.now()}`,
      childName,
      concern,
      severity,
      witnessedOn: witnessed,
      actionTaken,
      referredExternally: referred,
      referralDetail: referred ? referralDetail : undefined,
    });
    complianceStore.log({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'FLAG_WELFARE_CONCERN',
      targetName: childName,
      detail: `Mandatory welfare report — ${severity} severity`,
    });
    setShowForm(false);
    setChildName(''); setChildId(''); setConcern(''); setWitnessed('');
    setActionTaken(''); setReferred(false); setReferralDetail('');
    setRefresh(r => r + 1);
  };

  const handleUpdateStatus = () => {
    if (!updateId) return;
    complianceStore.updateWelfareReportStatus(updateId, updateStatus, currentUser.name, updateNote || undefined);
    complianceStore.log({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: updateStatus === 'RESOLVED' ? 'RESOLVE_WELFARE_FLAG' : 'VIEW_WELFARE_FLAG',
      targetId: updateId,
      detail: `Status updated to ${updateStatus}${updateNote ? ': ' + updateNote : ''}`,
    });
    setUpdateId(null); setUpdateNote('');
    setRefresh(r => r + 1);
  };

  const STATUS_LABELS: Record<WelfareReportStatus, string> = {
    DRAFT: 'Draft', SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review', ESCALATED: 'Escalated', RESOLVED: 'Resolved',
  };

  return (
    <div style={card}>
      <div style={cardHead}>
        <span style={cardTitle}>🚨 Mandatory Welfare Reports</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {open.length > 0 && <span style={pill('#e05252')}>{open.length} open</span>}
          <button style={btnGold} onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Cancel' : '+ New Report'}
          </button>
        </div>
      </div>

      {/* Duty notice */}
      <div style={{ margin: '1rem 1.25rem 0', padding: '0.75rem 1rem', background: 'rgba(224,82,82,0.06)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: 9, fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
        🛡️ <strong style={{ color: '#e05252' }}>Children's Act 38 of 2005 — Section 110:</strong> Any person who has reason to believe a child is being abused or is in a situation of neglect <strong style={{ color: '#fff' }}>must report</strong> this to a designated child protection organisation or the SAPS.
      </div>

      {/* New report form */}
      {showForm && (
        <div style={{ margin: '1rem 1.25rem', padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(224,82,82,0.15)' }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.85rem', letterSpacing: '1.5px', color: '#e05252', marginBottom: '1rem' }}>
            MANDATORY WELFARE CONCERN REPORT
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={lbl}>Child's Full Name *</label>
              <input style={inp} value={childName} onChange={e => setChildName(e.target.value)} placeholder="e.g. Sipho Dlamini" />
            </div>
            <div>
              <label style={lbl}>Date Witnessed *</label>
              <input style={{ ...inp, colorScheme: 'dark' as any }} type="date" value={witnessed} onChange={e => setWitnessed(e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Severity *</label>
              <select style={inp} value={severity} onChange={e => setSeverity(e.target.value as any)}>
                <option value="low">Low — concern noted</option>
                <option value="medium">Medium — needs monitoring</option>
                <option value="high">High — immediate action required</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={lbl}>Description of Concern *</label>
            <textarea rows={3} style={{ ...inp, resize: 'vertical' as any }} value={concern}
              onChange={e => setConcern(e.target.value)}
              placeholder="Describe what you witnessed, heard, or observed in factual terms. Include dates, times, and other children present if relevant." />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={lbl}>Immediate Action Taken *</label>
            <textarea rows={2} style={{ ...inp, resize: 'vertical' as any }} value={actionTaken}
              onChange={e => setActionTaken(e.target.value)}
              placeholder="What did you do immediately? e.g. notified admin, separated child, contacted parent…" />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={referred} onChange={e => setReferred(e.target.checked)} />
              Referred externally (social worker, DSD, SAPS, doctor)
            </label>
            {referred && (
              <input style={{ ...inp, marginTop: '0.5rem' }} value={referralDetail}
                onChange={e => setReferralDetail(e.target.value)}
                placeholder="e.g. Referred to Department of Social Development — ref. number 2026/034" />
            )}
          </div>
          <button style={{ ...btnGold, opacity: (!childName.trim() || !concern.trim() || !witnessed || !actionTaken.trim()) ? 0.5 : 1 }}
            onClick={handleSubmit}
            disabled={!childName.trim() || !concern.trim() || !witnessed || !actionTaken.trim()}>
            Submit Mandatory Report
          </button>
        </div>
      )}

      {/* Reports list */}
      {reports.length === 0 ? (
        <div style={empty}>No welfare reports on record.</div>
      ) : (
        <div style={{ padding: '0.75rem 1.25rem 1.25rem' }}>
          {reports.map(r => (
            <div key={r.id} style={{
              background: r.status === 'RESOLVED' ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.18)',
              border: `1px solid ${r.status === 'RESOLVED' ? 'rgba(52,211,153,0.12)' : SEV_COLOR[r.severity] + '22'}`,
              borderRadius: 10, marginBottom: '0.75rem', overflow: 'hidden',
              opacity: r.status === 'RESOLVED' ? 0.7 : 1,
            }}>
              {/* Report header */}
              <div style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', cursor: 'pointer' }}
                onClick={() => setExpandId(expandId === r.id ? null : r.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>
                    {r.severity === 'high' ? '🔴' : r.severity === 'medium' ? '🟡' : '🟢'}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{r.childName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                      Witnessed {fmtD(r.witnessedOn)} · Reported by {r.createdBy} · {fmtD(r.createdAt)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={pill(SEV_COLOR[r.severity])}>{r.severity}</span>
                  <span style={pill(STATUS_COLOR[r.status])}>{STATUS_LABELS[r.status]}</span>
                  {r.referredExternally && <span style={pill('#e05252')}>Externally Referred</span>}
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>{expandId === r.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {expandId === r.id && (
                <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ paddingTop: '0.875rem', marginBottom: '0.75rem' }}>
                    <div style={{ ...lbl, marginBottom: '0.25rem' }}>Concern</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>{r.concern}</div>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ ...lbl, marginBottom: '0.25rem' }}>Immediate Action Taken</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>{r.actionTaken}</div>
                  </div>
                  {r.referredExternally && r.referralDetail && (
                    <div style={{ marginBottom: '0.75rem', padding: '0.6rem 0.875rem', background: 'rgba(224,82,82,0.07)', border: '1px solid rgba(224,82,82,0.18)', borderRadius: 8 }}>
                      <span style={{ ...lbl, color: '#e05252', marginBottom: 0 }}>External Referral: </span>
                      <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{r.referralDetail}</span>
                    </div>
                  )}

                  {/* Status history */}
                  <div style={{ marginBottom: '0.875rem' }}>
                    <div style={{ ...lbl, marginBottom: '0.5rem' }}>Status History</div>
                    {r.statusHistory.map((h, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[h.status], marginTop: 5, flexShrink: 0 }} />
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                          <span style={pill(STATUS_COLOR[h.status])}>{STATUS_LABELS[h.status]}</span>
                          {' '}by <strong style={{ color: '#fff' }}>{h.by}</strong> on {fmtDT(h.at)}
                          {h.note && <span> — {h.note}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Update status (admin only) */}
                  {currentUser.role === 'super_admin' && r.status !== 'RESOLVED' && (
                    <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ ...lbl, marginBottom: '0.5rem' }}>Update Status</div>
                      {updateId === r.id ? (
                        <div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            {(['UNDER_REVIEW', 'ESCALATED', 'RESOLVED'] as WelfareReportStatus[]).map(s => (
                              <button key={s} onClick={() => setUpdateStatus(s)} style={{
                                ...btnSm(STATUS_COLOR[s]),
                                background: updateStatus === s ? `${STATUS_COLOR[s]}25` : 'transparent',
                                fontWeight: updateStatus === s ? 800 : 600,
                              }}>
                                {STATUS_LABELS[s]}
                              </button>
                            ))}
                          </div>
                          <textarea rows={2} style={{ ...inp, marginBottom: '0.5rem', resize: 'vertical' as any }}
                            value={updateNote} onChange={e => setUpdateNote(e.target.value)}
                            placeholder="Add a note about this status change (optional)…" />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button style={btnGold} onClick={handleUpdateStatus}>Save Update</button>
                            <button style={btnSm('#9ca3af')} onClick={() => setUpdateId(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button style={btnSm('#60a5fa')} onClick={() => setUpdateId(r.id)}>Update Status</button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 4. Role-based access summary
function AccessControlPanel() {
  const rows = [
    { feature: 'Child Profiles (name, grade, address)', superAdmin: true, teacher: true, parent: 'Own children only' },
    { feature: 'Medical Information (allergies, conditions)', superAdmin: true, teacher: true, parent: 'Own children only' },
    { feature: 'Welfare Flags & Reports', superAdmin: true, teacher: true, parent: false },
    { feature: 'Audit Trail / Access Log', superAdmin: true, teacher: false, parent: false },
    { feature: 'Export Data (CSV/PDF)', superAdmin: true, teacher: false, parent: false },
    { feature: 'Delete Child Records', superAdmin: true, teacher: false, parent: false },
    { feature: 'Approve / Reject Teachers', superAdmin: true, teacher: false, parent: false },
    { feature: 'POPIA Data Requests', superAdmin: 'Manage all', teacher: false, parent: 'Submit own' },
    { feature: 'Attendance Records', superAdmin: true, teacher: 'Own class', parent: 'Own children only' },
    { feature: 'Feeding Scheme Data', superAdmin: true, teacher: 'Own class', parent: 'Own children only' },
  ];

  const cell = (v: boolean | string) => {
    if (v === true)  return <span style={pill('#34d399')}>✓ Full Access</span>;
    if (v === false) return <span style={pill('#9ca3af')}>✗ No Access</span>;
    return <span style={pill('#fbbf24')}>{v}</span>;
  };

  return (
    <div style={card}>
      <div style={cardHead}>
        <span style={cardTitle}>🔐 Role-Based Access Control</span>
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>POPIA — limited access by role</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={tbl}>
          <thead>
            <tr>
              <th style={th}>Feature / Data</th>
              <th style={th}>Super Admin</th>
              <th style={th}>Teacher</th>
              <th style={th}>Parent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.feature}>
                <td style={{ ...td, fontWeight: 600 }}>{r.feature}</td>
                <td style={td}>{cell(r.superAdmin)}</td>
                <td style={td}>{cell(r.teacher)}</td>
                <td style={td}>{cell(r.parent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 5. POPIA compliance summary cards
function POPIASummaryCards() {
  const auditCount    = complianceStore.getAuditLog(9999).length;
  const pendingReqs   = complianceStore.getPendingDataRequests().length;
  const openReports   = complianceStore.getOpenWelfareReports().length;

  const items = [
    { label: 'Audit Entries', value: auditCount, sub: 'All access logged', color: '#60a5fa' },
    { label: 'Pending Data Requests', value: pendingReqs, sub: 'POPIA right to access', color: pendingReqs > 0 ? '#fbbf24' : '#34d399' },
    { label: 'Open Welfare Reports', value: openReports, sub: 'Mandatory reporting', color: openReports > 0 ? '#e05252' : '#34d399' },
    { label: 'Compliance Status', value: 'Active', sub: 'POPIA · Children\'s Act', color: '#34d399' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.875rem', marginBottom: '1.25rem' }}>
      {items.map(s => (
        <div key={s.label} style={{ background: '#0a2410', border: '1px solid rgba(240,192,0,0.1)', borderRadius: 11, padding: '1.1rem 1.25rem' }}>
          <div style={{ fontSize: '0.63rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.4rem' }}>{s.label}</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
type Section = 'overview' | 'audit' | 'requests' | 'welfare' | 'access';

export default function ComplianceDashboard({ currentUser }: Props) {
  const [section, setSection] = useState<Section>('overview');

  const NAV: { id: Section; icon: string; label: string }[] = [
    { id: 'overview',  icon: '📊', label: 'Overview' },
    { id: 'audit',     icon: '🔍', label: 'Audit Trail' },
    { id: 'requests',  icon: '📋', label: 'Data Requests' },
    { id: 'welfare',   icon: '🚨', label: 'Welfare Reports' },
    { id: 'access',    icon: '🔐', label: 'Access Control' },
  ];

  return (
    <>
      {/* Section nav */}
      <div style={{
        display: 'flex', gap: '0.4rem', flexWrap: 'wrap',
        marginBottom: '1.25rem', padding: '0.75rem 1rem',
        background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 10, position: 'sticky', top: 0, zIndex: 20,
        backdropFilter: 'blur(8px)',
      }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setSection(n.id)} style={{
            padding: '0.35rem 0.85rem', borderRadius: 20,
            border: `1px solid ${section === n.id ? 'rgba(240,192,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
            background: section === n.id ? 'rgba(240,192,0,0.12)' : 'transparent',
            color: section === n.id ? '#f0c000' : 'rgba(255,255,255,0.4)',
            fontFamily: "'DM Sans',sans-serif", fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}>
            <span>{n.icon}</span> {n.label}
          </button>
        ))}
      </div>

      {/* POPIA notice banner */}
      <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🔒</span>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
          <strong style={{ color: '#60a5fa' }}>POPIA Compliant System</strong> — This portal processes personal information in accordance with the Protection of Personal Information Act (Act 4 of 2013). All access to child and family data is logged, role-restricted, and subject to data subject rights. <strong style={{ color: '#fff' }}>Data subjects may request access, correction, or deletion of their personal information at any time.</strong>
        </div>
      </div>

      {(section === 'overview') && (
        <>
          <POPIASummaryCards />
          <AccessControlPanel />
        </>
      )}
      {(section === 'audit')    && <AuditTrailPanel />}
      {(section === 'requests') && <DataRequestsPanel currentUser={currentUser} />}
      {(section === 'welfare')  && <WelfareReportsPanel currentUser={currentUser} />}
      {(section === 'access')   && <AccessControlPanel />}
    </>
  );
}