import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/bharatone-logo.png";

const links = [
  { label: "Home", to: "/" },
  { label: "About", to: "/#about" },
  { label: "Services", to: "/#services" },
  { label: "Schemes", to: "/#schemes" },
  { label: "Contact", to: "/#contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-border/60 py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-soft">
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-1 bg-saffron" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-india-green" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full border border-ashoka" />
            </div>
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-lg">BharatOne</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">For Indian Citizens</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className="px-4 py-2 text-sm font-medium text-foreground/80 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a href="tel:+919611101334" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <Phone className="h-4 w-4" /> +91 96111 01334
          </a>
          <Button className="bg-gradient-saffron text-primary-foreground shadow-soft hover:shadow-glow transition-shadow">
            Register Center
          </Button>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-border/60 bg-background"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.to}
                  href={l.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-lg text-base font-medium hover:bg-muted"
                >
                  {l.label}
                </a>
              ))}
              <Button className="mt-2 bg-gradient-saffron text-primary-foreground">
                Register Your Center
              </Button>
              <a href="tel:+919611101334" className="text-center text-sm text-muted-foreground mt-2">
                +91 96111 01334
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
