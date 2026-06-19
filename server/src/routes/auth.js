const router = require("express").Router();
const jwt    = require("jsonwebtoken");
const User   = require("../models/User");
const authMiddleware = require("../middleware/auth");

const SECRET = process.env.JWT_SECRET;

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim(), active: true });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await user.checkPassword(password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { username: user.username, role: user.role },
      SECRET,
      { expiresIn: "12h" }
    );

    res.json({ token, username: user.username, role: user.role, full_name: user.full_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-only: create a new staff account
router.post("/register", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can create staff accounts" });
    }
    const { username, password, role, full_name } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: "Username already exists" });

    const password_hash = await User.hashPassword(password);
    const user = await User.create({
      username: username.toLowerCase().trim(),
      password_hash,
      role: role || "staff",
      full_name: full_name || "",
    });

    res.status(201).json({ username: user.username, role: user.role, full_name: user.full_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-only: list all staff
router.get("/users", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }
    const users = await User.find().select("-password_hash").sort({ username: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-only: deactivate/reactivate a staff account
router.put("/users/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }
    const { active, role, full_name } = req.body;
    const update = {};
    if (active !== undefined)   update.active = active;
    if (role)                   update.role = role;
    if (full_name !== undefined) update.full_name = full_name;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-password_hash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;