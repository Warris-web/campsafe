// const TrackerEvent   = require("../models/TrackerEvent");
// const SosAlert       = require("../models/SosAlert");
// const ZoneHeartbeat  = require("../models/ZoneHeartbeat");

// const FAKE_TAGS = [
//   { id: "TAG_01",   lat: 6.6521, lng: 3.4312 },
//   { id: "TAG_02",   lat: 6.6534, lng: 3.4298 },
//   { id: "CHILD_07", lat: 6.6510, lng: 3.4320 },
// ];

// const FAKE_ZONES = [
//   { zone_id: "ZONE_GEN",   zone_name: "Generator Room",   lat: 6.6528, lng: 3.4305 },
//   { zone_id: "ZONE_GATE_A", zone_name: "Main Gate",       lat: 6.6540, lng: 3.4315 },
//   { zone_id: "ZONE_GATE_B", zone_name: "Back Gate",       lat: 6.6508, lng: 3.4300 },
//   { zone_id: "ZONE_MED",   zone_name: "Medical Bay",      lat: 6.6518, lng: 3.4325 },
//   { zone_id: "ZONE_STORE", zone_name: "Storage Block",    lat: 6.6532, lng: 3.4290 },
// ];

// module.exports = (app) => {
//   const io = app.get("io");
//   console.log("🔧 Simulator running — emitting fake tracker data every 5s");

//   // Seed initial zone states once on boot
//   (async () => {
//     for (const z of FAKE_ZONES) {
//       await ZoneHeartbeat.findOneAndUpdate(
//         { zone_id: z.zone_id },
//         { zone_name: z.zone_name, online: true, motion: false, gas: false, last_seen: new Date() },
//         { upsert: true, new: true }
//       );
//     }
//   })();

//   // ── Tracker loop every 5s ──────────────────────────────────────────────
//   setInterval(async () => {
//     for (const tag of FAKE_TAGS) {
//       const lat = tag.lat + (Math.random() - 0.5) * 0.001;
//       const lng = tag.lng + (Math.random() - 0.5) * 0.001;
//       const bat = Math.floor(60 + Math.random() * 40);
//       const sos = Math.random() < 0.03;

//       const event = await TrackerEvent.create({
//         device_id: tag.id, latitude: lat, longitude: lng, battery_pct: bat, sos,
//       });

//       io.emit("tracker_update", event);

//       if (sos) {
//         const alert = await SosAlert.create({ device_id: tag.id, latitude: lat, longitude: lng });
//         io.emit("sos_alert", alert);
//         console.warn(`🚨 [SIM] SOS from ${tag.id}`);
//       }
//     }
//   }, 5000);

//   // ── Zone heartbeat loop every 8s ───────────────────────────────────────
//   setInterval(async () => {
//     for (const z of FAKE_ZONES) {
//       const online = Math.random() > 0.06;          // 6% chance node goes offline
//       const motion = online && Math.random() < 0.15; // 15% chance motion detected
//       const gas    = online && Math.random() < 0.04; // 4% chance gas detected

//       const zone = await ZoneHeartbeat.findOneAndUpdate(
//         { zone_id: z.zone_id },
//         { online, motion, gas, last_seen: new Date() },
//         { new: true }
//       );

//       io.emit("zone_update", zone);

//       if (gas)    console.warn(`⚠️  [SIM] Gas detected at ${z.zone_name}`);
//       if (!online) console.warn(`📴 [SIM] Node offline: ${z.zone_name}`);
//     }
//   }, 8000);
// };

const TrackerEvent              = require("../models/TrackerEvent");
const SosAlert                  = require("../models/SosAlert");
const ZoneHeartbeat             = require("../models/ZoneHeartbeat");
const { checkGeofences, ZONES } = require("./geofenceEngine");

const FAKE_TAGS = [
  { id: "TAG_01",   lat: 6.6521, lng: 3.4312 },
  { id: "TAG_02",   lat: 6.6534, lng: 3.4298 },
  { id: "CHILD_07", lat: 6.6510, lng: 3.4320 },
  { id: "TAG_03",   lat: 6.6525, lng: 3.4305 }, 
  { id: "TAG_04",   lat: 6.6518, lng: 3.4330 },
];

const FAKE_ZONES = [
  { zone_id: "ZONE_GEN",    zone_name: "Generator Room" },
  { zone_id: "ZONE_GATE_A", zone_name: "Main Gate"      },
  { zone_id: "ZONE_GATE_B", zone_name: "Back Gate"      },
  { zone_id: "ZONE_MED",    zone_name: "Medical Bay"    },
  { zone_id: "ZONE_STORE",  zone_name: "Storage Block"  },
];

module.exports = (app) => {
  const io = app.get("io");
  console.log("🔧 Simulator running — emitting fake tracker data every 5s");

  // Seed initial zone states
  (async () => {
    for (const z of FAKE_ZONES) {
      await ZoneHeartbeat.findOneAndUpdate(
        { zone_id: z.zone_id },
        { zone_name: z.zone_name, online: true, motion: false, gas: false, last_seen: new Date() },
        { upsert: true, new: true }
      );
    }
  })();

  // ── Tracker loop every 5s ─────────────────────────────────────────────
  setInterval(async () => {
    for (const tag of FAKE_TAGS) {
      const lat = tag.lat + (Math.random() - 0.5) * 0.002;
      const lng = tag.lng + (Math.random() - 0.5) * 0.002;
      const bat = Math.floor(60 + Math.random() * 40);
      const sos = Math.random() < 0.03;

      const event = await TrackerEvent.create({
        device_id: tag.id, latitude: lat, longitude: lng, battery_pct: bat, sos,
      });

      io.emit("tracker_update", event);

      // Run geofence check on every update
      checkGeofences(io, event);

      if (sos) {
        const alert = await SosAlert.create({ device_id: tag.id, latitude: lat, longitude: lng });
        io.emit("sos_alert", alert);
        console.warn(`🚨 [SIM] SOS from ${tag.id}`);
      }
    }
  }, 5000);

  // ── Zone heartbeat loop every 8s ──────────────────────────────────────
  setInterval(async () => {
    for (const z of FAKE_ZONES) {
      const online = Math.random() > 0.06;
      const motion = online && Math.random() < 0.15;
      const gas    = online && Math.random() < 0.04;

      const zone = await ZoneHeartbeat.findOneAndUpdate(
        { zone_id: z.zone_id },
        { online, motion, gas, last_seen: new Date() },
        { new: true }
      );

      io.emit("zone_update", zone);
      if (gas)     console.warn(`⚠️  [SIM] Gas detected at ${z.zone_name}`);
      if (!online) console.warn(`📴 [SIM] Node offline: ${z.zone_name}`);
    }
  }, 8000);
};







