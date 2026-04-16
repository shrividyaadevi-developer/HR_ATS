import { useState } from "react";
import { Btn } from "./UI";
import { auth as authApi } from "../services/api";

export default function UpdatePasswordModal({ user, onClose }) {
  const [current, setCurrent] = useState("");
  const [next,    setNext]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [err,     setErr]     = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showC,   setShowC]   = useState(false);
  const [showN,   setShowN]   = useState(false);
  const [showCo,  setShowCo]  = useState(false);

  const submit = async () => {
    setErr("");
    if (!current)              { setErr("Current password is required."); return; }
    if (next.length < 6)       { setErr("New password must be at least 6 characters."); return; }
    if (next === current)      { setErr("New password must differ from the current one."); return; }
    if (next !== confirm)      { setErr("Passwords do not match."); return; }
    setLoading(true);
    try {
      await authApi.changePassword({ current_password: current, new_password: next });
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (e) {
      setErr(e.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const EyeBtn = ({ show, onToggle }) => (
    <button type="button" onClick={onToggle}
      style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
        background:"none", border:"none", color:"var(--muted)", fontSize:15, cursor:"pointer", lineHeight:1 }}>
      {show ? "🙈" : "👁️"}
    </button>
  );

  const Field = ({ label, value, onChange, show, onToggleShow, placeholder }) => (
    <div>
      <label>{label}</label>
      <div style={{ position:"relative" }}>
        <input type={show?"text":"password"} value={value} onChange={e=>onChange(e.target.value)}
          placeholder={placeholder} style={{ paddingRight:36 }}
          onKeyDown={e=>e.key==="Enter"&&submit()}/>
        <EyeBtn show={show} onToggle={onToggleShow}/>
      </div>
    </div>
  );

  const roleColor = { admin:"var(--accent)", hr:"var(--accent2)", candidate:"#f59e0b" }[user.role] || "var(--accent)";

  const strength = next.length >= 10 && /[A-Z]/.test(next) && /[0-9]/.test(next) && /[^a-zA-Z0-9]/.test(next) ? 4
    : next.length >= 8 && /[A-Z]/.test(next) && /[0-9]/.test(next) ? 3
    : next.length >= 6 ? 2 : next.length > 0 ? 1 : 0;
  const strengthColors = ["","var(--accent3)","#f59e0b","var(--accent)","var(--accent2)"];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)",
        borderRadius:14, width:"100%", maxWidth:400, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,.5)" }}>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)",
          background:"var(--surface2)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:"50%",
              background:`linear-gradient(135deg,${roleColor},var(--accent2))`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"var(--fh)", fontWeight:800, fontSize:14, color:"#fff" }}>
              {user.name?.charAt(0) || "?"}
            </div>
            <div>
              <div style={{ fontFamily:"var(--fh)", fontWeight:700, fontSize:14, color:"var(--text)" }}>Update Password</div>
              <div style={{ fontSize:11, color:"var(--muted)" }}>{user.email}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--muted)", fontSize:19, cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ padding:24 }}>
          {success ? (
            <div style={{ textAlign:"center", padding:"16px 0" }}>
              <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
              <div style={{ fontFamily:"var(--fh)", fontWeight:700, fontSize:16, color:"var(--accent2)" }}>Password updated!</div>
              <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>Closing automatically…</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              <Field label="Current Password" value={current} onChange={setCurrent} show={showC} onToggleShow={()=>setShowC(v=>!v)} placeholder="Enter your current password"/>
              <Field label="New Password"     value={next}    onChange={setNext}    show={showN} onToggleShow={()=>setShowN(v=>!v)} placeholder="Min. 6 characters"/>
              {next.length > 0 && (
                <div style={{ display:"flex", gap:4 }}>
                  {[1,2,3,4].map(i=>(
                    <div key={i} style={{ flex:1, height:3, borderRadius:99,
                      background:i<=strength?strengthColors[strength]:"var(--border)", transition:"background .3s" }}/>
                  ))}
                </div>
              )}
              <Field label="Confirm New Password" value={confirm} onChange={setConfirm} show={showCo} onToggleShow={()=>setShowCo(v=>!v)} placeholder="Re-enter new password"/>
              {err && <div style={{ fontSize:12, color:"var(--accent3)", background:"rgba(247,111,111,.1)", border:"1px solid rgba(247,111,111,.2)", borderRadius:7, padding:"8px 12px" }}>{err}</div>}
              <div style={{ display:"flex", gap:9, marginTop:4 }}>
                <Btn onClick={submit} disabled={loading} style={{ flex:1, justifyContent:"center" }}>
                  {loading?"Updating…":"Update Password"}
                </Btn>
                <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
