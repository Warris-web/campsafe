// Virtual hardware ingestion — the "Tag Simulator" page calls these endpoints
// to act exactly like a real ESP32 gateway would over serial.

const TrackerEvent  = require("../models/TrackerEvent");
const SosAlert       = require("../models/SosAlert");
const ZoneHeartbeat  = require("../models/ZoneHeartbeat");
const { checkGeofences } = require("../services/geofenceEngine");

// In-memory registry of virtual tags (separate from DB — these are "live" devices)
let virtualTags = {}; // device_id -> { lat, lng, battery_pct, sos }

// Fixed sensor zones — must match frontend SimulatorPage.jsx coordinates
const SENSOR_ZONES = [
  { zone_id: "ZONE_GEN",    zone_name: "Generator Room", lat: 6.8081, lng: 3.4568, radiusM: 35 },
  { zone_id: "ZONE_GATE_A", zone_name: "Main Gate",      lat: 6.8100, lng: 3.4560, radiusM: 35 },
  { zone_id: "ZONE_GATE_B", zone_name: "Back Gate",      lat: 6.8055, lng: 3.4548, radiusM: 35 },
  { zone_id: "ZONE_MED",    zone_name: "Medical Bay",    lat: 6.8068, lng: 3.4579, radiusM: 35 },
  { zone_id: "ZONE_STORE",  zone_name: "Storage Block",  lat: 6.8090, lng: 3.4540, radiusM: 35 },
];

function distMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Re-evaluate motion sensors based on current virtual tag positions
async function recomputeZoneMotion(io) {
  for (const zone of SENSOR_ZONES) {
    const triggered = Object.values(virtualTags).some((tag) =>
      distMeters(tag.lat, tag.lng, zone.lat, zone.lng) <= zone.radiusM
    );

    const existing = await ZoneHeartbeat.findOne({ zone_id: zone.zone_id });
    const wasMotion = existing?.motion || false;

    if (triggered !== wasMotion) {
      const updated = await ZoneHeartbeat.findOneAndUpdate(
        { zone_id: zone.zone_id },
        { zone_name: zone.zone_name, online: true, motion: triggered, last_seen: new Date() },
        { upsert: true, new: true }
      );
      io.emit("zone_update", updated);
      if (triggered) console.log(`👁️  Motion triggered at ${zone.zone_name} (virtual tag proximity)`);
    }
  }
}

// GET /api/simulator/tags — list all virtual tags currently registered
const listTags = (req, res) => {
  res.json(Object.entries(virtualTags).map(([id, t]) => ({ device_id: id, ...t })));
};

// POST /api/simulator/tags — register a new virtual tag
// body: { device_id, lat, lng }
const createTag = async (req, res) => {
  const { device_id, lat, lng } = req.body;
  if (!device_id || lat == null || lng == null) {
    return res.status(400).json({ error: "device_id, lat, lng required" });
  }
  if (virtualTags[device_id]) {
    return res.status(409).json({ error: "Tag already exists" });
  }

  virtualTags[device_id] = { lat, lng, battery_pct: 100, sos: false };

  const event = await TrackerEvent.create({ device_id, latitude: lat, longitude: lng, battery_pct: 100, sos: false });
  const io = req.app.get("io");
  io.emit("tracker_update", event);
  checkGeofences(io, event);
  await recomputeZoneMotion(io);

  res.status(201).json({ device_id, ...virtualTags[device_id] });
};

// DELETE /api/simulator/tags/:id — remove a virtual tag
const deleteTag = async (req, res) => {
  const { id } = req.params;
  delete virtualTags[id];
  const io = req.app.get("io");
  await recomputeZoneMotion(io);
  res.json({ success: true });
};

// POST /api/simulator/tags/:id/move — update a virtual tag's position (drag event)
// body: { lat, lng }
const moveTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;
    if (!virtualTags[id]) return res.status(404).json({ error: "Tag not found" });
    if (lat == null || lng == null) return res.status(400).json({ error: "lat, lng required" });

    virtualTags[id].lat = lat;
    virtualTags[id].lng = lng;
    // Slowly drain battery to feel realistic
    virtualTags[id].battery_pct = Math.max(1, virtualTags[id].battery_pct - 0.05);

    const event = await TrackerEvent.create({
      device_id: id, latitude: lat, longitude: lng,
      battery_pct: Math.round(virtualTags[id].battery_pct), sos: virtualTags[id].sos,
    });

    const io = req.app.get("io");
    io.emit("tracker_update", event);
    checkGeofences(io, event);
    await recomputeZoneMotion(io);

    res.json({ device_id: id, ...virtualTags[id] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/simulator/tags/:id/sos — trigger or clear SOS for a tag
// body: { sos: true|false }
const toggleSos = async (req, res) => {
  try {
    const { id } = req.params;
    const { sos } = req.body;
    if (!virtualTags[id]) return res.status(404).json({ error: "Tag not found" });

    virtualTags[id].sos = !!sos;
    const { lat, lng } = virtualTags[id];

    const event = await TrackerEvent.create({
      device_id: id, latitude: lat, longitude: lng,
      battery_pct: Math.round(virtualTags[id].battery_pct), sos: !!sos,
    });

    const io = req.app.get("io");
    io.emit("tracker_update", event);

    if (sos) {
      const alert = await SosAlert.create({ device_id: id, latitude: lat, longitude: lng });
      io.emit("sos_alert", alert);
      console.warn(`🚨 [VIRTUAL] SOS triggered from ${id}`);
    }

    res.json({ device_id: id, ...virtualTags[id] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/simulator/reset — clear all virtual tags (fresh demo start)
const resetAll = async (req, res) => {
  virtualTags = {};
  const io = req.app.get("io");
  await recomputeZoneMotion(io);
  res.json({ success: true });
};

module.exports = { listTags, createTag, deleteTag, moveTag, toggleSos, resetAll, SENSOR_ZONES };