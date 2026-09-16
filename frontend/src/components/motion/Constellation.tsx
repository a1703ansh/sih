const SHAPES: { lines: string; stars: number[][] }[] = [
  { lines: "20,85 35,70 50,60 45,40 65,35 80,50", stars: [[20,85],[35,70],[50,60],[45,40],[65,35],[80,50]] },
  { lines: "15,20 50,30 45,55 80,75", stars: [[15,20],[50,30],[45,55],[80,75]] },
  { lines: "25,25 8,55 32,82 58,58", stars: [[25,25],[8,55],[32,82],[58,58]] },
  { lines: "10,75 30,55 28,35 50,20 72,28", stars: [[10,75],[30,55],[28,35],[50,20],[72,28]] },
  { lines: "15,15 35,35 30,65 55,55 80,60", stars: [[15,15],[35,35],[30,65],[55,55],[80,60]] },
  { lines: "60,20 72,45 50,65 68,80", stars: [[60,20],[72,45],[50,65],[68,80]] },
  { lines: "30,30 55,15 45,45 65,40 60,70 40,60", stars: [[30,30],[55,15],[45,45],[65,40],[60,70],[40,60]] },
  { lines: "15,45 30,55 45,50 58,62", stars: [[15,45],[30,55],[45,50],[58,62]] },
];

export default function Constellation({
  left,
  top,
  size,
  variant,
  duration = "20s",
  delay = "0s",
  opacity = 0.7,
}: {
  left: string;
  top: string;
  size: string;
  variant: number;
  duration?: string;
  delay?: string;
  opacity?: number;
}) {
  const shape = SHAPES[variant % SHAPES.length];
  return (
    <div
      aria-hidden
      className="animate-constellation pointer-events-none absolute"
      style={{ left, top, width: size, height: size, animationDuration: duration, animationDelay: delay, opacity }}
    >
      <svg className="h-full w-full" viewBox="0 0 100 100" fill="none">
        <polyline
          points={shape.lines}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {shape.stars.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={i % 3 === 0 ? 1.9 : 1.3}
            fill="rgba(255,255,255,0.85)"
          />
        ))}
      </svg>
    </div>
  );
}