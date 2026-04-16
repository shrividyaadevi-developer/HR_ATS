import { useState, useRef, useEffect } from "react";
import { DARK, LIGHT, makeCSS } from "./theme";
import { DEMO_USERS } from "./data/mockData";

import Navbar                from "./components/Navbar";
import Sidebar               from "./components/Sidebar";
import UpdatePasswordModal   from "./components/UpdatePasswordModal";
import LoginPage             from "./pages/LoginPage";
import RegisterPage          from "./pages/RegisterPage";
import DashboardPage         from "./pages/DashboardPage";
import JobsPage              from "./pages/JobsPage";
import CandidatesPage        from "./pages/CandidatesPage";
import InterviewsPage        from "./pages/InterviewsPage";
import InsightsPage          from "./pages/InsightsPage";
import ManageHRPage          from "./pages/ManageHRPage";
import CandidatePortalPage   from "./pages/CandidatePortalPage";

/* ── Candidate navbar with full dropdown ─────────────────── */
function CandidateNavbar({ user, onLogout, theme, onToggleTheme, usersRef }) {
  const [open,    setOpen]    = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const menuItems = [
    { label:"Update Password", icon:"🔑", action: () => { setOpen(false); setShowPwd(true); } },
    { label:"Contact",         icon:"✉️", action: () => setOpen(false) },
  ];

  return (
    <>
      <nav style={{ height:56, background:"var(--surface)",
        borderBottom:"1px solid var(--border)",
        display:"flex", alignItems:"center", padding:"0 20px", gap:12,
        position:"sticky", top:0, zIndex:100 }}>

        <span style={{ fontFamily:"var(--fh)", fontWeight:800, fontSize:17,
          background:"linear-gradient(135deg,var(--accent),var(--accent2))",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", flex:1 }}>
          VitaHR
        </span>

        <button onClick={onToggleTheme}
          style={{ background:"var(--surface2)", border:"1px solid var(--border)",
            borderRadius:8, padding:"5px 10px", fontSize:15, lineHeight:1 }}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <div ref={ref} style={{ position:"relative" }}>
          <button onClick={() => setOpen(v => !v)}
            style={{ background:"none", border:"none", display:"flex", alignItems:"center",
              gap:9, padding:"4px 6px", borderRadius:9, cursor:"pointer" }}
            onMouseOver={e=>e.currentTarget.style.background="var(--surface2)"}
            onMouseOut={e=>e.currentTarget.style.background="none"}>
            <div style={{ width:33, height:33, borderRadius:"50%",
              background:"linear-gradient(135deg,#f59e0b,#f76f6f)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"var(--fh)", fontWeight:800, fontSize:14, color:"#fff" }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", lineHeight:1.2 }}>
                {user.name}
              </div>
              <div style={{ fontSize:10, color:"#f59e0b", fontWeight:700,
                letterSpacing:".07em", textTransform:"uppercase" }}>Candidate</div>
            </div>
            <span style={{ color:"var(--muted)", fontSize:9 }}>{open ? "▲" : "▼"}</span>
          </button>

          {open && (
            <div style={{ position:"absolute", right:0, top:"calc(100% + 7px)",
              background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:10, minWidth:195, boxShadow:"var(--shadow)", zIndex:200, overflow:"hidden" }}>
              <div style={{ padding:"11px 15px", borderBottom:"1px solid var(--border)",
                background:"var(--surface2)" }}>
                <div style={{ fontSize:12.5, fontWeight:700, color:"var(--text)" }}>{user.name}</div>
                <div style={{ fontSize:10, color:"#f59e0b", fontWeight:700,
                  textTransform:"uppercase", letterSpacing:".07em", marginTop:2 }}>Candidate</div>
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
                  <span style={{ fontSize:14 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <button onClick={() => { setOpen(false); onLogout(); }}
                style={{ display:"flex", alignItems:"center", gap:9, width:"100%",
                  padding:"10px 15px", background:"none", border:"none",
                  color:"var(--accent3)", textAlign:"left", fontSize:13, fontWeight:700, cursor:"pointer" }}
                onMouseOver={e=>e.currentTarget.style.background="rgba(247,111,111,.07)"}
                onMouseOut={e=>e.currentTarget.style.background="none"}>
                <span style={{ fontSize:14 }}>🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {showPwd && (
        <UpdatePasswordModal user={user} usersRef={usersRef} onClose={() => setShowPwd(false)}/>
      )}
    </>
  );
}

/* ── Root App ────────────────────────────────────────────── */
export default function App() {
  const [theme,      setTheme]      = useState("dark");
  const [user,       setUser]       = useState(null);
  const [authScreen, setAuthScreen] = useState("login");
  const [sideOpen,   setSideOpen]   = useState(true);
  const [page,       setPage]       = useState("dashboard");

  const usersRef = useRef([...DEMO_USERS]);
  const t = theme === "dark" ? DARK : LIGHT;

  const handleLogin    = (u) => { setUser(u); setPage("dashboard"); };
  const handleRegister = (u) => { setUser(u); setPage("dashboard"); };
  const handleLogout   = ()  => { setUser(null); setAuthScreen("login"); setPage("dashboard"); };
  const toggleTheme    = ()  => setTheme(v => v === "dark" ? "light" : "dark");

  const safePage = (user?.role === "hr" && page === "manage-hr") ? "dashboard" : page;

  const renderAdminHRPage = () => {
    switch (safePage) {
      case "dashboard":   return <DashboardPage />;
      case "jobs":        return <JobsPage />;
      case "candidates":  return <CandidatesPage />;
      case "interviews":  return <InterviewsPage />;
      case "insights":    return <InsightsPage />;
      case "manage-hr":   return <ManageHRPage />;
      default:            return <DashboardPage />;
    }
  };

  return (
    <>
      <style>{makeCSS(t)}</style>

      {!user && authScreen === "login" && (
        <LoginPage usersRef={usersRef} onLogin={handleLogin}
          onGoRegister={() => setAuthScreen("register")}/>
      )}
      {!user && authScreen === "register" && (
        <RegisterPage usersRef={usersRef} onRegister={handleRegister}
          onGoLogin={() => setAuthScreen("login")}/>
      )}

      {user?.role === "candidate" && (
        <div style={{ display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>
          <CandidateNavbar
            user={user} usersRef={usersRef}
            onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme}/>
          <main style={{ flex:1, overflowY:"auto", padding:26, background:"var(--bg)" }}>
            <CandidatePortalPage user={user}/>
          </main>
        </div>
      )}

      {(user?.role === "admin" || user?.role === "hr") && (
        <div style={{ display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>
          <Navbar
            onToggle={() => setSideOpen(v => !v)}
            user={user} usersRef={usersRef}
            onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme}/>
          <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
            <Sidebar open={sideOpen} active={safePage} onNav={setPage} role={user.role}/>
            <main style={{ flex:1, overflowY:"auto", padding:26, background:"var(--bg)" }}>
              {renderAdminHRPage()}
            </main>
          </div>
        </div>
      )}
    </>
  );
}
