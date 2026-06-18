import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

// Larger polygon covering the full camp area
// Adjust these coordinates to match your real campground boundary
const GEOFENCE_ZONES = [
  {
    zone_id:   "ZONE_MAIN_CAMP",
    zone_name: "Main Camp Area",
    color:     "#00D4AA",
    polygon: [
      [6.6495, 3.4270],
      [6.6495, 3.4355],
      [6.6555, 3.4355],
      [6.6555, 3.4270],
    ],
  },
  {
    zone_id:   "ZONE_RESTRICTED",
    zone_name: "Restricted Zone",
    color:     "#EF4444",
    polygon: [
      [6.6540, 3.4278],
      [6.6540, 3.4298],
      [6.6552, 3.4298],
      [6.6552, 3.4278],
    ],
  },
  {
    zone_id:   "ZONE_MEDICAL",
    zone_name: "Medical Area",
    color:     "#3B82F6",
    polygon: [
      [6.6510, 3.4318],
      [6.6510, 3.4332],
      [6.6522, 3.4332],
      [6.6522, 3.4318],
    ],
  },
];

export default function ZoneOverlays({ breachedZones = [] }) {
  const map       = useMap();
  const layersRef = useRef({});

  useEffect(() => {
    GEOFENCE_ZONES.forEach((zone) => {
      if (layersRef.current[zone.zone_id]) return;

      const isRestricted = zone.zone_id === "ZONE_RESTRICTED";

      const polygon = L.polygon(zone.polygon, {
        color:       zone.color,
        weight:      isRestricted ? 2 : 1.5,
        opacity:     0.8,
        fillColor:   zone.color,
        fillOpacity: isRestricted ? 0.10 : 0.06,
        dashArray:   isRestricted ? "6 4" : null,
      })
        .bindTooltip(zone.zone_name, {
          permanent:  true,
          direction:  "center",
          className:  "cs-zone-tooltip",
          opacity:    0.8,
        })
        .addTo(map);

      layersRef.current[zone.zone_id] = polygon;
    });

    return () => {
      Object.values(layersRef.current).forEach((l) => l.remove());
      layersRef.current = {};
    };
  }, [map]);

  // Flash breached zones
  useEffect(() => {
    GEOFENCE_ZONES.forEach((zone) => {
      const layer = layersRef.current[zone.zone_id];
      if (!layer) return;
      const breached = breachedZones.includes(zone.zone_id);
      layer.setStyle({
        color:       breached ? "#EF4444" : zone.color,
        fillColor:   breached ? "#EF4444" : zone.color,
        fillOpacity: breached ? 0.25 : (zone.zone_id === "ZONE_RESTRICTED" ? 0.10 : 0.06),
      });
    });
  }, [breachedZones]);

  return null;
}
