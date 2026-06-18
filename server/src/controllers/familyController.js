const Family   = require("../models/Family");
const Camper   = require("../models/Camper");
const StaffLog = require("../models/StaffLog");

const getAll = async (req, res) => {
  try {
    const families = await Family.find().sort({ family_name: 1 }).populate("members");
    res.json(families);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getById = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id).populate("members");
    if (!family) return res.status(404).json({ error: "Family not found" });
    res.json(family);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const create = async (req, res) => {
  try {
    const family = await Family.create(req.body);
    await StaffLog.create({
      username: req.user.username, role: req.user.role,
      action: "added_family",
      detail: `Created family: ${family.family_name}`,
      ref_id: family._id.toString(), ref_type: "Family",
    });
    res.status(201).json({ ...family.toJSON(), members: [] });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

const update = async (req, res) => {
  try {
    const family = await Family.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("members");
    if (!family) return res.status(404).json({ error: "Family not found" });
    await StaffLog.create({
      username: req.user.username, role: req.user.role,
      action: "edited_family",
      detail: `Edited family: ${family.family_name}`,
      ref_id: family._id.toString(), ref_type: "Family",
    });
    res.json(family);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

const remove = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family) return res.status(404).json({ error: "Family not found" });
    await Camper.updateMany({ family_id: req.params.id }, { family_id: null });
    await Family.findByIdAndDelete(req.params.id);
    await StaffLog.create({
      username: req.user.username, role: req.user.role,
      action: "removed_family",
      detail: `Removed family: ${family.family_name}`,
      ref_id: req.params.id, ref_type: "Family",
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAll, getById, create, update, remove };
