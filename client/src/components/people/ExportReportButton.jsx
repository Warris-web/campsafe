import { useState } from "react";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export default function ExportReportButton() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleExport = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("cs_token");
      const res = await fetch(`${BASE}/api/reports/incident-summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);

      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `campsafe-incident-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={loading}
        style={{
          background: "var(--teal-dim)", border: "1px solid var(--teal)",
          color: "var(--teal)", borderRadius: 6, padding: "5px 11px",
          fontSize: 10, fontFamily: "var(--font-mono)", cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", gap: 6,
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "GENERATING…" : "📄 EXPORT PDF"}
      </button>
      {error && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--red)", marginTop: 6 }}>
          {error}
        </div>
      )}
    </div>
  );
}