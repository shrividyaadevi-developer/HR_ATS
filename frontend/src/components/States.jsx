export function Spinner({ size = 32 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
      <div style={{
        width:size, height:size, borderRadius:"50%",
        border:"3px solid var(--border)",
        borderTopColor:"var(--accent)",
        animation:"spin .7s linear infinite",
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div style={{ background:"rgba(247,111,111,.08)", border:"1px solid rgba(247,111,111,.25)",
      borderRadius:10, padding:"18px 20px", color:"var(--accent3)",
      display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
      <div>
        <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>Error</div>
        <div style={{ fontSize:12, opacity:.85 }}>{message}</div>
      </div>
      {onRetry && (
        <button onClick={onRetry}
          style={{ background:"rgba(247,111,111,.15)", border:"1px solid rgba(247,111,111,.3)",
            color:"var(--accent3)", borderRadius:7, padding:"5px 12px",
            fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0 }}>
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon="📭", title, desc, action }) {
  return (
    <div style={{ textAlign:"center", padding:"48px 24px" }}>
      <div style={{ fontSize:38, marginBottom:12 }}>{icon}</div>
      <div style={{ fontFamily:"var(--fh)", fontWeight:700, fontSize:16,
        color:"var(--text)", marginBottom:6 }}>{title}</div>
      {desc && <div style={{ fontSize:13, color:"var(--muted)", marginBottom:18 }}>{desc}</div>}
      {action}
    </div>
  );
}
