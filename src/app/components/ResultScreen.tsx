import { useRef } from "react";
import { ScanItem, Screen } from "../App";
import { ArrowRight, AlertTriangle } from "lucide-react";

interface Props {
  scan:     ScanItem;
  navigate: (s: Screen) => void;
}

const riskConfig = {
  Low:      { color: "#4ade80", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)",  label: "Low Risk"      },
  Moderate: { color: "#facc15", bg: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.3)",  label: "Moderate Risk" },
  High:     { color: "#f87171", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  label: "High Risk"     },
};

export function ResultScreen({ scan, navigate }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const rc = riskConfig[scan.riskLevel];

  const getBBPercent = () => {
    if (!scan.boundingBox) return null;
    const img = imgRef.current;
    if (!img) return null;
    const { x1, y1, x2, y2 } = scan.boundingBox;
    const imgW = img.naturalWidth  || img.clientWidth;
    const imgH = img.naturalHeight || img.clientHeight;
    return {
      top:    (y1 / imgH) * 100,
      left:   (x1 / imgW) * 100,
      width:  ((x2 - x1) / imgW) * 100,
      height: ((y2 - y1) / imgH) * 100,
    };
  };

  const bb          = getBBPercent();
  const isMalignant = scan.label === "malignant";
  const boxColor    = isMalignant ? "#f87171" : "#4ade80";
  const labelText   = isMalignant ? "MALIGNANT" : "BENIGN";
  const labelBg     = isMalignant ? "rgba(239,68,68,0.12)"  : "rgba(34,197,94,0.12)";
  const labelBorder = isMalignant ? "rgba(239,68,68,0.3)"   : "rgba(34,197,94,0.3)";

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10"
      style={{ backgroundColor: "#0F1629" }}>
      <div className="max-w-4xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Detection Result</h1>
          <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
            YOLOv11 analysis complete · {scan.totalMolesDetected ?? 0} mole(s) detected
          </p>
        </div>

        {scan.scanType === "camera" && (
          <div className="mb-6 p-4 rounded-xl border flex items-start gap-3 text-sm"
            style={{
              backgroundColor: "rgba(234,179,8,0.08)",
              borderColor:     "rgba(234,179,8,0.25)",
              color:           "#facc15",
            }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Camera scan notice:</strong> Results may be less accurate than
              uploaded dermoscopy images. For best accuracy use the Upload option with
              a close-up dermoscopy or macro photo in good lighting.
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">

          <div className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}>
            <div className="relative">
              <img
                ref={imgRef}
                src={scan.imageUrl}
                alt="Scan result"
                className="w-full object-cover"
                style={{ maxHeight: 360 }}
                onLoad={() => {}}
              />
              {scan.boundingBox && bb && (
                <div className="absolute" style={{
                  top:       `${bb.top}%`,
                  left:      `${bb.left}%`,
                  width:     `${bb.width}%`,
                  height:    `${bb.height}%`,
                  border:    `2px solid ${boxColor}`,
                  boxShadow: `0 0 14px ${boxColor}88`,
                  borderRadius: 4,
                }}>
                  <div className="absolute -top-7 left-0 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap"
                    style={{ backgroundColor: boxColor, color: "#000" }}>
                    {labelText} · {scan.confidence}%
                  </div>
                  {["top-0 left-0 border-t-2 border-l-2",
                    "top-0 right-0 border-t-2 border-r-2",
                    "bottom-0 left-0 border-b-2 border-l-2",
                    "bottom-0 right-0 border-b-2 border-r-2",
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-3 h-3 ${cls}`}
                      style={{ borderColor: "#fff" }} />
                  ))}
                </div>
              )}
            </div>
            <div className="px-4 py-3 text-xs flex items-center gap-2"
              style={{ color: "#9CA3AF", borderTop: "1px solid rgba(58,63,122,0.3)" }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: boxColor }} />
              YOLOv11 detection · Real bounding box coordinates
            </div>
          </div>

          <div className="space-y-4">

            <div className="p-5 rounded-2xl border"
              style={{ backgroundColor: labelBg, borderColor: labelBorder }}>
              <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>
                YOLO Classification
              </p>
              <p className="text-3xl font-bold" style={{ color: boxColor }}>
                {labelText}
              </p>
              <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
                {isMalignant
                  ? "Model classified this mole as malignant. Please consult a dermatologist."
                  : "Model classified this mole as benign. Continue routine monitoring."}
              </p>
            </div>

            <div className="p-5 rounded-2xl border"
              style={{ backgroundColor: rc.bg, borderColor: rc.border }}>
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle size={20} style={{ color: rc.color }} />
                <span className="font-semibold text-lg" style={{ color: rc.color }}>
                  {rc.label}
                </span>
              </div>
              <p className="text-sm" style={{ color: "#D1D5DB" }}>
                {scan.riskLevel === "High"
                  ? "This scan indicates characteristics that warrant prompt dermatological consultation."
                  : scan.riskLevel === "Moderate"
                  ? "Some features of concern detected. Monitoring and professional evaluation recommended."
                  : "Characteristics appear within typical range. Continue routine monitoring."}
              </p>
            </div>

            <div className="p-5 rounded-2xl border"
              style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}>
              <p className="text-xs mb-2" style={{ color: "#9CA3AF" }}>
                AI Confidence Score
              </p>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-white">{scan.confidence}</span>
                <span className="text-xl text-white mb-1">%</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "rgba(58,63,122,0.4)" }}>
                <div className="h-full rounded-full"
                  style={{ width: `${scan.confidence}%`,
                    background: "linear-gradient(90deg, #1F2A56, #9B3C7A)" }} />
              </div>
            </div>

            <div className="p-5 rounded-2xl border"
              style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}>
              <p className="text-sm font-medium text-white mb-3">ABCD Scores</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "A — Asymmetry", value: scan.abcd.asymmetry, note: scan.abcd.asymmetry_note },
                  { label: "B — Border",    value: scan.abcd.border,    note: scan.abcd.border_note    },
                  { label: "C — Color",     value: scan.abcd.color,     note: scan.abcd.color_note     },
                  { label: "D — Diameter",  value: scan.abcd.diameter,  note: scan.abcd.diameter_note  },
                ].map(({ label, value, note }) => (
                  <div key={label} className="p-3 rounded-xl"
                    style={{ backgroundColor: "rgba(58,63,122,0.2)" }}>
                    <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>{label}</p>
                    <p className="text-lg font-bold text-white">{value}</p>
                    {note && (
                      <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>{note}</p>
                    )}
                  </div>
                ))}
              </div>
              {scan.abcd.total_score !== undefined && (
                <div className="mt-3 pt-3"
                  style={{ borderTop: "1px solid rgba(58,63,122,0.3)" }}>
                  <p className="text-sm text-white">
                    Total Score: <span className="font-bold">{scan.abcd.total_score}</span>
                    <span className="text-xs ml-2" style={{ color: "#9CA3AF" }}>
                      (0–12 scale)
                    </span>
                  </p>
                </div>
              )}
            </div>

            <button onClick={() => navigate("feature-analysis")}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-white"
              style={{ backgroundColor: "#9B3C7A" }}>
              View Full ABCD Analysis <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl border text-xs"
          style={{ backgroundColor: "rgba(31,42,86,0.3)",
            borderColor: "rgba(58,63,122,0.3)", color: "#9CA3AF" }}>
          <strong className="text-white">Clinical Disclaimer:</strong> This result is generated
          by an AI system for informational purposes only. It does not constitute a medical
          diagnosis. Please consult a qualified dermatologist for professional evaluation.
        </div>

      </div>
    </div>
  );
}