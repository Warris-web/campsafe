// // /simulator — a virtual hardware control panel.
// // moving around camp. Every drag sends a position update to the backend
// // exactly like a real device would — the main dashboard reacts live.

// import { useState, useEffect, useRef, useCallback } from "react";
// import { MapContainer, TileLayer, useMap } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { simulatorApi } from "../services/api";
// import { useAuth } from "../context/AuthContext";

// const CENTER = [
//   parseFloat(import.meta.env.VITE_MAP_CENTER_LAT || "6.8077"),
//   parseFloat(import.meta.env.VITE_MAP_CENTER_LNG || "3.4564"),
// ];
// const ZOOM = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM || "17");

// // Fixed sensor zones — must match backend simulatorController.js
// const SENSOR_ZONES = [
//   { zone_id: "ZONE_GEN",    zone_name: "Generator Room", lat: 6.8081, lng: 3.4568, radiusM: 35 },
//   { zone_id: "ZONE_GATE_A", zone_name: "Main Gate",      lat: 6.8100, lng: 3.4560, radiusM: 35 },
//   { zone_id: "ZONE_GATE_B", zone_name: "Back Gate",      lat: 6.8055, lng: 3.4548, radiusM: 35 },
//   { zone_id: "ZONE_MED",    zone_name: "Medical Bay",    lat: 6.8068, lng: 3.4579, radiusM: 35 },
//   { zone_id: "ZONE_STORE",  zone_name: "Storage Block",  lat: 6.8090, lng: 3.4540, radiusM: 35 },
// ];

// const TAG_COLORS = ["#00D4AA", "#3B82F6", "#F59E0B", "#A855F7", "#EC4899", "#10B981", "#F97316"];

// function SensorZoneCircles() {
//   const map = useMap();
//   useEffect(() => {
//     const circles = SENSOR_ZONES.map((z) =>
//       L.circle([z.lat, z.lng], {
//         radius: z.radiusM,
//         color: "#94A3B8", weight: 1.5, dashArray: "4 4",
//         fillColor: "#94A3B8", fillOpacity: 0.05,
//       })
//         .bindTooltip(z.zone_name, { permanent: true, direction: "top", className: "cs-sensor-tooltip" })
//         .addTo(map)
//     );
//     return () => circles.forEach((c) => c.remove());
//   }, [map]);
//   return null;
// }

// function DraggableTags({ tags, onDrag, onDragEnd }) {
//   const map = useMap();
//   const markersRef = useRef({});

//   useEffect(() => {
//     const currentIds = new Set(tags.map((t) => t.device_id));
//     Object.keys(markersRef.current).forEach((id) => {
//       if (!currentIds.has(id)) { markersRef.current[id].remove(); delete markersRef.current[id]; }
//     });

//     tags.forEach((tag, i) => {
//       const color = tag.color || TAG_COLORS[i % TAG_COLORS.length];
//       const icon = buildIcon(tag, color);
//       const latlng = [tag.lat, tag.lng];

//       if (markersRef.current[tag.device_id]) {
//         markersRef.current[tag.device_id].setIcon(icon);
//         // Don't override position if user is actively dragging it
//       } else {
//         const marker = L.marker(latlng, { icon, draggable: true })
//           .addTo(map)
//           .bindTooltip(tag.device_id, { permanent: true, direction: "bottom", offset: [0, 8], className: "cs-tag-label" });

//         marker.on("drag", (e) => {
//           const { lat, lng } = e.target.getLatLng();
//           onDrag(tag.device_id, lat, lng);
//         });
//         marker.on("dragend", (e) => {
//           const { lat, lng } = e.target.getLatLng();
//           onDragEnd(tag.device_id, lat, lng);
//         });

//         markersRef.current[tag.device_id] = marker;
//       }
//     });
//   }, [tags, map, onDrag, onDragEnd]);

//   return null;
// }

// function buildIcon(tag, color) {
//   const size = 34;
//   const pulse = tag.sos
//     ? `<div style="position:absolute;inset:0;border-radius:50%;background:${color};animation:sos-pulse 1.4s ease-out infinite;"></div>`
//     : "";
//   return L.divIcon({
//     className: "",
//     iconAnchor: [size / 2, size / 2],
//     html: `<div style="position:relative;width:${size}px;height:${size}px;cursor:grab;">
//       ${pulse}
//       <div style="position:relative;z-index:1;width:${size}px;height:${size}px;border-radius:50%;
//         background:${color};border:3px solid white;
//         display:flex;align-items:center;justify-content:center;
//         box-shadow:0 2px 8px rgba(0,0,0,0.4);">
//         ${tag.sos
//           ? `<svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 2L7 8" stroke="white" stroke-width="2" stroke-linecap="round"/><circle cx="7" cy="11" r="1" fill="white"/></svg>`
//           : `<svg width="14" height="14" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="3" fill="white"/></svg>`}
//       </div>
//     </div>`,
//   });
// }

