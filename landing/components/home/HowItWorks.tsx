"use client";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import NetworkGraph from "@/components/NetworkGraph";

const STEPS = [
  {
    number: "01",
    title: "Parents message your bot",
    body: "Via a deep-link in Telegram. One-time PDPA consent gate, then they're in — no app download.",
  },
  {
    number: "02",
    title: "Conduit routes anonymously",
    body: "Every message is proxied. Context injected automatically. Neither party ever sees the other's real Telegram ID.",
  },
  {
    number: "03",
    title: "Teachers reply, parents receive",
    body: "Responses thread back to the parent via the bot. Clean, fast, anonymous on both ends.",
  },
];

const LEGEND = [
  { color: "#F59E0B", label: "Parent node" },
  { color: "#2563EB", label: "Conduit relay layer" },
  { color: "#7C3AED", label: "Teacher node" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-bg-alt py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/15 mb-4">
            The Solution
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4">
            How Conduit works
          </h2>
          <p className="text-ink-light text-lg max-w-xl mx-auto">
            9 parents. 3 teachers. Every message routed anonymously through a
            single relay layer — neither side ever connected directly.
          </p>
        </motion.div>

        {/* Animated graph */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-2xl overflow-hidden mb-10"
          style={{ height: "460px", background: "#060B18", boxShadow: "0 0 0 1px rgba(37,99,235,0.2), 0 24px 60px rgba(6,11,24,0.5)" }}
        >
          <NetworkGraph variant="full" className="w-full h-full" />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4">
            {LEGEND.map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }}
                />
                <span className="text-xs text-white/40">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Live badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium text-white/50" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-live-dot" />
            Live relay simulation
          </div>
        </motion.div>

        {/* 3-step descriptions */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex gap-4 p-5 rounded-xl bg-white border border-border"
            >
              <span className="font-display text-2xl font-bold text-primary/20 flex-shrink-0 leading-none mt-0.5">
                {step.number}
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-ink mb-1">
                  {step.title}
                </h3>
                <p className="text-ink-light text-sm leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
