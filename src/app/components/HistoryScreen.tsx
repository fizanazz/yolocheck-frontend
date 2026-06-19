import { useState } from "react";
import { ScanItem, Screen } from "../App";
import { Clock, Plus, Activity, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  scans:    ScanItem[];
  navigate: (s: Screen) => void;
  onSelectScan?: (scan: ScanItem) => void;
}

const riskColors = {
  Low:      { bg: "rgba(34,197,94,0.12)",  text: "#4ade80", border: "rgba(34,197,94,0.25)"  },
  Moderate: { bg: "rgba(234,179,8,0.12)",  text: "#facc15", border: "rgba(234,179,8,0.25)"  },
  High:     { bg: "rgba(239,68,68,0.12)",  text: "#f87171", border: "rgba(239,68,68,0.25)"  },
};

const BACKEND = "http://localhost:8000";

export function HistoryScreen({ scans, navigate, onSelectScan }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleScanClick = async (scan: ScanItem) => {
    // If scan already has full data (just scanned this session) go straight to result
    if (scan.confidence > 0 && scan.abcd.asymmetry > 0) {
      onSelectScan?.(scan);
      navigate("result");
      return;
    }

    // Otherwise fetch full details from backend
    setLoadingId(scan.id);
    try {
      const res = await fetch(`${BACKEND}/scan/${scan.scanId}`);
      if (!res.ok) throw new Error("Failed to fetch scan");
      const data = await res.json();

      const primary = data.detections?.[0] ?? null;

      const fullScan: ScanItem = {
        ...scan,
        confidence:  primary ? Math.round(primary.confidence * 100) : 0,
        label:       primary?.label ?? "unknown",
        imageUrl:    scan.imageUrl || data.image_url,
        imageUrlRemote: data.image_url,
        abcd: primary ? {
          asymmetry:      primary.abcd.asymmetry,
          border:         primary.abcd.border,
          color:          primary.abcd.color,
          diameter:       primary.abcd.diameter,
          total_score:    primary.abcd.total_score,
          asymmetry_note: primary.abcd.asymmetry_note,
          border_note:    primary.abcd.border_note,
          color_note:     primary.abcd.color_note,
          diameter_note:  primary.abcd.diameter_note,
        } : scan.abcd,
        boundingBox: primary ? {
          x1:        primary.bounding_box.x1,
          y1:        primary.bounding_box.y1,
          x2:        primary.bounding_box.x2,
          y2:        primary.bounding_box.y2,
          bboxWidth: primary.bounding_box.width,
          bboxHeight: primary.bounding_box.height,
        } : null,
        totalMolesDetected: data.total_moles_detected,
      };

      onSelectScan?.(fullScan);
      navigate("result");
    } catch (err) {
      console.error("Could not load scan details:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10"
      style={{ backgroundColor: "#0F1629" }}>
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Scan History</h1>
            <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
              {scans.length === 0
                ? "Your scan history will appear here after your first analysis."
                : `${scans.length} scan${scans.length !== 1 ? "s" : ""} completed`}
            </p>
          </div>
          <button onClick={() => navigate("scan-method")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: "#9B3C7A" }}>
            <Plus size={16} />
            New Scan
          </button>
        </div>

        {scans.length === 0 ? (
          <div className="rounded-2xl border p-16 text-center"
            style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "rgba(155,60,122,0.1)" }}>
              <Activity size={36} style={{ color: "#9B3C7A" }} />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Scans Yet</h2>
            <p className="text-sm max-w-sm mx-auto mb-8" style={{ color: "#9CA3AF" }}>
              Your scan history is empty. Complete your first AI-powered mole analysis
              to start building your personal health timeline.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate("scan-method")}
                className="px-7 py-3 rounded-xl font-medium text-white"
                style={{ backgroundColor: "#9B3C7A" }}>
                Start First Scan
              </button>
              <button onClick={() => navigate("demo")}
                className="px-7 py-3 rounded-xl font-medium border"
                style={{ color: "#D1D5DB", borderColor: "rgba(58,63,122,0.6)" }}>
                Try Demo First
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan, idx) => {
              const rc        = riskColors[scan.riskLevel];
              const isLoading = loadingId === scan.id;

              return (
                <div key={scan.id} className="flex gap-4">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                      style={{ backgroundColor: rc.bg, borderColor: rc.border }}>
                      <Clock size={16} style={{ color: rc.text }} />
                    </div>
                    {idx < scans.length - 1 && (
                      <div className="w-0.5 flex-1 mt-2"
                        style={{ backgroundColor: "rgba(58,63,122,0.3)", minHeight: 20 }} />
                    )}
                  </div>

                  {/* Scan card — clickable */}
                  <button
                    className="flex-1 p-5 rounded-2xl border mb-4 text-left w-full transition-all"
                    style={{
                      backgroundColor: isLoading ? "rgba(26,34,64,0.6)" : "#1a2240",
                      borderColor:     "rgba(58,63,122,0.4)",
                      cursor:          isLoading ? "wait" : "pointer",
                    }}
                    onClick={() => handleScanClick(scan)}
                    disabled={isLoading}
                  >
                    <div className="flex items-start gap-4">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: "rgba(58,63,122,0.3)" }}>
                        <img
                          src={scan.imageUrlRemote || scan.imageUrl}
                          alt="Scan"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs px-2.5 py-0.5 rounded-full border font-medium"
                            style={{ backgroundColor: rc.bg, color: rc.text, borderColor: rc.border }}>
                            {scan.riskLevel} Risk
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full border"
                            style={{ backgroundColor: "rgba(58,63,122,0.2)",
                              color: "#9CA3AF", borderColor: "rgba(58,63,122,0.3)" }}>
                            {scan.confidence > 0 ? `${scan.confidence}% confidence` : "Tap to load"}
                          </span>
                          {scan.label && scan.label !== "unknown" && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full border font-medium"
                              style={{
                                backgroundColor: scan.label === "malignant"
                                  ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
                                color:           scan.label === "malignant" ? "#f87171" : "#4ade80",
                                borderColor:     scan.label === "malignant"
                                  ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)",
                              }}>
                              {scan.label.toUpperCase()}
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-medium text-white">
                          {scan.scanType === "camera" ? "Camera Capture" : "Image Upload"}
                        </p>
                        <p className="text-xs flex items-center gap-1 mt-1"
                          style={{ color: "#9CA3AF" }}>
                          <Clock size={11} />
                          {formatDistanceToNow(new Date(scan.date), { addSuffix: true })} ·{" "}
                          {new Date(scan.date).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </p>

                        {/* ABCD scores if available */}
                        {scan.abcd.asymmetry > 0 && (
                          <div className="flex gap-3 mt-3">
                            {[
                              { label: "A", value: scan.abcd.asymmetry },
                              { label: "B", value: scan.abcd.border    },
                              { label: "C", value: scan.abcd.color     },
                              { label: "D", value: scan.abcd.diameter  },
                            ].map((f) => (
                              <div key={f.label} className="text-center">
                                <div className="text-xs mb-0.5 font-medium"
                                  style={{ color: "#9CA3AF" }}>{f.label}</div>
                                <div className="text-xs font-bold"
                                  style={{ color: "#D1D5DB" }}>{f.value}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Arrow / loading indicator */}
                      <div className="flex-shrink-0 flex items-center">
                        {isLoading ? (
                          <div className="w-5 h-5 rounded-full border-2 animate-spin"
                            style={{ borderColor: "#9B3C7A",
                              borderTopColor: "transparent" }} />
                        ) : (
                          <ChevronRight size={18} style={{ color: "#9CA3AF" }} />
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}