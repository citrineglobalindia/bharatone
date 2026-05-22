import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Users, Search, RefreshCw, ExternalLink, Smartphone, Monitor, Globe } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase, type Visit } from "@/lib/supabase";

export const Route = createFileRoute("/admin/visitors")({
  component: VisitorsPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Visitors — BharatOne Admin" }] }),
});

const DAY_RANGES = [
  { key: "1", label: "Today" },
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "all", label: "All" },
] as const;
type RangeKey = (typeof DAY_RANGES)[number]["key"];

function deviceFromUA(ua: string | null): "mobile" | "desktop" | "tablet" {
  if (!ua) return "desktop";
  if (/Mobi|Android|iPhone/.test(ua)) return "mobile";
  if (/iPad|Tablet/.test(ua)) return "tablet";
  return "desktop";
}

function browserFromUA(ua: string | null): string {
  if (!ua) return "—";
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  if (/Firefox\//.test(ua)) return "Firefox";
  return "Other";
}

function VisitorsPage() {
  const [rows, setRows] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("7");
  const [q, setQ] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchRows = useCallback(async () => {
    setRefreshing(true);
    const supabase = getSupabase();
    let query = supabase
      .from("bharatone_visits")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (range !== "all") {
      const since = new Date(Date.now() - Number(range) * 86400_000).toISOString();
      query = query.gte("created_at", since);
    }
    const { data, error } = await query;
    setRefreshing(false);
    setLoading(false);
    if (!error) setRows((data as Visit[]) ?? []);
  }, [range]);

  useEffect(() => {
    fetchRows();
    const supabase = getSupabase();
    const channel = supabase
      .channel("bvisits-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bharatone_visits" },
        (payload) => {
          const v = payload.new as Visit;
          setRows((prev) => [v, ...prev].slice(0, 500));
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchRows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) =>
      r.path.toLowerCase().includes(needle) ||
      (r.referrer ?? "").toLowerCase().includes(needle) ||
      (r.user_agent ?? "").toLowerCase().includes(needle) ||
      (r.language ?? "").toLowerCase().includes(needle) ||
      r.session_id.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const uniqueVisitors = useMemo(() => new Set(filtered.map((r) => r.session_id)).size, [filtered]);
  const byDevice = useMemo(() => {
    const out = { mobile: 0, desktop: 0, tablet: 0 };
    filtered.forEach((r) => { out[deviceFromUA(r.user_agent)]++; });
    return out;
  }, [filtered]);

  return (
    <AdminShell title="Visitors">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Stat icon={Users} label="Unique visitors" value={uniqueVisitors} tone="text-india-green" />
        <Stat icon={ExternalLink} label="Page views" value={filtered.length} tone="text-saffron" />
        <Stat icon={Smartphone} label="Mobile" value={byDevice.mobile} tone="text-ashoka" />
        <Stat icon={Monitor} label="Desktop" value={byDevice.desktop} tone="text-foreground/80" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search path, referrer, user agent…" className="pl-9" />
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {DAY_RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                range === r.key
                  ? "bg-saffron text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={fetchRows} disabled={refreshing}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-saffron" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
          <Users className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold mt-3">No visits yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Tracking is live. Visitors will appear here as they browse the site.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-medium px-4 py-3">When</th>
                  <th className="text-left font-medium px-4 py-3">Path</th>
                  <th className="text-left font-medium px-4 py-3">Referrer</th>
                  <th className="text-left font-medium px-4 py-3">Device / Browser</th>
                  <th className="text-left font-medium px-4 py-3">Lang</th>
                  <th className="text-left font-medium px-4 py-3">Session</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => {
                  const d = deviceFromUA(v.user_agent);
                  const b = browserFromUA(v.user_agent);
                  return (
                    <motion.tr key={v.id} layout className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(v.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs">{v.path}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">
                        {v.referrer ?? <span className="text-foreground/40">direct</span>}
                      </td>
                      <td className="px-4 py-2.5 text-xs">
                        <span className="inline-flex items-center gap-1.5">
                          {d === "mobile" ? (
                            <Smartphone className="h-3.5 w-3.5 text-saffron" />
                          ) : (
                            <Monitor className="h-3.5 w-3.5 text-india-green" />
                          )}
                          {b}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          {v.language ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground" title={v.session_id}>
                        {v.session_id.slice(0, 8)}…
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

function Stat({
  icon: Icon, label, value, tone,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <Icon className={`h-5 w-5 ${tone}`} />
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-3">{label}</div>
      <div className="font-display text-2xl sm:text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
