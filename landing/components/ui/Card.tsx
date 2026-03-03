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
    ? "rounded-xl p-6 bg-white/[0.06] border border-white/10"
    : "rounded-xl p-6 bg-white border border-border shadow-sm hover:shadow-md transition-shadow duration-200";

  return (
    <motion.div
      variants={staggerItem}
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