// export default function SimulatorPage() {
//   const { user } = useAuth();
//   const [tags, setTags] = useState([]);
//   const [newTagId, setNewTagId] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const dragThrottle = useRef({});

//   const load = useCallback(() => {
//     simulatorApi.listTags()
//       .then((data) => setTags(Array.isArray(data) ? data : []))
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => { load(); }, [load]);

//   // Local drag — update UI instantly, throttle network calls to every 150ms
//   const handleDrag = (id, lat, lng) => {
//     setTags((prev) => prev.map((t) => t.device_id === id ? { ...t, lat, lng } : t));

//     const now = Date.now();
//     if (dragThrottle.current[id] && now - dragThrottle.current[id] < 150) return;
//     dragThrottle.current[id] = now;
//     simulatorApi.moveTag(id, lat, lng).catch(() => {});
//   };

//   const handleDragEnd = (id, lat, lng) => {
//     simulatorApi.moveTag(id, lat, lng).catch(() => {});
//   };

//   const handleAddTag = async () => {
//     const id = newTagId.trim().toUpperCase();
//     if (!id) return;
//     setError("");
//     try {
//       const lat = CENTER[0] + (Math.random() - 0.5) * 0.002;
//       const lng = CENTER[1] + (Math.random() - 0.5) * 0.002;
//       const created = await simulatorApi.createTag(id, lat, lng);
//       setTags((prev) => [...prev, created]);
//       setNewTagId("");
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const handleRemoveTag = async (id) => {
//     await simulatorApi.deleteTag(id);
//     setTags((prev) => prev.filter((t) => t.device_id !== id));
//   };

//   const handleToggleSos = async (id, current) => {
//     const updated = await simulatorApi.toggleSos(id, !current);
//     setTags((prev) => prev.map((t) => t.device_id === id ? { ...t, sos: updated.sos } : t));
//   };

//   const handleResetAll = async () => {
//     if (!confirm("Remove all virtual tags?")) return;
//     await simulatorApi.resetAll();
//     setTags([]);
//   };

//   return (
//     <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)" }}>
//       {/* Sidebar */}
//       <div style={{
//         width: 320, flexShrink: 0, background: "var(--bg-panel)",
//         borderRight: "1px solid var(--border)",
//         display: "flex", flexDirection: "column", overflow: "hidden",
//       }}>
//         <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
//           <div style={{ fontFamily: "var(--font-ui)", fontSize: 16, fontWeight: 700, color: "var(--teal)" }}>
//             🎮 Virtual Hardware
//           </div>
//           <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
//             Drag tags on the map to simulate live tracker movement.
//             Watch the staff dashboard update in real time.
//           </div>
//         </div>

//         {/* Add tag */}
//         <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
//           <div style={{ display: "flex", gap: 6 }}>
//             <input
//               value={newTagId}
//               onChange={(e) => setNewTagId(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
//               placeholder="TAG_05"
//               style={{
//                 flex: 1, background: "var(--bg-base)", border: "1px solid var(--border-light)",
//                 borderRadius: 6, padding: "7px 10px", color: "var(--text-primary)",
//                 fontFamily: "var(--font-mono)", fontSize: 12, outline: "none",
//               }}
//             />
//             <button onClick={handleAddTag} style={{
//               background: "var(--teal)", color: "#0A0E17", border: "none",
//               borderRadius: 6, padding: "7px 14px", fontFamily: "var(--font-mono)",
//               fontSize: 12, fontWeight: 700, cursor: "pointer",
//             }}>+ ADD</button>
//           </div>
//           {error && <div style={{ color: "var(--red)", fontSize: 11, marginTop: 6, fontFamily: "var(--font-mono)" }}>{error}</div>}
//         </div>

//         {/* Tag list */}
//         <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
//           {loading && <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, padding: 20 }}>Loading…</div>}
//           {!loading && tags.length === 0 && (
//             <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, padding: 20, lineHeight: 1.7 }}>
//               No virtual tags yet.<br />Add one above to begin.
//             </div>
//           )}
//           {tags.map((tag, i) => (
//             <div key={tag.device_id} className="fade-in" style={{
//               background: tag.sos ? "var(--red-dim)" : "var(--bg-card)",
//               border: `1px solid ${tag.sos ? "var(--red)" : "var(--border)"}`,
//               borderRadius: 8, padding: "10px 12px", marginBottom: 8,
//             }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                 <div style={{
//                   width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
//                   background: TAG_COLORS[i % TAG_COLORS.length], border: "2px solid white",
//                 }} />
//                 <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: tag.sos ? "var(--red)" : "var(--text-primary)", flex: 1 }}>
//                   {tag.sos && "🚨 "}{tag.device_id}
//                 </span>
//                 <button onClick={() => handleRemoveTag(tag.device_id)} style={{
//                   background: "transparent", border: "none", color: "var(--text-muted)",
//                   cursor: "pointer", fontSize: 13,
//                 }}>🗑️</button>
//               </div>
//               <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>
//                 {tag.lat?.toFixed(5)}, {tag.lng?.toFixed(5)} · 🔋{Math.round(tag.battery_pct)}%
//               </div>
//               <button
//                 onClick={() => handleToggleSos(tag.device_id, tag.sos)}
//                 style={{
//                   width: "100%", marginTop: 8,
//                   background: tag.sos ? "var(--red)" : "transparent",
//                   border: `1px solid ${tag.sos ? "var(--red)" : "var(--border)"}`,
//                   color: tag.sos ? "white" : "var(--text-secondary)",
//                   borderRadius: 6, padding: "6px 0", fontSize: 11, fontWeight: 700,
//                   fontFamily: "var(--font-mono)", cursor: "pointer",
//                 }}
//               >
//                 {tag.sos ? "✕ CLEAR SOS" : "🚨 TRIGGER SOS"}
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* Reset */}
//         <div style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
//           <button onClick={handleResetAll} style={{
//             width: "100%", background: "transparent", border: "1px solid var(--border)",
//             color: "var(--text-muted)", borderRadius: 6, padding: "8px 0",
//             fontFamily: "var(--font-mono)", fontSize: 11, cursor: "pointer",
//           }}>RESET ALL TAGS</button>
//           <a href="/" style={{
//             display: "block", textAlign: "center", marginTop: 8,
//             color: "var(--teal)", fontFamily: "var(--font-mono)", fontSize: 11, textDecoration: "none",
//           }}>← Back to Dashboard</a>
//         </div>
//       </div>

