// src/features/children/ChildList.tsx
// Place this in: frontend/src/features/children/ChildList.tsx

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Child = {
  id: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  grade: string;
  school: string;
  address: string;
  hasAllergies: boolean;
  allergiesDetails?: string;
  hasMedicalCondition: boolean;
  medicalDetails?: string;
  contactName: string;
  contactNumber: string;
  relationship: string;
  consentActivities: boolean;
  consentMedical: boolean;
  registeredDate: string;
  attendanceRate: number; // percentage 0-100
  welfareFlags: number;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CHILDREN: Child[] = [
  {
    id: "1", firstName: "Amara", lastName: "Dlamini", gender: "female",
    dateOfBirth: "2016-03-14", grade: "Grade 3", school: "Sunflower Primary",
    address: "12 Main St, Soweto", hasAllergies: true, allergiesDetails: "Peanuts",
    hasMedicalCondition: false, contactName: "Nomsa Dlamini", contactNumber: "071 234 5678",
    relationship: "Mother", consentActivities: true, consentMedical: true,
    registeredDate: "2025-01-15", attendanceRate: 92, welfareFlags: 0,
  },
  {
    id: "2", firstName: "Sipho", lastName: "Nkosi", gender: "male",
    dateOfBirth: "2014-07-22", grade: "Grade 5", school: "Hillview Primary",
    address: "45 Church Rd, Benoni", hasAllergies: false, hasMedicalCondition: true,
    medicalDetails: "Asthma", contactName: "Bongani Nkosi", contactNumber: "082 345 6789",
    relationship: "Father", consentActivities: true, consentMedical: true,
    registeredDate: "2025-01-20", attendanceRate: 78, welfareFlags: 1,
  },
  {
    id: "3", firstName: "Lerato", lastName: "Molefe", gender: "female",
    dateOfBirth: "2018-11-05", grade: "Grade 1", school: "Grace Academy",
    address: "8 Elm Ave, Johannesburg", hasAllergies: false, hasMedicalCondition: false,
    contactName: "Thandi Molefe", contactNumber: "063 456 7890",
    relationship: "Mother", consentActivities: true, consentMedical: false,
    registeredDate: "2025-02-01", attendanceRate: 100, welfareFlags: 0,
  },
  {
    id: "4", firstName: "Kabo", lastName: "Sithole", gender: "male",
    dateOfBirth: "2015-05-18", grade: "Grade 4", school: "St Joseph's",
    address: "22 Oak Rd, Pretoria", hasAllergies: true, allergiesDetails: "Bee stings, latex",
    hasMedicalCondition: true, medicalDetails: "Epilepsy",
    contactName: "Mary Sithole", contactNumber: "079 567 8901",
    relationship: "Grandparent", consentActivities: true, consentMedical: true,
    registeredDate: "2025-02-10", attendanceRate: 65, welfareFlags: 2,
  },
  {
    id: "5", firstName: "Zanele", lastName: "Khumalo", gender: "female",
    dateOfBirth: "2017-09-30", grade: "Grade 2", school: "Sunrise Primary",
    address: "3 Pine St, Ekurhuleni", hasAllergies: false, hasMedicalCondition: false,
    contactName: "Joyce Khumalo", contactNumber: "060 678 9012",
    relationship: "Aunt", consentActivities: true, consentMedical: true,
    registeredDate: "2025-02-14", attendanceRate: 88, welfareFlags: 0,
  },
  {
    id: "6", firstName: "Thabo", lastName: "Mokoena", gender: "male",
    dateOfBirth: "2013-12-01", grade: "Grade 6", school: "New Life Primary",
    address: "67 River Rd, Springs", hasAllergies: false, hasMedicalCondition: false,
    contactName: "Peter Mokoena", contactNumber: "072 789 0123",
    relationship: "Father", consentActivities: true, consentMedical: true,
    registeredDate: "2025-03-01", attendanceRate: 55, welfareFlags: 1,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface ChildListProps {
  onViewProfile?: (child: Child) => void;
  onRegisterNew?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcAge = (dob: string) => {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const initials = (first: string, last: string) =>
  `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();

const avatarColor = (id: string) => {
  const colors = ["#2d6a4f", "#1b4332", "#40916c", "#52b788", "#1e6091", "#184e77"];
  return colors[parseInt(id, 10) % colors.length];
};

export default function ChildList({ onViewProfile, onRegisterNew }: ChildListProps) {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [welfareFilter, setWelfareFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "grade" | "attendance" | "registered">("name");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = MOCK_CHILDREN
    .filter((c) => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      if (search && !fullName.includes(search.toLowerCase()) &&
          !c.grade.toLowerCase().includes(search.toLowerCase()) &&
          !c.school.toLowerCase().includes(search.toLowerCase())) return false;
      if (genderFilter !== "all" && c.gender !== genderFilter) return false;
      if (welfareFilter === "flagged" && c.welfareFlags === 0) return false;
      if (welfareFilter === "clean" && c.welfareFlags > 0) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return `${a.firstName}${a.lastName}`.localeCompare(`${b.firstName}${b.lastName}`);
      if (sortBy === "grade") return a.grade.localeCompare(b.grade);
      if (sortBy === "attendance") return b.attendanceRate - a.attendanceRate;
      return new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime();
    });

  const totalFlagged = MOCK_CHILDREN.filter((c) => c.welfareFlags > 0).length;
  const avgAttendance = Math.round(MOCK_CHILDREN.reduce((s, c) => s + c.attendanceRate, 0) / MOCK_CHILDREN.length);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cl-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #0a2e12;
          padding: 2rem 1.5rem;
          color: #fff;
        }

        /* ── Header ── */
        .cl-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; flex-wrap: wrap; gap: 1rem;
          margin-bottom: 1.75rem;
        }

        .cl-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem; letter-spacing: 2px; color: #fff; line-height: 1;
        }

        .cl-subtitle { color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-top: 0.3rem; }

        .btn-gold {
          background: #f0c000; color: #0a2e12;
          border: none; padding: 0.65rem 1.4rem;
          border-radius: 7px; font-size: 0.85rem; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; white-space: nowrap;
        }
        .btn-gold:hover { background: #ffd200; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(240,192,0,0.35); }

        /* ── Stats row ── */
        .cl-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1rem; margin-bottom: 1.5rem;
        }

        .stat-card {
          background: #0f3d1a;
          border: 1px solid rgba(240,192,0,0.12);
          border-radius: 10px; padding: 1rem 1.25rem;
          transition: border-color 0.2s;
        }

        .stat-card:hover { border-color: rgba(240,192,0,0.3); }

        .stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem; letter-spacing: 1px;
          color: #f0c000; line-height: 1;
        }

        .stat-label { font-size: 0.72rem; color: rgba(255,255,255,0.45); font-weight: 600; margin-top: 0.3rem; text-transform: uppercase; letter-spacing: 0.5px; }

        /* ── Toolbar ── */
        .cl-toolbar {
          display: flex; gap: 0.75rem; flex-wrap: wrap;
          align-items: center; margin-bottom: 1.25rem;
        }

        .cl-search {
          flex: 1; min-width: 200px;
          background: #0f3d1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 0.6rem 0.9rem 0.6rem 2.5rem;
          color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
          outline: none; transition: border-color 0.2s;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: 0.75rem center;
        }

        .cl-search:focus { border-color: #f0c000; box-shadow: 0 0 0 3px rgba(240,192,0,0.1); }
        .cl-search::placeholder { color: rgba(255,255,255,0.25); }

        .cl-select {
          background: #0f3d1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 0.6rem 0.85rem;
          color: rgba(255,255,255,0.7); font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem; outline: none; cursor: pointer;
          transition: border-color 0.2s;
        }

        .cl-select:focus { border-color: #f0c000; }
        .cl-select option { background: #0f3d1a; color: #fff; }

        /* ── Table ── */
        .cl-table-wrap {
          background: #0f3d1a;
          border: 1px solid rgba(240,192,0,0.1);
          border-radius: 12px; overflow: hidden;
        }

        .cl-table { width: 100%; border-collapse: collapse; }

        .cl-table thead tr {
          background: rgba(0,0,0,0.25);
          border-bottom: 1px solid rgba(240,192,0,0.15);
        }

        .cl-table th {
          padding: 0.85rem 1rem;
          text-align: left; font-size: 0.7rem; font-weight: 700;
          color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.8px;
          white-space: nowrap;
        }

        .th-sort {
          cursor: pointer; user-select: none;
          transition: color 0.15s;
        }

        .th-sort:hover, .th-sort.active { color: #f0c000; }

        .cl-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
          cursor: pointer;
          animation: rowIn 0.3s ease both;
        }

        .cl-table tbody tr:last-child { border-bottom: none; }
        .cl-table tbody tr:hover { background: rgba(240,192,0,0.05); }
        .cl-table tbody tr.selected { background: rgba(240,192,0,0.08); }

        .cl-table td { padding: 0.85rem 1rem; font-size: 0.875rem; vertical-align: middle; }

        @keyframes rowIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Avatar ── */
        .avatar {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
          color: #fff;
        }

        .child-name { font-weight: 600; color: #fff; }
        .child-meta { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 0.1rem; }

        /* ── Attendance bar ── */
        .att-bar-bg {
          height: 6px; border-radius: 3px;
          background: rgba(255,255,255,0.08);
          width: 80px; overflow: hidden;
        }

        .att-bar-fill {
          height: 100%; border-radius: 3px;
          transition: width 0.5s ease;
        }

        .att-text { font-size: 0.8rem; font-weight: 600; margin-bottom: 3px; }

        /* ── Badges ── */
        .badge {
          display: inline-flex; align-items: center; gap: 0.3rem;
          padding: 0.2rem 0.55rem; border-radius: 20px;
          font-size: 0.72rem; font-weight: 700;
        }

        .badge-male { background: rgba(59,130,246,0.15); color: #60a5fa; }
        .badge-female { background: rgba(244,114,182,0.15); color: #f472b4; }
        .badge-other { background: rgba(167,139,250,0.15); color: #a78bfa; }

        .badge-welfare {
          background: rgba(239,68,68,0.15); color: #f87171;
        }

        .badge-ok { background: rgba(52,211,153,0.12); color: #34d399; }

        .badge-medical { background: rgba(251,191,36,0.12); color: #fbbf24; }

        /* ── Grade tag ── */
        .grade-tag {
          background: rgba(240,192,0,0.1);
          color: rgba(240,192,0,0.8);
          border: 1px solid rgba(240,192,0,0.2);
          padding: 0.2rem 0.55rem; border-radius: 5px;
          font-size: 0.75rem; font-weight: 600; white-space: nowrap;
        }

        /* ── Action btn ── */
        .view-btn {
          background: transparent;
          border: 1px solid rgba(240,192,0,0.25);
          color: #f0c000; padding: 0.35rem 0.9rem;
          border-radius: 6px; font-size: 0.78rem; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.15s; white-space: nowrap;
        }

        .view-btn:hover { background: rgba(240,192,0,0.1); border-color: #f0c000; }

        /* ── Empty state ── */
        .cl-empty {
          text-align: center; padding: 3rem;
          color: rgba(255,255,255,0.3); font-size: 0.9rem;
        }

        .cl-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }

        /* ── Result count ── */
        .result-count {
          font-size: 0.78rem; color: rgba(255,255,255,0.3);
          margin-bottom: 0.75rem; font-weight: 500;
        }

        .result-count span { color: #f0c000; font-weight: 700; }

        @media (max-width: 768px) {
          .cl-stats { grid-template-columns: repeat(2,1fr); }
          .cl-table th:nth-child(4),
          .cl-table td:nth-child(4),
          .cl-table th:nth-child(5),
          .cl-table td:nth-child(5) { display: none; }
        }

        @media (max-width: 520px) {
          .cl-stats { grid-template-columns: repeat(2,1fr); }
          .cl-page { padding: 1rem; }
        }
      `}</style>

      <div className="cl-page">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="cl-header">
          <div>
            <div className="cl-title">Children</div>
            <div className="cl-subtitle">Manage registered learners and their profiles</div>
          </div>
          <button className="btn-gold" onClick={onRegisterNew}>+ Register New Child</button>
        </div>

        {/* ── Stats ─────────────────────────────────────────────── */}
        <div className="cl-stats">
          <div className="stat-card">
            <div className="stat-value">{MOCK_CHILDREN.length}</div>
            <div className="stat-label">Total Registered</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{avgAttendance}%</div>
            <div className="stat-label">Avg Attendance</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: totalFlagged > 0 ? "#f87171" : "#34d399" }}>
              {totalFlagged}
            </div>
            <div className="stat-label">Welfare Flags</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {MOCK_CHILDREN.filter(c => c.hasAllergies || c.hasMedicalCondition).length}
            </div>
            <div className="stat-label">Medical Notes</div>
          </div>
        </div>

        {/* ── Toolbar ───────────────────────────────────────────── */}
        <div className="cl-toolbar">
          <input
            className="cl-search"
            type="text"
            placeholder="Search by name, grade or school…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="cl-select" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <select className="cl-select" value={welfareFilter} onChange={(e) => setWelfareFilter(e.target.value)}>
            <option value="all">All Welfare</option>
            <option value="flagged">Flagged</option>
            <option value="clean">No Flags</option>
          </select>
          <select className="cl-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
            <option value="name">Sort: Name</option>
            <option value="grade">Sort: Grade</option>
            <option value="attendance">Sort: Attendance</option>
            <option value="registered">Sort: Registered</option>
          </select>
        </div>

        {/* ── Result count ──────────────────────────────────────── */}
        <p className="result-count">
          Showing <span>{filtered.length}</span> of {MOCK_CHILDREN.length} children
        </p>

        {/* ── Table ─────────────────────────────────────────────── */}
        <div className="cl-table-wrap">
          <table className="cl-table">
            <thead>
              <tr>
                <th>Child</th>
                <th>Gender</th>
                <th
                  className={`th-sort${sortBy === "grade" ? " active" : ""}`}
                  onClick={() => setSortBy("grade")}
                >
                  Grade {sortBy === "grade" ? "↑" : ""}
                </th>
                <th>Medical</th>
                <th
                  className={`th-sort${sortBy === "attendance" ? " active" : ""}`}
                  onClick={() => setSortBy("attendance")}
                >
                  Attendance {sortBy === "attendance" ? "↓" : ""}
                </th>
                <th>Welfare</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="cl-empty">
                      <div className="cl-empty-icon">🔍</div>
                      No children match your filters.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((child, idx) => {
                  const age = calcAge(child.dateOfBirth);
                  const attColor = child.attendanceRate >= 80
                    ? "#34d399"
                    : child.attendanceRate >= 60
                    ? "#fbbf24"
                    : "#f87171";

                  return (
                    <tr
                      key={child.id}
                      className={selectedId === child.id ? "selected" : ""}
                      onClick={() => setSelectedId(child.id)}
                      style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                      {/* Child */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div className="avatar" style={{ background: avatarColor(child.id) }}>
                            {initials(child.firstName, child.lastName)}
                          </div>
                          <div>
                            <div className="child-name">{child.firstName} {child.lastName}</div>
                            <div className="child-meta">Age {age} · {child.school}</div>
                          </div>
                        </div>
                      </td>

                      {/* Gender */}
                      <td>
                        <span className={`badge badge-${child.gender}`}>
                          {child.gender === "male" ? "♂" : child.gender === "female" ? "♀" : "⚥"} {child.gender}
                        </span>
                      </td>

                      {/* Grade */}
                      <td><span className="grade-tag">{child.grade}</span></td>

                      {/* Medical */}
                      <td>
                        {child.hasAllergies || child.hasMedicalCondition ? (
                          <span className="badge badge-medical">
                            ⚠ {[child.hasAllergies && "Allergy", child.hasMedicalCondition && "Medical"].filter(Boolean).join(", ")}
                          </span>
                        ) : (
                          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem" }}>—</span>
                        )}
                      </td>

                      {/* Attendance */}
                      <td>
                        <div className="att-text" style={{ color: attColor }}>
                          {child.attendanceRate}%
                        </div>
                        <div className="att-bar-bg">
                          <div
                            className="att-bar-fill"
                            style={{ width: `${child.attendanceRate}%`, background: attColor }}
                          />
                        </div>
                      </td>

                      {/* Welfare */}
                      <td>
                        {child.welfareFlags > 0 ? (
                          <span className="badge badge-welfare">🚩 {child.welfareFlags} flag{child.welfareFlags > 1 ? "s" : ""}</span>
                        ) : (
                          <span className="badge badge-ok">✓ Clear</span>
                        )}
                      </td>

                      {/* Action */}
                      <td>
                        <button
                          className="view-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProfile?.(child);
                          }}
                        >
                          View Profile →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── POPIA Footer ──────────────────────────────────────── */}
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>
          POPIA: Handle data lawfully &amp; securely. · Sunday School Management Portal
        </p>
      </div>
    </>
  );
}