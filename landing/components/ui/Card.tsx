"use client";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/animations";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  accentTop?: string;
}

export default function Card({
  children,
  className = "",
  dark = false,
  accentTop,
}: CardProps) {
  const base = dark
    ? "rounded-2xl p-6 bg-white/[0.05] border border-white/[0.08]"
    : "rounded-2xl p-6 bg-white border border-ink/[0.07] shadow-sm";

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className={`${base} ${className}`}
      style={
        accentTop
          ? { borderTopColor: accentTop, borderTopWidth: "3px" }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
