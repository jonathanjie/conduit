"use client";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import Card from "@/components/ui/Card";
import { PROBLEM_CARDS } from "@/lib/content";
import NodesBg from "@/components/NodesBg";

export default function Problem() {
  return (
    <section id="problem" className="relative bg-cream py-24 md:py-32 px-6 overflow-hidden">
      <NodesBg />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 mb-4">
            Sound familiar?
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4">
            The hidden costs of unstructured communication
          </h2>
          <p className="text-ink-light text-lg max-w-2xl mx-auto">
            Most tuition centers are one WhatsApp thread away from losing their best teacher — and they don&apos;t know it.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {PROBLEM_CARDS.map((card) => (
            <Card key={card.title} accentTop="var(--color-accent)">
              <div className="text-3xl mb-4">{card.icon}</div>
              <h3 className="font-display text-xl font-bold text-ink mb-2">
                {card.title}
              </h3>
              <p className="text-ink-light leading-relaxed">{card.body}</p>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
