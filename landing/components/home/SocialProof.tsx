"use client";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

export default function SocialProof() {
  return (
    <section className="bg-cream-warm py-10 border-y border-ink/[0.06]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center"
        >
          <span className="text-sm text-ink-faint font-medium">
            Trusted by tuition centers across Singapore
          </span>
          <div className="hidden sm:block w-px h-4 bg-ink/20" />
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-ink px-4 py-1.5 rounded-full bg-white border border-ink/[0.08] shadow-sm">
              Math Mavens
            </span>
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="text-sm font-medium text-ink-faint px-4 py-1.5 rounded-full bg-white/60 border border-ink/[0.05]"
              >
                Partner {i}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
