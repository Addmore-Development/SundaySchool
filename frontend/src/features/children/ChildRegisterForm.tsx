// src/features/children/ChildRegisterForm.tsx
import { useState } from "react";
import { childStore } from "../../stores/ChildStore";

type FormData = {
  // Section 1 — Learner Personal Information
  firstName: string; lastName: string; gender: string;
  dateOfBirth: string; schoolName: string; grade: string; physicalAddress: string;
  // Section 2 — Learner Medical Information
  hasAllergies: string; allergiesDetails: string;
  hasMedicalCondition: string; medicalDetails: string;
  // Section 3 — Emergency Contact / Next of Kin
  contactFirstName: string; contactLastName: string;
  contactGender: string; contactDob: string;
  relationship: string; relationshipOther: string;
  employmentStatus: string;
  contactNumber: string;       // stored as 9 digits, displayed with +27
  altContactNumber: string;    // same
  atChurch: string;
  // Parent/Guardian ID
  parentIdNumber: string;
  // Section 4 — Parental Consent
  consentActivities: string; consentMedical: string;
  guardianSignature: string; signatureDate: string;
};

const EMPTY: FormData = {
  firstName:"",lastName:"",gender:"",dateOfBirth:"",schoolName:"",grade:"",physicalAddress:"",
  hasAllergies:"",allergiesDetails:"",hasMedicalCondition:"",medicalDetails:"",
  contactFirstName:"",contactLastName:"",contactGender:"",contactDob:"",
  relationship:"",relationshipOther:"",employmentStatus:"",
  contactNumber:"",altContactNumber:"",atChurch:"",
  parentIdNumber:"",
  consentActivities:"",consentMedical:"",guardianSignature:"",signatureDate:"",
};

const STEPS = [
  { id:1, label:"Learner Info", icon:"👤" },
  { id:2, label:"Medical",     icon:"🏥" },
  { id:3, label:"Contact",     icon:"📞" },
  { id:4, label:"Consent",     icon:"✍️" },
];

const GRADES = ["Grade R","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6",
  "Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12","Not in School"];
const RELS   = ["Mother","Father","Sister","Brother","Uncle","Aunt","Grandparent","Neighbor","Other"];
const EMP    = ["Employed (Full-time)","Employed (Part-time)","Self-employed","Unemployed","Student","Retired"];

const today = new Date().toISOString().split('T')[0];
const MIN_CHILD_DOB = "1990-01-01"; // oldest reasonable child dob

// ── Helpers ──────────────────────────────────────────────────────────────────
function isValidDate(v: string, minDate?: string, maxDate?: string): boolean {
  if (!v || v.length < 10) return false;
  const d = new Date(v);
  if (isNaN(d.getTime())) return false;
  if (minDate && d < new Date(minDate)) return false;
  if (maxDate && d > new Date(maxDate)) return false;
  return true;
}

function cleanPhone(v: string): string {
  // strip anything non-digit, limit to 9 (after +27)
  let d = v.replace(/[^0-9]/g, '');
  if (d.startsWith('0')) d = d.slice(1);
  if (d.startsWith('27')) d = d.slice(2);
  return d.slice(0, 9);
}

function isValidSAPhone(v: string): boolean {
  return /^[6-8][0-9]{8}$/.test(v);
}

function isValidSAId(v: string): boolean {
  return /^[0-9]{13}$/.test(v);
}

// ── Sub-components OUTSIDE main — prevents remount/focus loss ─────────────────
const BASE_INP: React.CSSProperties = {
  width:"100%", background:"rgba(0,0,0,0.3)",
  border:"1px solid rgba(255,255,255,0.12)", borderRadius:7,
  padding:"0.6rem 0.85rem", color:"#fff",
  fontFamily:"'DM Sans',sans-serif", fontSize:"0.875rem", outline:"none",
};
const ERR_INP: React.CSSProperties = { ...BASE_INP, border:"1px solid #9ca3af" };
function iSt(e?: string): React.CSSProperties { return e ? ERR_INP : BASE_INP; }
function sSt(hv: boolean, e?: string): React.CSSProperties {
  return { ...BASE_INP, background:"#0a2e12", color: hv?"#fff":"rgba(255,255,255,0.35)",
    border:`1px solid ${e?"#9ca3af":"rgba(255,255,255,0.12)"}` };
}