//       {/* Map */}
//       <div style={{ flex: 1, position: "relative" }}>
//         <MapContainer center={CENTER} zoom={ZOOM} maxZoom={20} style={{ width: "100%", height: "100%" }}>
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='© OpenStreetMap'
//             maxZoom={20}
//           />
//           <SensorZoneCircles />
//           <DraggableTags tags={tags} onDrag={handleDrag} onDragEnd={handleDragEnd} />
//         </MapContainer>

//         <div style={{
//           position: "absolute", top: 16, left: 16, zIndex: 1000,
//           background: "rgba(10,14,23,0.9)", border: "1px solid var(--border)",
//           borderRadius: 8, padding: "8px 14px",
//           fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--teal)",
//         }}>
//           🎮 SIMULATOR MODE — drag any pin to move it live
//         </div>
//       </div>
//     </div>
//   );
// }


// /simulator — a virtual hardware control panel.
// moving around camp. Every drag sends a position update to the backend
// exactly like a real device would — the main dashboard reacts live.

// import { useState, useEffect, useRef, useCallback } from "react";
// import { MapContainer, TileLayer, useMap } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { simulatorApi } from "../services/api";
// import { useAuth } from "../context/AuthContext";
// import LoginScreen from "../components/auth/LoginScreen";

// const CENTER = [
//   parseFloat(import.meta.env.VITE_MAP_CENTER_LAT || "6.8077"),
//   parseFloat(import.meta.env.VITE_MAP_CENTER_LNG || "3.4564"),
// ];
// const ZOOM = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM || "17");

// // Fixed sensor zones — must match backend simulatorController.js
// const SENSOR_ZONES = [
//   { zone_id: "ZONE_GEN",    zone_name: "Generator Room", lat: 6.8081, lng: 3.4568, radiusM: 35 },
//   { zone_id: "ZONE_GATE_A", zone_name: "Main Gate",      lat: 6.8100, lng: 3.4560, radiusM: 35 },
//   { zone_id: "ZONE_GATE_B", zone_name: "Back Gate",      lat: 6.8055, lng: 3.4548, radiusM: 35 },
//   { zone_id: "ZONE_MED",    zone_name: "Medical Bay",    lat: 6.8068, lng: 3.4579, radiusM: 35 },
//   { zone_id: "ZONE_STORE",  zone_name: "Storage Block",  lat: 6.8090, lng: 3.4540, radiusM: 35 },
// ];

