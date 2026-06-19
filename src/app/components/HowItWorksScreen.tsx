import { Screen } from "../App";
import { Camera, Cpu, BarChart2, Shield, MessageSquare, ArrowRight } from "lucide-react";

interface Props {
  navigate: (s: Screen) => void;
}

const steps = [
  {
    number: "01",
    icon: <Camera size={24} />,
    title: "Image Capture or Upload",
    desc: "Submit a clear skin image via live camera capture or file upload. YOLOCHECK validates image quality and resolution before analysis begins.",
    details: ["Supported formats: JPEG, PNG, WEBP", "Live camera with alignment guidance", "Quality score validation", "Up to 10 MB file size"],
  },
  {
    number: "02",
    icon: <Cpu size={24} />,
    title: "YOLOv11 Detection",
    desc: "Our fine-tuned YOLOv11 model runs real-time object detection on the submitted image, identifying pigmented lesion regions with precision bounding boxes.",
    details: ["Real-time object detection", "Bounding box localization", "NMS post-processing", "Confidence score output"],
  },
  {
    number: "03",
    icon: <BarChart2 size={24} />,
    title: "ABCD Feature Extraction",
    desc: "Automated extraction of Asymmetry, Border irregularity, Color variation, and Diameter scores using dermoscopic analysis algorithms.",
    details: ["Asymmetry measurement", "Border edge analysis", "Color histogram scoring", "Diameter estimation"],
  },
  {
    number: "04",
    icon: <Shield size={24} />,
    title: "Risk Assessment",
    desc: "A composite risk score (Low / Moderate / High) is generated from the ABCD features and detection confidence, with clinical-grade next-step guidance.",
    details: ["Three-tier risk classification", "Confidence-weighted scoring", "Clinical recommendations", "Downloadable PDF report"],
  },
  {
    number: "05",
    icon: <MessageSquare size={24} />,
    title: "AI Chatbot Guidance",
    desc: "The YOLOCHECK Health Assistant provides context-aware explanations of your results, answers dermoscopy questions, and guides you on next steps.",
    details: ["Explains scan results in plain language", "ABCD rule education", "Dermatologist referral guidance", "24/7 availability"],
  },
];

export function HowItWorksScreen({ navigate }: Props) {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-16" style={{ backgroundColor: "#0F1629" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-3xl font-bold text-white mb-3" style={{ fontWeight: 700 }}>
            How YOLOCHECK Works
          </h1>
          <p className="max-w-2xl mx-auto" style={{ color: "#9CA3AF" }}>
            A five-stage AI pipeline combining YOLOv11 computer vision, clinical ABCD analysis,
            and intelligent chatbot guidance to deliver responsible skin health awareness.
          </p>
        </div>

        <div className="space-y-5">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="grid sm:grid-cols-[60px_1fr] gap-5 rounded-2xl border p-6 transition-all"
              style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(155,60,122,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(58,63,122,0.4)";
              }}
            >
              {/* Step indicator */}
              <div className="flex flex-col items-center sm:items-start">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-1"
                  style={{ backgroundColor: "rgba(155,60,122,0.15)", color: "#9B3C7A" }}
                >
                  {step.icon}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className="hidden sm:block w-0.5 flex-1 mt-2"
                    style={{ backgroundColor: "rgba(58,63,122,0.3)", minHeight: 20 }}
                  />
                )}
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: "rgba(155,60,122,0.15)", color: "#9B3C7A" }}
                  >
                    {step.number}
                  </span>
                  <h2 className="font-semibold text-white" style={{ fontWeight: 600 }}>
                    {step.title}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#D1D5DB" }}>
                  {step.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {step.details.map((d) => (
                    <span
                      key={d}
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: "rgba(31,42,86,0.6)",
                        color: "#9CA3AF",
                        border: "1px solid rgba(58,63,122,0.3)",
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("demo")}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-medium border"
              style={{ color: "#D1D5DB", borderColor: "rgba(58,63,122,0.6)" }}
            >
              Try Demo
            </button>
            <button
              onClick={() => navigate("auth")}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white"
              style={{ backgroundColor: "#9B3C7A" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#7d3063"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#9B3C7A"}
            >
              Get Started
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