const PHONE_ROW_CSS = `
  .ph-row { display:flex; border-radius:7px; overflow:hidden; border:1px solid rgba(255,255,255,0.12); }
  .ph-row.err { border-color:#9ca3af; }
  .ph-pfx { background:rgba(240,192,0,0.1); border-right:1px solid rgba(255,255,255,0.12); padding:0 0.75rem; display:flex; align-items:center; font-size:0.875rem; font-weight:700; color:#f0c000; white-space:nowrap; flex-shrink:0; }
  .ph-inp { flex:1; background:rgba(0,0,0,0.3); border:none; padding:0.6rem 0.85rem; color:#fff; font-family:'DM Sans',sans-serif; font-size:0.875rem; outline:none; }
`;

function Divider({ t }: { t: string }) {
  return (
    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.05rem", letterSpacing:"1.5px",
      color:"#f0c000", borderBottom:"2px solid rgba(240,192,0,0.2)",
      paddingBottom:"0.45rem", marginBottom:"1.25rem" }}>{t}</div>
  );
}

function FW({ label, req, err, hint, children }: {
  label: string; req?: boolean; err?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom:"1rem" }}>
      {label && (
        <label style={{ display:"block", fontSize:"0.72rem", fontWeight:700,
          color:"rgba(255,255,255,0.5)", textTransform:"uppercase" as const,
          letterSpacing:"0.5px", marginBottom:"0.4rem" }}>
          {label}{req && <span style={{ color:"#f0c000", marginLeft:2 }}>*</span>}
        </label>
      )}
      {children}
      {err  && <span style={{ display:"block", fontSize:"0.7rem", color:"#9ca3af", marginTop:"0.3rem" }}>⚠ {err}</span>}
      {!err && hint && <span style={{ display:"block", fontSize:"0.65rem", color:"rgba(255,255,255,0.25)", marginTop:"0.25rem" }}>{hint}</span>}
    </div>
  );
}

function CBRow({ opts, val, set }: { opts:{value:string;label:string}[]; val:string; set:(v:string)=>void }) {
  return (
    <div style={{ display:"flex", gap:"1.5rem", flexWrap:"wrap", marginTop:"0.2rem" }}>
      {opts.map(o => (
        <label key={o.value} onClick={() => set(o.value)}
          style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer",
            fontSize:"0.875rem", color:"rgba(255,255,255,0.8)", userSelect:"none" as const }}>
          <div style={{ width:17, height:17, borderRadius:3, flexShrink:0,
            border:`2px solid ${val===o.value?"#f0c000":"rgba(255,255,255,0.3)"}`,
            background:val===o.value?"#f0c000":"transparent",
            display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
            {val===o.value && <span style={{ color:"#0a2e12", fontSize:"0.65rem", fontWeight:900 }}>✓</span>}
          </div>
          {o.label}
        </label>
      ))}
    </div>
  );
}