// const TAG_COLORS = ["#00D4AA", "#3B82F6", "#F59E0B", "#A855F7", "#EC4899", "#10B981", "#F97316"];

// function SensorZoneCircles() {
//   const map = useMap();
//   useEffect(() => {
//     const circles = SENSOR_ZONES.map((z) =>
//       L.circle([z.lat, z.lng], {
//         radius: z.radiusM,
//         color: "#94A3B8", weight: 1.5, dashArray: "4 4",
//         fillColor: "#94A3B8", fillOpacity: 0.05,
//       })
//         .bindTooltip(z.zone_name, { permanent: true, direction: "top", className: "cs-sensor-tooltip" })
//         .addTo(map)
//     );
//     return () => circles.forEach((c) => c.remove());
//   }, [map]);
//   return null;
// }

// function DraggableTags({ tags, onDrag, onDragEnd }) {
//   const map = useMap();
//   const markersRef = useRef({});

//   useEffect(() => {
//     const currentIds = new Set(tags.map((t) => t.device_id));
//     Object.keys(markersRef.current).forEach((id) => {
//       if (!currentIds.has(id)) { markersRef.current[id].remove(); delete markersRef.current[id]; }
//     });

//     tags.forEach((tag, i) => {
//       const color = tag.color || TAG_COLORS[i % TAG_COLORS.length];
//       const icon = buildIcon(tag, color);
//       const latlng = [tag.lat, tag.lng];

//       if (markersRef.current[tag.device_id]) {
//         markersRef.current[tag.device_id].setIcon(icon);
//         // Don't override position if user is actively dragging it
//       } else {
//         const marker = L.marker(latlng, { icon, draggable: true })
//           .addTo(map)
//           .bindTooltip(tag.device_id, { permanent: true, direction: "bottom", offset: [0, 8], className: "cs-tag-label" });

//         marker.on("drag", (e) => {
//           const { lat, lng } = e.target.getLatLng();
//           onDrag(tag.device_id, lat, lng);
//         });
//         marker.on("dragend", (e) => {
//           const { lat, lng } = e.target.getLatLng();
//           onDragEnd(tag.device_id, lat, lng);
//         });

//         markersRef.current[tag.device_id] = marker;
//       }
//     });
//   }, [tags, map, onDrag, onDragEnd]);

//   return null;
// }

// function buildIcon(tag, color) {
//   const size = 34;
//   const pulse = tag.sos
//     ? `<div style="position:absolute;inset:0;border-radius:50%;background:${color};animation:sos-pulse 1.4s ease-out infinite;"></div>`
//     : "";
//   return L.divIcon({
//     className: "",
//     iconAnchor: [size / 2, size / 2],
//     html: `<div style="position:relative;width:${size}px;height:${size}px;cursor:grab;">
//       ${pulse}
//       <div style="position:relative;z-index:1;width:${size}px;height:${size}px;border-radius:50%;
//         background:${color};border:3px solid white;
//         display:flex;align-items:center;justify-content:center;
//         box-shadow:0 2px 8px rgba(0,0,0,0.4);">
//         ${tag.sos
//           ? `<svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 2L7 8" stroke="white" stroke-width="2" stroke-linecap="round"/><circle cx="7" cy="11" r="1" fill="white"/></svg>`
//           : `<svg width="14" height="14" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="3" fill="white"/></svg>`}
//       </div>
//     </div>`,
//   });
// }

// export default function SimulatorPage() {
//   const { user } = useAuth();
//   if (!user) return <LoginScreen />;
//   return <SimulatorContent />;
// }

// function SimulatorContent() {
//   const { user } = useAuth();
//   const [tags, setTags] = useState([]);
//   const [newTagId, setNewTagId] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const dragThrottle = useRef({});

//   const load = useCallback(() => {
//     simulatorApi.listTags()
//       .then((data) => setTags(Array.isArray(data) ? data : []))
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => { load(); }, [load]);

//   // Local drag — update UI instantly, throttle network calls to every 150ms
//   const handleDrag = (id, lat, lng) => {
//     setTags((prev) => prev.map((t) => t.device_id === id ? { ...t, lat, lng } : t));

//     const now = Date.now();
//     if (dragThrottle.current[id] && now - dragThrottle.current[id] < 150) return;
//     dragThrottle.current[id] = now;
//     simulatorApi.moveTag(id, lat, lng).catch(() => {});
//   };

//   const handleDragEnd = (id, lat, lng) => {
//     simulatorApi.moveTag(id, lat, lng).catch(() => {});
//   };

