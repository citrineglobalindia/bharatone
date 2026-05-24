import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Mail, Search, RefreshCw, Filter, Download, Bell, UserMinus, UserCheck,
} from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase, type NewsletterSubscriber } from "@/lib/supabase";

export const Route = createFileRoute("/admin/newsletter")({
  component: NewsletterPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Newsletter — BharatOne Admin" }] }),
});

const STATUS_TONES = {
  subscribed: "bg-india-green/15 text-india-green border-india-green/30",
  unsubscribed: "bg-muted text-muted-foreground border-border",
  bounced: "bg-destructive/10 text-destructive border-destructive/30",
} as const;

function csvCell(v: unknown) {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(rows: NewsletterSubscriber[]) {
  const headers = ["created_at", "email", "status", "source"];
  const lines = [headers.join(",")];
  rows.forEach((r) => lines.push(headers.map((h) => csvCell((r as any)[h])).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bharatone-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function NewsletterPage() {
  const [rows, setRows] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | NewsletterSubscriber["status"]>("all");
  const [newCount, setNewCount] = useState(0);

  const fetchRows = useCallback(async () => {
    setRefreshing(true);
    const supabase = getSupabase();
    const { data } = await supabase
      .from("bharatone_newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);
    setRefreshing(false);
    setLoading(false);
    setRows((data as NewsletterSubscriber[]) ?? []);
  }, []);

  useEffect(() => {
    fetchRows();
    const supabase = getSupabase();
    const channel = supabase
      .channel("bns-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bharatone_newsletter_subscribers" },
        (payload) => {
          setRows((prev) => [payload.new as NewsletterSubscriber, ...prev]);
          setNewCount((n) => n + 1);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bharatone_newsletter_subscribers" },
        (payload) => {
          const row = payload.new as NewsletterSubscriber;
          setRows((prev) => prev.map((r) => (r.id === row.id ? row : r)));
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchRows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!needle) return true;
      return r.email.toLowerCase().includes(needle);
    });
  }, [rows, q, status]);

  const counts = useMemo(() => {
    const out = { all: rows.length, subscribed: 0, unsubscribed: 0, bounced: 0 };
    rows.forEach((r) => out[r.status]++);
    return out;
  }, [rows]);

  const onToggle = async (id: string, next: NewsletterSubscriber["status"]) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    const supabase = getSupabase();
    await supabase.from("bharatone_newsletter_subscribers").update({ status: next }).eq("id", id);
  };

  return (
    <AdminShell title="Newsletter">
      <AnimatePresence>
        {newCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 rounded-lg border border-india-green/40 bg-india-green/10 text-india-green px-3 py-2 text-sm flex items-center justify-between"
          >
            <span className="inline-flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {newCount} new subscriber{newCount === 1 ? "" : "s"}
            </span>
            <button className="text-xs underline" onClick={() => setNewCount(0)}>Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {(["all", "subscribed", "unsubscribed", "bounced"] as const).map((s) => {
          const active = status === s;
          const label = s === "all" ? "Total" : s.charAt(0).toUpperCase() + s.slice(1);
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`text-left rounded-2xl border bg-card p-4 transition-all ${
                active ? "border-saffron shadow-soft" : "border-border hover:border-saffron/40"
              }`}
            >
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="font-display text-2xl font-bold mt-1">{counts[s]}</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email…" className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Bounced</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchRows} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadCsv(filtered)} disabled={filtered.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-saffron" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
          <Mail className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold mt-3">No subscribers yet</h3>
          <p className="text-sm text-muted-foreground mt-1">When citizens sign up via the footer, they'll appear here.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Subscribed</th>
                  <th className="text-left px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const tone = STATUS_TONES[r.status];
                  return (
                    <motion.tr key={r.id} layout className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2.5">
                        <a href={`mailto:${r.email}`} className="font-medium hover:text-saffron">{r.email}</a>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${tone}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">
                        {r.source ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {r.status === "subscribed" ? (
                          <button
                            onClick={() => onToggle(r.id, "unsubscribed")}
                            className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <UserMinus className="h-3 w-3" /> Unsubscribe
                          </button>
                        ) : (
                          <button
                            onClick={() => onToggle(r.id, "subscribed")}
                            className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted text-muted-foreground hover:text-india-green"
                          >
                            <UserCheck className="h-3 w-3" /> Reactivate
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
