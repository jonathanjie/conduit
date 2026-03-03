"use client";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import Button from "@/components/ui/Button";
import { DEMO_URL } from "@/lib/content";

export default function FinalCTA() {
  return (
    <section className="bg-primary-deep py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-primary-light), transparent)" }}
      />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-accent-light), transparent)" }}
      />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col items-center gap-6"
        >
          <motion.span
            variants={staggerItem}
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/70 border border-white/20"
          >
            Ready to get started?
          </motion.span>

          <motion.h2
            variants={staggerItem}
            className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight"
          >
            Protect your teachers and streamline operations.
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className="text-white/70 text-lg max-w-lg"
          >
            Get Conduit running in your center in under a week. No long contracts. Singapore support.
          </motion.p>

          <motion.div
            variants={staggerItem}
            className="flex flex-wrap gap-3 justify-center"
          >
            <Button
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              className="bg-accent hover:bg-amber-600 shadow-lg shadow-accent/30"
            >
              Book a Demo →
            </Button>
            <Button href="#pricing" variant="ghost-dark">
              View Pricing
            </Button>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="flex flex-wrap justify-center gap-6 text-white/50 text-xs"
          >
            <span>No long contracts</span>
            <span>·</span>
            <span>Singapore support</span>
            <span>·</span>
            <span>PDPA compliant</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