function RelGrid({ val, set }: { val:string; set:(v:string)=>void }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:"0.55rem 1.25rem", marginTop:"0.3rem" }}>
      {RELS.map(r => (
        <label key={r} onClick={() => set(r)}
          style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer",
            fontSize:"0.85rem", color:"rgba(255,255,255,0.8)", userSelect:"none" as const, minWidth:"120px" }}>
          <div style={{ width:17, height:17, borderRadius:3, flexShrink:0,
            border:`2px solid ${val===r?"#f0c000":"rgba(255,255,255,0.3)"}`,
            background:val===r?"#f0c000":"transparent",
            display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
            {val===r && <span style={{ color:"#0a2e12", fontSize:"0.65rem", fontWeight:900 }}>✓</span>}
          </div>
          {r}
        </label>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props { onBack?: () => void; onSuccess?: () => void; }

export default function ChildRegisterForm({ onBack, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [done, setDone] = useState(false);
  const [errs, setErrs] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (f: keyof FormData, v: string) => {
    setForm(p => ({ ...p, [f]: v }));
    setErrs(p => ({ ...p, [f]: "" }));
  };

  const setPhone = (f: keyof FormData, v: string) => set(f, cleanPhone(v));

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!form.firstName.trim())  e.firstName       = "First name is required";
      if (!form.lastName.trim())   e.lastName        = "Last name is required";
      if (!form.gender)            e.gender          = "Please select a gender";
      if (!form.dateOfBirth)       e.dateOfBirth     = "Date of birth is required";
      else if (!isValidDate(form.dateOfBirth, MIN_CHILD_DOB, today))
                                   e.dateOfBirth     = "Enter a valid date of birth";
      if (!form.schoolName.trim()) e.schoolName      = "School / institution name is required";
      if (!form.grade)             e.grade           = "Grade is required";
      if (!form.physicalAddress.trim()) e.physicalAddress = "Physical address is required";
    }

    if (step === 2) {
      if (!form.hasAllergies)        e.hasAllergies        = "Please answer";
      if (!form.hasMedicalCondition) e.hasMedicalCondition = "Please answer";
    }

    if (step === 3) {
      if (!form.contactFirstName.trim()) e.contactFirstName = "First name required";
      if (!form.contactLastName.trim())  e.contactLastName  = "Last name required";
      if (!form.relationship)            e.relationship     = "Relationship required";
      if (!form.contactNumber)           e.contactNumber    = "Contact number required";
      else if (!isValidSAPhone(form.contactNumber))
                                         e.contactNumber    = "Enter 9 valid digits after +27";
      if (form.altContactNumber && !isValidSAPhone(form.altContactNumber))
                                         e.altContactNumber = "Enter 9 valid digits after +27";
      if (!form.parentIdNumber.trim())   e.parentIdNumber   = "Parent/Guardian ID number is required";
      else if (!isValidSAId(form.parentIdNumber))
                                         e.parentIdNumber   = "Must be a 13-digit SA ID number";
    }

    if (step === 4) {
      if (!form.consentActivities) e.consentActivities = "Please answer";
      if (!form.consentMedical)    e.consentMedical    = "Please answer";
      if (!form.guardianSignature.trim()) e.guardianSignature = "Signature required";
      if (!form.signatureDate)     e.signatureDate     = "Date required";
      else if (!isValidDate(form.signatureDate, "2020-01-01", today))
                                   e.signatureDate     = "Enter a valid date";
    }

    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const next   = () => { if (validate()) setStep(s => Math.min(s + 1, 4)); };
  const prev   = () => setStep(s => Math.max(s - 1, 1));
  const submit = () => {
    if (!validate()) return;
    childStore.add({ ...form, registeredBy: 'Admin' });
    setDone(true);
  };
  const reset  = () => { setForm(EMPTY); setStep(1); setDone(false); setErrs({}); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        ${PHONE_ROW_CSS}
        .crf{width:100%;min-height:100%;background:#0a2e12;font-family:'DM Sans',sans-serif;color:#fff;display:flex;flex-direction:column;}
        .crf-top{display:flex;align-items:center;gap:1rem;padding:0.85rem 2rem;background:#081e0b;border-bottom:1px solid rgba(240,192,0,0.15);flex-shrink:0;}
        .crf-top-title{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:2px;color:#fff;}
        .crf-top-sub{font-size:0.72rem;color:rgba(255,255,255,0.35);margin-top:1px;}
        .crf-back{margin-left:auto;background:none;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.5);border-radius:7px;padding:0.4rem 1.1rem;font-family:'DM Sans',sans-serif;font-size:0.8rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.15s;}
        .crf-back:hover{border-color:rgba(255,255,255,0.4);color:#fff;}
        .crf-scroll{flex:1;padding:2rem 2.5rem;overflow-y:auto;}
        .crf-card{max-width:820px;margin:0 auto;background:#0f3d1a;border:1px solid rgba(240,192,0,0.18);border-radius:14px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.45);}
        .crf-hd{background:linear-gradient(135deg,#0d3318,#0a2e12);border-bottom:2px solid rgba(240,192,0,0.22);padding:1.25rem 1.75rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;}
        .crf-hd-title{font-family:'Bebas Neue',sans-serif;font-size:1.65rem;letter-spacing:2px;color:#fff;line-height:1.1;}
        .crf-hd-sub{font-size:0.75rem;color:rgba(255,255,255,0.38);margin-top:3px;}
        .crf-badge{background:rgba(240,192,0,0.1);border:1px solid rgba(240,192,0,0.3);color:#f0c000;font-size:0.72rem;font-weight:700;padding:0.3rem 0.85rem;border-radius:20px;letter-spacing:0.5px;white-space:nowrap;flex-shrink:0;}
        .crf-steps{display:flex;align-items:center;padding:0.85rem 1.75rem;background:rgba(0,0,0,0.18);border-bottom:1px solid rgba(255,255,255,0.05);}
        .crf-si{display:flex;align-items:center;flex:1;}
        .crf-bubble{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;flex-shrink:0;transition:all 0.3s;border:2px solid transparent;}
        .crf-bubble.act{background:#f0c000;color:#0a2e12;box-shadow:0 0 12px rgba(240,192,0,0.45);}
        .crf-bubble.done{background:transparent;border-color:#f0c000;color:#f0c000;}
        .crf-bubble.pend{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.2);}
        .crf-slbl{font-size:0.6rem;font-weight:600;text-align:center;margin-top:2px;letter-spacing:0.3px;}
        .crf-line{flex:1;height:2px;margin:0 4px;margin-bottom:14px;border-radius:1px;transition:background 0.4s;}
        .crf-line.done{background:#f0c000;}.crf-line.pend{background:rgba(255,255,255,0.08);}
        .crf-body{padding:1.75rem 2rem 2rem;}
        .crf-g2{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
        .crf-g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;}
        .crf-info{background:rgba(240,192,0,0.06);border:1px solid rgba(240,192,0,0.18);border-radius:9px;padding:0.8rem 1rem;font-size:0.8rem;color:rgba(255,255,255,0.55);display:flex;gap:0.7rem;margin-bottom:1.25rem;line-height:1.6;}
        .crf-cb{background:rgba(0,0,0,0.18);border:1px solid rgba(255,255,255,0.07);border-radius:9px;padding:1rem 1.2rem;margin-bottom:0.8rem;}
        .crf-cq{font-size:0.875rem;color:rgba(255,255,255,0.82);font-weight:500;margin-bottom:0.65rem;line-height:1.55;}
        .crf-sig{background:rgba(0,0,0,0.15);border:1px solid rgba(255,255,255,0.07);border-radius:9px;padding:1rem 1.2rem;margin-top:0.5rem;}
        .crf-ft{display:flex;justify-content:space-between;align-items:center;margin-top:1.75rem;padding-top:1.25rem;border-top:1px solid rgba(255,255,255,0.07);}
        .crf-hr{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:1.1rem 0;}
        .btn-gold{background:#f0c000;color:#0a2e12;border:none;padding:0.62rem 1.65rem;border-radius:7px;font-size:0.875rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .btn-gold:hover{background:#ffd200;transform:translateY(-1px);box-shadow:0 6px 16px rgba(240,192,0,0.3);}
        .btn-out{background:transparent;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.15);padding:0.62rem 1.4rem;border-radius:7px;font-size:0.875rem;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .btn-out:hover{border-color:rgba(255,255,255,0.35);color:#fff;}
        .fade-in{animation:fadeIn 0.2s ease;}
        @keyframes fadeIn{from{opacity:0;transform:translateX(6px);}to{opacity:1;transform:translateX(0);}}
        @keyframes popIn{from{transform:scale(0.5);opacity:0;}to{transform:scale(1);opacity:1;}}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.5) sepia(1) saturate(3);opacity:0.45;}
        select option{background:#0a2e12;color:#fff;}
        @media(max-width:640px){.crf-g2,.crf-g3{grid-template-columns:1fr;}.crf-scroll{padding:1.25rem;}.crf-body{padding:1.25rem;}.crf-top{padding:0.75rem 1.25rem;}.crf-hd{flex-direction:column;align-items:flex-start;}}
      `}</style>

      <div className="crf">
        {/* Top bar */}
        <div className="crf-top">
          <div>
            <div className="crf-top-title">📋 Register a Child</div>
            <div className="crf-top-sub">Sunday School Management Portal · Child Registration</div>
          </div>
          {onBack && <button className="crf-back" onClick={onBack}>← Back to Dashboard</button>}
        </div>

        <div className="crf-scroll">
          <div className="crf-card">
            {/* Card header */}
            <div className="crf-hd">
              <div>
                <div className="crf-hd-title">Sunday School Registration Form</div>
                <div className="crf-hd-sub">Complete all four sections · Fields marked * are required</div>
              </div>
              {!done && <div className="crf-badge">STEP {step} OF 4</div>}
            </div>

            {/* Step indicators */}
            {!done && (
              <div className="crf-steps">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="crf-si">
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                      <div className={`crf-bubble ${step===s.id?"act":step>s.id?"done":"pend"}`}>
                        {step > s.id ? "✓" : s.icon}
                      </div>
                      <span className="crf-slbl" style={{ color:step===s.id?"#f0c000":step>s.id?"rgba(240,192,0,0.55)":"rgba(255,255,255,0.2)" }}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && <div className={`crf-line ${step>s.id?"done":"pend"}`} />}
                  </div>
                ))}
              </div>
            )}

            <div className="crf-body">

              {/* ── SUCCESS ── */}
              {done && (
                <div style={{ textAlign:"center", padding:"2rem 0" }}>
                  <div style={{ width:64, height:64, background:"#f0c000", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.8rem", margin:"0 auto 1rem", animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)", boxShadow:"0 0 24px rgba(240,192,0,0.4)", color:"#0a2e12", fontWeight:900 }}>✓</div>
                  <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.7rem", color:"#f0c000", letterSpacing:1 }}>Registration Saved!</h2>
                  <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.875rem", maxWidth:360, margin:"0.65rem auto 1.25rem", lineHeight:1.6 }}>
                    <strong style={{ color:"#fff" }}>{form.firstName} {form.lastName}</strong> has been added to the children dashboard and will appear marked as <strong style={{ color:"#f0c000" }}>NEW</strong>.
                  </p>
                  <div style={{ background:"rgba(0,0,0,0.2)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"1rem 1.5rem", maxWidth:420, margin:"0 auto 1.5rem", textAlign:"left" }}>
                    {[
                      ["Full Name", `${form.firstName} ${form.lastName}`],
                      ["Grade", form.grade],
                      ["School", form.schoolName],
                      ["Date of Birth", form.dateOfBirth],
                      ["Emergency Contact", `${form.contactFirstName} ${form.contactLastName} (${form.relationship})`],
                      ["Contact Number", `+27${form.contactNumber}`],
                      ["Activities Consent", form.consentActivities],
                      ["Medical Consent", form.consentMedical],
                    ].map(([l, v]) => (
                      <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"0.38rem 0", borderBottom:"1px solid rgba(255,255,255,0.05)", fontSize:"0.82rem" }}>
                        <span style={{ color:"rgba(255,255,255,0.38)" }}>{l}</span>
                        <span style={{ color:"#fff", fontWeight:600, textAlign:"right", maxWidth:"60%" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:"1rem", justifyContent:"center" }}>
                    <button className="btn-gold" onClick={reset}>Register Another Child</button>
                    {onBack && <button className="btn-out" onClick={() => { onSuccess?.(); onBack(); }}>← Back to Dashboard</button>}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════
                  STEP 1 — Learner Personal Information
              ══════════════════════════════════════ */}
              {!done && step === 1 && (
                <div className="fade-in">
                  <Divider t="Learner Personal Information" />

                  <div className="crf-g2">
                    <FW label="First Name" req err={errs.firstName}>
                      <input style={iSt(errs.firstName)} type="text" placeholder="e.g. Amara"
                        value={form.firstName} onChange={e => set("firstName", e.target.value)} />
                    </FW>
                    <FW label="Last Name" req err={errs.lastName}>
                      <input style={iSt(errs.lastName)} type="text" placeholder="e.g. Dlamini"
                        value={form.lastName} onChange={e => set("lastName", e.target.value)} />
                    </FW>
                  </div>

                  <FW label="Gender" req err={errs.gender}>
                    <CBRow
                      opts={[{value:"Male",label:"Male"},{value:"Female",label:"Female"},{value:"Other",label:"Other"}]}
                      val={form.gender} set={v => set("gender", v)} />
                  </FW>

                  <div className="crf-g2">
                    <FW label="Date of Birth" req err={errs.dateOfBirth} hint="Must be a valid date (yyyy-mm-dd)">
                      <input style={iSt(errs.dateOfBirth)} type="date"
                        value={form.dateOfBirth} min="1990-01-01" max={today}
                        onChange={e => set("dateOfBirth", e.target.value)} />
                    </FW>
                    <FW label="Grade" req err={errs.grade}>
                      <select style={sSt(!!form.grade, errs.grade)} value={form.grade}
                        onChange={e => set("grade", e.target.value)}>
                        <option value="">Select grade…</option>
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </FW>
                  </div>

                  <FW label="School / Institution Name" req err={errs.schoolName}>
                    <input style={iSt(errs.schoolName)} type="text" placeholder="Name of school attended"
                      value={form.schoolName} onChange={e => set("schoolName", e.target.value)} />
                  </FW>

                  <FW label="Physical Address" req err={errs.physicalAddress}>
                    <textarea rows={3} value={form.physicalAddress}
                      onChange={e => set("physicalAddress", e.target.value)}
                      placeholder="Street address, suburb, city…"
                      style={{ ...iSt(errs.physicalAddress), resize:"vertical" as const }} />
                  </FW>
                </div>
              )}

              {/* ══════════════════════════════════════
                  STEP 2 — Learner Medical Information
              ══════════════════════════════════════ */}
              {!done && step === 2 && (
                <div className="fade-in">
                  <Divider t="Learner Medical Information" />
                  <div className="crf-info">
                    <span>ℹ️</span>
                    <span>Stored securely under <strong style={{ color:"#f0c000" }}>POPIA</strong>. Used only for the child's safety.</span>
                  </div>

                  <FW label="Does the learner have any allergies?" req err={errs.hasAllergies}>
                    <CBRow opts={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]}
                      val={form.hasAllergies} set={v => set("hasAllergies", v)} />
                  </FW>
                  {form.hasAllergies === "Yes" && (
                    <FW label="If yes, please specify:">
                      <textarea rows={2} value={form.allergiesDetails}
                        onChange={e => set("allergiesDetails", e.target.value)}
                        placeholder="e.g. Peanuts, dairy, bee stings…"
                        style={{ ...iSt(), resize:"vertical" as const }} />
                    </FW>
                  )}

                  <hr className="crf-hr" />

                  <FW label="Does the learner have any medical condition(s)?" req err={errs.hasMedicalCondition}>
                    <CBRow opts={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]}
                      val={form.hasMedicalCondition} set={v => set("hasMedicalCondition", v)} />
                  </FW>
                  {form.hasMedicalCondition === "Yes" && (
                    <FW label="If yes, please specify:">
                      <textarea rows={2} value={form.medicalDetails}
                        onChange={e => set("medicalDetails", e.target.value)}
                        placeholder="e.g. Asthma, epilepsy, diabetes…"
                        style={{ ...iSt(), resize:"vertical" as const }} />
                    </FW>
                  )}
                </div>
              )}

              {/* ══════════════════════════════════════
                  STEP 3 — Emergency Contact / Next of Kin
              ══════════════════════════════════════ */}
              {!done && step === 3 && (
                <div className="fade-in">
                  <Divider t="Emergency Contact / Next of Kin Information" />

                  <div className="crf-g2">
                    <FW label="First Name" req err={errs.contactFirstName}>
                      <input style={iSt(errs.contactFirstName)} type="text" placeholder="Contact's first name"
                        value={form.contactFirstName} onChange={e => set("contactFirstName", e.target.value)} />
                    </FW>
                    <FW label="Last Name" req err={errs.contactLastName}>
                      <input style={iSt(errs.contactLastName)} type="text" placeholder="Contact's last name"
                        value={form.contactLastName} onChange={e => set("contactLastName", e.target.value)} />
                    </FW>
                  </div>

                  <div className="crf-g2">
                    <FW label="Gender">
                      <CBRow opts={[{value:"Male",label:"Male"},{value:"Female",label:"Female"},{value:"Other",label:"Other"}]}
                        val={form.contactGender} set={v => set("contactGender", v)} />
                    </FW>
                    <FW label="Date of Birth" hint="Must be a valid date">
                      <input style={iSt()} type="date" value={form.contactDob} max={today}
                        onChange={e => set("contactDob", e.target.value)} />
                    </FW>
                  </div>

                  <FW label="Relationship to Learner (please mark with an X)" req err={errs.relationship}>
                    <RelGrid val={form.relationship} set={v => set("relationship", v)} />
                    {form.relationship === "Other" && (
                      <div style={{ marginTop:"0.6rem" }}>
                        <input style={iSt()} type="text" placeholder="Please specify…"
                          value={form.relationshipOther} onChange={e => set("relationshipOther", e.target.value)} />
                      </div>
                    )}
                  </FW>

                  <FW label="Employment Status">
                    <select style={sSt(!!form.employmentStatus)} value={form.employmentStatus}
                      onChange={e => set("employmentStatus", e.target.value)}>
                      <option value="">Select employment status…</option>
                      {EMP.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </FW>

                  <div className="crf-g2">
                    <FW label="Contact Number" req err={errs.contactNumber} hint="9 digits after +27">
                      <div className={`ph-row${errs.contactNumber ? " err" : ""}`}>
                        <span className="ph-pfx">+27</span>
                        <input className="ph-inp" type="tel" placeholder="821234567"
                          value={form.contactNumber} maxLength={9}
                          onChange={e => setPhone("contactNumber", e.target.value)} />
                      </div>
                    </FW>
                    <FW label="Alternative Contact Number" err={errs.altContactNumber} hint="9 digits after +27 (optional)">
                      <div className={`ph-row${errs.altContactNumber ? " err" : ""}`}>
                        <span className="ph-pfx">+27</span>
                        <input className="ph-inp" type="tel" placeholder="821234567"
                          value={form.altContactNumber} maxLength={9}
                          onChange={e => setPhone("altContactNumber", e.target.value)} />
                      </div>
                    </FW>
                  </div>

                  <FW label="Will you be at church during the Sunday school session?">
                    <CBRow opts={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]}
                      val={form.atChurch} set={v => set("atChurch", v)} />
                  </FW>

                  <hr className="crf-hr" />

                  <FW label="Parent / Guardian SA ID Number" req err={errs.parentIdNumber} hint="13-digit South African ID number">
                    <input style={iSt(errs.parentIdNumber)} type="text" placeholder="e.g. 8001015009087"
                      maxLength={13}
                      value={form.parentIdNumber}
                      onChange={e => set("parentIdNumber", e.target.value.replace(/\D/g, '').slice(0, 13))} />
                  </FW>
                </div>
              )}

              {/* ══════════════════════════════════════
                  STEP 4 — Parental Consent and Permission
              ══════════════════════════════════════ */}
              {!done && step === 4 && (
                <div className="fade-in">
                  <Divider t="Parental Consent and Permission" />
                  <div className="crf-info">
                    <span>🔒</span>
                    <span>Informed consent in compliance with <strong style={{ color:"#f0c000" }}>POPIA</strong>.</span>
                  </div>

                  <div className="crf-cb">
                    <p className="crf-cq">I give permission for the learner to participate in Sunday school activities.</p>
                    <FW label="" req err={errs.consentActivities}>
                      <CBRow opts={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]}
                        val={form.consentActivities} set={v => set("consentActivities", v)} />
                    </FW>
                  </div>

                  <div className="crf-cb">
                    <p className="crf-cq">I authorize medical treatment in case of an emergency if I am unavailable.</p>
                    <FW label="" req err={errs.consentMedical}>
                      <CBRow opts={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]}
                        val={form.consentMedical} set={v => set("consentMedical", v)} />
                    </FW>
                  </div>

                  <div className="crf-sig">
                    <p style={{ fontSize:"0.77rem", color:"rgba(255,255,255,0.35)", marginBottom:"0.9rem", fontStyle:"italic", lineHeight:1.6 }}>
                      By entering your name below you confirm all information is accurate and consent is given on behalf of the learner.
                    </p>
                    <div className="crf-g2">
                      <FW label="Parent/Guardian Signature (Full Name)" req err={errs.guardianSignature}>
                        <input style={{ ...iSt(errs.guardianSignature), fontStyle:"italic" }}
                          type="text" placeholder="Type full name as signature"
                          value={form.guardianSignature} onChange={e => set("guardianSignature", e.target.value)} />
                      </FW>
                      <FW label="Date" req err={errs.signatureDate} hint="Must be a valid date">
                        <input style={iSt(errs.signatureDate)} type="date"
                          value={form.signatureDate} min="2020-01-01" max={today}
                          onChange={e => set("signatureDate", e.target.value)} />
                      </FW>
                    </div>
                  </div>
                </div>
              )}

              {/* Nav */}
              {!done && (
                <div className="crf-ft">
                  <div>{step > 1 && <button className="btn-out" onClick={prev}>← Back</button>}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
                    <span style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.22)", fontWeight:600 }}>{step} / {STEPS.length}</span>
                    {step < 4
                      ? <button className="btn-gold" onClick={next}>Continue →</button>
                      : <button className="btn-gold" onClick={submit}>Submit Registration ✓</button>}
                  </div>
                </div>
              )}

            </div>
          </div>
          <p style={{ textAlign:"center", marginTop:"1.25rem", marginBottom:"1rem", fontSize:"0.7rem", color:"rgba(255,255,255,0.18)" }}>
            POPIA: Handle data lawfully &amp; securely · Sunday School Management Portal
          </p>
        </div>
      </div>
    </>
  );
}