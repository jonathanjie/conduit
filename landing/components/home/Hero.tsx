"use client";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import Button from "@/components/ui/Button";
import { DEMO_URL } from "@/lib/content";

function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#229ED9" />
      <path
        d="M5.49 11.74l13.04-5.03c.6-.22 1.13.15.93 1.1l-2.22 10.47c-.17.74-.6.92-1.22.57l-3.37-2.48-1.62 1.57c-.18.18-.33.33-.68.33l.24-3.44 6.23-5.63c.27-.24-.06-.37-.42-.14L7.7 14.18l-3.33-1.04c-.72-.22-.73-.72.12-1.06z"
        fill="white"
      />
    </svg>
  );
}

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        d="M17.04 6.96A7.07 7.07 0 0012 4.8c-3.88 0-7.04 3.16-7.04 7.04 0 1.24.33 2.45.95 3.52L4.8 19.2l3.84-1.12c1.03.56 2.19.86 3.36.86 3.88 0 7.04-3.16 7.04-7.04 0-1.88-.73-3.64-2.04-4.95zm-5.04 10.83c-.89 0-1.76-.24-2.51-.68l-.18-.11-1.93.57.57-1.89-.12-.19a5.83 5.83 0 01-.9-3.1c0-3.22 2.62-5.84 5.84-5.84 1.56 0 3.02.61 4.12 1.71s1.71 2.56 1.71 4.12c0 3.22-2.62 5.84-5.84 5.84l.04-.43zm3.2-4.37c-.17-.09-1.03-.51-1.19-.57-.16-.06-.27-.09-.39.09-.11.17-.45.57-.55.69-.1.11-.2.13-.38.04-.17-.09-.73-.27-1.39-.86-.51-.46-.86-1.02-.96-1.19-.1-.17-.01-.26.08-.35.08-.08.17-.21.26-.31.09-.1.12-.17.18-.29.06-.11.03-.22-.01-.31-.05-.09-.39-.94-.54-1.28-.14-.34-.29-.29-.39-.3h-.34c-.11 0-.29.04-.44.21-.15.17-.58.57-.58 1.39s.6 1.61.68 1.72c.09.11 1.17 1.79 2.84 2.51.4.17.71.27.95.35.4.13.76.11 1.05.07.32-.05 1-.41 1.14-.8.14-.39.14-.73.1-.8-.04-.07-.15-.11-.32-.2z"
        fill="white"
      />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white px-6 pt-24 pb-16">
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
              Telegram or WhatsApp bot — so parents never get your teachers'
              personal contact, and your operations run from a single dashboard.
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

            {/* Platform strip */}
            <motion.div
              variants={staggerItem}
              className="flex items-center gap-2.5"
            >
              <span className="text-xs text-ink-faint font-medium">Works on</span>
              <WhatsAppIcon size={22} />
              <TelegramIcon size={22} />
              <span className="text-xs text-ink-faint">WhatsApp &amp; Telegram</span>
            </motion.div>
          </motion.div>

          {/* Right: WhatsApp-style chat mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg">
              {/* WhatsApp-style header */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ background: "#075E54" }}
              >
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 9h14M10 5l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold leading-tight">Your Tuition Bot</p>
                  <p className="text-white/60 text-xs">via Conduit · online</p>
                </div>
                <WhatsAppIcon size={22} />
              </div>

              {/* Chat area */}
              <div
                className="px-4 py-4 space-y-3"
                style={{ background: "#E5DDD5" }}
              >
                {/* Parent sends → right-aligned green bubble */}
                <div className="flex justify-end">
                  <div
                    className="rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%] shadow-sm"
                    style={{ background: "#DCF8C6" }}
                  >
                    <p className="text-sm text-gray-800">
                      Hi, Emma struggled with today&apos;s homework. Can we schedule a call?
                    </p>
                    <p className="text-right text-[10px] text-gray-500 mt-0.5">
                      11:23 AM <span className="text-blue-400">✓✓</span>
                    </p>
                  </div>
                </div>

                {/* Conduit relay indicator */}
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/80 border border-white/60 shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8M7 4l2 2-2 2" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-semibold text-primary">
                      Conduit relays anonymously
                    </span>
                  </div>
                </div>

                {/* Teacher replies → left-aligned white bubble */}
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%] shadow-sm">
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "#075E54" }}>
                      Mrs Tan (via Conduit)
                    </p>
                    <p className="text-sm text-gray-800">
                      Sure! I&apos;m free Thursday 4–5pm. Does that work for Emma?
                    </p>
                    <p className="text-right text-[10px] text-gray-500 mt-0.5">11:25 AM</p>
                  </div>
                </div>

                {/* Conduit relay indicator (reverse) */}
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/80 border border-white/60 shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M10 6H2M5 8L3 6l2-2" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-semibold text-primary">
                      Reply routed back to parent
                    </span>
                  </div>
                </div>

                {/* Parent replies */}
                <div className="flex justify-end">
                  <div
                    className="rounded-2xl rounded-tr-sm px-3 py-2 shadow-sm"
                    style={{ background: "#DCF8C6" }}
                  >
                    <p className="text-sm text-gray-800">Perfect, Thursday works! 🙏</p>
                    <p className="text-right text-[10px] text-gray-500 mt-0.5">
                      11:26 AM <span className="text-blue-400">✓✓</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer note */}
              <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-ink-faint bg-white">
                <span>Neither party sees the other&apos;s personal contact</span>
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
