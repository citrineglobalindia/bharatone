import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Contact BharatOne — Talk to Our Team" },
      {
        name: "description",
        content:
          "Get in touch with BharatOne. Call, email, or write to us — we're here to help you access citizen services or open a service center.",
      },
      { property: "og:title", content: "Contact BharatOne" },
      {
        property: "og:description",
        content: "Talk to the BharatOne team about services, centers and partnerships.",
      },
    ],
  }),
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <PageShell
      eyebrow="Contact"
      title={
        <>
          Let's talk — <span className="text-gradient-tricolor">we're listening.</span>
        </>
      }
      subtitle="Reach out for service queries, center partnerships, media or general enquiries. We typically respond within one business day."
      crumbs={[{ label: "Contact" }]}
      accent="ashoka"
    >
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-3 rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-soft"
        >
          {sent ? (
            <div className="text-center py-16">
              <CheckCircle2 className="h-14 w-14 text-india-green mx-auto" />
              <h2 className="font-display text-2xl font-bold mt-4">Message received!</h2>
              <p className="text-muted-foreground mt-2">Our team will get back to you within one business day.</p>
              <Button className="mt-6" onClick={() => setSent(false)}>Send another</Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-5"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4 text-saffron" />
                Send us a message
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" required placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required placeholder="you@example.com" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" placeholder="+91 …" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="topic">I'm reaching out about</Label>
                  <select
                    id="topic"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    defaultValue="services"
                  >
                    <option value="services">Citizen services</option>
                    <option value="center">Opening a center</option>
                    <option value="partnership">Partnership</option>
                    <option value="media">Media / Press</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="msg">Message</Label>
                <Textarea id="msg" required rows={5} placeholder="How can we help?" />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-[var(--saffron)] to-[var(--india-green)] text-white"
              >
                Send message <Send className="ml-1.5 h-4 w-4" />
              </Button>
            </form>
          )}
        </motion.div>

        {/* Info */}
        <div className="lg:col-span-2 space-y-4">
          {[
            { icon: Phone, label: "Phone", value: "+91 96111 01334", href: "tel:+919611101334" },
            { icon: Mail, label: "Email", value: "info@mybharatone.com", href: "mailto:info@mybharatone.com" },
            { icon: MapPin, label: "Office", value: "Bengaluru, Karnataka, India" },
            { icon: Clock, label: "Hours", value: "Mon–Sat · 9:30am – 6:30pm IST" },
          ].map((c) => (
            <a
              key={c.label}
              href={c.href || "#"}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 hover:border-saffron/40 hover:shadow-soft transition-all"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--saffron)] to-[var(--india-green)] text-white flex items-center justify-center shrink-0">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                <div className="font-medium mt-0.5">{c.value}</div>
              </div>
            </a>
          ))}

          <div className="rounded-2xl overflow-hidden border border-border h-56">
            <iframe
              title="BharatOne office location"
              src="https://www.google.com/maps?q=Bengaluru&output=embed"
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
