// src/features/children/ChildRegisterForm.tsx
import { useState } from "react";

type FormData = {
  // Section 1 – Learner Personal Information
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  schoolName: string;
  grade: string;
  physicalAddress: string;
  // Section 2 – Learner Medical Information
  hasAllergies: string;
  allergiesDetails: string;
  hasMedicalCondition: string;
  medicalDetails: string;
  // Section 3 – Emergency Contact / Next of Kin
  contactFirstName: string;
  contactLastName: string;
  contactGender: string;
  contactDob: string;
  relationship: string;
  relationshipOther: string;
  employmentStatus: string;
  contactNumber: string;
  altContactNumber: string;
  atChurch: string;
  // Section 4 – Parental Consent
  consentActivities: string;
  consentMedical: string;
  guardianSignature: string;
  signatureDate: string;
};

const initialForm: FormData = {
  firstName: "", lastName: "", gender: "", dateOfBirth: "",
  schoolName: "", grade: "", physicalAddress: "",
  hasAllergies: "", allergiesDetails: "", hasMedicalCondition: "", medicalDetails: "",
  contactFirstName: "", contactLastName: "", contactGender: "", contactDob: "",
  relationship: "", relationshipOther: "", employmentStatus: "",
  contactNumber: "", altContactNumber: "", atChurch: "",
  consentActivities: "", consentMedical: "", guardianSignature: "", signatureDate: "",
};

const STEPS = [
  { id: 1, label: "Learner Info",      icon: "👤" },
  { id: 2, label: "Medical",           icon: "🏥" },
  { id: 3, label: "Emergency Contact", icon: "📞" },
  { id: 4, label: "Consent",           icon: "✍️"  },
];

const GRADES = [
  "Grade R","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6",
  "Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12","Not in School",
];

const RELATIONSHIPS = [
  "Mother","Father","Sister","Brother","Uncle","Aunt","Grandparent","Neighbor","Other",
];

const EMPLOYMENT_OPTIONS = [
  "Employed (Full-time)","Employed (Part-time)","Self-employed","Unemployed","Student","Retired",
];

interface ChildRegisterFormProps {
  onBack?: () => void;
}

