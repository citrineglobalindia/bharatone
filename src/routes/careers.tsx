import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, ArrowRight, Sparkles, Users, Rocket, Heart } from "lucide-react";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Careers at BharatOne — Build Bharat With Us" },
      {
        name: "description",
        content:
          "Join BharatOne and help bring essential services to every Indian household. Explore open roles across engineering, operations and community.",
      },
      { property: "og:title", content: "Careers at BharatOne" },
      {
        property: "og:description",
        content: "Open roles at India's fastest-growing citizen services network.",
      },
    ],
  }),
});

const perks = [
  { icon: Heart, title: "Purpose-driven work", desc: "Every line of code, every center we open changes lives." },
  { icon: Rocket, title: "Build at scale", desc: "Ship products used by millions of Indian citizens." },
  { icon: Users, title: "People-first culture", desc: "Health cover, learning budget and flexible hours." },
];

const jobs = [
  { title: "Senior Frontend Engineer", team: "Engineering", location: "Bengaluru / Remote", type: "Full-time" },
  { title: "Operations Manager — South", team: "Operations", location: "Bengaluru", type: "Full-time" },
  { title: "Community Lead", team: "Community", location: "Hyderabad", type: "Full-time" },
  { title: "Product Designer", team: "Design", location: "Remote", type: "Full-time" },
  { title: "Customer Success Associate", team: "Support", location: "Bengaluru", type: "Full-time" },
];

function CareersPage() {
  return (
    <PageShell
      eyebrow="Careers"
      title={
        <>
          Build <span className="text-gradient-tricolor">Bharat</span> with us.
        </>
      }
      subtitle="We're a small, mission-driven team building the rails for citizen services across India. If you care about impact at scale, we'd love to meet you."
      crumbs={[{ label: "Careers" }]}
    >
      {/* Perks */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid md:grid-cols-3 gap-5">
          {perks.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-6 hover:border-saffron/40 hover:shadow-soft transition-all"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--saffron)] to-[var(--india-green)] text-white flex items-center justify-center mb-4">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-lg">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Openings */}
      <section className="bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">Open roles</h2>
              <p className="text-muted-foreground mt-2">{jobs.length} positions across India and remote.</p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-saffron" /> Updated weekly
            </div>
          </div>

          <ul className="space-y-3">
            {jobs.map((j, i) => (
              <motion.li
                key={j.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <a
                  href="#apply"
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 hover:border-saffron/40 hover:shadow-elegant transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl bg-saffron/10 text-saffron flex items-center justify-center shrink-0">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-display font-semibold text-lg">{j.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <span>{j.team}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.location}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {j.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-saffron group-hover:gap-2.5 transition-all">
                    Apply <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section id="apply" className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="rounded-3xl bg-gradient-to-br from-[var(--saffron)] via-[var(--saffron-glow)] to-[var(--india-green)] p-10 text-white text-center shadow-elegant">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Don't see a fit?</h2>
          <p className="mt-3 text-white/90 max-w-xl mx-auto">
            We're always looking for exceptional people. Tell us how you'd help build Bharat.
          </p>
          <Button asChild size="lg" className="mt-6 bg-card text-foreground hover:bg-background">
            <Link to="/contact">Write to us <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
