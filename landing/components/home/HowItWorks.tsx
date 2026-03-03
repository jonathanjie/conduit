"use client";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { HOW_IT_WORKS_STEPS } from "@/lib/content";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-cream-warm py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
            The Solution
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4">
            How Conduit works
          </h2>
          <p className="text-ink-light text-lg max-w-xl mx-auto">
            Three steps. Neither party ever sees the other&apos;s real Telegram ID.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <motion.div key={step.number} variants={staggerItem} className="relative">
              {/* Connector line */}
              {i < HOW_IT_WORKS_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(100%+0px)] w-8 h-px bg-ink/20 z-10" />
              )}

              <div className="bg-white rounded-3xl p-8 border border-ink/[0.07] shadow-sm h-full">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <span className="font-display text-sm font-bold text-primary">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-ink mb-3">
                  {step.title}
                </h3>
                <p className="text-ink-light leading-relaxed text-sm">
                  {step.body}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Flow diagram */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap items-center justify-center gap-2 text-sm font-medium"
        >
          {["Parent", "→", "@YourBot", "→", "Conduit Engine", "→", "Teacher", "→", "@YourBot", "→", "Parent"].map(
            (node, i) => (
              node === "→" ? (
                <span key={i} className="text-ink-faint">→</span>
              ) : (
                <span
                  key={i}
                  className={`px-3 py-1.5 rounded-full border text-xs ${
                    node === "Conduit Engine"
                      ? "bg-primary text-white border-primary font-semibold"
                      : "bg-white border-ink/[0.1] text-ink-light"
                  }`}
                >
                  {node}
                </span>
              )
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}
