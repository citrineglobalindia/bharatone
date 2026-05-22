import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import { ApplyDialog, type JobMeta } from "@/components/site/ApplyDialog";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  Rocket,
  Heart,
  GraduationCap,
  Globe,
  ChevronDown,
  Mail,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Careers at BharatOne — Build Bharat With Us" },
      {
        name: "description",
        content:
          "Join BharatOne and help bring essential services to every Indian household. Engineering, ops, design and community roles across India.",
      },
      { property: "og:title", content: "Careers at BharatOne" },
      {
        property: "og:description",
        content: "Open roles at India's fastest-growing citizen services network.",
      },
    ],
  }),
});

/* -------------------------------------------------------------------------- */
const perks = [
  { icon: Heart, title: "Purpose-driven work", desc: "Every center we open and every line of code shipped touches a real citizen's life." },
  { icon: Rocket, title: "Build at scale", desc: "Ship products used by millions of Indians across 28 states." },
  { icon: Users, title: "People-first culture", desc: "Health cover for family, learning budget and flexible work modes." },
  { icon: GraduationCap, title: "Grow with us", desc: "Mentorship, structured career paths, and a real seat at the table." },
  { icon: Globe, title: "Remote-friendly", desc: "Hybrid by default. Pick the setup that lets you do your best work." },
  { icon: Sparkles, title: "Ownership", desc: "ESOPs for full-time roles. We win when you win." },
];

type Job = {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  level: "Junior" | "Mid" | "Senior" | "Lead";
  summary: string;
  responsibilities: string[];
  niceToHave: string[];
};

const jobs: Job[] = [
  {
    id: "fe-senior",
    title: "Senior Frontend Engineer",
    team: "Engineering",
    location: "Bengaluru / Remote (India)",
    type: "Full-time",
    level: "Senior",
    summary:
      "Build the customer-facing surfaces of BharatOne — the citizen portal, partner center dashboard and admin tools used daily across 1,000+ locations.",
    responsibilities: [
      "Own end-to-end delivery of features across React + TypeScript + TanStack Router",
      "Drive performance, accessibility and i18n (Hindi, Kannada, English)",
      "Mentor junior engineers and define frontend conventions",
    ],
    niceToHave: ["Experience with TanStack Start / Vite", "Design-systems sense", "Built consumer products at scale"],
  },
  {
    id: "ops-mgr-south",
    title: "Operations Manager — South",
    team: "Operations",
    location: "Bengaluru",
    type: "Full-time",
    level: "Lead",
    summary:
      "Lead expansion and quality across our southern network — Karnataka, Tamil Nadu, Telangana, Andhra Pradesh and Kerala.",
    responsibilities: [
      "Run weekly business reviews with center partners",
      "Build SOPs for service quality and dispute resolution",
      "Partner with central ops + product to close feedback loops",
    ],
    niceToHave: ["5+ years in field ops or franchise networks", "Fluent in Kannada and English", "Comfort with data dashboards"],
  },
  {
    id: "community-lead",
    title: "Community Lead",
    team: "Community",
    location: "Hyderabad",
    type: "Full-time",
    level: "Mid",
    summary:
      "Build and nurture our partner community — train new center owners, run monthly meet-ups and turn champion partners into advocates.",
    responsibilities: [
      "Design and run partner onboarding and training programs",
      "Organize regional meet-ups and webinars",
      "Capture stories from the field and surface them to leadership",
    ],
    niceToHave: ["Community management experience", "Strong storytelling", "Comfortable with WhatsApp + spreadsheets"],
  },
  {
    id: "product-designer",
    title: "Product Designer",
    team: "Design",
    location: "Remote (India)",
    type: "Full-time",
    level: "Mid",
    summary:
      "Design citizen-facing experiences for users who often see a smartphone for the first time. Simplicity is non-negotiable.",
    responsibilities: [
      "Own end-to-end design from research to handoff",
      "Build and evolve the BharatOne design system",
      "Collaborate closely with engineering and ops",
    ],
    niceToHave: ["Portfolio with shipped consumer products", "Comfort with Figma + prototyping", "Bharat / rural empathy"],
  },
  {
    id: "cs-associate",
    title: "Customer Success Associate",
    team: "Support",
    location: "Bengaluru",
    type: "Full-time",
    level: "Junior",
    summary:
      "First responder to partner centers and citizens. Resolve queries fast, find patterns and turn pain points into product asks.",
    responsibilities: [
      "Handle multi-channel support (call, chat, email)",
      "Tag and triage issues, work with ops + engineering on fixes",
      "Maintain an internal knowledge base",
    ],
    niceToHave: ["1+ years in CX", "Multilingual (Hindi/Kannada/Tamil)", "Calm under pressure"],
  },
];

const TEAMS = ["All", "Engineering", "Operations", "Community", "Design", "Support"] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

function CareersPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [applyFor, setApplyFor] = useState<JobMeta | null>(null);
  const [team, setTeam] = useState<(typeof TEAMS)[number]>("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return jobs.filter((j) => {
      if (team !== "All" && j.team !== team) return false;
      if (!needle) return true;
      return (
        j.title.toLowerCase().includes(needle) ||
        j.team.toLowerCase().includes(needle) ||
        j.location.toLowerCase().includes(needle)
      );
    });
  }, [team, q]);

  return (
    <PageShell
      eyebrow="Careers"
      title={
        <>
          Build <span className="text-gradient-tricolor">Bharat</span> with us.
        </>
      }
      subtitle="We're hiring engineers, designers, operators and storytellers who want to put government, banking and welfare services within walking distance of every Indian household."
      crumbs={[{ label: "Careers" }]}
      accent="green"
    >
      {/* Perks */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Why join BharatOne</h2>
          <p className="text-muted-foreground mt-3">
            A place where craftsmanship, kindness and country come together.
          </p>
        </motion.div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {perks.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="rounded-2xl border border-border bg-card p-6 hover:border-saffron/40 hover:shadow-elegant transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--saffron)]/15 to-[var(--india-green)]/15 flex items-center justify-center">
                <p.icon className="h-5 w-5 text-saffron" />
              </div>
              <h3 className="font-display font-semibold text-lg mt-4">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Open roles */}
      <section className="bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Open positions
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mt-1">
                {filtered.length} role{filtered.length === 1 ? "" : "s"} open
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9 sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Team filter pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {TEAMS.map((t) => {
              const active = t === team;
              return (
                <button
                  key={t}
                  onClick={() => setTeam(t)}
                  className={`relative px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? "border-saffron text-saffron"
                      : "border-border text-foreground/70 hover:border-saffron/40"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="team-pill"
                      className="absolute inset-0 rounded-full bg-saffron/12 -z-10"
                      transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    />
                  )}
                  {t}
                </button>
              );
            })}
          </div>

          {/* Job list */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
              <Briefcase className="h-9 w-9 mx-auto text-muted-foreground" />
              <h3 className="font-display text-lg font-semibold mt-3">No roles match that filter</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We're growing fast — write to us anyway, we'd love to hear from you.
              </p>
              <Button
                asChild
                className="mt-5 bg-gradient-to-r from-[var(--saffron)] to-[var(--india-green)] text-white"
              >
                <Link to="/contact">Talk to us</Link>
              </Button>
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <AnimatePresence>
                {filtered.map((job) => {
                  const open = openId === job.id;
                  return (
                    <motion.div
                      key={job.id}
                      layout
                      variants={fadeUp}
                      className="rounded-2xl border border-border bg-card overflow-hidden hover:border-saffron/40 transition-colors"
                    >
                      <button
                        onClick={() => setOpenId(open ? null : job.id)}
                        className="w-full text-left p-5 sm:p-6 flex items-start sm:items-center gap-4 hover:bg-muted/40 transition-colors"
                      >
                        <div className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--saffron)] to-[var(--india-green)] text-white flex items-center justify-center">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="font-display font-semibold text-lg">{job.title}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {job.level}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {job.team}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {job.type}
                            </span>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform shrink-0 ${
                            open ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden border-t border-border"
                          >
                            <div className="p-6 sm:p-8 bg-muted/30 grid lg:grid-cols-3 gap-8">
                              <div className="lg:col-span-2 space-y-5">
                                <p className="text-sm leading-relaxed text-foreground/90">
                                  {job.summary}
                                </p>
                                <div>
                                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                    What you'll do
                                  </div>
                                  <ul className="space-y-1.5 text-sm">
                                    {job.responsibilities.map((r) => (
                                      <li key={r} className="flex items-start gap-2">
                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-saffron shrink-0" />
                                        <span>{r}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                    Bonus points
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {job.niceToHave.map((t) => (
                                      <span
                                        key={t}
                                        className="text-xs px-2.5 py-1 rounded-full bg-card border border-border"
                                      >
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <Button
                                  size="lg"
                                  onClick={() => setApplyFor({ id: job.id, title: job.title, team: job.team })}
                                  className="w-full bg-gradient-to-r from-[var(--saffron)] to-[var(--india-green)] text-white"
                                >
                                  Apply now <ArrowRight className="ml-1 h-4 w-4" />
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                  <Link to="/contact">Ask a question</Link>
                                </Button>
                                <div className="text-[11px] text-muted-foreground text-center pt-2">
                                  We respond to every application within 5 business days.
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
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-border bg-card p-8 sm:p-12 text-center shadow-elegant relative overflow-hidden"
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: "var(--gradient-tricolor)" }}
          />
          <h3 className="font-display text-2xl sm:text-3xl font-bold">
            Didn't find the right role?
          </h3>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            We're always looking for kind, curious people who care about Bharat. Tell us what you do
            best — we'll find a way to build something together.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-7 bg-gradient-to-r from-[var(--saffron)] to-[var(--india-green)] text-white"
          >
            <a href="mailto:careers@mybharatone.com">
              <Mail className="mr-2 h-4 w-4" /> Send us a note
            </a>
          </Button>
        </motion.div>
      </section>

      <ApplyDialog
        open={applyFor !== null}
        onClose={() => setApplyFor(null)}
        job={applyFor}
      />
    </PageShell>
  );
}
