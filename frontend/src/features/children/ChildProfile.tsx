// src/features/children/ChildProfile.tsx
// Place this in: frontend/src/features/children/ChildProfile.tsx

import { useState } from "react";
import type { Child } from "./ChildList";

// ─── Mock attendance log ──────────────────────────────────────────────────────
const MOCK_ATTENDANCE = [
  { date: "2026-02-23", status: "present", fedToday: true },
  { date: "2026-02-16", status: "present", fedToday: true },
  { date: "2026-02-09", status: "absent",  fedToday: false },
  { date: "2026-02-02", status: "present", fedToday: false },
  { date: "2026-01-26", status: "present", fedToday: true },
  { date: "2026-01-19", status: "present", fedToday: true },
  { date: "2026-01-12", status: "late",    fedToday: true },
  { date: "2026-01-05", status: "absent",  fedToday: false },
];

// ─── Mock welfare flags ───────────────────────────────────────────────────────
const MOCK_WELFARE = [
  { date: "2026-01-29", title: "Home visit requested", note: "Family needs referral for support.", raisedBy: "Ms. Jane", resolved: false },
  { date: "2026-01-12", title: "Arrived without lunch", note: "Child mentioned no food at home this week.", raisedBy: "Mr. Sipho", resolved: true },
];

// ─── Default demo child (used when no child prop is passed) ──────────────────
const DEMO_CHILD: Child = {
  id: "2", firstName: "Sipho", lastName: "Nkosi", gender: "male",
  dateOfBirth: "2014-07-22", grade: "Grade 5", school: "Hillview Primary",
  address: "45 Church Rd, Benoni", hasAllergies: false, hasMedicalCondition: true,
  medicalDetails: "Asthma — has inhaler. Notify parent immediately if symptoms appear.",
  contactName: "Bongani Nkosi", contactNumber: "082 345 6789",
  relationship: "Father", consentActivities: true, consentMedical: true,
  registeredDate: "2025-01-20", attendanceRate: 78, welfareFlags: 1,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcAge = (dob: string) => {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const initials = (first: string, last: string) =>
  `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

// ─── Props ────────────────────────────────────────────────────────────────────
interface ChildProfileProps {
  child?: Child;
  onBack?: () => void;
  onEdit?: (child: Child) => void;
}

export default function ChildProfile({ child = DEMO_CHILD, onBack, onEdit }: ChildProfileProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "welfare">("overview");

  const age = calcAge(child.dateOfBirth);
  const attColor = child.attendanceRate >= 80 ? "#34d399" : child.attendanceRate >= 60 ? "#fbbf24" : "#f87171";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cp-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #0a2e12;
          padding: 2rem 1.5rem;
          color: #fff;
        }

        /* ── Back bar ── */
        .cp-back {
          display: flex; align-items: center; gap: 0.6rem;
          background: none; border: none; color: rgba(255,255,255,0.45);
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          font-weight: 600; cursor: pointer; margin-bottom: 1.5rem;
          transition: color 0.15s; padding: 0;
        }
        .cp-back:hover { color: #f0c000; }

        /* ── Hero card ── */
        .cp-hero {
          background: #0f3d1a;
          border: 1px solid rgba(240,192,0,0.15);
          border-radius: 14px; overflow: hidden;
          margin-bottom: 1.25rem;
        }

        .cp-hero-banner {
          height: 72px;
          background: linear-gradient(135deg, #0d3318 0%, #1a4d25 50%, #0d3318 100%);
          position: relative;
        }

        .cp-hero-banner::after {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            45deg, transparent, transparent 20px,
            rgba(240,192,0,0.03) 20px, rgba(240,192,0,0.03) 40px
          );
        }

        .cp-hero-body {
          padding: 0 1.5rem 1.5rem;
          display: flex; align-items: flex-end; gap: 1.25rem;
          flex-wrap: wrap;
        }

        .cp-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          background: #2d6a4f;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.6rem; color: #fff;
          border: 3px solid #0f3d1a;
          margin-top: -36px; flex-shrink: 0;
          position: relative; z-index: 1;
        }

        .cp-identity { flex: 1; padding-top: 0.6rem; }

        .cp-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem; letter-spacing: 1.5px; color: #fff; line-height: 1;
        }

        .cp-meta { color: rgba(255,255,255,0.45); font-size: 0.82rem; margin-top: 0.3rem; }

        .cp-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }

        .tag {
          padding: 0.2rem 0.65rem; border-radius: 20px;
          font-size: 0.72rem; font-weight: 700;
        }

        .tag-grade { background: rgba(240,192,0,0.12); color: #f0c000; border: 1px solid rgba(240,192,0,0.25); }
        .tag-male { background: rgba(59,130,246,0.12); color: #60a5fa; }
        .tag-female { background: rgba(244,114,182,0.12); color: #f472b4; }
        .tag-other { background: rgba(167,139,250,0.12); color: #a78bfa; }
        .tag-allergy { background: rgba(251,191,36,0.12); color: #fbbf24; }
        .tag-medical { background: rgba(251,191,36,0.12); color: #fbbf24; }
        .tag-welfare { background: rgba(239,68,68,0.12); color: #f87171; }
        .tag-consent { background: rgba(52,211,153,0.1); color: #34d399; }
        .tag-noconsent { background: rgba(239,68,68,0.1); color: #f87171; }

        /* ── Hero actions ── */
        .cp-actions { display: flex; gap: 0.6rem; align-items: flex-start; padding-top: 0.6rem; }

        .btn-gold {
          background: #f0c000; color: #0a2e12;
          border: none; padding: 0.6rem 1.25rem;
          border-radius: 7px; font-size: 0.82rem; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .btn-gold:hover { background: #ffd200; transform: translateY(-1px); box-shadow: 0 5px 14px rgba(240,192,0,0.35); }

        .btn-outline {
          background: transparent; color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 0.6rem 1.1rem; border-radius: 7px;
          font-size: 0.82rem; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .btn-outline:hover { border-color: rgba(255,255,255,0.35); color: #fff; }

        /* ── Tabs ── */
        .cp-tabs {
          display: flex; gap: 0;
          background: #0f3d1a;
          border: 1px solid rgba(240,192,0,0.12);
          border-radius: 10px; overflow: hidden;
          margin-bottom: 1.25rem;
        }

        .cp-tab {
          flex: 1; padding: 0.7rem 1rem;
          background: none; border: none; color: rgba(255,255,255,0.4);
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          border-right: 1px solid rgba(255,255,255,0.06);
        }

        .cp-tab:last-child { border-right: none; }

        .cp-tab:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.03); }

        .cp-tab.active {
          background: rgba(240,192,0,0.1);
          color: #f0c000;
          border-bottom: 2px solid #f0c000;
        }

        /* ── Cards ── */
        .cp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .cp-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }

        .info-card {
          background: #0f3d1a;
          border: 1px solid rgba(240,192,0,0.1);
          border-radius: 12px; padding: 1.25rem;
        }

        .info-card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1rem; letter-spacing: 1.5px;
          color: #f0c000; margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(240,192,0,0.12);
        }

        .info-row {
          display: flex; justify-content: space-between;
          align-items: flex-start; gap: 0.5rem;
          margin-bottom: 0.7rem;
        }

        .info-row:last-child { margin-bottom: 0; }

        .info-key {
          font-size: 0.75rem; color: rgba(255,255,255,0.4);
          font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.4px; flex-shrink: 0;
        }

        .info-val {
          font-size: 0.875rem; color: rgba(255,255,255,0.85);
          font-weight: 500; text-align: right;
        }

        /* ── Stat mini ── */
        .stat-mini {
          background: #0f3d1a;
          border: 1px solid rgba(240,192,0,0.1);
          border-radius: 10px; padding: 1rem;
          text-align: center;
        }

        .stat-mini-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.75rem; letter-spacing: 1px; line-height: 1;
        }

        .stat-mini-lbl {
          font-size: 0.68rem; color: rgba(255,255,255,0.4);
          font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.5px; margin-top: 0.25rem;
        }

        /* ── Attendance log ── */
        .att-log { display: flex; flex-direction: column; gap: 0.5rem; }

        .att-row {
          display: flex; align-items: center; gap: 1rem;
          background: rgba(0,0,0,0.15);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px; padding: 0.7rem 1rem;
          animation: rowIn 0.3s ease both;
        }

        @keyframes rowIn {
          from { opacity: 0; transform: translateX(-6px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .att-dot {
          width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
        }

        .att-date { font-size: 0.82rem; color: rgba(255,255,255,0.5); flex: 1; }
        .att-status { font-size: 0.8rem; font-weight: 700; }

        .att-present { color: #34d399; }
        .att-absent { color: #f87171; }
        .att-late { color: #fbbf24; }

        .fed-badge {
          font-size: 0.7rem; font-weight: 700;
          padding: 0.15rem 0.5rem; border-radius: 10px;
          background: rgba(52,211,153,0.1); color: #34d399;
        }

        .not-fed {
          background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.25);
        }

        /* ── Welfare cards ── */
        .welfare-card {
          background: rgba(0,0,0,0.15);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 10px; padding: 1rem 1.1rem;
          margin-bottom: 0.75rem;
          animation: rowIn 0.3s ease both;
        }

        .welfare-card.resolved { border-color: rgba(255,255,255,0.06); opacity: 0.6; }

        .welfare-header {
          display: flex; justify-content: space-between;
          align-items: flex-start; margin-bottom: 0.5rem;
        }

        .welfare-title { font-weight: 700; color: #fff; font-size: 0.9rem; }
        .welfare-date { font-size: 0.75rem; color: rgba(255,255,255,0.35); margin-top: 0.15rem; }
        .welfare-note { font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 0.6rem; }
        .welfare-by { font-size: 0.75rem; color: rgba(255,255,255,0.35); }

        .resolved-badge {
          font-size: 0.7rem; font-weight: 700;
          padding: 0.2rem 0.6rem; border-radius: 10px;
          background: rgba(52,211,153,0.1); color: #34d399;
          flex-shrink: 0;
        }

        .open-badge {
          font-size: 0.7rem; font-weight: 700;
          padding: 0.2rem 0.6rem; border-radius: 10px;
          background: rgba(239,68,68,0.12); color: #f87171;
          flex-shrink: 0;
        }

        /* ── Warning box ── */
        .warn-box {
          background: rgba(251,191,36,0.07);
          border: 1px solid rgba(251,191,36,0.2);
          border-radius: 9px; padding: 0.85rem 1rem;
          font-size: 0.82rem; color: rgba(255,255,255,0.65);
          display: flex; gap: 0.7rem; align-items: flex-start;
          margin-bottom: 1rem;
        }

        /* ── Consent row ── */
        .consent-row {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 0.6rem;
        }

        .consent-icon {
          width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 900; flex-shrink: 0;
        }

        .consent-yes { background: rgba(52,211,153,0.15); color: #34d399; }
        .consent-no  { background: rgba(239,68,68,0.15); color: #f87171; }

        .consent-text { font-size: 0.85rem; color: rgba(255,255,255,0.7); }

        /* ── Att progress circle ── */
        .att-circle {
          width: 80px; height: 80px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column;
          position: relative;
        }

        @media (max-width: 640px) {
          .cp-grid-2, .cp-grid-3 { grid-template-columns: 1fr; }
          .cp-hero-body { flex-direction: column; align-items: flex-start; }
          .cp-actions { width: 100%; }
        }
      `}</style>

      <div className="cp-page">

        {/* ── Back button ──────────────────────────────────────── */}
        <button className="cp-back" onClick={onBack}>
          ← Back to Children
        </button>

        {/* ── Hero Card ────────────────────────────────────────── */}
        <div className="cp-hero">
          <div className="cp-hero-banner" />
          <div className="cp-hero-body">
            <div className="cp-avatar">
              {initials(child.firstName, child.lastName)}
            </div>
            <div className="cp-identity">
              <div className="cp-name">{child.firstName} {child.lastName}</div>
              <div className="cp-meta">
                Age {age} · DOB {fmtDate(child.dateOfBirth)} · {child.school}
              </div>
              <div className="cp-tags">
                <span className="tag tag-grade">{child.grade}</span>
                <span className={`tag tag-${child.gender}`}>{child.gender}</span>
                {child.hasAllergies && <span className="tag tag-allergy">⚠ Allergy</span>}
                {child.hasMedicalCondition && <span className="tag tag-medical">⚕ Medical</span>}
                {child.welfareFlags > 0 && (
                  <span className="tag tag-welfare">🚩 {child.welfareFlags} welfare flag{child.welfareFlags > 1 ? "s" : ""}</span>
                )}
              </div>
            </div>
            <div className="cp-actions">
              <button className="btn-gold" onClick={() => onEdit?.(child)}>Edit Profile</button>
              <button className="btn-outline">Flag Welfare</button>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <div className="cp-tabs">
          {(["overview", "attendance", "welfare"] as const).map((tab) => (
            <button
              key={tab}
              className={`cp-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "overview" ? "📋 Overview" : tab === "attendance" ? "📅 Attendance" : "🚩 Welfare"}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW ═══════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div style={{ animation: "rowIn 0.25s ease" }}>

            {/* Quick stats */}
            <div className="cp-grid-3">
              <div className="stat-mini">
                <div className="stat-mini-val" style={{ color: attColor }}>{child.attendanceRate}%</div>
                <div className="stat-mini-lbl">Attendance Rate</div>
              </div>
              <div className="stat-mini">
                <div className="stat-mini-val" style={{ color: child.welfareFlags > 0 ? "#f87171" : "#34d399" }}>
                  {child.welfareFlags}
                </div>
                <div className="stat-mini-lbl">Welfare Flags</div>
              </div>
              <div className="stat-mini">
                <div className="stat-mini-val" style={{ color: "#f0c000" }}>
                  {fmtDate(child.registeredDate).split(" ")[2]}
                </div>
                <div className="stat-mini-lbl">Year Registered</div>
              </div>
            </div>

            {/* Personal + Contact */}
            <div className="cp-grid-2">
              <div className="info-card">
                <div className="info-card-title">Personal Details</div>
                <div className="info-row">
                  <span className="info-key">Full Name</span>
                  <span className="info-val">{child.firstName} {child.lastName}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Date of Birth</span>
                  <span className="info-val">{fmtDate(child.dateOfBirth)}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Age</span>
                  <span className="info-val">{age} years old</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Gender</span>
                  <span className="info-val" style={{ textTransform: "capitalize" }}>{child.gender}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Grade</span>
                  <span className="info-val">{child.grade}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">School</span>
                  <span className="info-val">{child.school || "—"}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Address</span>
                  <span className="info-val" style={{ maxWidth: "55%", textAlign: "right" }}>{child.address}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Registered</span>
                  <span className="info-val">{fmtDate(child.registeredDate)}</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-title">Emergency Contact</div>
                <div className="info-row">
                  <span className="info-key">Name</span>
                  <span className="info-val">{child.contactName}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Relationship</span>
                  <span className="info-val">{child.relationship}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Phone</span>
                  <span className="info-val" style={{ color: "#f0c000" }}>{child.contactNumber}</span>
                </div>

                <div style={{ marginTop: "1.25rem" }}>
                  <div className="info-card-title" style={{ marginBottom: "0.75rem" }}>Parental Consent</div>
                  <div className="consent-row">
                    <div className={`consent-icon ${child.consentActivities ? "consent-yes" : "consent-no"}`}>
                      {child.consentActivities ? "✓" : "✗"}
                    </div>
                    <span className="consent-text">Consent to participate in activities</span>
                  </div>
                  <div className="consent-row">
                    <div className={`consent-icon ${child.consentMedical ? "consent-yes" : "consent-no"}`}>
                      {child.consentMedical ? "✓" : "✗"}
                    </div>
                    <span className="consent-text">Consent for emergency medical treatment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical */}
            {(child.hasAllergies || child.hasMedicalCondition) && (
              <div className="info-card" style={{ marginBottom: "1rem" }}>
                <div className="info-card-title">Medical Information</div>
                {child.hasAllergies && (
                  <div style={{ marginBottom: "0.85rem" }}>
                    <div className="warn-box" style={{ marginBottom: 0 }}>
                      <span>⚠️</span>
                      <div>
                        <strong style={{ color: "#fbbf24" }}>Allergies: </strong>
                        <span>{child.allergiesDetails}</span>
                      </div>
                    </div>
                  </div>
                )}
                {child.hasMedicalCondition && (
                  <div className="warn-box" style={{ marginBottom: 0 }}>
                    <span>⚕️</span>
                    <div>
                      <strong style={{ color: "#fbbf24" }}>Medical Condition: </strong>
                      <span>{child.medicalDetails}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ ATTENDANCE ════════════════════════════════════════ */}
        {activeTab === "attendance" && (
          <div style={{ animation: "rowIn 0.25s ease" }}>
            <div className="cp-grid-3" style={{ marginBottom: "1.25rem" }}>
              <div className="stat-mini">
                <div className="stat-mini-val" style={{ color: attColor }}>{child.attendanceRate}%</div>
                <div className="stat-mini-lbl">Overall Rate</div>
              </div>
              <div className="stat-mini">
                <div className="stat-mini-val" style={{ color: "#34d399" }}>
                  {MOCK_ATTENDANCE.filter(a => a.status === "present").length}
                </div>
                <div className="stat-mini-lbl">Present</div>
              </div>
              <div className="stat-mini">
                <div className="stat-mini-val" style={{ color: "#f87171" }}>
                  {MOCK_ATTENDANCE.filter(a => a.status === "absent").length}
                </div>
                <div className="stat-mini-lbl">Absent</div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-title">Attendance Log</div>
              <div className="att-log">
                {MOCK_ATTENDANCE.map((entry, idx) => (
                  <div key={entry.date} className="att-row" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div
                      className="att-dot"
                      style={{
                        background: entry.status === "present" ? "#34d399"
                          : entry.status === "absent" ? "#f87171" : "#fbbf24"
                      }}
                    />
                    <span className="att-date">{fmtDate(entry.date)}</span>
                    <span className={`att-status att-${entry.status}`} style={{ textTransform: "capitalize" }}>
                      {entry.status}
                    </span>
                    <span className={`fed-badge${!entry.fedToday ? " not-fed" : ""}`}>
                      {entry.fedToday ? "🍽 Fed" : "— Not fed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ WELFARE ══════════════════════════════════════════ */}
        {activeTab === "welfare" && (
          <div style={{ animation: "rowIn 0.25s ease" }}>

            {MOCK_WELFARE.length === 0 ? (
              <div className="info-card" style={{ textAlign: "center", padding: "2.5rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>✅</div>
                <div style={{ color: "#34d399", fontWeight: 600 }}>No welfare concerns on record.</div>
              </div>
            ) : (
              <>
                {MOCK_WELFARE.filter(w => !w.resolved).length > 0 && (
                  <div className="warn-box">
                    <span>🚩</span>
                    <span>
                      This child has <strong style={{ color: "#fbbf24" }}>
                        {MOCK_WELFARE.filter(w => !w.resolved).length} open
                      </strong> welfare concern{MOCK_WELFARE.filter(w => !w.resolved).length > 1 ? "s" : ""} that require follow-up.
                    </span>
                  </div>
                )}

                <div className="info-card">
                  <div className="info-card-title">Welfare Flags</div>
                  {MOCK_WELFARE.map((item, idx) => (
                    <div
                      key={idx}
                      className={`welfare-card${item.resolved ? " resolved" : ""}`}
                      style={{ animationDelay: `${idx * 0.08}s` }}
                    >
                      <div className="welfare-header">
                        <div>
                          <div className="welfare-title">{item.title}</div>
                          <div className="welfare-date">{fmtDate(item.date)}</div>
                        </div>
                        {item.resolved
                          ? <span className="resolved-badge">✓ Resolved</span>
                          : <span className="open-badge">● Open</span>
                        }
                      </div>
                      <div className="welfare-note">{item.note}</div>
                      <div className="welfare-by">Raised by: <strong style={{ color: "rgba(255,255,255,0.55)" }}>{item.raisedBy}</strong></div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ marginTop: "1rem" }}>
              <button className="btn-outline" style={{ width: "100%", padding: "0.75rem" }}>
                + Raise New Welfare Concern
              </button>
            </div>
          </div>
        )}

        {/* ── POPIA Footer ──────────────────────────────────────── */}
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>
          POPIA: Handle data lawfully &amp; securely. · Sunday School Management Portal
        </p>
      </div>
    </>
  );
}