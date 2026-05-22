import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Inbox,
  Users,
  MessageCircle,
  Briefcase,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/responses", label: "Enquiries", icon: Inbox },
  { to: "/admin/visitors", label: "Visitors", icon: Users },
  { to: "/admin/applications", label: "Applications", icon: Briefcase },
  { to: "/admin/chatbot", label: "Chatbot", icon: MessageCircle },
];

export function AdminShell({ children, title }: { children: ReactNode; title: string }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [authChecked, setAuthChecked] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      setEmail(data.session.user.email ?? null);
      setAuthChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/admin/login" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const onLogout = async () => {
    await getSupabase().auth.signOut();
    navigate({ to: "/admin/login" });
  };

  if (!authChecked) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-saffron" />
      </div>
    );
  }

  const sidebar = (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((n) => {
        const active = pathname === n.to || pathname.startsWith(n.to + "/");
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setSidebarOpen(false)}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "text-foreground bg-muted/80"
                : "text-foreground/65 hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {active && (
              <motion.span
                layoutId="admin-active-bg"
                className="absolute inset-0 rounded-lg bg-saffron/10 -z-10"
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
              />
            )}
            <n.icon className="h-4 w-4 shrink-0" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-muted/30 flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-border bg-card flex-col">
        <Link to="/" className="px-5 py-5 flex items-center gap-2.5 border-b border-border">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[var(--saffron)] to-[var(--india-green)] flex items-center justify-center text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-sm">BharatOne</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin</div>
          </div>
        </Link>
        {sidebar}
        <div className="mt-auto p-3 border-t border-border">
          <div className="text-[11px] text-muted-foreground mb-2 px-2 truncate">{email}</div>
          <Button variant="outline" size="sm" className="w-full" onClick={onLogout}>
            <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            className="absolute left-0 top-0 h-full w-60 bg-card border-r border-border flex flex-col"
          >
            <div className="px-5 py-5 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[var(--saffron)] to-[var(--india-green)] flex items-center justify-center text-white">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="font-display font-bold text-sm">BharatOne Admin</div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
          </motion.aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="font-display text-base sm:text-lg font-semibold">{title}</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-india-green animate-pulse" />
              {email}
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
