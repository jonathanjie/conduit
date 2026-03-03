"use client";
import { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ── Layout (normalised 0–1) ────────────────────────────────────────────────
// Parents in 3 clusters of 3, gently scattered on the left arc
const PARENT_NODES = [
  { x: 0.11, y: 0.11, group: 0 }, // cluster 0  → teacher 0
  { x: 0.14, y: 0.21, group: 0 },
  { x: 0.11, y: 0.31, group: 0 },
  { x: 0.13, y: 0.44, group: 1 }, // cluster 1  → teacher 1
  { x: 0.09, y: 0.54, group: 1 },
  { x: 0.13, y: 0.64, group: 1 },
  { x: 0.11, y: 0.73, group: 2 }, // cluster 2  → teacher 2
  { x: 0.14, y: 0.83, group: 2 },
  { x: 0.11, y: 0.91, group: 2 },
];
const TEACHER_NODES = [
  { x: 0.88, y: 0.22, group: 0 },
  { x: 0.88, y: 0.50, group: 1 },
  { x: 0.88, y: 0.78, group: 2 },
];
const CONDUIT = { x: 0.50, y: 0.50 };

// ── Colours ────────────────────────────────────────────────────────────────
const C = {
  bg:         "#060B18",
  parent:     "#F59E0B",
  parentGlow: "#FBBF24",
  teacher:    "#8B5CF6",
  teacherGlow:"#A78BFA",
  hub:        "#2563EB",
  hubGlow:    "#60A5FA",
  sigFwd:     "#FBBF24",  // parent → conduit
  sigMid:     "#60A5FA",  // conduit → teacher
  sigBack:    "#22D3EE",  // conduit → parent (reply)
  sigBackT:   "#C084FC",  // teacher → conduit (reply)
  edge:       "rgba(255,255,255,0.04)",
  edgeActive: "rgba(255,255,255,0.18)",
};

// ── Messages ───────────────────────────────────────────────────────────────
const P_MSGS = [
  "Emma's struggling with integration 😅",
  "Can we move Saturday's class?",
  "Marcus scored 87 — so happy! 🙏",
  "Is there homework this week?",
  "When are mock exams?",
  "Can I get last week's notes?",
  "Aiden missed class — please advise",
];
const T_MSGS = [
  "Thursday 4pm works!",
  "Great progress this term 😊",
  "Please review Chapter 7 tonight",
  "Results sent via dashboard",
  "See you Saturday! 📚",
];

// ── Types ──────────────────────────────────────────────────────────────────
interface Signal {
  id: number;
  parentIdx: number;
  phase: "p2c" | "c2t" | "t2c" | "c2p";
  progress: number;
  speed: number;
  trail: Array<{ x: number; y: number }>;
}
interface Bubble {
  id: number;
  nodeType: "parent" | "teacher";
  nodeIdx: number;
  message: string;
}

let _id = 0;
const uid = () => ++_id;

// Cubic bezier point
function cubicBezier(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number]
): [number, number] {
  const mt = 1 - t;
  return [
    mt ** 3 * p0[0] + 3 * mt ** 2 * t * p1[0] + 3 * mt * t ** 2 * p2[0] + t ** 3 * p3[0],
    mt ** 3 * p0[1] + 3 * mt ** 2 * t * p1[1] + 3 * mt * t ** 2 * p2[1] + t ** 3 * p3[1],
  ];
}

// Precompute bezier control points (normalised)
function parentToConduitCPs(pn: { x: number; y: number }) {
  const cx = CONDUIT.x, cy = CONDUIT.y;
  return {
    p0: [pn.x, pn.y] as [number, number],
    p1: [pn.x + 0.22, pn.y] as [number, number],
    p2: [cx - 0.14, cy] as [number, number],
    p3: [cx, cy] as [number, number],
  };
}
function conduitToTeacherCPs(tn: { x: number; y: number }) {
  const cx = CONDUIT.x, cy = CONDUIT.y;
  return {
    p0: [cx, cy] as [number, number],
    p1: [cx + 0.14, cy] as [number, number],
    p2: [tn.x - 0.22, tn.y] as [number, number],
    p3: [tn.x, tn.y] as [number, number],
  };
}

