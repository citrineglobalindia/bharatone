import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Briefcase,
  Search,
  RefreshCw,
  Filter,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  FileText,
  Download,
  ChevronDown,
  Bell,
  Building2,
  GraduationCap,
} from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getSupabase,
  type JobApplication,
  type JobApplicationStatus,
} from "@/lib/supabase";

export const Route = createFileRoute("/admin/applications")({
  component: ApplicationsPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Applications — BharatOne Admin" }] }),
});

const STATUS_TONES: Record<JobApplicationStatus, string> = {
  new: "bg-saffron/15 text-saffron border-saffron/30",
  reviewing: "bg-ashoka/15 text-ashoka border-ashoka/30",
  shortlisted: "bg-india-green/15 text-india-green border-india-green/30",
  interview: "bg-india-green/15 text-india-green border-india-green/40",
  offered: "bg-india-green/20 text-india-green border-india-green/50",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  withdrawn: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABELS: Record<JobApplicationStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offered: "Offered",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

function csvCell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(rows: JobApplication[]) {
  const headers = [
    "created_at", "job_title", "full_name", "email", "phone", "location",
    "total_experience_years", "current_position", "current_company",
    "status", "linkedin_url", "portfolio_url", "resume_filename",
  ];
  const lines = [headers.join(",")];
  rows.forEach((r) => lines.push(headers.map((h) => csvCell((r as any)[h])).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bharatone-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function getSignedResumeUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from("resumes").createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}

function ApplicationsPage() {
  const [rows, setRows] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | JobApplicationStatus>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);

  const fetchRows = useCallback(async () => {
    setRefreshing(true);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("bharatone_job_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    setRefreshing(false);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((data as JobApplication[]) ?? []);
  }, []);

  useEffect(() => {
    fetchRows();
    const supabase = getSupabase();
    const channel = supabase
      .channel("bja-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bharatone_job_applications" },
        (payload) => {
          const row = payload.new as JobApplication;
          setRows((prev) => [row, ...prev.filter((r) => r.id !== row.id)]);
          setNewCount((n) => n + 1);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bharatone_job_applications" },
        (payload) => {
          const row = payload.new as JobApplication;
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
      if (jobFilter !== "all" && r.job_id !== jobFilter) return false;
      if (!needle) return true;
      return (
        r.full_name.toLowerCase().includes(needle) ||
        r.email.toLowerCase().includes(needle) ||
        r.phone.toLowerCase().includes(needle) ||
        (r.location ?? "").toLowerCase().includes(needle) ||
        r.job_title.toLowerCase().includes(needle) ||
        (r.current_company ?? "").toLowerCase().includes(needle) ||
        (r.current_position ?? "").toLowerCase().includes(needle)
      );
    });
  }, [rows, q, status, jobFilter]);

  const jobs = useMemo(() => {
    const set = new Map<string, string>();
    rows.forEach((r) => set.set(r.job_id, r.job_title));
    return Array.from(set.entries()).map(([id, title]) => ({ id, title }));
  }, [rows]);

  const counts = useMemo(() => {
    const out: Record<"all" | JobApplicationStatus, number> = {
      all: rows.length,
      new: 0, reviewing: 0, shortlisted: 0, interview: 0, offered: 0, rejected: 0, withdrawn: 0,
    };
    rows.forEach((r) => out[r.status]++);
    return out;
  }, [rows]);

  const onStatus = async (id: string, next: JobApplicationStatus) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    const supabase = getSupabase();
    await supabase
      .from("bharatone_job_applications")
      .update({ status: next, reviewed_at: new Date().toISOString() })
      .eq("id", id);
  };

  const onNotes = async (id: string, notes: string) => {
    const supabase = getSupabase();
    await supabase.from("bharatone_job_applications").update({ notes }).eq("id", id);
  };

  const handleResumeOpen = async (path: string | null) => {
    if (!path) return;
    const url = await getSignedResumeUrl(path);
    if (url) window.open(url, "_blank");
  };

  return (
    <AdminShell title="Job applications">
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
              {newCount} new application{newCount === 1 ? "" : "s"} just came in
            </span>
            <button className="text-xs underline" onClick={() => setNewCount(0)}>Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {(["all", "new", "reviewing", "shortlisted", "interview"] as const).map((s) => {
          const isActive = status === s;
          const label = s === "all" ? "Total" : STATUS_LABELS[s as JobApplicationStatus];
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
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
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone, job, company…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm max-w-[180px]"
          >
            <option value="all">All jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
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

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-saffron" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
          <Briefcase className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold mt-3">No applications yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            When candidates apply via the Careers page, they'll appear here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((r) => {
              const tone = STATUS_TONES[r.status];
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
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--saffron)] to-[var(--india-green)] text-white flex items-center justify-center text-sm font-semibold">
                      {r.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold truncate">{r.full_name}</span>
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {r.job_title}
                        </span>
                        {r.total_experience_years != null && (
                          <span className="text-xs text-muted-foreground">· {r.total_experience_years} yrs exp</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</span>
                        <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</span>
                        {r.location && (
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{r.location}</span>
                        )}
                        <span>{new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                      </div>
                    </div>
                    <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold ${tone}`}>
                      {STATUS_LABELS[r.status]}
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
                        <div className="p-5 sm:p-6 bg-muted/30 grid lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-5 text-sm">
                            {(r.current_position || r.current_company) && (
                              <div>
                                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                                  <Building2 className="h-3.5 w-3.5" /> Current role
                                </div>
                                <p className="mt-1.5">
                                  {[r.current_position, r.current_company].filter(Boolean).join(" · ")}
                                </p>
                              </div>
                            )}
                            {r.experience && (
                              <div>
                                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Experience</div>
                                <p className="mt-1.5 whitespace-pre-wrap leading-relaxed">{r.experience}</p>
                              </div>
                            )}
                            {r.education && (
                              <div>
                                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                                  <GraduationCap className="h-3.5 w-3.5" /> Education
                                </div>
                                <p className="mt-1.5 whitespace-pre-wrap leading-relaxed">{r.education}</p>
                              </div>
                            )}
                            {r.cover_letter && (
                              <div>
                                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Cover letter</div>
                                <p className="mt-1.5 whitespace-pre-wrap leading-relaxed">{r.cover_letter}</p>
                              </div>
                            )}
                            <div>
                              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Internal notes</div>
                              <Textarea
                                rows={3}
                                defaultValue={r.notes ?? ""}
                                placeholder="Add a note for the hiring team…"
                                onBlur={(e) => onNotes(r.id, e.target.value)}
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
                                onChange={(e) => onStatus(r.id, e.target.value as JobApplicationStatus)}
                                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                              >
                                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                  <option key={k} value={k}>{v}</option>
                                ))}
                              </select>
                            </div>

                            {r.resume_url && (
                              <button
                                onClick={() => handleResumeOpen(r.resume_url)}
                                className="w-full inline-flex items-center justify-between gap-2 rounded-lg border border-border bg-card hover:border-saffron px-3 py-2 text-xs font-medium transition-colors"
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <FileText className="h-3.5 w-3.5 text-saffron" />
                                  {r.resume_filename ?? "Resume"}
                                </span>
                                <Download className="h-3.5 w-3.5 shrink-0" />
                              </button>
                            )}

                            <div className="flex flex-wrap gap-2">
                              <a
                                href={`mailto:${r.email}?subject=Your%20BharatOne%20application%20-%20${encodeURIComponent(r.job_title)}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-saffron"
                              >
                                <Mail className="h-3.5 w-3.5" /> Email
                              </a>
                              <a
                                href={`tel:${r.phone}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-india-green"
                              >
                                <Phone className="h-3.5 w-3.5" /> Call
                              </a>
                              {r.linkedin_url && (
                                <a
                                  href={r.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-ashoka"
                                >
                                  <AtSign className="h-3.5 w-3.5" /> LinkedIn
                                </a>
                              )}
                              {r.portfolio_url && (
                                <a
                                  href={r.portfolio_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-saffron"
                                >
                                  <LinkIcon className="h-3.5 w-3.5" /> Portfolio
                                </a>
                              )}
                            </div>
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