//   const handleAddTag = async () => {
//     const id = newTagId.trim().toUpperCase();
//     if (!id) return;
//     setError("");
//     try {
//       const lat = CENTER[0] + (Math.random() - 0.5) * 0.002;
//       const lng = CENTER[1] + (Math.random() - 0.5) * 0.002;
//       const created = await simulatorApi.createTag(id, lat, lng);
//       setTags((prev) => [...prev, created]);
//       setNewTagId("");
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const handleRemoveTag = async (id) => {
//     await simulatorApi.deleteTag(id);
//     setTags((prev) => prev.filter((t) => t.device_id !== id));
//   };

//   const handleToggleSos = async (id, current) => {
//     const updated = await simulatorApi.toggleSos(id, !current);
//     setTags((prev) => prev.map((t) => t.device_id === id ? { ...t, sos: updated.sos } : t));
//   };

//   const handleResetAll = async () => {
//     if (!confirm("Remove all virtual tags?")) return;
//     await simulatorApi.resetAll();
//     setTags([]);
//   };

//   return (
//     <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)" }}>
//       {/* Sidebar */}
//       <div style={{
//         width: 320, flexShrink: 0, background: "var(--bg-panel)",
//         borderRight: "1px solid var(--border)",
//         display: "flex", flexDirection: "column", overflow: "hidden",
//       }}>
//         <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
//           <div style={{ fontFamily: "var(--font-ui)", fontSize: 16, fontWeight: 700, color: "var(--teal)" }}>
//             🎮 Virtual Hardware
//           </div>
//           <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
//             Drag tags on the map to simulate live tracker movement.
//             Watch the staff dashboard update in real time.
//           </div>
//         </div>

//         {/* Add tag */}
//         <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
//           <div style={{ display: "flex", gap: 6 }}>
//             <input
//               value={newTagId}
//               onChange={(e) => setNewTagId(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
//               placeholder="TAG_05"
//               style={{
//                 flex: 1, background: "var(--bg-base)", border: "1px solid var(--border-light)",
//                 borderRadius: 6, padding: "7px 10px", color: "var(--text-primary)",
//                 fontFamily: "var(--font-mono)", fontSize: 12, outline: "none",
//               }}
//             />
//             <button onClick={handleAddTag} style={{
//               background: "var(--teal)", color: "#0A0E17", border: "none",
//               borderRadius: 6, padding: "7px 14px", fontFamily: "var(--font-mono)",
//               fontSize: 12, fontWeight: 700, cursor: "pointer",
//             }}>+ ADD</button>
//           </div>
//           {error && <div style={{ color: "var(--red)", fontSize: 11, marginTop: 6, fontFamily: "var(--font-mono)" }}>{error}</div>}
//         </div>

//         {/* Tag list */}
//         <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
//           {loading && <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, padding: 20 }}>Loading…</div>}
//           {!loading && tags.length === 0 && (
//             <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, padding: 20, lineHeight: 1.7 }}>
//               No virtual tags yet.<br />Add one above to begin.
//             </div>
//           )}
//           {tags.map((tag, i) => (
//             <div key={tag.device_id} className="fade-in" style={{
//               background: tag.sos ? "var(--red-dim)" : "var(--bg-card)",
//               border: `1px solid ${tag.sos ? "var(--red)" : "var(--border)"}`,
//               borderRadius: 8, padding: "10px 12px", marginBottom: 8,
//             }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                 <div style={{
//                   width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
//                   background: TAG_COLORS[i % TAG_COLORS.length], border: "2px solid white",
//                 }} />
//                 <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: tag.sos ? "var(--red)" : "var(--text-primary)", flex: 1 }}>
//                   {tag.sos && "🚨 "}{tag.device_id}
//                 </span>
//                 <button onClick={() => handleRemoveTag(tag.device_id)} style={{
//                   background: "transparent", border: "none", color: "var(--text-muted)",
//                   cursor: "pointer", fontSize: 13,
//                 }}>🗑️</button>
//               </div>
//               <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>
//                 {tag.lat?.toFixed(5)}, {tag.lng?.toFixed(5)} · 🔋{Math.round(tag.battery_pct)}%
//               </div>
//               <button
//                 onClick={() => handleToggleSos(tag.device_id, tag.sos)}
//                 style={{
//                   width: "100%", marginTop: 8,
//                   background: tag.sos ? "var(--red)" : "transparent",
//                   border: `1px solid ${tag.sos ? "var(--red)" : "var(--border)"}`,
//                   color: tag.sos ? "white" : "var(--text-secondary)",
//                   borderRadius: 6, padding: "6px 0", fontSize: 11, fontWeight: 700,
//                   fontFamily: "var(--font-mono)", cursor: "pointer",
//                 }}
//               >
//                 {tag.sos ? "✕ CLEAR SOS" : "🚨 TRIGGER SOS"}
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* Reset */}
//         <div style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
//           <button onClick={handleResetAll} style={{
//             width: "100%", background: "transparent", border: "1px solid var(--border)",
//             color: "var(--text-muted)", borderRadius: 6, padding: "8px 0",
//             fontFamily: "var(--font-mono)", fontSize: 11, cursor: "pointer",
//           }}>RESET ALL TAGS</button>
//           <a href="/" style={{
//             display: "block", textAlign: "center", marginTop: 8,
//             color: "var(--teal)", fontFamily: "var(--font-mono)", fontSize: 11, textDecoration: "none",
//           }}>← Back to Dashboard</a>
//         </div>
//       </div>

