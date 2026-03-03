"use client";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import RelayDiagram from "@/components/RelayDiagram";

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
            Multiple classes. Multiple teachers. Every message routed anonymously through a
            single relay layer — neither side ever connected directly.
          </p>
        </motion.div>

        {/* Relay diagram */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-2xl overflow-hidden mb-10 border border-border bg-white shadow-sm"
        >
          <RelayDiagram className="w-full" />
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
