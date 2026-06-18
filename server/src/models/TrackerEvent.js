// src/models/TrackerEvent.js
// Mirrors the tracker_events table from the original SQLite schema.

const mongoose = require("mongoose");

const trackerEventSchema = new mongoose.Schema(
  {
    device_id: { type: String, required: true, index: true },
    latitude:  { type: Number, required: true },
    longitude: { type: Number, required: true },
    battery_pct: { type: Number, min: 0, max: 100 },
    sos: { type: Boolean, default: false },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// Index for fast "latest position per device" queries
trackerEventSchema.index({ device_id: 1, createdAt: -1 });

module.exports = mongoose.model("TrackerEvent", trackerEventSchema);
