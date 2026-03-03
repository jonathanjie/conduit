"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Message bubble content ─────────────────────────────────────────────── */

const PARENT_BUBBLES = [
  "Hi Mrs. Lee, question about Class A homework?",
  "Will there be extra revision before exams?",
  "Can Emma switch to the Tuesday class?",
];
const TEACHER_BUBBLES = [
  "Hi parents! Updated schedule is posted.",
  "Great progress this week, Emma!",
  "Reminder: test on Friday. Please revise Chapter 4.",
];

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function RelayDiagram({ className }: { className?: string }) {
  // "out" = parent → hub → teacher (right-moving, amber dots)
  // "in"  = teacher → hub → parent (left-moving, violet dots = teacher reply)
  const [phase, setPhase] = useState<"out" | "in">("out");
  const [parentIdx, setParentIdx]   = useState(0);
  const [teacherIdx, setTeacherIdx] = useState(0);
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
    // Alternate phases. Randomise dwell time per phase (2.2–3.2 s).
    let active = true;
    const tick = () => {
      if (!active) return;
      const dwell = 2200 + Math.random() * 1000;
      const t = setTimeout(() => {
        setPhase((p) => {
          if (p === "out") {
            setTeacherIdx((i) => (i + 1) % TEACHER_BUBBLES.length);
            return "in";
          } else {
            setParentIdx((i) => (i + 1) % PARENT_BUBBLES.length);
            return "out";
          }
        });
        tick();
      }, dwell);
      return t;
    };
    const t = tick();
    return () => { active = false; clearTimeout(t); };
  }, [reducedMotion]);

  const isOut = phase === "out";

  return (
    <div className={`relative ${className ?? ""}`} aria-hidden="true">
      <svg
        viewBox="0 0 1000 620"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Tech grid */}
          <pattern id="rd-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="0.6" fill="rgba(37,99,235,0.07)" />
            <line x1="0" y1="20" x2="40" y2="20" stroke="rgba(37,99,235,0.025)" strokeWidth="0.5" />
            <line x1="20" y1="0" x2="20" y2="40" stroke="rgba(37,99,235,0.025)" strokeWidth="0.5" />
          </pattern>

          {/* Arrow markers — forward and reverse */}
          <marker id="rd-arrow-fwd" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 2 2 L 10 6 L 2 10 z" fill="rgba(245,158,11,0.45)" />
          </marker>
          <marker id="rd-arrow-rev" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 2 2 L 10 6 L 2 10 z" fill="rgba(124,58,237,0.35)" />
          </marker>

          {/* Hub gradient */}
          <linearGradient id="rd-hub-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8FAFF" />
            <stop offset="100%" stopColor="#EFF6FF" />
          </linearGradient>

          {/* Hub icon glow */}
          <filter id="rd-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* ── Paths ── */}
          <path id="rd-p1h"  d="M 230 195 C 330 195, 380 270, 435 300" />
          <path id="rd-p2h"  d="M 215 425 C 320 425, 380 350, 435 310" />
          <path id="rd-ht1"  d="M 575 255 C 650 210, 710 170, 775 160" />
          <path id="rd-ht2"  d="M 575 300 C 660 300, 730 305, 810 305" />
          <path id="rd-ht3"  d="M 575 345 C 650 395, 710 440, 770 450" />
        </defs>

        {/* ── Background ──────────────────────────────────────── */}
        <rect width="1000" height="620" fill="url(#rd-grid)" rx="24" />

        {/* ── Paths: forward (parent→hub→teacher) ─────────────── */}
        <g opacity={isOut ? 1 : 0.35} style={{ transition: "opacity 0.6s" }}>
          <use href="#rd-p1h" fill="none" stroke="rgba(245,158,11,0.22)" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#rd-arrow-fwd)" />
          <use href="#rd-p2h" fill="none" stroke="rgba(245,158,11,0.22)" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#rd-arrow-fwd)" />
          <use href="#rd-ht1" fill="none" stroke="rgba(37,99,235,0.18)" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#rd-arrow-fwd)" />
          <use href="#rd-ht2" fill="none" stroke="rgba(37,99,235,0.18)" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#rd-arrow-fwd)" />
          <use href="#rd-ht3" fill="none" stroke="rgba(37,99,235,0.18)" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#rd-arrow-fwd)" />
        </g>

        {/* ── Paths: reverse (teacher→hub→parent) ─────────────── */}
        <g opacity={isOut ? 0.35 : 1} style={{ transition: "opacity 0.6s" }}>
          <use href="#rd-p1h" fill="none" stroke="rgba(124,58,237,0.18)" strokeWidth="2" strokeDasharray="6 4" markerStart="url(#rd-arrow-rev)" />
          <use href="#rd-p2h" fill="none" stroke="rgba(124,58,237,0.18)" strokeWidth="2" strokeDasharray="6 4" markerStart="url(#rd-arrow-rev)" />
          <use href="#rd-ht1" fill="none" stroke="rgba(124,58,237,0.18)" strokeWidth="2" strokeDasharray="6 4" markerStart="url(#rd-arrow-rev)" />
          <use href="#rd-ht2" fill="none" stroke="rgba(124,58,237,0.18)" strokeWidth="2" strokeDasharray="6 4" markerStart="url(#rd-arrow-rev)" />
          <use href="#rd-ht3" fill="none" stroke="rgba(124,58,237,0.18)" strokeWidth="2" strokeDasharray="6 4" markerStart="url(#rd-arrow-rev)" />
        </g>

        {/* ── Particles ───────────────────────────────────────── */}
        {!reducedMotion && (
          <g>
            {/* ── OUTGOING: parent → hub (amber) ── */}
            <circle r="4.5" fill="#F59E0B" opacity="0.75">
              <animateMotion dur="2.4s" repeatCount="indefinite" begin="0s" calcMode="linear"><mpath href="#rd-p1h" /></animateMotion>
            </circle>
            <circle r="3.5" fill="#F59E0B" opacity="0.55">
              <animateMotion dur="3.1s" repeatCount="indefinite" begin="1.1s" calcMode="linear"><mpath href="#rd-p1h" /></animateMotion>
            </circle>
            <circle r="4" fill="#F59E0B" opacity="0.65">
              <animateMotion dur="2.7s" repeatCount="indefinite" begin="0.5s" calcMode="linear"><mpath href="#rd-p2h" /></animateMotion>
            </circle>
            <circle r="3.5" fill="#F59E0B" opacity="0.50">
              <animateMotion dur="3.3s" repeatCount="indefinite" begin="1.8s" calcMode="linear"><mpath href="#rd-p2h" /></animateMotion>
            </circle>

            {/* ── OUTGOING: hub → teacher (blue) ── */}
            <circle r="4" fill="#2563EB" opacity="0.65">
              <animateMotion dur="2.2s" repeatCount="indefinite" begin="0.3s" calcMode="linear"><mpath href="#rd-ht1" /></animateMotion>
            </circle>
            <circle r="3.5" fill="#2563EB" opacity="0.50">
              <animateMotion dur="2.9s" repeatCount="indefinite" begin="1.5s" calcMode="linear"><mpath href="#rd-ht1" /></animateMotion>
            </circle>
            <circle r="4.5" fill="#2563EB" opacity="0.65">
              <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.9s" calcMode="linear"><mpath href="#rd-ht2" /></animateMotion>
            </circle>
            <circle r="3.5" fill="#7C3AED" opacity="0.55">
              <animateMotion dur="3.0s" repeatCount="indefinite" begin="0.6s" calcMode="linear"><mpath href="#rd-ht3" /></animateMotion>
            </circle>

            {/* ── RETURN: teacher → hub (violet) ── */}
            <circle r="4.5" fill="#7C3AED" opacity="0.70">
              <animateMotion dur="2.3s" repeatCount="indefinite" begin="0.4s" calcMode="linear" keyPoints="1;0" keyTimes="0;1"><mpath href="#rd-ht1" /></animateMotion>
            </circle>
            <circle r="3.5" fill="#7C3AED" opacity="0.50">
              <animateMotion dur="3.0s" repeatCount="indefinite" begin="1.7s" calcMode="linear" keyPoints="1;0" keyTimes="0;1"><mpath href="#rd-ht1" /></animateMotion>
            </circle>
            <circle r="4" fill="#7C3AED" opacity="0.65">
              <animateMotion dur="2.6s" repeatCount="indefinite" begin="0.2s" calcMode="linear" keyPoints="1;0" keyTimes="0;1"><mpath href="#rd-ht2" /></animateMotion>
            </circle>
            <circle r="3.5" fill="#7C3AED" opacity="0.55">
              <animateMotion dur="2.8s" repeatCount="indefinite" begin="1.3s" calcMode="linear" keyPoints="1;0" keyTimes="0;1"><mpath href="#rd-ht3" /></animateMotion>
            </circle>

            {/* ── RETURN: hub → parent (blue) ── */}
            <circle r="4" fill="#2563EB" opacity="0.60">
              <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.7s" calcMode="linear" keyPoints="1;0" keyTimes="0;1"><mpath href="#rd-p1h" /></animateMotion>
            </circle>
            <circle r="3.5" fill="#2563EB" opacity="0.45">
              <animateMotion dur="3.2s" repeatCount="indefinite" begin="2.0s" calcMode="linear" keyPoints="1;0" keyTimes="0;1"><mpath href="#rd-p1h" /></animateMotion>
            </circle>
            <circle r="4" fill="#2563EB" opacity="0.60">
              <animateMotion dur="2.8s" repeatCount="indefinite" begin="1.0s" calcMode="linear" keyPoints="1;0" keyTimes="0;1"><mpath href="#rd-p2h" /></animateMotion>
            </circle>
          </g>
        )}

        {/* ── Parent clusters ──────────────────────────────────── */}
        <g>
          <circle cx="150" cy="175" r="50" fill="rgba(37,99,235,0.05)" stroke="rgba(37,99,235,0.10)" strokeWidth="1" />
          <circle cx="200" cy="195" r="40" fill="rgba(37,99,235,0.07)" stroke="rgba(37,99,235,0.13)" strokeWidth="1" />
          <circle cx="170" cy="215" r="34" fill="rgba(245,158,11,0.05)" stroke="rgba(245,158,11,0.10)" strokeWidth="1" />
          <circle cx="130" cy="200" r="28" fill="rgba(37,99,235,0.04)" stroke="rgba(37,99,235,0.08)" strokeWidth="1" />
          <g transform="translate(192,155)" fill="#2563EB" opacity="0.80"><circle cy="-8" r="6"/><path d="M-8,3 C-8,-4 8,-4 8,3"/></g>
          <g transform="translate(145,175)" fill="#2563EB" opacity="0.70"><circle cy="-7" r="5"/><path d="M-7,2 C-7,-4 7,-4 7,2"/></g>
          <g transform="translate(175,228)" fill="#2563EB" opacity="0.65"><circle cy="-6" r="4.5"/><path d="M-6,2 C-6,-3 6,-3 6,2"/></g>
        </g>
        <g>
          <circle cx="135" cy="405" r="45" fill="rgba(37,99,235,0.05)" stroke="rgba(37,99,235,0.10)" strokeWidth="1" />
          <circle cx="185" cy="425" r="38" fill="rgba(245,158,11,0.05)" stroke="rgba(245,158,11,0.10)" strokeWidth="1" />
          <circle cx="155" cy="445" r="30" fill="rgba(37,99,235,0.06)" stroke="rgba(37,99,235,0.12)" strokeWidth="1" />
          <circle cx="200" cy="395" r="26" fill="rgba(37,99,235,0.04)" stroke="rgba(37,99,235,0.08)" strokeWidth="1" />
          <g transform="translate(130,402)" fill="#2563EB" opacity="0.75"><circle cy="-7" r="5.5"/><path d="M-7,3 C-7,-4 7,-4 7,3"/></g>
          <g transform="translate(185,424)" fill="#2563EB" opacity="0.70"><circle cy="-7" r="5"/><path d="M-7,2 C-7,-4 7,-4 7,2"/></g>
          <g transform="translate(200,394)" fill="#2563EB" opacity="0.65"><circle cy="-5" r="4"/><path d="M-5,2 C-5,-3 5,-3 5,2"/></g>
        </g>


        {/* ── Conduit Hub ──────────────────────────────────────── */}
        <g>
          <rect x="443" y="168" width="124" height="274" rx="18" fill="rgba(37,99,235,0.04)" />
          <rect x="440" y="165" width="124" height="274" rx="18" fill="url(#rd-hub-grad)" stroke="rgba(37,99,235,0.18)" strokeWidth="1.5" />
          <circle cx="502" cy="205" r="22" fill="#2563EB" filter="url(#rd-glow)" />
          <g transform="translate(502,205)" fill="white">
            <path d="M-7,-3 L0,-8 L7,-3 M-7,3 L0,8 L7,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle r="2.5" />
          </g>
          <text x="502" y="270" textAnchor="middle" fill="#1E1B4B" fontSize="13" fontWeight="800" fontFamily="Sora, sans-serif" letterSpacing="0.08em">CONDUIT</text>
          <text x="502" y="292" textAnchor="middle" fill="#1E1B4B" fontSize="13" fontWeight="800" fontFamily="Sora, sans-serif" letterSpacing="0.08em">ROUTING</text>
          <text x="502" y="314" textAnchor="middle" fill="#1E1B4B" fontSize="13" fontWeight="800" fontFamily="Sora, sans-serif" letterSpacing="0.08em">HUB</text>
          <circle cx="440" cy="250" r="3" fill="#2563EB" opacity="0.3" />
          <circle cx="440" cy="300" r="3" fill="#2563EB" opacity="0.3" />
          <circle cx="440" cy="350" r="3" fill="#2563EB" opacity="0.3" />
          <circle cx="564" cy="250" r="3" fill="#2563EB" opacity="0.3" />
          <circle cx="564" cy="300" r="3" fill="#2563EB" opacity="0.3" />
          <circle cx="564" cy="350" r="3" fill="#2563EB" opacity="0.3" />
        </g>

        {/* ── Teacher nodes ────────────────────────────────────── */}
        <g>
          <circle cx="800" cy="160" r="42" fill="rgba(37,99,235,0.05)" stroke="rgba(37,99,235,0.12)" strokeWidth="1" />
          <circle cx="800" cy="160" r="22" fill="rgba(37,99,235,0.10)" stroke="rgba(37,99,235,0.18)" strokeWidth="1" />
          <g transform="translate(800,158)" fill="#7C3AED" opacity="0.80"><circle cy="-8" r="6"/><path d="M-8,3 C-8,-4 8,-4 8,3"/></g>
        </g>
        <g>
          <circle cx="840" cy="305" r="48" fill="rgba(124,58,237,0.04)" stroke="rgba(124,58,237,0.10)" strokeWidth="1" />
          <circle cx="840" cy="305" r="26" fill="rgba(124,58,237,0.08)" stroke="rgba(124,58,237,0.15)" strokeWidth="1" />
          <g transform="translate(840,302)" fill="#7C3AED" opacity="0.80"><circle cy="-9" r="7"/><path d="M-9,4 C-9,-5 9,-5 9,4"/></g>
        </g>
        <g>
          <circle cx="790" cy="450" r="38" fill="rgba(37,99,235,0.05)" stroke="rgba(37,99,235,0.12)" strokeWidth="1" />
          <circle cx="790" cy="450" r="20" fill="rgba(37,99,235,0.10)" stroke="rgba(37,99,235,0.18)" strokeWidth="1" />
          <g transform="translate(790,448)" fill="#7C3AED" opacity="0.75"><circle cy="-7" r="5.5"/><path d="M-7,3 C-7,-4 7,-4 7,3"/></g>
        </g>

        {/* ── Labels: Teachers ─────────────────────────────────── */}
        <text x="900" y="290" fill="#6B7280" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">TEACHERS</text>
        <text x="900" y="310" fill="#374151" fontSize="14" fontWeight="700" fontFamily="Sora, sans-serif">Teacher Nodes</text>

        {/* ── Decorative circuit traces ─────────────────────────── */}
        <g opacity="0.06" stroke="#2563EB" strokeWidth="1" fill="none">
          <path d="M 30 60 L 70 60 L 70 30" /><circle cx="70" cy="30" r="3" />
          <path d="M 50 80 L 50 100 L 90 100" />
          <path d="M 920 40 L 960 40 L 960 70" /><circle cx="960" cy="70" r="3" />
          <path d="M 940 55 L 940 80" />
          <path d="M 40 540 L 40 560 L 80 560" /><circle cx="80" cy="560" r="3" />
          <path d="M 930 530 L 930 560 L 965 560" /><circle cx="965" cy="560" r="3" />
        </g>

        {/* ── Bottom bar ───────────────────────────────────────── */}
        <g>
          <circle cx="90" cy="590" r="5" fill="#2563EB" opacity="0.2" />
          <circle cx="90" cy="590" r="3" fill="#2563EB" opacity="0.5" />
          <text x="104" y="594" fill="#6B7280" fontSize="11" fontFamily="Inter, sans-serif">PDPA Compliant</text>
          <circle cx="830" cy="590" r="5" fill="#2563EB" opacity="0.2" />
          <circle cx="830" cy="590" r="3" fill="#2563EB" opacity="0.5" />
          <text x="844" y="594" fill="#6B7280" fontSize="11" fontFamily="Inter, sans-serif">Secure &amp; Anonymous Routing</text>
        </g>
      </svg>

      {/* ── Message bubbles ────────────────────────────────────── */}
      {/* Parent bubble — left side, over outgoing (amber) dots */}
      <AnimatePresence>
        {isOut && (
          <motion.div
            key="parent-bubble"
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -6 }}
            transition={{ duration: 0.3 }}
            className="absolute z-10 bg-white rounded-xl shadow-lg border border-border/60 px-3 py-2.5 max-w-[190px]"
            style={{ top: "22%", left: "20%" }}
          >
            <p className="text-[11px] font-semibold text-amber-600 mb-0.5">Parent:</p>
            <p className="text-[11px] text-ink leading-snug">{PARENT_BUBBLES[parentIdx]}</p>
            <div className="absolute bottom-[-5px] left-5 w-2.5 h-2.5 bg-white border-r border-b border-border/60 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teacher bubble — right side, over returning (violet) dots */}
      <AnimatePresence>
        {!isOut && (
          <motion.div
            key="teacher-bubble"
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -6 }}
            transition={{ duration: 0.3 }}
            className="absolute z-10 bg-white rounded-xl shadow-lg border border-border/60 px-3 py-2.5 max-w-[190px]"
            style={{ top: "20%", right: "6%" }}
          >
            <p className="text-[11px] font-semibold text-primary mb-0.5">Teacher:</p>
            <p className="text-[11px] text-ink leading-snug">{TEACHER_BUBBLES[teacherIdx]}</p>
            <div className="absolute bottom-[-5px] right-5 w-2.5 h-2.5 bg-white border-r border-b border-border/60 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
