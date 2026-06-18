// src/models/SosAlert.js
// Mirrors the sos_alerts table from the original SQLite schema.

const mongoose = require("mongoose");

const sosAlertSchema = new mongoose.Schema(
  {
    device_id:   { type: String, required: true, index: true },
    latitude:    { type: Number, required: true },
    longitude:   { type: Number, required: true },
    resolved:    { type: Boolean, default: false },
    resolved_by: { type: String, default: null },
    resolved_at: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SosAlert", sosAlertSchema);
