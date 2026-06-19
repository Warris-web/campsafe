// Periodically pushes local MongoDB data to Atlas when internet is available.
// Local MongoDB remains the source of truth for live operation —
// this is a one-way backup/mirror, not a two-way sync.

const { getAtlasConnection } = require("../config/db");
const TrackerEvent = require("../models/TrackerEvent");
const SosAlert     = require("../models/SosAlert");
const Camper       = require("../models/Camper");
const Family       = require("../models/Family");
const StaffLog     = require("../models/StaffLog");

const SYNC_INTERVAL_MS = 60 * 1000; // every 60s
let lastSyncedAt = new Date(0);

async function syncCollection(localModel, atlasConn, collectionName) {
  const AtlasModel = atlasConn.model(collectionName, localModel.schema);

  // Only push documents created/updated since last sync
  const newDocs = await localModel.find({ updatedAt: { $gt: lastSyncedAt } }).lean();
  if (newDocs.length === 0) return 0;

  for (const doc of newDocs) {
    await AtlasModel.findByIdAndUpdate(doc._id, doc, { upsert: true });
  }
  return newDocs.length;
}

async function runSync() {
  const atlasConn = getAtlasConnection();
  if (!atlasConn) return; // Atlas not configured or unreachable — skip silently

  try {
    const syncStart = new Date();

    const counts = {
      trackers: await syncCollection(TrackerEvent, atlasConn, "TrackerEvent"),
      alerts:   await syncCollection(SosAlert,     atlasConn, "SosAlert"),
      campers:  await syncCollection(Camper,       atlasConn, "Camper"),
      families: await syncCollection(Family,       atlasConn, "Family"),
      logs:     await syncCollection(StaffLog,     atlasConn, "StaffLog"),
    };

    const totalSynced = Object.values(counts).reduce((a, b) => a + b, 0);
    if (totalSynced > 0) {
      console.log(`☁️  Atlas sync: ${totalSynced} docs (${JSON.stringify(counts)})`);
    }

    lastSyncedAt = syncStart;
  } catch (err) {
    console.warn("⚠️  Atlas sync failed (will retry):", err.message);
    // Don't update lastSyncedAt — we'll retry these docs next cycle
  }
}

module.exports = (app) => {
  if (process.env.ENABLE_ATLAS_SYNC !== "true") {
    console.log("☁️  Atlas sync disabled (ENABLE_ATLAS_SYNC=false)");
    return;
  }

  console.log(`☁️  Atlas sync active — every ${SYNC_INTERVAL_MS / 1000}s`);
  setInterval(runSync, SYNC_INTERVAL_MS);
  runSync(); // run once immediately on boot
};