//       {/* Map */}
//       <div style={{ flex: 1, position: "relative" }}>
//         <MapContainer center={CENTER} zoom={ZOOM} maxZoom={20} style={{ width: "100%", height: "100%" }}>
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='© OpenStreetMap'
//             maxZoom={20}
//           />
//           <SensorZoneCircles />
//           <DraggableTags tags={tags} onDrag={handleDrag} onDragEnd={handleDragEnd} />
//         </MapContainer>

//         <div style={{
//           position: "absolute", top: 16, left: 16, zIndex: 1000,
//           background: "rgba(10,14,23,0.9)", border: "1px solid var(--border)",
//           borderRadius: 8, padding: "8px 14px",
//           fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--teal)",
//         }}>
//           🎮 SIMULATOR MODE — drag any pin to move it live
//         </div>
//       </div>
//     </div>
//   );
// }



// /simulator — a virtual hardware control panel.
// Judges/demoers drag pins on this map to simulate real ESP32 wearables
// moving around camp. Every drag sends a position update to the backend
// exactly like a real device would — the main dashboard reacts live.

import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { simulatorApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../components/auth/LoginScreen";

const CENTER = [
  parseFloat(import.meta.env.VITE_MAP_CENTER_LAT || "6.8077"),
  parseFloat(import.meta.env.VITE_MAP_CENTER_LNG || "3.4564"),
];
const ZOOM = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM || "17");

// Fixed sensor zones — must match backend simulatorController.js
const SENSOR_ZONES = [
  { zone_id: "ZONE_GEN",    zone_name: "Generator Room", lat: 6.8081, lng: 3.4568, radiusM: 35 },
  { zone_id: "ZONE_GATE_A", zone_name: "Main Gate",      lat: 6.8100, lng: 3.4560, radiusM: 35 },
  { zone_id: "ZONE_GATE_B", zone_name: "Back Gate",      lat: 6.8055, lng: 3.4548, radiusM: 35 },
  { zone_id: "ZONE_MED",    zone_name: "Medical Bay",    lat: 6.8068, lng: 3.4579, radiusM: 35 },
  { zone_id: "ZONE_STORE",  zone_name: "Storage Block",  lat: 6.8090, lng: 3.4540, radiusM: 35 },
];

const TAG_COLORS = ["#00D4AA", "#3B82F6", "#F59E0B", "#A855F7", "#EC4899", "#10B981", "#F97316"];

function SensorZoneCircles() {
  const map = useMap();
  useEffect(() => {
    const circles = SENSOR_ZONES.map((z) =>
      L.circle([z.lat, z.lng], {
        radius: z.radiusM,
        color: "#94A3B8", weight: 1.5, dashArray: "4 4",
        fillColor: "#94A3B8", fillOpacity: 0.05,
      })
        .bindTooltip(z.zone_name, { permanent: true, direction: "top", className: "cs-sensor-tooltip" })
        .addTo(map)
    );
    return () => circles.forEach((c) => c.remove());
  }, [map]);
  return null;
}

