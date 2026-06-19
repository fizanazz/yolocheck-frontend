import { useRef, useState, useCallback } from "react";
import { Screen } from "../App";
import { Upload, ImageIcon, X, ArrowLeft, CheckCircle } from "lucide-react";

interface Props {
  navigate: (s: Screen) => void;
  onCapture: (imageUrl: string, scanType: "upload") => void;
}

export function UploadScreen({ navigate, onCapture }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<number | null>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Unsupported format. Please use JPEG, PNG, or WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreview(url);
      // Simulate quality score
      setQuality(Math.floor(Math.random() * 15) + 82);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleConfirm = () => {
    if (preview) onCapture(preview, "upload");
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] px-4 py-10"
      style={{ backgroundColor: "#0F1629" }}
    >
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("scan-method")} style={{ color: "#9CA3AF" }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontWeight: 700 }}>
              Upload Image
            </h1>
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              Upload a clear photo of the skin area for YOLOv11 analysis.
            </p>
          </div>
        </div>

        {!preview ? (
          <>
            <div
              className="rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all"
              style={{
                borderColor: dragOver ? "#9B3C7A" : "rgba(58, 63, 122, 0.6)",
                backgroundColor: dragOver ? "rgba(155, 60, 122, 0.08)" : "rgba(31, 42, 86, 0.3)",
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(155, 60, 122, 0.15)", color: "#9B3C7A" }}
              >
                <Upload size={28} />
              </div>
              <p className="font-medium text-white mb-1">Drop image here or click to browse</p>
              <p className="text-sm" style={{ color: "#9CA3AF" }}>
                JPEG · PNG · WEBP — up to 10 MB
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
              />
            </div>

            {error && (
              <div
                className="mt-4 flex items-center gap-3 p-4 rounded-xl border"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                }}
              >
                <X size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Supported formats */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {["JPEG", "PNG", "WEBP"].map((fmt) => (
                <div
                  key={fmt}
                  className="p-3 rounded-xl border text-center"
                  style={{
                    backgroundColor: "rgba(31, 42, 86, 0.4)",
                    borderColor: "rgba(58, 63, 122, 0.4)",
                  }}
                >
                  <ImageIcon size={18} className="mx-auto mb-1" style={{ color: "#9B3C7A" }} />
                  <p className="text-xs text-white">{fmt}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-5">
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: "rgba(58, 63, 122, 0.4)" }}
            >
              <img src={preview} alt="Preview" className="w-full object-cover max-h-80" />
            </div>

            {quality !== null && (
              <div
                className="flex items-center gap-3 p-4 rounded-xl border"
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.08)",
                  borderColor: "rgba(34, 197, 94, 0.25)",
                }}
              >
                <CheckCircle size={18} style={{ color: "#4ade80" }} />
                <div>
                  <p className="text-sm font-medium text-white">Image Quality Score: {quality}/100</p>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>
                    Image meets quality standards for YOLOv11 analysis.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => { setPreview(null); setQuality(null); }}
                className="flex-1 py-3 rounded-xl border font-medium transition-all"
                style={{ color: "#D1D5DB", borderColor: "rgba(58, 63, 122, 0.6)" }}
              >
                Choose Different
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl text-white font-semibold"
                style={{ backgroundColor: "#9B3C7A" }}
              >
                Analyze with YOLOv11
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
