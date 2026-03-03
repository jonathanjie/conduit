"use client";
import { NAV_LINKS, DEMO_URL } from "@/lib/content";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Book a Demo", href: DEMO_URL, external: true },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: `mailto:hello@conduit.app` },
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
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="w-2.5 h-2.5 rounded-full bg-primary-light" />
              </div>
              <span className="font-display font-bold text-white text-lg">Conduit</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Secure teacher-parent communication for Singapore tuition centers.
            </p>
            <div className="flex items-center gap-1.5 mt-4">
              <span className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-live-dot" />
              </span>
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
                      className="text-white/60 text-sm hover:text-white transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.07] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Conduit. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">Made in Singapore 🇸🇬</p>
        </div>
      </div>
    </footer>
  );
}
