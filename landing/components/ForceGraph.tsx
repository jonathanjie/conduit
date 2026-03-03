"use client";
import { useEffect, useRef } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Node {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  radius: number;
  color: readonly [number, number, number];
  alpha: number;
  glow: boolean;          // draw soft shadow ring
  pulseOffset: number;
  pulseSpeed: number;     // multiplier for pulse
}

/* ─── Palette (Conduit brand) ───────────────────────────────────────────── */
const BLUE        = [37, 99, 235]  as const;  // #2563EB  primary
const BLUE_MID    = [59, 130, 246] as const;  // #3B82F6  slightly lighter
const BLUE_LIGHT  = [96, 165, 250] as const;  // #60A5FA
const BLUE_PALE   = [147, 197, 253] as const; // #93C5FD
const AMBER       = [245, 158, 11] as const;  // #F59E0B  accent
const VIOLET      = [124, 58, 237] as const;  // #7C3AED  gradient accent

/* ─── Tuning ────────────────────────────────────────────────────────────── */
const LINE_DISTANCE  = 130;
const LINE_WIDTH     = 0.7;
const LINE_MAX_ALPHA = 0.10;
const MOUSE_RADIUS   = 200;
const MOUSE_STRENGTH = 28;
const WAVE_AMPLITUDE = 5;
const WAVE_SPEED     = 0.00035;
const WAVE_FREQ_X    = 0.010;
const WAVE_FREQ_Y    = 0.013;

/* ─── Cluster layout ────────────────────────────────────────────────────── */
// [x%, y%, hub radius, hub color, is the "accent" cluster]
type ClusterDef = {
  cx: number; cy: number;
  hubR: number;
  hubColor: readonly [number, number, number];
  accent?: boolean;
};

const CLUSTER_DEFS: ClusterDef[] = [
  { cx: 0.10, cy: 0.25, hubR: 11, hubColor: BLUE },
  { cx: 0.25, cy: 0.70, hubR: 9,  hubColor: BLUE_MID },
  { cx: 0.42, cy: 0.35, hubR: 13, hubColor: BLUE },
  { cx: 0.55, cy: 0.75, hubR: 8,  hubColor: AMBER, accent: true },
  { cx: 0.65, cy: 0.20, hubR: 10, hubColor: VIOLET },
  { cx: 0.78, cy: 0.50, hubR: 12, hubColor: BLUE },
  { cx: 0.90, cy: 0.30, hubR: 9,  hubColor: BLUE_MID },
  { cx: 0.85, cy: 0.78, hubR: 8,  hubColor: BLUE_LIGHT },
];

/* ─── Build nodes ───────────────────────────────────────────────────────── */
function buildNodes(w: number, h: number): Node[] {
  const nodes: Node[] = [];

  const add = (
    bx: number, by: number,
    radius: number,
    color: readonly [number, number, number],
    alpha: number,
    glow: boolean,
  ) => {
    nodes.push({
      baseX: Math.max(radius, Math.min(w - radius, bx)),
      baseY: Math.max(radius, Math.min(h - radius, by)),
      x: bx, y: by,
      radius,
      color,
      alpha,
      glow,
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed: 0.8 + Math.random() * 0.4,
    });
  };

  for (const cl of CLUSTER_DEFS) {
    const sx = cl.cx * w;
    const sy = cl.cy * h;

    // Hub node — large, glowing
    add(sx, sy, cl.hubR, cl.hubColor, 0.55, true);

    // Inner ring — medium nodes (3-5)
    const medCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < medCount; i++) {
      const angle = (Math.PI * 2 * i) / medCount + (Math.random() - 0.5) * 0.7;
      const r = 35 + Math.random() * 30;
      const mRadius = 3 + Math.random() * 3;
      const mColor = cl.accent ? AMBER : (Math.random() < 0.3 ? BLUE_LIGHT : BLUE_MID);
      add(sx + Math.cos(angle) * r, sy + Math.sin(angle) * r, mRadius, mColor, 0.40, false);
    }

    // Outer ring — smaller nodes (5-8)
    const outerCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < outerCount; i++) {
      const angle = (Math.PI * 2 * i) / outerCount + Math.random() * 0.9;
      const r = 70 + Math.random() * 60;
      const sRadius = 1.8 + Math.random() * 2;
      const sColor = Math.random() < 0.15 ? BLUE_LIGHT : BLUE_PALE;
      add(sx + Math.cos(angle) * r, sy + Math.sin(angle) * r, sRadius, sColor, 0.30, false);
    }
  }

  // Sparse ambient fill — tiny connector dots
  const spacing = 80;
  const cols = Math.ceil(w / spacing);
  const rows = Math.ceil(h / spacing);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > 0.14) continue;
      const fx = c * spacing + (Math.random() - 0.5) * spacing * 0.8;
      const fy = r * spacing + (Math.random() - 0.5) * spacing * 0.8;
      let tooClose = false;
      for (let d = 0; d < Math.min(nodes.length, 200); d++) {
        const ddx = nodes[d].baseX - fx;
        const ddy = nodes[d].baseY - fy;
        if (ddx * ddx + ddy * ddy < 600) { tooClose = true; break; }
      }
      if (!tooClose) {
        add(fx, fy, 1.2 + Math.random() * 0.8, BLUE_PALE, 0.18, false);
      }
    }
  }

  return nodes;
}

