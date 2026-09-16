"use client";

import { useEffect, useState } from "react";

export default function TypingText({
  phrases,
  speed = 55,
  pause = 1800,
  className = "",
}: {
  phrases: string[];
  speed?: number;
  pause?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[index % phrases.length];
    let t: ReturnType<typeof setTimeout>;

    if (!deleting && sub === current.length) {
      t = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && sub === 0) {
      t = setTimeout(() => {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      }, 250);
    } else {
      t = setTimeout(
        () => setSub((s) => s + (deleting ? -1 : 1)),
        deleting ? speed / 2 : speed,
      );
    }
    return () => clearTimeout(t);
  }, [sub, deleting, index, phrases, speed, pause]);

  return (
    <span className={className}>
      {phrases[index % phrases.length].slice(0, sub)}
      <span className="animate-caret text-brand-400" aria-hidden>
        |
      </span>
    </span>
  );
}