// import { useState } from "react";
// import Header from "./components/layout/Header";
// import MapPanel from "./components/map/MapPanel";
// import AlertFeed from "./components/alerts/AlertFeed";
// import TrackerList from "./components/tracker/TrackerList";
// import TrackerHistoryPanel from "./components/tracker/TrackerHistoryPanel";
// import ZonePanel from "./components/sensors/ZonePanel";
// import FamilyPanel from "./components/people/FamilyPanel";
// import StaffLog from "./components/people/StaffLog";
// import SearchBar from "./components/people/SearchBar";
// import LoginScreen from "./components/auth/LoginScreen";
// import { useTrackers } from "./hooks/useTrackers";
// import { useAlerts } from "./hooks/useAlerts";
// import { useTrackerHistory } from "./hooks/useTrackerHistory";
// import { useZones } from "./hooks/useZones";
// import { useMissing } from "./hooks/useMissing";
// import { useSoundAlerts } from "./hooks/useSoundAlerts";
// import { useCampers } from "./hooks/useCampers";
// import { useAuth } from "./context/AuthContext";

// export default function App() {
//   const { user } = useAuth();
//   if (!user) return <LoginScreen />;
//   return <Dashboard />;
// }

// function Dashboard() {
//   const { trackers }                = useTrackers();
//   const { alerts, resolve }         = useAlerts();
//   const zones                       = useZones();
//   const missing                     = useMissing();
//   const { toggleMute }              = useSoundAlerts();
//   const { deviceMap }               = useCampers();
//   const [selectedId, setSelectedId] = useState(null);
//   const [sideTab, setSideTab]       = useState("trackers");
//   const [muteState, setMuteState]   = useState(false);
//   const { user, logout }            = useAuth();

//   const { history, loading: histLoading } = useTrackerHistory(selectedId);

//   const activeAlerts = alerts.filter((a) => !a.resolved).length;
//   const zoneAlerts   = zones.filter((z) => !z.online || z.gas || z.motion).length;
//   const missingCount = missing.length;

//   const handleSelectTracker = (deviceId) => {
//     setSelectedId(deviceId || null);
//     if (deviceId) setSideTab("trackers");
//   };

//   const handleSearchSelect = (camper) => {
//     if (camper.device_id) handleSelectTracker(camper.device_id);
//   };

//   const TABS = [
//     { id: "trackers", label: "TRACK",  badge: missingCount > 0 ? missingCount : null, badgeColor: "var(--amber)" },
//     { id: "alerts",   label: "ALERTS", badge: activeAlerts > 0 ? activeAlerts : null, badgeColor: "var(--red)"   },
//     { id: "zones",    label: "ZONES",  badge: zoneAlerts   > 0 ? zoneAlerts   : null, badgeColor: "var(--amber)" },
//     { id: "families", label: "PEOPLE", badge: null },
//     { id: "staff",    label: "STAFF",  badge: null },
//   ];

//   return (
//     <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
//       <Header
//         trackerCount={trackers.length}
//         activeAlerts={activeAlerts}
//         zoneAlerts={zoneAlerts}
//         missingCount={missingCount}
//         username={user.username}
//         isMuted={muteState}
//         onMuteToggle={() => { setMuteState((m) => !m); toggleMute(); }}
//         onLogout={logout}
//         searchSlot={<SearchBar trackers={trackers} onSelect={handleSearchSelect} />}
//       />

//       <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
//         <div style={{
//           width: "var(--sidebar-w)", flexShrink: 0,
//           background: "var(--bg-panel)",
//           borderRight: "1px solid var(--border)",
//           display: "flex", flexDirection: "column", overflow: "hidden",
//         }}>
//           {!selectedId && (
//             <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0, overflowX: "auto" }}>
//               {TABS.map(({ id, label, badge, badgeColor }) => {
//                 const isActive = sideTab === id;
//                 return (
//                   <button key={id} onClick={() => setSideTab(id)} style={{
//                     flex: "0 0 auto", padding: "10px 11px",
//                     background: "transparent", border: "none",
//                     borderBottom: `2px solid ${isActive ? "var(--teal)" : "transparent"}`,
//                     color: isActive ? "var(--teal)" : "var(--text-muted)",
//                     fontFamily: "var(--font-mono)", fontSize: 10,
//                     letterSpacing: "0.06em", cursor: "pointer",
//                     display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
//                   }}>
//                     {label}
//                     {badge && (
//                       <span style={{
//                         background: badgeColor, color: "#fff",
//                         borderRadius: "50%", width: 15, height: 15,
//                         display: "inline-flex", alignItems: "center",
//                         justifyContent: "center", fontSize: 9, fontWeight: 700,
//                       }}>{badge}</span>
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           )}

//           <div style={{ flex: 1, overflow: "hidden" }}>
//             {selectedId ? (
//               <TrackerHistoryPanel
//                 deviceId={selectedId}
//                 history={history}
//                 loading={histLoading}
//                 camper={deviceMap[selectedId]}
//                 onClose={() => setSelectedId(null)}
//               />
//             ) : sideTab === "trackers" ? (
//               <TrackerList
//                 trackers={trackers}
//                 missing={missing}
//                 selected={selectedId}
//                 onSelect={handleSelectTracker}
//                 deviceMap={deviceMap}
//               />
//             ) : sideTab === "alerts" ? (
//               <AlertFeed alerts={alerts} onResolve={resolve} />
//             ) : sideTab === "zones" ? (
//               <ZonePanel zones={zones} />
//             ) : sideTab === "families" ? (
//               <FamilyPanel trackers={trackers} onSelectTracker={handleSelectTracker} />
//             ) : (
//               <StaffLog />
//             )}
//           </div>
//         </div>

