"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ── Layout (normalised 0-1) ──────────────────────────────────────────────────
const PARENT_NODES = [
  { x: 0.12, y: 0.10 },
  { x: 0.12, y: 0.22 },
  { x: 0.12, y: 0.34 },
  { x: 0.12, y: 0.46 },
  { x: 0.12, y: 0.58 },
  { x: 0.12, y: 0.70 },
  { x: 0.12, y: 0.82 },
  { x: 0.12, y: 0.90 },
  { x: 0.12, y: 0.98 },
];
const TEACHER_NODES = [
  { x: 0.88, y: 0.25 },
  { x: 0.88, y: 0.50 },
  { x: 0.88, y: 0.75 },
];
const CONDUIT_NODE = { x: 0.50, y: 0.50 };

// parent i belongs to teacher Math.floor(i / 3)
const parentTeacher = (i: number) => Math.floor(i / 3);

// ── Sample messages ──────────────────────────────────────────────────────────
const PARENT_MSGS = [
  "Emma struggled with integration today",
  "Can we move Saturday's class?",
  "Thank you so much! 🙏",
  "Is there homework this week?",
  "When are mock exams?",
  "Marcus scored 87 — he's so happy!",
  "Can I get last week's notes?",
  "Aiden missed class, please advise",
  "Is the fee due this Friday?",
];
const TEACHER_MSGS = [
  "Thursday 4pm works!",
  "Great progress this term 😊",
  "Please review Chapter 7 tonight",
  "Assessment results sent via dashboard",
  "Noted — will cover it next session",
  "See you Saturday! 📚",
];

// ── Types ────────────────────────────────────────────────────────────────────
interface Signal {
  id: number;
  parentIdx: number;
  phase: "p2c" | "c2t" | "c2p_reply" | "t2c_reply";
  progress: number;
  speed: number;
  isReply: boolean;
}

interface Bubble {
  id: number;
  nodeType: "parent" | "teacher";
  nodeIdx: number;
  message: string;
}

// ── Colours ──────────────────────────────────────────────────────────────────
const COL_PARENT = "#F59E0B";   // amber
const COL_CONDUIT = "#2563EB";  // primary blue
const COL_TEACHER = "#7C3AED"; // purple
const COL_EDGE = "rgba(37,99,235,0.12)";
const COL_EDGE_REPLY = "rgba(124,58,237,0.10)";

let _id = 0;
const uid = () => ++_id;

