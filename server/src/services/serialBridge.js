// // src/services/serialBridge.js
// // Opens the USB serial port, parses JSON packets from the gateway ESP32,
// // saves to MongoDB, and emits Socket.io events to the dashboard.

// const { SerialPort } = require("serialport");
// const { ReadlineParser } = require("@serialport/parser-readline");
// const TrackerEvent  = require("../models/TrackerEvent");
// const SosAlert      = require("../models/SosAlert");

// module.exports = (app) => {
//   const io = app.get("io");

//   const port = new SerialPort({
//     path: process.env.SERIAL_PORT || "/dev/ttyUSB0",
//     baudRate: parseInt(process.env.SERIAL_BAUD) || 115200,
//   });

//   const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

//   port.on("open", () => console.log(`🔌 Serial port open: ${process.env.SERIAL_PORT}`));
//   port.on("error", (err) => console.error("❌ Serial port error:", err.message));

//   parser.on("data", async (line) => {
//     try {
//       // Expected: {"id":"TAG_01","lat":6.65,"lng":3.43,"sos":false,"bat":78}
//       const packet = JSON.parse(line.trim());
//       const { id, lat, lng, sos, bat } = packet;

//       if (!id || lat == null || lng == null) return;

//       const event = await TrackerEvent.create({
//         device_id:   id,
//         latitude:    lat,
//         longitude:   lng,
//         battery_pct: bat ?? null,
//         sos:         !!sos,
//       });

//       io.emit("tracker_update", event);

//       if (sos) {
//         const alert = await SosAlert.create({
//           device_id: id,
//           latitude:  lat,
//           longitude: lng,
//         });
//         io.emit("sos_alert", alert);
//         console.warn(`🚨 SOS from ${id} at ${lat}, ${lng}`);
//       }
//     } catch (err) {
//       // Ignore malformed packets (partial reads, noise)
//       if (err.name !== "SyntaxError") console.error("Serial parse error:", err.message);
//     }
//   });
// };

const { SerialPort }      = require("serialport");
const { ReadlineParser }  = require("@serialport/parser-readline");
const TrackerEvent        = require("../models/TrackerEvent");
const SosAlert            = require("../models/SosAlert");

const RECONNECT_DELAY_MS  = 5000;
const DEDUP_WINDOW_MS     = 3000; // ignore same device_id within 3s

// In-memory dedup cache: device_id → last saved timestamp
const lastSaved = {};

function isDuplicate(device_id) {
  const now  = Date.now();
  const last = lastSaved[device_id] || 0;
  if (now - last < DEDUP_WINDOW_MS) return true;
  lastSaved[device_id] = now;
  return false;
}

function validatePacket(packet) {
  const { id, lat, lng } = packet;
  if (typeof id  !== "string" || id.trim() === "")  return "missing id";
  if (typeof lat !== "number" || isNaN(lat))         return "invalid lat";
  if (typeof lng !== "number" || isNaN(lng))         return "invalid lng";
  if (lat < -90  || lat > 90)                        return "lat out of range";
  if (lng < -180 || lng > 180)                       return "lng out of range";
  if (packet.bat !== undefined && (packet.bat < 0 || packet.bat > 100)) return "bat out of range";
  return null; // valid
}

function openPort(app) {
  const io = app.get("io");
  const portPath = process.env.SERIAL_PORT || "/dev/ttyUSB0";
  const baudRate = parseInt(process.env.SERIAL_BAUD) || 115200;

  let port;
  try {
    port = new SerialPort({ path: portPath, baudRate, autoOpen: false });
  } catch (err) {
    console.error("❌ SerialPort init failed:", err.message);
    setTimeout(() => openPort(app), RECONNECT_DELAY_MS);
    return;
  }

  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  port.open((err) => {
    if (err) {
      console.error(`❌ Serial open failed (${portPath}):`, err.message);
      console.log(`🔄 Retrying serial in ${RECONNECT_DELAY_MS / 1000}s…`);
      setTimeout(() => openPort(app), RECONNECT_DELAY_MS);
      return;
    }
    console.log(`🔌 Serial port open: ${portPath} @ ${baudRate}`);
  });

  port.on("close", () => {
    console.warn("📴 Serial port closed — reconnecting…");
    setTimeout(() => openPort(app), RECONNECT_DELAY_MS);
  });

  port.on("error", (err) => {
    console.error("❌ Serial error:", err.message);
  });

  parser.on("data", async (line) => {
    let packet;
    try {
      packet = JSON.parse(line.trim());
    } catch {
      return; // silently drop malformed lines (noise / partial reads)
    }

    const validationError = validatePacket(packet);
    if (validationError) {
      console.warn(`⚠️  Invalid packet (${validationError}):`, line.trim());
      return;
    }

    if (isDuplicate(packet.id)) return;

    const { id, lat, lng, sos, bat } = packet;

    const event = await TrackerEvent.create({
      device_id: id, latitude: lat, longitude: lng,
      battery_pct: bat ?? null, sos: !!sos,
    });

    io.emit("tracker_update", event);

    if (sos) {
      const alert = await SosAlert.create({ device_id: id, latitude: lat, longitude: lng });
      io.emit("sos_alert", alert);
      console.warn(`🚨 SOS from ${id} at ${lat}, ${lng}`);
    }
  });
}

module.exports = (app) => openPort(app);