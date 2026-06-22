// import { useEffect, useState } from "react";
// import socket from "../../services/socket";

// export default function Header({ trackerCount, activeAlerts, zoneAlerts, missingCount, username, isMuted, onMuteToggle, onLogout, searchSlot }) {
//   const [connected, setConnected] = useState(socket.connected);
//   const [time, setTime]           = useState(new Date());

//   useEffect(() => {
//     socket.on("connect",    () => setConnected(true));
//     socket.on("disconnect", () => setConnected(false));
//     const tick = setInterval(() => setTime(new Date()), 1000);
//     return () => { socket.off("connect"); socket.off("disconnect"); clearInterval(tick); };
//   }, []);

//   const fmt = (d) =>
//     d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

//   return (
//     <header style={{
//       height: "var(--header-h)", background: "var(--bg-panel)",
//       borderBottom: "1px solid var(--border)",
//       display: "flex", alignItems: "center", padding: "0 16px", gap: 16,
//       flexShrink: 0, zIndex: 10,
//     }}>
//       {/* Logo */}
//       <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
//         <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--teal)", display: "grid", placeItems: "center" }}>
//           <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//             <circle cx="8" cy="8" r="3" fill="#0A0E17"/>
//             <circle cx="8" cy="8" r="6.5" stroke="#0A0E17" strokeWidth="1.5"/>
//             <line x1="8" y1="1" x2="8" y2="3.5" stroke="#0A0E17" strokeWidth="1.5" strokeLinecap="round"/>
//             <line x1="8" y1="12.5" x2="8" y2="15" stroke="#0A0E17" strokeWidth="1.5" strokeLinecap="round"/>
//             <line x1="1" y1="8" x2="3.5" y2="8" stroke="#0A0E17" strokeWidth="1.5" strokeLinecap="round"/>
//             <line x1="12.5" y1="8" x2="15" y2="8" stroke="#0A0E17" strokeWidth="1.5" strokeLinecap="round"/>
//           </svg>
//         </div>
//         <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>CampSafe</span>
//       </div>

//       <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0 }} />

//       {/* Stats */}
//       <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
//         <Stat label="LIVE"    value={trackerCount} color="var(--teal)" />
//         {missingCount > 0 && <Stat label="MISSING" value={missingCount} color="var(--amber)" blink />}
//         {activeAlerts > 0 && <Stat label="SOS"     value={activeAlerts} color="var(--red)"   blink />}
//         {zoneAlerts   > 0 && <Stat label="ZONE"    value={zoneAlerts}   color="var(--amber)" />}
//       </div>

//       {/* Search slot */}
//       {searchSlot && <div style={{ flex: 1 }}>{searchSlot}</div>}
//       {!searchSlot && <div style={{ flex: 1 }} />}

//       {/* Mute */}
//       <button onClick={onMuteToggle} title={isMuted ? "Unmute" : "Mute"} style={{
//         background: "transparent", border: `1px solid ${isMuted ? "var(--border)" : "var(--teal)"}`,
//         borderRadius: 6, width: 30, height: 30, cursor: "pointer",
//         display: "grid", placeItems: "center", fontSize: 14, flexShrink: 0,
//       }}>
//         {isMuted ? "🔇" : "🔔"}
//       </button>

//       {/* Connection */}
//       <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
//         <div style={{
//           width: 7, height: 7, borderRadius: "50%",
//           background: connected ? "var(--teal)" : "var(--red)",
//           boxShadow: connected ? "0 0 6px var(--teal-glow)" : "none",
//         }} />
//         <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
//           {connected ? "LIVE" : "OFF"}
//         </span>
//       </div>

//       {/* Clock */}
//       <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", minWidth: 76, flexShrink: 0 }}>
//         {fmt(time)}
//       </span>

//       {/* User */}
//       <div style={{ display: "flex", alignItems: "center", gap: 8, borderLeft: "1px solid var(--border)", paddingLeft: 14, flexShrink: 0 }}>
//         <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{username}</span>
//         <button onClick={onLogout} style={{
//           background: "transparent", border: "1px solid var(--border)",
//           color: "var(--text-muted)", borderRadius: 5,
//           padding: "3px 8px", fontSize: 11, cursor: "pointer", fontFamily: "var(--font-mono)",
//         }}>EXIT</button>
//       </div>
//     </header>
//   );
// }