export default function NetworkGraph({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "background";
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const signalsRef = useRef<Signal[]>([]);
  const rafRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const lastBubbleRef = useRef<number>(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const isFull = variant === "full";

  // Convert normalised coords to canvas px
  const toC = useCallback(
    (nx: number, ny: number, w: number, h: number): [number, number] => [
      nx * w,
      ny * h,
    ],
    []
  );

  // Draw a glowing dot at canvas position
  const drawSignal = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      color: string,
      alpha: number
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 16;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(x, y, isFull ? 4 : 3, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      // Inner colour dot
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(x, y, isFull ? 2.5 : 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    },
    [isFull]
  );

  // Draw a node circle
  const drawNode = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      r: number,
      fill: string,
      alpha: number,
      label?: string
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      // Glow
      ctx.shadowBlur = 12;
      ctx.shadowColor = fill;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      // Inner white ring
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fill();
      ctx.restore();

      if (label && isFull) {
        ctx.save();
        ctx.globalAlpha = alpha * 0.8;
        ctx.font = "500 11px Inter, sans-serif";
        ctx.fillStyle = "#374151";
        ctx.textAlign = "center";
        ctx.fillText(label, x, y + r + 14);
        ctx.restore();
      }
    },
    [isFull]
  );

  // Draw Conduit centre node (rounded rect)
  const drawConduit = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number) => {
      const w = isFull ? 90 : 60;
      const h = isFull ? 36 : 24;
      const r = 8;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 20;
      ctx.shadowColor = COL_CONDUIT;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y - h / 2, w, h, r);
      ctx.fillStyle = COL_CONDUIT;
      ctx.fill();
      ctx.shadowBlur = 0;
      if (isFull) {
        ctx.font = "700 12px Inter, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Conduit", x, y);
      }
      ctx.restore();
    },
    [isFull]
  );

  // Main draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    let W = 0;
    let H = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const alpha = isFull ? 1 : 0.18;

    const draw = (ts: number) => {
      if (W === 0 || H === 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, W, H);

      const cx = CONDUIT_NODE.x * W;
      const cy = CONDUIT_NODE.y * H;

      // ── Draw edges ──────────────────────────────────────────────────────
      PARENT_NODES.forEach((p) => {
        const [px, py] = toC(p.x, p.y, W, H);
        ctx.save();
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = COL_EDGE;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.restore();
      });

      TEACHER_NODES.forEach((t) => {
        const [tx, ty] = toC(t.x, t.y, W, H);
        ctx.save();
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = COL_EDGE_REPLY;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.restore();
      });

      // ── Spawn new signals ─────────────────────────────────────────────
      const spawnInterval = isFull ? 700 : 900;
      if (ts - lastSpawnRef.current > spawnInterval && signalsRef.current.length < 18) {
        lastSpawnRef.current = ts;
        const parentIdx = Math.floor(Math.random() * 9);
        const isReply = Math.random() < 0.3;
        signalsRef.current.push({
          id: uid(),
          parentIdx,
          phase: isReply ? "t2c_reply" : "p2c",
          progress: 0,
          speed: 0.004 + Math.random() * 0.003,
          isReply,
        });
      }

      // ── Spawn message bubbles (full variant) ───────────────────────────
      if (isFull && ts - lastBubbleRef.current > 2500) {
        lastBubbleRef.current = ts;
        const isParent = Math.random() > 0.4;
        const newBubble: Bubble = {
          id: uid(),
          nodeType: isParent ? "parent" : "teacher",
          nodeIdx: isParent
            ? Math.floor(Math.random() * 9)
            : Math.floor(Math.random() * 3),
          message: isParent
            ? PARENT_MSGS[Math.floor(Math.random() * PARENT_MSGS.length)]
            : TEACHER_MSGS[Math.floor(Math.random() * TEACHER_MSGS.length)],
        };
        setBubbles((prev) => {
          // max 2 bubbles at a time
          const next = [...prev.slice(-1), newBubble];
          return next;
        });
        setTimeout(
          () =>
            setBubbles((prev) => prev.filter((b) => b.id !== newBubble.id)),
          3200
        );
      }

      // ── Update & draw signals ──────────────────────────────────────────
      signalsRef.current = signalsRef.current.filter((sig) => {
        sig.progress += sig.speed;
        if (sig.progress >= 1) {
          // Phase transition
          if (sig.phase === "p2c") {
            sig.phase = "c2t";
            sig.progress = 0;
            return true;
          } else if (sig.phase === "t2c_reply") {
            sig.phase = "c2p_reply";
            sig.progress = 0;
            return true;
          }
          return false; // done
        }

        const p = PARENT_NODES[sig.parentIdx];
        const t = TEACHER_NODES[parentTeacher(sig.parentIdx)];
        const [px, py] = toC(p.x, p.y, W, H);
        const [tx, ty] = toC(t.x, t.y, W, H);

        let x: number, y: number, color: string;

        if (sig.phase === "p2c") {
          x = lerp(px, cx, sig.progress);
          y = lerp(py, cy, sig.progress);
          color = COL_PARENT;
        } else if (sig.phase === "c2t") {
          x = lerp(cx, tx, sig.progress);
          y = lerp(cy, ty, sig.progress);
          color = COL_CONDUIT;
        } else if (sig.phase === "t2c_reply") {
          x = lerp(tx, cx, sig.progress);
          y = lerp(ty, cy, sig.progress);
          color = COL_TEACHER;
        } else {
          // c2p_reply
          x = lerp(cx, px, sig.progress);
          y = lerp(cy, py, sig.progress);
          color = COL_CONDUIT;
        }

        drawSignal(ctx, x, y, color, alpha);
        return true;
      });

      // ── Draw nodes ────────────────────────────────────────────────────
      PARENT_NODES.forEach((p, i) => {
        const [px, py] = toC(p.x, p.y, W, H);
        drawNode(
          ctx,
          px,
          py,
          isFull ? 9 : 6,
          COL_PARENT,
          alpha,
          isFull ? `P${i + 1}` : undefined
        );
      });

      TEACHER_NODES.forEach((t, i) => {
        const [tx, ty] = toC(t.x, t.y, W, H);
        drawNode(
          ctx,
          tx,
          ty,
          isFull ? 11 : 7,
          COL_TEACHER,
          alpha,
          isFull ? `T${i + 1}` : undefined
        );
      });

      drawConduit(ctx, cx, cy, alpha);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [isFull, toC, drawNode, drawSignal, drawConduit]);

  // Compute bubble screen position
  const getBubblePos = (b: Bubble, containerEl: HTMLDivElement | null) => {
    if (!containerEl) return { top: 0, left: 0 };
    const rect = containerEl.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    if (b.nodeType === "parent") {
      const p = PARENT_NODES[b.nodeIdx];
      return { top: p.y * H, left: p.x * W + 22 };
    } else {
      const t = TEACHER_NODES[b.nodeIdx];
      return { top: t.y * H, left: t.x * W - 220 };
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Message bubbles */}
      {isFull && (
        <AnimatePresence>
          {bubbles.map((b) => {
            const pos = getBubblePos(b, containerRef.current);
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.85, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -6 }}
                transition={{ duration: 0.25 }}
                className="absolute z-10 pointer-events-none"
                style={{ top: pos.top - 18, left: pos.left }}
              >
                <div
                  className={`px-3 py-2 rounded-xl text-xs font-medium shadow-md max-w-[190px] leading-snug border ${
                    b.nodeType === "parent"
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-violet-50 border-violet-200 text-violet-900"
                  }`}
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
