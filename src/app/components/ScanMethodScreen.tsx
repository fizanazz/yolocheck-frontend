import { Screen } from "../App";
import { Upload, Info } from "lucide-react";

interface Props {
  navigate: (s: Screen) => void;
}

export function ScanMethodScreen({ navigate }: Props) {
  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#0F1629" }}
    >
      <div className="max-w-lg w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Upload Scan Image
          </h1>
          <p style={{ color: "#9CA3AF" }}>
            Upload a close-up dermoscopy or macro photo of the mole for AI analysis.
          </p>
        </div>

        {/* Single upload option */}
        <button
          onClick={() => navigate("upload")}
          className="w-full p-8 rounded-2xl border text-left transition-all mb-6"
          style={{ backgroundColor: "#1F2A56", borderColor: "rgba(58,63,122,0.5)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor     = "#9B3C7A";
            e.currentTarget.style.backgroundColor = "#243060";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor     = "rgba(58,63,122,0.5)";
            e.currentTarget.style.backgroundColor = "#1F2A56";
          }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ backgroundColor: "rgba(155,60,122,0.15)", color: "#9B3C7A" }}>
            <Upload size={36} />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Upload Image</h2>
          <p className="text-sm leading-relaxed mb-3" style={{ color: "#9CA3AF" }}>
            Upload an existing dermoscopy or close-up photo from your device.
            Supports JPEG, PNG, WEBP formats up to 10 MB.
          </p>
          <span className="text-xs px-3 py-1 rounded-full"
            style={{ backgroundColor: "rgba(155,60,122,0.12)", color: "#d88bc4" }}>
            JPEG, PNG, WEBP supported
          </span>
        </button>

        {/* Guidelines */}
        <div className="rounded-2xl border p-5"
          style={{ backgroundColor: "rgba(31,42,86,0.4)",
            borderColor: "rgba(58,63,122,0.4)" }}>
          <div className="flex items-start gap-3">
            <Info size={16} style={{ color: "#9B3C7A", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-sm font-medium text-white mb-2">
                Image Capture Guidelines
              </p>
              <ul className="text-sm space-y-1" style={{ color: "#9CA3AF" }}>
                <li>• Use a dermoscopy image or close-up macro photo for best results.</li>
                <li>• Ensure good consistent lighting — natural daylight is ideal.</li>
                <li>• Position the mole centered and within 10–15 cm of the lens.</li>
                <li>• Keep the image in focus and minimize motion blur.</li>
                <li>• Avoid covering the mole with clothing or accessories.</li>
                <li>• Higher resolution images produce more accurate results.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}