/* ─── Spatial grid for O(1) neighbour lookup ────────────────────────────── */
function buildGrid(nodes: Node[], w: number, h: number, cellSize: number) {
  const cols = Math.ceil(w / cellSize);
  const rows = Math.ceil(h / cellSize);
  const grid: number[][] = Array.from({ length: cols * rows }, () => []);
  for (let i = 0; i < nodes.length; i++) {
    const cx = Math.floor(nodes[i].x / cellSize);
    const cy = Math.floor(nodes[i].y / cellSize);
    if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
      grid[cy * cols + cx].push(i);
    }
  }
  return { grid, cols, rows };
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function ForceGraph({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const nodesRef  = useRef<Node[]>([]);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width  = rect.width  * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodesRef.current = buildNodes(rect.width, rect.height);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function onMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }

    function draw(time: number) {
      const rect = canvas!.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      ctx!.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const { x: mx, y: my } = mouseRef.current;
      const t = time * WAVE_SPEED;

      /* ── Update positions ─────────────────────────────────────────── */
      for (let i = 0; i < nodes.length; i++) {
        const d = nodes[i];
        const waveY = Math.sin(d.baseX * WAVE_FREQ_X + t) *
                      Math.cos(d.baseY * WAVE_FREQ_Y + t * 0.7) *
                      WAVE_AMPLITUDE;
        const waveX = Math.cos(d.baseY * WAVE_FREQ_X * 0.8 + t * 0.5) *
                      WAVE_AMPLITUDE * 0.4;

        let pushX = 0, pushY = 0;
        const dx = d.baseX - mx, dy = d.baseY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
          pushX = (dx / dist) * force;
          pushY = (dy / dist) * force;
        }
        d.x = d.baseX + waveX + pushX;
        d.y = d.baseY + waveY + pushY;
      }

      /* ── Draw edges ───────────────────────────────────────────────── */
      const { grid, cols, rows } = buildGrid(nodes, w, h, LINE_DISTANCE);
      ctx!.lineWidth = LINE_WIDTH;
      for (let i = 0; i < nodes.length; i++) {
        const gx = Math.floor(nodes[i].x / LINE_DISTANCE);
        const gy = Math.floor(nodes[i].y / LINE_DISTANCE);
        for (let ny = Math.max(0, gy - 1); ny <= Math.min(rows - 1, gy + 1); ny++) {
          for (let nx = Math.max(0, gx - 1); nx <= Math.min(cols - 1, gx + 1); nx++) {
            const cell = grid[ny * cols + nx];
            for (let k = 0; k < cell.length; k++) {
              const j = cell[k];
              if (j <= i) continue;
              const ddx = nodes[i].x - nodes[j].x;
              const ddy = nodes[i].y - nodes[j].y;
              const dd = Math.sqrt(ddx * ddx + ddy * ddy);
              if (dd < LINE_DISTANCE) {
                const alpha = (1 - dd / LINE_DISTANCE) * LINE_MAX_ALPHA;
                // Blend the two node colors for the edge
                const [r1, g1, b1] = nodes[i].color;
                const [r2, g2, b2] = nodes[j].color;
                const mr = (r1 + r2) >> 1, mg = (g1 + g2) >> 1, mb = (b1 + b2) >> 1;
                ctx!.strokeStyle = `rgba(${mr},${mg},${mb},${alpha})`;
                ctx!.beginPath();
                ctx!.moveTo(nodes[i].x, nodes[i].y);
                ctx!.lineTo(nodes[j].x, nodes[j].y);
                ctx!.stroke();
              }
            }
          }
        }
      }

      /* ── Draw nodes ───────────────────────────────────────────────── */
      ctx!.shadowColor = "transparent";
      for (let i = 0; i < nodes.length; i++) {
        const d = nodes[i];
        const pulse = 0.85 + 0.15 * Math.sin(time * 0.001 * d.pulseSpeed + d.pulseOffset);
        const a = d.alpha * pulse;
        const [cr, cg, cb] = d.color;

        if (d.glow) {
          // Large hub: soft outer glow
          ctx!.shadowColor = `rgba(${cr},${cg},${cb},0.25)`;
          ctx!.shadowBlur = 16;
          ctx!.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
          ctx!.beginPath();
          ctx!.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
          ctx!.fill();

          // Inner bright core
          ctx!.shadowColor = "transparent";
          ctx!.shadowBlur = 0;
          ctx!.fillStyle = `rgba(255,255,255,${a * 0.5})`;
          ctx!.beginPath();
          ctx!.arc(d.x, d.y, d.radius * 0.45, 0, Math.PI * 2);
          ctx!.fill();

          // Thin ring
          ctx!.strokeStyle = `rgba(${cr},${cg},${cb},${a * 0.3})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.arc(d.x, d.y, d.radius + 4 + 2 * Math.sin(time * 0.0008 + d.pulseOffset), 0, Math.PI * 2);
          ctx!.stroke();
          ctx!.lineWidth = LINE_WIDTH; // restore
        } else {
          // Regular node — solid fill
          ctx!.shadowColor = "transparent";
          ctx!.shadowBlur = 0;
          ctx!.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
          ctx!.beginPath();
          ctx!.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
      ctx!.shadowColor = "transparent";
      ctx!.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(draw);
    }

    resize();
    rafRef.current = requestAnimationFrame(draw);

    const parent = canvas.parentElement;
    document.addEventListener("mousemove", onMouseMove);
    parent?.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", onMouseMove);
      parent?.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", pointerEvents: "none" }}
    />
  );
}
