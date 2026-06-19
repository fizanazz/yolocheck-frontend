import { useState, useEffect, useRef, useCallback } from "react";
import { Screen } from "../App";
import { Play, AlertTriangle } from "lucide-react";
import demoImage from "../../imports/image.png";

interface Props {
  navigate: (s: Screen) => void;
}

const DEMO_IMG = demoImage;

// Bounding box as fraction of the actual image's natural pixel dimensions
// (0–1 range relative to the image itself, not the container)
const BB = { top: 0.28, left: 0.32, width: 0.36, height: 0.40 };

interface BoxStyle {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function DemoScreen({ navigate }: Props) {
  const [stage, setStage] = useState<"idle" | "processing" | "result">("idle");
  const [progress, setProgress] = useState(0);
  const [showBox, setShowBox] = useState(false);
  const [boxStyle, setBoxStyle] = useState<BoxStyle | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const computeBox = useCallback(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Offset of the rendered image relative to the container
    const offsetTop = imgRect.top - containerRect.top;
    const offsetLeft = imgRect.left - containerRect.left;

    // Convert BB fractions (relative to image) into px, then to % of container
    const top = offsetTop + BB.top * imgRect.height;
    const left = offsetLeft + BB.left * imgRect.width;
    const width = BB.width * imgRect.width;
    const height = BB.height * imgRect.height;

    const cW = containerRect.width;
    const cH = containerRect.height;

    setBoxStyle({
      top: (top / cH) * 100,
      left: (left / cW) * 100,
      width: (width / cW) * 100,
      height: (height / cH) * 100,
    });
  }, []);

  // Recompute on resize
  useEffect(() => {
    window.addEventListener("resize", computeBox);
    return () => window.removeEventListener("resize", computeBox);
  }, [computeBox]);

