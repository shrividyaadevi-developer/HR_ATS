import React, { useEffect, useState } from "react";
import { selected, candidates, reports, downloadOfferLetter, interviews } from "../services/api";
import { Btn, PageTitle, Panel, PanelHead } from "../components/UI";

export default function SelectedCandidatesPage() {
  const [shortlisted, setShortlisted] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [formState, setFormState] = useState({});
  const [offerFiles, setOfferFiles] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [selRes, intRes, canRes] = await Promise.all([
        selected.getAll(),
        interviews.getAll(),
        candidates.getAll()
      ]);

      // 1. Create a detailed map of candidate info (including their actual DB status)
      const candidateInfoMap = {};
      const allCandidates = Array.isArray(canRes) ? canRes : (canRes.data || []);
      allCandidates.forEach(can => { 
        candidateInfoMap[can.id] = { 
            name: can.name, 
            status: can.final_status // This will be 'shortlisted', 'rejected', or 'pending'
        }; 
      });

      const selData = Array.isArray(selRes) ? selRes : (selRes.data || []);
      setSelectedList(selData);

      const interviewData = Array.isArray(intRes) ? intRes : (intRes.data || []);
      const selectedIds = new Set(selData.map(s => s.candidate_id));

      // 2. Logic to group interviews but EXCLUDE those already selected OR already rejected
      const grouped = interviewData.reduce((acc, curr) => {
        const cid = curr.candidate_id;
        const info = candidateInfoMap[cid];

        // CHECK: If candidate is already in 'Selected' table OR their status is no longer 'shortlisted'
        // we skip them so they don't appear in the "Pending" list.
        if (selectedIds.has(cid) || (info && info.status !== 'shortlisted')) {
          return acc;
        }

        if (!acc[cid] || parseInt(curr.round) > parseInt(acc[cid].round)) {
          acc[cid] = {
            ...curr,
            display_name: curr.name || info?.name || "Name Not Found"
          };
        }
        return acc;
      }, {});

      const uniqueShortlisted = Object.values(grouped);
      setShortlisted(uniqueShortlisted);

      const initialForm = {};
      uniqueShortlisted.forEach((c) => {
        initialForm[c.candidate_id] = { roundsCleared: c.round || 1, status: "pending" };
      });
      setFormState(initialForm);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      await reports.export(type);
    } catch (err) {
      alert("Export failed");
    }
    setExporting(null);
  };

  const handleFormChange = (id, field, value) => {
    setFormState(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSubmitStatus = async (candidateId) => {
    const config = formState[candidateId];
    if (!config || config.status === "pending") return alert("Please select Selected or Reject.");
    
    try {
      if (config.status === "selected") {
        await selected.markAs(candidateId, config.roundsCleared);
      } else {
        // This triggers your Python 'round_reject' which sets status to 'rejected'
        await candidates.roundReject(candidateId);
      }
      alert(`Candidate successfully ${config.status}!`);
      fetchData(); 
    } catch (err) { 
        alert(err.response?.data?.detail || err.message); 
    }
  };

  const handleRemoveSelected = async (selectedUuid) => {
    if (!window.confirm("Move candidate back to shortlist?")) return;
    try {
      await selected.delete(selectedUuid);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleUploadOfferLetter = async (selectedId) => {
    const file = offerFiles[selectedId];
    if (!file) return alert("Please choose a file.");
    const formData = new FormData();
    formData.append("offer_letter", file);
    try {
      await selected.offerLetter(selectedId, formData);
      alert("Offer letter uploaded!");
      setOfferFiles(prev => ({ ...prev, [selectedId]: null }));
      fetchData();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading selection data...</div>;

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 24 }}>
      <PageTitle>Analytics & Selection</PageTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <ReportCard title="Monthly Hiring" type="monthly" exporting={exporting} onExport={handleExport} />
        <ReportCard title="Interview Summary" type="summary" exporting={exporting} onExport={handleExport} />
        <ReportCard title="Yearly Comparison" type="yoy" exporting={exporting} onExport={handleExport} />
      </div>

      <Panel>
        <PanelHead>Shortlisted Candidates (Pending Decision)</PanelHead>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Candidate Name</th>
                <th>Role</th>
                <th>Rounds Cleared</th>
                <th>Decision</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shortlisted.map((c, idx) => (
                <tr key={c.candidate_id}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{c.display_name}</td>
                  <td><span style={roleBadgeStyle}>{c.job_title}</span></td>
                  <td>
                    <input 
                        type="number" 
                        style={numInputStyle} 
                        value={formState[c.candidate_id]?.roundsCleared || ""} 
                        onChange={(e) => handleFormChange(c.candidate_id, "roundsCleared", e.target.value)} 
                    />
                  </td>
                  <td>
                    <select 
                        style={selectStyle} 
                        value={formState[c.candidate_id]?.status || "pending"} 
                        onChange={(e) => handleFormChange(c.candidate_id, "status", e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="selected">🎉 Selected</option>
                      <option value="rejected">❌ Reject</option>
                    </select>
                  </td>
                  <td><Btn onClick={() => handleSubmitStatus(c.candidate_id)}>Submit</Btn></td>
                </tr>
              ))}
              {shortlisted.length === 0 && (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: 20}}>No pending decisions.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel>
        <PanelHead>Selected Candidates & Offer Letters</PanelHead>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Offer Action</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {selectedList.map((c, idx) => {
                const isReady = c.offer_letter_status === 'uploaded' || c.offer_letter_status === 'sent';
                return (
                  <tr key={c.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span style={roleBadgeStyle}>{c.job_title}</span></td>
                    <td>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: isReady ? '#10c9a0' : '#ff9f43' }}>
                        {(c.offer_letter_status || "PENDING").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 10 }}>
                        {!isReady ? (
                          <>
                            <label style={fileBtnStyle}>
                              {offerFiles[c.id] ? "📄 Ready" : "PDF"}
                              <input type="file" hidden accept="application/pdf" onChange={(e) => setOfferFiles({ ...offerFiles, [c.id]: e.target.files[0] })} />
                            </label>
                            <Btn onClick={() => handleUploadOfferLetter(c.id)}>Upload</Btn>
                          </>
                        ) : (
                          <Btn onClick={() => downloadOfferLetter(c.id)} style={viewBtnStyle}>👁️ View</Btn>
                        )}
                      </div>
                    </td>
                    <td><Btn onClick={() => handleRemoveSelected(c.id)} style={removeBtnStyle}>Remove</Btn></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function ReportCard({ title, type, exporting, onExport }) {
  return (
    <Panel style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>
      <Btn 
        onClick={() => onExport(type)} 
        disabled={exporting === type}
        style={{ width: '100%' }}
      >
        {exporting === type ? "Exporting..." : "Download CSV"}
      </Btn>
    </Panel>
  );
}

// --- Styles ---
const roleBadgeStyle = { background: "rgba(16,201,160,.08)", color: "#10c9a0", border: "1px solid rgba(16,201,160,.22)", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 };
const numInputStyle = { width: 45, padding: '4px', borderRadius: 4, border: '1px solid #ddd' };
const selectStyle = { padding: '4px', borderRadius: 4, border: '1px solid #ddd', fontSize: '11px' };
const fileBtnStyle = { padding: '6px 12px', borderRadius: '8px', background: '#f0f0f0', border: '1px solid #ddd', fontSize: '11px', cursor: 'pointer', fontWeight: 700 };
const viewBtnStyle = { background: '#f0f0f0', color: '#333', border: '1px solid #ddd', fontSize: '11px' };
const removeBtnStyle = { background: 'transparent', color: '#ff4d4f', border: '1px solid #ff4d4f', fontSize: '10px', padding: '4px 8px' };