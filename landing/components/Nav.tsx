"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NAV_LINKS, DEMO_URL, DASHBOARD_URL } from "@/lib/content";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/90 backdrop-blur-md border-b border-ink/[0.06] shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="w-2.5 h-2.5 rounded-full bg-primary-deep" />
          </div>
          <span
            className="font-display font-bold text-lg"
            style={{ color: scrolled ? "var(--color-ink)" : "var(--color-ink)" }}
          >
            Conduit
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-light hover:text-ink transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={DASHBOARD_URL}
            className="text-sm font-medium text-ink-light hover:text-ink transition-colors"
          >
            Log In
          </a>
          <motion.a
            href={DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-deep transition-colors shadow-md shadow-primary/20"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Book a Demo
          </motion.a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-ink"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-0.5 bg-ink mb-1.5 transition-all" />
          <div className="w-5 h-0.5 bg-ink mb-1.5" />
          <div className="w-5 h-0.5 bg-ink" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-cream/95 backdrop-blur-md border-t border-ink/[0.06] px-6 py-4">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block py-2 text-sm font-medium text-ink-light hover:text-ink"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="mt-3 pt-3 border-t border-ink/10 flex flex-col gap-2">
            <a href={DASHBOARD_URL} className="text-sm font-medium text-ink-light">
              Log In
            </a>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-sm font-semibold bg-primary text-white text-center"
            >
              Book a Demo
            </a>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
