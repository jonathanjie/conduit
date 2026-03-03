"use client";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import Button from "@/components/ui/Button";
import { DEMO_URL } from "@/lib/content";

export default function FinalCTA() {
  return (
    <section
      className="py-24 md:py-32 px-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1E1B4B 0%, #2E2A5A 50%, #1E1B4B 100%)",
      }}
    >
      {/* Subtle warm glow */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(37,99,235,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[350px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at bottom left, rgba(245,158,11,0.08) 0%, transparent 70%)",
        }}
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
            className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-white/10 text-white/60 border border-white/15"
          >
            Ready to get started?
          </motion.span>

          <motion.h2
            variants={staggerItem}
            className="font-display text-4xl md:text-5xl font-bold text-white leading-tight"
          >
            Protect your teachers and streamline operations.
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className="text-white/60 text-lg max-w-md"
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
              className="bg-accent hover:bg-amber-600 shadow-md shadow-accent/30"
            >
              Book a Demo →
            </Button>
            <Button href="#pricing" variant="ghost-dark">
              View Pricing
            </Button>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="flex flex-wrap justify-center gap-5 text-white/40 text-xs"
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
