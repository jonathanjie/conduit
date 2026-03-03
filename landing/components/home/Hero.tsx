"use client";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import Button from "@/components/ui/Button";
import ForceGraph from "@/components/ForceGraph";
import { DEMO_URL } from "@/lib/content";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white px-6 pt-24 pb-16">
      {/* Organic force graph — absolute behind all content */}
      <ForceGraph className="absolute inset-0 w-full h-full" />

      {/* Soft left-side fade so hero text stays crisp */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.80) 30%, rgba(255,255,255,0.25) 60%, rgba(255,255,255,0) 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            {/* Badge */}
            <motion.div variants={staggerItem}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-primary-muted text-primary border border-primary/15">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-live-dot" />
                Built for Singapore Tuition Centers
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={staggerItem}
              className="font-display text-5xl sm:text-6xl font-bold leading-[1.1] text-ink"
            >
              Protect your teachers.{" "}
              <span className="text-gradient">Streamline every conversation.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={staggerItem}
              className="text-lg text-ink-light leading-relaxed max-w-lg"
            >
              Conduit proxies all teacher-parent communication through your
              Telegram bot — so parents never get your teachers' personal
              contact, and your operations run from a single dashboard.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={staggerItem} className="flex flex-wrap gap-3">
              <Button
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
              >
                Book a Demo →
              </Button>
              <Button href="#how-it-works" variant="ghost">
                See How It Works
              </Button>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              variants={staggerItem}
              className="flex flex-wrap gap-4 pt-2"
            >
              {[
                "🔒 PDPA compliant",
                "📱 No app download",
                "⚡ Setup in under a week",
              ].map((t) => (
                <span key={t} className="text-xs text-ink-faint font-medium">
                  {t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: relay diagram */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="relative bg-bg-alt rounded-2xl border border-border p-8">
              {/* Header */}
              <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-6">
                Message relay — anonymous on both ends
              </p>

              {/* Relay flow */}
              <div className="space-y-3">
                {/* Parent message */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                    👩
                  </div>
                  <div className="flex-1 bg-white rounded-xl rounded-tl-sm p-3 border border-border shadow-sm">
                    <p className="text-xs text-ink-faint mb-0.5 font-medium">Parent</p>
                    <p className="text-sm text-ink">Hi, Emma struggled with homework today. Can we schedule a call?</p>
                  </div>
                </div>

                {/* Conduit relay indicator */}
                <div className="flex items-center gap-3 py-1">
                  <div className="w-8 flex-shrink-0 flex justify-center">
                    <div className="w-px h-6 bg-border" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary-muted border border-primary/15">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8M7 4l2 2-2 2" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-semibold text-primary">
                      Conduit relays anonymously
                    </span>
                  </div>
                </div>

                {/* Teacher message */}
                <div className="flex items-start gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-lg bg-primary-muted flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                    👩‍🏫
                  </div>
                  <div className="flex-1 bg-primary rounded-xl rounded-tr-sm p-3">
                    <p className="text-xs text-white/60 mb-0.5 font-medium text-right">Teacher (Mrs Tan)</p>
                    <p className="text-sm text-white text-right">Sure! I'm free Thursday 4–5pm. Does that work for Emma?</p>
                  </div>
                </div>

                {/* Conduit relay indicator */}
                <div className="flex items-center gap-3 py-1 flex-row-reverse">
                  <div className="w-8 flex-shrink-0 flex justify-center">
                    <div className="w-px h-6 bg-border" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary-muted border border-primary/15">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M10 6H2M5 8L3 6l2-2" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-semibold text-primary">
                      Reply routed back to parent
                    </span>
                  </div>
                </div>

                {/* Parent receives */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                    👩
                  </div>
                  <div className="flex-1 bg-white rounded-xl rounded-tl-sm p-3 border border-border shadow-sm">
                    <p className="text-sm text-ink">Perfect, Thursday works! 🙏</p>
                  </div>
                </div>
              </div>

              {/* Footer note */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-ink-faint">
                <span>Neither party sees the other's Telegram ID</span>
                <span className="flex items-center gap-1.5 font-medium text-green-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-live-dot" />
                  PDPA compliant
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
