// export default function TrackerList({ trackers, missing = [], selected, onSelect, deviceMap = {}, onAssign }) {
//   const missingIds = new Set(missing.map((m) => m.device_id));

//   // Split trackers into assigned and unassigned
//   const assigned   = trackers.filter((t) => deviceMap[t.device_id]);
//   const unassigned = trackers.filter((t) => !deviceMap[t.device_id]);

//   const sortFn = (a, b) => {
//     const camperA = deviceMap[a.device_id];
//     const camperB = deviceMap[b.device_id];
//     if (a.sos && !b.sos) return -1;
//     if (!a.sos && b.sos) return 1;
//     if (missingIds.has(a.device_id)) return -1;
//     if (missingIds.has(b.device_id)) return 1;
//     // Sort out-of-camp to bottom
//     if (camperA && !camperA.in_camp && camperB?.in_camp) return 1;
//     if (camperA?.in_camp && camperB && !camperB.in_camp) return -1;
//     return (a.battery_pct ?? 100) - (b.battery_pct ?? 100);
//   };

//   const sortedAssigned = [...assigned].sort(sortFn);

//   return (
//     <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
//       <div style={{
//         padding: "12px 16px", borderBottom: "1px solid var(--border)",
//         fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)",
//         letterSpacing: "0.1em", flexShrink: 0,
//       }}>
//         TRACKERS — {trackers.length} LIVE{missing.length > 0 && ` · ${missing.length} MISSING`}
//       </div>

//       <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>

//         {/* Missing */}
//         {missing.map((m) => (
//           <MissingCard key={m.device_id} missing={m} camper={deviceMap[m.device_id]} />
//         ))}

//         {trackers.length === 0 && (
//           <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 12 }}>
//             Waiting for trackers…
//           </div>
//         )}

//         {/* Assigned trackers */}
//         {sortedAssigned.map((t) => (
//           <TrackerRow
//             key={t.device_id}
//             tracker={t}
//             camper={deviceMap[t.device_id]}
//             isMissing={missingIds.has(t.device_id)}
//             selected={selected === t.device_id}
//             onClick={() => onSelect(t.device_id === selected ? null : t.device_id)}
//           />
//         ))}

//         {/* Unassigned section */}
//         {unassigned.length > 0 && (
//           <>
//             <div style={{
//               fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)",
//               letterSpacing: "0.08em", padding: "10px 8px 6px",
//               borderTop: assigned.length > 0 ? "1px solid var(--border)" : "none",
//               marginTop: assigned.length > 0 ? 6 : 0,
//             }}>
//               UNASSIGNED — {unassigned.length}
//             </div>
//             {unassigned.map((t) => (
//               <UnassignedRow
//                 key={t.device_id}
//                 tracker={t}
//                 selected={selected === t.device_id}
//                 onClick={() => onSelect(t.device_id === selected ? null : t.device_id)}
//                 onAssign={onAssign}
//               />
//             ))}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// function MissingCard({ missing, camper }) {
//   const name = camper ? `${camper.first_name} ${camper.last_name}` : missing.device_id;
//   return (
//     <div className="fade-in" style={{
//       background: "var(--amber-dim)", border: "1px solid var(--amber)",
//       borderRadius: 8, padding: "10px 12px", marginBottom: 6,
//     }}>
//       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//         <Avatar name={name} color="var(--amber)" size={28} />
//         <div style={{ flex: 1 }}>
//           <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: "var(--amber)" }}>
//             ⚠️ {name}
//           </div>
//           <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
//             {camper && `Age ${camper.age ?? "—"} · ${camper.role} · `}Last seen {missing.ageMinutes}m ago
//           </div>
//         </div>
//         <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--amber)", flexShrink: 0 }}>LOST SIGNAL</span>
//       </div>
//     </div>
//   );
// }

// function TrackerRow({ tracker, camper, isMissing, selected, onClick }) {
//   const { device_id, battery_pct, sos, createdAt } = tracker;
//   const name     = camper ? `${camper.first_name} ${camper.last_name}` : device_id;
//   const sub      = camper ? `${device_id} · Age ${camper.age ?? "—"} · ${camper.role}` : "unassigned";
//   const outOfCamp = camper && !camper.in_camp;

//   const statusColor = sos        ? "var(--red)"
//     : isMissing                  ? "var(--amber)"
//     : outOfCamp                  ? "var(--text-muted)"
//     : battery_pct < 20           ? "var(--amber)"
//     : "var(--teal)";

