"use client";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import Button from "@/components/ui/Button";
import RelayDiagram from "@/components/RelayDiagram";
import { DEMO_URL } from "@/lib/content";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white px-6 pt-24 pb-16">
      <div className="max-w-6xl mx-auto w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
          >
            <RelayDiagram className="w-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
