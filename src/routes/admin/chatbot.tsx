import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, MessageCircle, Search, RefreshCw, User, Bot } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase, type ChatbotMessage } from "@/lib/supabase";

export const Route = createFileRoute("/admin/chatbot")({
  component: ChatbotPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Chatbot — BharatOne Admin" }] }),
});

function ChatbotPage() {
  const [rows, setRows] = useState<ChatbotMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");
  const [selectedConv, setSelectedConv] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setRefreshing(true);
    const supabase = getSupabase();
    const { data } = await supabase
      .from("bharatone_chatbot_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    setRefreshing(false);
    setLoading(false);
    setRows((data as ChatbotMessage[]) ?? []);
  }, []);

  useEffect(() => {
    fetchRows();
    const supabase = getSupabase();
    const channel = supabase
      .channel("bcm-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bharatone_chatbot_messages" },
        (payload) => {
          setRows((prev) => [payload.new as ChatbotMessage, ...prev].slice(0, 1000));
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchRows]);

  // Group by conversation_id
  const conversations = useMemo(() => {
    const map = new Map<string, ChatbotMessage[]>();
    rows.forEach((r) => {
      if (!map.has(r.conversation_id)) map.set(r.conversation_id, []);
      map.get(r.conversation_id)!.push(r);
    });
    return Array.from(map.entries())
      .map(([id, msgs]) => {
        // msgs are newest-first because rows are newest-first, reverse so oldest first within a conversation
        const ordered = [...msgs].reverse();
        const last = msgs[0]; // newest
        return {
          id,
          messages: ordered,
          lastAt: last.created_at,
          turns: msgs.length,
          firstUserMsg: ordered.find((m) => m.role === "user")?.content ?? "",
          pagePath: last.page_path ?? "/",
        };
      })
      .filter((c) => {
        const needle = q.trim().toLowerCase();
        if (!needle) return true;
        return (
          c.id.toLowerCase().includes(needle) ||
          c.messages.some((m) => m.content.toLowerCase().includes(needle))
        );
      })
      .sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
  }, [rows, q]);

  const active = conversations.find((c) => c.id === selectedConv) ?? conversations[0];

  return (
    <AdminShell title="Chatbot conversations">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat label="Conversations" value={conversations.length} tone="text-saffron" />
        <Stat label="Total messages" value={rows.length} tone="text-india-green" />
        <Stat label="User turns" value={rows.filter((r) => r.role === "user").length} tone="text-ashoka" />
        <Stat label="Bot turns" value={rows.filter((r) => r.role === "assistant").length} tone="text-foreground/80" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages…" className="pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={fetchRows} disabled={refreshing}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-saffron" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
          <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold mt-3">No chatbot conversations yet</h3>
          <p className="text-sm text-muted-foreground mt-1">When someone chats with the bot, the full transcript will appear here.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-4">
          {/* Convo list */}
          <div className="lg:col-span-4 rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {conversations.map((c) => {
                const isActive = (active?.id === c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConv(c.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted/40 transition-colors ${
                      isActive ? "bg-saffron/8" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{new Date(c.lastAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                      <span>·</span>
                      <span>{c.turns} turns</span>
                    </div>
                    <div className="text-sm font-medium mt-1 line-clamp-2">
                      {c.firstUserMsg || <span className="text-muted-foreground italic">(no user message)</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                      {c.pagePath} · {c.id.slice(0, 8)}…
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transcript */}
          <div className="lg:col-span-8 rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
            {active ? (
              <>
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Conversation
                    </div>
                    <div className="font-mono text-xs mt-0.5">{active.id}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{active.turns} turns</div>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/30 max-h-[600px]">
                  {active.messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                          m.role === "user"
                            ? "bg-gradient-to-br from-[var(--saffron)] to-[var(--india-green)] text-white rounded-br-sm"
                            : "bg-card border border-border rounded-bl-sm"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] opacity-70 mb-1 uppercase tracking-wider">
                          {m.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                          {m.role}
                          <span>·</span>
                          {new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        {m.content}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-12">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={`text-[11px] uppercase tracking-wider ${tone} font-semibold`}>{label}</div>
      <div className="font-display text-2xl sm:text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
