import { useState, useEffect } from "react";
import { jobs } from "../services/api";
import { Badge, Btn, PageTitle, Panel, PanelHead } from "../components/UI";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export default function JobsPage() {
  const [jobList, setJobList] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({
    name: "",
    skills: "",
    description: "",
    notes: "",
    status: "active"
  });

  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState(null);

  const statusColor = {
    active: "green",
    closed: "gray",
    paused: "yellow"
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const res = await jobs.getAll();
      setJobList(res);
    } catch {
      setErr("Failed to load jobs");
    }
  };

  // FILTER LOGIC
  const filteredJobs = jobList.filter(j => {
    const matchSearch = j.job_title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // CREATE / UPDATE
  const submit = async () => {
    setErr("");
    if (!form.name.trim()) {
      setErr("Job title required");
      return;
    }

    try {
      if (editingId) {
        await jobs.update(editingId, {
          job_title: form.name,
          description: form.description,
          skills: form.skills,
          keywords: form.notes,
          status: form.status
        });
      } else {
        await jobs.create({
          job_title: form.name,
          description: form.description,
          skills: form.skills,
          keywords: form.notes
        });
      }
      resetForm();
      loadJobs();
    } catch (e) {
      setErr(e.message);
    }
  };

  const handleEdit = (job) => {
    setForm({
      name: job.job_title,
      skills: job.skills || "",
      description: job.description || "",
      notes: job.keywords || "",
      status: job.status || "active"
    });
    setEditingId(job.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await jobs.remove(id);
      loadJobs();
    } catch {
      setErr("Delete failed");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      skills: "",
      description: "",
      notes: "",
      status: "active"
    });
    setEditingId(null);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      <PageTitle>Jobs</PageTitle>

      {/* FORM */}
      <Panel>
        <PanelHead>{editingId ? "Edit Job" : "Post a New Job"}</PanelHead>
        <div style={{ padding:20 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13 }}>
            <div>
              <label>Job Title *</label>
              <input
                value={form.name}
                onChange={e=>setForm(f=>({...f,name:e.target.value}))}
              />
            </div>

            <div>
              <label>Skills</label>
              <input
                value={form.skills}
                onChange={e=>setForm(f=>({...f,skills:e.target.value}))}
              />
            </div>

            <div style={{ gridColumn:"1/-1" }}>
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              />
            </div>

            <div style={{ gridColumn:"1/-1" }}>
              <label>Keywords</label>
              <textarea
                value={form.notes}
                onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
              />
            </div>

            {editingId && (
              <div>
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}
          </div>

          {err && <div style={{ color:"red", marginTop:10 }}>{err}</div>}

          <div style={{ marginTop:14, display:"flex", gap:9 }}>
            <Btn onClick={submit}>{editingId ? "Update Job" : "Post Job"}</Btn>
            <Btn variant="ghost" onClick={resetForm}>Clear</Btn>
          </div>
        </div>
      </Panel>

      {/* TABLE */}
      <Panel>
        <PanelHead>Jobs ({filteredJobs.length})</PanelHead>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "12px 20px",
          gap: 10,
          flexWrap: "wrap"
        }}>
          <input
            placeholder="Search job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 220 }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div style={{ overflowX:"auto" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Applicants</th>
                <th>Posted Date</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(j => (
                <tr key={j.id}>
                  <td><code>{j.id.slice(0,6)}</code></td>
                  <td>{j.job_title}</td>
                  <td><Badge color={statusColor[j.status]}>{j.status}</Badge></td>
                  <td>{j.applicant_count}</td>
                  <td>{new Date(j.created_at).toLocaleDateString()}</td>
                  <td>
                    <FaEdit
                      style={{ cursor:"pointer", color:"#4f6ef7" }}
                      onClick={() => handleEdit(j)}
                    />
                  </td>
                  <td>
                    <MdDelete
                      style={{ cursor:"pointer", color:"#f76f6f" }}
                      onClick={() => handleDelete(j.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}