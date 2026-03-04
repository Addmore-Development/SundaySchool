// src/components/auth/RegisterModal.tsx
// Place this in: frontend/src/components/auth/RegisterModal.tsx

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "parent" | "teacher" | "admin";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: (role: Role) => void;
}

// ─── Role Config ──────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: "parent" as Role,
    icon: "👨‍👩‍👧",
    label: "Parent / Caregiver",
    tagline: "Register and manage your children",
    color: "#34d399",
    colorBg: "rgba(52,211,153,0.08)",
    colorBorder: "rgba(52,211,153,0.25)",
    colorBorderActive: "#34d399",
    permissions: [
      "Register and manage your children's profiles",
      "View attendance history",
      "Update medical information",
      "Provide digital consent",
      "Receive SMS / WhatsApp notifications",
    ],
    cannot: [
      "View other families' data",
      "Access reports or admin tools",
    ],
    note: "Account is active immediately after registration.",
  },
  {
    id: "teacher" as Role,
    icon: "🧑‍🏫",
    label: "Teacher",
    tagline: "Operational admin — manage classes & attendance",
    color: "#f0c000",
    colorBg: "rgba(240,192,0,0.08)",
    colorBorder: "rgba(240,192,0,0.25)",
    colorBorderActive: "#f0c000",
    permissions: [
      "Register families and children",
      "Mark weekly attendance",
      "Record feeding scheme participation",
      "View class-level statistics",
      "Flag welfare concerns",
    ],
    cannot: [
      "Export donor reports",
      "Manage user roles or system settings",
    ],
    note: "Account requires Super Admin approval before access is granted.",
  },
  {
    id: "admin" as Role,
    icon: "🛡️",
    label: "Super Admin",
    tagline: "Leadership — full system access & reporting",
    color: "#a78bfa",
    colorBg: "rgba(167,139,250,0.08)",
    colorBorder: "rgba(167,139,250,0.25)",
    colorBorderActive: "#a78bfa",
    permissions: [
      "Full access to all data and reports",
      "Approve and manage user accounts",
      "Export PDF / Excel reports for donors",
      "Manage safeguarding and welfare workflows",
      "Configure classes, feeding schemes & settings",
    ],
    cannot: [],
    note: "Reserved for Chairperson, Deputy, Secretary & Deputy Secretary.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterModal({ isOpen, onClose, onContinue }: RegisterModalProps) {
  const [selected, setSelected] = useState<Role | null>(null);
  const [hoveredRole, setHoveredRole] = useState<Role | null>(null);

  if (!isOpen) return null;

  const activeRole = hoveredRole ?? selected;
  const activeConfig = ROLES.find(r => r.id === activeRole);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .rm-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: overlayIn 0.2s ease;
        }

        @keyframes overlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .rm-modal {
          width: 100%;
          max-width: 860px;
          background: #0f3d1a;
          border: 1px solid rgba(240,192,0,0.15);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6);
          animation: modalIn 0.3s cubic-bezier(0.34,1.1,0.64,1);
          max-height: 92vh;
          display: flex;
          flex-direction: column;
        }

        @keyframes modalIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Header ── */
        .rm-header {
          background: #0d3318;
          border-bottom: 1px solid rgba(240,192,0,0.15);
          padding: 1.5rem 1.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .rm-logo-row {
          display: flex; align-items: center; gap: 0.75rem;
        }

        .rm-logo {
          width: 38px; height: 38px;
          background: #f0c000;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.95rem; color: #0a2e12; font-weight: 900;
          flex-shrink: 0;
        }

        .rm-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem; letter-spacing: 1.5px;
          color: #fff; line-height: 1;
        }

        .rm-subtitle { color: rgba(255,255,255,0.4); font-size: 0.78rem; margin-top: 0.2rem; font-family: 'DM Sans', sans-serif; }

        .rm-close {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5);
          font-size: 1.1rem; line-height: 1;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .rm-close:hover { background: rgba(255,255,255,0.13); color: #fff; }

        /* ── Body ── */
        .rm-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          flex: 1;
          overflow: hidden;
        }

        /* ── Left: role cards ── */
        .rm-left {
          padding: 1.5rem;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
        }

        .rm-step-label {
          font-size: 0.68rem; font-weight: 700;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 0.25rem;
          font-family: 'DM Sans', sans-serif;
        }

        .rm-role-card {
          padding: 1rem 1.1rem;
          border-radius: 11px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.15);
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: 'DM Sans', sans-serif;
          text-align: left;
          width: 100%;
        }

        .rm-role-card:hover {
          background: rgba(0,0,0,0.25);
          transform: translateX(3px);
        }

        .rm-role-top {
          display: flex; align-items: center; gap: 0.85rem;
        }

        .rm-role-icon {
          width: 44px; height: 44px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; flex-shrink: 0;
          transition: all 0.2s;
        }

        .rm-role-name {
          font-weight: 700; font-size: 0.95rem; color: #fff; line-height: 1.2;
        }

        .rm-role-tagline {
          font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 0.2rem;
        }

        .rm-role-arrow {
          margin-left: auto;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.2);
          transition: all 0.2s;
        }

        /* ── Right: detail pane ── */
        .rm-right {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .rm-detail-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.2);
          font-family: 'DM Sans', sans-serif;
          text-align: center;
          gap: 0.75rem;
        }

        .rm-detail-icon {
          font-size: 2.5rem;
          opacity: 0.4;
        }

        .rm-detail-hint {
          font-size: 0.82rem;
          max-width: 180px;
          line-height: 1.5;
        }

        .rm-detail-content {
          display: flex; flex-direction: column; gap: 1rem;
          animation: detailIn 0.2s ease;
          flex: 1;
        }

        @keyframes detailIn {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .rm-detail-header {
          display: flex; align-items: center; gap: 1rem;
        }

        .rm-detail-big-icon {
          width: 56px; height: 56px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.8rem;
        }

        .rm-detail-role-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem; letter-spacing: 1.5px; color: #fff; line-height: 1;
        }

        .rm-detail-role-tagline {
          font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-top: 0.25rem;
          font-family: 'DM Sans', sans-serif;
        }

        .rm-section-title {
          font-size: 0.68rem; font-weight: 700;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase; letter-spacing: 0.8px;
          margin-bottom: 0.6rem;
          font-family: 'DM Sans', sans-serif;
        }

        .rm-perm-list {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 0.45rem;
        }

        .rm-perm-item {
          display: flex; align-items: flex-start; gap: 0.6rem;
          font-size: 0.82rem; color: rgba(255,255,255,0.75);
          font-family: 'DM Sans', sans-serif; line-height: 1.4;
        }

        .rm-perm-check {
          width: 16px; height: 16px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.55rem; font-weight: 900; flex-shrink: 0; margin-top: 1px;
        }

        .rm-cannot-item {
          display: flex; align-items: flex-start; gap: 0.6rem;
          font-size: 0.78rem; color: rgba(255,255,255,0.35);
          font-family: 'DM Sans', sans-serif; line-height: 1.4;
        }

        .rm-note {
          background: rgba(0,0,0,0.2);
          border-radius: 8px; padding: 0.7rem 0.9rem;
          font-size: 0.78rem; color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif;
          display: flex; gap: 0.5rem; align-items: flex-start;
          border-left: 3px solid;
        }

        /* ── Footer ── */
        .rm-footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 1.1rem 1.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-shrink: 0;
          background: rgba(0,0,0,0.1);
          flex-wrap: wrap;
        }

        .rm-login-hint {
          font-size: 0.8rem; color: rgba(255,255,255,0.35);
          font-family: 'DM Sans', sans-serif;
        }

        .rm-login-hint button {
          background: none; border: none; color: #f0c000;
          font-weight: 700; cursor: pointer; font-size: 0.8rem;
          font-family: 'DM Sans', sans-serif;
          padding: 0; text-decoration: underline;
        }

        .rm-login-hint button:hover { color: #ffd200; }

        .btn-gold {
          background: #f0c000; color: #0a2e12;
          border: none; padding: 0.65rem 1.75rem;
          border-radius: 8px; font-size: 0.875rem; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; white-space: nowrap;
        }

        .btn-gold:hover:not(:disabled) {
          background: #ffd200;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(240,192,0,0.35);
        }

        .btn-gold:disabled {
          opacity: 0.35; cursor: not-allowed;
        }

        /* ── Scrollbar ── */
        .rm-left::-webkit-scrollbar,
        .rm-right::-webkit-scrollbar { width: 4px; }
        .rm-left::-webkit-scrollbar-track,
        .rm-right::-webkit-scrollbar-track { background: transparent; }
        .rm-left::-webkit-scrollbar-thumb,
        .rm-right::-webkit-scrollbar-thumb { background: rgba(240,192,0,0.2); border-radius: 2px; }

        @media (max-width: 620px) {
          .rm-body { grid-template-columns: 1fr; }
          .rm-right { border-top: 1px solid rgba(255,255,255,0.06); }
          .rm-modal { max-height: 95vh; }
        }
      `}</style>

      {/* ── Overlay ───────────────────────────────────────────── */}
      <div className="rm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="rm-modal">

          {/* ── Header ──────────────────────────────────────────── */}
          <div className="rm-header">
            <div className="rm-logo-row">
              <div className="rm-logo">SS</div>
              <div>
                <div className="rm-title">Create Account</div>
                <div className="rm-subtitle">Sunday School Management Portal</div>
              </div>
            </div>
            <button className="rm-close" onClick={onClose}>✕</button>
          </div>

          {/* ── Body ────────────────────────────────────────────── */}
          <div className="rm-body">

            {/* ── Left: Role selection ───────────────────────────── */}
            <div className="rm-left">
              <p className="rm-step-label">Step 1 — Choose your role</p>

              {ROLES.map((role) => {
                const isSelected = selected === role.id;
                return (
                  <button
                    key={role.id}
                    className="rm-role-card"
                    style={{
                      borderColor: isSelected ? role.colorBorderActive : undefined,
                      background: isSelected ? role.colorBg : undefined,
                    }}
                    onClick={() => setSelected(role.id)}
                    onMouseEnter={() => setHoveredRole(role.id)}
                    onMouseLeave={() => setHoveredRole(null)}
                  >
                    <div className="rm-role-top">
                      <div
                        className="rm-role-icon"
                        style={{ background: isSelected ? role.colorBg : "rgba(255,255,255,0.05)" }}
                      >
                        {role.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="rm-role-name" style={{ color: isSelected ? role.color : "#fff" }}>
                          {role.label}
                        </div>
                        <div className="rm-role-tagline">{role.tagline}</div>
                      </div>
                      <div
                        className="rm-role-arrow"
                        style={{ color: isSelected ? role.color : undefined }}
                      >
                        {isSelected ? "●" : "→"}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* POPIA note */}
              <div style={{
                marginTop: "auto",
                paddingTop: "1rem",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex", gap: "0.5rem", alignItems: "flex-start",
                fontSize: "0.72rem", color: "rgba(255,255,255,0.25)",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <span>🔒</span>
                <span>POPIA: Your data is handled lawfully and securely.</span>
              </div>
            </div>

            {/* ── Right: Detail pane ────────────────────────────── */}
            <div className="rm-right">
              {!activeConfig ? (
                <div className="rm-detail-empty">
                  <div className="rm-detail-icon">👆</div>
                  <div className="rm-detail-hint">
                    Select a role on the left to see what you can do
                  </div>
                </div>
              ) : (
                <div key={activeConfig.id} className="rm-detail-content">

                  {/* Role header */}
                  <div className="rm-detail-header">
                    <div
                      className="rm-detail-big-icon"
                      style={{ background: activeConfig.colorBg, border: `1.5px solid ${activeConfig.colorBorder}` }}
                    >
                      {activeConfig.icon}
                    </div>
                    <div>
                      <div className="rm-detail-role-name" style={{ color: activeConfig.color }}>
                        {activeConfig.label}
                      </div>
                      <div className="rm-detail-role-tagline">{activeConfig.tagline}</div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <p className="rm-section-title">What you can do</p>
                    <ul className="rm-perm-list">
                      {activeConfig.permissions.map((perm, i) => (
                        <li key={i} className="rm-perm-item">
                          <span
                            className="rm-perm-check"
                            style={{
                              background: activeConfig.colorBg,
                              color: activeConfig.color,
                              border: `1px solid ${activeConfig.colorBorder}`,
                            }}
                          >
                            ✓
                          </span>
                          {perm}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cannot */}
                  {activeConfig.cannot.length > 0 && (
                    <div>
                      <p className="rm-section-title">Restricted access</p>
                      <ul className="rm-perm-list">
                        {activeConfig.cannot.map((item, i) => (
                          <li key={i} className="rm-cannot-item">
                            <span style={{
                              width: 16, height: 16, borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.6rem", fontWeight: 900, flexShrink: 0,
                              background: "rgba(239,68,68,0.1)", color: "rgba(239,68,68,0.5)",
                              marginTop: 1,
                            }}>
                              ✗
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Note */}
                  <div
                    className="rm-note"
                    style={{ borderLeftColor: activeConfig.color }}
                  >
                    <span>ℹ️</span>
                    <span>{activeConfig.note}</span>
                  </div>

                  {/* Spacer */}
                  <div style={{ flex: 1 }} />
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ──────────────────────────────────────────── */}
          <div className="rm-footer">
            <div className="rm-login-hint">
              Already have an account?{" "}
              <button onClick={onClose}>Sign in instead</button>
            </div>
            <button
              className="btn-gold"
              disabled={!selected}
              onClick={() => selected && onContinue?.(selected)}
            >
              {selected
                ? `Continue as ${ROLES.find(r => r.id === selected)?.label} →`
                : "Select a role to continue"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}