const Camper   = require("../models/Camper");
const Family   = require("../models/Family");
const StaffLog = require("../models/StaffLog");

const getAll = async (req, res) => {
  try {
    const campers = await Camper.find()
      .populate("family_id", "family_name cabin")
      .sort({ last_name: 1 });
    res.json(campers);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const search = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([]);
    const regex = new RegExp(q, "i");
    const byName = await Camper.find({
      $or: [{ first_name: regex }, { last_name: regex }],
    }).populate("family_id", "family_name cabin");
    const families = await Family.find({ family_name: regex });
    const byFamily = await Camper.find({
      family_id: { $in: families.map((f) => f._id) },
    }).populate("family_id", "family_name cabin");
    const seen = new Set();
    const results = [...byName, ...byFamily].filter((c) => {
      if (seen.has(c._id.toString())) return false;
      seen.add(c._id.toString());
      return true;
    });
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getById = async (req, res) => {
  try {
    const camper = await Camper.findById(req.params.id).populate("family_id");
    if (!camper) return res.status(404).json({ error: "Camper not found" });
    res.json(camper);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const create = async (req, res) => {
  try {
    const camper = await Camper.create(req.body);
    await StaffLog.create({
      username: req.user.username, role: req.user.role,
      action: "added_person",
      detail: `Added ${camper.first_name} ${camper.last_name}`,
      ref_id: camper._id.toString(), ref_type: "Camper",
    });
    const populated = await Camper.findById(camper._id).populate("family_id", "family_name cabin");
    res.status(201).json(populated);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

const update = async (req, res) => {
  try {
    const camper = await Camper.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("family_id", "family_name cabin");
    if (!camper) return res.status(404).json({ error: "Camper not found" });
    await StaffLog.create({
      username: req.user.username, role: req.user.role,
      action: "edited_person",
      detail: `Edited ${camper.first_name} ${camper.last_name}`,
      ref_id: camper._id.toString(), ref_type: "Camper",
    });
    res.json(camper);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

const remove = async (req, res) => {
  try {
    const camper = await Camper.findByIdAndDelete(req.params.id);
    if (camper) {
      await StaffLog.create({
        username: req.user.username, role: req.user.role,
        action: "removed_person",
        detail: `Removed ${camper.first_name} ${camper.last_name}`,
        ref_id: camper._id.toString(), ref_type: "Camper",
      });
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const checkIn = async (req, res) => {
  try {
    const isIn = req.body.checked_in !== false;
    const camper = await Camper.findByIdAndUpdate(
      req.params.id,
      { checked_in: isIn, checked_in_at: isIn ? new Date() : null },
      { new: true }
    ).populate("family_id", "family_name cabin");
    if (!camper) return res.status(404).json({ error: "Camper not found" });
    await StaffLog.create({
      username: req.user.username, role: req.user.role,
      action: isIn ? "checked_in_camper" : "checked_out_camper",
      detail: `${isIn ? "Checked in" : "Checked out"} ${camper.first_name} ${camper.last_name}`,
      ref_id: camper._id.toString(), ref_type: "Camper",
    });
    res.json(camper);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// NEW: toggle physical presence in camp
const toggleInCamp = async (req, res) => {
  try {
    const camper = await Camper.findById(req.params.id);
    if (!camper) return res.status(404).json({ error: "Camper not found" });
    const nowInCamp = !camper.in_camp;
    const updated = await Camper.findByIdAndUpdate(
      req.params.id,
      {
        in_camp: nowInCamp,
        left_camp_at: nowInCamp ? null : new Date(),
      },
      { new: true }
    ).populate("family_id", "family_name cabin");
    await StaffLog.create({
      username: req.user.username, role: req.user.role,
      action: nowInCamp ? "returned_to_camp" : "left_camp",
      detail: `${camper.first_name} ${camper.last_name} ${nowInCamp ? "returned to camp" : "left camp"}`,
      ref_id: camper._id.toString(), ref_type: "Camper",
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const assignDevice = async (req, res) => {
  try {
    const { device_id } = req.body;
    if (device_id) {
      await Camper.updateMany(
        { device_id, _id: { $ne: req.params.id } },
        { device_id: null }
      );
    }
    const camper = await Camper.findByIdAndUpdate(
      req.params.id, { device_id: device_id || null }, { new: true }
    ).populate("family_id", "family_name cabin");
    if (!camper) return res.status(404).json({ error: "Camper not found" });
    await StaffLog.create({
      username: req.user.username, role: req.user.role,
      action: "assigned_device",
      detail: `Assigned ${device_id || "NONE"} to ${camper.first_name} ${camper.last_name}`,
      ref_id: camper._id.toString(), ref_type: "Camper",
    });
    res.json(camper);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAll, search, getById, create, update, remove, checkIn, toggleInCamp, assignDevice };
