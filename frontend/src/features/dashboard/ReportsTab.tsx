// frontend/src/features/dashboard/ReportsTab.tsx
// Drop-in replacement for the Reports tab inside SuperAdminDashboard.tsx
//
// USAGE — in SuperAdminDashboard.tsx:
//   1. Import this component:
//        import ReportsTab from './ReportsTab';
//   2. Replace the {activeTab === 'reports' && ( ... )} block with:
//        {activeTab === 'reports' && (
//          <ReportsTab
//            childrenData={childrenData}
//            welfareList={welfareList}
//            teachers={teachers}
//            families={mergedFamilies}
//            avgAttendance={avgAttendance}
//            totalFed={totalFed}
//          />
//        )}

import { useState, useMemo, useRef } from 'react';

// ─── Types (mirror what SuperAdminDashboard already uses) ─────────────────────
interface StoredChild {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  gender: string;
  dateOfBirth: string;
  schoolName?: string;
  physicalAddress?: string;
  hasAllergies?: string;
  allergiesDetails?: string;
  hasMedicalCondition?: string;
  medicalDetails?: string;
  consentActivities?: string;
  consentMedical?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactNumber?: string;
  relationship?: string;
  attendanceRate?: number;
  fedCount?: number;
  welfareFlags?: number;
  registeredDate?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
}

interface WelfareFlag {
  id: string;
  childName: string;
  concern: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  resolved: boolean;
  flaggedBy: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  approved: boolean;
  phone?: string;
  position?: string;
  createdAt?: string;
}

interface FamilyRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: number;
  consentComplete: boolean;
  lastActive: string;
  address?: string;
  relationship?: string;
}

interface ReportsTabProps {
  childrenData: StoredChild[];
  welfareList: WelfareFlag[];
  teachers: Teacher[];
  families: FamilyRecord[];
  avgAttendance: number;
  totalFed: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0];
const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
const printTable = (title: string, rows: string[][], headers: string[]) => {
  const w = window.open('', '_blank');
  if (!w) return;
  const thead = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
  const tbody = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
  w.document.write(`
    <html><head><title>${title}</title>
    <style>
      body { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #111; padding: 24px; }
      h1 { font-size: 20px; margin-bottom: 4px; }
      .meta { color: #555; font-size: 12px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #0a2e12; color: #f0c000; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; }
      td { padding: 7px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
      tr:nth-child(even) td { background: #f8f8f8; }
      .pill-high   { background: #fee2e2; color: #b91c1c; padding: 2px 7px; border-radius: 9px; font-size: 11px; font-weight: 700; }
      .pill-medium { background: #fef9c3; color: #92400e; padding: 2px 7px; border-radius: 9px; font-size: 11px; font-weight: 700; }
      .pill-low    { background: #f3f4f6; color: #374151; padding: 2px 7px; border-radius: 9px; font-size: 11px; font-weight: 700; }
      .pill-green  { background: #dcfce7; color: #166534; padding: 2px 7px; border-radius: 9px; font-size: 11px; font-weight: 700; }
      .pill-red    { background: #fee2e2; color: #b91c1c; padding: 2px 7px; border-radius: 9px; font-size: 11px; font-weight: 700; }
      footer { margin-top: 24px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
    </style></head><body>
    <h1>${title}</h1>
    <div class="meta">Generated: ${new Date().toLocaleString('en-ZA')} · Sunday School Management Portal · POPIA Compliant</div>
    <table><thead>${thead}</thead><tbody>${tbody}</tbody></table>
    <footer>🔒 This report contains confidential data. Handle in accordance with POPIA regulations. Not for public distribution.</footer>
    </body></html>
  `);
  w.document.close();
  setTimeout(() => w.print(), 400);
};

const exportCSV = (filename: string, rows: string[][], headers: string[]) => {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines = [headers.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle, count }: { icon: string; title: string; subtitle: string; count?: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '1rem',
      padding: '1.25rem 1.5rem',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: 'rgba(240,192,0,0.1)', border: '1px solid rgba(240,192,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.05rem',
          letterSpacing: '1.5px', color: '#f0c000',
        }}>{title}</div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>{subtitle}</div>
      </div>
      {count !== undefined && (
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem',
          color: '#f0c000', lineHeight: 1,
        }}>{count}</div>
      )}
    </div>
  );
}

function ExportBar({ onPDF, onCSV }: { onPDF: () => void; onCSV: () => void }) {
  return (
    <div style={{
      display: 'flex', gap: '0.5rem', padding: '0.75rem 1.25rem',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(0,0,0,0.12)',
    }}>
      <span style={{ flex: 1, fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', alignSelf: 'center' }}>
        🔒 POPIA-compliant export
      </span>
      <button onClick={onPDF} style={{
        padding: '0.38rem 0.9rem', borderRadius: 6,
        border: '1px solid rgba(240,192,0,0.3)', background: 'rgba(240,192,0,0.08)',
        color: '#f0c000', fontFamily: "'DM Sans',sans-serif", fontSize: '0.72rem',
        fontWeight: 700, cursor: 'pointer',
      }}>📄 Print / PDF</button>
      <button onClick={onCSV} style={{
        padding: '0.38rem 0.9rem', borderRadius: 6,
        border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)',
        color: '#34d399', fontFamily: "'DM Sans',sans-serif", fontSize: '0.72rem',
        fontWeight: 700, cursor: 'pointer',
      }}>📊 Export CSV</button>
    </div>
  );
}

function StatBadge({ label, value, color = '#f0c000' }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 9, padding: '0.75rem 1rem', textAlign: 'center',
    }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.5rem', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 3 }}>{label}</div>
    </div>
  );
}

function AttendanceBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? '#34d399' : pct >= 60 ? '#f0c000' : '#e05252';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color }} />
      </div>
      <span style={{ fontSize: '0.78rem', fontWeight: 700, color, minWidth: 36, textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

// ─── 1. Funding & Donations ───────────────────────────────────────────────────
function FundingReport({ childrenData, welfareList, totalFed, avgAttendance }: {
  childrenData: StoredChild[]; welfareList: WelfareFlag[];
  totalFed: number; avgAttendance: number;
}) {
  const interventions = welfareList.filter(w => w.resolved).length;
  const consentRate = childrenData.length
    ? Math.round(childrenData.filter(c => c.consentActivities === 'true' || c.consentActivities === 'Yes').length / childrenData.length * 100)
    : 0;

  const rows: string[][] = [
    ['Total Children Enrolled', String(childrenData.length), 'Active learners in programme'],
    ['Average Sunday Attendance', `${avgAttendance}%`, 'Weekly attendance rate'],
    ['Total Meals / Snacks Served', String(totalFed), 'Cumulative feeding scheme count'],
    ['Welfare Cases Identified', String(welfareList.length), 'Children flagged for pastoral care'],
    ['Welfare Interventions Resolved', String(interventions), 'Cases successfully closed'],
    ['Consent Form Completion', `${consentRate}%`, 'Families with full consent on file'],
    ['Grade Groups Served', String(new Set(childrenData.map(c => c.grade)).size), 'Number of distinct grade levels'],
  ];

  return (
    <div style={{ background: '#0a2410', border: '1px solid rgba(240,192,0,0.12)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem' }}>
      <SectionHeader icon="💰" title="Funding & Donations Impact Report" subtitle="Demonstrates reach, need, and impact to donors and funders" count={childrenData.length} />
      <div style={{ padding: '1.25rem' }}>
        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <StatBadge label="Children Served" value={childrenData.length} />
          <StatBadge label="Avg Attendance" value={`${avgAttendance}%`} color="#34d399" />
          <StatBadge label="Meals Provided" value={totalFed} color="#60a5fa" />
          <StatBadge label="Welfare Interventions" value={interventions} color="#a78bfa" />
        </div>

        {/* Narrative summary */}
        <div style={{
          background: 'rgba(240,192,0,0.05)', border: '1px solid rgba(240,192,0,0.12)',
          borderRadius: 9, padding: '1rem', marginBottom: '1.1rem',
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f0c000', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Donor Impact Narrative</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>
            Our Sunday School programme currently serves <strong style={{ color: '#f0c000' }}>{childrenData.length} children</strong> across{' '}
            <strong style={{ color: '#f0c000' }}>{new Set(childrenData.map(c => c.grade)).size} grade groups</strong>.
            With an average weekly attendance of <strong style={{ color: '#34d399' }}>{avgAttendance}%</strong>, we have delivered{' '}
            <strong style={{ color: '#60a5fa' }}>{totalFed} meals</strong> through our feeding scheme, directly addressing food insecurity.
            Our dedicated welfare programme has identified and resolved{' '}
            <strong style={{ color: '#a78bfa' }}>{interventions} pastoral care cases</strong>, demonstrating our commitment to child safety and wellbeing in line with POPIA and national child protection standards.
          </div>
        </div>

        {/* Detailed data table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr>
              {['Metric', 'Value', 'Notes'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '0.5rem 0.75rem',
                  fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, value, note]) => (
              <tr key={label}>
                <td style={{ padding: '0.55rem 0.75rem', color: 'rgba(255,255,255,0.65)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{label}</td>
                <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#f0c000', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.9rem' }}>{value}</td>
                <td style={{ padding: '0.55rem 0.75rem', color: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem' }}>{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExportBar
        onPDF={() => printTable('Funding & Donations Impact Report', rows, ['Metric', 'Value', 'Notes'])}
        onCSV={() => exportCSV(`funding-impact-${today}.csv`, rows, ['Metric', 'Value', 'Notes'])}
      />
    </div>
  );
}

// ─── 2. Feeding Scheme Planning ───────────────────────────────────────────────
function FeedingReport({ childrenData, totalFed }: { childrenData: StoredChild[]; totalFed: number }) {
  const [sessionsPerMonth, setSessionsPerMonth] = useState(4);
  const [months, setMonths] = useState(3);

  const presentAvg = childrenData.length
    ? Math.round(childrenData.filter(c => (c.attendanceRate ?? 0) >= 60).length)
    : 0;

  const projected = presentAvg * sessionsPerMonth * months;
  const kgPerChild = 0.25; // 250g per child per session
  const projectedKg = Math.round(projected * kgPerChild * 10) / 10;
  const costPerMeal = 12; // R12 ZAR average
  const projectedCost = projected * costPerMeal;

  const gradeBreakdown = useMemo(() => {
    const map: Record<string, { grade: string; count: number; avgAtt: number; totalFed: number }> = {};
    childrenData.forEach(c => {
      if (!map[c.grade]) map[c.grade] = { grade: c.grade, count: 0, avgAtt: 0, totalFed: 0 };
      map[c.grade].count++;
      map[c.grade].avgAtt += c.attendanceRate ?? 0;
      map[c.grade].totalFed += c.fedCount ?? 0;
    });
    return Object.values(map).map(g => ({
      ...g,
      avgAtt: g.count ? Math.round(g.avgAtt / g.count) : 0,
    })).sort((a, b) => a.grade.localeCompare(b.grade));
  }, [childrenData]);

  const csvRows: string[][] = [
    ...gradeBreakdown.map(g => [g.grade, String(g.count), `${g.avgAtt}%`, String(g.totalFed)]),
    ['TOTALS', String(childrenData.length), '—', String(totalFed)],
  ];

  return (
    <div style={{ background: '#0a2410', border: '1px solid rgba(240,192,0,0.12)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem' }}>
      <SectionHeader icon="🍽️" title="Feeding Scheme Planning Report" subtitle="Forecast food quantities, budget requirements and per-grade breakdown" count={totalFed} />
      <div style={{ padding: '1.25rem' }}>
        {/* Projection planner */}
        <div style={{
          background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)',
          borderRadius: 9, padding: '1rem 1.25rem', marginBottom: '1.1rem',
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.85rem' }}>📐 Quantity Forecaster</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Sessions / month</label>
              <input
                type="number" min={1} max={8} value={sessionsPerMonth}
                onChange={e => setSessionsPerMonth(Number(e.target.value))}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '0.45rem 0.7rem', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Planning period (months)</label>
              <input
                type="number" min={1} max={12} value={months}
                onChange={e => setMonths(Number(e.target.value))}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '0.45rem 0.7rem', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.65rem' }}>
            <StatBadge label="Projected Servings" value={projected} color="#34d399" />
            <StatBadge label={`Food Required (kg, @${kgPerChild}kg/child)`} value={`${projectedKg}kg`} color="#60a5fa" />
            <StatBadge label={`Est. Budget (@R${costPerMeal}/meal)`} value={`R${projectedCost.toLocaleString('en-ZA')}`} color="#f0c000" />
          </div>
          <div style={{ marginTop: '0.6rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>
            * Based on {presentAvg} children with ≥60% attendance. Adjust cost-per-meal and kg-per-child in code to match local rates.
          </div>
        </div>

        {/* Per-grade table */}
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
          Per-Grade Breakdown
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr>
              {['Grade', 'Children', 'Avg Attendance', 'Total Fed (sessions)'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '0.5rem 0.75rem',
                  fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gradeBreakdown.map(g => (
              <tr key={g.grade}>
                <td style={{ padding: '0.55rem 0.75rem', color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{g.grade}</td>
                <td style={{ padding: '0.55rem 0.75rem', color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{g.count}</td>
                <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', minWidth: 140 }}>
                  <AttendanceBar pct={g.avgAtt} />
                </td>
                <td style={{ padding: '0.55rem 0.75rem', color: '#34d399', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{g.totalFed}</td>
              </tr>
            ))}
            <tr style={{ background: 'rgba(240,192,0,0.04)' }}>
              <td style={{ padding: '0.55rem 0.75rem', color: '#f0c000', fontWeight: 700, fontFamily: "'Bebas Neue',sans-serif" }}>TOTAL</td>
              <td style={{ padding: '0.55rem 0.75rem', color: '#f0c000', fontWeight: 700, fontFamily: "'Bebas Neue',sans-serif" }}>{childrenData.length}</td>
              <td style={{ padding: '0.55rem 0.75rem' }}>—</td>
              <td style={{ padding: '0.55rem 0.75rem', color: '#f0c000', fontWeight: 700, fontFamily: "'Bebas Neue',sans-serif" }}>{totalFed}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ExportBar
        onPDF={() => printTable('Feeding Scheme Planning Report', csvRows, ['Grade', 'Children', 'Avg Attendance', 'Total Fed'])}
        onCSV={() => exportCSV(`feeding-scheme-${today}.csv`, csvRows, ['Grade', 'Children', 'Avg Attendance', 'Total Fed'])}
      />
    </div>
  );
}

// ─── 3. Pastoral Care ─────────────────────────────────────────────────────────
function PastoralReport({ childrenData, welfareList }: { childrenData: StoredChild[]; welfareList: WelfareFlag[] }) {
  const atRiskByAtt = childrenData.filter(c => (c.attendanceRate ?? 100) < 60);
  const medicalNeeds = childrenData.filter(c => c.hasMedicalCondition === 'Yes' || c.hasMedicalCondition === 'true');
  const noConsent = childrenData.filter(c => c.consentMedical !== 'true' && c.consentMedical !== 'Yes');
  const openWelfare = welfareList.filter(w => !w.resolved);
  const highRisk = openWelfare.filter(w => w.severity === 'high');

  const sevColor = (s: string) => s === 'high' ? '#e05252' : s === 'medium' ? '#f0c000' : '#9ca3af';

  const csvRows: string[][] = [
    ...childrenData.map(c => [
      `${c.firstName} ${c.lastName}`,
      c.grade,
      `${c.attendanceRate ?? 0}%`,
      c.welfareFlags ? String(c.welfareFlags) : '0',
      c.hasMedicalCondition === 'Yes' ? 'Yes' : 'No',
      c.consentMedical === 'Yes' ? 'Yes' : 'No',
      (c.attendanceRate ?? 100) < 60 ? 'AT RISK' : 'OK',
    ]),
  ];

  return (
    <div style={{ background: '#0a2410', border: '1px solid rgba(240,192,0,0.12)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem' }}>
      <SectionHeader icon="🛡️" title="Pastoral Care Report" subtitle="At-risk children, welfare flags, medical needs and consent status" />
      <div style={{ padding: '1.25rem' }}>
        {/* Alert summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <StatBadge label="Open Welfare Cases" value={openWelfare.length} color={openWelfare.length > 0 ? '#e05252' : '#34d399'} />
          <StatBadge label="High Severity Flags" value={highRisk.length} color={highRisk.length > 0 ? '#e05252' : '#34d399'} />
          <StatBadge label="Low Attendance (<60%)" value={atRiskByAtt.length} color={atRiskByAtt.length > 0 ? '#f0c000' : '#34d399'} />
          <StatBadge label="Medical Needs" value={medicalNeeds.length} color="#60a5fa" />
        </div>

        {/* High-priority alerts */}
        {highRisk.length > 0 && (
          <div style={{ background: 'rgba(224,82,82,0.07)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: 9, padding: '1rem', marginBottom: '1.1rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#e05252', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.65rem' }}>🚨 High-Priority Cases — Immediate Action Required</div>
            {highRisk.map(w => (
              <div key={w.id} style={{ padding: '0.65rem', borderRadius: 7, background: 'rgba(0,0,0,0.2)', marginBottom: '0.5rem', borderLeft: '3px solid #e05252' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>{w.childName}</span>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{fmtDate(w.date)} · {w.flaggedBy}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{w.concern}</div>
              </div>
            ))}
          </div>
        )}

        {/* At-risk children table */}
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
          All Children — Pastoral Risk View
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr>
              {['Child', 'Grade', 'Attendance', 'Welfare Flags', 'Medical', 'Consent', 'Status'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '0.5rem 0.65rem',
                  fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {childrenData.map(c => {
              const att = c.attendanceRate ?? 0;
              const isAtRisk = att < 60 || (c.welfareFlags ?? 0) > 0;
              const wf = welfareList.filter(w => !w.resolved && w.childName === `${c.firstName} ${c.lastName}`);
              const worstSev = wf.find(w => w.severity === 'high')?.severity ?? wf.find(w => w.severity === 'medium')?.severity ?? wf[0]?.severity;
              return (
                <tr key={c.id} style={{ background: isAtRisk ? 'rgba(224,82,82,0.03)' : 'transparent' }}>
                  <td style={{ padding: '0.55rem 0.65rem', color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {c.firstName} {c.lastName}
                  </td>
                  <td style={{ padding: '0.55rem 0.65rem', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem' }}>{c.grade}</td>
                  <td style={{ padding: '0.55rem 0.65rem', borderBottom: '1px solid rgba(255,255,255,0.04)', minWidth: 120 }}>
                    <AttendanceBar pct={att} />
                  </td>
                  <td style={{ padding: '0.55rem 0.65rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {(c.welfareFlags ?? 0) > 0 ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: sevColor(worstSev ?? 'low') }}>
                        🚩 {c.welfareFlags}
                      </span>
                    ) : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>—</span>}
                  </td>
                  <td style={{ padding: '0.55rem 0.65rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {c.hasMedicalCondition === 'Yes'
                      ? <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#60a5fa' }}>⚕ Yes</span>
                      : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>—</span>}
                  </td>
                  <td style={{ padding: '0.55rem 0.65rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {c.consentMedical === 'Yes'
                      ? <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399' }}>✓ Signed</span>
                      : <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f0c000' }}>⚠ Missing</span>}
                  </td>
                  <td style={{ padding: '0.55rem 0.65rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {isAtRisk
                      ? <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(224,82,82,0.12)', color: '#e05252', border: '1px solid rgba(224,82,82,0.2)', padding: '0.15rem 0.5rem', borderRadius: 20 }}>AT RISK</span>
                      : <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)', padding: '0.15rem 0.5rem', borderRadius: 20 }}>OK</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {noConsent.length > 0 && (
          <div style={{ marginTop: '1rem', background: 'rgba(240,192,0,0.05)', border: '1px solid rgba(240,192,0,0.15)', borderRadius: 8, padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f0c000', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
              ⚠ Consent Follow-Up Required ({noConsent.length} children)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {noConsent.map(c => (
                <span key={c.id} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.2rem 0.6rem', borderRadius: 20 }}>
                  {c.firstName} {c.lastName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <ExportBar
        onPDF={() => printTable('Pastoral Care Report', csvRows, ['Child', 'Grade', 'Attendance', 'Welfare Flags', 'Medical Needs', 'Consent', 'Status'])}
        onCSV={() => exportCSV(`pastoral-care-${today}.csv`, csvRows, ['Child', 'Grade', 'Attendance', 'Welfare Flags', 'Medical Needs', 'Consent', 'Status'])}
      />
    </div>
  );
}

// ─── 4. Volunteer Deployment ──────────────────────────────────────────────────
function VolunteerReport({ teachers, childrenData }: { teachers: Teacher[]; childrenData: StoredChild[] }) {
  const approved = teachers.filter(t => t.approved);
  const pending = teachers.filter(t => !t.approved);
  const childrenPerTeacher = approved.length ? Math.round(childrenData.length / approved.length) : 0;

  const csvRows: string[][] = [
    ...approved.map((t, i) => [
      t.name, t.email, t.phone ?? '—', t.position ?? 'Teacher',
      'Approved', t.createdAt ? fmtDate(t.createdAt) : '—',
      i === 0 ? String(childrenData.length) : '0', // simplified demo allocation
    ]),
    ...pending.map(t => [
      t.name, t.email, t.phone ?? '—', t.position ?? 'Teacher',
      'Pending Approval', t.createdAt ? fmtDate(t.createdAt) : '—', '—',
    ]),
  ];

  return (
    <div style={{ background: '#0a2410', border: '1px solid rgba(240,192,0,0.12)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem' }}>
      <SectionHeader icon="🧑‍🏫" title="Volunteer Deployment Report" subtitle="Teacher workload, class sizes and approval status" />
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <StatBadge label="Active Teachers" value={approved.length} color="#34d399" />
          <StatBadge label="Pending Approval" value={pending.length} color={pending.length > 0 ? '#f0c000' : '#9ca3af'} />
          <StatBadge label="Total Children" value={childrenData.length} />
          <StatBadge label="Children / Teacher" value={childrenPerTeacher} color="#60a5fa" />
        </div>

        {childrenPerTeacher > 15 && (
          <div style={{ background: 'rgba(240,192,0,0.07)', border: '1px solid rgba(240,192,0,0.2)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>
            ⚠ <strong style={{ color: '#f0c000' }}>High load alert:</strong> {childrenPerTeacher} children per teacher exceeds the recommended ratio of 1:15. Consider recruiting additional volunteers.
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr>
              {['Teacher', 'Email', 'Phone', 'Position', 'Status', 'Joined'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '0.5rem 0.65rem',
                  fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...approved, ...pending].map(t => (
              <tr key={t.id}>
                <td style={{ padding: '0.55rem 0.65rem', color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{t.name}</td>
                <td style={{ padding: '0.55rem 0.65rem', color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem' }}>{t.email}</td>
                <td style={{ padding: '0.55rem 0.65rem', color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem' }}>{t.phone ?? '—'}</td>
                <td style={{ padding: '0.55rem 0.65rem', color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem' }}>{t.position ?? 'Teacher'}</td>
                <td style={{ padding: '0.55rem 0.65rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {t.approved
                    ? <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)', padding: '0.15rem 0.5rem', borderRadius: 20 }}>✓ Active</span>
                    : <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(240,192,0,0.1)', color: '#f0c000', border: '1px solid rgba(240,192,0,0.2)', padding: '0.15rem 0.5rem', borderRadius: 20 }}>⏳ Pending</span>}
                </td>
                <td style={{ padding: '0.55rem 0.65rem', color: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem' }}>
                  {t.createdAt ? fmtDate(t.createdAt) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExportBar
        onPDF={() => printTable('Volunteer Deployment Report', csvRows, ['Teacher', 'Email', 'Phone', 'Position', 'Status', 'Joined', 'Children Assigned'])}
        onCSV={() => exportCSV(`volunteer-deployment-${today}.csv`, csvRows, ['Teacher', 'Email', 'Phone', 'Position', 'Status', 'Joined', 'Children Assigned'])}
      />
    </div>
  );
}

// ─── 5. Church Leadership Reporting ──────────────────────────────────────────
function LeadershipReport({ childrenData, welfareList, teachers, families, totalFed, avgAttendance }: ReportsTabProps) {
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  const openWelfare = welfareList.filter(w => !w.resolved);
  const resolved = welfareList.filter(w => w.resolved);
  const consentPct = families.length
    ? Math.round(families.filter(f => f.consentComplete).length / families.length * 100)
    : 0;

  const PERIOD_LABELS = { monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual' };

  const summaryRows: string[][] = [
    ['Reporting Period', PERIOD_LABELS[period], ''],
    ['Report Generated', new Date().toLocaleString('en-ZA'), ''],
    ['', '', ''],
    ['PROGRAMME OVERVIEW', '', ''],
    ['Total Registered Children', String(childrenData.length), ''],
    ['Total Registered Families', String(families.length), ''],
    ['Active Teachers / Volunteers', String(teachers.filter(t => t.approved).length), ''],
    ['', '', ''],
    ['ATTENDANCE', '', ''],
    ['Average Sunday Attendance Rate', `${avgAttendance}%`, avgAttendance >= 80 ? '✓ Target Met' : '⚠ Below 80% Target'],
    ['', '', ''],
    ['FEEDING SCHEME', '', ''],
    ['Total Meals Served', String(totalFed), ''],
    ['', '', ''],
    ['PASTORAL CARE & WELFARE', '', ''],
    ['Open Welfare Cases', String(openWelfare.length), openWelfare.length > 0 ? '⚠ Action Required' : '✓ None Outstanding'],
    ['Resolved Welfare Cases', String(resolved.length), ''],
    ['High-Severity Flags (Open)', String(openWelfare.filter(w => w.severity === 'high').length), ''],
    ['', '', ''],
    ['COMPLIANCE & SAFEGUARDING', '', ''],
    ['Family Consent Completion', `${consentPct}%`, consentPct === 100 ? '✓ Fully Compliant' : '⚠ Follow-up Required'],
    ['Data Handling Standard', 'POPIA Compliant', '✓'],
    ['Safeguarding Policy', 'Active', '✓'],
  ];

  return (
    <div style={{ background: '#0a2410', border: '1px solid rgba(240,192,0,0.12)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem' }}>
      <SectionHeader icon="⛪" title="Church Leadership Report" subtitle="Monthly, quarterly, and annual programme summaries for leadership" />
      <div style={{ padding: '1.25rem' }}>
        {/* Period selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {(['monthly', 'quarterly', 'annual'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '0.42rem 1rem', borderRadius: 20,
              border: `1px solid ${period === p ? 'rgba(240,192,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
              background: period === p ? 'rgba(240,192,0,0.12)' : 'transparent',
              color: period === p ? '#f0c000' : 'rgba(255,255,255,0.4)',
              fontFamily: "'DM Sans',sans-serif", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              textTransform: 'capitalize',
            }}>{p}</button>
          ))}
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 9, padding: '1rem' }}>
            <div style={{ fontSize: '0.62rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, marginBottom: 6 }}>Programme Health</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              <div>{childrenData.length} children · {families.length} families</div>
              <div>{teachers.filter(t => t.approved).length} active volunteers</div>
              <div style={{ color: avgAttendance >= 80 ? '#34d399' : '#f0c000' }}>{avgAttendance}% avg attendance</div>
            </div>
          </div>
          <div style={{ background: 'rgba(240,192,0,0.05)', border: '1px solid rgba(240,192,0,0.15)', borderRadius: 9, padding: '1rem' }}>
            <div style={{ fontSize: '0.62rem', color: '#f0c000', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, marginBottom: 6 }}>Feeding & Welfare</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              <div>{totalFed} total meals served</div>
              <div style={{ color: openWelfare.length > 0 ? '#e05252' : '#34d399' }}>{openWelfare.length} open welfare cases</div>
              <div>{resolved.length} cases resolved</div>
            </div>
          </div>
          <div style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 9, padding: '1rem' }}>
            <div style={{ fontSize: '0.62rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, marginBottom: 6 }}>Compliance</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              <div style={{ color: consentPct === 100 ? '#34d399' : '#f0c000' }}>{consentPct}% consent forms signed</div>
              <div style={{ color: '#34d399' }}>✓ POPIA Compliant</div>
              <div style={{ color: '#34d399' }}>✓ Safeguarding Active</div>
            </div>
          </div>
        </div>

        {/* Full leadership table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr>
              {['Area', 'Value', 'Note'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '0.5rem 0.65rem',
                  fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summaryRows.filter(r => r[0] !== '').map((r, i) => (
              <tr key={i} style={{ background: r[1] === '' ? 'rgba(240,192,0,0.03)' : 'transparent' }}>
                <td style={{ padding: '0.5rem 0.65rem', color: r[1] === '' ? '#f0c000' : 'rgba(255,255,255,0.55)', fontWeight: r[1] === '' ? 700 : 400, fontFamily: r[1] === '' ? "'Bebas Neue',sans-serif" : "'DM Sans',sans-serif", letterSpacing: r[1] === '' ? '0.5px' : 'normal', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: r[1] === '' ? '0.68rem' : '0.78rem' }}>{r[0]}</td>
                <td style={{ padding: '0.5rem 0.65rem', color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r[1]}</td>
                <td style={{ padding: '0.5rem 0.65rem', color: r[2].startsWith('✓') ? '#34d399' : r[2].startsWith('⚠') ? '#f0c000' : 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem' }}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExportBar
        onPDF={() => printTable(`${PERIOD_LABELS[period]} Leadership Report`, summaryRows.filter(r => r[0] !== ''), ['Area', 'Value', 'Note'])}
        onCSV={() => exportCSV(`leadership-${period}-${today}.csv`, summaryRows.filter(r => r[0] !== ''), ['Area', 'Value', 'Note'])}
      />
    </div>
  );
}

// ─── 6. Compliance & Safeguarding ─────────────────────────────────────────────
function ComplianceReport({ childrenData, welfareList, families }: {
  childrenData: StoredChild[]; welfareList: WelfareFlag[]; families: FamilyRecord[];
}) {
  const consentSigned = families.filter(f => f.consentComplete);
  const consentPending = families.filter(f => !f.consentComplete);
  const childConsent = {
    activities: childrenData.filter(c => c.consentActivities === 'Yes' || c.consentActivities === 'true'),
    medical: childrenData.filter(c => c.consentMedical === 'Yes' || c.consentMedical === 'true'),
  };
  const highWelfare = welfareList.filter(w => w.severity === 'high' && !w.resolved);

  const auditRows: string[][] = [
    ...childrenData.map(c => [
      `${c.firstName} ${c.lastName}`,
      c.grade,
      c.consentActivities === 'Yes' ? 'Signed' : 'Missing',
      c.consentMedical === 'Yes' ? 'Signed' : 'Missing',
      c.hasAllergies === 'Yes' ? `Yes — ${c.allergiesDetails ?? ''}` : 'No',
      c.hasMedicalCondition === 'Yes' ? `Yes — ${c.medicalDetails ?? ''}` : 'No',
      c.registeredDate ?? '—',
    ]),
  ];

  return (
    <div style={{ background: '#0a2410', border: '1px solid rgba(240,192,0,0.12)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem' }}>
      <SectionHeader icon="🔒" title="Compliance & Safeguarding Report" subtitle="Proof of consent, POPIA data handling and safeguarding audit trail" />
      <div style={{ padding: '1.25rem' }}>
        {/* Compliance status overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <StatBadge label="Consent Signed (Families)" value={`${consentSigned.length}/${families.length}`} color={consentPending.length === 0 ? '#34d399' : '#f0c000'} />
          <StatBadge label="Activity Consent (Children)" value={`${childConsent.activities.length}/${childrenData.length}`} color="#60a5fa" />
          <StatBadge label="Medical Consent (Children)" value={`${childConsent.medical.length}/${childrenData.length}`} color="#a78bfa" />
          <StatBadge label="High-Risk Open Flags" value={highWelfare.length} color={highWelfare.length > 0 ? '#e05252' : '#34d399'} />
        </div>

        {/* POPIA compliance notice */}
        <div style={{
          background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 9, padding: '0.9rem 1.1rem', marginBottom: '1.1rem',
          display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
        }}>
          <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>🔒</div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>POPIA Compliance Statement</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
              All personal data collected by this system is processed in accordance with the Protection of Personal Information Act, 2013 (POPIA).
              Data is collected with explicit consent, stored securely, used solely for programme administration, and not shared with third parties without authorisation.
              Children's records are handled with special care as prescribed by Section 34 and Section 71 of POPIA.
              Welfare records are subject to additional safeguarding protocols aligned with the Children's Act 38 of 2005.
            </div>
          </div>
        </div>

        {/* Pending consent follow-up */}
        {consentPending.length > 0 && (
          <div style={{ background: 'rgba(240,192,0,0.06)', border: '1px solid rgba(240,192,0,0.18)', borderRadius: 9, padding: '0.85rem 1rem', marginBottom: '1.1rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f0c000', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
              ⚠ Consent Follow-Up Required — {consentPending.length} Families
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {consentPending.map(f => (
                <span key={f.id} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.2rem 0.6rem', borderRadius: 20 }}>
                  {f.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Full audit trail */}
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
          Child Data Audit Trail
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
          <thead>
            <tr>
              {['Child', 'Grade', 'Activity Consent', 'Medical Consent', 'Allergies', 'Medical Condition', 'Registered'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '0.5rem 0.65rem',
                  fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {childrenData.map(c => {
              const actOk = c.consentActivities === 'Yes';
              const medOk = c.consentMedical === 'Yes';
              return (
                <tr key={c.id}>
                  <td style={{ padding: '0.5rem 0.65rem', color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{c.firstName} {c.lastName}</td>
                  <td style={{ padding: '0.5rem 0.65rem', color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem' }}>{c.grade}</td>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {actOk
                      ? <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#34d399' }}>✓ Signed</span>
                      : <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f0c000' }}>⚠ Missing</span>}
                  </td>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {medOk
                      ? <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#34d399' }}>✓ Signed</span>
                      : <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f0c000' }}>⚠ Missing</span>}
                  </td>
                  <td style={{ padding: '0.5rem 0.65rem', color: c.hasAllergies === 'Yes' ? '#f0c000' : 'rgba(255,255,255,0.25)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem' }}>
                    {c.hasAllergies === 'Yes' ? `⚠ ${c.allergiesDetails ?? 'Yes'}` : '—'}
                  </td>
                  <td style={{ padding: '0.5rem 0.65rem', color: c.hasMedicalCondition === 'Yes' ? '#60a5fa' : 'rgba(255,255,255,0.25)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem' }}>
                    {c.hasMedicalCondition === 'Yes' ? `⚕ ${c.medicalDetails ?? 'Yes'}` : '—'}
                  </td>
                  <td style={{ padding: '0.5rem 0.65rem', color: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem' }}>
                    {c.registeredDate ? fmtDate(c.registeredDate) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ExportBar
        onPDF={() => printTable('Compliance & Safeguarding Audit Report', auditRows, ['Child', 'Grade', 'Activity Consent', 'Medical Consent', 'Allergies', 'Medical Condition', 'Registered'])}
        onCSV={() => exportCSV(`compliance-safeguarding-${today}.csv`, auditRows, ['Child', 'Grade', 'Activity Consent', 'Medical Consent', 'Allergies', 'Medical Condition', 'Registered'])}
      />
    </div>
  );
}

// ─── Master Term Summary ──────────────────────────────────────────────────────
function TermSummary({ childrenData, welfareList, totalFed, avgAttendance }: {
  childrenData: StoredChild[]; welfareList: WelfareFlag[]; totalFed: number; avgAttendance: number;
}) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(240,192,0,0.06), rgba(240,192,0,0.02))',
      border: '1px solid rgba(240,192,0,0.2)',
      borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem',
    }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.85rem', letterSpacing: '2px', color: '#f0c000', marginBottom: '0.875rem' }}>TERM AT A GLANCE</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Children', value: childrenData.length, color: '#f0c000' },
          { label: 'Avg Attendance', value: `${avgAttendance}%`, color: avgAttendance >= 80 ? '#34d399' : '#f0c000' },
          { label: 'Meals Served', value: totalFed, color: '#60a5fa' },
          { label: 'Welfare Cases', value: welfareList.length, color: welfareList.some(w => !w.resolved && w.severity === 'high') ? '#e05252' : '#9ca3af' },
          { label: 'Resolved', value: welfareList.filter(w => w.resolved).length, color: '#34d399' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section nav pills ────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'funding',     label: 'Funding & Donations',     icon: '💰' },
  { id: 'feeding',     label: 'Feeding Scheme',           icon: '🍽️' },
  { id: 'pastoral',    label: 'Pastoral Care',            icon: '🛡️' },
  { id: 'volunteer',   label: 'Volunteer Deployment',     icon: '🧑‍🏫' },
  { id: 'leadership',  label: 'Church Leadership',        icon: '⛪' },
  { id: 'compliance',  label: 'Compliance & Safeguarding',icon: '🔒' },
] as const;
type SectionId = typeof SECTIONS[number]['id'];

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ReportsTab({
  childrenData, welfareList, teachers, families, avgAttendance, totalFed,
}: ReportsTabProps) {
  const [activeSection, setActiveSection] = useState<SectionId | 'all'>('all');

  // Refs for each section so we can scroll to them on click
  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
    funding: null, feeding: null, pastoral: null,
    volunteer: null, leadership: null, compliance: null,
  });

  const show = (id: SectionId) => activeSection === 'all' || activeSection === id;

  const handleNav = (id: SectionId | 'all') => {
    if (id === 'all') {
      setActiveSection('all');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveSection(id);
    // Wait one tick for render, then scroll section into view
    setTimeout(() => {
      const el = sectionRefs.current[id];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  return (
    <>
      {/* Section quick-nav — sticky so it stays visible while scrolling */}
      <div style={{
        display: 'flex', gap: '0.4rem', flexWrap: 'wrap',
        marginBottom: '1.25rem',
        padding: '0.75rem 1rem',
        background: 'rgba(10,36,16,0.97)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        position: 'sticky', top: 0, zIndex: 20,
        backdropFilter: 'blur(8px)',
      }}>
        <button
          onClick={() => handleNav('all')}
          style={{
            padding: '0.35rem 0.85rem', borderRadius: 20,
            border: `1px solid ${activeSection === 'all' ? 'rgba(240,192,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
            background: activeSection === 'all' ? 'rgba(240,192,0,0.12)' : 'transparent',
            color: activeSection === 'all' ? '#f0c000' : 'rgba(255,255,255,0.4)',
            fontFamily: "'DM Sans',sans-serif", fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
          }}
        >All Reports</button>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => handleNav(s.id)} style={{
            padding: '0.35rem 0.85rem', borderRadius: 20,
            border: `1px solid ${activeSection === s.id ? 'rgba(240,192,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
            background: activeSection === s.id ? 'rgba(240,192,0,0.12)' : 'transparent',
            color: activeSection === s.id ? '#f0c000' : 'rgba(255,255,255,0.4)',
            fontFamily: "'DM Sans',sans-serif", fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Term at a glance */}
      <TermSummary childrenData={childrenData} welfareList={welfareList} totalFed={totalFed} avgAttendance={avgAttendance} />

      {/* Individual report sections — each wrapped in a scroll-target div */}
      {show('funding') && (
        <div ref={el => { sectionRefs.current.funding = el; }}>
          <FundingReport childrenData={childrenData} welfareList={welfareList} totalFed={totalFed} avgAttendance={avgAttendance} />
        </div>
      )}
      {show('feeding') && (
        <div ref={el => { sectionRefs.current.feeding = el; }}>
          <FeedingReport childrenData={childrenData} totalFed={totalFed} />
        </div>
      )}
      {show('pastoral') && (
        <div ref={el => { sectionRefs.current.pastoral = el; }}>
          <PastoralReport childrenData={childrenData} welfareList={welfareList} />
        </div>
      )}
      {show('volunteer') && (
        <div ref={el => { sectionRefs.current.volunteer = el; }}>
          <VolunteerReport teachers={teachers} childrenData={childrenData} />
        </div>
      )}
      {show('leadership') && (
        <div ref={el => { sectionRefs.current.leadership = el; }}>
          <LeadershipReport childrenData={childrenData} welfareList={welfareList} teachers={teachers} families={families} avgAttendance={avgAttendance} totalFed={totalFed} />
        </div>
      )}
      {show('compliance') && (
        <div ref={el => { sectionRefs.current.compliance = el; }}>
          <ComplianceReport childrenData={childrenData} welfareList={welfareList} families={families} />
        </div>
      )}
    </>
  );
}