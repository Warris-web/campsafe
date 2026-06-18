// src/config/db.js
// Connects to local MongoDB (always).
// Optionally connects to Atlas for cloud sync (when ENABLE_ATLAS_SYNC=true).

const mongoose = require("mongoose");

let atlasConnection = null;

const connectLocal = async () => {
  try {
    await mongoose.connect(process.env.MONGO_LOCAL_URI);
    console.log("✅ MongoDB Local connected:", process.env.MONGO_LOCAL_URI);
  } catch (err) {
    console.error("❌ MongoDB Local connection failed:", err.message);
    process.exit(1); // Local DB is required — crash if unavailable
  }
};

const connectAtlas = async () => {
  if (process.env.ENABLE_ATLAS_SYNC !== "true") return;
  if (!process.env.MONGO_ATLAS_URI || process.env.MONGO_ATLAS_URI.includes("<user>")) {
    console.warn("⚠️  Atlas sync enabled but MONGO_ATLAS_URI is not configured. Skipping.");
    return;
  }

  try {
    atlasConnection = await mongoose.createConnection(process.env.MONGO_ATLAS_URI);
    console.log("☁️  MongoDB Atlas connected (sync active)");
  } catch (err) {
    // Atlas failure is non-fatal — system keeps running offline
    console.warn("⚠️  MongoDB Atlas connection failed (offline mode):", err.message);
    atlasConnection = null;
  }
};

const getAtlasConnection = () => atlasConnection;

module.exports = { connectLocal, connectAtlas, getAtlasConnection };
