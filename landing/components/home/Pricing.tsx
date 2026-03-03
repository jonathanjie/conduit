"use client";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import Button from "@/components/ui/Button";
import { PRICING_TIERS, DEMO_URL } from "@/lib/content";

export default function Pricing() {
  return (
    <section id="pricing" className="bg-cream py-24 md:py-32 px-6 nodes-bg">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
            Pricing
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-ink-light text-lg max-w-xl mx-auto">
            Pay per active student. No setup fees. No long-term contracts.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {PRICING_TIERS.map((tier) => (
            <motion.div
              key={tier.name}
              variants={staggerItem}
              className={`relative rounded-3xl p-8 flex flex-col ${
                tier.popular
                  ? "bg-primary text-white border-2 border-primary shadow-xl shadow-primary/20"
                  : "bg-white border border-ink/[0.07] shadow-sm"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-accent text-white shadow-md">
                  POPULAR
                </span>
              )}

              <div className="mb-6">
                <h3
                  className={`font-display text-xl font-bold mb-1 ${
                    tier.popular ? "text-white" : "text-ink"
                  }`}
                >
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 my-3">
                  <span
                    className={`font-display text-4xl font-extrabold ${
                      tier.popular ? "text-white" : "text-ink"
                    }`}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={`text-sm ${
                      tier.popular ? "text-white/70" : "text-ink-light"
                    }`}
                  >
                    {tier.unit}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    tier.popular ? "text-white/70" : "text-ink-light"
                  }`}
                >
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span
                      className={`text-sm mt-0.5 flex-shrink-0 ${
                        tier.popular ? "text-white/80" : "text-primary"
                      }`}
                    >
                      ✓
                    </span>
                    <span
                      className={`text-sm ${
                        tier.popular ? "text-white/80" : "text-ink-light"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant={tier.popular ? "ghost-dark" : "primary"}
                className="justify-center w-full"
              >
                {tier.cta}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center text-ink-faint text-sm mt-8"
        >
          All plans include PDPA compliance tools, anonymous relay, and dashboard access.
        </motion.p>
      </div>
    </section>
  );
}
