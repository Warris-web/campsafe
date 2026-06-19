// Wipes stale tracker events, alerts, and zone heartbeats.
// Does NOT touch Camper, Family, User, or StaffLog data.
// Useful after changing the simulator's FAKE_TAGS list, or before a fresh demo.

require("dotenv").config();
const mongoose      = require("mongoose");
const TrackerEvent  = require("../src/models/TrackerEvent");
const SosAlert      = require("../src/models/SosAlert");
const ZoneHeartbeat = require("../src/models/ZoneHeartbeat");

async function clear() {
  await mongoose.connect(process.env.MONGO_LOCAL_URI);

  const t = await TrackerEvent.deleteMany({});
  const a = await SosAlert.deleteMany({});
  const z = await ZoneHeartbeat.deleteMany({});

  console.log(`🧹 Cleared ${t.deletedCount} tracker events`);
  console.log(`🧹 Cleared ${a.deletedCount} SOS alerts`);
  console.log(`🧹 Cleared ${z.deletedCount} zone heartbeats`);
  console.log("✅ Done — Campers, Families, Users, StaffLogs untouched");

  process.exit(0);
}

clear().catch((err) => { console.error(err); process.exit(1); });
