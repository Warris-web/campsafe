// Admin-only panel: list staff accounts, create new ones, activate/deactivate
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import StaffForm from "./StaffForm";
import { Avatar } from "../tracker/TrackerList";

const ROLE_COLORS = {
  admin:   "var(--red)",
  medical: "var(--teal)",
  patrol:  "var(--amber)",
  gate:    "var(--text-secondary)",
  staff:   "var(--text-secondary)",
};

export default function StaffManagement({ currentUser }) {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [error,   setError]   = useState("");

  const load = () => {
    setLoading(true);
    api.getUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data) => {
    await api.createUser(data);
    setShowAdd(false);
    load();
  };

  const toggleActive = async (user) => {
    await api.updateUser(user._id, { active: !user.active });
    setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, active: !u.active } : u));
  };

  const changeRole = async (user, role) => {
    await api.updateUser(user._id, { role });
    setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, role } : u));
  };

  if (currentUser?.role !== "admin") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 24 }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
          🔒 Admin access only
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
          STAFF ACCOUNTS — {users.length}
        </span>
        <button onClick={() => setShowAdd(true)} style={{
          background: "var(--teal-dim)", border: "1px solid var(--teal)",
          color: "var(--teal)", borderRadius: 6, padding: "4px 10px",
          fontSize: 10, fontFamily: "var(--font-mono)", cursor: "pointer",
        }}>+ ADD STAFF</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {loading && <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 12 }}>Loading…</div>}
        {error && (
          <div style={{
            background: "var(--red-dim)", border: "1px solid var(--red)", borderRadius: 6,
            padding: "10px 12px", margin: 8, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--red)",
          }}>{error}</div>
        )}

        {!loading && users.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 12 }}>
            No staff accounts yet.
          </div>
        )}

        {users.map((user) => (
          <UserRow
            key={user._id}
            user={user}
            isSelf={user.username === currentUser?.username}
            onToggleActive={() => toggleActive(user)}
            onChangeRole={(role) => changeRole(user, role)}
          />
        ))}
      </div>

      {showAdd && <StaffForm onSave={handleCreate} onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function UserRow({ user, isSelf, onToggleActive, onChangeRole }) {
  const roleColor = ROLE_COLORS[user.role] || "var(--text-muted)";
  const name = user.full_name || user.username;

  return (
    <div className="fade-in" style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "var(--bg-card)",
      border: `1px solid ${user.active ? "var(--border)" : "var(--border)"}`,
      borderRadius: 8, padding: "10px 12px", marginBottom: 6,
      opacity: user.active ? 1 : 0.5,
    }}>
      <Avatar name={name} color={roleColor} size={32} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
          {user.username} {isSelf && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>(you)</span>}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
          {user.full_name || "—"} · {user.active ? "active" : "deactivated"}
        </div>
      </div>

      {/* Role selector */}
      <select
        value={user.role}
        onChange={(e) => onChangeRole(e.target.value)}
        disabled={isSelf}
        style={{
          background: "var(--bg-base)", border: `1px solid ${roleColor}`,
          color: roleColor, borderRadius: 5, padding: "3px 6px",
          fontSize: 10, fontFamily: "var(--font-mono)", cursor: isSelf ? "not-allowed" : "pointer",
          flexShrink: 0,
        }}
      >
        {["admin", "staff", "medical", "patrol", "gate"].map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {/* Active toggle */}
      {!isSelf && (
        <button onClick={onToggleActive} style={{
          background: user.active ? "var(--red-dim)" : "var(--teal-dim)",
          border: `1px solid ${user.active ? "var(--red)" : "var(--teal)"}`,
          color: user.active ? "var(--red)" : "var(--teal)",
          borderRadius: 5, padding: "3px 8px", fontSize: 10,
          fontFamily: "var(--font-mono)", cursor: "pointer", flexShrink: 0,
        }}>
          {user.active ? "DEACTIVATE" : "REACTIVATE"}
        </button>
      )}
    </div>
  );
}