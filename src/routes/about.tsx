import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import {
  Target,
  Compass,
  HeartHandshake,
  Award,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Rocket,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  ssr: false,
  head: () => ({
    meta: [
      { title: "About BharatOne — Our Mission to Empower Indian Citizens" },
      {
        name: "description",
        content:
          "Learn how BharatOne is bridging the digital divide with 1,000+ service centers, bringing government, banking and welfare services to every Indian neighbourhood.",
      },
      { property: "og:title", content: "About BharatOne" },
      {
        property: "og:description",
        content:
          "Our story, mission and the people behind India's fastest-growing citizen services network.",
      },
    ],
  }),
});

const values = [
  { icon: Target, title: "Citizen First", desc: "Every service, process and decision begins with the citizen we serve." },
  { icon: ShieldCheck, title: "Trust & Integrity", desc: "Government-approved, transparent and secure from end to end." },
  { icon: HeartHandshake, title: "Inclusive Access", desc: "Bridging the digital divide for rural and urban India alike." },
  { icon: Rocket, title: "Built to Scale", desc: "Engineered to bring 100+ essential services to a billion Indians." },
];

const milestones = [
  { year: "2021", title: "BharatOne founded", desc: "Started with a single service center in Karnataka." },
  { year: "2022", title: "100 centers", desc: "Expanded across South India with citizen-first services." },
  { year: "2024", title: "1,000+ centers", desc: "Recognized by Startup India and ELEVATE Karnataka." },
  { year: "2025", title: "Shreerakshe Health Card", desc: "Launched our flagship welfare initiative for families." },
];

function AboutPage() {
  return (
    <PageShell
      eyebrow="About Us"
      title={
        <>
          Building the bridge to{" "}
          <span className="text-gradient-tricolor">essential services</span> for every citizen.
        </>
      }
      subtitle="BharatOne is on a mission to bring government, banking, welfare and everyday services within walking distance of every Indian household."
      crumbs={[{ label: "About" }]}
    >
      {/* Story */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-start">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-2xl sm:text-4xl font-bold leading-tight">
            Our story is the story of <span className="text-saffron">Bharat</span>.
          </h2>
          <p className="text-muted-foreground mt-5 leading-relaxed">
            For millions of Indians, accessing a simple government document still means lost wages,
            long queues and confusing paperwork. BharatOne was started to fix that — by training
            entrepreneurs in every neighbourhood to deliver 100+ services with empathy and trust.
          </p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Today, our network of 1,000+ centers serves citizens across 28 states with everything
            from Aadhaar updates and AEPS banking to insurance and welfare schemes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="bg-gradient-to-r from-[var(--saffron)] to-[var(--india-green)] text-white">
              <Link to="/services">Explore Services <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">Talk to our team</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4"
        >
          {[
            { icon: Users, k: "10L+", v: "Citizens served" },
            { icon: MapPin, k: "28", v: "States reached" },
            { icon: Award, k: "1,000+", v: "Active centers" },
            { icon: Sparkles, k: "100+", v: "Services offered" },
          ].map((s) => (
            <div key={s.v} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <s.icon className="h-5 w-5 text-saffron" />
              <div className="mt-3 font-display text-2xl font-bold">{s.k}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Mission / Vision */}
      <section className="bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 grid md:grid-cols-2 gap-6">
          {[
            { icon: Target, label: "Our Mission", text: "Deliver essential services to every Indian citizen with dignity, transparency and speed." },
            { icon: Compass, label: "Our Vision", text: "A Bharat where access to government, finance and welfare is never more than a 10-minute walk away." },
          ].map((m) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-card border border-border p-8 shadow-soft"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--saffron)] to-[var(--india-green)] text-white flex items-center justify-center mb-4">
                <m.icon className="h-6 w-6" />
              </div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{m.label}</div>
              <p className="mt-2 text-lg leading-relaxed">{m.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">What we stand for</h2>
          <p className="text-muted-foreground mt-3">Four values that guide every center, conversation and service we deliver.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-6 hover:border-saffron/40 hover:shadow-elegant transition-all"
            >
              <v.icon className="h-6 w-6 text-saffron" />
              <h3 className="font-display font-semibold text-lg mt-3">{v.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-muted/40 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Our journey</h2>
            <p className="text-muted-foreground mt-3">Milestones on the road to serving every Indian household.</p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--saffron)] via-border to-[var(--india-green)]" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`relative pl-12 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-10 ${
                    i % 2 === 0 ? "" : "sm:[&>*:first-child]:order-2"
                  }`}
                >
                  <div className={`${i % 2 === 0 ? "sm:text-right sm:pr-10" : "sm:pl-10"}`}>
                    <div className="text-xs font-mono text-saffron font-semibold">{m.year}</div>
                    <div className="font-display text-xl font-semibold mt-1">{m.title}</div>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{m.desc}</p>
                  </div>
                  <div className="hidden sm:block" />
                  <span className="absolute left-4 sm:left-1/2 top-1.5 -translate-x-1/2 h-3 w-3 rounded-full bg-gradient-to-br from-[var(--saffron)] to-[var(--india-green)] ring-4 ring-background" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
