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
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer";
  const styles: Record<Variant, string> = {
    primary: `${base} bg-primary text-white hover:bg-primary-deep shadow-md shadow-primary/25 animate-cta-pulse`,
    ghost: `${base} border border-border text-ink hover:bg-bg-alt`,
    "ghost-dark": `${base} border border-white/25 text-white hover:bg-white/10`,
  };

  return (
    <motion.a
      href={href}
      className={`${styles[variant]} ${className}`}
      target={target}
      rel={rel}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.a>
  );
}
