import { useState } from "react";

export default function AlertFeed({ alerts, onResolve }) {
  const active   = alerts.filter((a) => !a.resolved);
  const resolved = alerts.filter((a) => a.resolved);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
          SOS ALERTS
        </span>
        {active.length > 0 && (
          <span style={{
            background: "var(--red-dim)", color: "var(--red)",
            border: "1px solid var(--red)", borderRadius: 4,
            padding: "1px 7px", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500,
          }}>
            {active.length} ACTIVE
          </span>
        )}
      </div>

      {/* Alert list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {alerts.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 12 }}>
            No alerts
          </div>
        )}
        {active.map((a) => (
          <AlertCard key={a._id} alert={a} onResolve={onResolve} />
        ))}
        {resolved.length > 0 && active.length > 0 && (
          <div style={{
            fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em", padding: "8px 8px 4px", marginTop: 4,
          }}>
            RESOLVED
          </div>
        )}
        {resolved.map((a) => (
          <AlertCard key={a._id} alert={a} onResolve={onResolve} />
        ))}
      </div>
    </div>
  );
}

function AlertCard({ alert, onResolve }) {
  const [resolving, setResolving] = useState(false);
  const [name, setName] = useState("");
  const [showInput, setShowInput] = useState(false);

  const time = alert.createdAt
    ? new Date(alert.createdAt).toLocaleTimeString("en-NG", { hour12: false })
    : "—";

  const handleResolve = async () => {
    if (!name.trim()) return;
    setResolving(true);
    await onResolve(alert._id, name.trim());
    setResolving(false);
    setShowInput(false);
  };

  return (
    <div
      className="fade-in"
      style={{
        background: alert.resolved ? "var(--bg-card)" : "var(--red-dim)",
        border: `1px solid ${alert.resolved ? "var(--border)" : "var(--red)"}`,
        borderRadius: 8, padding: "10px 12px", marginBottom: 8,
        transition: "all 0.3s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: 13,
            color: alert.resolved ? "var(--text-secondary)" : "var(--red)",
            marginBottom: 4,
          }}>
            {alert.resolved ? "" : "🚨 "}{alert.device_id}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.7 }}>
            <div>{alert.latitude?.toFixed(5)}, {alert.longitude?.toFixed(5)}</div>
            <div>{time}</div>
            {alert.resolved && (
              <div style={{ color: "var(--teal)", marginTop: 2 }}>
                ✓ {alert.resolved_by}
              </div>
            )}
          </div>
        </div>

        {!alert.resolved && !showInput && (
          <button
            onClick={() => setShowInput(true)}
            style={{
              background: "transparent", border: "1px solid var(--red)",
              color: "var(--red)", borderRadius: 6, padding: "4px 8px",
              fontSize: 11, cursor: "pointer", fontFamily: "var(--font-mono)",
              flexShrink: 0, whiteSpace: "nowrap",
            }}
          >
            Resolve
          </button>
        )}
      </div>

      {showInput && !alert.resolved && (
        <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
          <input
            autoFocus
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleResolve()}
            style={{
              flex: 1, background: "var(--bg-base)", border: "1px solid var(--border-light)",
              borderRadius: 6, padding: "5px 8px", color: "var(--text-primary)",
              fontFamily: "var(--font-mono)", fontSize: 12, outline: "none",
            }}
          />
          <button
            onClick={handleResolve}
            disabled={resolving || !name.trim()}
            style={{
              background: "var(--teal)", color: "#0A0E17", border: "none",
              borderRadius: 6, padding: "5px 10px", fontSize: 11,
              fontFamily: "var(--font-mono)", fontWeight: 600,
              cursor: resolving ? "not-allowed" : "pointer", opacity: resolving ? 0.6 : 1,
            }}
          >
            {resolving ? "…" : "OK"}
          </button>
          <button
            onClick={() => setShowInput(false)}
            style={{
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-muted)", borderRadius: 6, padding: "5px 8px",
              fontSize: 11, cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
