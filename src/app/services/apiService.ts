const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://yolocheck-backend-production.up.railway.app";
export interface BoundingBox {
  x1: number; y1: number;
  x2: number; y2: number;
  width: number; height: number;
}

export interface ABCDScores {
  asymmetry:      number;
  border:         number;
  color:          number;
  diameter:       number;
  total_score:    number;
  asymmetry_note: string;
  border_note:    string;
  color_note:     string;
  diameter_note:  string;
}

export interface Detection {
  mole_id:      string;
  bounding_box: BoundingBox;
  confidence:   number;
  label:        string;
  abcd:         ABCDScores;
  risk_level:   "Low" | "Moderate" | "High";
  risk_score:   number;
}

export interface ScanResponse {
  scan_id:               string;
  user_id:               string | null;
  image_url:             string;
  total_moles_detected:  number;
  detections:            Detection[];
  highest_risk:          "Low" | "Moderate" | "High";
  created_at:            string;
}

// ── Scan ──────────────────────────────────────────────────────────────────────

export async function analyzeScan(
  imageDataUrl: string,
  userId?: string
): Promise<ScanResponse> {
  const res  = await fetch(imageDataUrl);
  const blob = await res.blob();
  const file = new File([blob], "scan.jpg", { type: blob.type || "image/jpeg" });

  const formData = new FormData();
  formData.append("file", file);
  if (userId) formData.append("user_id", userId);

  const response = await fetch(`${BACKEND_URL}/scan`, {
    method: "POST",
    body:   formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `Backend error ${response.status}`);
  }

  return response.json();
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export async function sendChatMessage(
  message: string,
  scanId?: string,
  userId?: string
): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/chat`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      scan_id: scanId ?? null,
      user_id: userId ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error("Chat service unavailable");
  }

  const data = await response.json();
  return data.reply;
}

// ── Health ────────────────────────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      signal: AbortSignal.timeout(3000)
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Auth (password stored in localStorage) ────────────────────────────────────

const USERS_KEY = "yolocheck_users";

interface StoredUser {
  password: string;
  name:     string;
}

function getUsers(): Record<string, StoredUser> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUser(email: string, password: string, name: string) {
  const users = getUsers();
  users[email.toLowerCase()] = { password, name };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function signIn(email: string, password: string) {
  if (!email.includes("@")) throw new Error("Invalid email address");
  if (password.length < 6)  throw new Error("Password must be at least 6 characters");

  const users  = getUsers();
  const stored = users[email.toLowerCase()];

  if (!stored) {
    // No account found — tell user to sign up
    throw new Error("No account found with this email. Please sign up first.");
  }

  if (stored.password !== password) {
    throw new Error("Incorrect password. Please try again.");
  }

  return {
    user: {
      email,
      user_metadata: { name: stored.name || email.split("@")[0] },
    },
  };
}

export async function signUp(email: string, password: string, name: string) {
  if (!email.includes("@")) throw new Error("Invalid email address");
  if (password.length < 6)  throw new Error("Password must be at least 6 characters");
  if (!name.trim())         throw new Error("Full name is required");

  const users = getUsers();
  if (users[email.toLowerCase()]) {
    throw new Error("An account with this email already exists. Please sign in.");
  }

  saveUser(email.toLowerCase(), password, name.trim());
  return {
    user: {
      email,
      user_metadata: { name: name.trim() },
    },
  };
}

export async function resetPassword(email: string) {
  if (!email.includes("@")) throw new Error("Invalid email address");

  const users = getUsers();
  if (!users[email.toLowerCase()]) {
    throw new Error("No account found with this email.");
  }

  // Delete stored password — user sets new one on next sign up
  delete users[email.toLowerCase()];
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
}