import { useState, useEffect } from "react";
import { candidates } from "../services/api";
import { Badge, Btn, PageTitle, Panel } from "../components/UI";

export default function CandidatesPage() {
  const [cands, setCands] = useState([]);
  const [dd, setDd] = useState(null);
  const [err, setErr] = useState("");
  const [modified, setModified] = useState({}); // { [id]: "yes" | "no" }

  const sc = {
    Shortlisted: "blue",
    Selected: "green",
    Rejected: "red",
    "Under Review": "yellow",
    Applied: "gray",
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const data = await candidates.getAll();
      // Only show candidates with no HR decision yet
      setCands(
        data
          .map((c) => ({ ...c, hr: c.hr_override || "none" }))
          .filter((c) => !c.hr_override || c.hr_override === "none")
      );
    } catch (e) {
      console.error(e);
      setErr("Failed to load candidates");
    }
  };

  const handleViewResume = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/candidates/${id}/resume`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch resume");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (e) {
      alert("Resume load failed");
    }
  };

  const handleHRDecision = (id, val) => {
    setModified((prev) => ({ ...prev, [id]: val.toLowerCase() }));
    setDd(null);
  };

  const handleSaveAll = async () => {
    try {
      const updates = Object.entries(modified);
      for (let [id, val] of updates) {
        await candidates.override(id, { override: val });
      }
      const decidedIds = new Set(Object.keys(modified));
      setCands((prev) => prev.filter((c) => !decidedIds.has(c.id)));
      setModified({});
      alert("All HR decisions saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save HR decisions: " + e.message);
    }
  };

  const getHRDisplay = (c) => {
    if (modified[c.id] !== undefined) return modified[c.id];
    return c.hr || "none";
  };

  const isPending = (c) => modified[c.id] !== undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageTitle>
        Candidates
        {Object.keys(modified).length > 0 && (
          <Btn style={{ marginLeft: 20 }} onClick={handleSaveAll}>
            Save All Changes ({Object.keys(modified).length})
          </Btn>
        )}
      </PageTitle>

      {err && <div style={{ color: "red" }}>{err}</div>}

      <Panel>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>LinkedIn</th>
                <th>Similarity</th>
                <th>AI Score</th>
                <th>Status</th>
                <th>Resume</th>
                <th style={{ width: 150 }}>AI Reason</th>
                <th>HR Decision</th>
              </tr>
            </thead>
            <tbody>
              {cands.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: "center",
                      color: "var(--muted)",
                      padding: "32px 0",
                    }}
                  >
                    No pending candidates
                  </td>
                </tr>
              )}

              {cands.map((c) => {
                const hrVal = getHRDisplay(c);
                const pending = isPending(c);

                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>
                      {c.email}
                    </td>

                    {/* LinkedIn Preview Column */}
                    <td>
                      {c.linkedin_url ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <a
                            href={c.linkedin_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ textDecoration: "none" }}
                          >
                            <Badge color="blue" style={{ cursor: "pointer", display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span>LinkedIn Profile</span>
                              <span style={{ fontSize: 10 }}>↗</span>
                            </Badge>
                          </a>
                          <span style={{ fontSize: 10, color: 'var(--accent2)', fontWeight: 600 }}>
                            Click to Verify Profile
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--accent3)", fontWeight: 600 }}>
                          No Link Provided
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 52,
                            height: 5,
                            background: "var(--border)",
                            borderRadius: 99,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${c.similarity_score}%`,
                              height: "100%",
                              borderRadius: 99,
                              background:
                                c.similarity_score > 85
                                  ? "var(--accent2)"
                                  : c.similarity_score > 70
                                  ? "var(--accent)"
                                  : "var(--accent3)",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>
                          {c.similarity_score}%
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color:
                            c.ai_score > 80
                              ? "var(--accent2)"
                              : c.ai_score > 65
                              ? "var(--accent)"
                              : "var(--accent3)",
                        }}
                      >
                        {c.ai_score}
                      </span>
                    </td>

                    <td>
                      <Badge color={sc[c.ai_status] || "gray"}>{c.ai_status}</Badge>
                    </td>

                    <td>
                      <Btn
                        variant="soft"
                        style={{ padding: "4px 11px", fontSize: 11 }}
                        onClick={() => handleViewResume(c.id)}
                      >
                        View
                      </Btn>
                    </td>

                    <td
                      style={{
                        maxWidth: 150,
                        color: "var(--muted)",
                        fontSize: 11,
                        lineHeight: "1.4",
                      }}
                    >
                      {c.ai_reason}
                    </td>

                    <td>
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <button
                          onClick={() => setDd(dd === c.id ? null : c.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 11px",
                            borderRadius: 7,
                            background:
                              hrVal === "yes"
                                ? "rgba(16,201,160,.12)"
                                : hrVal === "no"
                                ? "rgba(247,111,111,.12)"
                                : "var(--surface2)",
                            border: `1.5px solid ${
                              hrVal === "yes"
                                ? "rgba(16,201,160,.3)"
                                : hrVal === "no"
                                ? "rgba(247,111,111,.3)"
                                : "var(--border)"
                            }`,
                            color:
                              hrVal === "yes"
                                ? "var(--accent2)"
                                : hrVal === "no"
                                ? "var(--accent3)"
                                : "var(--muted)",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {pending && (
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background:
                                  hrVal === "yes"
                                    ? "var(--accent2)"
                                    : "var(--accent3)",
                                display: "inline-block",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          {hrVal === "none"
                            ? "None"
                            : hrVal.charAt(0).toUpperCase() + hrVal.slice(1)}
                          <span style={{ fontSize: 8 }}> ▾</span>
                        </button>

                        {dd === c.id && (
                          <div
                            style={{
                              position: "absolute",
                              right: 0,
                              top: "calc(100% + 4px)",
                              background: "var(--surface)",
                              border: "1px solid var(--border)",
                              borderRadius: 9,
                              zIndex: 50,
                              minWidth: 95,
                              boxShadow: "var(--shadow)",
                              overflow: "hidden",
                            }}
                          >
                            {["Yes", "No"].map((v) => (
                              <button
                                key={v}
                                onClick={() => handleHRDecision(c.id, v)}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  padding: "9px 14px",
                                  background: "none",
                                  border: "none",
                                  borderBottom:
                                    v === "Yes"
                                      ? "1px solid var(--border)"
                                      : "none",
                                  color:
                                    v === "Yes"
                                      ? "var(--accent2)"
                                      : "var(--accent3)",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  textAlign: "left",
                                  cursor: "pointer",
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.background =
                                    "var(--surface2)")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.background = "none")
                                }
                              >
                                {v === "Yes" ? "✓ Yes" : "✗ No"}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
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