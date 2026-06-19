


import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import socket from "../services/socket";

export function useCampers() {
  const [campers, setCampers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.getCampers()
      .then(setCampers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    // Refetch whenever any staff action happens (device assigned, person edited, etc)
    // We piggyback on tracker_update as a cheap "something changed, resync" trigger
    // every 10s, plus immediate reload on these explicit events:
    const interval = setInterval(load, 10000); // poll every 10s as a safety net
    return () => clearInterval(interval);
  }, [load]);

  const deviceMap = {};
  campers.forEach((c) => { if (c.device_id) deviceMap[c.device_id] = c; });

  const singles = campers.filter((c) => !c.family_id);

  return { campers, singles, loading, reload: load, deviceMap };
}