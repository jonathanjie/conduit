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
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo — relay icon */}
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="3" cy="8" r="2" fill="white" />
              <circle cx="13" cy="4" r="2" fill="white" opacity="0.7" />
              <circle cx="13" cy="12" r="2" fill="white" opacity="0.7" />
              <path d="M5 8H9M9 8L7 6M9 8L7 10" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M5 7.5L11 4.5" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
              <path d="M5 8.5L11 11.5" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
            </svg>
          </div>
          <span className="font-display font-bold text-base text-ink tracking-tight">
            Conduit
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
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
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-deep transition-colors shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {menuOpen ? (
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block py-2.5 text-sm font-medium text-ink-light hover:text-ink border-b border-border-subtle last:border-0"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="mt-4 pt-3 flex flex-col gap-2">
            <a href={DASHBOARD_URL} className="text-sm font-medium text-ink-light">Log In</a>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white text-center"
            >
              Book a Demo
            </a>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
