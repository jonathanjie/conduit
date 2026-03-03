"use client";
import { DEMO_URL } from "@/lib/content";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Book a Demo", href: DEMO_URL, external: true },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "mailto:hello@conduit.app" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "PDPA Statement", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-ink py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="3" cy="8" r="2" fill="white" />
                  <circle cx="13" cy="4" r="2" fill="white" opacity="0.7" />
                  <circle cx="13" cy="12" r="2" fill="white" opacity="0.7" />
                  <path d="M5 8H9M9 8L7 6M9 8L7 10" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M5 7.5L11 4.5" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                  <path d="M5 8.5L11 11.5" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                </svg>
              </div>
              <span className="font-display font-bold text-white text-base">Conduit</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Secure teacher-parent communication for Singapore tuition centers.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-live-dot" />
              <span className="text-white/40 text-xs">PDPA Compliant</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-4">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={"external" in l && l.external ? "_blank" : undefined}
                      rel={"external" in l && l.external ? "noopener noreferrer" : undefined}
                      className="text-white/55 text-sm hover:text-white/90 transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.08] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Conduit. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">Made in Singapore 🇸🇬</p>
        </div>
      </div>
    </footer>
  );
}
