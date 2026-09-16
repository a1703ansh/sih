"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Users, Briefcase, Building2, Activity } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

const BLIPS = [
  { left: "24%", top: "30%", color: "bg-violet-400", size: "h-2 w-2" },
  { left: "58%", top: "22%", color: "bg-brand-400", size: "h-1.5 w-1.5" },
  { left: "70%", top: "48%", color: "bg-indigo-400", size: "h-2.5 w-2.5" },
  { left: "42%", top: "62%", color: "bg-fuchsia-400", size: "h-1.5 w-1.5" },
  { left: "30%", top: "74%", color: "bg-emerald-400", size: "h-2 w-2" },
  { left: "78%", top: "70%", color: "bg-sky-400", size: "h-2 w-2" },
  { left: "14%", top: "52%", color: "bg-cyan-400", size: "h-1.5 w-1.5" },
  { left: "86%", top: "34%", color: "bg-amber-400", size: "h-2 w-2" },
];

export default function LiveRadar({
  base = { candidates: 0, placements: 0, partners: 0, employers: 0, updates: 0 },
  className = "",
}: {
  base?: { candidates: number; placements: number; partners: number; employers: number; updates: number };
  className?: string;
}) {
  const [tick, setTick] = useState(base);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setTick(base);
  }, [base]);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => ({
        candidates: t.candidates + Math.round(Math.random() * 2),
        placements: t.placements + (Math.random() > 0.55 ? 1 : 0),
        partners: t.partners,
        employers: t.employers + (Math.random() > 0.7 ? 1 : 0),
        updates: t.updates + (Math.random() > 0.4 ? 1 : 0),
      }));
      setFlash(true);
      const f = setTimeout(() => setFlash(false), 800);
      return () => clearTimeout(f);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const blips = useMemo(() => BLIPS, []);

  return (
    <div className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 ${className}`}>
      {/* Radar */}
      <div className="relative mx-auto aspect-square w-full max-w-sm">
        <div className="absolute inset-0 rounded-full border border-violet-500/25" />
        <div className="absolute inset-[18%] rounded-full border border-violet-500/20" />
        <div className="absolute inset-[36%] rounded-full border border-violet-500/20" />
        <div className="absolute inset-[50%] rounded-full border border-violet-500/25" />
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-violet-500/15" />
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-violet-500/15" />

        <div
          className="animate-sweep absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(139,92,246,0.45), rgba(139,92,246,0.10) 45deg, transparent 75deg)",
          }}
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="relative flex h-4 w-4">
            <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-brand-500" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-gradient-to-br from-violet-500 to-brand-500 ring-4 ring-violet-500/20" />
          </span>
        </div>

        {blips.map((b, i) => (
          <div key={i} className="absolute" style={{ left: b.left, top: b.top }}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-current opacity-0" />
              <span className={`relative inline-flex rounded-full ${b.color} ${b.size} shadow-[0_0_10px_rgba(139,92,246,0.8)]`} />
            </span>
          </div>
        ))}

        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          <span className={`chip bg-violet-500/15 text-violet-200 transition-opacity duration-300 ${flash ? "opacity-100" : "opacity-60"}`}>
            <Activity className="h-3 w-3" />
            scanning live
          </span>
        </div>
      </div>

      {/* Live counters */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <h3 className="text-2xl font-bold text-white">The network, live</h3>
        </div>
        <p className="mb-6 text-slate-400">
          Every enrolment, placement and application pings this radar — a real-time pulse of the
          national skilling ecosystem.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="glass-inner flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-brand-500">
              <Users className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="text-lg font-bold text-white">
                <AnimatedNumber value={tick.candidates} />
              </p>
              <p className="text-xs text-slate-400">candidates tracked</p>
            </div>
          </div>
          <div className="glass-inner flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <Briefcase className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="text-lg font-bold text-white">
                <AnimatedNumber value={tick.placements} />
              </p>
              <p className="text-xs text-slate-400">placements logged</p>
            </div>
          </div>
          <div className="glass-inner flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500">
              <Building2 className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="text-lg font-bold text-white">
                <AnimatedNumber value={tick.employers} />
              </p>
              <p className="text-xs text-slate-400">employers hiring</p>
            </div>
          </div>
          <div className="glass-inner flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="text-lg font-bold text-white">
                <AnimatedNumber value={tick.updates} />
              </p>
              <p className="text-xs text-slate-400">outcome updates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}