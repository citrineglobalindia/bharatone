import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence, useScroll, useSpring, useMotionValueEvent } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  Search,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  HeartPulse,
  Banknote,
  Tractor,
  Briefcase,
  Users,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/bharatone-logo.png";

type NavLink = {
  label: string;
  to: string;
  mega?: { icon: typeof ShieldCheck; title: string; desc: string; to: string }[];
};

const links: NavLink[] = [
  { label: "Home", to: "/#home" },
  { label: "About", to: "/#about" },
  {
    label: "Services",
    to: "/#services",
    mega: [
      { icon: ShieldCheck, title: "Aadhaar & PAN", desc: "Enrolment, updates & linking", to: "/#services" },
      { icon: HeartPulse, title: "Ayushman Bharat", desc: "Health card & insurance", to: "/#services" },
      { icon: GraduationCap, title: "Education", desc: "Scholarships & admissions", to: "/#services" },
      { icon: Banknote, title: "Banking & DBT", desc: "Jan Dhan, pensions, subsidies", to: "/#services" },
      { icon: Tractor, title: "Farmer Services", desc: "PM-KISAN, crop insurance", to: "/#services" },
      { icon: Briefcase, title: "Employment", desc: "Skill India, MGNREGA, jobs", to: "/#services" },
    ],
  },
  {
    label: "Schemes",
    to: "/#schemes",
    mega: [
      { icon: Users, title: "Welfare Schemes", desc: "Central & state benefits", to: "/#schemes" },
      { icon: FileText, title: "Certificates", desc: "Income, caste, domicile", to: "/#schemes" },
      { icon: Sparkles, title: "New Launches", desc: "Latest govt. programs", to: "/#schemes" },
    ],
  },
  { label: "Contact", to: "/#contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [active, setActive] = useState("/#home");

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.2 });

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 20);
    setHidden(latest > prev && latest > 200 && !open && !openMega);
  });

  // Active section tracking
  useEffect(() => {
    const ids = ["home", "about", "services", "schemes", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`/#${e.target.id}`);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Top utility bar */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: hidden || scrolled ? -40 : 0, opacity: hidden || scrolled ? 0 : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-[60] hidden md:block"
      >
        <div className="bg-foreground text-background/90 text-xs">
          <div className="container mx-auto px-6 flex items-center justify-between h-9">
            <div className="flex items-center gap-5">
              <a href="tel:+919611101334" className="flex items-center gap-1.5 hover:text-[var(--saffron-glow)] transition-colors">
                <Phone className="h-3 w-3" /> +91 96111 01334
              </a>
              <a href="mailto:info@mybharatone.com" className="flex items-center gap-1.5 hover:text-[var(--saffron-glow)] transition-colors">
                <Mail className="h-3 w-3" /> info@mybharatone.com
              </a>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 hover:text-[var(--saffron-glow)] transition-colors">
                <Globe className="h-3 w-3" /> EN / हिं
              </button>
              <span className="h-3 w-px bg-background/30" />
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--india-green-glow)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--india-green-glow)]" />
                </span>
                Helpdesk Online
              </span>
            </div>
          </div>
          <div className="h-[2px] w-full bg-gradient-to-r from-[var(--saffron)] via-white to-[var(--india-green)]" />
        </div>
      </motion.div>

      {/* Main header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: hidden ? -120 : 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "top-0 glass border-b border-border/60 shadow-soft py-2"
            : "top-0 md:top-[38px] bg-background/95 md:bg-transparent backdrop-blur md:backdrop-blur-0 border-b border-border/40 md:border-0 py-2 md:py-3"
        }`}
        onMouseLeave={() => setOpenMega(null)}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <motion.div
              whileHover={{ rotate: -3 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <div className="absolute -inset-2 bg-gradient-to-tr from-[var(--saffron)]/30 to-[var(--india-green)]/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src={logo} alt="BharatOne" className="relative h-9 sm:h-11 w-auto" />
            </motion.div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-sm sm:text-base tracking-tight">
                Bharat<span className="text-[var(--saffron)]">One</span>
              </span>
              <span className="hidden sm:block text-[10px] text-muted-foreground tracking-wider uppercase">
                Serving Citizens
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex items-center gap-1 relative"
            onMouseLeave={() => setHovered(null)}
          >
            {links.map((l) => {
              const isActive = active === l.to;
              const isHover = hovered === l.label;
              return (
                <div
                  key={l.label}
                  className="relative"
                  onMouseEnter={() => {
                    setHovered(l.label);
                    setOpenMega(l.mega ? l.label : null);
                  }}
                >
                  <a
                    href={l.to}
                    className="relative px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-1 transition-colors text-foreground/75 hover:text-foreground"
                  >
                    {isHover && (
                      <motion.span
                        layoutId="nav-hover"
                        className="absolute inset-0 bg-muted rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className={isActive ? "text-foreground" : ""}>{l.label}</span>
                    {l.mega && <ChevronDown className="h-3 w-3 opacity-60" />}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full bg-gradient-to-r from-[var(--saffron)] to-[var(--india-green)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                </div>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Search"
              className="hidden md:flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
            <Button className="hidden md:inline-flex relative overflow-hidden bg-gradient-to-r from-[var(--saffron)] to-[var(--india-green)] text-white shadow-soft hover:shadow-glow transition-shadow group">
              <span className="relative z-10 flex items-center gap-1.5">
                Register Center <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </Button>

            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted relative z-[70]"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? "x" : "m"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {openMega &&
            (() => {
              const link = links.find((l) => l.label === openMega);
              if (!link?.mega) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[min(900px,92vw)] hidden lg:block"
                >
                  <div className="glass rounded-2xl border border-border/60 shadow-elegant p-6 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {link.mega.map((m) => (
                      <a
                        key={m.title}
                        href={m.to}
                        onClick={() => setOpenMega(null)}
                        className="group flex items-start gap-3 p-3 rounded-xl hover:bg-muted/70 transition-colors"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-[var(--saffron)]/15 to-[var(--india-green)]/15 flex items-center justify-center text-[var(--saffron)] group-hover:scale-110 transition-transform">
                          <m.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{m.title}</div>
                          <div className="text-xs text-muted-foreground">{m.desc}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </motion.div>
              );
            })()}
        </AnimatePresence>

        {/* Scroll progress */}
        <motion.div
          style={{ scaleX: progress }}
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-[var(--saffron)] via-white to-[var(--india-green)]"
        />
      </motion.header>


      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] lg:hidden"
          >
            <motion.div
              initial={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
              animate={{ clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)" }}
              exit={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 bg-background"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--saffron)] via-white to-[var(--india-green)]" />
              <div className="container mx-auto px-6 pt-24 pb-10 h-full overflow-y-auto flex flex-col">
                <motion.nav
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
                  }}
                  className="flex flex-col gap-1"
                >
                  {links.map((l, i) => (
                    <motion.a
                      key={l.label}
                      href={l.to}
                      onClick={() => setOpen(false)}
                      variants={{
                        hidden: { x: 40, opacity: 0 },
                        show: { x: 0, opacity: 1 },
                      }}
                      className="group flex items-center justify-between py-4 border-b border-border/60"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground w-6">
                          0{i + 1}
                        </span>
                        <span className="text-2xl font-display font-semibold">{l.label}</span>
                      </span>
                      <ArrowRight className="h-5 w-5 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                    </motion.a>
                  ))}
                </motion.nav>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-auto pt-8 space-y-4"
                >
                  <Button
                    onClick={() => setOpen(false)}
                    className="w-full h-12 bg-gradient-to-r from-[var(--saffron)] to-[var(--india-green)] text-white"
                  >
                    Register Your Center <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <a
                      href="tel:+919611101334"
                      className="flex items-center gap-2 p-3 rounded-lg border border-border"
                    >
                      <Phone className="h-4 w-4 text-[var(--saffron)]" /> Call us
                    </a>
                    <a
                      href="mailto:info@mybharatone.com"
                      className="flex items-center gap-2 p-3 rounded-lg border border-border"
                    >
                      <Mail className="h-4 w-4 text-[var(--india-green)]" /> Email
                    </a>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
