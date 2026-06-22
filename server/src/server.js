// require("dotenv").config();

// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");
// const jwt = require("jsonwebtoken");

// const { connectLocal, connectAtlas } = require("./config/db");
// const authMiddleware = require("./middleware/auth");

// // ─────────────────────────────────────────────
// // Security check
// // ─────────────────────────────────────────────
// if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
//   console.error("❌ JWT_SECRET missing or too short.");
//   process.exit(1);
// }

// const app = express();
// const server = http.createServer(app);

// // ─────────────────────────────────────────────
// // Allowed origins (DEV + PROD SAFE)
// // ─────────────────────────────────────────────
// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://127.0.0.1:5173",
//   "https://campsafe-alpha.vercel.app"
// ];

// // ─────────────────────────────────────────────
// // Express CORS
// // ─────────────────────────────────────────────
// app.use(
//   cors({
//     origin: allowedOrigins,
//     credentials: true
//   })
// );

// app.use(express.json());

// // ─────────────────────────────────────────────
// // Socket.IO with CORS
// // ─────────────────────────────────────────────
// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ["GET", "POST"],
//     credentials: true
//   }
// });

// // ─────────────────────────────────────────────
// // JWT Socket Authentication
// // ─────────────────────────────────────────────
// io.use((socket, next) => {
//   const token = socket.handshake.auth?.token;

//   if (!token) {
//     return next(new Error("Authentication required"));
//   }

//   try {
//     socket.user = jwt.verify(token, process.env.JWT_SECRET);
//     next();
//   } catch (err) {
//     next(new Error("Invalid token"));
//   }
// });

// // ─────────────────────────────────────────────
// // Socket Events
// // ─────────────────────────────────────────────
// io.on("connection", (socket) => {
//   console.log(`📡 Connected: ${socket.user.username}`);

//   socket.on("disconnect", () => {
//     console.log(`📡 Disconnected: ${socket.user.username}`);
//   });
// });

// app.set("io", io);

// // ─────────────────────────────────────────────
// // Routes
// // ─────────────────────────────────────────────
// app.use("/api/auth", require("./routes/auth"));

// app.use("/api/trackers", authMiddleware, require("./routes/trackers"));
// app.use("/api/alerts", authMiddleware, require("./routes/alerts"));
// app.use("/api/zones", authMiddleware, require("./routes/zones"));
// app.use("/api/families", authMiddleware, require("./routes/families"));
// app.use("/api/campers", authMiddleware, require("./routes/campers"));
// app.use("/api/staff", authMiddleware, require("./routes/staff"));
// app.use("/api/reports",  authMiddleware, require("./routes/reports"));
 

// // ─────────────────────────────────────────────
// // Boot sequence
// // ─────────────────────────────────────────────
// const PORT = process.env.PORT || 3001;

// (async () => {
//   try {
//     await connectLocal();
//     await connectAtlas();

//     require("./services/missingWatcher")(app);
//     require("./services/atlasSync")(app);

//     if (process.env.SIMULATE_HARDWARE !== "true") {
//       require("./services/serialBridge")(app);
//     } else {
//       console.log("🔧 Simulator mode enabled");
//       require("./services/simulator")(app);
//     }

//     server.listen(PORT, () => {
//       console.log(`🚀 Server running on http://localhost:${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Startup error:", err);
//     process.exit(1);
//   }
// })();




require("dotenv").config();

const express    = require("express");
const http       = require("http");
const cors       = require("cors");
const { Server } = require("socket.io");
const jwt        = require("jsonwebtoken");

const { connectLocal, connectAtlas } = require("./config/db");
const authMiddleware                 = require("./middleware/auth");

// ── Fail fast on missing critical config ──────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("❌ JWT_SECRET is missing or too short. Set a long random string in .env");
  console.error("   Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"");
  process.exit(1);
}

const app    = express();
const server = http.createServer(app);

const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({
  origin: ALLOWED_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// ── Public ────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));

// ── Protected ─────────────────────────────────────────────
app.use("/api/trackers", authMiddleware, require("./routes/trackers"));
app.use("/api/alerts",   authMiddleware, require("./routes/alerts"));
app.use("/api/zones",    authMiddleware, require("./routes/zones"));
app.use("/api/families", authMiddleware, require("./routes/families"));
app.use("/api/campers",  authMiddleware, require("./routes/campers"));
app.use("/api/staff",    authMiddleware, require("./routes/staff"));
app.use("/api/reports",  authMiddleware, require("./routes/reports"));
app.use("/api/simulator", authMiddleware, require("./routes/simulator"));

// ── Socket.io with JWT ────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`📡 ${socket.user.username} connected`);
  socket.on("disconnect", () => console.log(`📡 ${socket.user.username} disconnected`));
});

app.set("io", io);

// ── Boot ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

(async () => {
  await connectLocal();
  await connectAtlas();

  require("./services/missingWatcher")(app);
  require("./services/atlasSync")(app);

  // MANUAL_SIMULATOR=true → the /simulator page on the frontend is the
  // sole data source (judges drag tags on a map). No serial port,
  // no background auto-simulator — everything is human-driven.
  if (process.env.MANUAL_SIMULATOR === "true") {
    console.log("🎮 Manual simulator mode — use the /simulator page to drive tracker data");
  } else if (process.env.SIMULATE_HARDWARE !== "true") {
    require("./services/serialBridge")(app);
  } else {
    console.log("🔧 Hardware simulation mode — no serial port opened");
    require("./services/simulator")(app);
  }

  server.listen(PORT, () => {
    console.log(`🚀 CampSafe backend running on http://localhost:${PORT}`);
  });
})();