function DraggableTags({ tags, onDrag, onDragEnd }) {
  const map = useMap();
  const markersRef = useRef({});
  const draggingRef = useRef(new Set()); // device_ids currently being dragged by the user

  useEffect(() => {
    const currentIds = new Set(tags.map((t) => t.device_id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentIds.has(id)) { markersRef.current[id].remove(); delete markersRef.current[id]; }
    });

    tags.forEach((tag, i) => {
      const color = tag.color || TAG_COLORS[i % TAG_COLORS.length];
      const icon = buildIcon(tag, color);
      const latlng = [tag.lat, tag.lng];

      if (markersRef.current[tag.device_id]) {
        // Never touch position while the user is actively dragging this marker —
        // Leaflet already owns the position during a drag gesture. Re-setting it
        // from React state mid-drag is what causes the stutter/lag.
        if (!draggingRef.current.has(tag.device_id)) {
          markersRef.current[tag.device_id].setLatLng(latlng);
        }
        // Icon (SOS pulse, color) is cheap and safe to always refresh
        markersRef.current[tag.device_id].setIcon(icon);
      } else {
        const marker = L.marker(latlng, { icon, draggable: true })
          .addTo(map)
          .bindTooltip(tag.device_id, { permanent: true, direction: "bottom", offset: [0, 8], className: "cs-tag-label" });

        marker.on("dragstart", () => {
          draggingRef.current.add(tag.device_id);
        });
        marker.on("drag", (e) => {
          const { lat, lng } = e.target.getLatLng();
          onDrag(tag.device_id, lat, lng);
        });
        marker.on("dragend", (e) => {
          draggingRef.current.delete(tag.device_id);
          const { lat, lng } = e.target.getLatLng();
          onDragEnd(tag.device_id, lat, lng);
        });

        markersRef.current[tag.device_id] = marker;
      }
    });
  }, [tags, map, onDrag, onDragEnd]);

  return null;
}

