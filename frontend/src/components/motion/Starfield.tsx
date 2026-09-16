"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";

type Star = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  r: number;
  depth: number;
  phase: number;
  twinkle: number;
  tint: [number, number, number];
  alphaBase: number;
};

type Palette = { rgb: [number, number, number]; weight: number }[];

const NIGHT: Palette = [
  { rgb: [248, 250, 252], weight: 0.32 },
  { rgb: [226, 232, 240], weight: 0.28 },
  { rgb: [203, 213, 225], weight: 0.2 },
  { rgb: [165, 180, 252], weight: 0.08 },
  { rgb: [254, 243, 199], weight: 0.06 },
  { rgb: [203, 213, 225], weight: 0.06 },
];

const LIGHT: Palette = [
  { rgb: [148, 163, 184], weight: 0.36 },
  { rgb: [100, 116, 139], weight: 0.3 },
  { rgb: [203, 213, 225], weight: 0.2 },
  { rgb: [129, 140, 248], weight: 0.08 },
  { rgb: [71, 85, 105], weight: 0.06 },
];

function pick(pal: Palette): Star["tint"] {
  let roll = Math.random();
  for (const p of pal) {
    if (roll <= p.weight) return p.rgb;
    roll -= p.weight;
  }
  return pal[0].rgb;
}

function makeStars(count: number, pal: Palette): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const near = Math.random() > 0.75;
    stars.push({
      x: Math.random(),
      y: Math.random(),
      dx: (Math.random() - 0.5) * 3,
      dy: near ? 26 + Math.random() * 22 : 8 + Math.random() * 12,
      r: near ? 0.9 + Math.random() * 1.1 : 0.35 + Math.random() * 0.55,
      depth: near ? 0.78 + Math.random() * 0.22 : Math.random() * 0.75,
      phase: Math.random() * Math.PI * 2,
      twinkle: 1.4 + Math.random() * 2.4,
      tint: pick(pal),
      alphaBase: near ? 0.55 + Math.random() * 0.45 : 0.3 + Math.random() * 0.4,
    });
  }
  return stars;
}

export default function Starfield({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pal = theme === "night" ? NIGHT : LIGHT;
    const isNight = theme === "night";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let width = window.innerWidth;
    let height = window.innerHeight;
    let stars: Star[] = [];
    let raf = 0;
    let last = performance.now();

    const seed = () => {
      const area = width * height;
      const density = isNight ? 15000 : 23000;
      const cap = isNight ? 340 : 210;
      const floor = isNight ? 90 : 55;
      const count = Math.max(floor, Math.min(cap, Math.floor(area / density)));
      stars = makeStars(count, pal);
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * DPR));
      canvas.height = Math.max(1, Math.floor(height * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seed();
      if (reduceMotion) {
        draw(performance.now());
      }
    };

    const draw = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = isNight ? "lighter" : "source-over";

      for (const s of stars) {
        s.x += (s.dx * dt) / width;
        s.y -= (s.dy * dt) / height;
        if (s.x < -0.02) s.x += 1.04;
        if (s.x > 1.02) s.x -= 1.04;
        if (s.y < -0.02) s.y += 1.04;
        if (s.y > 1.02) s.y -= 1.04;

        const px = s.x * width;
        const py = s.y * height;
        const tw = 0.55 + 0.45 * Math.sin(s.phase + t * 0.001 * s.twinkle);
        const scale = isNight ? 1 : 0.55;
        const a = Math.min(1, s.alphaBase * tw * scale);
        const [r, g, b] = s.tint;

        if (isNight && s.r > 1.15) {
          const halo = ctx.createRadialGradient(px, py, 0, px, py, s.r * 6);
          halo.addColorStop(0, `rgba(${r},${g},${b},${a * 0.3})`);
          halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(px, py, s.r * 6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduceMotion) {
        raf = requestAnimationFrame(draw);
      }
    };

    seed();
    resize();

    if (!reduceMotion) {
      raf = requestAnimationFrame(draw);
    }

    const onResize = () => {
      resize();
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className ?? "absolute inset-0 h-full w-full"}
    />
  );
}