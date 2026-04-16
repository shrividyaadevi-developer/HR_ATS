import { useState } from "react";
import { Btn, Panel } from "../components/UI";
import { auth, token } from "../services/api";

export default function RegisterPage({ onRegister, onGoLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: ""
  });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    try {
      setErr("");

      // ✅ Validations
      if (!form.name.trim()) return setErr("Full name is required.");
      if (!form.email.trim()) return setErr("Email is required.");
      if (form.password.length < 8)
        return setErr("Password must be at least 8 characters.");
      if (form.password !== form.confirm)
        return setErr("Passwords do not match.");

      setLoading(true);

      const userData = {
        name: form.name,
        email: form.email,
        password: form.password,
      };

      /**
       * 🔥 Logic: Route to the correct endpoint.
       * If the email is your designated admin email, use registerAdmin.
       * Otherwise, default to registerCandidate.
       */
        await auth.register(userData);
      

      // 🔥 2. Auto login after register
      const res = await auth.login({
        email: form.email,
        password: form.password,
      });

      // ✅ Store token
      token.set(res.access_token);

      // 🔥 3. Get user profile
      const user = await auth.me();

      // ✅ Pass to app
      onRegister(user);

    } catch (e) {
      console.error(e);
      // This will display "An admin already exists..." from your backend if triggered
      setErr(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            display: "inline-flex",
            width: 48,
            height: 48,
            borderRadius: 13,
            background: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12
          }}>
            <img
              src="https://img.icons8.com/sf-regular/48/40C057/vimeo.png"
              alt="logo"
              style={{ width: 28, height: 28 }}
            />
          </div>

          <div style={{
            fontFamily: "var(--fh)",
            fontWeight: 800,
            fontSize: 23,
            background: "linear-gradient(135deg,var(--accent),var(--accent2))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            VitaHR
          </div>

          <div style={{
            fontSize: 12,
            color: "var(--muted)",
            marginTop: 3
          }}>
            HR ATS Platform
          </div>
        </div>

        {/* Form */}
        <Panel style={{ padding: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>

            <div>
              <label>Full Name</label>
              <input
                value={form.name}
                onChange={f("name")}
                placeholder="e.g.Ram Kumar"
                onKeyDown={e => e.key === "Enter" && submit()}
              />
            </div>

            <div>
              <label>Email Address</label>
              <input
                value={form.email}
                onChange={f("email")}
                type="email"
                placeholder="you@example.com"
                onKeyDown={e => e.key === "Enter" && submit()}
              />
            </div>

            <div>
              <label>Password</label>
              <input
                value={form.password}
                onChange={f("password")}
                type="password"
                placeholder="Min. 8 characters"
                onKeyDown={e => e.key === "Enter" && submit()}
              />
            </div>

            <div>
              <label>Confirm Password</label>
              <input
                value={form.confirm}
                onChange={f("confirm")}
                type="password"
                placeholder="Re-enter password"
                onKeyDown={e => e.key === "Enter" && submit()}
              />
            </div>

            {err && (
              <div style={{
                fontSize: 12,
                color: "var(--accent3)",
                background: "rgba(247,111,111,.1)",
                border: "1px solid rgba(247,111,111,.2)",
                borderRadius: 7,
                padding: "8px 12px"
              }}>
                {err}
              </div>
            )}

            <Btn
              onClick={submit}
              disabled={loading}
              style={{ width: "100%", marginTop: 4 }}
            >
              {loading ? "Creating account…" : "Create Account →"}
            </Btn>
          </div>

          {/* Login link */}
          <div style={{
            marginTop: 14,
            textAlign: "center",
            fontSize: 12.5,
            color: "var(--muted)"
          }}>
            Already have an account?{" "}
            <button
              onClick={onGoLogin}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent)",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer"
              }}
            >
              Sign in
            </button>
          </div>

        </Panel>
      </div>
    </div>
  );
}