function buildIcon(tag, color) {
  const size = 34;
  const pulse = tag.sos
    ? `<div style="position:absolute;inset:0;border-radius:50%;background:${color};animation:sos-pulse 1.4s ease-out infinite;"></div>`
    : "";
  return L.divIcon({
    className: "",
    iconAnchor: [size / 2, size / 2],
    html: `<div style="position:relative;width:${size}px;height:${size}px;cursor:grab;">
      ${pulse}
      <div style="position:relative;z-index:1;width:${size}px;height:${size}px;border-radius:50%;
        background:${color};border:3px solid white;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.4);">
        ${tag.sos
          ? `<svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 2L7 8" stroke="white" stroke-width="2" stroke-linecap="round"/><circle cx="7" cy="11" r="1" fill="white"/></svg>`
          : `<svg width="14" height="14" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="3" fill="white"/></svg>`}
      </div>
    </div>`,
  });
}

export default function SimulatorPage() {
  const { user } = useAuth();
  if (!user) return <LoginScreen />;
  return <SimulatorContent />;
}

function SimulatorContent() {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [newTagId, setNewTagId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dragThrottle = useRef({});
  const dragSeq = useRef({}); // per-tag sequence guard against out-of-order network responses

  const load = useCallback(() => {
    simulatorApi.listTags()
      .then((data) => setTags(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // The marker's own position during drag is owned entirely by Leaflet
  // (see DraggableTags — it skips setLatLng while the marker is mid-drag).
  // We do NOT call setTags here, because that forces this whole page to
  // re-render on every pixel of mouse movement, which caused the stutter.
  // We only throttle a network call so the backend/dashboard stays in sync.
  const handleDrag = (id, lat, lng) => {
    const now = Date.now();
    if (dragThrottle.current[id] && now - dragThrottle.current[id] < 200) return;
    dragThrottle.current[id] = now;

    const seq = (dragSeq.current[id] || 0) + 1;
    dragSeq.current[id] = seq;
    simulatorApi.moveTag(id, lat, lng).catch(() => {});
  };

  const handleDragEnd = (id, lat, lng) => {
    const seq = (dragSeq.current[id] || 0) + 1;
    dragSeq.current[id] = seq;

    simulatorApi.moveTag(id, lat, lng)
      .then((updated) => {
        // Only commit to React state if no newer move has started since —
        // prevents a slow/stale response from snapping the pin backward
        if (dragSeq.current[id] === seq) {
          setTags((prev) => prev.map((t) =>
            t.device_id === id ? { ...t, lat, lng, battery_pct: updated.battery_pct } : t
          ));
        }
      })
      .catch(() => {});
  };

  const handleAddTag = async () => {
    const id = newTagId.trim().toUpperCase();
    if (!id) return;
    setError("");
    try {
      const lat = CENTER[0] + (Math.random() - 0.5) * 0.002;
      const lng = CENTER[1] + (Math.random() - 0.5) * 0.002;
      const created = await simulatorApi.createTag(id, lat, lng);
      setTags((prev) => [...prev, created]);
      setNewTagId("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveTag = async (id) => {
    await simulatorApi.deleteTag(id);
    setTags((prev) => prev.filter((t) => t.device_id !== id));
  };

  const handleToggleSos = async (id, current) => {
    const updated = await simulatorApi.toggleSos(id, !current);
    setTags((prev) => prev.map((t) => t.device_id === id ? { ...t, sos: updated.sos } : t));
  };

  const handleResetAll = async () => {
    if (!confirm("Remove all virtual tags?")) return;
    await simulatorApi.resetAll();
    setTags([]);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)" }}>
      {/* Sidebar */}
      <div style={{
        width: 320, flexShrink: 0, background: "var(--bg-panel)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 16, fontWeight: 700, color: "var(--teal)" }}>
             Virtual Hardware
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
           
          </div>
        </div>

        {/* Add tag */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              value={newTagId}
              onChange={(e) => setNewTagId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              placeholder="TAGS"
              style={{
                flex: 1, background: "var(--bg-base)", border: "1px solid var(--border-light)",
                borderRadius: 6, padding: "7px 10px", color: "var(--text-primary)",
                fontFamily: "var(--font-mono)", fontSize: 12, outline: "none",
              }}
            />
            <button onClick={handleAddTag} style={{
              background: "var(--teal)", color: "#0A0E17", border: "none",
              borderRadius: 6, padding: "7px 14px", fontFamily: "var(--font-mono)",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>+ ADD</button>
          </div>
          {error && <div style={{ color: "var(--red)", fontSize: 11, marginTop: 6, fontFamily: "var(--font-mono)" }}>{error}</div>}
        </div>

        {/* Tag list */}
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          {loading && <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, padding: 20 }}>Loading…</div>}
          {!loading && tags.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, padding: 20, lineHeight: 1.7 }}>
              No virtual tags yet.<br />Add one above to begin.
            </div>
          )}
          {tags.map((tag, i) => (
            <div key={tag.device_id} className="fade-in" style={{
              background: tag.sos ? "var(--red-dim)" : "var(--bg-card)",
              border: `1px solid ${tag.sos ? "var(--red)" : "var(--border)"}`,
              borderRadius: 8, padding: "10px 12px", marginBottom: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                  background: TAG_COLORS[i % TAG_COLORS.length], border: "2px solid white",
                }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: tag.sos ? "var(--red)" : "var(--text-primary)", flex: 1 }}>
                  {tag.sos && "🚨 "}{tag.device_id}
                </span>
                <button onClick={() => handleRemoveTag(tag.device_id)} style={{
                  background: "transparent", border: "none", color: "var(--text-muted)",
                  cursor: "pointer", fontSize: 13,
                }}>🗑️</button>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>
                {tag.lat?.toFixed(5)}, {tag.lng?.toFixed(5)} · 🔋{Math.round(tag.battery_pct)}%
              </div>
              <button
                onClick={() => handleToggleSos(tag.device_id, tag.sos)}
                style={{
                  width: "100%", marginTop: 8,
                  background: tag.sos ? "var(--red)" : "transparent",
                  border: `1px solid ${tag.sos ? "var(--red)" : "var(--border)"}`,
                  color: tag.sos ? "white" : "var(--text-secondary)",
                  borderRadius: 6, padding: "6px 0", fontSize: 11, fontWeight: 700,
                  fontFamily: "var(--font-mono)", cursor: "pointer",
                }}
              >
                {tag.sos ? "✕ CLEAR SOS" : "🚨 TRIGGER SOS"}
              </button>
            </div>
          ))}
        </div>

        {/* Reset */}
        <div style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
          <button onClick={handleResetAll} style={{
            width: "100%", background: "transparent", border: "1px solid var(--border)",
            color: "var(--text-muted)", borderRadius: 6, padding: "8px 0",
            fontFamily: "var(--font-mono)", fontSize: 11, cursor: "pointer",
          }}>RESET ALL TAGS</button>
          <a href="/" style={{
            display: "block", textAlign: "center", marginTop: 8,
            color: "var(--teal)", fontFamily: "var(--font-mono)", fontSize: 11, textDecoration: "none",
          }}>← Back to Dashboard</a>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer center={CENTER} zoom={ZOOM} maxZoom={20} style={{ width: "100%", height: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© OpenStreetMap'
            maxZoom={20}
          />
          <SensorZoneCircles />
          <DraggableTags tags={tags} onDrag={handleDrag} onDragEnd={handleDragEnd} />
        </MapContainer>

        <div style={{
          position: "absolute", top: 16, left: 16, zIndex: 1000,
          background: "rgba(10,14,23,0.9)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "8px 14px",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--teal)",
        }}>
          🎮 SIMULATOR MODE — drag any pin to move it live
        </div>
      </div>
    </div>
  );
}