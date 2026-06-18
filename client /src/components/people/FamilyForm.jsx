import { useState } from "react";

export default function FamilyForm({ initial = {}, onSave, onClose, title = "ADD FAMILY" }) {
  const [form, setForm] = useState({
    family_name: "", cabin: "", emergency_contact_name: "", emergency_contact_phone: "", notes: "",
    ...initial,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.family_name.trim()) { setError("Family name is required."); return; }
    setSaving(true); setError("");
    try { await onSave(form); }
    catch (err) { setError(err.message); setSaving(false); }
  };

  const fields = [
    { key: "family_name",             label: "FAMILY NAME *",       placeholder: "Adeyemi Family" },
    { key: "cabin",                   label: "CABIN",               placeholder: "Cabin 1" },
    { key: "emergency_contact_name",  label: "EMERGENCY CONTACT",   placeholder: "Mr. Adeyemi" },
    { key: "emergency_contact_phone", label: "CONTACT PHONE",       placeholder: "+234 801 234 5678" },
    { key: "notes",                   label: "NOTES",               placeholder: "Any notes…" },
  ];

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
          {title}
        </div>

        {fields.map(({ key, label, placeholder }) => (
          <div key={key} style={{ marginBottom: 13 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 5 }}>
              {label}
            </div>
            <input
              value={form[key]}
              placeholder={placeholder}
              onChange={(e) => set(key, e.target.value)}
              style={{
                width: "100%", background: "var(--bg-base)", border: "1px solid var(--border)",
                borderRadius: 6, padding: "7px 10px", color: "var(--text-primary)",
                fontFamily: "var(--font-mono)", fontSize: 12, outline: "none", boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--teal)"}
              onBlur={(e)  => e.target.style.borderColor = "var(--border)"}
            />
          </div>
        ))}

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
