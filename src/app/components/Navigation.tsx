import { Screen, User } from "../App";
import { Activity, LogOut, User as UserIcon, Menu, X, Bot } from "lucide-react";
import { useState } from "react";

interface Props {
  screen: Screen;
  user: User | null;
  navigate: (s: Screen) => void;
  onSignOut: () => void;
  setAuthMode: (m: "signin" | "signup") => void;
  onOpenChatbot?: () => void;
}

export function Navigation({ screen, user, navigate, onSignOut, setAuthMode, onOpenChatbot }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Home", screen: "home" as Screen },
    { label: "Scan", screen: "scan-method" as Screen, auth: true },
    { label: "How It Works", screen: "how-it-works" as Screen },
    { label: "Demo", screen: "demo" as Screen },
    { label: "History", screen: "history" as Screen, auth: true },
    { label: "AI Chatbot", screen: null as unknown as Screen, chatbot: true },
  ];

  const handleNav = (s: Screen) => {
    navigate(s);
    setMobileOpen(false);
  };

  return (
    <nav
      className="sticky top-0 z-40 w-full border-b"
      style={{
        backgroundColor: "rgba(15, 22, 41, 0.95)",
        borderColor: "rgba(58, 63, 122, 0.4)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNav("home")}
            className="flex items-center gap-2 group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#9B3C7A" }}
            >
              <Activity size={18} color="white" />
            </div>
            <span className="text-white font-semibold tracking-wide text-lg">
              YOLO<span style={{ color: "#9B3C7A" }}>CHECK</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.auth && !user) return null;
              if (link.chatbot) {
                return (
                  <button
                    key={link.label}
                    onClick={onOpenChatbot}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors"
                    style={{ color: "#D1D5DB", backgroundColor: "transparent" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#FFFFFF"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#D1D5DB"}
                  >
                    <Bot size={14} />
                    {link.label}
                  </button>
                );
              }
              const isActive = screen === link.screen;
              return (
                <button
                  key={link.label}
                  onClick={() => handleNav(link.screen)}
                  className="px-4 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    color: isActive ? "#9B3C7A" : "#D1D5DB",
                    backgroundColor: isActive ? "rgba(155, 60, 122, 0.12)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#FFFFFF";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#D1D5DB";
                  }}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => handleNav("settings")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                  style={{ color: "#D1D5DB" }}
                >
                  <UserIcon size={16} />
                  <span>{user.name.split(" ")[0]}</span>
                </button>
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors"
                  style={{
                    color: "#D1D5DB",
                    borderColor: "rgba(58, 63, 122, 0.6)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#9B3C7A";
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(58, 63, 122, 0.6)";
                    e.currentTarget.style.color = "#D1D5DB";
                  }}
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setAuthMode("signin"); navigate("auth"); }}
                  className="px-4 py-2 text-sm rounded-lg transition-colors"
                  style={{ color: "#D1D5DB" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#FFFFFF"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#D1D5DB"}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthMode("signup"); navigate("auth"); }}
                  className="px-4 py-2 text-sm rounded-lg font-medium transition-all"
                  style={{ backgroundColor: "#9B3C7A", color: "#FFFFFF" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#7d3063"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#9B3C7A"}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: "#D1D5DB" }}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-2"
          style={{
            backgroundColor: "rgba(15, 22, 41, 0.98)",
            borderColor: "rgba(58, 63, 122, 0.4)",
          }}
        >
          {navLinks.map((link) => {
            if (link.auth && !user) return null;
            if (link.chatbot) {
              return (
                <button
                  key={link.label}
                  onClick={() => { onOpenChatbot?.(); setMobileOpen(false); }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm"
                  style={{ color: "#D1D5DB" }}
                >
                  <Bot size={14} />
                  {link.label}
                </button>
              );
            }
            return (
              <button
                key={link.label}
                onClick={() => handleNav(link.screen)}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm"
                style={{ color: screen === link.screen ? "#9B3C7A" : "#D1D5DB" }}
              >
                {link.label}
              </button>
            );
          })}
          <div className="pt-2 border-t flex flex-col gap-2" style={{ borderColor: "rgba(58, 63, 122, 0.4)" }}>
            {user ? (
              <button
                onClick={() => { onSignOut(); setMobileOpen(false); }}
                className="px-4 py-2.5 rounded-lg text-sm text-left"
                style={{ color: "#D1D5DB" }}
              >
                Logout
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setAuthMode("signin"); handleNav("auth"); }}
                  className="px-4 py-2.5 rounded-lg text-sm text-left"
                  style={{ color: "#D1D5DB" }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthMode("signup"); handleNav("auth"); }}
                  className="px-4 py-2.5 rounded-lg text-sm text-center font-medium"
                  style={{ backgroundColor: "#9B3C7A", color: "#FFFFFF" }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
