import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ZoneOverlays from "./ZoneOverlays";

const CENTER = [
  parseFloat(import.meta.env.VITE_MAP_CENTER_LAT || "6.6525"),
  parseFloat(import.meta.env.VITE_MAP_CENTER_LNG || "3.4312"),
];
const ZOOM = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM || "16");

function TrackerMarkers({ trackers, selectedId, deviceMap }) {
  const map = useMap();
  const markersRef = useRef({});

  useEffect(() => {
    const currentIds = new Set(trackers.map((t) => t.device_id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentIds.has(id)) { markersRef.current[id].remove(); delete markersRef.current[id]; }
    });

    trackers.forEach((tracker) => {
      const { device_id, latitude, longitude, battery_pct, sos } = tracker;
      if (!latitude || !longitude) return;

      const camper     = deviceMap?.[device_id];
      const isSelected = device_id === selectedId;
      const outOfCamp  = camper && !camper.in_camp;
      const color      = sos ? "#EF4444" : outOfCamp ? "#4B5563" : battery_pct < 20 ? "#F59E0B" : "#00D4AA";
      const icon       = createTrackerIcon(device_id, color, sos, isSelected, camper, outOfCamp);
      const latlng     = [latitude, longitude];

      if (markersRef.current[device_id]) {
        markersRef.current[device_id].setLatLng(latlng).setIcon(icon);
        markersRef.current[device_id].getPopup()?.setContent(popupContent(tracker, camper));
      } else {
        const marker = L.marker(latlng, { icon })
          .addTo(map)
          .bindPopup(popupContent(tracker, camper), { className: "cs-popup" });
        markersRef.current[device_id] = marker;
      }
    });
  }, [trackers, selectedId, deviceMap, map]);

  return null;
}

function HistoryLayer({ history, deviceId }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (layerRef.current) { layerRef.current.remove(); layerRef.current = null; }
    if (!history || history.length < 2 || !deviceId) return;

    const group  = L.layerGroup();
    const coords = history.map((p) => [p.latitude, p.longitude]);

    L.polyline(coords, { color: "#00D4AA", weight: 2.5, opacity: 0.55, dashArray: "6 4" }).addTo(group);
    L.circleMarker(coords[0], { radius: 5, color: "#00D4AA", fillColor: "#0A0E17", fillOpacity: 1, weight: 2 })
      .bindTooltip("Start", { direction: "top" }).addTo(group);

    const step = Math.max(1, Math.floor(history.length / 12));
    history.forEach((p, i) => {
      if (i === 0 || i === history.length - 1 || i % step !== 0) return;
      L.circleMarker([p.latitude, p.longitude], { radius: 3, color: "#00D4AA", fillColor: "#00D4AA", fillOpacity: 0.4, weight: 1 }).addTo(group);
    });

    history.filter((p) => p.sos).forEach((p) => {
      L.circleMarker([p.latitude, p.longitude], { radius: 6, color: "#EF4444", fillColor: "#EF4444", fillOpacity: 0.9, weight: 2 })
        .bindTooltip("SOS", { direction: "top" }).addTo(group);
    });

    group.addTo(map);
    layerRef.current = group;
    map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 18 });
  }, [history, deviceId, map]);

  return null;
}

function createTrackerIcon(id, color, sos, selected, camper, outOfCamp) {
  const size  = selected ? 36 : 30;
  const half  = size / 2;
  const ring  = selected ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${color};opacity:0.5;"></div>` : "";
  const pulse = sos       ? `<div style="position:absolute;inset:0;border-radius:50%;background:${color};animation:sos-pulse 1.4s ease-out infinite;"></div>` : "";
  const name  = camper ? `${camper.first_name[0]}${camper.last_name[0]}` : "?";
  const inner = sos
    ? `<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 2L7 8" stroke="white" stroke-width="2" stroke-linecap="round"/><circle cx="7" cy="11" r="1" fill="white"/></svg>`
    : `<span style="font-size:${size * 0.32}px;font-weight:700;font-family:system-ui;color:${outOfCamp ? "#6B7280" : "white"}">${name}</span>`;

  return L.divIcon({
    className: "", iconAnchor: [half, half],
    html: `<div style="position:relative;width:${size}px;height:${size}px;">${pulse}${ring}
      <div style="position:relative;z-index:1;width:${size}px;height:${size}px;border-radius:50%;
        background:${color};border:2.5px solid rgba(255,255,255,${selected ? 0.5 : 0.15});
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 ${selected ? 16 : 8}px ${color}66;
        ${outOfCamp ? "filter:grayscale(0.5);" : ""}">
        ${inner}
      </div></div>`,
  });
}

function popupContent(t, camper) {
  const batColor = t.sos ? "#EF4444" : t.battery_pct < 20 ? "#F59E0B" : "#00D4AA";
  const lastSeen = t.createdAt ? new Date(t.createdAt).toLocaleTimeString("en-NG", { hour12: false }) : "—";
  const name     = camper ? `${camper.first_name} ${camper.last_name}` : t.device_id;
  const outOfCamp = camper && !camper.in_camp;

  return `<div style="font-family:'JetBrains Mono',monospace;min-width:190px">
    <div style="font-weight:600;font-size:13px;color:#F1F5F9;margin-bottom:2px">${t.sos ? "🚨 " : ""}${name}</div>
    ${camper ? `<div style="font-size:10px;color:#6B7280;margin-bottom:8px">${t.device_id} · ${camper.role}</div>` : `<div style="margin-bottom:8px"></div>`}
    ${outOfCamp ? `<div style="color:#F59E0B;font-size:10px;margin-bottom:6px">⚠️ Marked out of camp</div>` : ""}
    <div style="display:grid;grid-template-columns:auto 1fr;gap:3px 10px;font-size:11px;color:#94A3B8">
      <span>LAT</span><span style="color:#F1F5F9">${t.latitude?.toFixed(5)}</span>
      <span>LNG</span><span style="color:#F1F5F9">${t.longitude?.toFixed(5)}</span>
      <span>BAT</span><span style="color:${batColor}">${t.battery_pct ?? "—"}%</span>
      <span>SEEN</span><span style="color:#F1F5F9">${lastSeen}</span>
    </div></div>`;
}

export default function MapPanel({ trackers, selectedId, history, breachedZones = [], deviceMap = {} }) {
  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <MapContainer center={CENTER} zoom={ZOOM} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://openstreetmap.org">OSM</a>'
        />
        <ZoneOverlays breachedZones={breachedZones} />
        <TrackerMarkers trackers={trackers} selectedId={selectedId} deviceMap={deviceMap} />
        <HistoryLayer history={history} deviceId={selectedId} />
      </MapContainer>

      <div style={{
        position: "absolute", bottom: 16, left: 16, zIndex: 1000,
        background: "rgba(10,14,23,0.85)", border: `1px solid ${selectedId ? "var(--teal)" : "var(--border)"}`,
        borderRadius: 8, padding: "6px 12px",
        fontFamily: "var(--font-mono)", fontSize: 11,
        color: selectedId ? "var(--teal)" : "var(--text-secondary)",
        backdropFilter: "blur(8px)", transition: "all 0.3s",
      }}>
        {selectedId ? `PATH — ${deviceMap[selectedId] ? `${deviceMap[selectedId].first_name} ${deviceMap[selectedId].last_name}` : selectedId}` : `${trackers.length} tracker${trackers.length !== 1 ? "s" : ""} live`}
      </div>
    </div>
  );
}
