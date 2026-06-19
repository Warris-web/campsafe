// // Point-in-polygon (ray casting) geofence checker.
// // Called on every tracker_update — emits zone_breach / zone_enter events.

// const ZONES = [
//   {
//     zone_id: "ZONE_MAIN_CAMP",
//     zone_name: "Main Camp Area",
//     // Rough polygon around the camp centre — adjust to your real coordinates
//     polygon: [
//       [6.6505, 3.4285],
//       [6.6505, 3.4335],
//       [6.6545, 3.4335],
//       [6.6545, 3.4285],
//     ],
//   },
//   {
//     zone_id: "ZONE_RESTRICTED",
//     zone_name: "Restricted Zone",
//     polygon: [
//       [6.6538, 3.4285],
//       [6.6538, 3.4300],
//       [6.6548, 3.4300],
//       [6.6548, 3.4285],
//     ],
//   },
// ];

// // Ray-casting algorithm — returns true if point [lat, lng] is inside polygon
// function pointInPolygon(lat, lng, polygon) {
//   let inside = false;
//   for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
//     const [xi, yi] = polygon[i];
//     const [xj, yj] = polygon[j];
//     const intersect =
//       yi > lng !== yj > lng &&
//       lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
//     if (intersect) inside = !inside;
//   }
//   return inside;
// }

// // device_id → Set of zone_ids currently inside
// const deviceZoneState = {};

// function checkGeofences(io, event) {
//   const { device_id, latitude, longitude } = event;
//   if (!deviceZoneState[device_id]) deviceZoneState[device_id] = new Set();

//   const prevZones = deviceZoneState[device_id];

//   for (const zone of ZONES) {
//     const inside = pointInPolygon(latitude, longitude, zone.polygon);
//     const wasInside = prevZones.has(zone.zone_id);

//     if (inside && !wasInside) {
//       // Entered zone
//       prevZones.add(zone.zone_id);
//       io.emit("zone_enter", { device_id, zone_id: zone.zone_id, zone_name: zone.zone_name, latitude, longitude });
//     }

//     if (!inside && wasInside) {
//       // Exited zone — this is the breach if it's a restricted zone
//       prevZones.delete(zone.zone_id);
//       const payload = { device_id, zone_id: zone.zone_id, zone_name: zone.zone_name, latitude, longitude };
//       io.emit("zone_breach", payload);
//       if (zone.zone_id === "ZONE_RESTRICTED") {
//         console.warn(`🚧 ZONE BREACH: ${device_id} left ${zone.zone_name}`);
//       }
//     }
//   }
// }

// module.exports = { checkGeofences, ZONES };


// Point-in-polygon (ray casting) geofence checker.
// Must match the polygons in frontend/src/components/map/ZoneOverlays.jsx

const ZONES = [
  {
    zone_id: "ZONE_MAIN_CAMP",
    zone_name: "Main Camp Area",
    polygon: [
      [6.8047, 3.4534],
      [6.8047, 3.4594],
      [6.8107, 3.4594],
      [6.8107, 3.4534],
    ],
  },
  {
    zone_id: "ZONE_RESTRICTED",
    zone_name: "Restricted Zone",
    polygon: [
      [6.8092, 3.4542],
      [6.8092, 3.4562],
      [6.8104, 3.4562],
      [6.8104, 3.4542],
    ],
  },
];

function pointInPolygon(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > lng !== yj > lng &&
      lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

const deviceZoneState = {};

function checkGeofences(io, event) {
  const { device_id, latitude, longitude } = event;
  if (!deviceZoneState[device_id]) deviceZoneState[device_id] = new Set();
  const prevZones = deviceZoneState[device_id];

  for (const zone of ZONES) {
    const inside    = pointInPolygon(latitude, longitude, zone.polygon);
    const wasInside = prevZones.has(zone.zone_id);

    if (inside && !wasInside) {
      prevZones.add(zone.zone_id);
      io.emit("zone_enter", { device_id, zone_id: zone.zone_id, zone_name: zone.zone_name, latitude, longitude });
    }
    if (!inside && wasInside) {
      prevZones.delete(zone.zone_id);
      io.emit("zone_breach", { device_id, zone_id: zone.zone_id, zone_name: zone.zone_name, latitude, longitude });
      if (zone.zone_id === "ZONE_RESTRICTED") {
        console.warn(`🚧 ZONE BREACH: ${device_id} left ${zone.zone_name}`);
      }
    }
  }
}

module.exports = { checkGeofences, ZONES };