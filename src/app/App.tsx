import { useState, useCallback, useRef } from "react";
import { Navigation }            from "./components/Navigation";
import { HomeScreen }            from "./components/HomeScreen";
import { AuthScreen }            from "./components/AuthScreen";
import { DashboardScreen }       from "./components/DashboardScreen";
import { ScanMethodScreen }      from "./components/ScanMethodScreen";
import { CameraScreen }          from "./components/CameraScreen";
import { UploadScreen }          from "./components/UploadScreen";
import { ProcessingScreen }      from "./components/ProcessingScreen";
import { ResultScreen }          from "./components/ResultScreen";
import { FeatureAnalysisScreen } from "./components/FeatureAnalysisScreen";
import { RiskAssessmentScreen }  from "./components/RiskAssessmentScreen";
import { ReportScreen }          from "./components/ReportScreen";
import { HistoryScreen }         from "./components/HistoryScreen";
import { DemoScreen }            from "./components/DemoScreen";
import { HowItWorksScreen }      from "./components/HowItWorksScreen";
import { SettingsScreen }        from "./components/SettingsScreen";
import { ChatbotPanel }          from "./components/ChatbotPanel";
import { analyzeScan }           from "./services/apiService";

export type Screen =
  | "home" | "auth" | "dashboard" | "scan-method" | "camera"
  | "upload" | "processing" | "result" | "feature-analysis"
  | "risk-assessment" | "report" | "history" | "demo"
  | "how-it-works" | "settings";

export interface User {
  id: string; email: string; name: string;
  role: "user" | "admin"; createdAt: string;
}

export interface ScanItem {
  id:              string;
  date:            string;
  riskLevel:       "Low" | "Moderate" | "High";
  confidence:      number;
  label?:          string;
  imageUrl:        string;
  imageUrlRemote?: string;
  abcd: {
    asymmetry:       number;
    border:          number;
    color:           number;
    diameter:        number;
    asymmetry_note?: string;
    border_note?:    string;
    color_note?:     string;
    diameter_note?:  string;
    total_score?:    number;
  };
  scanType:            "camera" | "upload" | "demo";
  status:              "completed";
  boundingBox?: {
    x1: number; y1: number;
    x2: number; y2: number;
    bboxWidth: number; bboxHeight: number;
  } | null;
  totalMolesDetected?: number;
  scanId?:             string;
}

export interface CurrentScan {
  imageUrl: string;
  scanType: "camera" | "upload";
}

const BACKEND = "http://localhost:8000";

// ── Helper: build a quick summary ScanItem (no API call needed) ───────────
function makeSummaryItem(s: any): ScanItem {
  return {
    id:                 s.scan_id,
    date:               s.created_at,
    riskLevel:          (s.highest_risk ?? "Low") as "Low" | "Moderate" | "High",
    confidence:         0,
    label:              "unknown",
    imageUrl:           s.image_url,
    imageUrlRemote:     s.image_url,
    abcd:               { asymmetry: 0, border: 0, color: 0, diameter: 0 },
    scanType:           "upload" as const,
    status:             "completed" as const,
    boundingBox:        null,
    totalMolesDetected: s.total_moles_detected,
    scanId:             s.scan_id,
  };
}

