"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";

export default function MouseGlow({
  children,
  className = "",
  color = "rgba(139, 92, 246, 0.16)",
  radius = 300,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const sx = useSpring(x, { stiffness: 110, damping: 22 });
  const sy = useSpring(y, { stiffness: 110, damping: 22 });
  const glow = useMotionTemplate`radial-gradient(${radius}px circle at ${sx}px ${sy}px, ${color}, transparent 70%)`;

  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: glow }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}