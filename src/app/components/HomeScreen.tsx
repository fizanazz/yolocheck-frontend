import { Screen } from "../App";
import { ArrowRight, Shield, Eye, Award, ChevronDown } from "lucide-react";

interface Props {
  navigate: (s: Screen) => void;
  setAuthMode: (m: "signin" | "signup") => void;
}

const HERO_IMG = "https://images.unsplash.com/photo-1541752857837-f8a0154fd092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luJTIwZXhhbWluYXRpb24lMjBkZXJtYXRvbG9neSUyMGRvY3RvciUyMG1lZGljYWx8ZW58MXx8fHwxNzgwNjc1MzU3fDA&ixlib=rb-4.1.0&q=80&w=1080";

export function HomeScreen({ navigate, setAuthMode }: Props) {
  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_IMG})`,
          backgroundSize: "cover",
          backgroundPosition: "center right",
        }}
      >
        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(31,42,86,0.94) 0%, rgba(31,42,86,0.82) 40%, rgba(31,42,86,0.55) 65%, rgba(31,42,86,0.20) 100%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:px-12 w-full">
          <div className="max-w-xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 border"
              style={{
                backgroundColor: "rgba(155, 60, 122, 0.15)",
                borderColor: "rgba(155, 60, 122, 0.35)",
                color: "#d88bc4",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "#9B3C7A" }}
              />
              Powered by YOLOv11 AI
            </div>

            <h1
              className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
              style={{ fontWeight: 700, lineHeight: "1.15" }}
            >
              Mole Check
            </h1>
            <p
              className="text-lg mb-3 leading-relaxed"
              style={{ color: "#D1D5DB" }}
            >
              AI-powered mole screening using YOLOv11 to support early skin risk
              awareness.
            </p>
            <p className="text-sm mb-10" style={{ color: "#9CA3AF" }}>
              Clinical decision-support tool. Not a diagnostic service.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => { setAuthMode("signup"); navigate("auth"); }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white transition-all hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: "#9B3C7A" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#7d3063"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#9B3C7A"}
              >
                Scan Now
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("how-it-works")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium border transition-all"
                style={{
                  color: "#D1D5DB",
                  borderColor: "rgba(209, 213, 219, 0.3)",
                  backgroundColor: "rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(209, 213, 219, 0.6)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(209, 213, 219, 0.3)"}
              >
                How It Works
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-14">
              {[
                { value: "94.2%", label: "Detection Accuracy" },
                { value: "YOLOv11", label: "AI Model" },
                { value: "< 5s", label: "Analysis Time" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <ChevronDown size={28} />
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-20 px-6"
        style={{ backgroundColor: "#111827" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl font-bold text-white mb-3"
              style={{ fontWeight: 700 }}
            >
              Clinically Responsible AI
            </h2>
            <p style={{ color: "#9CA3AF" }} className="max-w-xl mx-auto">
              YOLOCHECK combines state-of-the-art computer vision with responsible
              AI practices for informed skin health awareness.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Eye size={24} />,
                title: "YOLOv11 Detection",
                desc: "Real-time object detection model fine-tuned on dermatological datasets to identify mole characteristics with high precision.",
              },
              {
                icon: <Shield size={24} />,
                title: "Privacy First",
                desc: "Your images are processed securely and never stored without consent. Full data control at every step.",
              },
              {
                icon: <Award size={24} />,
                title: "ABCD Analysis",
                desc: "Automated Asymmetry, Border, Color, and Diameter scoring aligned with clinical dermoscopy standards.",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="p-6 rounded-2xl border transition-all hover:border-opacity-60"
                style={{
                  backgroundColor: "#1F2A56",
                  borderColor: "rgba(58, 63, 122, 0.5)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(155, 60, 122, 0.5)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(58, 63, 122, 0.5)";
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(155, 60, 122, 0.2)", color: "#9B3C7A" }}
                >
                  {feat.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#9CA3AF" }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 px-6 text-center"
        style={{ backgroundColor: "#1F2A56" }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontWeight: 700 }}>
            Start Your Skin Health Journey
          </h2>
          <p className="mb-8 text-base" style={{ color: "#D1D5DB" }}>
            Create a free account to access AI-powered mole screening, detailed
            ABCD analysis, and personalized reports.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => { setAuthMode("signup"); navigate("auth"); }}
              className="px-8 py-3.5 rounded-xl font-semibold text-white transition-all"
              style={{ backgroundColor: "#9B3C7A" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#7d3063"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#9B3C7A"}
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate("demo")}
              className="px-8 py-3.5 rounded-xl font-medium border transition-all"
              style={{ color: "#D1D5DB", borderColor: "rgba(209, 213, 219, 0.3)" }}
            >
              Try Demo First
            </button>
          </div>
          <p className="mt-6 text-xs" style={{ color: "#9CA3AF" }}>
            For educational and awareness purposes only. Always consult a qualified
            dermatologist for medical advice.
          </p>
        </div>
      </section>
    </div>
  );
}
