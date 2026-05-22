import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Inbox,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Loader2,
  ChevronDown,
  Download,
  Bell,
} from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getSupabase,
  type ContactSubmission,
  type SubmissionStatus,
} from "@/lib/supabase";

export const Route = createFileRoute("/admin/responses")({
  component: AdminResponsesPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Enquiries — BharatOne Admin" }] }),
});

const STATUS_META: Record<
  SubmissionStatus,
  { label: string; tone: string; icon: React.ComponentType<{ className?: string }> }
> = {
  new: { label: "New", tone: "bg-saffron/15 text-saffron border-saffron/30", icon: Inbox },
  in_progress: { label: "In progress", tone: "bg-ashoka/15 text-ashoka border-ashoka/30", icon: Clock },
  resolved: { label: "Resolved", tone: "bg-india-green/15 text-india-green border-india-green/30", icon: CheckCircle2 },
  spam: { label: "Spam", tone: "bg-destructive/10 text-destructive border-destructive/30", icon: AlertOctagon },
};

const TOPIC_LABEL: Record<ContactSubmission["topic"], string> = {
  services: "Citizen services",
  center: "Opening a center",
  partnership: "Partnership",
  media: "Media / Press",
  other: "Other",
};

function csvCell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(rows: ContactSubmission[]) {
  const headers = ["created_at", "name", "email", "phone", "topic", "status", "message", "notes"];
  const lines = [headers.join(",")];
  rows.forEach((r) => {
    lines.push(headers.map((h) => csvCell((r as any)[h])).join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bharatone-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function AdminResponsesPage() {
  const [rows, setRows] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SubmissionStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);

  const fetchRows = useCallback(async () => {
    setError(null);
    setRefreshing(true);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("bharatone_contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    setRefreshing(false);
    setLoading(false);
    if (error) {
      setError(error.message || "Failed to load enquiries");
      return;
    }
    setRows((data as ContactSubmission[]) ?? []);
  }, []);

  useEffect(() => {
    fetchRows();
    // Realtime: prepend new submissions, update updated rows
    const supabase = getSupabase();
    const channel = supabase
      .channel("bcs-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bharatone_contact_submissions" },
        (payload) => {
          const row = payload.new as ContactSubmission;
          setRows((prev) => [row, ...prev.filter((r) => r.id !== row.id)]);
          setNewCount((n) => n + 1);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bharatone_contact_submissions" },
        (payload) => {
          const row = payload.new as ContactSubmission;
          setRows((prev) => prev.map((r) => (r.id === row.id ? row : r)));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.phone ?? "").toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q) ||
        TOPIC_LABEL[r.topic].toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter]);

  const counts = useMemo(() => {
    const out: Record<"all" | SubmissionStatus, number> = {
      all: rows.length, new: 0, in_progress: 0, resolved: 0, spam: 0,
    };
    for (const r of rows) out[r.status]++;
    return out;
  }, [rows]);

  const onStatusChange = async (id: string, status: SubmissionStatus) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    const supabase = getSupabase();
    const { error } = await supabase
      .from("bharatone_contact_submissions")
      .update({ status, responded_at: status === "resolved" ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) { fetchRows(); setError(error.message); }
  };

  const onNotesBlur = async (id: string, notes: string) => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("bharatone_contact_submissions")
      .update({ notes })
      .eq("id", id);
    if (error) setError(error.message);
  };

  return (
    <AdminShell title="Enquiries">
      {/* Banner for realtime arrivals */}
      <AnimatePresence>
        {newCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 rounded-lg border border-saffron/40 bg-saffron/10 text-saffron px-3 py-2 text-sm flex items-center justify-between"
          >
            <span className="inline-flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {newCount} new enquir{newCount === 1 ? "y" : "ies"} arrived
            </span>
            <button className="text-xs underline" onClick={() => setNewCount(0)}>Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {(["all", "new", "in_progress", "resolved"] as const).map((s) => {
          const isActive = statusFilter === s;
          const label = s === "all" ? "Total" : STATUS_META[s as SubmissionStatus].label;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-left rounded-2xl border bg-card p-4 transition-all ${
                isActive ? "border-saffron shadow-soft" : "border-border hover:border-saffron/40"
              }`}
            >
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="font-display text-2xl font-bold mt-1">{counts[s]}</div>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, phone or message…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="spam">Spam</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchRows} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadCsv(filtered)} disabled={filtered.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/8 text-destructive text-sm px-3 py-2 mb-4">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-saffron" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
          <Inbox className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold mt-3">No enquiries found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {rows.length === 0
              ? "When citizens submit the contact form, they'll appear here."
              : "Try adjusting your search or filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((r) => {
              const meta = STATUS_META[r.status];
              const open = selectedId === r.id;
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                  <button
                    onClick={() => setSelectedId(open ? null : r.id)}
                    className="w-full text-left flex items-start sm:items-center gap-3 sm:gap-4 p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center border ${meta.tone}`}>
                      <meta.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold truncate">{r.name}</span>
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" />{r.email}
                        </span>
                        {r.phone && (
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" />{r.phone}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-foreground/80 mt-1 line-clamp-1">{r.message}</div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                        <span>·</span>
                        <span>{TOPIC_LABEL[r.topic]}</span>
                      </div>
                    </div>
                    <span className={`shrink-0 hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${meta.tone}`}>
                      {meta.label}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="p-5 sm:p-6 bg-muted/30 grid sm:grid-cols-3 gap-6">
                          <div className="sm:col-span-2 space-y-4">
                            <div>
                              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Message</div>
                              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{r.message}</p>
                            </div>
                            <div>
                              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Internal notes</div>
                              <Textarea
                                rows={3}
                                defaultValue={r.notes ?? ""}
                                placeholder="Add a note for the team…"
                                onBlur={(e) => onNotesBlur(r.id, e.target.value)}
                                className="mt-2 text-sm"
                              />
                              <div className="text-[11px] text-muted-foreground mt-1">Auto-saves on blur</div>
                            </div>
                          </div>
                          <div className="space-y-4 text-sm">
                            <div>
                              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Status</div>
                              <select
                                value={r.status}
                                onChange={(e) => onStatusChange(r.id, e.target.value as SubmissionStatus)}
                                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                              >
                                <option value="new">New</option>
                                <option value="in_progress">In progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="spam">Spam</option>
                              </select>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={`mailto:${r.email}?subject=Re:%20Your%20BharatOne%20enquiry`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-saffron transition-colors"
                              >
                                <Mail className="h-3.5 w-3.5" /> Reply by email
                              </a>
                              {r.phone && (
                                <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-india-green transition-colors">
                                  <Phone className="h-3.5 w-3.5" /> Call
                                </a>
                              )}
                            </div>
                            {r.responded_at && (
                              <div className="text-[11px] text-muted-foreground">
                                Resolved on {new Date(r.responded_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </AdminShell>
  );
}
