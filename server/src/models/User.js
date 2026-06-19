const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username:      { type: String, required: true, unique: true, trim: true, lowercase: true },
    password_hash: { type: String, required: true },
    role:          { type: String, enum: ["admin", "staff", "medical", "patrol", "gate"], default: "staff" },
    full_name:      { type: String, default: "" },
    active:         { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.password_hash);
};

userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10);
};

module.exports = mongoose.model("User", userSchema);