  const runDemo = () => {
    setStage("processing");
    setProgress(0);
    setShowBox(false);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setStage("result");
          setTimeout(() => { computeBox(); setShowBox(true); }, 300);
          return 100;
        }
        return p + 2.5;
      });
    }, 60);
  };

  useEffect(() => {
    if (stage === "idle") {
      setProgress(0);
      setShowBox(false);
    }
  }, [stage]);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10" style={{ backgroundColor: "#0F1629" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border mb-5"
            style={{
              backgroundColor: "rgba(155,60,122,0.12)",
              borderColor: "rgba(155,60,122,0.3)",
              color: "#d88bc4",
            }}
          >
            Demo Mode
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontWeight: 700 }}>
            Try the YOLOv11 Demo
          </h1>
          <p style={{ color: "#9CA3AF" }} className="max-w-xl mx-auto">
            See how YOLOCHECK's AI engine detects and analyzes moles in real time using a
            preloaded sample skin image.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Image Panel */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}
          >
            {/* Demo label banner */}
            <div
              className="px-4 py-2.5 text-xs font-medium flex items-center gap-2 border-b"
              style={{
                backgroundColor: "rgba(234,179,8,0.1)",
                borderColor: "rgba(234,179,8,0.25)",
                color: "#facc15",
              }}
            >
              <AlertTriangle size={13} />
              Demo Image – For Demonstration Purposes Only
            </div>

            <div className="relative" ref={containerRef}>
              <img
                ref={imgRef}
                src={DEMO_IMG}
                alt="Demo skin scan"
                className="w-full object-contain block"
                style={{ maxHeight: 380 }}
                onLoad={computeBox}
              />

              {/* Bounding box — shown after processing, pixel-accurate over the image */}
              {showBox && boxStyle && (
                <div
                  className="absolute transition-all duration-500"
                  style={{
                    top: `${boxStyle.top}%`,
                    left: `${boxStyle.left}%`,
                    width: `${boxStyle.width}%`,
                    height: `${boxStyle.height}%`,
                    border: "2px solid #9B3C7A",
                    boxShadow: "0 0 14px rgba(155,60,122,0.55), inset 0 0 6px rgba(155,60,122,0.15)",
                    borderRadius: 4,
                    animation: "fadeIn 0.4s ease",
                  }}
                >
                  <div
                    className="absolute -top-7 left-0 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                    style={{ backgroundColor: "#9B3C7A", color: "#FFFFFF" }}
                  >
                    Mole Detected · 89%
                  </div>
                  {/* Corner accents */}
                  {[
                    "top-0 left-0 border-t-2 border-l-2",
                    "top-0 right-0 border-t-2 border-r-2",
                    "bottom-0 left-0 border-b-2 border-l-2",
                    "bottom-0 right-0 border-b-2 border-r-2",
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-3 h-3 ${cls}`} style={{ borderColor: "#fff" }} />
                  ))}
                </div>
              )}

              {/* Processing overlay */}
              {stage === "processing" && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ backgroundColor: "rgba(15,22,41,0.75)", backdropFilter: "blur(2px)" }}
                >
                  <div
                    className="w-14 h-14 rounded-full border-2 flex items-center justify-center mb-3 animate-pulse"
                    style={{ borderColor: "#9B3C7A", backgroundColor: "rgba(155,60,122,0.15)" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#9B3C7A" strokeWidth="2" strokeDasharray="4 2" className="animate-spin" />
                      <circle cx="12" cy="12" r="4" fill="#9B3C7A" />
                    </svg>
                  </div>
                  <p className="text-white text-sm font-medium mb-3">YOLOv11 analyzing…</p>
                  <div
                    className="w-40 h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: "rgba(58,63,122,0.4)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${progress}%`, backgroundColor: "#9B3C7A" }}
                    />
                  </div>
                  <p className="text-xs mt-2" style={{ color: "#9CA3AF" }}>{Math.round(progress)}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Controls & Results */}
          <div className="space-y-5">
            {stage === "idle" && (
              <div
                className="p-7 rounded-2xl border text-center"
                style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: "rgba(155,60,122,0.15)" }}
                >
                  <Play size={28} style={{ color: "#9B3C7A" }} />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2" style={{ fontWeight: 600 }}>
                  Ready to Run Demo
                </h2>
                <p className="text-sm mb-6" style={{ color: "#9CA3AF" }}>
                  Click below to automatically run YOLOv11 on the preloaded sample image and
                  visualize the mole detection with a real-time bounding box.
                </p>
                <button
                  onClick={runDemo}
                  className="w-full py-3.5 rounded-xl font-semibold text-white"
                  style={{ backgroundColor: "#9B3C7A" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#7d3063"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#9B3C7A"}
                >
                  Run YOLOv11 Demo
                </button>
              </div>
            )}

            {stage === "processing" && (
              <div
                className="p-6 rounded-2xl border"
                style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}
              >
                <h3 className="text-white font-medium mb-4">Processing Steps</h3>
                {["Image pre-processing", "YOLOv11 forward pass", "NMS filtering", "ABCD extraction", "Risk scoring"].map((step, i) => {
                  const done = progress > i * 20 + 10;
                  const active = progress > i * 20 && progress <= i * 20 + 20;
                  return (
                    <div key={step} className="flex items-center gap-3 mb-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: done ? "rgba(74,222,128,0.15)" : active ? "rgba(155,60,122,0.15)" : "rgba(58,63,122,0.2)",
                          border: `1px solid ${done ? "#4ade80" : active ? "#9B3C7A" : "rgba(58,63,122,0.4)"}`,
                        }}
                      >
                        {done && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5 3.5-4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        {active && !done && <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#9B3C7A" }} />}
                      </div>
                      <span className="text-xs" style={{ color: done ? "#4ade80" : active ? "#FFFFFF" : "#9CA3AF" }}>{step}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {stage === "result" && (
              <>
                <div
                  className="p-6 rounded-2xl border"
                  style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}
                >
                  <h3 className="text-white font-semibold mb-4">Detection Results</h3>
                  <div className="space-y-3">
                    {[
                      ["Classification", "Pigmented Lesion / Mole"],
                      ["AI Confidence", "89%"],
                      ["Risk Level", "Moderate"],
                      ["Model", "YOLOv11 v11.0"],
                      ["Processing Time", "3.4 seconds"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-sm" style={{ color: "#9CA3AF" }}>{k}</span>
                        <span className="text-sm font-medium text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={runDemo}
                    className="py-3 rounded-xl font-medium border"
                    style={{ color: "#D1D5DB", borderColor: "rgba(58,63,122,0.6)" }}
                  >
                    Run Again
                  </button>
                  <button
                    onClick={() => navigate("auth")}
                    className="py-3 rounded-xl font-semibold text-white"
                    style={{ backgroundColor: "#9B3C7A" }}
                  >
                    Create Account for Full Access
                  </button>
                </div>
              </>
            )}

            {/* Disclaimer */}
            <div
              className="p-4 rounded-xl border text-xs"
              style={{
                backgroundColor: "rgba(31,42,86,0.3)",
                borderColor: "rgba(58,63,122,0.3)",
                color: "#9CA3AF",
              }}
            >
              <strong className="text-white">Note:</strong> This demo uses a preloaded sample image
              for demonstration only. Results are illustrative. YOLOCHECK does not provide medical
              diagnoses.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