// ── Helper: fetch full scan details from backend ──────────────────────────
async function fetchFullScan(scanId: string, summary: any): Promise<ScanItem> {
  try {
    const res = await fetch(`${BACKEND}/scan/${scanId}`);
    if (res.ok) {
      const det     = await res.json();
      const primary = det.detections?.[0] ?? null;
      return {
        id:                 summary.scan_id,
        date:               summary.created_at,
        riskLevel:          (summary.highest_risk ?? "Low") as "Low" | "Moderate" | "High",
        confidence:         primary ? Math.round(primary.confidence * 100) : 0,
        label:              primary?.label ?? "unknown",
        imageUrl:           summary.image_url,
        imageUrlRemote:     summary.image_url,
        abcd: primary ? {
          asymmetry:      primary.abcd.asymmetry,
          border:         primary.abcd.border,
          color:          primary.abcd.color,
          diameter:       primary.abcd.diameter,
          total_score:    primary.abcd.total_score,
          asymmetry_note: primary.abcd.asymmetry_note,
          border_note:    primary.abcd.border_note,
          color_note:     primary.abcd.color_note,
          diameter_note:  primary.abcd.diameter_note,
        } : { asymmetry: 0, border: 0, color: 0, diameter: 0 },
        scanType:           "upload" as const,
        status:             "completed" as const,
        boundingBox: primary ? {
          x1:         primary.bounding_box.x1,
          y1:         primary.bounding_box.y1,
          x2:         primary.bounding_box.x2,
          y2:         primary.bounding_box.y2,
          bboxWidth:  primary.bounding_box.width,
          bboxHeight: primary.bounding_box.height,
        } : null,
        totalMolesDetected: summary.total_moles_detected,
        scanId:             summary.scan_id,
      };
    }
  } catch {
    // fallback to summary
  }
  return makeSummaryItem(summary);
}

