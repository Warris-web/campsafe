const StaffLog = require("../models/StaffLog");

// GET /api/staff/logs — all logs, newest first
const getLogs = async (req, res) => {
  try {
    const { username } = req.query;
    const filter = username ? { username } : {};
    const logs = await StaffLog.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/staff/summary — activity count per staff member
const getSummary = async (req, res) => {
  try {
    const summary = await StaffLog.aggregate([
      { $group: { _id: { username: "$username", role: "$role" }, count: { $sum: 1 }, lastActive: { $max: "$createdAt" } } },
      { $sort: { lastActive: -1 } },
    ]);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getLogs, getSummary };
