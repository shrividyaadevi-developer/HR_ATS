import { useEffect, useState } from "react";
import { Badge, Btn, PageTitle, Panel, PanelHead } from "../components/UI";
import { auth } from "../services/api";

export default function ManageHRPage() {
  const [hrUsers, setHrUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Load HR list
  const loadHR = async () => {
    try {
      const res = await auth.listHR();
      console.log("HR USERS:", res);
      setHrUsers(res);
    } catch (e) {
      console.error(e);
      setErr("Failed to load HR users");
    }
  };

  useEffect(() => {
    loadHR();
  }, []);

  // 🔥 Create HR
  const create = async () => {
    try {
      setErr("");
      setSuccess("");

      if (!form.name || !form.email || !form.password) {
        return setErr("All fields are required.");
      }

      setLoading(true);

      await auth.createHR({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setSuccess(`HR account for ${form.name} created successfully.`);
      setForm({ name: "", email: "", password: "" });

      loadHR(); // refresh

    } catch (e) {
      console.error(e);
      setErr(e.message || "Failed to create HR");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Toggle Active/Inactive
  const toggleStatus = async (id) => {
    try {
      await auth.deactivate(id);
      loadHR();
    } catch (e) {
      console.error(e);
      setErr("Failed to update status");
    }
  };

  // 🔥 Remove HR
  const remove = async (id) => {
    if (!window.confirm("Remove this HR account?")) return;

    try {
      await auth.deactivate(id);
      loadHR();
    } catch (e) {
      console.error(e);
      setErr("Failed to remove HR");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <PageTitle>Manage HR Accounts</PageTitle>
        <Badge color="purple">Admin Only</Badge>
      </div>

      {/* Create Form */}
      <Panel>
        <PanelHead>Create New HR Account</PanelHead>
        <div style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 13 }}>

            <div>
              <label>Full Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div>
              <label>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div>
              <label>Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>

          </div>

          {err && (
            <div style={{ color: "var(--accent3)", fontSize: 12, marginTop: 10 }}>
              {err}
            </div>
          )}

          {success && (
            <div style={{ color: "var(--accent2)", fontSize: 12, marginTop: 10 }}>
              ✓ {success}
            </div>
          )}

          <div style={{ marginTop: 14, display: "flex", gap: 9 }}>
            <Btn onClick={create} disabled={loading}>
              {loading ? "Creating..." : "Create HR Account"}
            </Btn>

            <Btn variant="ghost" onClick={() => {
              setForm({ name: "", email: "", password: "" });
              setErr("");
              setSuccess("");
            }}>
              Clear
            </Btn>
          </div>
        </div>
      </Panel>

      {/* Table */}
      <Panel>
        <PanelHead>HR Accounts ({hrUsers.length})</PanelHead>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {hrUsers.map((u, i) => {

                // 🔥 FIX: convert string → boolean
                const isActive = u.is_active === true || u.is_active === "true";

                return (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>

                    <td>
                      <Badge color="blue">HR</Badge>
                    </td>

                    <td>
                      <Badge color={isActive ? "green" : "gray"}>
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: 8 }}>

                        <Btn
                          variant="ghost"
                          onClick={() => toggleStatus(u.id)}
                          style={{ padding: "4px 12px", fontSize: 11 }}
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </Btn>
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