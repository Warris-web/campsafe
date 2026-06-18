const SosAlert = require("../models/SosAlert");
const StaffLog = require("../models/StaffLog");

const getAll = async (req, res) => {
  try {
    const alerts = await SosAlert.find().sort({ createdAt: -1 }).limit(100);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resolve = async (req, res) => {
  try {
    const { resolved_by } = req.body;
    const alert = await SosAlert.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolved_by, resolved_at: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ error: "Alert not found" });

    // Write to staff activity log
    await StaffLog.create({
      username: req.user.username,
      role:     req.user.role,
      action:   "resolved_sos",
      detail:   `Resolved SOS from ${alert.device_id}`,
      ref_id:   alert._id.toString(),
      ref_type: "SosAlert",
    });

    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, resolve };
