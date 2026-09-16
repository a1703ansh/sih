"use client";

import type { ReactNode } from "react";

export default function Marquee({
  children,
  reverse = false,
  className = "",
  speed = 32,
}: {
  children: ReactNode;
  reverse?: boolean;
  className?: string;
  speed?: number;
}) {
  return (
    <div className={`marquee-mask w-full overflow-hidden ${className}`}>
      <div
        className={`marquee-track flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}