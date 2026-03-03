"use client";
import { useEffect, useRef } from "react";

interface Node {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  type: "hub" | "medium" | "tiny";
  pulseOffset: number;
}

// Conduit primary blue
const BLUE_R = 37, BLUE_G = 99, BLUE_B = 235;

const HUB_RADIUS   = 4;
const MED_RADIUS   = 2;
const TINY_RADIUS  = 1.2;
const LINE_DISTANCE  = 110;
const MOUSE_RADIUS   = 160;
const MOUSE_STRENGTH = 20;
const WAVE_AMPLITUDE = 6;
const WAVE_SPEED     = 0.0004;
const WAVE_FREQ_X    = 0.012;
const WAVE_FREQ_Y    = 0.016;

// Cluster centers as fractions of canvas dimensions
const CLUSTERS: [number, number][] = [
  [0.12, 0.30],
  [0.30, 0.68],
  [0.60, 0.20],
  [0.82, 0.55],
  [0.48, 0.50],
];

function buildNodes(w: number, h: number): Node[] {
  const nodes: Node[] = [];

  const add = (bx: number, by: number, type: Node["type"]) => {
    // Clamp to canvas with a small margin
    const x = Math.max(10, Math.min(w - 10, bx));
    const y = Math.max(10, Math.min(h - 10, by));
    nodes.push({ baseX: x, baseY: y, x, y, type, pulseOffset: Math.random() * Math.PI * 2 });
  };

  for (const [cx, cy] of CLUSTERS) {
    const sx = cx * w;
    const sy = cy * h;
    add(sx, sy, "hub");

    // Medium ring
    const medCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < medCount; i++) {
      const angle = (Math.PI * 2 * i) / medCount + (Math.random() - 0.5) * 0.8;
      const r = 28 + Math.random() * 44;
      add(sx + Math.cos(angle) * r, sy + Math.sin(angle) * r, "medium");
    }

    // Tiny outer ring
    const tinyCount = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < tinyCount; i++) {
      const angle = (Math.PI * 2 * i) / tinyCount + Math.random() * 1.0;
      const r = 60 + Math.random() * 80;
      add(sx + Math.cos(angle) * r, sy + Math.sin(angle) * r, "tiny");
    }
  }

  // Very sparse ambient fill
  const spacing = 95;
  const cols = Math.ceil(w / spacing);
  const rows = Math.ceil(h / spacing);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > 0.11) continue;
      const fx = c * spacing + (Math.random() - 0.5) * spacing * 0.7;
      const fy = r * spacing + (Math.random() - 0.5) * spacing * 0.7;
      let tooClose = false;
      for (let d = 0; d < nodes.length; d++) {
        const ddx = nodes[d].baseX - fx;
        const ddy = nodes[d].baseY - fy;
        if (ddx * ddx + ddy * ddy < 400) { tooClose = true; break; }
      }
      if (!tooClose) add(fx, fy, "tiny");
    }
  }

  return nodes;
}

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

export default function ForceGraph({ className }: { className?: string }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const mouseRef   = useRef({ x: -9999, y: -9999 });
  const nodesRef   = useRef<Node[]>([]);
  const rafRef     = useRef<number>(0);

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

      // ── Update positions ──────────────────────────────────────────────────
      for (let i = 0; i < nodes.length; i++) {
        const d = nodes[i];
        const waveY = Math.sin(d.baseX * WAVE_FREQ_X + t) * Math.cos(d.baseY * WAVE_FREQ_Y + t * 0.7) * WAVE_AMPLITUDE;
        const waveX = Math.cos(d.baseY * WAVE_FREQ_X * 0.8 + t * 0.5) * WAVE_AMPLITUDE * 0.3;

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

      // ── Lines ─────────────────────────────────────────────────────────────
      const { grid, cols, rows } = buildGrid(nodes, w, h, LINE_DISTANCE);
      ctx!.lineWidth = 0.5;
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
                const alpha = (1 - dd / LINE_DISTANCE) * 0.11;
                ctx!.strokeStyle = `rgba(${BLUE_R},${BLUE_G},${BLUE_B},${alpha})`;
                ctx!.beginPath();
                ctx!.moveTo(nodes[i].x, nodes[i].y);
                ctx!.lineTo(nodes[j].x, nodes[j].y);
                ctx!.stroke();
              }
            }
          }
        }
      }

      // ── Nodes ─────────────────────────────────────────────────────────────
      for (let i = 0; i < nodes.length; i++) {
        const d = nodes[i];

        if (d.type === "hub") {
          const pulse = 0.55 + 0.2 * Math.sin(time * 0.0012 + d.pulseOffset);
          // Outer glow ring
          ctx!.strokeStyle = `rgba(${BLUE_R},${BLUE_G},${BLUE_B},${pulse * 0.12})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.arc(d.x, d.y, HUB_RADIUS + 5, 0, Math.PI * 2);
          ctx!.stroke();
          // Middle ring
          ctx!.strokeStyle = `rgba(${BLUE_R},${BLUE_G},${BLUE_B},${pulse * 0.30})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.arc(d.x, d.y, HUB_RADIUS + 1.5, 0, Math.PI * 2);
          ctx!.stroke();
          // Core
          ctx!.fillStyle = `rgba(${BLUE_R},${BLUE_G},${BLUE_B},${pulse * 0.65})`;
          ctx!.beginPath();
          ctx!.arc(d.x, d.y, HUB_RADIUS * 0.55, 0, Math.PI * 2);
          ctx!.fill();

        } else if (d.type === "medium") {
          const alpha = 0.30 + 0.08 * Math.sin(time * 0.0015 + d.pulseOffset);
          ctx!.fillStyle = `rgba(${BLUE_R},${BLUE_G},${BLUE_B},${alpha})`;
          ctx!.beginPath();
          ctx!.arc(d.x, d.y, MED_RADIUS, 0, Math.PI * 2);
          ctx!.fill();

        } else {
          ctx!.fillStyle = `rgba(${BLUE_R},${BLUE_G},${BLUE_B},0.15)`;
          ctx!.beginPath();
          ctx!.arc(d.x, d.y, TINY_RADIUS, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

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
