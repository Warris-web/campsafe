// import { useState, useEffect, useCallback } from "react";
// import { api } from "../../services/api";
// import socket from "../../services/socket";

// const ACTION_META = {
//   resolved_sos:        { label: "Resolved SOS",       color: "var(--red)"   },
//   acknowledged_breach: { label: "Zone Breach",         color: "var(--amber)" },
//   checked_in_camper:   { label: "Checked In",          color: "var(--teal)"  },
//   checked_out_camper:  { label: "Checked Out",         color: "var(--text-muted)" },
//   assigned_device:     { label: "Assigned Device",     color: "var(--teal)"  },
//   added_person:        { label: "Added Person",        color: "var(--teal)"  },
//   edited_person:       { label: "Edited Person",       color: "var(--text-secondary)" },
//   removed_person:      { label: "Removed Person",      color: "var(--amber)" },
//   added_family:        { label: "Added Family",        color: "var(--teal)"  },
//   edited_family:       { label: "Edited Family",       color: "var(--text-secondary)" },
//   removed_family:      { label: "Removed Family",      color: "var(--amber)" },
// };

// export default function StaffLog() {
//   const [summary,  setSummary]  = useState([]);
//   const [logs,     setLogs]     = useState([]);
//   const [filtered, setFiltered] = useState(null);
//   const [loading,  setLoading]  = useState(true);

