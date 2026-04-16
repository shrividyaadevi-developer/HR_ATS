import { useState } from "react";
import { Btn, Panel } from "../components/UI";
import { auth, token } from "../services/api";

export default function LoginPage({ onLogin, onGoRegister }) {
  const [email,   setEmail]   = useState("");
  const [pw,      setPw]      = useState("");
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setErr("");
      setLoading(true);

      // 🔥 Call backend login API
      const res = await auth.login({
        email: email,
        password: pw,
      });

      console.log("LOGIN RESPONSE:", res);

      // ✅ Store token
      token.set(res.access_token);

      // ✅ Fetch user details
      const user = await auth.me();

      console.log("USER:", user);

      // ✅ Pass to app
      onLogin(user);

    } catch (e) {
      console.error(e);
      setErr(e.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:"var(--bg)",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      padding:20
    }}>
      <div style={{ width:"100%", maxWidth:400 }}>

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
            fontSize: 20,
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

        <Panel style={{ padding:30 }}>
          <div style={{
            fontFamily:"var(--fh)",
            fontWeight:700,
            fontSize:18,
            marginBottom:4
          }}>
            Welcome
          </div>

          <div style={{
            fontSize:12.5,
            color:"var(--muted)",
            marginBottom:22
          }}>
            Sign in
          </div>

          <div style={{
            display:"flex",
            flexDirection:"column",
            gap:14
          }}>
            {/* Email */}
            <div>
              <label>Email Address</label>
              <input
                value={email}
                onChange={e=>setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                onKeyDown={e=>e.key==="Enter"&&submit()}
              />
            </div>

            {/* Password */}
            <div>
              <label>Password</label>
              <input
                value={pw}
                onChange={e=>setPw(e.target.value)}
                type="password"
                placeholder="••••••••"
                onKeyDown={e=>e.key==="Enter"&&submit()}
              />
            </div>

            {/* Error */}
            {err && (
              <div style={{
                fontSize:12,
                color:"var(--accent3)",
                background:"rgba(247,111,111,.1)",
                border:"1px solid rgba(247,111,111,.2)",
                borderRadius:7,
                padding:"8px 12px"
              }}>
                {err}
              </div>
            )}

            {/* Button */}
            <Btn
              onClick={submit}
              disabled={loading}
              style={{ width:"100%", marginTop:4 }}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </Btn>
          </div>

          {/* Register */}
          <div style={{
            marginTop:16,
            textAlign:"center",
            fontSize:12.5,
            color:"var(--muted)"
          }}>
            Don't have an account?{" "}
            <button
              onClick={onGoRegister}
              style={{
                background:"none",
                border:"none",
                color:"var(--accent)",
                fontWeight:700,
                fontSize:12.5,
                cursor:"pointer"
              }}
            >
              Register
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}