export default function App() {
  const [screen, setScreen]               = useState<Screen>("home");
  const [user, setUser]                   = useState<User | null>(null);
  const [scans, setScans]                 = useState<ScanItem[]>([]);
  const [currentScan, setCurrentScan]     = useState<CurrentScan | null>(null);
  const [completedScan, setCompletedScan] = useState<ScanItem | null>(null);
  const [chatbotOpen, setChatbotOpen]     = useState(false);
  const [authMode, setAuthMode]           = useState<"signin" | "signup">("signin");
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const currentScanRef = useRef<CurrentScan | null>(null);

  const navigate = useCallback((s: Screen) => setScreen(s), []);

  // ── Sign in — instant navigation, history loads in background ────────────
  const handleSignIn = useCallback(async (email: string, name: string) => {
    const userId = email.toLowerCase().trim();

    // Navigate IMMEDIATELY — don't wait for anything
    setUser({ id: userId, email, name, role: "user", createdAt: new Date().toISOString() });
    setScans([]);
    navigate("dashboard");

    // Load history in background — non-blocking
    try {
      const res = await fetch(`${BACKEND}/user/${encodeURIComponent(userId)}/history`);
      if (!res.ok) return;

      const data      = await res.json();
      const summaries = (data.scans ?? []) as any[];
      if (summaries.length === 0) return;

      // ── Phase 1: Show all summaries instantly (no API calls) ──────────────
      setScans(summaries.map(makeSummaryItem));

      // ── Phase 2: Enrich only top 3 with full details (3 API calls max) ───
      const top3    = summaries.slice(0, 3);
      const rest    = summaries.slice(3);
      const full3   = await Promise.all(top3.map((s) => fetchFullScan(s.scan_id, s)));
      const restQ   = rest.map(makeSummaryItem);
      setScans([...full3, ...restQ]);

    } catch {
      // Silent fail — app still works without history
    }
  }, [navigate]);

  const handleSignOut = useCallback(() => {
    setUser(null); setScans([]);
    setCurrentScan(null); setCompletedScan(null);
    currentScanRef.current = null;
    navigate("home");
  }, [navigate]);

  const handleScanCapture = useCallback((imageUrl: string, scanType: "camera" | "upload") => {
    const scan = { imageUrl, scanType };
    currentScanRef.current = scan;
    setCurrentScan(scan);
    setAnalysisError(null);
    navigate("processing");
  }, [navigate]);

  const handleProcessingComplete = useCallback(async () => {
    const scan = currentScanRef.current;
    if (!scan) {
      navigate("dashboard");
      return;
    }

    try {
      const result  = await analyzeScan(scan.imageUrl, user?.id);
      const primary = result.detections[0] ?? null;

      const newScan: ScanItem = {
        id:             crypto.randomUUID(),
        date:           result.created_at,
        riskLevel:      result.highest_risk,
        confidence:     primary ? Math.round(primary.confidence * 100) : 0,
        label:          primary?.label ?? "unknown",
        imageUrl:       scan.imageUrl,
        imageUrlRemote: result.image_url,
        abcd: primary ? {
          asymmetry:      primary.abcd.asymmetry,
          border:         primary.abcd.border,
          color:          primary.abcd.color,
          diameter:       primary.abcd.diameter,
          total_score:    primary.abcd.total_score,
          asymmetry_note: primary.abcd.asymmetry_note,
          border_note:    primary.abcd.border_note,
          color_note:     primary.abcd.color_note,
          diameter_note:  primary.abcd.diameter_note,
        } : { asymmetry: 0, border: 0, color: 0, diameter: 0 },
        scanType:    scan.scanType,
        status:      "completed",
        boundingBox: primary ? {
          x1:         primary.bounding_box.x1,
          y1:         primary.bounding_box.y1,
          x2:         primary.bounding_box.x2,
          y2:         primary.bounding_box.y2,
          bboxWidth:  primary.bounding_box.width,
          bboxHeight: primary.bounding_box.height,
        } : null,
        totalMolesDetected: result.total_moles_detected,
        scanId:             result.scan_id,
      };

      setCompletedScan(newScan);
      setScans((prev) => [newScan, ...prev]);
      navigate("result");

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setAnalysisError(
        `Backend error: ${msg}\n\nMake sure:\n` +
        `1. Backend is running on port 8000\n` +
        `2. ml/best.pt exists\n` +
        `3. .env has correct Supabase keys`
      );
    }
  }, [user, navigate]);

  const handleSelectScan = useCallback((scan: ScanItem) => {
    setCompletedScan(scan);
  }, []);

  const handleDeleteHistory = useCallback(() => setScans([]), []);
  const isAuthenticated = user !== null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0F1629", color: "#FFFFFF" }}>
      <Navigation
        screen={screen} user={user} navigate={navigate}
        onSignOut={handleSignOut} setAuthMode={setAuthMode}
        onOpenChatbot={() => setChatbotOpen(true)}
      />
      <main>
        {screen === "home"             && <HomeScreen navigate={navigate} setAuthMode={setAuthMode} />}
        {screen === "auth"             && <AuthScreen mode={authMode} setMode={setAuthMode} onAuth={handleSignIn} navigate={navigate} />}
        {screen === "dashboard"        && isAuthenticated && (
          <DashboardScreen
            user={user!}
            scans={scans}
            navigate={navigate}
            onSelectScan={handleSelectScan}
          />
        )}
        {screen === "scan-method"      && isAuthenticated && <ScanMethodScreen navigate={navigate} />}
        {screen === "camera"           && isAuthenticated && <CameraScreen navigate={navigate} onCapture={handleScanCapture} />}
        {screen === "upload"           && isAuthenticated && <UploadScreen navigate={navigate} onCapture={handleScanCapture} />}
        {screen === "processing"       && isAuthenticated && (
          <ProcessingScreen onComplete={handleProcessingComplete} error={analysisError} />
        )}
        {screen === "result"           && completedScan && <ResultScreen scan={completedScan} navigate={navigate} />}
        {screen === "feature-analysis" && completedScan && <FeatureAnalysisScreen scan={completedScan} navigate={navigate} />}
        {screen === "risk-assessment"  && completedScan && <RiskAssessmentScreen scan={completedScan} navigate={navigate} />}
        {screen === "report"           && completedScan && <ReportScreen scan={completedScan} user={user} navigate={navigate} />}
        {screen === "history"          && isAuthenticated && (
          <HistoryScreen
            scans={scans}
            navigate={navigate}
            onSelectScan={handleSelectScan}
          />
        )}
        {screen === "demo"             && <DemoScreen navigate={navigate} />}
        {screen === "how-it-works"     && <HowItWorksScreen navigate={navigate} />}
        {screen === "settings"         && isAuthenticated && <SettingsScreen user={user!} scans={scans} onDeleteHistory={handleDeleteHistory} navigate={navigate} />}
      </main>
      {chatbotOpen && (
        <ChatbotPanel
          onClose={() => setChatbotOpen(false)}
          currentScan={completedScan}
          scanId={completedScan?.scanId}
        />
      )}
    </div>
  );
}