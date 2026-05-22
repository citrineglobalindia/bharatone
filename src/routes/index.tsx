import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { HeadlinesMarquee } from "@/components/site/HeadlinesMarquee";
import { Hero, Stats } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { Schemes, CTA, Awards } from "@/components/site/Schemes";
import { Footer } from "@/components/site/Footer";
import { Chatbot } from "@/components/site/Chatbot";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "BharatOne — Empowering Indian Citizens with Easy Access to Services" },
      {
        name: "description",
        content:
          "BharatOne brings government, banking, schemes, and welfare services to your neighbourhood through 1,000+ service centers across India.",
      },
      { property: "og:title", content: "BharatOne — Services for Every Indian Citizen" },
      {
        property: "og:description",
        content:
          "Government paperwork, AEPS banking, bill payments, IRCTC, Shreerakshe Health Card and more — all at your nearest BharatOne center.",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <div className="pt-[60px]">
          <HeadlinesMarquee />
        </div>
        <Hero />
        <Stats />
        <Services />
        <Schemes />
        <CTA />
        <Awards />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