export default function ChildRegisterForm({ onBack }: ChildRegisterFormProps) {
  const [step, setStep]           = useState(1);
  const [form, setForm]           = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]       = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (field: keyof FormData, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: "" }));
  };

  const validateStep = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (step === 1) {
      if (!form.firstName)       e.firstName       = "First name is required";
      if (!form.lastName)        e.lastName        = "Last name is required";
      if (!form.gender)          e.gender          = "Please select a gender";
      if (!form.dateOfBirth)     e.dateOfBirth     = "Date of birth is required";
      if (!form.grade)           e.grade           = "Grade is required";
      if (!form.physicalAddress) e.physicalAddress = "Physical address is required";
    }
    if (step === 2) {
      if (!form.hasAllergies)        e.hasAllergies        = "Please answer this question";
      if (!form.hasMedicalCondition) e.hasMedicalCondition = "Please answer this question";
    }
    if (step === 3) {
      if (!form.contactFirstName) e.contactFirstName = "First name is required";
      if (!form.contactLastName)  e.contactLastName  = "Last name is required";
      if (!form.contactNumber)    e.contactNumber    = "Contact number is required";
      if (!form.relationship)     e.relationship     = "Relationship is required";
    }
    if (step === 4) {
      if (!form.consentActivities) e.consentActivities = "Please answer this question";
      if (!form.consentMedical)    e.consentMedical    = "Please answer this question";
      if (!form.guardianSignature) e.guardianSignature = "Signature is required";
      if (!form.signatureDate)     e.signatureDate     = "Date is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next         = () => { if (validateStep()) setStep(s => Math.min(s + 1, 4)); };
  const back         = () => setStep(s => Math.max(s - 1, 1));
  const handleSubmit = () => { if (validateStep()) setSubmitted(true); };
  const resetForm    = () => { setForm(initialForm); setStep(1); setSubmitted(false); };

  // ── Shared sub-components ────────────────────────────────────────────────
  const SectionDivider = ({ title }: { title: string }) => (
    <div style={{
      fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.05rem", letterSpacing: "1.5px",
      color: "#f0c000", borderBottom: "2px solid rgba(240,192,0,0.2)",
      paddingBottom: "0.45rem", marginBottom: "1.25rem",
    }}>{title}</div>
  );

  const FieldWrap = ({
    label, required, error, children,
  }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: "1rem" }}>
      {label && (
        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.4rem" }}>
          {label}{required && <span style={{ color: "#f0c000", marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
      {error && (
        <span style={{ display: "block", fontSize: "0.72rem", color: "#f87171", marginTop: "0.3rem" }}>⚠ {error}</span>
      )}
    </div>
  );

  const inputSt = (err?: string): React.CSSProperties => ({
    width: "100%", background: "rgba(0,0,0,0.3)",
    border: `1px solid ${err ? "#f87171" : "rgba(255,255,255,0.12)"}`,
    borderRadius: 7, padding: "0.6rem 0.85rem", color: "#fff",
    fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem", outline: "none",
  });

  const selectSt = (hasVal: boolean, err?: string): React.CSSProperties => ({
    width: "100%", background: "#0a2e12",
    border: `1px solid ${err ? "#f87171" : "rgba(255,255,255,0.12)"}`,
    borderRadius: 7, padding: "0.6rem 0.85rem",
    color: hasVal ? "#fff" : "rgba(255,255,255,0.35)",
    fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem", outline: "none",
  });

  const CheckboxRow = ({ field, options }: { field: keyof FormData; options: { value: string; label: string }[] }) => (
    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "0.2rem" }}>
      {options.map(opt => (
        <label key={opt.value} onClick={() => set(field, opt.value)}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", userSelect: "none" }}>
          <div style={{
            width: 17, height: 17, borderRadius: 3, flexShrink: 0,
            border: `2px solid ${form[field] === opt.value ? "#f0c000" : "rgba(255,255,255,0.3)"}`,
            background: form[field] === opt.value ? "#f0c000" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
          }}>
            {form[field] === opt.value && <span style={{ color: "#0a2e12", fontSize: "0.65rem", fontWeight: 900 }}>✓</span>}
          </div>
          {opt.label}
        </label>
      ))}
    </div>
  );

  const RelationshipGrid = () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem 1.25rem", marginTop: "0.3rem" }}>
      {RELATIONSHIPS.map(rel => (
        <label key={rel} onClick={() => set("relationship", rel)}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", userSelect: "none", minWidth: "120px" }}>
          <div style={{
            width: 17, height: 17, borderRadius: 3, flexShrink: 0,
            border: `2px solid ${form.relationship === rel ? "#f0c000" : "rgba(255,255,255,0.3)"}`,
            background: form.relationship === rel ? "#f0c000" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
          }}>
            {form.relationship === rel && <span style={{ color: "#0a2e12", fontSize: "0.65rem", fontWeight: 900 }}>✓</span>}
          </div>
          {rel}
        </label>
      ))}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Outer wrapper fills the overlay space given by the dashboard ── */
        .crf-outer {
          width: 100%; min-height: 100%;
          background: #071a0d;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          display: flex;
          flex-direction: column;
        }

        /* ── Top bar matching the dashboard header height/style ── */
        .crf-topbar {
          display: flex; align-items: center; gap: 1rem;
          padding: 0.85rem 2rem;
          background: #0a2e12;
          border-bottom: 1px solid rgba(240,192,0,0.15);
          flex-shrink: 0;
        }
        .crf-topbar-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.3rem; letter-spacing: 2px; color: #fff;
        }
        .crf-topbar-sub { font-size: 0.72rem; color: rgba(255,255,255,0.35); margin-top: 1px; }
        .crf-back-btn {
          margin-left: auto;
          background: none; border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.5); border-radius: 7px;
          padding: 0.4rem 1.1rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem; font-weight: 600; cursor: pointer;
          transition: all 0.15s; white-space: nowrap;
        }
        .crf-back-btn:hover { border-color: rgba(255,255,255,0.4); color: #fff; }

        /* ── Scrollable content area ── */
        .crf-content {
          flex: 1;
          padding: 2rem 2.5rem;
          overflow-y: auto;
        }

        /* ── Card ── */
        .crf-card {
          max-width: 820px;
          margin: 0 auto;
          background: #0f3d1a;
          border: 1px solid rgba(240,192,0,0.18);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.45);
        }

        /* ── Card header ── */
        .crf-card-hd {
          background: linear-gradient(135deg,#0d3318,#0a2e12);
          border-bottom: 2px solid rgba(240,192,0,0.22);
          padding: 1.25rem 1.75rem;
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
        }
        .crf-card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.65rem; letter-spacing: 2px; color: #fff; line-height: 1.1;
        }
        .crf-card-sub { font-size: 0.75rem; color: rgba(255,255,255,0.38); margin-top: 3px; }
        .crf-step-badge {
          background: rgba(240,192,0,0.1); border: 1px solid rgba(240,192,0,0.3);
          color: #f0c000; font-size: 0.72rem; font-weight: 700;
          padding: 0.3rem 0.85rem; border-radius: 20px; letter-spacing: 0.5px;
          white-space: nowrap; flex-shrink: 0;
        }

        /* ── Step nav ── */
        .crf-stepnav {
          display: flex; align-items: center;
          padding: 0.85rem 1.75rem;
          background: rgba(0,0,0,0.18);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .crf-step-item { display: flex; align-items: center; flex: 1; }
        .crf-bubble {
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem; font-weight: 700; flex-shrink: 0;
          transition: all 0.3s; border: 2px solid transparent;
        }
        .crf-bubble.active  { background: #f0c000; color: #0a2e12; box-shadow: 0 0 12px rgba(240,192,0,0.45); }
        .crf-bubble.done    { background: transparent; border-color: #f0c000; color: #f0c000; }
        .crf-bubble.pending { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.2); }
        .crf-step-lbl { font-size: 0.6rem; font-weight: 600; text-align: center; margin-top: 2px; letter-spacing: 0.3px; }
        .crf-connector { flex: 1; height: 2px; margin: 0 4px; margin-bottom: 14px; border-radius: 1px; transition: background 0.4s; }
        .crf-connector.done    { background: #f0c000; }
        .crf-connector.pending { background: rgba(255,255,255,0.08); }

        /* ── Body ── */
        .crf-body { padding: 1.75rem 2rem 2rem; }
        .crf-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .crf-info-box {
          background: rgba(240,192,0,0.06); border: 1px solid rgba(240,192,0,0.18);
          border-radius: 9px; padding: 0.8rem 1rem;
          font-size: 0.8rem; color: rgba(255,255,255,0.55);
          display: flex; gap: 0.7rem; margin-bottom: 1.25rem; line-height: 1.6;
        }
        .crf-consent-block {
          background: rgba(0,0,0,0.18); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 9px; padding: 1rem 1.2rem; margin-bottom: 0.8rem;
        }
        .crf-consent-q { font-size: 0.875rem; color: rgba(255,255,255,0.82); font-weight: 500; margin-bottom: 0.65rem; line-height: 1.55; }
        .crf-sig-block {
          background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 9px; padding: 1rem 1.2rem; margin-top: 0.5rem;
        }
        .crf-footer {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 1.75rem; padding-top: 1.25rem;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .btn-gold {
          background: #f0c000; color: #0a2e12; border: none;
          padding: 0.62rem 1.65rem; border-radius: 7px;
          font-size: 0.875rem; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .btn-gold:hover { background: #ffd200; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(240,192,0,0.3); }
        .btn-outline {
          background: transparent; color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 0.62rem 1.4rem; border-radius: 7px;
          font-size: 0.875rem; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .btn-outline:hover { border-color: rgba(255,255,255,0.35); color: #fff; }
        .crf-divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 1.1rem 0; }

        .fade-in { animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity:0; transform:translateX(6px); } to { opacity:1; transform:translateX(0); } }
        @keyframes popIn  { from { transform:scale(0.5); opacity:0; } to { transform:scale(1); opacity:1; } }

        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5) sepia(1) saturate(3); opacity:0.45; }
        select option { background: #0a2e12; color: #fff; }

        @media (max-width: 640px) {
          .crf-grid2    { grid-template-columns: 1fr; }
          .crf-content  { padding: 1.25rem; }
          .crf-body     { padding: 1.25rem; }
          .crf-topbar   { padding: 0.75rem 1.25rem; }
          .crf-card-hd  { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="crf-outer">

        {/* ── Top bar ── */}
        <div className="crf-topbar">
          <div>
            <div className="crf-topbar-title">📋 Register a Child</div>
            <div className="crf-topbar-sub">Sunday School Management Portal · Child Registration</div>
          </div>
          {onBack && (
            <button className="crf-back-btn" onClick={onBack}>← Back to Children</button>
          )}
        </div>

        {/* ── Scrollable content ── */}
        <div className="crf-content">
          <div className="crf-card">

            {/* ── Card header ── */}
            <div className="crf-card-hd">
              <div>
                <div className="crf-card-title">Sunday School Registration Form</div>
                <div className="crf-card-sub">Complete all four sections · Fields marked * are required</div>
              </div>
              {!submitted && <div className="crf-step-badge">STEP {step} OF 4</div>}
            </div>

            {/* ── Step navigator ── */}
            {!submitted && (
              <div className="crf-stepnav">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="crf-step-item">
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div className={`crf-bubble ${step === s.id ? "active" : step > s.id ? "done" : "pending"}`}>
                        {step > s.id ? "✓" : s.icon}
                      </div>
                      <span className="crf-step-lbl" style={{ color: step === s.id ? "#f0c000" : step > s.id ? "rgba(240,192,0,0.55)" : "rgba(255,255,255,0.2)" }}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`crf-connector ${step > s.id ? "done" : "pending"}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="crf-body">

              {/* ══ SUCCESS ══════════════════════════════════════════════════ */}
              {submitted && (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <div style={{ width: 64, height: 64, background: "#f0c000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", margin: "0 auto 1rem", animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 0 24px rgba(240,192,0,0.4)", color: "#0a2e12", fontWeight: 900 }}>✓</div>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.7rem", color: "#f0c000", letterSpacing: 1 }}>Registration Submitted!</h2>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", maxWidth: 360, margin: "0.65rem auto 1.25rem", lineHeight: 1.6 }}>
                    <strong style={{ color: "#fff" }}>{form.firstName} {form.lastName}</strong>'s registration has been received and will be reviewed by Sunday School leadership.
                  </p>
                  {/* Summary table */}
                  <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "1rem 1.5rem", maxWidth: 420, margin: "0 auto 1.5rem", textAlign: "left" }}>
                    {[
                      ["Full Name",         `${form.firstName} ${form.lastName}`],
                      ["Gender",            form.gender],
                      ["Date of Birth",     form.dateOfBirth],
                      ["Grade",             form.grade],
                      ["Emergency Contact", `${form.contactFirstName} ${form.contactLastName} (${form.relationship})`],
                      ["Contact Number",    form.contactNumber],
                    ].map(([l, v]) => (
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "0.38rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "0.82rem" }}>
                        <span style={{ color: "rgba(255,255,255,0.38)" }}>{l}</span>
                        <span style={{ color: "#fff", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                    <button className="btn-gold" onClick={resetForm}>Register Another Child</button>
                    {onBack && <button className="btn-outline" onClick={onBack}>← Back to Children</button>}
                  </div>
                </div>
              )}

              {/* ══ STEP 1 — Learner Personal Information ════════════════════ */}
              {!submitted && step === 1 && (
                <div className="fade-in">
                  <SectionDivider title="Learner Personal Information" />
                  <div className="crf-grid2">
                    <FieldWrap label="First Name" required error={errors.firstName}>
                      <input style={inputSt(errors.firstName)} type="text" placeholder="e.g. Amara" value={form.firstName} onChange={e => set("firstName", e.target.value)} />
                    </FieldWrap>
                    <FieldWrap label="Last Name" required error={errors.lastName}>
                      <input style={inputSt(errors.lastName)} type="text" placeholder="e.g. Dlamini" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
                    </FieldWrap>
                  </div>
                  <FieldWrap label="Gender" required error={errors.gender}>
                    <CheckboxRow field="gender" options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Other" }]} />
                  </FieldWrap>
                  <div className="crf-grid2">
                    <FieldWrap label="Date of Birth" required error={errors.dateOfBirth}>
                      <input style={inputSt(errors.dateOfBirth)} type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} />
                    </FieldWrap>
                    <FieldWrap label="Grade" required error={errors.grade}>
                      <select style={selectSt(!!form.grade, errors.grade)} value={form.grade} onChange={e => set("grade", e.target.value)}>
                        <option value="">Select grade…</option>
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </FieldWrap>
                  </div>
                  <FieldWrap label="School / Institution Name">
                    <input style={inputSt()} type="text" placeholder="Name of school attended (if applicable)" value={form.schoolName} onChange={e => set("schoolName", e.target.value)} />
                  </FieldWrap>
                  <FieldWrap label="Physical Address" required error={errors.physicalAddress}>
                    <textarea rows={3} value={form.physicalAddress} onChange={e => set("physicalAddress", e.target.value)} placeholder="Street address, suburb, city…"
                      style={{ ...inputSt(errors.physicalAddress), resize: "vertical" }} />
                  </FieldWrap>
                </div>
              )}

              {/* ══ STEP 2 — Learner Medical Information ════════════════════ */}
              {!submitted && step === 2 && (
                <div className="fade-in">
                  <SectionDivider title="Learner Medical Information" />
                  <div className="crf-info-box">
                    <span>ℹ️</span>
                    <span>This helps keep your child safe during all activities. Data is stored securely in compliance with <strong style={{ color: "#f0c000" }}>POPIA</strong>.</span>
                  </div>
                  <FieldWrap label="Does the learner have any allergies?" required error={errors.hasAllergies}>
                    <CheckboxRow field="hasAllergies" options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} />
                  </FieldWrap>
                  {form.hasAllergies === "Yes" && (
                    <FieldWrap label="If yes, please specify">
                      <textarea rows={2} value={form.allergiesDetails} onChange={e => set("allergiesDetails", e.target.value)} placeholder="e.g. Peanuts, bee stings, dairy…"
                        style={{ ...inputSt(), resize: "vertical" }} />
                    </FieldWrap>
                  )}
                  <hr className="crf-divider" />
                  <FieldWrap label="Does the learner have any medical condition(s)?" required error={errors.hasMedicalCondition}>
                    <CheckboxRow field="hasMedicalCondition" options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} />
                  </FieldWrap>
                  {form.hasMedicalCondition === "Yes" && (
                    <FieldWrap label="If yes, please specify">
                      <textarea rows={2} value={form.medicalDetails} onChange={e => set("medicalDetails", e.target.value)} placeholder="e.g. Asthma, epilepsy, diabetes…"
                        style={{ ...inputSt(), resize: "vertical" }} />
                    </FieldWrap>
                  )}
                </div>
              )}

              {/* ══ STEP 3 — Emergency Contact / Next of Kin ════════════════ */}
              {!submitted && step === 3 && (
                <div className="fade-in">
                  <SectionDivider title="Emergency Contact / Next of Kin Information" />
                  <div className="crf-grid2">
                    <FieldWrap label="First Name" required error={errors.contactFirstName}>
                      <input style={inputSt(errors.contactFirstName)} type="text" placeholder="Contact's first name" value={form.contactFirstName} onChange={e => set("contactFirstName", e.target.value)} />
                    </FieldWrap>
                    <FieldWrap label="Last Name" required error={errors.contactLastName}>
                      <input style={inputSt(errors.contactLastName)} type="text" placeholder="Contact's last name" value={form.contactLastName} onChange={e => set("contactLastName", e.target.value)} />
                    </FieldWrap>
                  </div>
                  <FieldWrap label="Gender">
                    <CheckboxRow field="contactGender" options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Other" }]} />
                  </FieldWrap>
                  <FieldWrap label="Date of Birth">
                    <input style={inputSt()} type="date" value={form.contactDob} onChange={e => set("contactDob", e.target.value)} />
                  </FieldWrap>
                  <FieldWrap label="Relationship to Learner (mark with ✓)" required error={errors.relationship}>
                    <RelationshipGrid />
                    {form.relationship === "Other" && (
                      <div style={{ marginTop: "0.6rem" }}>
                        <input style={inputSt()} type="text" placeholder="Please specify…" value={form.relationshipOther} onChange={e => set("relationshipOther", e.target.value)} />
                      </div>
                    )}
                  </FieldWrap>
                  <FieldWrap label="Employment Status">
                    <select style={selectSt(!!form.employmentStatus)} value={form.employmentStatus} onChange={e => set("employmentStatus", e.target.value)}>
                      <option value="">Select employment status…</option>
                      {EMPLOYMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </FieldWrap>
                  <div className="crf-grid2">
                    <FieldWrap label="Contact Number" required error={errors.contactNumber}>
                      <input style={inputSt(errors.contactNumber)} type="tel" placeholder="e.g. 071 234 5678" value={form.contactNumber} onChange={e => set("contactNumber", e.target.value)} />
                    </FieldWrap>
                    <FieldWrap label="Alternative Contact Number">
                      <input style={inputSt()} type="tel" placeholder="e.g. 082 987 6543" value={form.altContactNumber} onChange={e => set("altContactNumber", e.target.value)} />
                    </FieldWrap>
                  </div>
                  <FieldWrap label="Will you be at church during the Sunday school session?">
                    <CheckboxRow field="atChurch" options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} />
                  </FieldWrap>
                </div>
              )}

              {/* ══ STEP 4 — Parental Consent and Permission ════════════════ */}
              {!submitted && step === 4 && (
                <div className="fade-in">
                  <SectionDivider title="Parental Consent and Permission" />
                  <div className="crf-info-box">
                    <span>🔒</span>
                    <span>By completing this section the parent or guardian provides informed consent. All data is processed lawfully in compliance with the <strong style={{ color: "#f0c000" }}>Protection of Personal Information Act (POPIA)</strong>.</span>
                  </div>
                  <div className="crf-consent-block">
                    <p className="crf-consent-q">I give permission for the learner to participate in Sunday school activities.</p>
                    <FieldWrap label="" required error={errors.consentActivities}>
                      <CheckboxRow field="consentActivities" options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} />
                    </FieldWrap>
                  </div>
                  <div className="crf-consent-block">
                    <p className="crf-consent-q">I authorise medical treatment in case of an emergency if I am unavailable.</p>
                    <FieldWrap label="" required error={errors.consentMedical}>
                      <CheckboxRow field="consentMedical" options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} />
                    </FieldWrap>
                  </div>
                  <div className="crf-sig-block">
                    <p style={{ fontSize: "0.77rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.9rem", fontStyle: "italic", lineHeight: 1.6 }}>
                      By entering your full name below you confirm that all information provided is accurate and that you consent to the above on behalf of the learner.
                    </p>
                    <div className="crf-grid2">
                      <FieldWrap label="Parent / Guardian Signature (Full Name)" required error={errors.guardianSignature}>
                        <input style={{ ...inputSt(errors.guardianSignature), fontStyle: "italic" }} type="text" placeholder="Type full name as signature" value={form.guardianSignature} onChange={e => set("guardianSignature", e.target.value)} />
                      </FieldWrap>
                      <FieldWrap label="Date" required error={errors.signatureDate}>
                        <input style={inputSt(errors.signatureDate)} type="date" value={form.signatureDate} onChange={e => set("signatureDate", e.target.value)} />
                      </FieldWrap>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Navigation ── */}
              {!submitted && (
                <div className="crf-footer">
                  <div>
                    {step > 1 && <button className="btn-outline" onClick={back}>← Back</button>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.22)", fontWeight: 600 }}>{step} / {STEPS.length}</span>
                    {step < 4
                      ? <button className="btn-gold" onClick={next}>Continue →</button>
                      : <button className="btn-gold" onClick={handleSubmit}>Submit Registration ✓</button>
                    }
                  </div>
                </div>
              )}

            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: "1.25rem", marginBottom: "1rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.18)" }}>
            POPIA: Handle data lawfully &amp; securely · Sunday School Management Portal
          </p>
        </div>
      </div>
    </>
  );
}