// ── Draw helpers ────────────────────────────────────────────────────────────
function drawGlowCircle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  r: number, color: string, glowColor: string, glowSize: number, alpha: number
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = glowSize;
  ctx.shadowColor = glowColor;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawBezierEdge(
  ctx: CanvasRenderingContext2D,
  p0: [number,number], p1: [number,number], p2: [number,number], p3: [number,number],
  W: number, H: number, color: string, alpha: number, lineWidth = 1
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(p0[0] * W, p0[1] * H);
  ctx.bezierCurveTo(
    p1[0] * W, p1[1] * H,
    p2[0] * W, p2[1] * H,
    p3[0] * W, p3[1] * H
  );
  ctx.stroke();
  ctx.restore();
}

export default function NetworkGraph({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "background";
  className?: string;
}) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const signalsRef   = useRef<Signal[]>([]);
  const rafRef       = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const lastBubbleRef= useRef<number>(0);
  const timeRef      = useRef<number>(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const isFull = variant === "full";

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    let W = 0, H = 0;

    const resize = () => {
      const r = container.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Precompute all bezier CPs for all parent and teacher edges
    const parentCPs = PARENT_NODES.map(parentToConduitCPs);
    const teacherCPs = TEACHER_NODES.map(conduitToTeacherCPs);

    const draw = (ts: number) => {
      if (W === 0 || H === 0) { rafRef.current = requestAnimationFrame(draw); return; }
      const dt = ts - timeRef.current;
      timeRef.current = ts;

      ctx.clearRect(0, 0, W, H);

      // ── Background ──────────────────────────────────────────────────
      if (isFull) {
        ctx.fillStyle = C.bg;
        ctx.fillRect(0, 0, W, H);
        // Subtle radial glow at conduit centre
        const grad = ctx.createRadialGradient(
          CONDUIT.x * W, CONDUIT.y * H, 0,
          CONDUIT.x * W, CONDUIT.y * H, W * 0.35
        );
        grad.addColorStop(0, "rgba(37,99,235,0.08)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      const baseAlpha = isFull ? 1 : 0.07;

      // ── Draw edges (bezier) ──────────────────────────────────────────
      PARENT_NODES.forEach((_, i) => {
        const { p0, p1, p2, p3 } = parentCPs[i];
        drawBezierEdge(ctx, p0, p1, p2, p3, W, H, C.edge, baseAlpha * 0.8);
      });
      TEACHER_NODES.forEach((_, i) => {
        const { p0, p1, p2, p3 } = teacherCPs[i];
        drawBezierEdge(ctx, p0, p1, p2, p3, W, H, C.edge, baseAlpha * 0.8);
      });

      // ── Conduit hub (concentric rings) ───────────────────────────────
      if (isFull) {
        const hx = CONDUIT.x * W, hy = CONDUIT.y * H;
        const t  = ts / 1000;

        // Outermost ring — slow pulse
        const outerAlpha = 0.12 + 0.06 * Math.sin(t * 0.7);
        ctx.save();
        ctx.globalAlpha = outerAlpha;
        ctx.strokeStyle = C.hubGlow;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(hx, hy, 48, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Middle ring — slow rotate, dashed
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = C.hubGlow;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 8]);
        ctx.lineDashOffset = -t * 18;
        ctx.translate(hx, hy);
        ctx.rotate(t * 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, 34, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Inner ring — counter-rotate
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = C.hub;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = t * 24;
        ctx.translate(hx, hy);
        ctx.rotate(-t * 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Core filled circle
        drawGlowCircle(ctx, hx, hy, 14, C.hub, C.hubGlow, 28, 1);
        // White dot centre
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(hx, hy, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.restore();
        // Label below
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.font = "600 11px Inter, sans-serif";
        ctx.fillStyle = C.hubGlow;
        ctx.textAlign = "center";
        ctx.fillText("Conduit", hx, hy + 30);
        ctx.restore();
      } else {
        // Background variant: just a faint circle
        const hx = CONDUIT.x * W, hy = CONDUIT.y * H;
        drawGlowCircle(ctx, hx, hy, 10, C.hub, C.hubGlow, 0, 0.06);
      }

      // ── Parent nodes ─────────────────────────────────────────────────
      PARENT_NODES.forEach((p, i) => {
        const px = p.x * W, py = p.y * H;
        const phase = (ts / 2200 + i * 0.4) % (Math.PI * 2);
        const pulseR = isFull ? 17 + Math.sin(phase) * 3 : 10;

        if (isFull) {
          // Outer pulse ring
          ctx.save();
          ctx.globalAlpha = 0.08 + 0.04 * Math.sin(phase);
          ctx.beginPath();
          ctx.arc(px, py, pulseR, 0, Math.PI * 2);
          ctx.fillStyle = C.parent;
          ctx.fill();
          ctx.restore();
          // Mid ring
          drawGlowCircle(ctx, px, py, 10, C.parent + "44", C.parentGlow, 10, 0.5);
          // Core
          drawGlowCircle(ctx, px, py, 6,  C.parent, C.parentGlow, 14, 1);
          // Label
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.font = "500 9px Inter, sans-serif";
          ctx.fillStyle = "#94A3B8";
          ctx.textAlign = "left";
          ctx.fillText(`P${i + 1}`, px + 10, py + 3.5);
          ctx.restore();
        } else {
          drawGlowCircle(ctx, px, py, 4, C.parent, C.parent, 0, 0.06);
        }
      });

      // ── Teacher nodes ─────────────────────────────────────────────────
      TEACHER_NODES.forEach((t, i) => {
        const tx = t.x * W, ty = t.y * H;
        const phase = (ts / 2800 + i * 0.8) % (Math.PI * 2);
        const pulseR = isFull ? 20 + Math.sin(phase) * 3 : 12;

        if (isFull) {
          ctx.save();
          ctx.globalAlpha = 0.07 + 0.04 * Math.sin(phase);
          ctx.beginPath();
          ctx.arc(tx, ty, pulseR, 0, Math.PI * 2);
          ctx.fillStyle = C.teacher;
          ctx.fill();
          ctx.restore();
          drawGlowCircle(ctx, tx, ty, 12, C.teacher + "55", C.teacherGlow, 12, 0.5);
          drawGlowCircle(ctx, tx, ty, 7,  C.teacher,       C.teacherGlow, 18, 1);
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.font = "500 9px Inter, sans-serif";
          ctx.fillStyle = "#94A3B8";
          ctx.textAlign = "right";
          ctx.fillText(`T${i + 1}`, tx - 12, ty + 3.5);
          ctx.restore();
        } else {
          drawGlowCircle(ctx, tx, ty, 5, C.teacher, C.teacher, 0, 0.07);
        }
      });

      // ── Spawn signals ─────────────────────────────────────────────────
      const spawnMs = isFull ? 650 : 1100;
      if (ts - lastSpawnRef.current > spawnMs && signalsRef.current.length < 20) {
        lastSpawnRef.current = ts;
        const parentIdx = Math.floor(Math.random() * 9);
        const isReply = Math.random() < 0.28;
        signalsRef.current.push({
          id: uid(),
          parentIdx,
          phase: isReply ? "t2c" : "p2c",
          progress: 0,
          speed: 0.0035 + Math.random() * 0.0025,
          trail: [],
        });
      }

      // ── Spawn bubbles ─────────────────────────────────────────────────
      if (isFull && ts - lastBubbleRef.current > 2800) {
        lastBubbleRef.current = ts;
        const isParent = Math.random() > 0.35;
        const b: Bubble = {
          id: uid(),
          nodeType: isParent ? "parent" : "teacher",
          nodeIdx: isParent
            ? Math.floor(Math.random() * 9)
            : Math.floor(Math.random() * 3),
          message: isParent
            ? P_MSGS[Math.floor(Math.random() * P_MSGS.length)]
            : T_MSGS[Math.floor(Math.random() * T_MSGS.length)],
        };
        setBubbles(prev => [...prev.slice(-1), b]);
        setTimeout(() => setBubbles(prev => prev.filter(x => x.id !== b.id)), 3400);
      }

      // ── Update & draw signals ─────────────────────────────────────────
      signalsRef.current = signalsRef.current.filter(sig => {
        sig.progress += sig.speed;

        if (sig.progress >= 1) {
          // Phase transition
          if (sig.phase === "p2c") { sig.phase = "c2t"; sig.progress = 0; sig.trail = []; return true; }
          if (sig.phase === "t2c") { sig.phase = "c2p"; sig.progress = 0; sig.trail = []; return true; }
          return false; // done
        }

        const pn = PARENT_NODES[sig.parentIdx];
        const tn = TEACHER_NODES[pn.group];
        let pos: [number, number];
        let color: string;

        if (sig.phase === "p2c") {
          const { p0, p1, p2, p3 } = parentCPs[sig.parentIdx];
          const np = cubicBezier(sig.progress, p0, p1, p2, p3);
          pos = [np[0] * W, np[1] * H];
          color = C.sigFwd;
        } else if (sig.phase === "c2t") {
          const { p0, p1, p2, p3 } = teacherCPs[tn.group];
          const np = cubicBezier(sig.progress, p0, p1, p2, p3);
          pos = [np[0] * W, np[1] * H];
          color = C.sigMid;
        } else if (sig.phase === "t2c") {
          const { p0, p1, p2, p3 } = teacherCPs[tn.group];
          const np = cubicBezier(1 - sig.progress, p0, p1, p2, p3);
          pos = [np[0] * W, np[1] * H];
          color = C.sigBackT;
        } else {
          // c2p
          const { p0, p1, p2, p3 } = parentCPs[sig.parentIdx];
          const np = cubicBezier(1 - sig.progress, p0, p1, p2, p3);
          pos = [np[0] * W, np[1] * H];
          color = C.sigBack;
        }

        // Update trail
        sig.trail.push({ x: pos[0], y: pos[1] });
        if (sig.trail.length > 7) sig.trail.shift();

        // Draw trail
        if (sig.trail.length > 1) {
          for (let k = 0; k < sig.trail.length - 1; k++) {
            const a = (k / sig.trail.length) * (isFull ? 0.5 : 0.3);
            ctx.save();
            ctx.globalAlpha = a;
            ctx.strokeStyle = color;
            ctx.lineWidth = isFull ? 2.5 : 1.5;
            ctx.lineCap = "round";
            ctx.shadowBlur = isFull ? 8 : 0;
            ctx.shadowColor = color;
            ctx.beginPath();
            ctx.moveTo(sig.trail[k].x, sig.trail[k].y);
            ctx.lineTo(sig.trail[k + 1].x, sig.trail[k + 1].y);
            ctx.stroke();
            ctx.restore();
          }
        }

        // Signal head
        const alpha = isFull ? 1 : 0.25;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = isFull ? 22 : 0;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], isFull ? 4.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.shadowBlur = isFull ? 8 : 0;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], isFull ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();

        return true;
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [isFull]);

  // Bubble screen position
  const getBubblePos = (b: Bubble) => {
    if (!containerRef.current) return { top: 0, left: 0 };
    const { width: W, height: H } = containerRef.current.getBoundingClientRect();
    if (b.nodeType === "parent") {
      const p = PARENT_NODES[b.nodeIdx];
      return { top: p.y * H - 20, left: p.x * W + 22 };
    }
    const t = TEACHER_NODES[b.nodeIdx];
    return { top: t.y * H - 20, left: t.x * W - 210 };
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0" />

      {isFull && (
        <AnimatePresence>
          {bubbles.map(b => {
            const pos = getBubblePos(b);
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.88, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: -8 }}
                transition={{ duration: 0.22 }}
                className="absolute z-10 pointer-events-none"
                style={{ top: pos.top, left: pos.left }}
              >
                <div
                  className={`px-3 py-2 rounded-xl text-xs font-medium max-w-[200px] leading-snug border ${
                    b.nodeType === "parent"
                      ? "border-amber-500/30 text-amber-200"
                      : "border-violet-500/30 text-violet-200"
                  }`}
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  {b.message}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}
