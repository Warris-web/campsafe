import { useState } from "react";

export default function ZonePanel({ zones }) {
  const [expanded, setExpanded] = useState(null);

  const offline  = zones.filter((z) => !z.online);
  const alerts   = zones.filter((z) => z.online && (z.gas || z.motion));
  const nominal  = zones.filter((z) => z.online && !z.gas && !z.motion);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
          INFRASTRUCTURE — {zones.length} NODES
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {offline.length > 0 && <Badge count={offline.length} color="var(--text-muted)" label="OFF" />}
          {alerts.length  > 0 && <Badge count={alerts.length}  color="var(--amber)"      label="ALT" />}
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        borderBottom: "1px solid var(--border)", flexShrink: 0,
        background: "var(--border)", gap: 1,
      }}>
        <SummaryCell label="ONLINE"  value={zones.filter(z => z.online).length} color="var(--teal)" />
        <SummaryCell label="ALERTS"  value={alerts.length}  color={alerts.length  > 0 ? "var(--amber)" : "var(--text-muted)"} />
        <SummaryCell label="OFFLINE" value={offline.length} color={offline.length > 0 ? "var(--red)"   : "var(--text-muted)"} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {zones.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 12 }}>
            Waiting for nodes…
          </div>
        )}
        {[...offline, ...alerts, ...nominal].map((z) => (
          <ZoneCard key={z.zone_id} zone={z}
            expanded={expanded === z.zone_id}
            onToggle={() => setExpanded(expanded === z.zone_id ? null : z.zone_id)}
          />
        ))}
      </div>
    </div>
  );
}

function ZoneCard({ zone, expanded, onToggle }) {
  const { zone_name, online, motion, gas, last_seen } = zone;

  const borderColor = !online ? "var(--border)" : gas ? "var(--red)" : motion ? "var(--amber)" : "var(--border)";
  const statusColor = !online ? "var(--text-muted)" : gas ? "var(--red)" : motion ? "var(--amber)" : "var(--teal)";
  const statusLabel = !online ? "OFFLINE" : gas ? "GAS DETECTED" : motion ? "MOTION" : "NOMINAL";
  const lastSeenStr = last_seen ? new Date(last_seen).toLocaleTimeString("en-NG", { hour12: false }) : "—";

  return (
    <div className="fade-in" onClick={onToggle} style={{
      background: !online ? "var(--bg-base)" : gas ? "rgba(239,68,68,0.07)" : motion ? "rgba(245,158,11,0.07)" : "var(--bg-card)",
      border: `1px solid ${borderColor}`,
      borderRadius: 8, padding: "10px 12px", marginBottom: 6,
      cursor: "pointer", transition: "all 0.2s", opacity: !online ? 0.6 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
          background: statusColor, boxShadow: online ? `0 0 6px ${statusColor}88` : "none",
        }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", flex: 1 }}>
          {zone_name}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: statusColor, letterSpacing: "0.06em" }}>
          {statusLabel}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
        <SensorPill icon="👁️" label="PIR"  active={motion} activeColor="var(--amber)" />
        <SensorPill icon="💨" label="GAS"  active={gas}    activeColor="var(--red)"   />
        <SensorPill icon="📡" label="LINK" active={online} activeColor="var(--teal)"  />
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
          {lastSeenStr}
        </span>
      </div>

      {expanded && (
        <div style={{
          marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.8,
        }}>
          <div>ID: <span style={{ color: "var(--text-secondary)" }}>{zone.zone_id}</span></div>
          <div>Last ping: <span style={{ color: "var(--text-secondary)" }}>{lastSeenStr}</span></div>
          <div>Motion: <span style={{ color: motion ? "var(--amber)" : "var(--text-secondary)" }}>{motion ? "YES" : "clear"}</span></div>
          <div>Gas: <span style={{ color: gas ? "var(--red)" : "var(--text-secondary)" }}>{gas ? "DETECTED" : "clear"}</span></div>
        </div>
      )}
    </div>
  );
}

function SensorPill({ icon, label, active, activeColor }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 4,
      background: active ? `${activeColor}22` : "var(--bg-base)",
      border: `1px solid ${active ? activeColor : "var(--border)"}`,
      borderRadius: 4, padding: "2px 7px",
      fontFamily: "var(--font-mono)", fontSize: 10,
      color: active ? activeColor : "var(--text-muted)",
      transition: "all 0.2s",
    }}>
      <span style={{ fontSize: 11 }}>{icon}</span>
      {label}
    </div>
  );
}

function SummaryCell({ label, value, color }) {
  return (
    <div style={{ background: "var(--bg-panel)", padding: "8px 14px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600, color }}>{value}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2, letterSpacing: "0.08em" }}>
        {label}
      </div>
    </div>
  );
}

function Badge({ count, color, label }) {
  return (
    <span style={{
      background: "transparent", border: `1px solid ${color}`,
      color, borderRadius: 4, padding: "1px 7px",
      fontSize: 10, fontFamily: "var(--font-mono)",
    }}>
      {count} {label}
    </span>
  );
}
