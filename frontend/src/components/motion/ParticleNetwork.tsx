"use client";

import { useEffect, useRef } from "react";

export default function ParticleNetwork({
  className = "",
  density = 0.00008,
  maxDist = 130,
  color = "139,92,246",
  interactive = true,
}: {
  className?: string;
  density?: number;
  maxDist?: number;
  color?: string;
  interactive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let W = 0;
    let H = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };
    let particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.min(110, Math.max(35, Math.floor(W * H * density)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }));
    };

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const step = () => {
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxDist * maxDist) {
            const alpha = 0.22 * (1 - Math.sqrt(d2) / maxDist);
            ctx.strokeStyle = `rgba(${color},${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},0.85)`;
        ctx.fill();
      }

      if (interactive && mouse.x > -1000) {
        for (const p of particles) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          if (dx * dx + dy * dy < 130 * 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${color},0.45)`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            break;
          }
        }
      }

      raf = requestAnimationFrame(step);
    };

    resize();
    if (interactive) {
      window.addEventListener("mousemove", onMouse);
      window.addEventListener("mouseleave", onLeave);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    step();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (interactive) {
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [density, maxDist, color, interactive]);

  return <canvas ref={canvasRef} className={`pointer-events-none h-full w-full ${className}`} aria-hidden />;
}