//         <MapPanel
//           trackers={trackers}
//           selectedId={selectedId}
//           history={history}
//           breachedZones={[]}
//           deviceMap={deviceMap}
//         />
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import Header from "./components/layout/Header";
import MapPanel from "./components/map/MapPanel";
import AlertFeed from "./components/alerts/AlertFeed";
import TrackerList from "./components/tracker/TrackerList";
import TrackerHistoryPanel from "./components/tracker/TrackerHistoryPanel";
import ZonePanel from "./components/sensors/ZonePanel";
import FamilyPanel from "./components/people/FamilyPanel";
import StaffLog from "./components/people/StaffLog";
import StaffManagement from "./components/people/StaffManagement";
import SearchBar from "./components/people/SearchBar";
import LoginScreen from "./components/auth/LoginScreen";
import { useTrackers } from "./hooks/useTrackers";
import { useAlerts } from "./hooks/useAlerts";
import { useTrackerHistory } from "./hooks/useTrackerHistory";
import { useZones } from "./hooks/useZones";
import { useMissing } from "./hooks/useMissing";
import { useSoundAlerts } from "./hooks/useSoundAlerts";
import { useCampers } from "./hooks/useCampers";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user } = useAuth();
  if (!user) return <LoginScreen />;
  return <Dashboard />;
}

function Dashboard() {
  const { trackers }                = useTrackers();
  const { alerts, resolve }         = useAlerts();
  const zones                       = useZones();
  const missing                     = useMissing();
  const { toggleMute }              = useSoundAlerts();
  const { deviceMap }               = useCampers();
  const [selectedId, setSelectedId] = useState(null);
  const [sideTab, setSideTab]       = useState("trackers");
  const [muteState, setMuteState]   = useState(false);
  const { user, logout }            = useAuth();

  const { history, loading: histLoading } = useTrackerHistory(selectedId);

  const activeAlerts = alerts.filter((a) => !a.resolved).length;
  const zoneAlerts   = zones.filter((z) => !z.online || z.gas || z.motion).length;
  const missingCount = missing.length;

  const handleSelectTracker = (deviceId) => {
    setSelectedId(deviceId || null);
    if (deviceId) setSideTab("trackers");
  };

  const handleSearchSelect = (camper) => {
    if (camper.device_id) handleSelectTracker(camper.device_id);
  };

  const TABS = [
    { id: "trackers", label: "TRACK",  badge: missingCount > 0 ? missingCount : null, badgeColor: "var(--amber)" },
    { id: "alerts",   label: "ALERTS", badge: activeAlerts > 0 ? activeAlerts : null, badgeColor: "var(--red)"   },
    { id: "zones",    label: "ZONES",  badge: zoneAlerts   > 0 ? zoneAlerts   : null, badgeColor: "var(--amber)" },
    { id: "families", label: "PEOPLE", badge: null },
    { id: "staff",    label: "STAFF",  badge: null },
    ...(user.role === "admin" ? [{ id: "accounts", label: "ACCOUNTS", badge: null }] : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header
        trackerCount={trackers.length}
        activeAlerts={activeAlerts}
        zoneAlerts={zoneAlerts}
        missingCount={missingCount}
        username={user.username}
        isMuted={muteState}
        onMuteToggle={() => { setMuteState((m) => !m); toggleMute(); }}
        onLogout={logout}
        searchSlot={<SearchBar trackers={trackers} onSelect={handleSearchSelect} />}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{
          width: "var(--sidebar-w)", flexShrink: 0,
          background: "var(--bg-panel)",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {!selectedId && (
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0, overflowX: "auto" }}>
              {TABS.map(({ id, label, badge, badgeColor }) => {
                const isActive = sideTab === id;
                return (
                  <button key={id} onClick={() => setSideTab(id)} style={{
                    flex: "0 0 auto", padding: "10px 11px",
                    background: "transparent", border: "none",
                    borderBottom: `2px solid ${isActive ? "var(--teal)" : "transparent"}`,
                    color: isActive ? "var(--teal)" : "var(--text-muted)",
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    letterSpacing: "0.06em", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                  }}>
                    {label}
                    {badge && (
                      <span style={{
                        background: badgeColor, color: "#fff",
                        borderRadius: "50%", width: 15, height: 15,
                        display: "inline-flex", alignItems: "center",
                        justifyContent: "center", fontSize: 9, fontWeight: 700,
                      }}>{badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ flex: 1, overflow: "hidden" }}>
            {selectedId ? (
              <TrackerHistoryPanel
                deviceId={selectedId}
                history={history}
                loading={histLoading}
                camper={deviceMap[selectedId]}
                onClose={() => setSelectedId(null)}
              />
            ) : sideTab === "trackers" ? (
              <TrackerList
                trackers={trackers}
                missing={missing}
                selected={selectedId}
                onSelect={handleSelectTracker}
                deviceMap={deviceMap}
              />
            ) : sideTab === "alerts" ? (
              <AlertFeed alerts={alerts} onResolve={resolve} />
            ) : sideTab === "zones" ? (
              <ZonePanel zones={zones} />
            ) : sideTab === "families" ? (
              <FamilyPanel trackers={trackers} onSelectTracker={handleSelectTracker} />
            ) : sideTab === "staff" ? (
              <StaffLog />
            ) : (
              <StaffManagement currentUser={user} />
            )}
          </div>
        </div>

        <MapPanel
          trackers={trackers}
          selectedId={selectedId}
          history={history}
          breachedZones={[]}
          deviceMap={deviceMap}
        />
      </div>
    </div>
  );
}