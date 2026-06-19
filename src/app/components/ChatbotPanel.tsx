import { useState, useRef, useEffect } from "react";
import { ScanItem } from "../App";
import { X, Send, Bot, ChevronDown, ChevronUp, Paperclip, FileText, XCircle } from "lucide-react";
import { sendChatMessage } from "../services/apiService";

interface Props {
  onClose:     () => void;
  currentScan: ScanItem | null;
  scanId?:     string;
}

interface Msg {
  id:        string;
  sender:    "user" | "ai";
  text:      string;
  timestamp: Date;
  file?:     string;
}

const SUGGESTION_CATEGORIES = [
  {
    category: "💙 I'm Worried / Scared",
    questions: [
      "I'm scared about my scan result.",
      "Could my mole be cancer?",
      "What should I do if I'm worried?",
      "I can't stop thinking about this.",
      "Is it normal to feel anxious about moles?",
      "How do I calm down about my results?",
    ],
  },
  {
    category: "🩺 Symptoms I'm Experiencing",
    questions: [
      "My mole is itching — is that bad?",
      "My mole is bleeding — what should I do?",
      "My mole is changing shape.",
      "I have a new mole that appeared suddenly.",
      "My mole is painful or tender.",
      "My mole is getting bigger.",
    ],
  },
  {
    category: "👨‍👩‍👧 About My Health",
    questions: [
      "I have a family history of skin cancer.",
      "How fast does skin cancer spread?",
      "What happens at a dermatologist appointment?",
      "I can't afford a dermatologist — what can I do?",
      "How do I check my own skin at home?",
      "What are the chances my mole is cancerous?",
    ],
  },
  {
    category: "📊 My Scan Results",
    questions: [
      "What does High Risk mean?",
      "What does Low Risk mean?",
      "What does Moderate Risk mean?",
      "Explain my confidence score.",
      "What do my ABCD scores mean?",
      "What is the total dermoscopy score?",
    ],
  },
  {
    category: "🔬 Benign vs Malignant",
    questions: [
      "What is a benign mole?",
      "What is a malignant mole?",
      "What is the difference between benign and malignant?",
      "Which is more dangerous — benign or malignant?",
      "Can a benign mole turn malignant?",
      "How do doctors tell if a mole is benign or malignant?",
    ],
  },
  {
    category: "🦠 Skin Diseases",
    questions: [
      "What is melanoma?",
      "What is basal cell carcinoma?",
      "What is squamous cell carcinoma?",
      "What is eczema?",
      "What is psoriasis?",
      "What is rosacea?",
      "What causes skin cancer?",
      "What are the early signs of skin cancer?",
      "What is dermatitis?",
      "What is seborrheic keratosis?",
    ],
  },
  {
    category: "📐 ABCD Rule",
    questions: [
      "What is the ABCD rule?",
      "What does Asymmetry mean in ABCD?",
      "What does Border mean in ABCD?",
      "What does Color mean in ABCD?",
      "What does Diameter mean in ABCD?",
      "What is a dangerous ABCD score?",
    ],
  },
  {
    category: "🛡️ Prevention & Care",
    questions: [
      "How can I prevent skin cancer?",
      "How often should I check my moles?",
      "What SPF sunscreen should I use?",
      "When should I see a dermatologist?",
      "How does UV radiation affect skin?",
      "What foods help skin health?",
      "How does YOLOv11 detect moles?",
    ],
  },
];

const formatMsg = (text: string) =>
  text.split("\n").map((line, i, arr) => (
    <span key={i}>
      {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={j} style={{ color: "#1F2A56" }}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={j}>{part}</span>
        )
      )}
      {i < arr.length - 1 && <br />}
    </span>
  ));

