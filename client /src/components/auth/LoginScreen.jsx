import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return;
    setLoading(true);
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg-base)",
    }}>
      <div style={{
        width: 360, background: "var(--bg-panel)",
        border: "1px solid var(--border)", borderRadius: 12,
        padding: 36,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "var(--teal)", display: "grid", placeItems: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="#0A0E17"/>
              <circle cx="8" cy="8" r="6.5" stroke="#0A0E17" strokeWidth="1.5"/>
              <line x1="8" y1="1"    x2="8"  y2="3.5"  stroke="#0A0E17" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="8" y1="12.5" x2="8"  y2="15"   stroke="#0A0E17" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="1" y1="8"    x2="3.5" y2="8"   stroke="#0A0E17" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12.5" y1="8" x2="15" y2="8"    stroke="#0A0E17" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>CampSafe</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>COMMAND ACCESS</div>
          </div>
        </div>

        {/* Fields */}
        <Field label="USERNAME" value={username} onChange={setUsername} placeholder="Enter Username" />
        <Field label="PASSWORD" value={password} onChange={setPassword} placeholder="Enter Password" type="password"
          onEnter={handleLogin} />

        {error && (
          <div style={{
            background: "var(--red-dim)", border: "1px solid var(--red)",
            borderRadius: 6, padding: "8px 12px", marginBottom: 16,
            fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--red)",
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || !username || !password}
          style={{
            width: "100%", padding: "11px 0",
            background: loading ? "var(--bg-card)" : "var(--teal)",
            color: loading ? "var(--text-muted)" : "#0A0E17",
            border: "none", borderRadius: 8,
            fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13,
            letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {loading ? "AUTHENTICATING…" : "SIGN IN"}
        </button>

        {/* <div style={{
          marginTop: 20, padding: "12px", background: "var(--bg-card)",
          borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11,
          color: "var(--text-muted)", lineHeight: 1.8,
        }}>
          <div style={{ color: "var(--text-secondary)", marginBottom: 4 }}>Demo credentials:</div>
          <div>admin / camp2024</div>
          <div>staff1 / staff123</div>
          <div>medical / med2024</div> */}
        {/* </div> */}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", onEnter }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 6,
      }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        style={{
          width: "100%", background: "var(--bg-base)",
          border: "1px solid var(--border-light)",
          borderRadius: 6, padding: "9px 12px",
          color: "var(--text-primary)", fontFamily: "var(--font-mono)",
          fontSize: 13, outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => e.target.style.borderColor = "var(--teal)"}
        onBlur={(e)  => e.target.style.borderColor = "var(--border-light)"}
      />
    </div>
  );
}