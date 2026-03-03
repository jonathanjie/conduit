"use client";
import { motion } from "framer-motion";

type Variant = "primary" | "ghost" | "ghost-dark";

interface ButtonProps {
  variant?: Variant;
  href?: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export default function Button({
  variant = "primary",
  href,
  children,
  className = "",
  target,
  rel,
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 cursor-pointer";
  const styles: Record<Variant, string> = {
    primary: `${base} bg-primary text-white hover:bg-primary-deep shadow-lg shadow-primary/20 animate-cta-pulse`,
    ghost: `${base} border border-ink/20 text-ink hover:bg-ink/5`,
    "ghost-dark": `${base} border border-white/20 text-white hover:bg-white/10`,
  };

  const classes = `${styles[variant]} ${className}`;

  return (
    <motion.a
      href={href}
      className={classes}
      target={target}
      rel={rel}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.a>
  );
}
