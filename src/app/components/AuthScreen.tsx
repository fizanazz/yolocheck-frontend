import { useState } from "react";
import { Screen } from "../App";
import { Lock, Mail, User, Eye, EyeOff, Shield, KeyRound } from "lucide-react";
import { signIn, signUp, resetPassword } from "../services/apiService";

interface Props {
  mode:     "signin" | "signup";
  setMode:  (m: "signin" | "signup") => void;
  onAuth:   (email: string, name: string) => void;
  navigate: (s: Screen) => void;
}

export function AuthScreen({ mode, setMode, onAuth }: Props) {
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [name,          setName]          = useState("");
  const [showPassword,  setShowPassword]  = useState(false);
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [loading,       setLoading]       = useState(false);
  const [forgotMode,    setForgotMode]    = useState(false);
  const [resetSent,     setResetSent]     = useState(false);
  const [globalError,   setGlobalError]   = useState("");

  const inputStyle = {
    backgroundColor: "rgba(31, 42, 86, 0.6)",
    borderColor:     "rgba(58, 63, 122, 0.6)",
    color:           "#FFFFFF",
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "signup" && !name.trim()) e.name = "Full name is required.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = "Valid email required.";
    if (!forgotMode && password.length < 6) e.password = "Password must be at least 6 characters.";
    return e;
  };

  // ── Forgot password ────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Enter your email above first." });
      return;
    }
    setLoading(true);
    setGlobalError("");
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err) {
      setGlobalError("Could not send reset email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Sign in / Sign up ──────────────────────────────────────────────────────
  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setGlobalError("");
    setErrors({});

    try {
      if (mode === "signup") {
        // Create new account
        await signUp(email.trim(), password, name.trim());
        // Auto sign in after signup
        await signIn(email.trim(), password);
        onAuth(email.trim(), name.trim());
      } else {
        // Sign in with real password check
        const data = await signIn(email.trim(), password);
        const userName = data.user?.user_metadata?.name
          || email.split("@")[0];
        onAuth(email.trim(), userName);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      // Show friendly error messages
      if (msg.includes("Invalid login") || msg.includes("invalid_credentials") || msg.includes("Invalid email or password")) {
        setGlobalError("Incorrect email or password. Please try again.");
      } else if (msg.includes("already registered") || msg.includes("already exists")) {
        setGlobalError("An account with this email already exists. Please sign in instead.");
        setMode("signin");
      } else if (msg.includes("weak_password")) {
        setErrors({ password: "Password is too weak. Use at least 6 characters." });
      } else {
        setGlobalError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Reset sent screen ──────────────────────────────────────────────────────
  if (resetSent) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
        style={{ backgroundColor: "#0F1629" }}>
        <div className="w-full max-w-md rounded-2xl border p-8 text-center"
          style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.5)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(34,197,94,0.15)" }}>
            <Mail size={26} style={{ color: "#4ade80" }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm mb-6" style={{ color: "#9CA3AF" }}>
            We sent a password reset link to <strong className="text-white">{email}</strong>.
            Check your inbox and click the link to reset your password.
          </p>
          <button
            onClick={() => { setResetSent(false); setForgotMode(false); }}
            className="px-6 py-3 rounded-xl font-medium text-white"
            style={{ backgroundColor: "#9B3C7A" }}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#0F1629" }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl border p-8"
          style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.5)" }}>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "rgba(155,60,122,0.2)" }}>
              <Shield size={26} style={{ color: "#9B3C7A" }} />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
              {mode === "signin"
                ? "Sign in to access your scan history and reports."
                : "Join YOLOCheck for AI-powered skin health screening."}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-6"
            style={{ backgroundColor: "rgba(15,22,41,0.6)" }}>
            {(["signin", "signup"] as const).map((m) => (
              <button key={m}
                onClick={() => { setMode(m); setErrors({}); setGlobalError(""); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: mode === m ? "#1F2A56" : "transparent",
                  color:           mode === m ? "#FFFFFF" : "#9CA3AF",
                  boxShadow:       mode === m ? "0 1px 6px rgba(0,0,0,0.3)" : "none",
                }}>
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Global error */}
          {globalError && (
            <div className="mb-4 p-3 rounded-xl border text-sm"
              style={{
                backgroundColor: "rgba(239,68,68,0.1)",
                borderColor:     "rgba(239,68,68,0.3)",
                color:           "#f87171",
              }}>
              {globalError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm mb-1.5" style={{ color: "#D1D5DB" }}>
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#9CA3AF" }} />
                  <input type="text" value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Sarah Ahmed"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ ...inputStyle, ...(errors.name ? { borderColor: "#ef4444" } : {}) }}
                    onFocus={(e) => { e.target.style.borderColor = "#9B3C7A"; e.target.style.boxShadow = "0 0 0 2px rgba(155,60,122,0.25)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = errors.name ? "#ef4444" : "rgba(58,63,122,0.6)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
                {errors.name && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#D1D5DB" }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9CA3AF" }} />
                <input type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{ ...inputStyle, ...(errors.email ? { borderColor: "#ef4444" } : {}) }}
                  onFocus={(e) => { e.target.style.borderColor = "#9B3C7A"; e.target.style.boxShadow = "0 0 0 2px rgba(155,60,122,0.25)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = errors.email ? "#ef4444" : "rgba(58,63,122,0.6)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm" style={{ color: "#D1D5DB" }}>Password</label>
                {mode === "signin" && (
                  <button type="button"
                    onClick={handleForgotPassword}
                    className="text-xs flex items-center gap-1 transition-all"
                    style={{ color: "#9B3C7A" }}>
                    <KeyRound size={11} />
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9CA3AF" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{ ...inputStyle, ...(errors.password ? { borderColor: "#ef4444" } : {}) }}
                  onFocus={(e) => { e.target.style.borderColor = "#9B3C7A"; e.target.style.boxShadow = "0 0 0 2px rgba(155,60,122,0.25)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = errors.password ? "#ef4444" : "rgba(58,63,122,0.6)"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9CA3AF" }}
                  onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.password}</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all mt-2"
              style={{ backgroundColor: loading ? "#7d3063" : "#9B3C7A", opacity: loading ? 0.85 : 1 }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3V24A12 12 0 014 12z" />
                  </svg>
                  {mode === "signin" ? "Signing In..." : "Creating Account..."}
                </span>
              ) : (
                mode === "signin" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: "#9CA3AF" }}>
            By continuing, you agree to YOLOCheck's Terms of Service and Privacy Policy.
            Your data is protected and never shared.
          </p>
        </div>
      </div>
    </div>
  );
}