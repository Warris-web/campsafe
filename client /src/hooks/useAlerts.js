import { useState, useEffect } from "react";
import socket from "../services/socket";
import { api } from "../services/api";

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.getAlerts()
      .then((data) => setAlerts(data))
      .catch(() => {});

    const onAlert = (alert) => {
      setAlerts((prev) => {
        const exists = prev.find((a) => a._id === alert._id);
        if (exists) return prev;
        return [alert, ...prev];
      });
    };

    socket.on("sos_alert", onAlert);
    return () => socket.off("sos_alert", onAlert);
  }, []);

  const resolve = async (id, name) => {
    const updated = await api.resolveAlert(id, name);
    setAlerts((prev) =>
      prev.map((a) => (a._id === id ? { ...a, resolved: true, resolved_by: name } : a))
    );
    return updated;
  };

  return { alerts, resolve };
}
