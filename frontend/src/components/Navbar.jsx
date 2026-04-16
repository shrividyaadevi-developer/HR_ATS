import { useState, useRef, useEffect } from "react";
import UpdatePasswordModal from "./UpdatePasswordModal";

export default function Navbar({ onToggle, user, onLogout, theme, onToggleTheme }) {
  const [open,    setOpen]    = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const rc = user.role==="admin" ? "var(--accent)" : "var(--accent2)";

  const menuItems = [

    { label:"Update Password",action: () => { setOpen(false); setShowPwd(true); } },
    { label:"Contact", action: () => setOpen(false) },
  ];

  return (
    <>
      <nav style={{ height:56, background:"var(--surface)", borderBottom:"1px solid var(--border)",
        display:"flex", alignItems:"center", padding:"0 16px", gap:10, position:"sticky", top:0, zIndex:100 }}>
        <button onClick={onToggle}
          style={{ background:"none", border:"none", color:"var(--muted)", fontSize:17,
            padding:"6px 8px", borderRadius:7, lineHeight:1, display:"flex", alignItems:"center" }}
          onMouseOver={e=>e.currentTarget.style.background="var(--surface2)"}
          onMouseOut={e=>e.currentTarget.style.background="none"}>☰</button>
        <span style={{ fontFamily:"var(--fh)", fontWeight:800, fontSize:17, letterSpacing:"-.02em", flex:1,
          background:"linear-gradient(135deg,var(--accent),var(--accent2))",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>VitaHR</span>
        <button onClick={onToggleTheme}
          style={{ background:"var(--surface2)", border:"1px solid var(--border)",
            borderRadius:8, padding:"5px 10px", fontSize:15, color:"var(--text)", lineHeight:1 }}>
          {theme==="dark"?"☀️":"🌙"}
        </button>
        <div ref={ref} style={{ position:"relative" }}>
          <button onClick={() => setOpen(v=>!v)}
            style={{ background:"none", border:"none", display:"flex", alignItems:"center",
              gap:9, padding:"4px 6px", borderRadius:9 }}
            onMouseOver={e=>e.currentTarget.style.background="var(--surface2)"}
            onMouseOut={e=>e.currentTarget.style.background="none"}>
            <div style={{ width:33, height:33, borderRadius:"50%", flexShrink:0,
              background:`linear-gradient(135deg,${rc},${user.role==="admin"?"var(--accent2)":"var(--accent)"})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"var(--fh)", fontWeight:800, fontSize:14, color:"#fff" }}>
              {user.name?.charAt(0)||"?"}
            </div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", lineHeight:1.2 }}>{user.name}</div>
              <div style={{ fontSize:10, color:rc, fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{user.role}</div>
            </div>
            <span style={{ color:"var(--muted)", fontSize:9 }}>{open?"▲":"▼"}</span>
          </button>
          {open && (
            <div style={{ position:"absolute", right:0, top:"calc(100% + 7px)",
              background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:10, minWidth:195, boxShadow:"var(--shadow)", zIndex:200, overflow:"hidden" }}>
              <div style={{ padding:"11px 15px", borderBottom:"1px solid var(--border)", background:"var(--surface2)" }}>
                <div style={{ fontSize:12.5, fontWeight:700, color:"var(--text)" }}>{user.name}</div>
                <div style={{ fontSize:10, color:rc, fontWeight:700, textTransform:"uppercase", letterSpacing:".07em", marginTop:2 }}>{user.role}</div>
                <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{user.email}</div>
              </div>
              {menuItems.map(item => (
                <button key={item.label} onClick={item.action}
                  style={{ display:"flex", alignItems:"center", gap:9, width:"100%",
                    padding:"10px 15px", background:"none", border:"none",
                    borderBottom:"1px solid var(--border)", color:"var(--text)",
                    textAlign:"left", fontSize:13, fontWeight:500, cursor:"pointer" }}
                  onMouseOver={e=>e.currentTarget.style.background="var(--surface2)"}
                  onMouseOut={e=>e.currentTarget.style.background="none"}>
                  <span style={{ fontSize:14 }}>{item.icon}</span>{item.label}
                </button>
              ))}
              <button onClick={() => { setOpen(false); onLogout(); }}
                style={{ display:"flex", alignItems:"center", gap:9, width:"100%",
                  padding:"10px 15px", background:"none", border:"none",
                  color:"var(--accent3)", textAlign:"left", fontSize:13, fontWeight:700, cursor:"pointer" }}
                onMouseOver={e=>e.currentTarget.style.background="rgba(247,111,111,.07)"}
                onMouseOut={e=>e.currentTarget.style.background="none"}>
                <span style={{ fontSize:14 }}></span> Logout
              </button>
            </div>
          )}
        </div>
      </nav>
      {showPwd && <UpdatePasswordModal user={user} onClose={()=>setShowPwd(false)}/>}
    </>
  );
}
