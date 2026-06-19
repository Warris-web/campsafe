import { useState } from "react";

const ROLES = ["admin", "staff", "medical", "patrol", "gate"];

export default function StaffForm({ onSave, onClose }) {
  const [form, setForm]   = useState({ username: "", password: "", full_name: "", role: "staff" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      setError("Username and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(10,14,23,0.92)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "var(--bg-panel)", border: "1px solid var(--border)",
        borderRadius: 12, padding: 28, width: 300,
      }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 20 }}>
          ADD STAFF ACCOUNT
        </div>

        <Row label="USERNAME *">
          <Input value={form.username} onChange={(v) => set("username", v)} placeholder="staff2" />
        </Row>
        <Row label="PASSWORD *">
          <Input value={form.password} onChange={(v) => set("password", v)} placeholder="min 6 characters" type="password" />
        </Row>
        <Row label="FULL NAME">
          <Input value={form.full_name} onChange={(v) => set("full_name", v)} placeholder="John Okafor" />
        </Row>
        <Row label="ROLE">
          <select value={form.role} onChange={(e) => set("role", e.target.value)} style={selectStyle}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Row>

        {error && (
          <div style={{
            background: "var(--red-dim)", border: "1px solid var(--red)", borderRadius: 6,
            padding: "8px 12px", marginBottom: 14,
            fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--red)",
          }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 1, background: "var(--teal)", color: "#0A0E17", border: "none",
            borderRadius: 7, padding: "10px 0", fontFamily: "var(--font-mono)",
            fontWeight: 600, fontSize: 12, cursor: saving ? "not-allowed" : "pointer",
          }}>{saving ? "CREATING…" : "CREATE"}</button>
          <button onClick={onClose} style={{
            flex: 1, background: "transparent", border: "1px solid var(--border)",
            color: "var(--text-muted)", borderRadius: 7, padding: "10px 0",
            fontFamily: "var(--font-mono)", fontSize: 12, cursor: "pointer",
          }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={inputStyle}
      onFocus={(e) => e.target.style.borderColor = "var(--teal)"}
      onBlur={(e)  => e.target.style.borderColor = "var(--border)"}
    />
  );
}

const inputStyle = {
  width: "100%", background: "var(--bg-base)", border: "1px solid var(--border)",
  borderRadius: 6, padding: "7px 10px", color: "var(--text-primary)",
  fontFamily: "var(--font-mono)", fontSize: 12, outline: "none", boxSizing: "border-box",
};
const selectStyle = { ...inputStyle, cursor: "pointer" };