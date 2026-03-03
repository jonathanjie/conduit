"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Animated product diagram: parents → Conduit hub → teachers ────────── */

const BUBBLES = [
  { side: "parent" as const, label: "Parent:", text: "Hi Mrs. Lee, question about Class A homework?", color: "text-amber-600" },
  { side: "teacher" as const, label: "Teacher:", text: "Hi parents! Updated schedule is posted.", color: "text-primary" },
  { side: "parent" as const, label: "Parent:", text: "Will there be extra revision before exams?", color: "text-amber-600" },
  { side: "teacher" as const, label: "Teacher:", text: "Great progress this week, Emma!", color: "text-primary" },
];

export default function RelayDiagram({ className }: { className?: string }) {
  const [bubble, setBubble] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setBubble((b) => (b + 1) % BUBBLES.length), 3500);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const b = BUBBLES[bubble];

  return (
    <div className={`relative ${className ?? ""}`} aria-hidden="true">
      <svg
        viewBox="0 0 1000 620"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Defs ──────────────────────────────────────────────── */}
        <defs>
          {/* Tech grid background */}
          <pattern id="rd-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="0.6" fill="rgba(37,99,235,0.07)" />
            <line x1="0" y1="20" x2="40" y2="20" stroke="rgba(37,99,235,0.025)" strokeWidth="0.5" />
            <line x1="20" y1="0" x2="20" y2="40" stroke="rgba(37,99,235,0.025)" strokeWidth="0.5" />
          </pattern>

          {/* Arrow marker */}
          <marker id="rd-arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 2 2 L 10 6 L 2 10 z" fill="rgba(37,99,235,0.35)" />
          </marker>

          {/* Hub gradient */}
          <linearGradient id="rd-hub-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8FAFF" />
            <stop offset="100%" stopColor="#EFF6FF" />
          </linearGradient>

          {/* Glow filter for hub icon */}
          <filter id="rd-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* ── Connection paths ─── */}
          {/* Parent cluster 1 → Hub */}
          <path id="rd-p1h" d="M 230 195 C 330 195, 380 270, 435 300" />
          {/* Parent cluster 2 → Hub */}
          <path id="rd-p2h" d="M 215 425 C 320 425, 380 350, 435 310" />
          {/* Hub → Teacher 1 */}
          <path id="rd-ht1" d="M 575 255 C 650 210, 710 170, 775 160" />
          {/* Hub → Teacher 2 */}
          <path id="rd-ht2" d="M 575 300 C 660 300, 730 305, 810 305" />
          {/* Hub → Teacher 3 */}
          <path id="rd-ht3" d="M 575 345 C 650 395, 710 440, 770 450" />
        </defs>

        {/* ── Background ─────────────────────────────────────── */}
        <rect width="1000" height="620" fill="url(#rd-grid)" rx="24" />

        {/* ── Connection arrows ───────────────────────────────── */}
        <g>
          <use href="#rd-p1h" fill="none" stroke="rgba(37,99,235,0.13)" strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#rd-arrow)" />
          <use href="#rd-p2h" fill="none" stroke="rgba(37,99,235,0.13)" strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#rd-arrow)" />
          <use href="#rd-ht1" fill="none" stroke="rgba(37,99,235,0.13)" strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#rd-arrow)" />
          <use href="#rd-ht2" fill="none" stroke="rgba(37,99,235,0.13)" strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#rd-arrow)" />
          <use href="#rd-ht3" fill="none" stroke="rgba(37,99,235,0.13)" strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#rd-arrow)" />
        </g>

        {/* ── Animated particles along paths ──────────────────── */}
        <g style={reducedMotion ? { display: "none" } : undefined}>
          {/* Parent 1 → Hub */}
          <circle r="4" fill="#2563EB" opacity="0.55">
            <animateMotion dur="2.8s" repeatCount="indefinite" fill="freeze">
              <mpath href="#rd-p1h" />
            </animateMotion>
          </circle>
          <circle r="4" fill="#F59E0B" opacity="0.5">
            <animateMotion dur="3.2s" repeatCount="indefinite" begin="1.4s" fill="freeze">
              <mpath href="#rd-p1h" />
            </animateMotion>
          </circle>

          {/* Parent 2 → Hub */}
          <circle r="4" fill="#2563EB" opacity="0.55">
            <animateMotion dur="3s" repeatCount="indefinite" begin="0.6s" fill="freeze">
              <mpath href="#rd-p2h" />
            </animateMotion>
          </circle>

          {/* Hub → Teacher 1 */}
          <circle r="4" fill="#2563EB" opacity="0.55">
            <animateMotion dur="2.6s" repeatCount="indefinite" begin="0.3s" fill="freeze">
              <mpath href="#rd-ht1" />
            </animateMotion>
          </circle>

          {/* Hub → Teacher 2 */}
          <circle r="4" fill="#7C3AED" opacity="0.5">
            <animateMotion dur="2.4s" repeatCount="indefinite" begin="1s" fill="freeze">
              <mpath href="#rd-ht2" />
            </animateMotion>
          </circle>

          {/* Hub → Teacher 3 */}
          <circle r="4" fill="#2563EB" opacity="0.55">
            <animateMotion dur="2.9s" repeatCount="indefinite" begin="0.8s" fill="freeze">
              <mpath href="#rd-ht3" />
            </animateMotion>
          </circle>
        </g>

        {/* ── Parent cluster 1 (top-left) ─────────────────────── */}
        <g>
          <circle cx="150" cy="175" r="50" fill="rgba(37,99,235,0.05)" stroke="rgba(37,99,235,0.10)" strokeWidth="1" />
          <circle cx="200" cy="195" r="40" fill="rgba(37,99,235,0.07)" stroke="rgba(37,99,235,0.13)" strokeWidth="1" />
          <circle cx="170" cy="215" r="34" fill="rgba(245,158,11,0.05)" stroke="rgba(245,158,11,0.10)" strokeWidth="1" />
          <circle cx="130" cy="200" r="28" fill="rgba(37,99,235,0.04)" stroke="rgba(37,99,235,0.08)" strokeWidth="1" />
          {/* Avatars */}
          <text x="192" y="165" fontSize="22" textAnchor="middle">👩</text>
          <text x="145" y="185" fontSize="18" textAnchor="middle">👨</text>
          <text x="175" y="238" fontSize="16" textAnchor="middle">👩</text>
        </g>

        {/* ── Parent cluster 2 (bottom-left) ──────────────────── */}
        <g>
          <circle cx="135" cy="405" r="45" fill="rgba(37,99,235,0.05)" stroke="rgba(37,99,235,0.10)" strokeWidth="1" />
          <circle cx="185" cy="425" r="38" fill="rgba(245,158,11,0.05)" stroke="rgba(245,158,11,0.10)" strokeWidth="1" />
          <circle cx="155" cy="445" r="30" fill="rgba(37,99,235,0.06)" stroke="rgba(37,99,235,0.12)" strokeWidth="1" />
          <circle cx="200" cy="395" r="26" fill="rgba(37,99,235,0.04)" stroke="rgba(37,99,235,0.08)" strokeWidth="1" />
          {/* Avatars */}
          <text x="130" y="410" fontSize="20" textAnchor="middle">👨</text>
          <text x="185" y="432" fontSize="18" textAnchor="middle">👩</text>
          <text x="200" y="400" fontSize="14" textAnchor="middle">👩</text>
        </g>

        {/* ── Labels: Parents ─────────────────────────────────── */}
        <text x="90" y="112" fill="#6B7280" fontSize="13" fontWeight="700" fontFamily="Sora, sans-serif" letterSpacing="0.04em">Parent Nodes</text>
        <text x="90" y="130" fill="#9CA3AF" fontSize="11" fontFamily="Inter, sans-serif">(Class-Based)</text>

        <text x="72" y="350" fill="#6B7280" fontSize="13" fontWeight="700" fontFamily="Sora, sans-serif" letterSpacing="0.04em">Parent Groups</text>
        <text x="72" y="368" fill="#9CA3AF" fontSize="11" fontFamily="Inter, sans-serif">(By Class)</text>

        {/* ── Conduit Hub (center) ────────────────────────────── */}
        <g>
          {/* Shadow */}
          <rect x="443" y="168" width="124" height="274" rx="18" fill="rgba(37,99,235,0.04)" />
          {/* Body */}
          <rect x="440" y="165" width="124" height="274" rx="18" fill="url(#rd-hub-grad)" stroke="rgba(37,99,235,0.18)" strokeWidth="1.5" />

          {/* Icon circle */}
          <circle cx="502" cy="205" r="22" fill="#2563EB" filter="url(#rd-glow)" />
          <g transform="translate(502,205)" fill="white">
            <path d="M-7,-3 L0,-8 L7,-3 M-7,3 L0,8 L7,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle r="2.5" />
          </g>

          {/* Hub label */}
          <text x="502" y="270" textAnchor="middle" fill="#1E1B4B" fontSize="13" fontWeight="800" fontFamily="Sora, sans-serif" letterSpacing="0.08em">CONDUIT</text>
          <text x="502" y="292" textAnchor="middle" fill="#1E1B4B" fontSize="13" fontWeight="800" fontFamily="Sora, sans-serif" letterSpacing="0.08em">ROUTING</text>
          <text x="502" y="314" textAnchor="middle" fill="#1E1B4B" fontSize="13" fontWeight="800" fontFamily="Sora, sans-serif" letterSpacing="0.08em">HUB</text>

          {/* Decorative dots on hub edges */}
          <circle cx="440" cy="250" r="3" fill="#2563EB" opacity="0.3" />
          <circle cx="440" cy="300" r="3" fill="#2563EB" opacity="0.3" />
          <circle cx="440" cy="350" r="3" fill="#2563EB" opacity="0.3" />
          <circle cx="564" cy="250" r="3" fill="#2563EB" opacity="0.3" />
          <circle cx="564" cy="300" r="3" fill="#2563EB" opacity="0.3" />
          <circle cx="564" cy="350" r="3" fill="#2563EB" opacity="0.3" />
        </g>

        {/* ── Teacher nodes (right) ───────────────────────────── */}
        {/* Teacher 1 — top */}
        <g>
          <circle cx="800" cy="160" r="42" fill="rgba(37,99,235,0.05)" stroke="rgba(37,99,235,0.12)" strokeWidth="1" />
          <circle cx="800" cy="160" r="22" fill="rgba(37,99,235,0.10)" stroke="rgba(37,99,235,0.18)" strokeWidth="1" />
          <text x="800" y="167" fontSize="22" textAnchor="middle">👩‍🏫</text>
        </g>

        {/* Teacher 2 — middle (larger) */}
        <g>
          <circle cx="840" cy="305" r="48" fill="rgba(124,58,237,0.04)" stroke="rgba(124,58,237,0.10)" strokeWidth="1" />
          <circle cx="840" cy="305" r="26" fill="rgba(124,58,237,0.08)" stroke="rgba(124,58,237,0.15)" strokeWidth="1" />
          <text x="840" y="312" fontSize="24" textAnchor="middle">👨‍🏫</text>
        </g>

        {/* Teacher 3 — bottom */}
        <g>
          <circle cx="790" cy="450" r="38" fill="rgba(37,99,235,0.05)" stroke="rgba(37,99,235,0.12)" strokeWidth="1" />
          <circle cx="790" cy="450" r="20" fill="rgba(37,99,235,0.10)" stroke="rgba(37,99,235,0.18)" strokeWidth="1" />
          <text x="790" y="457" fontSize="20" textAnchor="middle">👩‍🏫</text>
        </g>

        {/* ── Labels: Teachers ────────────────────────────────── */}
        <text x="900" y="290" fill="#6B7280" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">TEACHERS</text>
        <text x="900" y="310" fill="#374151" fontSize="14" fontWeight="700" fontFamily="Sora, sans-serif">Teacher Nodes</text>

        {/* ── Decorative circuit traces (background) ──────────── */}
        <g opacity="0.06" stroke="#2563EB" strokeWidth="1" fill="none">
          {/* Top-left circuit */}
          <path d="M 30 60 L 70 60 L 70 30" />
          <circle cx="70" cy="30" r="3" />
          <path d="M 50 80 L 50 100 L 90 100" />

          {/* Top-right circuit */}
          <path d="M 920 40 L 960 40 L 960 70" />
          <circle cx="960" cy="70" r="3" />
          <path d="M 940 55 L 940 80" />

          {/* Bottom-left */}
          <path d="M 40 540 L 40 560 L 80 560" />
          <circle cx="80" cy="560" r="3" />

          {/* Bottom-right */}
          <path d="M 930 530 L 930 560 L 965 560" />
          <circle cx="965" cy="560" r="3" />
          <path d="M 950 545 L 950 570" />
        </g>

        {/* ── Bottom bar ──────────────────────────────────────── */}
        <g>
          <circle cx="90" cy="590" r="5" fill="#2563EB" opacity="0.2" />
          <circle cx="90" cy="590" r="3" fill="#2563EB" opacity="0.5" />
          <text x="104" y="594" fill="#6B7280" fontSize="11" fontFamily="Inter, sans-serif">PDPA Compliant</text>

          <circle cx="830" cy="590" r="5" fill="#2563EB" opacity="0.2" />
          <circle cx="830" cy="590" r="3" fill="#2563EB" opacity="0.5" />
          <text x="844" y="594" fill="#6B7280" fontSize="11" fontFamily="Inter, sans-serif">Secure &amp; Anonymous Routing</text>
        </g>
      </svg>

      {/* ── Animated message bubbles (HTML overlay) ──────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bubble}
          initial={{ opacity: 0, scale: 0.92, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -6 }}
          transition={{ duration: 0.35 }}
          className={`absolute z-10 bg-white rounded-xl shadow-lg border border-border/60 px-3 py-2.5 max-w-[200px] ${
            b.side === "parent"
              ? "top-[22%] left-[30%]"
              : "bottom-[28%] left-[33%]"
          }`}
        >
          <p className={`text-[11px] font-semibold ${b.color} mb-0.5`}>{b.label}</p>
          <p className="text-[11px] text-ink leading-snug">{b.text}</p>
          {/* Bubble tail */}
          <div
            className={`absolute w-2.5 h-2.5 bg-white border-border/60 rotate-45 ${
              b.side === "parent"
                ? "bottom-[-5px] left-6 border-r border-b"
                : "top-[-5px] left-6 border-l border-t"
            }`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
