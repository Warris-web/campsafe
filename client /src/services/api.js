// const BASE     = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
// const getToken = () => localStorage.getItem("cs_token") || "";

// const req = (path, opts = {}) =>
//   fetch(`${BASE}${path}`, {
//     ...opts,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${getToken()}`,
//       ...(opts.headers || {}),
//     },
//   }).then((r) => {
//     if (r.status === 401) { window.location.reload(); return; }
//     if (!r.ok) throw new Error(`API ${path} → ${r.status}`);
//     return r.json();
//   });

// export const api = {
//   getTrackers:    ()              => req("/api/trackers"),
//   getTracker:     (id)            => req(`/api/trackers/${id}`),
//   getAlerts:      ()              => req("/api/alerts"),
//   resolveAlert:   (id, name)      => req(`/api/alerts/${id}/resolve`,        { method: "POST", body: JSON.stringify({ resolved_by: name }) }),
//   getZones:       ()              => req("/api/zones"),
//   getFamilies:    ()              => req("/api/families"),
//   getFamily:      (id)            => req(`/api/families/${id}`),
//   createFamily:   (data)          => req("/api/families",                    { method: "POST", body: JSON.stringify(data) }),
//   updateFamily:   (id, data)      => req(`/api/families/${id}`,              { method: "PUT",  body: JSON.stringify(data) }),
//   deleteFamily:   (id)            => req(`/api/families/${id}`,              { method: "DELETE" }),
//   getCampers:     ()              => req("/api/campers"),
//   searchCampers:  (q)             => req(`/api/campers/search?q=${encodeURIComponent(q)}`),
//   createCamper:   (data)          => req("/api/campers",                     { method: "POST", body: JSON.stringify(data) }),
//   updateCamper:   (id, data)      => req(`/api/campers/${id}`,               { method: "PUT",  body: JSON.stringify(data) }),
//   deleteCamper:   (id)            => req(`/api/campers/${id}`,               { method: "DELETE" }),
//   checkInCamper:  (id, data)      => req(`/api/campers/${id}/checkin`,       { method: "POST", body: JSON.stringify(data) }),
//   toggleInCamp:   (id)            => req(`/api/campers/${id}/toggle-incamp`, { method: "POST" }),
//   assignDevice:   (id, device_id) => req(`/api/campers/${id}/assign-device`, { method: "POST", body: JSON.stringify({ device_id }) }),
//   getStaffLogs:   (username)      => req(`/api/staff/logs${username ? `?username=${username}` : ""}`),
//   getStaffSummary: ()             => req("/api/staff/summary"),
// };

const BASE     = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const getToken = () => localStorage.getItem("cs_token") || "";

const req = (path, opts = {}) =>
  fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers || {}),
    },
  }).then((r) => {
    if (r.status === 401) {
      // Token invalid/expired — clear session and force re-login
      localStorage.removeItem("cs_token");
      localStorage.removeItem("cs_user");
      window.location.reload();
      throw new Error("Session expired");
    }
    if (!r.ok) throw new Error(`API ${path} → ${r.status}`);
    return r.json();
  });

export const api = {
  getTrackers:    ()              => req("/api/trackers"),
  getTracker:     (id)            => req(`/api/trackers/${id}`),
  getAlerts:      ()              => req("/api/alerts"),
  resolveAlert:   (id, name)      => req(`/api/alerts/${id}/resolve`,        { method: "POST", body: JSON.stringify({ resolved_by: name }) }),
  getZones:       ()              => req("/api/zones"),
  getFamilies:    ()              => req("/api/families"),
  getFamily:      (id)            => req(`/api/families/${id}`),
  createFamily:   (data)          => req("/api/families",                    { method: "POST", body: JSON.stringify(data) }),
  updateFamily:   (id, data)      => req(`/api/families/${id}`,              { method: "PUT",  body: JSON.stringify(data) }),
  deleteFamily:   (id)            => req(`/api/families/${id}`,              { method: "DELETE" }),
  getCampers:     ()              => req("/api/campers"),
  searchCampers:  (q)             => req(`/api/campers/search?q=${encodeURIComponent(q)}`),
  createCamper:   (data)          => req("/api/campers",                     { method: "POST", body: JSON.stringify(data) }),
  updateCamper:   (id, data)      => req(`/api/campers/${id}`,               { method: "PUT",  body: JSON.stringify(data) }),
  deleteCamper:   (id)            => req(`/api/campers/${id}`,               { method: "DELETE" }),
  checkInCamper:  (id, data)      => req(`/api/campers/${id}/checkin`,       { method: "POST", body: JSON.stringify(data) }),
  toggleInCamp:   (id)            => req(`/api/campers/${id}/toggle-incamp`, { method: "POST" }),
  assignDevice:   (id, device_id) => req(`/api/campers/${id}/assign-device`, { method: "POST", body: JSON.stringify({ device_id }) }),
  getStaffLogs:   (username)      => req(`/api/staff/logs${username ? `?username=${username}` : ""}`),
  getStaffSummary: ()             => req("/api/staff/summary"),
};