import { useEffect, useRef } from "react";

/**
 * NeuralNetwork — animated AI-style node graph rendered on a canvas.
 * Inspired by orange/cyan reference: dense web of lines connecting
 * pulsing nodes around a chaotic central "core".
 */

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulse: number;
  pulseSpeed: number;
  isLabel?: boolean;
};

type ProductLabel = {
  angle: number; // around center
  radius: number;
  title: string;
  desc: string;
};

const LABELS: ProductLabel[] = [
  { angle: -Math.PI * 0.92, radius: 0.42, title: "STRATEGY", desc: "Brand & product positioning" },
  { angle: -Math.PI * 0.55, radius: 0.46, title: "DESIGN", desc: "Interfaces that feel alive" },
  { angle: -Math.PI * 0.15, radius: 0.40, title: "ENGINEERING", desc: "Production-grade builds" },
  { angle:  Math.PI * 0.20, radius: 0.45, title: "AI / ML", desc: "Smart, adaptive systems" },
  { angle:  Math.PI * 0.55, radius: 0.42, title: "GROWTH", desc: "Conversion-driven launches" },
  { angle:  Math.PI * 0.92, radius: 0.46, title: "SUPPORT", desc: "Always-on partnership" },
];

const NeuralNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let coreNodes: Node[] = [];
    let labelAnchors: { x: number; y: number }[] = [];

    const initSizes = () => {
      const rect = container.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Core chaotic cluster
      const CORE = 28;
      coreNodes = Array.from({ length: CORE }).map(() => {
        const a = Math.random() * Math.PI * 2;
        const r = (Math.random() * 0.18 + 0.04) * Math.min(W, H);
        return {
          x: W / 2 + Math.cos(a) * r,
          y: H / 2 + Math.sin(a) * r,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: 1.2 + Math.random() * 1.6,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.04,
        };
      });

      // Anchor positions for the label nodes
      const cx = W / 2;
      const cy = H / 2;
      const base = Math.min(W, H);
      labelAnchors = LABELS.map((l) => ({
        x: cx + Math.cos(l.angle) * l.radius * base,
        y: cy + Math.sin(l.angle) * l.radius * base * 0.85,
      }));
    };

    initSizes();
    const onResize = () => initSizes();
    window.addEventListener("resize", onResize);

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
      mouseRef.current.active = true;
    };
    const onLeave = () => (mouseRef.current.active = false);
    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);

    const draw = () => {
      // Transparent clear + extremely subtle motion trail in cream tone
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const mx = mouseRef.current.x * W;
      const my = mouseRef.current.y * H;

      // Update core nodes (slight orbit + drift)
      for (const n of coreNodes) {
        n.x += n.vx;
        n.y += n.vy;
        const dx = cx - n.x;
        const dy = cy - n.y;
        n.vx += dx * 0.0006;
        n.vy += dy * 0.0006;
        if (mouseRef.current.active) {
          const ddx = n.x - mx;
          const ddy = n.y - my;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 < 14000) {
            const f = (14000 - d2) / 14000;
            n.vx += (ddx / Math.sqrt(d2 + 0.01)) * f * 0.08;
            n.vy += (ddy / Math.sqrt(d2 + 0.01)) * f * 0.08;
          }
        }
        n.vx *= 0.985;
        n.vy *= 0.985;
        n.pulse += n.pulseSpeed;
      }

      // --- Chaotic core lines (deep ink, low alpha) ---
      ctx.lineWidth = 0.6;
      for (let i = 0; i < coreNodes.length; i++) {
        for (let j = i + 1; j < coreNodes.length; j++) {
          const a = coreNodes[i];
          const b = coreNodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const max = Math.min(W, H) * 0.32;
          if (dist < max) {
            const alpha = (1 - dist / max) * 0.45;
            // Dark ink lines so they read on cream
            ctx.strokeStyle = `rgba(28, 24, 20, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // --- Connections from core to label anchors (gold) ---
      ctx.lineWidth = 0.6;
      labelAnchors.forEach((anchor) => {
        const sorted = [...coreNodes]
          .map((n) => ({ n, d: Math.hypot(n.x - anchor.x, n.y - anchor.y) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, 5);
        for (const { n, d } of sorted) {
          const alpha = Math.max(0.12, 0.55 - d / Math.max(W, H));
          ctx.strokeStyle = `rgba(196, 142, 38, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(anchor.x, anchor.y);
          ctx.stroke();
        }
      });

      // --- Core node dots (warm gold) ---
      for (const n of coreNodes) {
        const glow = 0.6 + Math.sin(n.pulse) * 0.4;
        ctx.fillStyle = `rgba(176, 120, 24, ${0.85 * glow})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Anchor "synapse" dots (rich gold glow) ---
      const t = performance.now() * 0.002;
      labelAnchors.forEach((a, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(t + i);
        const grd = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, 16);
        grd.addColorStop(0, `rgba(212, 158, 54, ${0.55 + pulse * 0.35})`);
        grd.addColorStop(1, "rgba(212, 158, 54, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#7a4f12";
        ctx.beginPath();
        ctx.arc(a.x, a.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Label cards overlay */}
      <div className="pointer-events-none absolute inset-0">
        {LABELS.map((l, i) => {
          const cx = 50;
          const cy = 50;
          const rxPct = Math.cos(l.angle) * l.radius * 100;
          const ryPct = Math.sin(l.angle) * l.radius * 85;
          const left = cx + rxPct;
          const top = cy + ryPct;
          const offX = Math.cos(l.angle) * 12;
          const offY = Math.sin(l.angle) * 10;
          const isLeft = Math.cos(l.angle) < 0;
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${left + offX}%`,
                top: `${top + offY}%`,
                transform: `translate(${isLeft ? "-100%" : "0"}, -50%)`,
              }}
            >
              <div className="rounded-md border border-gold/40 bg-cream/70 px-2.5 py-1.5 backdrop-blur-sm">
                <div className="font-mono-tag text-[10px] font-bold tracking-[0.18em] text-gold">
                  {l.title}
                </div>
                <div className="mt-0.5 max-w-[140px] font-body text-[10px] leading-tight text-dark/70">
                  {l.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top-left HUD label */}
      <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-2">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
        <span className="font-mono-tag text-[10px] tracking-[0.2em] text-dark/60">
          NEURAL.MESH // LIVE
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-2 right-2 font-mono-tag text-[10px] tracking-[0.2em] text-dark/40">
        v1.0 — INTEGRATED.AI
      </div>
    </div>
  );
};

export default NeuralNetwork;
