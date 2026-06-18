const mongoose = require("mongoose");

const camperSchema = new mongoose.Schema(
  {
    first_name:    { type: String, required: true, trim: true },
    last_name:     { type: String, required: true, trim: true },
    age:           { type: Number, min: 0, max: 120 },
    role:          { type: String, enum: ["child", "adult", "staff", "medical"], default: "child" },
    photo_url:     { type: String, default: null },
    device_id:     { type: String, default: null, index: true },
    family_id:     { type: mongoose.Schema.Types.ObjectId, ref: "Family", default: null },
    notes:         { type: String, default: "" },
    checked_in:    { type: Boolean, default: false },   // registered at camp
    checked_in_at: { type: Date,    default: null },
    in_camp:       { type: Boolean, default: true },    // physically inside camp right now
    left_camp_at:  { type: Date,    default: null },
  },
  { timestamps: true }
);

camperSchema.virtual("full_name").get(function () {
  return `${this.first_name} ${this.last_name}`;
});
camperSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Camper", camperSchema);
