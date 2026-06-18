// require("dotenv").config();

// const express    = require("express");
// const http       = require("http");
// const cors       = require("cors");
// const { Server } = require("socket.io");

// const { connectLocal, connectAtlas } = require("./config/db");
// const authMiddleware                 = require("./middleware/auth");

// const app    = express();
// const server = http.createServer(app);
// const io     = new Server(server, {
//   cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
// });

// // ── Middleware ────────────────────────────────────────────
// app.use(cors());
// app.use(express.json());

// // ── Public routes (no auth) ───────────────────────────────
// app.use("/api/auth", require("./routes/auth"));

// // ── Protected routes ──────────────────────────────────────
// app.use("/api/trackers", authMiddleware, require("./routes/trackers"));
// app.use("/api/alerts",   authMiddleware, require("./routes/alerts"));
// app.use("/api/zones",    authMiddleware, require("./routes/zones"));

// // ── Socket.io ─────────────────────────────────────────────
// io.use((socket, next) => {
//   // Allow socket connections with valid JWT
//   const token = socket.handshake.auth?.token;
//   if (!token) return next(new Error("Authentication required"));
//   try {
//     const jwt = require("jsonwebtoken");
//     socket.user = jwt.verify(token, process.env.JWT_SECRET || "campsafe-dev-secret-change-in-production");
//     next();
//   } catch {
//     next(new Error("Invalid token"));
//   }
// });

// io.on("connection", (socket) => {
//   console.log(`📡 ${socket.user.username} connected`);
//   socket.on("disconnect", () => console.log(`📡 ${socket.user.username} disconnected`));
// });

// app.set("io", io);

// // ── Boot ──────────────────────────────────────────────────
// const PORT = process.env.PORT || 3001;

// (async () => {
//   await connectLocal();
//   await connectAtlas();

//   // Start missing person watcher
//   require("./services/missingWatcher")(app);

//   if (process.env.SIMULATE_HARDWARE !== "true") {
//     require("./services/serialBridge")(app);
//   } else {
//     console.log("🔧 Hardware simulation mode — no serial port opened");
//     require("./services/simulator")(app);
//   }

//   server.listen(PORT, () => {
//     console.log(`🚀 CampSafe backend running on http://localhost:${PORT}`);
//   });
// })();


require("dotenv").config();

const express    = require("express");
const http       = require("http");
const cors       = require("cors");
const { Server } = require("socket.io");

const { connectLocal, connectAtlas } = require("./config/db");
const authMiddleware                 = require("./middleware/auth");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

app.use(cors());
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

// ── Socket.io with JWT ────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    const jwt  = require("jsonwebtoken");
    socket.user = jwt.verify(token, process.env.JWT_SECRET || "campsafe-dev-secret-change-in-production");
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

  if (process.env.SIMULATE_HARDWARE !== "true") {
    require("./services/serialBridge")(app);
  } else {
    console.log("🔧 Hardware simulation mode — no serial port opened");
    require("./services/simulator")(app);
  }

  server.listen(PORT, () => {
    console.log(`🚀 CampSafe backend running on http://localhost:${PORT}`);
  });
})();