//   const load = useCallback(() => {
//     setLoading(true);
//     Promise.all([api.getStaffSummary(), api.getStaffLogs()])
//       .then(([s, l]) => { setSummary(s); setLogs(l); })
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => {
//     load();
//     // Reload when new alert is resolved via socket
//     socket.on("sos_alert",    load);
//     socket.on("zone_breach",  load);
//     return () => { socket.off("sos_alert", load); socket.off("zone_breach", load); };
//   }, [load]);

//   const visibleLogs = filtered
//     ? logs.filter((l) => l.username === filtered)
//     : logs;

//   return (
//     <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
//       {/* Header */}
//       <div style={{
//         padding: "12px 16px", borderBottom: "1px solid var(--border)",
//         display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
//       }}>
//         <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
//           STAFF ACTIVITY
//         </span>
//         <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//           {filtered && (
//             <button onClick={() => setFiltered(null)} style={{
//               background: "transparent", border: "1px solid var(--border)",
//               color: "var(--text-muted)", borderRadius: 4, padding: "2px 8px",
//               fontSize: 10, fontFamily: "var(--font-mono)", cursor: "pointer",
//             }}>CLEAR</button>
//           )}
//           <button onClick={load} style={{
//             background: "transparent", border: "1px solid var(--border)",
//             color: "var(--text-muted)", borderRadius: 4, padding: "2px 8px",
//             fontSize: 10, fontFamily: "var(--font-mono)", cursor: "pointer",
//           }}>↻</button>
//         </div>
//       </div>

//       {loading && (
//         <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
//           Loading…
//         </div>
//       )}

//       {!loading && (
//         <>
//           {/* Staff cards */}
//           <div style={{ padding: "8px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
//             {summary.length === 0 && (
//               <div style={{ textAlign: "center", padding: "12px 0", color: "var(--text-muted)", fontSize: 12 }}>
//                 No activity yet — resolve an SOS or add a camper to see logs here
//               </div>
//             )}
//             {summary.map((s) => {
//               const isSelected = filtered === s._id.username;
//               const lastActive = s.lastActive
//                 ? new Date(s.lastActive).toLocaleTimeString("en-NG", { hour12: false })
//                 : "—";
//               return (
//                 <div
//                   key={s._id.username}
//                   onClick={() => setFiltered(isSelected ? null : s._id.username)}
//                   style={{
//                     display: "flex", alignItems: "center", gap: 10,
//                     padding: "9px 10px",
//                     background: isSelected ? "var(--teal-dim)" : "var(--bg-card)",
//                     border: `1px solid ${isSelected ? "var(--teal)" : "var(--border)"}`,
//                     borderRadius: 8, marginBottom: 6, cursor: "pointer",
//                     transition: "all 0.15s",
//                   }}
//                 >
//                   {/* Avatar */}
//                   <div style={{
//                     width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
//                     background: isSelected ? "var(--teal)" : "var(--bg-base)",
//                     border: `2px solid ${isSelected ? "var(--teal)" : "var(--border)"}`,
//                     display: "grid", placeItems: "center",
//                     fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
//                     color: isSelected ? "#0A0E17" : "var(--text-secondary)",
//                   }}>
//                     {s._id.username.slice(0, 2).toUpperCase()}
//                   </div>

//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
//                       {s._id.username}
//                     </div>
//                     <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
//                       {s._id.role} · {s.count} action{s.count !== 1 ? "s" : ""} · {lastActive}
//                     </div>
//                   </div>

//                   {/* Activity breakdown */}
//                   <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: isSelected ? "var(--teal)" : "var(--text-muted)", flexShrink: 0 }}>
//                     {isSelected ? "FILTERED ✕" : "FILTER"}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Log entries */}
//           <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
//             {filtered && (
//               <div style={{
//                 fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--teal)",
//                 padding: "4px 8px 8px", letterSpacing: "0.06em",
//               }}>
//                 SHOWING: {filtered}
//               </div>
//             )}

//             {visibleLogs.length === 0 && (
//               <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 12 }}>
//                 {filtered ? `No activity for ${filtered}` : "No activity logged yet"}
//               </div>
//             )}

//             {visibleLogs.map((log) => {
//               const meta = ACTION_META[log.action] || { label: log.action, color: "var(--text-muted)" };
//               const time = new Date(log.createdAt).toLocaleTimeString("en-NG", { hour12: false });
//               const date = new Date(log.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" });

//               return (
//                 <div key={log._id} className="fade-in" style={{
//                   borderLeft: `2px solid ${meta.color}`,
//                   padding: "8px 10px", marginBottom: 5,
//                   background: "var(--bg-card)", borderRadius: "0 7px 7px 0",
//                 }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                     <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: meta.color, fontWeight: 600 }}>
//                       {meta.label}
//                     </span>
//                     <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
//                       {date} {time}
//                     </span>
//                   </div>
//                   <div style={{
//                     fontFamily: "var(--font-mono)", fontSize: 10,
//                     color: "var(--text-muted)", marginTop: 4, lineHeight: 1.6,
//                   }}>
//                     <span style={{
//                       color: "var(--text-secondary)",
//                       background: "var(--bg-base)", borderRadius: 3,
//                       padding: "1px 5px", marginRight: 6,
//                     }}>
//                       {log.username}
//                     </span>
//                     {log.detail}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import socket from "../../services/socket";
import ExportReportButton from "./ExportReportButton";

const ACTION_META = {
  resolved_sos:        { label: "Resolved SOS",       color: "var(--red)"   },
  acknowledged_breach: { label: "Zone Breach",         color: "var(--amber)" },
  checked_in_camper:   { label: "Checked In",          color: "var(--teal)"  },
  checked_out_camper:  { label: "Checked Out",         color: "var(--text-muted)" },
  assigned_device:     { label: "Assigned Device",     color: "var(--teal)"  },
  added_person:        { label: "Added Person",        color: "var(--teal)"  },
  edited_person:       { label: "Edited Person",       color: "var(--text-secondary)" },
  removed_person:      { label: "Removed Person",      color: "var(--amber)" },
  added_family:        { label: "Added Family",        color: "var(--teal)"  },
  edited_family:       { label: "Edited Family",       color: "var(--text-secondary)" },
  removed_family:      { label: "Removed Family",      color: "var(--amber)" },
};

export default function StaffLog() {
  const [summary,  setSummary]  = useState([]);
  const [logs,     setLogs]     = useState([]);
  const [filtered, setFiltered] = useState(null);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.getStaffSummary(), api.getStaffLogs()])
      .then(([s, l]) => { setSummary(s); setLogs(l); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    // Reload when new alert is resolved via socket
    socket.on("sos_alert",    load);
    socket.on("zone_breach",  load);
    return () => { socket.off("sos_alert", load); socket.off("zone_breach", load); };
  }, [load]);

  const visibleLogs = filtered
    ? logs.filter((l) => l.username === filtered)
    : logs;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
          STAFF ACTIVITY
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <ExportReportButton />
          {filtered && (
            <button onClick={() => setFiltered(null)} style={{
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-muted)", borderRadius: 4, padding: "2px 8px",
              fontSize: 10, fontFamily: "var(--font-mono)", cursor: "pointer",
            }}>CLEAR</button>
          )}
          <button onClick={load} style={{
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--text-muted)", borderRadius: 4, padding: "2px 8px",
            fontSize: 10, fontFamily: "var(--font-mono)", cursor: "pointer",
          }}>↻</button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
          Loading…
        </div>
      )}

      {!loading && (
        <>
          {/* Staff cards */}
          <div style={{ padding: "8px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            {summary.length === 0 && (
              <div style={{ textAlign: "center", padding: "12px 0", color: "var(--text-muted)", fontSize: 12 }}>
                No activity yet — resolve an SOS or add a camper to see logs here
              </div>
            )}
            {summary.map((s) => {
              const isSelected = filtered === s._id.username;
              const lastActive = s.lastActive
                ? new Date(s.lastActive).toLocaleTimeString("en-NG", { hour12: false })
                : "—";
              return (
                <div
                  key={s._id.username}
                  onClick={() => setFiltered(isSelected ? null : s._id.username)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 10px",
                    background: isSelected ? "var(--teal-dim)" : "var(--bg-card)",
                    border: `1px solid ${isSelected ? "var(--teal)" : "var(--border)"}`,
                    borderRadius: 8, marginBottom: 6, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: isSelected ? "var(--teal)" : "var(--bg-base)",
                    border: `2px solid ${isSelected ? "var(--teal)" : "var(--border)"}`,
                    display: "grid", placeItems: "center",
                    fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
                    color: isSelected ? "#0A0E17" : "var(--text-secondary)",
                  }}>
                    {s._id.username.slice(0, 2).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                      {s._id.username}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                      {s._id.role} · {s.count} action{s.count !== 1 ? "s" : ""} · {lastActive}
                    </div>
                  </div>

                  {/* Activity breakdown */}
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: isSelected ? "var(--teal)" : "var(--text-muted)", flexShrink: 0 }}>
                    {isSelected ? "FILTERED ✕" : "FILTER"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Log entries */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {filtered && (
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--teal)",
                padding: "4px 8px 8px", letterSpacing: "0.06em",
              }}>
                SHOWING: {filtered}
              </div>
            )}

            {visibleLogs.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 12 }}>
                {filtered ? `No activity for ${filtered}` : "No activity logged yet"}
              </div>
            )}

            {visibleLogs.map((log) => {
              const meta = ACTION_META[log.action] || { label: log.action, color: "var(--text-muted)" };
              const time = new Date(log.createdAt).toLocaleTimeString("en-NG", { hour12: false });
              const date = new Date(log.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" });

              return (
                <div key={log._id} className="fade-in" style={{
                  borderLeft: `2px solid ${meta.color}`,
                  padding: "8px 10px", marginBottom: 5,
                  background: "var(--bg-card)", borderRadius: "0 7px 7px 0",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: meta.color, fontWeight: 600 }}>
                      {meta.label}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                      {date} {time}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    color: "var(--text-muted)", marginTop: 4, lineHeight: 1.6,
                  }}>
                    <span style={{
                      color: "var(--text-secondary)",
                      background: "var(--bg-base)", borderRadius: 3,
                      padding: "1px 5px", marginRight: 6,
                    }}>
                      {log.username}
                    </span>
                    {log.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}