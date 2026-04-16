import { useState, useRef, useEffect } from "react";

export function Badge({ color, children }) {
  const m = { green:"#10c9a0", red:"#f76f6f", yellow:"#f59e0b", blue:"#4f6ef7", gray:"#5c6680", purple:"#a78bfa" };
  const c = m[color] || m.gray;
  return (
    <span style={{ background:`${c}1a`, color:c, padding:"2px 10px", borderRadius:99,
      fontSize:11, fontWeight:700, border:`1px solid ${c}33`, whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}

export function Btn({ children, onClick, variant="primary", style={}, disabled=false }) {
  const v = {
    primary:{ background:"var(--accent)", color:"#fff", border:"none" },
    ghost:{ background:"transparent", border:"1.5px solid var(--border)", color:"var(--text)" },
    danger:{ background:"var(--accent3)", color:"#fff", border:"none" },
    success:{ background:"var(--accent2)", color:"#fff", border:"none" },
    soft:{ background:"rgba(79,110,247,.1)", color:"var(--accent)", border:"1px solid rgba(79,110,247,.2)" },
  };
  return (
    <button disabled={disabled} onClick={onClick}
      style={{ ...v[variant], padding:"8px 17px", borderRadius:8, fontSize:13, fontWeight:600,
        opacity:disabled ? .5 : 1, transition:"opacity .15s, transform .1s", ...style }}
      onMouseOver={e=>{ if(!disabled) e.currentTarget.style.opacity=".82"; }}
      onMouseOut={e=>e.currentTarget.style.opacity="1"}
      onMouseDown={e=>e.currentTarget.style.transform="scale(.97)"}
      onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
      {children}
    </button>
  );
}

export function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{ background:"var(--surface)", borderRadius:"var(--r)", padding:"20px 22px",
      border:"1px solid var(--border)", flex:1, minWidth:160, boxShadow:"var(--shadow)",
      position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0,
        background:`linear-gradient(135deg,${accent||"var(--accent)"}0d,transparent 60%)` }}/>
      <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ color:"var(--muted)", fontSize:10.5, fontWeight:700,
            letterSpacing:".09em", textTransform:"uppercase", marginBottom:9 }}>{label}</div>
          <div style={{ fontSize:32, fontWeight:800, fontFamily:"var(--fh)",
            color:"var(--text)", lineHeight:1 }}>{value}</div>
          {sub && <div style={{ fontSize:11, color:"var(--muted)", marginTop:6 }}>{sub}</div>}
        </div>
        {icon && <div style={{ fontSize:20, opacity:.4 }}>{icon}</div>}
      </div>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3,
        background:`linear-gradient(90deg,${accent||"var(--accent)"},transparent)` }}/>
    </div>
  );
}

export function PageTitle({ children }) {
  return (
    <h2 style={{ fontFamily:"var(--fh)", fontSize:20, fontWeight:700,
      marginBottom:22, color:"var(--text)", letterSpacing:"-.02em" }}>
      {children}
    </h2>
  );
}

export function ChartBox({ title, children }) {
  return (
    <div style={{ background:"var(--surface)", border:"1px solid var(--border)",
      borderRadius:"var(--r)", padding:"18px 16px 12px", flex:1, minWidth:270,
      boxShadow:"var(--shadow)" }}>
      <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)",
        marginBottom:14, letterSpacing:".07em", textTransform:"uppercase" }}>{title}</div>
      {children}
    </div>
  );
}

export function Panel({ children, style={} }) {
  return (
    <div style={{ background:"var(--surface)", borderRadius:"var(--r)",
      border:"1px solid var(--border)", boxShadow:"var(--shadow)",
      overflow:"hidden", ...style }}>
      {children}
    </div>
  );
}

export function PanelHead({ children }) {
  return (
    <div style={{ padding:"13px 18px", borderBottom:"1px solid var(--border)",
      fontSize:13, fontWeight:700, fontFamily:"var(--fh)", color:"var(--text)",
      background:"var(--surface2)" }}>
      {children}
    </div>
  );
}

export const tooltipStyle = {
  background:"var(--surface2)", border:"1px solid var(--border)",
  borderRadius:8, color:"var(--text)", fontSize:12
};

export function FormGrid({ children }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13 }}>
      {children}
    </div>
  );
}

export function DropdownMenu({ trigger, items, open, onToggle, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position:"relative", display:"inline-block" }}>
      <div onClick={onToggle}>{trigger}</div>
      {open && (
        <div style={{ position:"absolute", right:0, top:"calc(100% + 5px)",
          background:"var(--surface)", border:"1px solid var(--border)", borderRadius:9,
          zIndex:50, minWidth:100, boxShadow:"var(--shadow)", overflow:"hidden" }}>
          {items}
        </div>
      )}
    </div>
  );
}
