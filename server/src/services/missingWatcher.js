// Polls MongoDB every 30s. Any tracker whose last ping is older than
// MISSING_THRESHOLD_MS is flagged and emitted as tracker_missing.

const TrackerEvent = require("../models/TrackerEvent");

const MISSING_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes
const POLL_INTERVAL_MS     = 30 * 1000;      // check every 30s

// Track which devices we've already alerted so we don't spam
const alreadyMissing = new Set();

module.exports = (app) => {
  const io = app.get("io");

  setInterval(async () => {
    try {
      // Get latest ping per device
      const latest = await TrackerEvent.aggregate([
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$device_id", lastSeen: { $first: "$createdAt" }, doc: { $first: "$$ROOT" } } },
      ]);

      const now = Date.now();

      for (const { _id: device_id, lastSeen, doc } of latest) {
        const age = now - new Date(lastSeen).getTime();
        const isMissing = age > MISSING_THRESHOLD_MS;

        if (isMissing && !alreadyMissing.has(device_id)) {
          alreadyMissing.add(device_id);
          const payload = { device_id, lastSeen, ageMinutes: Math.floor(age / 60000), lastPosition: doc };
          io.emit("tracker_missing", payload);
          console.warn(`⚠️  MISSING: ${device_id} — last seen ${Math.floor(age / 60000)}m ago`);
        }

        // Clear missing flag when tracker comes back
        if (!isMissing && alreadyMissing.has(device_id)) {
          alreadyMissing.delete(device_id);
          io.emit("tracker_recovered", { device_id });
          console.log(`✅ RECOVERED: ${device_id}`);
        }
      }
    } catch (err) {
      console.error("missingWatcher error:", err.message);
    }
  }, POLL_INTERVAL_MS);

  console.log(`👁️  Missing person watcher active (threshold: ${MISSING_THRESHOLD_MS / 60000}m)`);
};