import { useState, useEffect } from "react";
import { api } from "../services/api";

export function useCampers() {
  const [campers, setCampers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getCampers()
      .then(setCampers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // device_id → camper lookup
  const deviceMap = {};
  campers.forEach((c) => { if (c.device_id) deviceMap[c.device_id] = c; });

  // singles = no family
  const singles = campers.filter((c) => !c.family_id);

  return { campers, singles, loading, reload: load, deviceMap };
}
