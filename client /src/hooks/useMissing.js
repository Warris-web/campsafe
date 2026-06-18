import { useState, useEffect } from "react";
import socket from "../services/socket";

export function useMissing() {
  const [missing, setMissing] = useState({});

  useEffect(() => {
    const onMissing = (payload) => {
      setMissing((prev) => ({ ...prev, [payload.device_id]: payload }));
    };
    const onRecovered = ({ device_id }) => {
      setMissing((prev) => {
        const next = { ...prev };
        delete next[device_id];
        return next;
      });
    };

    socket.on("tracker_missing",   onMissing);
    socket.on("tracker_recovered", onRecovered);

    return () => {
      socket.off("tracker_missing",   onMissing);
      socket.off("tracker_recovered", onRecovered);
    };
  }, []);

  return Object.values(missing);
}