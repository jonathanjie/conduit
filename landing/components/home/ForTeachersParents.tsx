"use client";
import { motion } from "framer-motion";
import { fadeInUp, slideInLeft, slideInRight } from "@/lib/animations";
import { TEACHER_BENEFITS, PARENT_BENEFITS } from "@/lib/content";

function BenefitList({
  items,
  accentColor,
}: {
  items: string[];
  accentColor: string;
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span
            className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: accentColor }}
          >
            ✓
          </span>
          <span className="text-ink-light text-sm leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ForTeachersParents() {
  return (
    <section className="bg-cream-warm py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4">
            Built for everyone in the room
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Teachers */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="bg-white rounded-3xl p-8 border border-ink/[0.07] shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl mb-6">
              👩‍🏫
            </div>
            <h3 className="font-display text-2xl font-bold text-ink mb-2">
              Teachers get their privacy back
            </h3>
            <p className="text-ink-light text-sm mb-6">
              No more personal handle exposure. No more after-hours anxiety.
            </p>
            <BenefitList
              items={TEACHER_BENEFITS}
              accentColor="var(--color-primary)"
            />
          </motion.div>

          {/* For Parents */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="bg-white rounded-3xl p-8 border border-ink/[0.07] shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl mb-6">
              👨‍👩‍👧
            </div>
            <h3 className="font-display text-2xl font-bold text-ink mb-2">
              Parents get the experience they expect
            </h3>
            <p className="text-ink-light text-sm mb-6">
              Telegram is already on their phone. No friction. No downloads.
            </p>
            <BenefitList
              items={PARENT_BENEFITS}
              accentColor="var(--color-accent)"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
