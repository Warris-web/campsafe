
const router = require("express").Router();
const jwt    = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "campsafe-dev-secret-change-in-production";

// Static staff credentials — replace with DB lookup in production
const STAFF = [
  { username: "admin",   password: "camp2024", role: "admin"    },
  { username: "staff1",  password: "staff123", role: "staff"    },
  { username: "medical", password: "med2024",  role: "medical"  },
];

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = STAFF.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { username: user.username, role: user.role },
    SECRET,
    { expiresIn: "12h" }
  );

  res.json({ token, username: user.username, role: user.role });
});

module.exports = router;