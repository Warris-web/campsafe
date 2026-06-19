// src/hooks/useTrackerHistory.js
// Fetches position history for one device. Re-fetches when selectedId changes.

import { useState, useEffect } from "react";
import { api } from "../services/api";

export function useTrackerHistory(deviceId) {
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!deviceId) { setHistory([]); return; }

    setLoading(true);
    setError(null);

    api.getTracker(deviceId)
      .then((data) => {
        // API returns newest-first; reverse for chronological path drawing
        setHistory([...data].reverse());
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [deviceId]);

  // Derived stats
  const stats = deriveStats(history);

  return { history, loading, error, stats };
}

function deriveStats(history) {
  if (history.length < 2) return null;

  // Total distance (Haversine sum)
  let distanceM = 0;
  for (let i = 1; i < history.length; i++) {
    distanceM += haversine(
      history[i - 1].latitude, history[i - 1].longitude,
      history[i].latitude,     history[i].longitude
    );
  }

  // Time active
  const first = new Date(history[0].createdAt);
  const last  = new Date(history[history.length - 1].createdAt);
  const durationMs = last - first;

  // Battery trend (first vs last)
  const batStart = history[0].battery_pct;
  const batEnd   = history[history.length - 1].battery_pct;
  const batDrain = batStart != null && batEnd != null ? batStart - batEnd : null;

  // SOS count
  const sosCount = history.filter((e) => e.sos).length;

  return { distanceM, durationMs, batStart, batEnd, batDrain, sosCount, points: history.length };
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000; // metres
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
