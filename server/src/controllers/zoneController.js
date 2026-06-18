const ZoneHeartbeat = require("../models/ZoneHeartbeat");

const getAll = async (req, res) => {
  try {
    const zones = await ZoneHeartbeat.find().sort({ zone_id: 1 });
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll };
