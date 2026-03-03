"use client";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import Button from "@/components/ui/Button";
import { DEMO_URL } from "@/lib/content";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-cream px-6 pt-24 pb-16">
      {/* Warm background blobs */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-20 blur-3xl animate-blob"
        style={{ background: "radial-gradient(circle, var(--color-primary-light), transparent)" }}
      />
      <div
        className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-15 blur-3xl animate-blob-delay"
        style={{ background: "radial-gradient(circle, var(--color-accent-light), transparent)" }}
      />

      <div className="max-w-6xl mx-auto w-full">
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
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-live-dot" />
                Built for Singapore Tuition Centers
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={staggerItem}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] text-ink"
            >
              Protect your{" "}
              <span className="text-primary">teachers.</span>
              <br />
              Streamline every{" "}
              <span
                className="relative inline-block"
                style={{ color: "var(--color-accent)" }}
              >
                conversation.
                {/* Doodle underline */}
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 9C50 3 100 2 150 5C200 8 250 4 298 2"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              </span>
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

            {/* Trust micro-copy */}
            <motion.p variants={staggerItem} className="text-xs text-ink-faint">
              🔒 PDPA compliant · No app download required · Setup in under a week
            </motion.p>
          </motion.div>

          {/* Right: visual mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            {/* Telegram chat mockup */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-primary/5 blur-xl" />
              <div className="relative rounded-3xl bg-white border border-ink/[0.07] shadow-xl overflow-hidden">
                <div className="bg-primary px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
                    M
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">@MathMavens_bot</p>
                    <p className="text-white/70 text-xs">Online</p>
                  </div>
                </div>
                <div className="p-4 space-y-3 bg-cream-warm min-h-[280px]">
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-[75%] shadow-sm">
                      <p className="text-xs text-ink-light mb-0.5">Parent (Emma&apos;s mum)</p>
                      <p className="text-sm text-ink">Hi, Emma struggled with her homework today. Can we schedule a call?</p>
                      <p className="text-xs text-ink-faint text-right mt-1">2:34 PM</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-primary rounded-2xl rounded-tr-sm px-3 py-2 max-w-[75%]">
                      <p className="text-xs text-white/70 mb-0.5">Mrs Tan (Math)</p>
                      <p className="text-sm text-white">Sure! I&apos;m free Thursday 4–5pm. Does that work for Emma?</p>
                      <p className="text-xs text-white/60 text-right mt-1">2:41 PM ✓✓</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-[75%] shadow-sm">
                      <p className="text-sm text-ink">Perfect, Thursday works!</p>
                      <p className="text-xs text-ink-faint text-right mt-1">2:43 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge: "No personal numbers shared" */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-4 top-1/3 bg-white rounded-xl px-3 py-2 shadow-lg border border-ink/[0.07] text-xs font-medium text-ink whitespace-nowrap"
              >
                🔒 No personal numbers shared
              </motion.div>

              {/* Floating badge: "PDPA Compliant" */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -left-4 bottom-12 bg-white rounded-xl px-3 py-2 shadow-lg border border-ink/[0.07] text-xs font-medium text-ink whitespace-nowrap"
              >
                ✅ PDPA Compliant
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
