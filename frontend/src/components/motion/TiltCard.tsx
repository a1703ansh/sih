"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import type { ReactNode } from "react";

export default function TiltCard({
  children,
  className = "",
  maxTilt = 10,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), {
    stiffness: 180,
    damping: 18,
    mass: 0.4,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), {
    stiffness: 180,
    damping: 18,
    mass: 0.4,
  });

  const glowX = useTransform(px, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(py, [0, 1], ["0%", "100%"]);

  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={
        reduce
          ? undefined
          : { rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }
      }
      className={`relative ${className}`}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
          style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease" }}
        >
          <motion.div
            className="absolute h-48 w-48 rounded-full bg-white/10 blur-3xl"
            style={{ left: glowX, top: glowY, x: "-50%", y: "-50%" }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}