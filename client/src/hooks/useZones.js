// import { useState, useEffect } from "react";
// import socket from "../services/socket";
// import { api } from "../services/api";

// export function useZones() {
//   const [zones, setZones] = useState({});

//   useEffect(() => {
//     api.getZones()
//       .then((data) => {
//         const map = {};
//         data.forEach((z) => { map[z.zone_id] = z; });
//         setZones(map);
//       })
//       .catch(() => {});

//     const onUpdate = (zone) => {
//       setZones((prev) => ({ ...prev, [zone.zone_id]: zone }));
//     };

//     socket.on("zone_update", onUpdate);
//     return () => socket.off("zone_update", onUpdate);
//   }, []);

//   return Object.values(zones);
// }

import { useState, useEffect } from "react";
import socket from "../services/socket";
import { api } from "../services/api";

export function useZones() {
  const [zones, setZones] = useState({});

  useEffect(() => {
    api.getZones()
      .then((data) => {
        const map = {};
        (Array.isArray(data) ? data : []).forEach((z) => { map[z.zone_id] = z; });
        setZones(map);
      })
      .catch(() => setZones({}));

    const onUpdate = (zone) => {
      setZones((prev) => ({ ...prev, [zone.zone_id]: zone }));
    };

    socket.on("zone_update", onUpdate);
    return () => socket.off("zone_update", onUpdate);
  }, []);

  return Object.values(zones);
}