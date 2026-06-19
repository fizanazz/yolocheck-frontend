import { useRef, useEffect, useState, useCallback } from "react";
import { Screen } from "../App";
import { Camera, RotateCcw, ArrowLeft } from "lucide-react";

interface Props {
  navigate: (s: Screen) => void;
  onCapture: (imageUrl: string, scanType: "camera") => void;
}

export function CameraScreen({ navigate, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setActive(true);
        setError(null);
      }
    } catch {
      setError("Camera access denied. Please allow camera permissions or use the Upload option.");
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured(dataUrl);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setActive(false);
  };

  const retake = () => {
    setCaptured(null);
    startCamera();
  };

  const confirm = () => {
    if (captured) onCapture(captured, "camera");
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex flex-col"
      style={{ backgroundColor: "#000" }}
    >
      <div className="flex items-center gap-3 p-4" style={{ backgroundColor: "#0F1629" }}>
        <button onClick={() => navigate("scan-method")} style={{ color: "#9CA3AF" }}>
          <ArrowLeft size={20} />
        </button>
        <span className="text-white font-medium">Camera Capture</span>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        {error ? (
          <div className="text-center px-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.15)" }}
            >
              <Camera size={28} style={{ color: "#f87171" }} />
            </div>
            <p className="text-white font-medium mb-2">Camera Unavailable</p>
            <p className="text-sm mb-6" style={{ color: "#9CA3AF" }}>{error}</p>
            <button
              onClick={() => navigate("upload")}
              className="px-6 py-3 rounded-xl text-white font-medium"
              style={{ backgroundColor: "#9B3C7A" }}
            >
              Use Upload Instead
            </button>
          </div>
        ) : captured ? (
          <div className="w-full max-w-2xl p-6">
            <img src={captured} alt="Captured" className="w-full rounded-2xl object-cover" />
            <div className="flex gap-4 mt-6 justify-center">
              <button
                onClick={retake}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border font-medium"
                style={{ color: "#D1D5DB", borderColor: "rgba(58, 63, 122, 0.6)" }}
              >
                <RotateCcw size={16} /> Retake
              </button>
              <button
                onClick={confirm}
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold"
                style={{ backgroundColor: "#9B3C7A" }}
              >
                Use This Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-2xl">
            <video
              ref={videoRef}
              className="w-full"
              playsInline
              muted
              style={{ borderRadius: 0 }}
            />
            {/* Alignment frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-56 h-56 rounded-full border-2"
                style={{ borderColor: "rgba(155, 60, 122, 0.8)", boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)" }}
              />
            </div>
            <p
              className="absolute bottom-4 left-0 right-0 text-center text-sm"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Center the mole within the circle
            </p>
          </div>
        )}
      </div>

      {!error && !captured && active && (
        <div
          className="flex items-center justify-center gap-6 p-6"
          style={{ backgroundColor: "#0F1629" }}
        >
          <button
            onClick={() => setFacingMode((m) => (m === "user" ? "environment" : "user"))}
            className="w-12 h-12 rounded-full flex items-center justify-center border"
            style={{ color: "#D1D5DB", borderColor: "rgba(58, 63, 122, 0.6)" }}
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={capturePhoto}
            className="w-18 h-18 rounded-full border-4 flex items-center justify-center transition-all active:scale-95"
            style={{ borderColor: "#9B3C7A", backgroundColor: "#9B3C7A", width: 72, height: 72 }}
          >
            <Camera size={28} color="white" />
          </button>
          <div className="w-12" />
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
