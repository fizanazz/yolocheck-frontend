import { Screen, User, ScanItem } from "../App";
import { Plus, Clock, TrendingUp, AlertTriangle, CheckCircle, Activity, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  user:     User;
  scans:    ScanItem[];
  navigate: (s: Screen) => void;
  onSelectScan?: (scan: ScanItem) => void;
}

const riskColors = {
  Low:      { bg: "rgba(34,197,94,0.12)",  text: "#4ade80", border: "rgba(34,197,94,0.25)"  },
  Moderate: { bg: "rgba(234,179,8,0.12)",  text: "#facc15", border: "rgba(234,179,8,0.25)"  },
  High:     { bg: "rgba(239,68,68,0.12)",  text: "#f87171", border: "rgba(239,68,68,0.25)"  },
};

export function DashboardScreen({ user, scans, navigate, onSelectScan }: Props) {
  const recent        = scans.slice(0, 3);
  const highRisk      = scans.filter((s) => s.riskLevel === "High").length;
  const avgConfidence = scans.length
    ? Math.round(scans.reduce((a, s) => a + s.confidence, 0) / scans.length)
    : 0;

  const handleScanClick = (scan: ScanItem) => {
    onSelectScan?.(scan);
    navigate("result");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10"
      style={{ backgroundColor: "#0F1629" }}>
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-sm mb-1" style={{ color: "#9CA3AF" }}>Welcome back</p>
            <h1 className="text-3xl font-bold text-white">{user.name}</h1>
          </div>
          <button onClick={() => navigate("scan-method")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all self-start sm:self-auto"
            style={{ backgroundColor: "#9B3C7A" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#7d3063"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#9B3C7A"}>
            <Plus size={18} />
            New Scan
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon:  <Activity size={20} />,
              label: "Total Scans",
              value: scans.length,
              sub:   scans.length === 1 ? "scan completed" : "scans completed",
              alert: false,
            },
            {
              icon:  <AlertTriangle size={20} />,
              label: "High Risk",
              value: highRisk,
              sub:   "require attention",
              alert: highRisk > 0,
            },
            {
              icon:  <TrendingUp size={20} />,
              label: "Avg Confidence",
              value: scans.length ? `${avgConfidence}%` : "—",
              sub:   "AI model accuracy",
              alert: false,
            },
            {
              icon:  <CheckCircle size={20} />,
              label: "Reports",
              value: scans.length,
              sub:   "generated",
              alert: false,
            },
          ].map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl border"
              style={{
                backgroundColor: "#1F2A56",
                borderColor: stat.alert
                  ? "rgba(239,68,68,0.3)" : "rgba(58,63,122,0.4)",
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{
                  backgroundColor: stat.alert
                    ? "rgba(239,68,68,0.15)" : "rgba(155,60,122,0.15)",
                  color: stat.alert ? "#f87171" : "#9B3C7A",
                }}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Recent Scans ── */}
          <div className="lg:col-span-2 rounded-2xl border p-6"
            style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">Recent Scans</h2>
              {scans.length > 0 && (
                <button onClick={() => navigate("history")}
                  className="text-xs transition-colors"
                  style={{ color: "#9B3C7A" }}>
                  View All →
                </button>
              )}
            </div>

            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(155,60,122,0.1)" }}>
                  <Activity size={28} style={{ color: "#9B3C7A" }} />
                </div>
                <p className="font-medium text-white mb-1">No scans yet</p>
                <p className="text-sm mb-5" style={{ color: "#9CA3AF" }}>
                  Start your first AI-powered mole scan to build your history.
                </p>
                <button onClick={() => navigate("scan-method")}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ backgroundColor: "#9B3C7A" }}>
                  Start First Scan
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map((scan) => {
                  const rc = riskColors[scan.riskLevel];
                  return (
                    <div key={scan.id}
                      className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all"
                      style={{ backgroundColor: "rgba(15,22,41,0.4)",
                        borderColor: "rgba(58,63,122,0.3)" }}
                      onClick={() => handleScanClick(scan)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(155,60,122,0.4)";
                        e.currentTarget.style.backgroundColor = "rgba(15,22,41,0.6)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(58,63,122,0.3)";
                        e.currentTarget.style.backgroundColor = "rgba(15,22,41,0.4)";
                      }}>
                      {/* Image */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
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
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
                            style={{ backgroundColor: rc.bg, color: rc.text,
                              borderColor: rc.border }}>
                            {scan.riskLevel} Risk
                          </span>
                          <span className="text-xs" style={{ color: "#9CA3AF" }}>
                            {scan.confidence > 0 ? `${scan.confidence}% confidence` : ""}
                          </span>
                          {scan.label && scan.label !== "unknown" && (
                            <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
                              style={{
                                backgroundColor: scan.label === "malignant"
                                  ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
                                color: scan.label === "malignant" ? "#f87171" : "#4ade80",
                                borderColor: scan.label === "malignant"
                                  ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)",
                              }}>
                              {scan.label.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white">
                          {scan.scanType === "camera" ? "Camera Capture" : "Image Upload"}
                        </p>
                        <p className="text-xs flex items-center gap-1 mt-0.5"
                          style={{ color: "#9CA3AF" }}>
                          <Clock size={11} />
                          {formatDistanceToNow(new Date(scan.date), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="text-xs" style={{ color: "#9CA3AF" }}>›</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Quick Actions ── */}
          <div className="space-y-4">
            <div className="rounded-2xl border p-6"
              style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}>
              <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { icon: <Plus size={16} />,     label: "New Scan",     screen: "scan-method" as Screen },
                  { icon: <Clock size={16} />,     label: "Scan History", screen: "history"     as Screen },
                  { icon: <FileText size={16} />,  label: "Try Demo",     screen: "demo"        as Screen },
                ].map((action) => (
                  <button key={action.label} onClick={() => navigate(action.screen)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all border"
                    style={{ color: "#D1D5DB", borderColor: "rgba(58,63,122,0.3)",
                      backgroundColor: "rgba(15,22,41,0.3)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(155,60,122,0.4)";
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(58,63,122,0.3)";
                      e.currentTarget.style.color = "#D1D5DB";
                    }}>
                    <span style={{ color: "#9B3C7A" }}>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-2xl border p-5"
              style={{ backgroundColor: "rgba(155,60,122,0.08)",
                borderColor: "rgba(155,60,122,0.25)" }}>
              <div className="flex items-start gap-3">
                <AlertTriangle size={16}
                  style={{ color: "#9B3C7A", flexShrink: 0, marginTop: 2 }} />
                <p className="text-xs leading-relaxed" style={{ color: "#D1D5DB" }}>
                  YOLOCHECK is a clinical decision-support tool only. It does not provide
                  medical diagnoses. Always consult a qualified dermatologist.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}