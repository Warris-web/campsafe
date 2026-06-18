const mongoose = require("mongoose");

const familySchema = new mongoose.Schema(
  {
    family_name:    { type: String, required: true, trim: true }, // e.g. "Adeyemi Family"
    emergency_contact_name:  { type: String, default: "" },
    emergency_contact_phone: { type: String, default: "" },
    cabin:          { type: String, default: "" },   // e.g. "Cabin 4"
    notes:          { type: String, default: "" },
  },
  { timestamps: true }
);

// Virtual: populate members from Camper collection
familySchema.virtual("members", {
  ref:          "Camper",
  localField:   "_id",
  foreignField: "family_id",
});

familySchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Family", familySchema);
