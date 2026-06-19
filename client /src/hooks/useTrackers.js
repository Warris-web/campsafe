// import { useState, useEffect } from "react";
// import socket from "../services/socket";
// import { api } from "../services/api";

// export function useTrackers() {
//   const [trackers, setTrackers] = useState({});
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     api.getTrackers()
//       .then((data) => {
//         const map = {};
//         data.forEach((t) => { map[t.device_id] = t; });
//         setTrackers(map);
//       })
//       .catch(() => {});

//     const onUpdate = (event) => {
//       setTrackers((prev) => ({ ...prev, [event.device_id]: event }));
//     };

//     socket.on("connect",        () => setConnected(true));
//     socket.on("disconnect",     () => setConnected(false));
//     socket.on("tracker_update", onUpdate);
//     setConnected(socket.connected);

//     return () => {
//       socket.off("tracker_update", onUpdate);
//       socket.off("connect");
//       socket.off("disconnect");
//     };
//   }, []);

//   return { trackers: Object.values(trackers), connected };
// }

import { useState, useEffect } from "react";
import socket from "../services/socket";
import { api } from "../services/api";

export function useTrackers() {
  const [trackers, setTrackers] = useState({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    api.getTrackers()
      .then((data) => {
        const map = {};
        (Array.isArray(data) ? data : []).forEach((t) => { map[t.device_id] = t; });
        setTrackers(map);
      })
      .catch(() => {});

    const onUpdate = (event) => {
      setTrackers((prev) => ({ ...prev, [event.device_id]: event }));
    };

    socket.on("connect",        () => setConnected(true));
    socket.on("disconnect",     () => setConnected(false));
    socket.on("tracker_update", onUpdate);
    setConnected(socket.connected);

    return () => {
      socket.off("tracker_update", onUpdate);
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return { trackers: Object.values(trackers), connected };
}