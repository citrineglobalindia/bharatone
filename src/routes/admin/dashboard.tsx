import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { Loader2, Inbox, Users, MessageCircle, TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Dashboard — BharatOne Admin" }] }),
});

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ visits: 0, submissions: 0, chats: 0, uniqueVisitors: 0 });
  const [visitsByDay, setVisitsByDay] = useState<{ day: string; visits: number }[]>([]);
  const [submissionsByDay, setSubmissionsByDay] = useState<{ day: string; n: number }[]>([]);
  const [topPaths, setTopPaths] = useState<{ path: string; n: number }[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      const since = new Date(Date.now() - 30 * 86400_000).toISOString();
      const [visitsRes, subsRes, chatsRes] = await Promise.all([
        supabase.from("bharatone_visits").select("created_at,path,session_id").gte("created_at", since),
        supabase.from("bharatone_contact_submissions").select("created_at"),
        supabase.from("bharatone_chatbot_messages").select("id"),
      ]);

      const visits = visitsRes.data ?? [];
      const subs = subsRes.data ?? [];
      const chats = chatsRes.data ?? [];

      // Totals
      const uniq = new Set(visits.map((v: any) => v.session_id)).size;
      setTotals({ visits: visits.length, submissions: subs.length, chats: chats.length, uniqueVisitors: uniq });

      // Visits per day (last 30 days)
      const byDay: Record<string, number> = {};
      const subByDay: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
        byDay[d] = 0;
        subByDay[d] = 0;
      }
      visits.forEach((v: any) => {
        const d = v.created_at.slice(0, 10);
        if (d in byDay) byDay[d]++;
      });
      subs.forEach((s: any) => {
        const d = s.created_at.slice(0, 10);
        if (d in subByDay) subByDay[d]++;
      });
      setVisitsByDay(Object.entries(byDay).map(([day, visits]) => ({ day: day.slice(5), visits })));
      setSubmissionsByDay(Object.entries(subByDay).map(([day, n]) => ({ day: day.slice(5), n })));

      // Top paths
      const byPath: Record<string, number> = {};
      visits.forEach((v: any) => {
        byPath[v.path] = (byPath[v.path] ?? 0) + 1;
      });
      setTopPaths(
        Object.entries(byPath)
          .map(([path, n]) => ({ path, n }))
          .sort((a, b) => b.n - a.n)
          .slice(0, 6),
      );

      setLoading(false);
    })();
  }, []);

  const cards = useMemo(
    () => [
      { icon: Users, label: "Unique visitors (30d)", value: totals.uniqueVisitors, tone: "text-india-green" },
      { icon: TrendingUp, label: "Page views (30d)", value: totals.visits, tone: "text-saffron" },
      { icon: Inbox, label: "Enquiries (all time)", value: totals.submissions, tone: "text-ashoka" },
      { icon: MessageCircle, label: "Chatbot turns", value: totals.chats, tone: "text-foreground/80" },
    ],
    [totals],
  );

  return (
    <AdminShell title="Dashboard">
      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-saffron" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {cards.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <c.icon className={`h-5 w-5 ${c.tone}`} />
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-3">
                  {c.label}
                </div>
                <div className="font-display text-2xl sm:text-3xl font-bold mt-1">{c.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Visits chart */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Visits — last 30 days</h3>
                <span className="text-xs text-muted-foreground">Daily page views</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={visitsByDay}>
                    <defs>
                      <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.7 0.19 48)" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="oklch(0.7 0.19 48)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={4} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip cursor={{ fill: "transparent" }} />
                    <Area
                      type="monotone"
                      dataKey="visits"
                      stroke="oklch(0.7 0.19 48)"
                      strokeWidth={2}
                      fill="url(#visGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Enquiries — last 30 days</h3>
                <span className="text-xs text-muted-foreground">Contact form submissions</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={submissionsByDay}>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={4} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                    <Bar dataKey="n" fill="oklch(0.52 0.15 152)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top paths */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4">Top pages</h3>
            {topPaths.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No visits yet. Tracking is live — they'll appear here as people browse.
              </div>
            ) : (
              <div className="space-y-2">
                {topPaths.map((p) => {
                  const max = Math.max(...topPaths.map((x) => x.n));
                  const pct = Math.round((p.n / max) * 100);
                  return (
                    <div key={p.path} className="flex items-center gap-3">
                      <div className="w-28 sm:w-40 truncate text-sm font-mono">{p.path}</div>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--saffron)] to-[var(--india-green)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-xs tabular-nums w-12 text-right text-muted-foreground">
                        {p.n}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