async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        if (!(window as any).pdfjsLib) {
          await new Promise<void>((res, rej) => {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            script.onload = () => res();
            script.onerror = () => rej();
            document.head.appendChild(script);
          });
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
        const pdfjsLib   = (window as any).pdfjsLib;
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const pdf         = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText      = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page    = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText     += content.items.map((item: any) => item.str).join(" ") + "\n";
        }
        resolve(fullText.trim() || "Could not extract text from PDF.");
      } catch {
        resolve("Could not read PDF. Please try again.");
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export function ChatbotPanel({ onClose, currentScan, scanId }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id:        "init",
      sender:    "ai",
      text:      "Hello! I'm the YOLOCheck AI Health Assistant. 💙\n\nI'm here to help you with:\n• Understanding your scan results\n• Questions about moles and skin diseases\n• Symptoms like itching, bleeding, or changing moles\n• Emotional support if you're worried or scared\n• General skin health and prevention tips\n\nFeel free to ask me ANYTHING — no question is too small or too personal.\n\nYou can also upload your scan report using the 📎 button below for personalized answers!\n\nI provide educational guidance only — not medical diagnoses.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput]                     = useState("");
  const [typing, setTyping]                   = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [openCategory, setOpenCategory]       = useState<string | null>("💙 I'm Worried / Scared");
  const [uploadedFile, setUploadedFile]       = useState<File | null>(null);
  const [reportContext, setReportContext]      = useState<string>("");
  const [extracting, setExtracting]           = useState(false);
  const bottomRef                             = useRef<HTMLDivElement>(null);
  const fileInputRef                          = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("pdf") && !file.type.includes("text")) {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), sender: "ai",
        text: "Please upload a PDF or text file. Other file types are not supported.",
        timestamp: new Date(),
      }]);
      return;
    }

    setUploadedFile(file);
    setExtracting(true);
    setMessages((prev) => [...prev, {
      id: crypto.randomUUID(), sender: "user",
      text: `📄 Uploaded: ${file.name}`,
      timestamp: new Date(), file: file.name,
    }]);

    try {
      const text = file.type.includes("pdf")
        ? await extractTextFromPDF(file)
        : await file.text();

      setReportContext(text);
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), sender: "ai",
        text: `✅ I've read your report **${file.name}** successfully!\n\nI can now answer questions specifically about this report. Try asking:\n• "Summarize my report"\n• "What is my risk level?"\n• "Explain my ABCD scores"\n• "What should I do next based on my results?"`,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), sender: "ai",
        text: "Sorry, I couldn't read that file. Please try downloading your report again.",
        timestamp: new Date(),
      }]);
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeReport = () => {
    setUploadedFile(null);
    setReportContext("");
    setMessages((prev) => [...prev, {
      id: crypto.randomUUID(), sender: "ai",
      text: "Report removed. I'm back to general skin health assistance mode. Feel free to ask me anything! 💙",
      timestamp: new Date(),
    }]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, {
      id: crypto.randomUUID(), sender: "user",
      text: text.trim(), timestamp: new Date(),
    }]);
    setInput("");
    setShowSuggestions(false);
    setTyping(true);

    try {
      const messageWithContext = reportContext
        ? `[YOLOCHECK REPORT CONTENT]\n${reportContext}\n\n[USER QUESTION]\n${text.trim()}`
        : text.trim();

      const reply = await sendChatMessage(messageWithContext, scanId, currentScan?.id);
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), sender: "ai",
        text: reply, timestamp: new Date(),
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), sender: "ai",
        text: "I'm having trouble connecting right now. Please make sure the backend is running.\n\n⚠️ Reminder: This is AI-generated educational information only — not a medical diagnosis. Please consult a qualified dermatologist for professional advice.",
        timestamp: new Date(),
      }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        onClick={onClose} />

      <div className="fixed z-50 flex flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor:     "rgba(58,63,122,0.3)",
          bottom:          "2rem",
          right:           "2rem",
          width:           "min(680px, calc(100vw - 2rem))",
          height:          "min(780px, calc(100vh - 4rem))",
        }}>

        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #1F2A56 0%, #3A3F7A 100%)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(155,60,122,0.25)" }}>
            <Bot size={20} style={{ color: "#d88bc4" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-base">AI Health Assistant</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              {reportContext
                ? `📄 Reading: ${uploadedFile?.name}`
                : "Ask me anything · Powered by Gemini"}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#FFFFFF" }}>
            <X size={16} />
          </button>
        </div>

        {uploadedFile && (
          <div className="flex items-center gap-3 px-4 py-2 flex-shrink-0"
            style={{ backgroundColor: "rgba(155,60,122,0.08)",
              borderBottom: "1px solid rgba(155,60,122,0.2)" }}>
            <FileText size={14} style={{ color: "#9B3C7A" }} />
            <span className="text-xs flex-1 truncate" style={{ color: "#374151" }}>
              {uploadedFile.name}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(155,60,122,0.15)", color: "#9B3C7A" }}>
              Report loaded
            </span>
            <button onClick={removeReport}>
              <XCircle size={14} style={{ color: "#9CA3AF" }} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
          style={{ backgroundColor: "#F9FAFB" }}>
          {messages.map((msg) => (
            <div key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "ai" && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                  style={{ backgroundColor: "rgba(155,60,122,0.15)" }}>
                  <Bot size={14} style={{ color: "#9B3C7A" }} />
                </div>
              )}
              <div className="max-w-[78%] px-4 py-3 text-sm leading-relaxed"
                style={{
                  backgroundColor: msg.sender === "user" ? "#1F2A56" : "#FFFFFF",
                  color:           msg.sender === "user" ? "#FFFFFF" : "#374151",
                  boxShadow:       "0 1px 4px rgba(0,0,0,0.08)",
                  borderRadius:    msg.sender === "user"
                    ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  fontSize: "0.875rem", lineHeight: "1.6",
                }}>
                {msg.file && (
                  <div className="flex items-center gap-2 mb-2 px-2 py-1 rounded-lg"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                    <FileText size={12} />
                    <span className="text-xs">{msg.file}</span>
                  </div>
                )}
                {formatMsg(msg.text)}
                <p className="text-xs mt-1.5 opacity-50">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {(typing || extracting) && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2"
                style={{ backgroundColor: "rgba(155,60,122,0.15)" }}>
                <Bot size={14} style={{ color: "#9B3C7A" }} />
              </div>
              <div className="px-4 py-3 flex items-center gap-2"
                style={{ backgroundColor: "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  borderRadius: "18px 18px 18px 4px" }}>
                {extracting && (
                  <span className="text-xs" style={{ color: "#9CA3AF" }}>Reading report...</span>
                )}
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full animate-bounce"
                    style={{ backgroundColor: "#9B3C7A", animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex-shrink-0 border-t"
          style={{ borderColor: "rgba(58,63,122,0.12)", backgroundColor: "#FFFFFF" }}>
          <button onClick={() => setShowSuggestions((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold"
            style={{ color: "#9B3C7A" }}>
            <span>💡 Suggested Questions</span>
            {showSuggestions ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          {showSuggestions && (
            <div className="max-h-52 overflow-y-auto px-4 pb-3 space-y-1.5">
              {reportContext && (
                <div>
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: "rgba(155,60,122,0.1)", color: "#9B3C7A" }}>
                    <span>📄 About Your Report</span>
                    <span>▲</span>
                  </button>
                  <div className="mt-1 space-y-1 pl-2">
                    {[
                      "Summarize my report",
                      "What is my risk level?",
                      "Explain my ABCD scores from the report",
                      "What should I do next based on my results?",
                      "Is my confidence score good?",
                      "What does my classification mean?",
                    ].map((q) => (
                      <button key={q} onClick={() => sendMessage(q)}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg border transition-all"
                        style={{ borderColor: "rgba(155,60,122,0.25)", color: "#374151",
                          backgroundColor: "rgba(155,60,122,0.04)" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(155,60,122,0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(155,60,122,0.04)"}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {SUGGESTION_CATEGORIES.map((cat) => (
                <div key={cat.category}>
                  <button
                    onClick={() => setOpenCategory(
                      openCategory === cat.category ? null : cat.category
                    )}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{
                      backgroundColor: openCategory === cat.category
                        ? "rgba(155,60,122,0.1)" : "rgba(58,63,122,0.06)",
                      color: openCategory === cat.category ? "#9B3C7A" : "#6B7280",
                    }}>
                    <span>{cat.category}</span>
                    <span>{openCategory === cat.category ? "▲" : "▼"}</span>
                  </button>
                  {openCategory === cat.category && (
                    <div className="mt-1 space-y-1 pl-2">
                      {cat.questions.map((q) => (
                        <button key={q} onClick={() => sendMessage(q)}
                          className="w-full text-left text-xs px-3 py-2 rounded-lg border transition-all"
                          style={{ borderColor: "rgba(155,60,122,0.25)", color: "#374151",
                            backgroundColor: "rgba(155,60,122,0.04)" }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(155,60,122,0.1)"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(155,60,122,0.04)"}>
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0 border-t"
          style={{ borderColor: "rgba(58,63,122,0.12)", backgroundColor: "#FFFFFF" }}>
          <input ref={fileInputRef} type="file" accept=".pdf,.txt"
            className="hidden" onChange={handleFileUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload your report PDF"
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              backgroundColor: uploadedFile ? "rgba(155,60,122,0.2)" : "rgba(58,63,122,0.1)",
              color:           uploadedFile ? "#9B3C7A" : "#6B7280",
              border:          uploadedFile ? "1px solid rgba(155,60,122,0.4)" : "1px solid transparent",
            }}>
            <Paperclip size={16} />
          </button>
          <input type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(input); }}
            placeholder={reportContext ? "Ask about your uploaded report…" : "Ask me anything about your skin health…"}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ backgroundColor: "#F3F4F6", color: "#111827",
              border: "1px solid rgba(58,63,122,0.15)", fontSize: "0.875rem" }}
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              backgroundColor: input.trim() ? "#9B3C7A" : "rgba(155,60,122,0.2)",
              color: "#FFFFFF",
            }}>
            <Send size={16} />
          </button>
        </div>

        <div className="px-4 py-2 text-center text-xs flex-shrink-0"
          style={{ backgroundColor: "#F9FAFB", color: "#9CA3AF",
            borderTop: "1px solid rgba(58,63,122,0.1)" }}>
          Educational only · Does not diagnose or prescribe · Not a replacement for medical advice
        </div>
      </div>
    </>
  );
}