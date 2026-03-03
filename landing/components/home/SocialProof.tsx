"use client";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

export default function SocialProof() {
  return (
    <section className="bg-bg-alt py-8 border-y border-border nodes-bg">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 text-center"
        >
          <span className="text-sm text-ink-faint">
            Trusted by tuition centers across Singapore
          </span>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-sm font-semibold text-ink px-3 py-1 rounded-md bg-white border border-border shadow-sm">
              Featured Center
            </span>
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="text-sm text-ink-faint px-3 py-1 rounded-md bg-white/60 border border-border"
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
