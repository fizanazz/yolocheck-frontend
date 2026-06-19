import { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
  error?: string | null;    // ← NEW
}

const steps = [
  { label: "Pre-processing image data",        duration: 600 },
  { label: "Running YOLOv11 object detection", duration: 900 },
  { label: "Extracting ABCD features",         duration: 700 },
  { label: "Evaluating risk indicators",       duration: 600 },
  { label: "Generating clinical summary",      duration: 700 },
];

export function ProcessingScreen({ onComplete, error }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress]       = useState(0);

  useEffect(() => {
    if (error) return;   // stop animation if there's an error

    let stepIdx = 0;
    let elapsed = 0;
    const total = steps.reduce((a, s) => a + s.duration, 0);

    const runStep = () => {
      if (stepIdx >= steps.length) {
        setProgress(100);
        setTimeout(onComplete, 400);
        return;
      }
      setCurrentStep(stepIdx);
      const duration = steps[stepIdx].duration;
      const start    = Date.now();
      const startProgress = (elapsed / total) * 100;

      const tick = setInterval(() => {
        const delta = Date.now() - start;
        const p = startProgress + (delta / total) * 100;
        setProgress(Math.min(p, 100));
        if (delta >= duration) {
          clearInterval(tick);
          elapsed += duration;
          stepIdx++;
          runStep();
        }
      }, 30);
    };

    runStep();
  }, [onComplete, error]);

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4"
        style={{ backgroundColor: "#0F1629" }}>
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.4)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Analysis Failed</h2>
          <p className="text-sm mb-6 whitespace-pre-line" style={{ color: "#f87171" }}>
            {error}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ backgroundColor: "#9B3C7A" }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Normal processing state ───────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4"
      style={{ backgroundColor: "#0F1629" }}>
      <div className="max-w-sm w-full text-center">
        {/* Animated pulse ring */}
        <div className="relative w-28 h-28 mx-auto mb-10">
          <div className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: "#9B3C7A" }} />
          <div className="absolute inset-2 rounded-full animate-ping opacity-15"
            style={{ backgroundColor: "#9B3C7A", animationDelay: "0.3s" }} />
          <div className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(155,60,122,0.2)", border: "2px solid rgba(155,60,122,0.5)" }}>
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <circle cx="21" cy="21" r="18" stroke="#9B3C7A" strokeWidth="2"
                strokeDasharray="6 3" className="animate-spin" style={{ animationDuration: "3s" }} />
              <circle cx="21" cy="21" r="10" fill="rgba(155,60,122,0.3)" />
              <circle cx="21" cy="21" r="5"  fill="#9B3C7A" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          YOLOv11 is analyzing the image…
        </h2>
        <p className="text-sm mb-10" style={{ color: "#9CA3AF" }}>
          Advanced computer vision processing in progress. Please wait.
        </p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs mb-2" style={{ color: "#9CA3AF" }}>
            <span>{steps[Math.min(currentStep, steps.length - 1)]?.label}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(58,63,122,0.4)" }}>
            <div className="h-full rounded-full transition-all duration-200"
              style={{ width: `${progress}%`,
                background: "linear-gradient(90deg, #1F2A56, #9B3C7A)" }} />
          </div>
        </div>

        {/* Step list */}
        <div className="space-y-2 text-left">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: idx < currentStep ? "rgba(74,222,128,0.2)"
                    : idx === currentStep ? "rgba(155,60,122,0.2)" : "rgba(58,63,122,0.2)",
                  border: `1px solid ${idx < currentStep ? "#4ade80"
                    : idx === currentStep ? "#9B3C7A" : "rgba(58,63,122,0.5)"}`,
                }}>
                {idx < currentStep ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5 3.5-4" stroke="#4ade80" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : idx === currentStep ? (
                  <div className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: "#9B3C7A" }} />
                ) : null}
              </div>
              <span className="text-xs" style={{
                color: idx < currentStep ? "#4ade80"
                  : idx === currentStep ? "#FFFFFF" : "#9CA3AF",
              }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}