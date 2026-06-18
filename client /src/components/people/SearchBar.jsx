import { useState, useEffect, useRef } from "react";
import { api } from "../../services/api";

export default function SearchBar({ onSelect, trackers }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const timer   = useRef(null);
  const wrapRef = useRef(null);

  const trackerMap = {};
  trackers.forEach((t) => { trackerMap[t.device_id] = t; });

  useEffect(() => {
    clearTimeout(timer.current);
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const data = await api.searchCampers(query);
        setResults(data);
        setOpen(true);
      } catch {}
      finally { setLoading(false); }
    }, 300);
  }, [query]);

  useEffect(() => {
    const handler = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (camper) => {
    setQuery("");
    setOpen(false);
    onSelect(camper);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: 1, maxWidth: 340 }}>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
          color: "var(--text-muted)", fontSize: 13, pointerEvents: "none",
        }}>🔍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search camper or family…"
          style={{
            width: "100%", background: "var(--bg-card)",
            border: "1px solid var(--border-light)", borderRadius: 7,
            padding: "7px 12px 7px 32px",
            color: "var(--text-primary)", fontFamily: "var(--font-mono)",
            fontSize: 12, outline: "none",
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--teal)"; if (results.length) setOpen(true); }}
          onBlur={(e)  => e.target.style.borderColor = "var(--border-light)"}
        />
        {loading && (
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "var(--text-muted)" }}>…</span>
        )}
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 2000,
          background: "var(--bg-panel)", border: "1px solid var(--border)",
          borderRadius: 8, overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}>
          {results.map((camper) => {
            const tracker = camper.device_id ? trackerMap[camper.device_id] : null;
            const online  = !!tracker;
            const sos     = tracker?.sos;
            const initials = `${camper.first_name[0]}${camper.last_name[0]}`.toUpperCase();
            const statusColor = sos ? "var(--red)" : online ? "var(--teal)" : "var(--border)";

            return (
              <div
                key={camper._id}
                onClick={() => handleSelect(camper)}
                style={{
                  padding: "10px 14px", cursor: "pointer",
                  borderBottom: "1px solid var(--border)",
                  display: "flex", alignItems: "center", gap: 10,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: `${statusColor}22`,
                  border: `2px solid ${statusColor}`,
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700,
                  color: statusColor,
                }}>
                  {initials}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500, color: sos ? "var(--red)" : "var(--text-primary)" }}>
                    {sos && "🚨 "}{camper.first_name} {camper.last_name}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                    {camper.family_id?.family_name || "No family"} · Age {camper.age ?? "—"}
                    {" · "}
                    <span style={{ color: online ? "var(--teal)" : "var(--text-muted)" }}>
                      {sos ? "🚨 SOS" : online ? `● ${camper.device_id}` : "no device"}
                    </span>
                  </div>
                </div>

                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10, flexShrink: 0,
                  color: camper.role === "child" ? "var(--teal)" : "var(--text-muted)",
                  background: "var(--bg-base)", borderRadius: 4,
                  padding: "2px 6px", border: "1px solid var(--border)",
                }}>
                  {camper.role}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {open && !loading && query && results.length === 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 2000,
          background: "var(--bg-panel)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "16px", textAlign: "center",
          fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)",
        }}>
          No results for "{query}"
        </div>
      )}
    </div>
  );
}
