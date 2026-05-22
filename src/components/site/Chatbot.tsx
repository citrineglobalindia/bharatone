import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

type Msg = { role: "bot" | "user"; text: string };

const QUICK = [
  "What services do you offer?",
  "How to register a service center?",
  "Tell me about Shreerakshe Card",
  "Contact information",
];

function botReply(q: string): string {
  const t = q.toLowerCase();
  if (t.includes("service") && !t.includes("center"))
    return "We offer **100+ services** including:\n- E-Governance & Government Documents\n- Nadakacheri (Caste / Income / Residence certificates)\n- Banking, AEPS, DMT, Micro ATM\n- Bill Payments (BBPS)\n- Travel & IRCTC bookings\n- Loans & Insurance\n\nVisit our [Services page](/services) for the full list.";
  if (t.includes("register") || t.includes("center") || t.includes("centre"))
    return "Becoming a BharatOne partner is easy! 🎉\n\n1. Click **Register Center** at the top\n2. Submit your basic details & documents\n3. Our team reaches out within 24 hours\n\nCall **+91 96111 01334** to fast-track.";
  if (t.includes("shree") || t.includes("health") || t.includes("card"))
    return "**Shreerakshe Health Card** gives your family:\n- Exclusive discounts at trusted hospitals\n- Affordable quality healthcare\n- Lifesaving access when you need it most\n\nLearn more at shreerakshe.com or call +91 96111 01334.";
  if (t.includes("contact") || t.includes("phone") || t.includes("call") || t.includes("email"))
    return "📞 **+91 96111 01334**\n✉️ info@mybharatone.com\n📍 Bengaluru, Karnataka\n\nWe're available Mon–Sat, 9 AM – 7 PM.";
  if (t.includes("scheme"))
    return "We run welfare-driven schemes covering healthcare, education, cooperative society development, and social support. Visit the **Schemes** section to explore and apply.";
  if (t.includes("loan") || t.includes("bank"))
    return "Yes — our centers help with banking, AEPS withdrawals, money transfers, micro ATM, and loan assistance. Drop by any BharatOne center.";
  if (t.includes("hi") || t.includes("hello") || t.includes("hey"))
    return "Namaste! 🙏 I'm the BharatOne assistant. Ask me about services, registration, or schemes.";
  return "I can help with **services**, **center registration**, **Shreerakshe Card**, **schemes**, or **contact info**. What would you like to know?";
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Namaste! 🙏 I'm the BharatOne assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: botReply(q) }]);
      setTyping(false);
    }, 700);
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-gradient-saffron text-primary-foreground shadow-glow flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-india-green ring-2 ring-background animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-5 right-5 z-50 w-[min(380px,calc(100vw-2.5rem))] h-[min(560px,calc(100vh-2.5rem))] bg-card rounded-2xl shadow-elegant border border-border flex flex-col overflow-hidden"
          >
            <div className="bg-gradient-saffron text-primary-foreground px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm">BharatOne Assistant</div>
                  <div className="text-[11px] opacity-90 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-india-green" /> Online
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-white/20">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/30">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line ${
                      m.role === "user"
                        ? "bg-gradient-saffron text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: m.text
                        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="underline">$1</a>'),
                    }}
                  />
                </motion.div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                    {[0, 0.15, 0.3].map((d) => (
                      <motion.span
                        key={d}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {messages.length <= 2 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-xs px-2.5 py-1.5 rounded-full bg-muted hover:bg-saffron/15 hover:text-saffron border border-border transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="border-t border-border p-2 flex gap-2 bg-card"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                className="flex-1 px-3 py-2 text-sm rounded-xl bg-muted focus:outline-none focus:ring-2 focus:ring-saffron"
              />
              <button
                type="submit"
                className="h-9 w-9 rounded-xl bg-gradient-saffron text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
