import { ScanItem, Screen, User } from "../App";
import { Download, FileText, Home, Plus } from "lucide-react";

interface Props {
  scan:     ScanItem;
  user:     User | null;
  navigate: (s: Screen) => void;
}

export function ReportScreen({ scan, user, navigate }: Props) {
  const reportDate = new Date(scan.date).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const riskColor = {
    Low:      "#4ade80",
    Moderate: "#facc15",
    High:     "#f87171",
  }[scan.riskLevel];

  // ── Download as PDF ──────────────────────────────────────────────────────
  const handleDownload = () => {
    const reportId  = scan.id.slice(0, 8).toUpperCase();
    const label     = scan.label?.toUpperCase() ?? "UNKNOWN";
    const tds       = scan.abcd.total_score ?? "N/A";

    // Build HTML content for PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>YOLOCHECK Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #1a1a2e; padding: 40px; background: #fff; }
    .header { background: linear-gradient(135deg, #1F2A56, #3A3F7A); color: white; padding: 30px; border-radius: 12px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; margin-bottom: 4px; }
    .header p  { font-size: 12px; opacity: 0.7; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; float: right; margin-top: -30px; background: ${riskColor}22; color: ${riskColor}; border: 1px solid ${riskColor}55; }
    .section { margin-bottom: 24px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px; }
    .section h2 { font-size: 14px; font-weight: bold; color: #1F2A56; margin-bottom: 14px; border-bottom: 2px solid #9B3C7A; padding-bottom: 6px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .field p { font-size: 13px; font-weight: 600; color: #111; margin-top: 2px; }
    .abcd-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .abcd-card { text-align: center; padding: 14px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; }
    .abcd-card .score { font-size: 28px; font-weight: bold; color: #9B3C7A; }
    .abcd-card .name  { font-size: 11px; color: #6b7280; margin-top: 4px; }
    .classification { padding: 16px; border-radius: 8px; background: ${riskColor}15; border: 1px solid ${riskColor}40; margin-bottom: 12px; }
    .classification .label { font-size: 20px; font-weight: bold; color: ${riskColor}; }
    .classification .conf  { font-size: 13px; color: #374151; margin-top: 4px; }
    .disclaimer { background: #fef9f0; border: 1px solid #f59e0b44; border-radius: 8px; padding: 14px; font-size: 11px; color: #6b7280; margin-top: 20px; }
    .disclaimer strong { color: #111; }
    .footer { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 24px; }
    .tds-row { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f3f4f6; border-radius: 8px; margin-top: 12px; }
    .tds-row span { font-size: 13px; color: #374151; }
    .tds-row strong { font-size: 16px; color: #9B3C7A; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔬 YOLOCHECK Clinical Report</h1>
    <p>AI-Generated Dermoscopy Analysis · YOLOv11 v11.0</p>
    <div class="badge">${scan.riskLevel} Risk</div>
  </div>

  <div class="section">
    <h2>Patient & Scan Information</h2>
    <div class="grid-2">
      <div class="field"><label>Patient Name</label><p>${user?.name || "Anonymous"}</p></div>
      <div class="field"><label>Date</label><p>${reportDate}</p></div>
      <div class="field"><label>Scan Type</label><p>${scan.scanType === "camera" ? "Live Camera" : "Image Upload"}</p></div>
      <div class="field"><label>AI Model</label><p>YOLOv11 v11.0</p></div>
      <div class="field"><label>Report ID</label><p>${reportId}</p></div>
      <div class="field"><label>Status</label><p>Completed</p></div>
    </div>
  </div>

  <div class="section">
    <h2>Detection Result</h2>
    <div class="classification">
      <div class="label">${label}</div>
      <div class="conf">AI Confidence: ${scan.confidence}% · Risk Level: ${scan.riskLevel}</div>
    </div>
    <p style="font-size:13px;color:#374151;line-height:1.6;">
      YOLOv11 detected a pigmented skin lesion with <strong>${scan.confidence}%</strong> confidence.
      The lesion has been classified as <strong>${label}</strong> with
      <strong>${scan.riskLevel} Risk</strong> based on automated ABCD feature extraction.
    </p>
  </div>

  <div class="section">
    <h2>ABCD Feature Analysis</h2>
    <div class="abcd-grid">
      <div class="abcd-card">
        <div class="score">${scan.abcd.asymmetry}</div>
        <div class="name">A — Asymmetry</div>
      </div>
      <div class="abcd-card">
        <div class="score">${scan.abcd.border}</div>
        <div class="name">B — Border</div>
      </div>
      <div class="abcd-card">
        <div class="score">${scan.abcd.color}</div>
        <div class="name">C — Color</div>
      </div>
      <div class="abcd-card">
        <div class="score">${scan.abcd.diameter}</div>
        <div class="name">D — Diameter</div>
      </div>
    </div>
    <div class="tds-row">
      <span>Total Dermoscopy Score (TDS)</span>
      <strong>${tds} / 12</strong>
    </div>
    ${scan.abcd.asymmetry_note ? `
    <div style="margin-top:12px;font-size:12px;color:#6b7280;line-height:1.6;">
      <p>• <strong>Asymmetry:</strong> ${scan.abcd.asymmetry_note}</p>
      <p>• <strong>Border:</strong> ${scan.abcd.border_note}</p>
      <p>• <strong>Color:</strong> ${scan.abcd.color_note}</p>
      <p>• <strong>Diameter:</strong> ${scan.abcd.diameter_note}</p>
    </div>` : ""}
  </div>

  <div class="section">
    <h2>AI Recommendations</h2>
    <p style="font-size:13px;color:#374151;line-height:1.7;">
      ${scan.riskLevel === "High"
        ? "Based on the High Risk classification, YOLOCHECK strongly recommends seeking prompt consultation with a board-certified dermatologist. Multiple ABCD criteria are elevated, which may warrant histopathological examination. Early detection significantly improves clinical outcomes."
        : scan.riskLevel === "Moderate"
        ? "Moderate risk indicators have been identified. It is recommended that you arrange a dermatology review within 2–4 weeks. Continue monitoring the lesion for changes in size, shape, or coloration using the ABCD criteria."
        : "The current scan indicates low-risk characteristics. Routine monthly self-examination is recommended. Annual professional skin checks are advised, particularly if you have a history of sun exposure or a family history of melanoma."
      }
    </p>
  </div>

  <div class="disclaimer">
    <strong>Medical Disclaimer:</strong> This report is produced by an AI system (YOLOv11)
    for educational and informational purposes only. It is not a substitute for professional
    medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.
  </div>

  <div class="footer">
    YOLOCHECK AI Dermoscopy System · Report ID: ${reportId} · Generated: ${new Date().toLocaleString()}
  </div>
</body>
</html>`;

    // Open print dialog to save as PDF
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 500);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10"
      style={{ backgroundColor: "#0F1629" }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">AI Medical Report</h1>
            <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
              Structured clinical summary generated by YOLOv11
            </p>
          </div>
          <button onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all"
            style={{ color: "#D1D5DB", borderColor: "rgba(58,63,122,0.6)" }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#9B3C7A"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(58,63,122,0.6)"}>
            <Download size={16} />
            Download PDF
          </button>
        </div>

        {/* Report Card */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}>

          {/* Header */}
          <div className="px-8 py-6 border-b flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #1F2A56 0%, #2d3570 100%)",
              borderColor: "rgba(58,63,122,0.4)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(155,60,122,0.25)" }}>
                <FileText size={20} style={{ color: "#9B3C7A" }} />
              </div>
              <div>
                <p className="font-semibold text-white">YOLOCHECK Clinical Report</p>
                <p className="text-xs" style={{ color: "#9CA3AF" }}>
                  AI-Generated · Not a Medical Diagnosis
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: `${riskColor}20`, color: riskColor,
                border: `1px solid ${riskColor}40` }}>
              {scan.riskLevel} Risk
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Patient Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                ["Patient",    user?.name || "Anonymous"],
                ["Date",       reportDate],
                ["Scan Type",  scan.scanType === "camera" ? "Live Camera" : "Image Upload"],
                ["AI Model",   "YOLOv11 v11.0"],
                ["Report ID",  scan.id.slice(0, 12).toUpperCase()],
                ["Status",     "Completed"],
              ].map(([key, val]) => (
                <div key={key}>
                  <p className="text-xs mb-0.5" style={{ color: "#9CA3AF" }}>{key}</p>
                  <p className="text-sm font-medium text-white">{val}</p>
                </div>
              ))}
            </div>

            {/* Classification */}
            <div style={{ borderTop: "1px solid rgba(58,63,122,0.3)" }} className="pt-5">
              <h3 className="font-semibold text-white mb-3">Detection Result</h3>
              <div className="p-4 rounded-xl border mb-3"
                style={{ backgroundColor: `${riskColor}10`,
                  borderColor: `${riskColor}40` }}>
                <p className="text-2xl font-bold" style={{ color: riskColor }}>
                  {scan.label?.toUpperCase() ?? "UNKNOWN"}
                </p>
                <p className="text-sm mt-1" style={{ color: "#D1D5DB" }}>
                  {scan.confidence}% confidence · {scan.riskLevel} Risk
                </p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#D1D5DB" }}>
                YOLOv11 detected a pigmented skin lesion with{" "}
                <strong className="text-white">{scan.confidence}%</strong> confidence,
                classified as{" "}
                <strong style={{ color: riskColor }}>
                  {scan.label?.toUpperCase() ?? "UNKNOWN"}
                </strong>{" "}
                with <strong style={{ color: riskColor }}>{scan.riskLevel} Risk</strong>.
              </p>
            </div>

            {/* ABCD Scores */}
            <div style={{ borderTop: "1px solid rgba(58,63,122,0.3)" }} className="pt-5">
              <h3 className="font-semibold text-white mb-4">ABCD Feature Scores</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Asymmetry", value: scan.abcd.asymmetry,
                    note: scan.abcd.asymmetry_note },
                  { label: "Border",    value: scan.abcd.border,
                    note: scan.abcd.border_note    },
                  { label: "Color",     value: scan.abcd.color,
                    note: scan.abcd.color_note     },
                  { label: "Diameter",  value: scan.abcd.diameter,
                    note: scan.abcd.diameter_note  },
                ].map((f) => (
                  <div key={f.label} className="p-3 rounded-xl border text-center"
                    style={{ backgroundColor: "rgba(31,42,86,0.4)",
                      borderColor: "rgba(58,63,122,0.3)" }}>
                    <div className="text-2xl font-bold text-white">{f.value}</div>
                    <div className="text-xs mt-1" style={{ color: "#9CA3AF" }}>{f.label}</div>
                  </div>
                ))}
              </div>
              {scan.abcd.total_score !== undefined && (
                <div className="mt-3 p-3 rounded-xl flex justify-between items-center"
                  style={{ backgroundColor: "rgba(155,60,122,0.1)",
                    border: "1px solid rgba(155,60,122,0.25)" }}>
                  <span className="text-sm text-white">Total Dermoscopy Score</span>
                  <span className="text-lg font-bold" style={{ color: "#9B3C7A" }}>
                    {scan.abcd.total_score} / 12
                  </span>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div style={{ borderTop: "1px solid rgba(58,63,122,0.3)" }} className="pt-5">
              <h3 className="font-semibold text-white mb-3">AI Recommendations</h3>
              <div className="text-sm leading-relaxed" style={{ color: "#D1D5DB" }}>
                {scan.riskLevel === "High" && (
                  <p>Based on the High Risk classification, YOLOCHECK strongly recommends
                    seeking prompt consultation with a board-certified dermatologist.
                    Multiple ABCD criteria are elevated, which may warrant histopathological
                    examination. Early detection significantly improves clinical outcomes.</p>
                )}
                {scan.riskLevel === "Moderate" && (
                  <p>Moderate risk indicators have been identified. It is recommended that
                    you arrange a dermatology review within 2–4 weeks. Continue monitoring
                    the lesion for changes in size, shape, or coloration.</p>
                )}
                {scan.riskLevel === "Low" && (
                  <p>The current scan indicates low-risk characteristics. Routine monthly
                    self-examination is recommended. Annual professional skin checks are
                    advised.</p>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-xl border text-xs"
              style={{ backgroundColor: "rgba(155,60,122,0.08)",
                borderColor: "rgba(155,60,122,0.25)", color: "#9CA3AF" }}>
              <strong className="text-white">Medical Disclaimer:</strong> This report is
              produced by an AI system (YOLOv11) for educational and informational purposes
              only. It is not a substitute for professional medical advice, diagnosis, or
              treatment. Always consult a qualified healthcare professional.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button onClick={() => navigate("scan-method")}
            className="flex items-center justify-center gap-2 flex-1 py-3.5 rounded-xl font-medium border transition-all"
            style={{ color: "#D1D5DB", borderColor: "rgba(58,63,122,0.6)" }}>
            <Plus size={16} />
            New Scan
          </button>
          <button onClick={() => navigate("dashboard")}
            className="flex items-center justify-center gap-2 flex-1 py-3.5 rounded-xl font-semibold text-white"
            style={{ backgroundColor: "#9B3C7A" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#7d3063"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#9B3C7A"}>
            <Home size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}