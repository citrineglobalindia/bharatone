import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, Mail, Lock, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Admin Login — BharatOne" }] }),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin/responses" });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/admin/responses" });
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background relative overflow-hidden p-4">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 0%, color-mix(in oklab, var(--saffron) 18%, transparent), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 100%, color-mix(in oklab, var(--india-green) 18%, transparent), transparent 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-elegant relative overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: "var(--gradient-tricolor)" }}
        />

        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-saffron" />
          Admin Access
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold mt-2">
          Sign in to BharatOne
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Authorised personnel only. Use the email allow-listed in your project.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mybharatone.com"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="rounded-lg border border-destructive/30 bg-destructive/8 text-destructive text-sm px-3 py-2"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-[var(--saffron)] to-[var(--india-green)] text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Signing in
              </>
            ) : (
              <>
                <LogIn className="mr-1.5 h-4 w-4" /> Sign in
              </>
            )}
          </Button>
        </form>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to BharatOne <ArrowRight className="h-3 w-3" />
        </Link>
      </motion.div>
    </div>
  );
}
