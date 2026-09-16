"use client";

export default function AuroraBackground({
  className = "",
  subtle = false,
}: {
  className?: string;
  subtle?: boolean;
}) {
  const opacity = subtle ? 0.06 : 0.1;
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(139,92,246,${opacity}) 0%, transparent 60%),
                       radial-gradient(ellipse at 70% 80%, rgba(99,102,241,${opacity}) 0%, transparent 60%)`,
        }}
      />
    </div>
  );
}