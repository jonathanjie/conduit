"use client";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import Card from "@/components/ui/Card";
import { FEATURES } from "@/lib/content";

export default function Features() {
  return (
    <section
      id="features"
      className="relative py-24 md:py-32 px-6 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FFFBEB 0%, #FFF5F0 50%, #FFFBEB 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
            What you get
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4">
            Everything your center needs
          </h2>
          <p className="text-ink-light text-lg max-w-xl mx-auto">
            Built specifically for the tuition center operating model — not adapted from something else.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature) => (
            <Card key={feature.title} accentTop="var(--color-primary)">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{feature.icon}</div>
                {feature.badge && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                    {feature.badge}
                  </span>
                )}
              </div>
              <h3 className="font-display text-lg font-bold text-ink mb-2">
                {feature.title}
              </h3>
              <p className="text-ink-light text-sm leading-relaxed">{feature.body}</p>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
