// src/features/children/ChildRegisterForm.tsx
// Place this in: frontend/src/features/children/ChildRegisterForm.tsx

import { useState } from "react";

type FormData = {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  schoolName: string;
  grade: string;
  physicalAddress: string;
  hasAllergies: string;
  allergiesDetails: string;
  hasMedicalCondition: string;
  medicalDetails: string;
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
  { id: 1, label: "Learner Info", icon: "👤" },
  { id: 2, label: "Medical", icon: "🏥" },
  { id: 3, label: "Emergency Contact", icon: "📞" },
  { id: 4, label: "Consent", icon: "✍️" },
];

// ─── Shared style objects ─────────────────────────────────────────────────────
const styles = {
  label: {
    display: "block",
    fontSize: "0.73rem",
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.6px",
    marginBottom: "0.4rem",
  },
  error: {
    fontSize: "0.75rem",
    color: "#ff6b6b",
    marginTop: "0.3rem",
    fontWeight: 500,
    display: "block",
  },
  radioOption: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.5rem 0.9rem",
    borderRadius: "7px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.2)",
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  radioOptionActive: {
    border: "1px solid #f0c000",
    background: "rgba(240,192,0,0.12)",
    color: "#f0c000",
  },
};

export default function ChildRegisterForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validateStep = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (step === 1) {
      if (!form.firstName) e.firstName = "Required";
      if (!form.lastName) e.lastName = "Required";
      if (!form.gender) e.gender = "Required";
      if (!form.dateOfBirth) e.dateOfBirth = "Required";
      if (!form.grade) e.grade = "Required";
      if (!form.physicalAddress) e.physicalAddress = "Required";
    }
    if (step === 2) {
      if (!form.hasAllergies) e.hasAllergies = "Required";
      if (!form.hasMedicalCondition) e.hasMedicalCondition = "Required";
    }
    if (step === 3) {
      if (!form.contactFirstName) e.contactFirstName = "Required";
      if (!form.contactLastName) e.contactLastName = "Required";
      if (!form.contactNumber) e.contactNumber = "Required";
      if (!form.relationship) e.relationship = "Required";
    }
    if (step === 4) {
      if (!form.consentActivities) e.consentActivities = "Required";
      if (!form.consentMedical) e.consentMedical = "Required";
      if (!form.guardianSignature) e.guardianSignature = "Required";
      if (!form.signatureDate) e.signatureDate = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 4)); };
  const back = () => setStep((s) => Math.max(s - 1, 1));
  const handleSubmit = () => { if (validateStep()) { console.log("Submitted:", form); setSubmitted(true); } };
  const resetForm = () => { setForm(initialForm); setStep(1); setSubmitted(false); };

  const RadioGroup = ({
    label, field, options,
  }: { label: string; field: keyof FormData; options: { value: string; label: string }[] }) => (
    <div>
      {label && <label style={styles.label}>{label}</label>}
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: label ? "0.4rem" : 0 }}>
        {options.map((opt) => (
          <label key={opt.value} style={{
            ...styles.radioOption,
            ...(form[field] === opt.value ? styles.radioOptionActive : {}),
          }}>
            <input type="radio" name={field} value={opt.value}
              checked={form[field] === opt.value}
              onChange={() => set(field, opt.value)}
              style={{ accentColor: "#f0c000" }}
            />
            {opt.label}
          </label>
        ))}
      </div>
      {errors[field] && <span style={styles.error}>{errors[field]}</span>}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #0a2e12;
          display: flex;
          padding: 2rem 1rem;
          align-items: flex-start;
          justify-content: center;
        }

        .reg-wrapper { width: 100%; max-width: 720px; }

        .reg-topbar {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          margin-bottom: 1.25rem;
        }

        .reg-logo {
          width: 42px; height: 42px;
          background: #f0c000;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1rem;
          color: #0a2e12;
          font-weight: 900;
          flex-shrink: 0;
        }

        .reg-brand { color: #fff; font-size: 0.95rem; font-weight: 700; line-height: 1.3; }
        .reg-brand span { display: block; font-size: 0.72rem; font-weight: 400; color: rgba(255,255,255,0.4); }

        .reg-card {
          background: #0f3d1a;
          border: 1px solid rgba(240,192,0,0.15);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .reg-card-header {
          background: #0d3318;
          border-bottom: 2px solid rgba(240,192,0,0.18);
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .reg-card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          letter-spacing: 1.5px;
          color: #fff;
          line-height: 1;
        }

        .reg-card-subtitle { color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-top: 0.25rem; }

        .reg-step-badge {
          background: rgba(240,192,0,0.1);
          border: 1px solid rgba(240,192,0,0.3);
          color: #f0c000;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 0.9rem;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }

        .step-nav {
          display: flex;
          align-items: center;
          padding: 1rem 2rem;
          background: rgba(0,0,0,0.15);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .step-item { display: flex; align-items: center; flex: 1; }

        .step-bubble {
          width: 30px; height: 30px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          flex-shrink: 0;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .step-bubble.active { background: #f0c000; color: #0a2e12; box-shadow: 0 0 14px rgba(240,192,0,0.5); }
        .step-bubble.done { background: transparent; border-color: #f0c000; color: #f0c000; }
        .step-bubble.pending { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.25); }

        .step-lbl {
          font-size: 0.66rem; font-weight: 600;
          text-align: center; margin-top: 0.2rem; letter-spacing: 0.3px;
        }

        .step-connector { flex: 1; height: 2px; margin: 0 4px; margin-bottom: 14px; border-radius: 1px; transition: background 0.4s; }
        .step-connector.done { background: #f0c000; }
        .step-connector.pending { background: rgba(255,255,255,0.08); }

        .reg-body { padding: 1.75rem 2rem 2rem; }

        .section-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.25rem;
          letter-spacing: 1.5px;
          color: #f0c000;
          margin-bottom: 1.25rem;
          padding-bottom: 0.55rem;
          border-bottom: 1px solid rgba(240,192,0,0.18);
        }

        .reg-input {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 0.6rem 0.85rem;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }

        .reg-input:focus {
          border-color: #f0c000;
          box-shadow: 0 0 0 3px rgba(240,192,0,0.12);
        }

        .reg-input::placeholder { color: rgba(255,255,255,0.22); }
        .reg-input.err { border-color: #ff6b6b !important; }

        .reg-input option { background: #0f3d1a; color: #fff; }

        input[type="date"].reg-input::-webkit-calendar-picker-indicator {
          filter: invert(0.6) sepia(1) saturate(3) hue-rotate(5deg);
          opacity: 0.5;
        }

        .btn-gold {
          background: #f0c000;
          color: #0a2e12;
          border: none;
          padding: 0.65rem 1.75rem;
          border-radius: 7px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          letter-spacing: 0.2px;
        }

        .btn-gold:hover { background: #ffd200; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(240,192,0,0.35); }

        .btn-outline {
          background: transparent;
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 0.65rem 1.5rem;
          border-radius: 7px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .btn-outline:hover { border-color: rgba(255,255,255,0.35); color: #fff; }

        .info-box {
          background: rgba(240,192,0,0.06);
          border: 1px solid rgba(240,192,0,0.18);
          border-radius: 9px;
          padding: 0.85rem 1rem;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.65);
          display: flex;
          gap: 0.7rem;
          margin-bottom: 1.25rem;
        }

        .consent-block {
          background: rgba(0,0,0,0.18);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 9px;
          padding: 1rem 1.1rem;
        }

        .consent-q { font-size: 0.875rem; color: rgba(255,255,255,0.8); font-weight: 500; margin-bottom: 0.75rem; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        .fade-in { animation: fadeIn 0.22s ease; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 540px) {
          .grid-2 { grid-template-columns: 1fr; }
          .reg-card-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
          .reg-body { padding: 1.25rem; }
          .step-nav { padding: 1rem; }
        }
      `}</style>

      <div className="reg-page">
        <div className="reg-wrapper">

          {/* ── Top bar matching app header style */}
          <div className="reg-topbar">
            <div className="reg-logo">SS</div>
            <div className="reg-brand">
              Sunday School
              <span>Teacher Tools — Child Registration</span>
            </div>
          </div>

          <div className="reg-card">

            {/* ── Header */}
            <div className="reg-card-header">
              <div>
                <div className="reg-card-title">Registration Form</div>
                <div className="reg-card-subtitle">Complete all sections to register a new learner</div>
              </div>
              {!submitted && <div className="reg-step-badge">STEP {step} OF 4</div>}
            </div>

            {/* ── Step Nav */}
            {!submitted && (
              <div className="step-nav">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="step-item">
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div className={`step-bubble ${step === s.id ? "active" : step > s.id ? "done" : "pending"}`}>
                        {step > s.id ? "✓" : s.icon}
                      </div>
                      <span className="step-lbl" style={{
                        color: step === s.id ? "#f0c000" : step > s.id ? "rgba(240,192,0,0.55)" : "rgba(255,255,255,0.22)"
                      }}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`step-connector ${step > s.id ? "done" : "pending"}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="reg-body">

              {/* ══ SUCCESS ══════════════════════════════════════════════ */}
              {submitted && (
                <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
                  <div style={{
                    width: 70, height: 70, background: "#f0c000",
                    borderRadius: "50%", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "2rem", margin: "0 auto 1.25rem",
                    animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                    boxShadow: "0 0 28px rgba(240,192,0,0.45)",
                    color: "#0a2e12", fontWeight: 900
                  }}>✓</div>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.7rem", color: "#f0c000", letterSpacing: 1 }}>
                    Registration Submitted!
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", maxWidth: 360, margin: "0.75rem auto 2rem" }}>
                    {form.firstName}'s registration has been received. A teacher will follow up with the family shortly.
                  </p>
                  <button className="btn-gold" onClick={resetForm}>Register Another Child</button>
                </div>
              )}

              {/* ══ STEP 1 ════════════════════════════════════════════════ */}
              {!submitted && step === 1 && (
                <div className="fade-in">
                  <div className="section-heading">Learner Personal Information</div>
                  <div style={{ display: "grid", gap: "1.1rem" }}>

                    <div className="grid-2">
                      <div>
                        <label style={styles.label}>First Name *</label>
                        <input className={`reg-input${errors.firstName ? " err" : ""}`} type="text"
                          placeholder="e.g. Amara" value={form.firstName} onChange={e => set("firstName", e.target.value)} />
                        {errors.firstName && <span style={styles.error}>{errors.firstName}</span>}
                      </div>
                      <div>
                        <label style={styles.label}>Last Name *</label>
                        <input className={`reg-input${errors.lastName ? " err" : ""}`} type="text"
                          placeholder="e.g. Dlamini" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
                        {errors.lastName && <span style={styles.error}>{errors.lastName}</span>}
                      </div>
                    </div>

                    <RadioGroup label="Gender *" field="gender" options={[
                      { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }
                    ]} />

                    <div className="grid-2">
                      <div>
                        <label style={styles.label}>Date of Birth *</label>
                        <input className={`reg-input${errors.dateOfBirth ? " err" : ""}`} type="date"
                          value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} />
                        {errors.dateOfBirth && <span style={styles.error}>{errors.dateOfBirth}</span>}
                      </div>
                      <div>
                        <label style={styles.label}>Grade *</label>
                        <select className={`reg-input${errors.grade ? " err" : ""}`}
                          value={form.grade} onChange={e => set("grade", e.target.value)}>
                          <option value="">Select grade…</option>
                          {["Grade R","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6",
                            "Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12","Not in School"].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                        {errors.grade && <span style={styles.error}>{errors.grade}</span>}
                      </div>
                    </div>

                    <div>
                      <label style={styles.label}>School / Institution Name</label>
                      <input className="reg-input" type="text" placeholder="Name of school attended"
                        value={form.schoolName} onChange={e => set("schoolName", e.target.value)} />
                    </div>

                    <div>
                      <label style={styles.label}>Physical Address *</label>
                      <textarea className={`reg-input${errors.physicalAddress ? " err" : ""}`}
                        placeholder="Street address, suburb, city" rows={2}
                        value={form.physicalAddress} onChange={e => set("physicalAddress", e.target.value)}
                        style={{ resize: "vertical" }} />
                      {errors.physicalAddress && <span style={styles.error}>{errors.physicalAddress}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 2 ════════════════════════════════════════════════ */}
              {!submitted && step === 2 && (
                <div className="fade-in">
                  <div className="section-heading">Learner Medical Information</div>
                  <div className="info-box">
                    <span>ℹ️</span>
                    <span>This information helps keep your child safe. All medical data is stored securely in compliance with <strong style={{ color: "#f0c000" }}>POPIA</strong>.</span>
                  </div>
                  <div style={{ display: "grid", gap: "1.25rem" }}>
                    <div>
                      <RadioGroup label="Does the learner have any allergies? *" field="hasAllergies"
                        options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                      {form.hasAllergies === "yes" && (
                        <div style={{ marginTop: "0.75rem" }}>
                          <label style={styles.label}>Please specify allergies</label>
                          <textarea className="reg-input" placeholder="e.g. Peanuts, bee stings, latex…" rows={2}
                            value={form.allergiesDetails} onChange={e => set("allergiesDetails", e.target.value)}
                            style={{ resize: "vertical" }} />
                        </div>
                      )}
                    </div>
                    <div>
                      <RadioGroup label="Does the learner have any medical condition(s)? *" field="hasMedicalCondition"
                        options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                      {form.hasMedicalCondition === "yes" && (
                        <div style={{ marginTop: "0.75rem" }}>
                          <label style={styles.label}>Please specify condition(s)</label>
                          <textarea className="reg-input" placeholder="e.g. Asthma, epilepsy, diabetes…" rows={2}
                            value={form.medicalDetails} onChange={e => set("medicalDetails", e.target.value)}
                            style={{ resize: "vertical" }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 3 ════════════════════════════════════════════════ */}
              {!submitted && step === 3 && (
                <div className="fade-in">
                  <div className="section-heading">Emergency Contact / Next of Kin</div>
                  <div style={{ display: "grid", gap: "1.1rem" }}>

                    <div className="grid-2">
                      <div>
                        <label style={styles.label}>First Name *</label>
                        <input className={`reg-input${errors.contactFirstName ? " err" : ""}`} type="text"
                          placeholder="Contact first name"
                          value={form.contactFirstName} onChange={e => set("contactFirstName", e.target.value)} />
                        {errors.contactFirstName && <span style={styles.error}>{errors.contactFirstName}</span>}
                      </div>
                      <div>
                        <label style={styles.label}>Last Name *</label>
                        <input className={`reg-input${errors.contactLastName ? " err" : ""}`} type="text"
                          placeholder="Contact last name"
                          value={form.contactLastName} onChange={e => set("contactLastName", e.target.value)} />
                        {errors.contactLastName && <span style={styles.error}>{errors.contactLastName}</span>}
                      </div>
                    </div>

                    <RadioGroup label="Gender" field="contactGender" options={[
                      { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }
                    ]} />

                    <div className="grid-2">
                      <div>
                        <label style={styles.label}>Date of Birth</label>
                        <input className="reg-input" type="date"
                          value={form.contactDob} onChange={e => set("contactDob", e.target.value)} />
                      </div>
                      <div>
                        <label style={styles.label}>Employment Status</label>
                        <select className="reg-input" value={form.employmentStatus} onChange={e => set("employmentStatus", e.target.value)}>
                          <option value="">Select status…</option>
                          {["Employed (Full-time)","Employed (Part-time)","Self-employed","Unemployed","Student","Retired"].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={styles.label}>Relationship to Learner *</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.4rem" }}>
                        {["Mother","Father","Sister","Brother","Uncle","Aunt","Grandparent","Neighbor","Other"].map(rel => (
                          <label key={rel} style={{
                            ...styles.radioOption,
                            ...(form.relationship === rel ? styles.radioOptionActive : {}),
                          }}>
                            <input type="radio" name="relationship" value={rel}
                              checked={form.relationship === rel}
                              onChange={() => set("relationship", rel)}
                              style={{ accentColor: "#f0c000" }} />
                            {rel}
                          </label>
                        ))}
                      </div>
                      {errors.relationship && <span style={styles.error}>{errors.relationship}</span>}
                      {form.relationship === "Other" && (
                        <input className="reg-input" type="text" placeholder="Please specify relationship"
                          style={{ marginTop: "0.75rem" }}
                          value={form.relationshipOther} onChange={e => set("relationshipOther", e.target.value)} />
                      )}
                    </div>

                    <div className="grid-2">
                      <div>
                        <label style={styles.label}>Contact Number *</label>
                        <input className={`reg-input${errors.contactNumber ? " err" : ""}`} type="tel"
                          placeholder="e.g. 071 234 5678"
                          value={form.contactNumber} onChange={e => set("contactNumber", e.target.value)} />
                        {errors.contactNumber && <span style={styles.error}>{errors.contactNumber}</span>}
                      </div>
                      <div>
                        <label style={styles.label}>Alternative Contact Number</label>
                        <input className="reg-input" type="tel" placeholder="Alternative number"
                          value={form.altContactNumber} onChange={e => set("altContactNumber", e.target.value)} />
                      </div>
                    </div>

                    <RadioGroup
                      label="Will you be at church during the Sunday school session?"
                      field="atChurch"
                      options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
                    />
                  </div>
                </div>
              )}

              {/* ══ STEP 4 ════════════════════════════════════════════════ */}
              {!submitted && step === 4 && (
                <div className="fade-in">
                  <div className="section-heading">Parental Consent & Permission</div>
                  <div className="info-box">
                    <span>🔒</span>
                    <span>By completing this section, the parent or legal guardian provides formal consent. Data is handled in compliance with the <strong style={{ color: "#f0c000" }}>POPI Act (POPIA)</strong>.</span>
                  </div>
                  <div style={{ display: "grid", gap: "1rem" }}>

                    <div className="consent-block">
                      <p className="consent-q">I give permission for the learner to participate in Sunday school activities. *</p>
                      <RadioGroup label="" field="consentActivities" options={[
                        { value: "yes", label: "Yes, I give permission" }, { value: "no", label: "No" }
                      ]} />
                    </div>

                    <div className="consent-block">
                      <p className="consent-q">I authorise medical treatment in case of an emergency if I am unavailable. *</p>
                      <RadioGroup label="" field="consentMedical" options={[
                        { value: "yes", label: "Yes, I authorise" }, { value: "no", label: "No" }
                      ]} />
                    </div>

                    <div className="grid-2">
                      <div>
                        <label style={styles.label}>Parent/Guardian Full Name (as Signature) *</label>
                        <input className={`reg-input${errors.guardianSignature ? " err" : ""}`} type="text"
                          placeholder="Full name" style={{ fontStyle: "italic" }}
                          value={form.guardianSignature} onChange={e => set("guardianSignature", e.target.value)} />
                        {errors.guardianSignature && <span style={styles.error}>{errors.guardianSignature}</span>}
                      </div>
                      <div>
                        <label style={styles.label}>Date *</label>
                        <input className={`reg-input${errors.signatureDate ? " err" : ""}`} type="date"
                          value={form.signatureDate} onChange={e => set("signatureDate", e.target.value)} />
                        {errors.signatureDate && <span style={styles.error}>{errors.signatureDate}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Navigation ────────────────────────────────────────── */}
              {!submitted && (
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginTop: "2rem", paddingTop: "1.25rem",
                  borderTop: "1px solid rgba(255,255,255,0.07)"
                }}>
                  <div>
                    {step > 1 && <button className="btn-outline" onClick={back}>← Back</button>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>
                      {step} / {STEPS.length}
                    </span>
                    {step < 4
                      ? <button className="btn-gold" onClick={next}>Continue →</button>
                      : <button className="btn-gold" onClick={handleSubmit}>Submit Registration ✓</button>
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── POPIA footer — matches the sidebar note in the screenshot */}
          <p style={{
            textAlign: "center", marginTop: "1rem",
            fontSize: "0.72rem", color: "rgba(255,255,255,0.22)"
          }}>
            POPIA: Handle data lawfully &amp; securely. · Sunday School Management Portal
          </p>
        </div>
      </div>
    </>
  );
}