"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import type { MouseEvent, ReactNode, Ref } from "react";
import { useRef } from "react";

const MAGNETIC_STRENGTH = 0.35;

export default function MagneticButton({
  children,
  className = "",
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref as Ref<HTMLDivElement>}
      className={`inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

export function MagneticFloat({
  children,
  className = "",
  baseX = 0,
  baseY = 8,
}: {
  children: ReactNode;
  className?: string;
  baseX?: number;
  baseY?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 16, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 120, damping: 16, mass: 0.5 });
  const floatY = useTransform(
    sy,
    (v: number) => (reduce ? 0 : baseY + v)
  );

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * MAGNETIC_STRENGTH);
    y.set((e.clientY - (rect.top + rect.height / 2)) * MAGNETIC_STRENGTH);
  };

  return (
    <motion.div
      ref={ref as Ref<HTMLDivElement>}
      className={`relative inline-block ${className}`}
      style={{ x: sx, y: floatY }}
      onMouseMove={onMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}