// src/models/ZoneHeartbeat.js
// Tracks status of fixed sensor nodes (generator room, perimeter gates, etc.)

const mongoose = require("mongoose");

const zoneHeartbeatSchema = new mongoose.Schema(
  {
    zone_id:    { type: String, required: true, index: true },
    zone_name:  { type: String, required: true },      // e.g. "Generator Room"
    online:     { type: Boolean, default: true },
    motion:     { type: Boolean, default: false },      // PIR sensor
    gas:        { type: Boolean, default: false },      // MQ-2 sensor
    last_seen:  { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ZoneHeartbeat", zoneHeartbeatSchema);
