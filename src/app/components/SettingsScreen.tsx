import { useState } from "react";
import { ScanItem, Screen, User } from "../App";
import { Shield, Trash2, FileText, Bell, ChevronRight, CheckCircle, User as UserIcon, MessageSquare } from "lucide-react";

interface Props {
  user: User;
  scans: ScanItem[];
  onDeleteHistory: () => void;
  navigate: (s: Screen) => void;
}

export function SettingsScreen({ user, scans, onDeleteHistory, navigate }: Props) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [dataConsent, setDataConsent] = useState(true);
  const [deleted, setDeleted] = useState(false);

  const handleDeleteHistory = () => {
    onDeleteHistory();
    setDeleteConfirm(false);
    setDeleted(true);
    setTimeout(() => setDeleted(false), 3000);
  };

  const toggle = (val: boolean, setter: (v: boolean) => void) => setter(!val);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10" style={{ backgroundColor: "#0F1629" }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white" style={{ fontWeight: 700 }}>
            Account & Privacy
          </h1>
          <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
            Manage your data, privacy preferences, and account settings.
          </p>
        </div>

        {/* Success notice */}
        {deleted && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl border mb-6"
            style={{
              backgroundColor: "rgba(34,197,94,0.1)",
              borderColor: "rgba(34,197,94,0.3)",
            }}
          >
            <CheckCircle size={18} style={{ color: "#4ade80" }} />
            <span className="text-sm text-white">Scan history deleted successfully.</span>
          </div>
        )}

        {/* Profile */}
        <section className="mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>
            Profile
          </h2>
          <div
            className="rounded-2xl border p-5"
            style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(155,60,122,0.2)" }}
              >
                <UserIcon size={24} style={{ color: "#9B3C7A" }} />
              </div>
              <div>
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-sm" style={{ color: "#9CA3AF" }}>{user.email}</p>
                <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                  Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Control */}
        <section className="mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>
            Data Control
          </h2>
          <div
            className="rounded-2xl border divide-y overflow-hidden"
            style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)", divideColor: "rgba(58,63,122,0.3)" }}
          >
            {/* Scan count */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <FileText size={18} style={{ color: "#9B3C7A" }} />
                <div>
                  <p className="text-sm font-medium text-white">Stored Scans</p>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>
                    {scans.length} scan{scans.length !== 1 ? "s" : ""} in your history
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("history")}
                style={{ color: "#9B3C7A" }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Delete History */}
            <div className="px-5 py-4">
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-3 w-full text-left"
                  disabled={scans.length === 0}
                  style={{ opacity: scans.length === 0 ? 0.4 : 1 }}
                >
                  <Trash2 size={18} style={{ color: "#f87171" }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#f87171" }}>
                      Delete Scan History
                    </p>
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>
                      Permanently remove all scan data and reports.
                    </p>
                  </div>
                </button>
              ) : (
                <div>
                  <p className="text-sm font-medium text-white mb-3">
                    Are you sure? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteHistory}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#f87171" }}
                    >
                      Yes, Delete All
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="px-4 py-2 rounded-lg text-sm border"
                      style={{ color: "#D1D5DB", borderColor: "rgba(58,63,122,0.5)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Clear chatbot */}
            <div className="flex items-center gap-3 px-5 py-4">
              <MessageSquare size={18} style={{ color: "#9B3C7A" }} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Clear Chat History</p>
                <p className="text-xs" style={{ color: "#9CA3AF" }}>
                  Remove all AI chatbot conversation history.
                </p>
              </div>
              <button
                className="text-xs px-3 py-1.5 rounded-lg border"
                style={{ color: "#D1D5DB", borderColor: "rgba(58,63,122,0.5)" }}
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* Privacy Preferences */}
        <section className="mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>
            Privacy Preferences
          </h2>
          <div
            className="rounded-2xl border divide-y overflow-hidden"
            style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}
          >
            {[
              {
                icon: <Bell size={18} />,
                label: "Scan Reminders",
                desc: "Receive reminders for periodic skin checks.",
                value: notifications,
                setter: setNotifications,
              },
              {
                icon: <Shield size={18} />,
                label: "Data Processing Consent",
                desc: "Allow YOLOCHECK to process your images using AI.",
                value: dataConsent,
                setter: setDataConsent,
              },
            ].map((pref) => (
              <div key={pref.label} className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="flex items-start gap-3">
                  <span style={{ color: "#9B3C7A", marginTop: 2 }}>{pref.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{pref.label}</p>
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>{pref.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(pref.value, pref.setter)}
                  className="w-11 h-6 rounded-full relative flex-shrink-0 transition-all"
                  style={{ backgroundColor: pref.value ? "#9B3C7A" : "rgba(58,63,122,0.4)" }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                    style={{ left: pref.value ? "calc(100% - 1.375rem)" : "0.125rem" }}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Policy */}
        <section>
          <div
            className="rounded-2xl border p-5 flex items-center justify-between"
            style={{ backgroundColor: "#1a2240", borderColor: "rgba(58,63,122,0.4)" }}
          >
            <div className="flex items-center gap-3">
              <Shield size={18} style={{ color: "#9B3C7A" }} />
              <div>
                <p className="text-sm font-medium text-white">Privacy Policy</p>
                <p className="text-xs" style={{ color: "#9CA3AF" }}>
                  Learn how YOLOCHECK handles your data.
                </p>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: "#9CA3AF" }} />
          </div>
        </section>
      </div>
    </div>
  );
}
