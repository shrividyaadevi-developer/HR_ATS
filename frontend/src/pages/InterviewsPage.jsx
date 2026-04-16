import { useState, useEffect } from "react";
import { interviews as interviewsAPI, candidates as candidatesAPI } from "../services/api";
import { Btn, PageTitle, Panel, PanelHead } from "../components/UI";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

/* ── Calendar Component ────────────────────────────────────── */
function Calendar({ cal, onPrev, onNext, interviewDates }) {
  const firstDay = new Date(cal.year, cal.month, 1).getDay();
  const daysInMonth = new Date(cal.year, cal.month + 1, 0).getDate();
  const today = new Date();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <Panel style={{ padding: 18, minWidth: 282, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={onPrev} style={calBtnStyle}>‹</button>
        <span style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 13 }}>
          {MONTH_NAMES[cal.month]} {cal.year}
        </span>
        <button onClick={onNext} style={calBtnStyle}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 5 }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const ds = `${cal.year}-${String(cal.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const hasInt = interviewDates.has(ds);
          const isToday = cal.year === today.getFullYear() && cal.month === today.getMonth() && d === today.getDate();
          return (
            <div key={d} style={{
              textAlign: "center", padding: "5px 0", borderRadius: 6, fontSize: 12, position: "relative",
              fontWeight: isToday ? 800 : hasInt ? 600 : 400,
              background: isToday ? "var(--accent)" : hasInt ? "rgba(79,110,247,.12)" : "transparent",
              color: isToday ? "#fff" : hasInt ? "var(--accent)" : "var(--text)",
              border: (hasInt && !isToday) ? "1.5px solid rgba(79,110,247,.22)" : "1.5px solid transparent",
            }}>
              {d}
              {hasInt && !isToday && (
                <span style={{
                  position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)",
                  width: 3, height: 3, background: "var(--accent)", borderRadius: "50%", display: "block"
                }} />
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

const calBtnStyle = { width: 28, height: 28, borderRadius: 6, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, cursor: "pointer" };

/* ── Reschedule Modal ──────────────────────────────────────── */
function RescheduleModal({ interview, candidateName, onClose, onSaved }) {
  const [fields, setFields] = useState({
    scheduled_at: interview.scheduled_at?.slice(0, 16) || "",
    round: String(interview.round || "1"),
    mode: interview.mode || "Online",
    location: interview.location || "",
    notes: interview.notes || "",
    job_id: interview.job_id || "",
    job_title: interview.job_title || "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    if (!fields.scheduled_at) return setErr("Date is required.");
    setLoading(true);
    try {
      const updated = await interviewsAPI.reschedule(interview.id, fields);
      onSaved(updated);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, width: "100%", maxWidth: 420, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", background: "var(--surface2)", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Reschedule Interview</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{candidateName} — Round {interview.round}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <label>New Date & Time *</label>
          <input type="datetime-local" value={fields.scheduled_at} onChange={e => setFields(f => ({ ...f, scheduled_at: e.target.value }))} />

          <label>Mode</label>
          <select value={fields.mode} onChange={e => setFields(f => ({ ...f, mode: e.target.value }))}>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>

          <label>Location/Link</label>
          <input type="text" value={fields.location} onChange={e => setFields(f => ({ ...f, location: e.target.value }))} placeholder="Meeting link or office address" />

          <Btn onClick={save} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ── Table Row Components ───────────────────────────────────── */
function GroupedInterviewRows({ candidateName, interviews, onReschedule, onRemove }) {
  const sorted = [...interviews].sort((a, b) => Number(a.round) - Number(b.round));
  return sorted.map((iv, idx) => (
    <tr key={iv.id} style={{ borderTop: idx === 0 ? "2px solid var(--border)" : "1px solid rgba(128,128,128,.15)" }}>
      {idx === 0 && (
        <td rowSpan={sorted.length} style={{ fontWeight: 700, verticalAlign: "top", paddingTop: 14, borderRight: "2px solid rgba(79,110,247,.15)" }}>
          {candidateName}
        </td>
      )}
      <td>Round {iv.round}</td>
      <td>{iv.job_title || "—"}</td>
      <td style={{ fontWeight: 600 }}>{(iv.scheduled_at || "").replace("T", " ").slice(0, 16)}</td>
      <td>{iv.mode || "—"}</td>
      <td style={{ color: "var(--muted)", fontSize: 12 }}>{iv.location || "—"}</td>
      <td style={{ color: "var(--muted)", fontSize: 12 }}>{iv.notes || "—"}</td>
      <td>{iv.email_sent ? "✓ Sent" : "—"}</td>
      <td>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onReschedule(iv)}>✏️</button>
          <button onClick={() => onRemove(iv.id)}>🗑️</button>
        </div>
      </td>
    </tr>
  ));
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function InterviewsPage() {
  const [candidateMap, setCandidateMap] = useState({});
  const [ints, setInts] = useState([]);
  const [cal, setCal] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const [reschedTarget, setReschedTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    candidate_id: "", job_id: "", job_title: "", round: "1", scheduled_at: "", mode: "Online", location: "", notes: ""
  });

  useEffect(() => {
    candidatesAPI.getAll().then(data => {
      const map = {};
      // Filter out rejected/selected/offered candidates
      const activeCandidates = data.filter(c => 
        c.final_status !== "rejected" && 
        c.final_status !== "selected" && 
        c.final_status !== "offered"
      );

      activeCandidates.forEach(c => {
        const key = c.email;
        if (!map[key]) map[key] = { name: c.name, email: c.email, applied: [] };
        if (!map[key].applied.find(a => a.job_id === c.job_id)) {
          map[key].applied.push({ id: c.id, job_id: c.job_id, job_title: c.job_title });
        }
      });
      setCandidateMap(map);
    }).catch(console.error);

    interviewsAPI.getAll().then(setInts).catch(console.error);
  }, []);

  const selectedPerson = Object.values(candidateMap).find(p => p.applied.some(a => a.id === form.candidate_id));

  const handleCandidateChange = (email) => {
    const person = candidateMap[email];
    if (!person) return;
    const first = person.applied[0];
    setForm(f => ({ ...f, candidate_id: first.id, job_id: first.job_id, job_title: first.job_title }));
  };

  const addInt = async () => {
    if (!form.candidate_id || !form.scheduled_at) return alert("Missing required fields.");
    setLoading(true);
    try {
      const newInt = await interviewsAPI.create({ ...form, send_email: true });
      setInts(v => [...v, newInt]);
      setForm({ ...form, scheduled_at: "", notes: "", location: "" });
      alert("Interview Scheduled Successfully!");
    } catch (e) { alert(e.message); }
    finally { setLoading(false); }
  };

  // 🔥 UPDATED LOGIC: Group interviews but ONLY if the candidate exists in the active candidateMap
  const groupedInts = ints.reduce((acc, iv) => {
    const person = Object.values(candidateMap).find(p => p.applied.some(a => a.id === iv.candidate_id));
    
    // If the candidate isn't in our map (because they are rejected/selected), don't add to table
    if (person) {
      const name = person.name;
      if (!acc[name]) acc[name] = [];
      acc[name].push(iv);
    }
    return acc;
  }, {});

  // Calculate total active interviews for the header
  const activeIntsCount = Object.values(groupedInts).flat().length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageTitle>Interviews</PageTitle>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <Calendar cal={cal}
          onPrev={() => setCal(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 })}
          onNext={() => setCal(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 })}
          interviewDates={new Set(ints.map(i => i.scheduled_at?.slice(0, 10)))} />

        <Panel style={{ flex: 1, minWidth: 300 }}>
          <PanelHead>Schedule Interview</PanelHead>
          <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Candidate *</label>
            <select style={inputStyle} value={selectedPerson?.email || ""} onChange={e => handleCandidateChange(e.target.value)}>
              <option value="">Select candidate...</option>
              {Object.values(candidateMap).map(p => <option key={p.email} value={p.email}>{p.name}</option>)}
            </select>

            {selectedPerson && (
              <>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Role *</label>
                <select style={inputStyle} value={form.job_id} onChange={e => {
                  const a = selectedPerson.applied.find(x => x.job_id === e.target.value);
                  setForm(f => ({ ...f, candidate_id: a.id, job_id: a.job_id, job_title: a.job_title }));
                }}>
                  {selectedPerson.applied.map(a => <option key={a.job_id} value={a.job_id}>{a.job_title}</option>)}
                </select>
              </>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Round</label>
                <select style={inputStyle} value={form.round} onChange={e => setForm(f => ({ ...f, round: e.target.value }))}>
                  {["1", "2", "3", "4", "5"].map(r => <option key={r} value={r}>Round {r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Mode</label>
                <select style={inputStyle} value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </div>

            <label style={{ fontSize: 12, fontWeight: 600 }}>Location / Meeting Link</label>
            <input style={inputStyle} type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Zoom link or office room..." />

            <label style={{ fontSize: 12, fontWeight: 600 }}>Date & Time *</label>
            <input style={inputStyle} type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />

            <label style={{ fontSize: 12, fontWeight: 600 }}>Internal Notes</label>
            <textarea style={inputStyle} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any specific instructions..." rows="2" />

            <Btn onClick={addInt} disabled={loading}>{loading ? "Scheduling..." : "Schedule & Send Email"}</Btn>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHead>Scheduled Interviews ({activeIntsCount})</PanelHead>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Candidate</th><th>Round</th><th>Role</th><th>Date & Time</th><th>Mode</th><th>Location</th><th>Notes</th><th>Email</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedInts).map(([name, ivs]) => (
                <GroupedInterviewRows key={name} candidateName={name} interviews={ivs} onReschedule={setReschedTarget}
                  onRemove={async (id) => { if (window.confirm("Cancel this interview?")) { await interviewsAPI.remove(id); setInts(v => v.filter(i => i.id !== id)); } }} />
              ))}
              {Object.keys(groupedInts).length === 0 && (
                <tr><td colSpan="9" style={{textAlign: 'center', padding: '20px', color: 'var(--muted)'}}>No active interviews found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {reschedTarget && (
        <RescheduleModal interview={reschedTarget}
          candidateName={Object.values(candidateMap).find(p => p.applied.some(a => a.id === reschedTarget.candidate_id))?.name || "Candidate"}
          onClose={() => setReschedTarget(null)}
          onSaved={upd => { setInts(v => v.map(i => i.id === upd.id ? upd : i)); setReschedTarget(null); }} />
      )}
    </div>
  );
}

const inputStyle = { padding: "8px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", outline: "none" };