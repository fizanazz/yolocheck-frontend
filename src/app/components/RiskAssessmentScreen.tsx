import { ScanItem, Screen } from "../App";
import { ArrowRight, AlertTriangle, CheckCircle, Phone } from "lucide-react";

interface Props {
  scan: ScanItem;
  navigate: (s: Screen) => void;
}

const riskDetails = {
  Low: {
    color: "#4ade80",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    title: "Low Risk Assessment",
    summary: "The analyzed lesion exhibits characteristics within expected normal ranges. Routine self-monitoring is recommended.",
    steps: [
      "Continue monthly self-examination of the mole.",
      "Use the ABCD rule during self-checks.",
      "Schedule an annual dermatology check-up.",
      "Apply broad-spectrum SPF 50+ sunscreen daily.",
    ],
  },
  Moderate: {
    color: "#facc15",
    bg: "rgba(234,179,8,0.1)",
    border: "rgba(234,179,8,0.3)",
    title: "Moderate Risk Assessment",
    summary: "Some features of potential concern have been identified. Professional evaluation within the next few weeks is strongly advised.",
    steps: [
      "Schedule a dermatology appointment within 2–4 weeks.",
      "Do not attempt to remove or alter the mole.",
      "Photograph the area regularly to track changes.",
      "Minimize prolonged UV exposure and use protective clothing.",
    ],
  },
  High: {
    color: "#f87171",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.35)",
    title: "High Risk Assessment",
    summary: "Multiple significant features associated with potential melanoma have been detected. Prompt dermatological consultation is strongly recommended.",
    steps: [
      "Seek a dermatology appointment as soon as possible (within 1 week).",
      "Request a professional dermoscopy examination.",
      "Do not ignore or delay — early detection is critical.",
      "Bring your YOLOCHECK report to your appointment.",
    ],
  },
};

export function RiskAssessmentScreen({ scan, navigate }: Props) {
  const rd = riskDetails[scan.riskLevel];

  return (
    <div
      className="min-h-[calc(100vh-4rem)] px-4 py-10"
      style={{ backgroundColor: "#0F1629" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white" style={{ fontWeight: 700 }}>
            Risk Assessment
          </h1>
          <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
            Clinical risk stratification based on YOLOv11 detection and ABCD analysis.
          </p>
        </div>

        {/* Risk Badge Card */}
        <div
          className="p-7 rounded-2xl border mb-6 text-center"
          style={{ backgroundColor: rd.bg, borderColor: rd.border }}
        >
          {scan.riskLevel === "Low" ? (
            <CheckCircle size={40} className="mx-auto mb-3" style={{ color: rd.color }} />
          ) : (
            <AlertTriangle size={40} className="mx-auto mb-3" style={{ color: rd.color }} />
          )}
          <div
            className="text-4xl font-bold mb-2"
            style={{ color: rd.color, fontWeight: 700 }}
          >
            {scan.riskLevel} Risk
          </div>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "#D1D5DB" }}>
            {rd.summary}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
            <span style={{ color: "#9CA3AF" }}>AI Confidence:</span>
            <span className="font-semibold text-white">{scan.confidence}%</span>
          </div>
        </div>

        {/* Recommended Actions */}
        <div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}
        >
          <h2 className="font-semibold text-white mb-4" style={{ fontWeight: 600 }}>
            Recommended Next Steps
          </h2>
          <div className="space-y-3">
            {rd.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                  style={{ backgroundColor: "rgba(155,60,122,0.2)", color: "#9B3C7A" }}
                >
                  {i + 1}
                </div>
                <p className="text-sm" style={{ color: "#D1D5DB" }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency contact for High Risk */}
        {scan.riskLevel === "High" && (
          <div
            className="p-5 rounded-2xl border mb-6 flex items-center gap-4"
            style={{
              backgroundColor: "rgba(239,68,68,0.08)",
              borderColor: "rgba(239,68,68,0.3)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(239,68,68,0.15)" }}
            >
              <Phone size={22} style={{ color: "#f87171" }} />
            </div>
            <div>
              <p className="font-medium text-white">Consult a Dermatologist Today</p>
              <p className="text-sm" style={{ color: "#9CA3AF" }}>
                High-risk features detected. Do not delay professional evaluation.
              </p>
            </div>
          </div>
        )}

        {/* Clinical Disclaimer */}
        <div
          className="p-4 rounded-xl border text-xs mb-6"
          style={{
            backgroundColor: "rgba(31,42,86,0.3)",
            borderColor: "rgba(58,63,122,0.3)",
            color: "#9CA3AF",
          }}
        >
          <strong className="text-white">Clinical Disclaimer:</strong>{" "}
          This AI risk stratification is for informational purposes only and must not be interpreted as a
          medical diagnosis. YOLOv11 is a computer vision model and is not a substitute for professional
          dermatological examination.
        </div>

        <button
          onClick={() => navigate("report")}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-white"
          style={{ backgroundColor: "#9B3C7A" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#7d3063"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#9B3C7A"}
        >
          View Full AI Report
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