// function Stat({ label, value, color, blink }) {
//   return (
//     <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
//       <span style={{ fontSize: 17, fontWeight: 600, color, animation: blink ? "sos-pulse 1.4s ease-out infinite" : "none" }}>{value}</span>
//       <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>{label}</span>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import socket from "../../services/socket";

export default function Header({ trackerCount, activeAlerts, zoneAlerts, missingCount, username, isMuted, onMuteToggle, onLogout, searchSlot }) {
  const [connected, setConnected] = useState(socket.connected);
  const [time, setTime]           = useState(new Date());

  useEffect(() => {
    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => { socket.off("connect"); socket.off("disconnect"); clearInterval(tick); };
  }, []);

  const fmt = (d) =>
    d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <header style={{
      height: "var(--header-h)", background: "var(--bg-panel)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", padding: "0 16px", gap: 16,
      flexShrink: 0, zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--teal)", display: "grid", placeItems: "center" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" fill="#0A0E17"/>
            <circle cx="8" cy="8" r="6.5" stroke="#0A0E17" strokeWidth="1.5"/>
            <line x1="8" y1="1" x2="8" y2="3.5" stroke="#0A0E17" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="12.5" x2="8" y2="15" stroke="#0A0E17" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="1" y1="8" x2="3.5" y2="8" stroke="#0A0E17" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="12.5" y1="8" x2="15" y2="8" stroke="#0A0E17" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>CampSafe</span>
      </div>

      <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0 }} />

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
        <Stat label="LIVE"    value={trackerCount} color="var(--teal)" />
        {missingCount > 0 && <Stat label="MISSING" value={missingCount} color="var(--amber)" blink />}
        {activeAlerts > 0 && <Stat label="SOS"     value={activeAlerts} color="var(--red)"   blink />}
        {zoneAlerts   > 0 && <Stat label="ZONE"    value={zoneAlerts}   color="var(--amber)" />}
      </div>

      {/* Search slot */}
      {searchSlot && <div style={{ flex: 1 }}>{searchSlot}</div>}
      {!searchSlot && <div style={{ flex: 1 }} />}

      {/* Mute */}
      <button onClick={onMuteToggle} title={isMuted ? "Unmute" : "Mute"} style={{
        background: "transparent", border: `1px solid ${isMuted ? "var(--border)" : "var(--teal)"}`,
        borderRadius: 6, width: 30, height: 30, cursor: "pointer",
        display: "grid", placeItems: "center", fontSize: 14, flexShrink: 0,
      }}>
        {isMuted ? "🔇" : "🔔"}
      </button>

      {/* Connection */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%",
          background: connected ? "var(--teal)" : "var(--red)",
          boxShadow: connected ? "0 0 6px var(--teal-glow)" : "none",
        }} />
        <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
          {connected ? "LIVE" : "OFF"}
        </span>
      </div>

      {/* Clock */}
      <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", minWidth: 76, flexShrink: 0 }}>
        {fmt(time)}
      </span>

      {/* Simulator link */}
      {/* <a href="/simulator" style={{
        background: "transparent", border: "1px solid var(--border)",
        color: "var(--text-secondary)", borderRadius: 6,
        padding: "5px 10px", fontSize: 11, fontFamily: "var(--font-mono)",
        textDecoration: "none", flexShrink: 0,
      }}>🎮 SIMULATOR</a> */}

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, borderLeft: "1px solid var(--border)", paddingLeft: 14, flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{username}</span>
        <button onClick={onLogout} style={{
          background: "transparent", border: "1px solid var(--border)",
          color: "var(--text-muted)", borderRadius: 5,
          padding: "3px 8px", fontSize: 11, cursor: "pointer", fontFamily: "var(--font-mono)",
        }}>EXIT</button>
      </div>
    </header>
  );
}

function Stat({ label, value, color, blink }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
      <span style={{ fontSize: 17, fontWeight: 600, color, animation: blink ? "sos-pulse 1.4s ease-out infinite" : "none" }}>{value}</span>
      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>{label}</span>
    </div>
  );
}