//   const lastSeen = createdAt
//     ? new Date(createdAt).toLocaleTimeString("en-NG", { hour12: false })
//     : "—";

//   return (
//     <div onClick={onClick} className="fade-in" style={{
//       background: selected ? "var(--bg-hover)" : "var(--bg-card)",
//       border: `1px solid ${sos ? "var(--red)" : selected ? "var(--border-light)" : "var(--border)"}`,
//       borderRadius: 8, padding: "9px 12px", marginBottom: 6,
//       cursor: "pointer", transition: "all 0.15s",
//       opacity: outOfCamp ? 0.6 : 1,
//       boxShadow: sos ? "0 0 12px var(--red-dim)" : "none",
//     }}>
//       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//         <Avatar name={name} color={statusColor} size={28} />
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//             <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500, color: sos ? "var(--red)" : "var(--text-primary)" }}>
//               {sos && "🚨 "}{name}
//             </span>
//             {outOfCamp && (
//               <span style={{
//                 fontFamily: "var(--font-mono)", fontSize: 9,
//                 background: "var(--bg-base)", border: "1px solid var(--border)",
//                 color: "var(--text-muted)", borderRadius: 3, padding: "1px 5px",
//               }}>OUT OF CAMP</span>
//             )}
//           </div>
//           <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//             {sub}
//           </div>
//         </div>
//         <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>{lastSeen}</span>
//       </div>

//       <div style={{ marginTop: 7 }}>
//         <div style={{ height: 3, background: "var(--bg-base)", borderRadius: 2, overflow: "hidden" }}>
//           <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, battery_pct ?? 0))}%`, borderRadius: 2, background: statusColor, transition: "width 0.4s" }} />
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
//           <span style={{ color: statusColor }}>{battery_pct ?? "—"}% bat</span>
//           <span>{tracker.latitude?.toFixed(4)}, {tracker.longitude?.toFixed(4)}</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// function UnassignedRow({ tracker, selected, onClick, onAssign }) {
//   const { device_id, battery_pct, sos } = tracker;
//   const statusColor = sos ? "var(--red)" : "var(--text-muted)";

//   return (
//     <div onClick={onClick} className="fade-in" style={{
//       background: selected ? "var(--bg-hover)" : "var(--bg-base)",
//       border: `1px dashed ${selected ? "var(--border-light)" : "var(--border)"}`,
//       borderRadius: 8, padding: "8px 12px", marginBottom: 5,
//       cursor: "pointer", transition: "all 0.15s",
//     }}>
//       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//         <div style={{
//           width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
//           background: "var(--bg-card)", border: `1px dashed ${statusColor}`,
//           display: "grid", placeItems: "center",
//           fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)",
//         }}>?</div>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)" }}>
//             {sos && "🚨 "}{device_id}
//           </div>
//           <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
//             {battery_pct ?? "—"}% · unassigned
//           </div>
//         </div>
//         {onAssign && (
//           <button
//             onClick={(e) => { e.stopPropagation(); onAssign(device_id); }}
//             style={{
//               background: "var(--teal-dim)", border: "1px solid var(--teal)",
//               color: "var(--teal)", borderRadius: 5, padding: "3px 8px",
//               fontSize: 10, fontFamily: "var(--font-mono)", cursor: "pointer", flexShrink: 0,
//             }}
//           >ASSIGN</button>
//         )}
//       </div>
//     </div>
//   );
// }

// export function Avatar({ name = "?", color = "var(--teal)", size = 32 }) {
//   const initials = name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
//   return (
//     <div style={{
//       width: size, height: size, borderRadius: "50%", flexShrink: 0,
//       background: `${color}22`, border: `2px solid ${color}`,
//       display: "grid", placeItems: "center",
//       fontFamily: "var(--font-ui)", fontSize: size * 0.35, fontWeight: 700,
//       color, userSelect: "none",
//     }}>
//       {initials}
//     </div>
//   );
// }


