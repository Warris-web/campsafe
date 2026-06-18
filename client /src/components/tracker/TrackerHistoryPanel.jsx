export default function TrackerHistoryPanel({ deviceId, history, loading, onClose, camper }) {
  if (!deviceId) return null;

  const name        = camper ? `${camper.first_name} ${camper.last_name}` : deviceId;
  const totalPoints = history.length;
  const sosCount    = history.filter((p) => p.sos).length;
  const minBat      = history.length ? Math.min(...history.map((p) => p.battery_pct ?? 100)) : null;

  const distKm = history.length > 1
    ? history.reduce((sum, p, i) => i === 0 ? 0 : sum + haversine(history[i - 1], p), 0)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 600, color: "var(--teal)" }}>
            {name}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
            {camper ? deviceId : "unassigned tracker"} · track history
          </div>
        </div>
        <button onClick={onClose} style={{
          background: "transparent", border: "1px solid var(--border)",
          color: "var(--text-muted)", borderRadius: 6,
          width: 28, height: 28, cursor: "pointer", fontSize: 14,
          display: "grid", placeItems: "center",
        }}>✕</button>
      </div>

      {loading && (
        <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>Loading…</div>
      )}

      {!loading && (
        <>
          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 1, borderBottom: "1px solid var(--border)",
            background: "var(--border)", flexShrink: 0,
          }}>
            <Stat label="PINGS"    value={totalPoints} />
            <Stat label="DISTANCE" value={`${distKm.toFixed(2)} km`} />
            <Stat label="SOS"      value={sosCount} alert={sosCount > 0} />
            <Stat label="MIN BAT"  value={minBat !== null ? `${minBat}%` : "—"} alert={minBat !== null && minBat < 20} />
          </div>

          {/* Camper info strip */}
          {camper && (
            <div style={{
              padding: "8px 14px", borderBottom: "1px solid var(--border)",
              fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)",
              display: "flex", gap: 16, flexShrink: 0,
            }}>
              <span>Age: <span style={{ color: "var(--text-secondary)" }}>{camper.age ?? "—"}</span></span>
              <span>Role: <span style={{ color: "var(--text-secondary)" }}>{camper.role}</span></span>
              {camper.family_id && (
                <span>Family: <span style={{ color: "var(--teal)" }}>{camper.family_id.family_name || camper.family_id}</span></span>
              )}
            </div>
          )}

          {/* Event log */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {history.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 12 }}>
                No events yet
              </div>
            )}
            {history.map((event, i) => (
              <EventRow key={event._id || i} event={event} isFirst={i === 0} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, alert }) {
  return (
    <div style={{ background: "var(--bg-panel)", padding: "10px 14px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 600, color: alert ? "var(--red)" : "var(--text-primary)" }}>
        {value}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2, letterSpacing: "0.08em" }}>
        {label}
      </div>
    </div>
  );
}

function EventRow({ event, isFirst }) {
  const time = event.createdAt
    ? new Date(event.createdAt).toLocaleTimeString("en-NG", { hour12: false })
    : "—";
  const batColor = event.sos ? "var(--red)" : event.battery_pct < 20 ? "var(--amber)" : "var(--teal)";

  return (
    <div className="fade-in" style={{
      borderLeft: `2px solid ${event.sos ? "var(--red)" : isFirst ? "var(--teal)" : "var(--border)"}`,
      padding: "7px 10px", marginBottom: 4,
      background: event.sos ? "var(--red-dim)" : "transparent",
      borderRadius: "0 6px 6px 0",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <span style={{ color: event.sos ? "var(--red)" : "var(--text-secondary)" }}>
          {event.sos ? "🚨 SOS" : isFirst ? "● LATEST" : "·  ping"}
        </span>
        <span style={{ color: "var(--text-muted)" }}>{time}</span>
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)",
        marginTop: 4, display: "flex", justifyContent: "space-between",
      }}>
        <span>{event.latitude?.toFixed(5)}, {event.longitude?.toFixed(5)}</span>
        <span style={{ color: batColor }}>{event.battery_pct ?? "—"}%</span>
      </div>
    </div>
  );
}

function haversine(a, b) {
  const R = 6371;
  const dLat = deg2rad(b.latitude  - a.latitude);
  const dLon = deg2rad(b.longitude - a.longitude);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(a.latitude)) * Math.cos(deg2rad(b.latitude)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
function deg2rad(d) { return (d * Math.PI) / 180; }
