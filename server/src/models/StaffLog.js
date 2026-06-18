const mongoose = require("mongoose");

const staffLogSchema = new mongoose.Schema(
  {
    username:   { type: String, required: true, index: true },
    role:       { type: String, required: true },
    action:     { type: String, required: true }, // "resolved_sos", "acknowledged_breach", "checked_in_camper" etc
    detail:     { type: String, default: "" },    // human readable description
    ref_id:     { type: String, default: null },  // linked alert/event _id
    ref_type:   { type: String, default: null },  // "SosAlert" | "ZoneBreach" | "Camper"
  },
  { timestamps: true }
);

module.exports = mongoose.model("StaffLog", staffLogSchema);
