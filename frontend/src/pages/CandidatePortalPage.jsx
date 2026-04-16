import { useState, useEffect } from "react";
import { Badge, Btn, Panel, PanelHead, PageTitle } from "../components/UI";
import { jobs, candidates } from "../services/api";

const STATUS_COLOR = {
  Applied: "blue",
  "Under Review": "yellow",
  Shortlisted: "purple",
  Interviewed: "blue",
  Selected: "green",
  Rejected: "red",
};

function JobCard({ job, onApply, applied }) {
  const [expanded, setExpanded] = useState(false);
  const isOpen = job.status.toLowerCase() === "active";

  return (
    <Panel style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
              {job.job_title}
            </span>
            <Badge color={isOpen ? "green" : "gray"}>{job.status}</Badge>
            {applied && <Badge color="blue">Applied</Badge>}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {job.skills.split(",").map((s) => (
              <span
                key={s}
                style={{
                  background: "rgba(79,110,247,.1)",
                  color: "var(--accent)",
                  border: "1px solid rgba(79,110,247,.2)",
                  borderRadius: 99,
                  padding: "2px 9px",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {s.trim()}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 7, flexShrink: 0 }}>
          {isOpen && !applied && (
            <Btn onClick={() => onApply(job)} style={{ fontSize: 12, padding: "6px 14px" }}>
              Apply Now
            </Btn>
          )}
          {applied && (
            <Btn variant="ghost" disabled style={{ fontSize: 12, padding: "6px 14px" }}>
              ✓ Applied
            </Btn>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: 7,
              color: "var(--muted)",
              fontSize: 12,
              padding: "5px 12px",
              cursor: "pointer",
            }}
          >
            {expanded ? "Less ▲" : "Details ▼"}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{job.description}</div>
          <div style={{ marginTop: 10, fontSize: 11, color: "var(--muted)" }}>
            Job ID: <code style={{ color: "var(--accent)" }}>{job.id}</code>
            &nbsp;·&nbsp; {job.applicant_count} candidate{job.applicant_count !== 1 ? "s" : ""} applied
          </div>
        </div>
      )}
    </Panel>
  );
}

function ApplyModal({ job, onConfirm, onClose }) {
  const [resume, setResume] = useState(null);
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState(""); // State for LinkedIn URL
  const [err, setErr] = useState("");

  const submit = () => {
    if (!resume) {
      setErr("Please upload your resume.");
      return;
    }
    if (!phone.trim()) {
      setErr("Phone number is required.");
      return;
    }
    if(!linkedin)
    {
      setErr("Linkedin url is required.");
      return;
    }
    // Include linkedin in the confirmation data
    onConfirm({ job, resume, phone, linkedin });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <Panel style={{ width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto" }}>
        <PanelHead>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Apply — {job.job_title}</span>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
        </PanelHead>
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 13 }}>
          <div>
            <label>Resume / CV *</label>
            <div
              style={{
                border: "2px dashed var(--border)",
                borderRadius: 9,
                padding: "18px",
                textAlign: "center",
                cursor: "pointer",
                position: "relative",
                background: resume ? "rgba(16,201,160,.06)" : "var(--input-bg)",
                borderColor: resume ? "var(--accent2)" : "var(--border)",
              }}
              onClick={() => document.getElementById("resume-upload").click()}
            >
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={(e) => setResume(e.target.files[0])}
              />
              {resume ? (
                <div style={{ color: "var(--accent2)", fontWeight: 600, fontSize: 13 }}>
                  📄 {resume.name}
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>Click to change</div>
                </div>
              ) : (
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  📁 Click to upload PDF / DOC
                  <div style={{ fontSize: 11, marginTop: 3 }}>Max 5MB</div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label>Phone Number *</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" type="tel" />
          </div>
          {/* New LinkedIn URL Input */}
          <div>
            <label>LinkedIn Profile URL *</label>
            <input 
                value={linkedin} 
                onChange={(e) => setLinkedin(e.target.value)} 
                placeholder="https://linkedin.com/in/yourprofile" 
                type="url" 
            />
          </div>
          {err && (
            <div
              style={{
                fontSize: 12,
                color: "var(--accent3)",
                background: "rgba(247,111,111,.1)",
                border: "1px solid rgba(247,111,111,.2)",
                borderRadius: 7,
                padding: "8px 12px",
              }}
            >
              {err}
            </div>
          )}
          <div style={{ display: "flex", gap: 9 }}>
            <Btn onClick={submit} style={{ flex: 1, justifyContent: "center" }}>
              Submit Application
            </Btn>
            <Btn variant="ghost" onClick={onClose}>
              Cancel
            </Btn>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default function CandidatePortalPage({ user }) {
  const [tab, setTab] = useState("browse"); 
  const [jobsList, setJobsList] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [applications, setApplications] = useState([]);
  const [applyJob, setApplyJob] = useState(null);

  const appliedIds = new Set(applications.map((a) => a.job.id));
  const statusSteps = ["Applied", "Under Review", "Shortlisted", "Interviewed", "Selected"];

  useEffect(() => {
    async function fetchJobs() {
      try {
        const params = search ? { q: search } : {};
        const data = await jobs.search(params);
        setJobsList(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchJobs();
  }, [search]);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const data = await candidates.myApplications();
        setApplications(
          data.map((a) => ({
            id: a.job_id,
            job: { ...a.job, id: a.job_id },
            appliedDate: new Date(a.applied_at).toLocaleDateString("en-IN"),
            status: a.final_status === "pending" ? "Applied" : a.final_status,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    }
    fetchApplications();
  }, []);

  const handleApply = async ({ job, resume, phone, linkedin }) => {
    try {
      const formData = new FormData();
      formData.append("job_id", job.id);
      formData.append("resume", resume);
      formData.append("phone", phone);
      
      // Append LinkedIn URL if provided
      if (linkedin) {
        formData.append("linkedin_url", linkedin);
      }

      await candidates.apply(formData);

      setApplications((prev) => [
        ...prev,
        {
          id: job.id,
          job,
          appliedDate: new Date().toLocaleDateString("en-IN"),
          status: "Applied",
        },
      ]);
      setApplyJob(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const filtered = jobsList.filter((j) => {
    const matchSearch =
      j.job_title.toLowerCase().includes(search.toLowerCase()) ||
      j.skills.toLowerCase().includes(search.toLowerCase()) ||
      (j.location || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || j.status.toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <PageTitle>👋 Hello, {user.name.split(" ")[0]}</PageTitle>
        <div style={{ display: "flex", gap: 6 }}>
          {["browse", "applications"].map((t) => (
            <Btn
              key={t}
              variant={tab === t ? "primary" : "ghost"}
              onClick={() => setTab(t)}
              style={{ padding: "6px 16px", textTransform: "capitalize" }}
            >
              {t === "browse" ? "🔍 Browse Jobs" : `📋 My Applications (${applications.length})`}
            </Btn>
          ))}
        </div>
      </div>

      {tab === "browse" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, skill, location…"
              style={{ flex: 1, minWidth: 220 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              {["All", "Active", "Paused", "Closed"].map((f) => (
                <Btn
                  key={f}
                  variant={filter === f ? "primary" : "ghost"}
                  onClick={() => setFilter(f)}
                  style={{ padding: "6px 12px", fontSize: 12 }}
                >
                  {f}
                </Btn>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Showing <strong style={{ color: "var(--text)" }}>{filtered.length}</strong> job
            {filtered.length !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
          </div>

          {filtered.length === 0 ? (
            <Panel style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
              <div style={{ fontFamily: "var(--fh)", fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>No jobs found</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Try adjusting your search or filter.</div>
            </Panel>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} applied={appliedIds.has(job.id)} onApply={() => setApplyJob(job)} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "applications" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {applications.length === 0 ? (
            <Panel style={{ padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
              <div style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 6 }}>No applications yet</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>Browse open jobs and submit your first application.</div>
              <Btn onClick={() => setTab("browse")}>Browse Jobs</Btn>
            </Panel>
          ) : (
            applications.map((app) => (
              <Panel key={app.id} style={{ padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>{app.job.job_title}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span>📍 {app.job.location}</span>
                      <span>📅 Applied {app.appliedDate}</span>
                    </div>
                  </div>
                  <Badge color={STATUS_COLOR[app.status] || "gray"}>{app.status}</Badge>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
                  {statusSteps.map((s, i) => {
                    const stepIdx = statusSteps.indexOf(app.status);
                    const isDone = i < stepIdx;
                    const isCurrent = i === stepIdx;
                    const isRejected = app.status === "Rejected";
                    return (
                      <div key={s} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ textAlign: "center" }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 700,
                              margin: "0 auto 4px",
                              background: isRejected && isCurrent ? "var(--accent3)" : isCurrent ? "var(--accent)" : isDone ? "var(--accent2)" : "var(--surface2)",
                              color: isCurrent || isDone ? "#fff" : "var(--muted)",
                              border: `2px solid ${isRejected && isCurrent ? "var(--accent3)" : isCurrent ? "var(--accent)" : isDone ? "var(--accent2)" : "var(--border)"}`,
                            }}
                          >
                            {isDone ? "✓" : i + 1}
                          </div>
                          <div style={{ fontSize: 10, color: isCurrent ? "var(--text)" : "var(--muted)", fontWeight: isCurrent ? 700 : 400, whiteSpace: "nowrap" }}>{s}</div>
                        </div>
                        {i < statusSteps.length - 1 && (
                          <div style={{ width: 32, height: 2, margin: "0 2px", marginBottom: 18, background: isDone ? "var(--accent2)" : "var(--border)" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Panel>
            ))
          )}
        </div>
      )}

      {applyJob && <ApplyModal job={applyJob} onConfirm={handleApply} onClose={() => setApplyJob(null)} />}
    </div>
  );
}