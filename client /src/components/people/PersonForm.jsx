// Reusable form for adding or editing a camper/person
import { useState } from "react";

const ROLES = ["child", "adult", "staff", "medical"];

export default function PersonForm({ initial = {}, families = [], onSave, onClose, title = "ADD PERSON" }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", age: "", role: "child",
    device_id: "", notes: "", family_id: "",
    ...initial,
    age: initial.age ?? "",
    family_id: initial.family_id?._id || initial.family_id || "",
    device_id: initial.device_id || "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First and last name are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        ...form,
        age:       form.age !== "" ? parseInt(form.age) : undefined,
        family_id: form.family_id || null,
        device_id: form.device_id.trim() || null,
      });
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
        borderRadius: 12, padding: 28, width: 320, maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)",
          letterSpacing: "0.1em", marginBottom: 20,
        }}>{title}</div>

        <Row label="FIRST NAME *">
          <Input value={form.first_name} onChange={(v) => set("first_name", v)} placeholder="Chioma" />
        </Row>
        <Row label="LAST NAME *">
          <Input value={form.last_name} onChange={(v) => set("last_name", v)} placeholder="Adeyemi" />
        </Row>
        <Row label="AGE">
          <Input value={form.age} onChange={(v) => set("age", v)} placeholder="8" type="number" />
        </Row>
        <Row label="ROLE">
          <select
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            style={selectStyle}
          >
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Row>
        <Row label="FAMILY">
          <select value={form.family_id} onChange={(e) => set("family_id", e.target.value)} style={selectStyle}>
            <option value="">— None (single) —</option>
            {families.map((f) => (
              <option key={f._id} value={f._id}>{f.family_name}</option>
            ))}
          </select>
        </Row>
        <Row label="TRACKER ID">
          <Input value={form.device_id} onChange={(v) => set("device_id", v)} placeholder="TAG_01" />
        </Row>
        <Row label="NOTES">
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Allergies, medical notes…"
            rows={2}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Row>

        {error && (
          <div style={{
            background: "var(--red-dim)", border: "1px solid var(--red)",
            borderRadius: 6, padding: "8px 12px", marginBottom: 14,
            fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--red)",
          }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 1, background: "var(--teal)", color: "#0A0E17", border: "none",
            borderRadius: 7, padding: "10px 0", fontFamily: "var(--font-mono)",
            fontWeight: 600, fontSize: 12, cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}>{saving ? "SAVING…" : "SAVE"}</button>
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
  fontFamily: "var(--font-mono)", fontSize: 12, outline: "none",
  boxSizing: "border-box",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer", appearance: "none",
};
