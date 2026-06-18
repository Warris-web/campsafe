const TrackerEvent = require("../models/TrackerEvent");

// GET /api/trackers — latest position for every device
const getAll = async (req, res) => {
  try {
    const latest = await TrackerEvent.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$device_id", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
      { $sort: { device_id: 1 } },
    ]);
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/trackers/:id — full history for one device
const getById = async (req, res) => {
  try {
    const events = await TrackerEvent.find({ device_id: req.params.id })
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getById };
