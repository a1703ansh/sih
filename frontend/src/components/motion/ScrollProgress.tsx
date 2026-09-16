"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress({ className = "" }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className={`fixed inset-x-0 top-0 z-[90] h-[3px] origin-left bg-gradient-to-r from-violet-500 via-brand-500 to-indigo-400 shadow-[0_0_12px_rgba(139,92,246,0.6)] ${className}`}
      style={{ scaleX }}
    />
  );
}