export default function TrackerList({ trackers, missing = [], selected, onSelect, deviceMap = {} }) {
  const missingIds = new Set(missing.map((m) => m.device_id));

  // Only show trackers that are assigned to a person
  const assigned = trackers.filter((t) => deviceMap[t.device_id]);

  const sorted = [...assigned].sort((a, b) => {
    const ca = deviceMap[a.device_id];
    const cb = deviceMap[b.device_id];
    if (a.sos && !b.sos) return -1;
    if (!a.sos && b.sos) return 1;
    if (missingIds.has(a.device_id)) return -1;
    if (missingIds.has(b.device_id)) return 1;
    if (ca && !ca.in_camp && cb?.in_camp) return 1;
    if (ca?.in_camp && cb && !cb.in_camp) return -1;
    return (a.battery_pct ?? 100) - (b.battery_pct ?? 100);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)",
        letterSpacing: "0.1em", flexShrink: 0,
      }}>
        TRACKERS — {sorted.length} ASSIGNED{missing.length > 0 && ` · ${missing.length} MISSING`}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {missing.map((m) => {
          const camper = deviceMap[m.device_id];
          if (!camper) return null; // don't show missing unassigned either
          return <MissingCard key={m.device_id} missing={m} camper={camper} />;
        })}

        {sorted.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)", fontSize: 12, lineHeight: 1.8 }}>
            No assigned trackers live.<br />
            <span style={{ fontSize: 11 }}>Assign a Tracker ID to a person<br />under the PEOPLE tab.</span>
          </div>
        )}

        {sorted.map((t) => (
          <TrackerRow
            key={t.device_id}
            tracker={t}
            camper={deviceMap[t.device_id]}
            isMissing={missingIds.has(t.device_id)}
            selected={selected === t.device_id}
            onClick={() => onSelect(t.device_id === selected ? null : t.device_id)}
          />
        ))}
      </div>
    </div>
  );
}

function MissingCard({ missing, camper }) {
  const name = `${camper.first_name} ${camper.last_name}`;
  return (
    <div className="fade-in" style={{
      background: "var(--amber-dim)", border: "1px solid var(--amber)",
      borderRadius: 8, padding: "10px 12px", marginBottom: 6,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar name={name} color="var(--amber)" size={28} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: "var(--amber)" }}>
            ⚠️ {name}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
            {missing.device_id} · Last seen {missing.ageMinutes}m ago
          </div>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--amber)", flexShrink: 0 }}>
          LOST SIGNAL
        </span>
      </div>
    </div>
  );
}

function TrackerRow({ tracker, camper, isMissing, selected, onClick }) {
  const { device_id, battery_pct, sos, createdAt } = tracker;
  const name      = `${camper.first_name} ${camper.last_name}`;
  const outOfCamp = !camper.in_camp;

  const statusColor = sos          ? "var(--red)"
    : isMissing                    ? "var(--amber)"
    : outOfCamp                    ? "var(--text-muted)"
    : battery_pct < 20             ? "var(--amber)"
    : "var(--teal)";

  const lastSeen = createdAt
    ? new Date(createdAt).toLocaleTimeString("en-NG", { hour12: false })
    : "—";

  return (
    <div onClick={onClick} className="fade-in" style={{
      background: selected ? "var(--bg-hover)" : "var(--bg-card)",
      border: `1px solid ${sos ? "var(--red)" : selected ? "var(--border-light)" : "var(--border)"}`,
      borderRadius: 8, padding: "9px 12px", marginBottom: 6,
      cursor: "pointer", transition: "all 0.15s",
      opacity: outOfCamp ? 0.6 : 1,
      boxShadow: sos ? "0 0 12px var(--red-dim)" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar name={name} color={statusColor} size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500,
              color: sos ? "var(--red)" : "var(--text-primary)",
            }}>
              {sos && "🚨 "}{name}
            </span>
            {outOfCamp && (
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 9,
                background: "var(--bg-base)", border: "1px solid var(--border)",
                color: "var(--text-muted)", borderRadius: 3, padding: "1px 5px",
              }}>OUT</span>
            )}
          </div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)",
            marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {device_id} · Age {camper.age ?? "—"} · {camper.role}
          </div>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>
          {lastSeen}
        </span>
      </div>

      <div style={{ marginTop: 7 }}>
        <div style={{ height: 3, background: "var(--bg-base)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${Math.max(0, Math.min(100, battery_pct ?? 0))}%`,
            borderRadius: 2, background: statusColor, transition: "width 0.4s",
          }} />
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between", marginTop: 3,
          fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)",
        }}>
          <span style={{ color: statusColor }}>{battery_pct ?? "—"}% bat</span>
          <span>{tracker.latitude?.toFixed(4)}, {tracker.longitude?.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}

export function Avatar({ name = "?", color = "var(--teal)", size = 32 }) {
  const initials = name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `${color}22`, border: `2px solid ${color}`,
      display: "grid", placeItems: "center",
      fontFamily: "var(--font-ui)", fontSize: size * 0.35, fontWeight: 700,
      color, userSelect: "none",
    }}>
      {initials}
    </div>
  );
}