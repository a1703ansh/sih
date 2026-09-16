"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ShieldCheck, BarChart3, TrendingUp, LogIn, Map,
  LineChart, Users, Building2, GraduationCap, ArrowUpRight, CheckCircle2,
  Workflow, BrainCircuit, FileText, Bell, MoveDown, Landmark, X, IndianRupee, Target,
  Zap, Cloud, Radio,
} from "lucide-react";
import {
  Bar, BarChart as ReBarChart, CartesianGrid, Cell, Legend, Pie, PieChart as RePieChart,
  PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { PublicScheme, PartnerCoverageState } from "@/lib/types";
import { usePublicSummary, usePublicSchemes, usePartnerCoverage } from "@/lib/hooks/useDashboard";
import SectionReveal from "@/components/motion/SectionReveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import AnimatedNumber from "@/components/motion/AnimatedNumber";
import ScrollProgress from "@/components/motion/ScrollProgress";
import ThemeToggle from "@/components/motion/ThemeToggle";
import Starfield from "@/components/motion/Starfield";

function CountUp({ end, duration = 1200, decimals = 0 }: { end: number; duration?: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * end);
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration]);

  return <>{display.toFixed(decimals)}</>;
}

/* ─────────────────────────── Static content ─────────────────────────── */

const pillars = [
  { key: "total_candidates" as const, label: "Candidates Trained", suffix: "", icon: Users },
  { key: "total_employers" as const, label: "Active Employers", suffix: "", icon: Building2 },
  { key: "total_courses" as const, label: "Training Programs", suffix: "", icon: GraduationCap },
  { key: "active_schemes" as const, label: "Gov Schemes Tracked", suffix: "", icon: Landmark },
];

const roles = [
  { icon: Landmark, title: "Government", desc: "Scheme ROI, skill-gap heatmaps & policy alerts to steer skilling policy." },
  { icon: Users, title: "Candidate", desc: "AI placement score, job matches & a personalized outcome journey." },
  { icon: Building2, title: "Employer", desc: "Skill-match candidates, run a live hiring pipeline & track placements." },
  { icon: GraduationCap, title: "Training Partner", desc: "Manage courses, track student outcomes & close curriculum gaps." },
];

const revealTabs = [
  {
    id: "gov",
    label: "Government",
    icon: Landmark,

    title: "Steer policy with hard ROI data",
    desc: "Every scheme's cost-per-placement, completion and placement trajectory in one live dashboard — plus alerts the moment a region falls behind.",
    bullets: [
      "Scheme ROI & cost-per-placement analytics",
      "State-wise skill-gap heatmaps",
      "Underperformance policy alerts",
      "One-click CSV / PDF / XLSX report exports",
    ],
    tags: ["ROI analytics", "Heatmaps", "Policy alerts"],
  },
  {
    id: "candidate",
    label: "Candidates",
    icon: Users,

    title: "Get an AI-guided path to employment",
    desc: "A personalized placement score, ranked job matches and an outcome journey tracked from enrolment all the way to hiring.",
    bullets: [
      "ML placement score with live explanations",
      "AI-ranked job matches by skill overlap",
      "Personal outcome-journey timeline",
      "Outcome verification via DigiLocker & surveys",
    ],
    tags: ["Placement AI", "Job matches", "DigiLocker"],
  },
  {
    id: "employer",
    label: "Employers",
    icon: Building2,

    title: "Fill roles faster with better fits",
    desc: "A live hiring pipeline, sector benchmarks and a shortlist you can notify in one click — all backed by transparent match scores.",
    bullets: [
      "Shortlist → interview → offer → hired pipeline",
      "Employer-wide hiring funnel analytics",
      "Salary & sector hiring benchmarks",
      "Bulk-notify your shortlisted candidates",
    ],
    tags: ["Pipeline", "Benchmarks", "Shortlist"],
  },
  {
    id: "partner",
    label: "Training Partners",
    icon: GraduationCap,

    title: "Run courses that produce outcomes",
    desc: "Student outcome dashboards, batch occupancy and a course health index that surfaces gaps before they cost placements.",
    bullets: [
      "Per-course completion & placement tracking",
      "Batch occupancy and seat analytics",
      "Course health score with instant callouts",
      "CSV outcome import & verification",
    ],
    tags: ["Occupancy", "Course health", "CSV import"],
  },
];

const steps = [
  { n: "01", icon: GraduationCap, title: "Skill", desc: "Candidates enroll in PMKVY & NSDC-aligned training programs." },
  { n: "02", icon: TrendingUp, title: "Track", desc: "Outcomes are captured via scheduled follow-up surveys & employer data." },
  { n: "03", icon: BarChart3, title: "Analyze", desc: "Policymakers see placement, ROI & labor-intelligence insights live." },
];

const skillTicker = [
  "Python", "Data Science", "CNC", "Tally", "Digital Marketing", "React", "AWS",
  "Healthcare", "EV Engineering", "Solar Installation", "Logistics", "Hospitality",
  "Cyber Security", "Cloud Computing", "AI & ML", "Accounting",
];

function placementRate(sc: PublicScheme): number {
  const placed = sc.placed_12m || sc.placed_6m || sc.placed_3m;
  return sc.total_enrolled ? Math.round((placed / sc.total_enrolled) * 100) : 0;
}

/* ─────────────────────────── Scheme modal ─────────────────────────── */

function SchemeModal({ scheme, onClose }: { scheme: PublicScheme; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const chartData = [
    { label: "3-month", placed: scheme.placed_3m },
    { label: "6-month", placed: scheme.placed_6m },
    { label: "12-month", placed: scheme.placed_12m },
  ];
  const maxPlaced = Math.max(scheme.placed_3m, scheme.placed_6m, scheme.placed_12m, 1);

  return (
    <div className="fixed z-[100] inset-0 flex items-center justify-center overflow-y-auto p-4 bg-black/60 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg glass glass-inner rounded-2xl p-6 text-left shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold t-strong">{scheme.scheme_id}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="chip accent-chip">State scheme</span>
              {scheme.roi_score != null && (
                <span className="chip bg-emerald-500/15 text-emerald-500">ROI {scheme.roi_score}</span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} className="chip hover:[background:var(--chip-10)]" aria-label="Close details">
            <X className="h-4 w-4 t-body" />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl c5 p-3 text-left">
            <p className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide t-muted">
              <Users className="h-3 w-3" /> Enrolled
            </p>
            <p className="text-lg font-bold t-strong">{scheme.total_enrolled.toLocaleString()}</p>
          </div>
          <div className="rounded-xl c5 p-3 text-left">
            <p className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide t-muted">
              <GraduationCap className="h-3 w-3" /> Completion
            </p>
            <p className="text-lg font-bold t-strong">{scheme.completion_rate}%</p>
          </div>
          <div className="rounded-xl c5 p-3 text-left">
            <p className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide t-muted">
              <IndianRupee className="h-3 w-3" /> Avg salary
            </p>
            <p className="text-lg font-bold t-strong">
              {scheme.avg_salary_at_placement != null ? `₹${scheme.avg_salary_at_placement.toLocaleString()}` : "—"}
            </p>
          </div>
          <div className="rounded-xl c5 p-3 text-left">
            <p className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide t-muted">
              <Target className="h-3 w-3" /> Placement
            </p>
            <p className="text-lg font-bold t-strong">{placementRate(scheme)}%</p>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <p className="panel-title text-sm font-semibold t-body">Placements over time</p>
          <span className="text-xs t-dim">{maxPlaced.toLocaleString()} max</span>
        </div>
        <div className="mb-5 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={chartData} barCategoryGap="25%">
              <CartesianGrid stroke="rgba(148,163,184,0.2)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={36} />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.12)" }}
                contentStyle={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: "var(--tooltip-text)" }}
                formatter={(value) => [Number(value).toLocaleString(), "placed"]}
              />
              <Bar dataKey="placed" fill="url(#schemeBarGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="schemeBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6d28d9" />
                  <stop offset="100%" stopColor="#6d28d9" />
                </linearGradient>
              </defs>
            </ReBarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-sm leading-relaxed t-muted">
          National skilling programme tracked under <span className="t-brand">{scheme.scheme_id}</span>.
          {scheme.total_cost > 0 && (
            <> Total programme outlay of <span className="t-strong">₹{scheme.total_cost.toLocaleString()}</span>.</>
          )}
          {scheme.roi_score != null && (
            <> Estimated ROI score of <span className="t-strong">{scheme.roi_score}</span>.</>
          )}
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────── Partner coverage ─────────────────────────── */

function PartnerCoverageSection() {
  const { data, loading } = usePartnerCoverage();

  const states: PartnerCoverageState[] = data?.states ?? [];
  const maxPartners = states.reduce((m, s) => Math.max(m, s.partner_count), 1);
  const chartData = states.map((s) => ({ state: s.state, partners: s.partner_count }));
  const chartHeight = Math.max(240, Math.min(chartData.length * 30, 520));

  return (
    <section id="partners" className="relative z-10 mx-auto max-w-6xl scroll-mt-8 px-6 py-10">
      <SectionReveal className="glass glass-inner p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold t-strong">Training partners across India</h2>
            <p className="mt-1 t-muted">
              A pan-India network of certified training centers delivering skills on the ground.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip accent-chip">
              <Building2 className="h-3.5 w-3.5" />
              {loading ? "—" : (data?.total_partners ?? 0)} partners
            </span>
            <span className="chip accent-chip">
              <Users className="h-3.5 w-3.5" />
              {loading ? "—" : (data?.total_states ?? 0)} states
            </span>
            <span className="chip accent-chip">
              <GraduationCap className="h-3.5 w-3.5" />
              {loading ? "—" : (data?.total_courses ?? 0)} courses
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="skeleton h-72 rounded-2xl" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-10 rounded-xl" />
              ))}
            </div>
          </div>
        ) : !data || states.length === 0 ? (
          <div className="rounded-2xl border bd c3 p-10 text-center">
            <p className="t-muted">No partner coverage data available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="panel-title mb-3 text-sm font-semibold t-body">Partners per state</p>
              <div style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={chartData} layout="vertical" barCategoryGap="28%">
                    <CartesianGrid stroke="rgba(148,163,184,0.25)" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="rgba(148,163,184,0.5)"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="state"
                      width={130}
                      stroke="rgba(148,163,184,0.5)"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(148,163,184,0.12)" }}
                      contentStyle={{ background: "#0f0a1f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                      formatter={(value) => [Number(value).toLocaleString(), "partners"]}
                    />
                    <Bar dataKey="partners" fill="#6d28d9" radius={[0, 6, 6, 0]} barSize={14} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="lg:col-span-3">
              <p className="panel-title mb-3 text-sm font-semibold t-body">State footprint</p>
              <StaggerGroup className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
                {states.map((s) => (
                  <StaggerItem key={s.state}>
                    <div className="rounded-xl border bd c4 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold t-strong">{s.state}</span>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="chip accent-chip">{s.partner_count} partners</span>
                          <span className="chip accent-chip">{s.course_count} courses</span>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full c10">
                        <motion.div
                          className="h-full rounded-full bg-[var(--accent)]"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.max((s.partner_count / maxPartners) * 100, 4)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
          </div>
        )}
      </SectionReveal>
    </section>
  );
}

/* ─────────────────────────── National impact ─────────────────────────── */

function NationalImpactSection({ schemes, loading }: { schemes: PublicScheme[] | null; loading: boolean }) {
  const list = schemes ?? [];

  const totalEnrolled = list.reduce((s, x) => s + x.total_enrolled, 0);
  const placedSum = list.reduce((s, x) => s + (x.placed_12m || x.placed_6m || x.placed_3m), 0);
  const aggRate = totalEnrolled ? Math.round((placedSum / totalEnrolled) * 100) : 0;
  const salaried = list.filter((x) => x.avg_salary_at_placement != null);
  const avgSalary = salaried.length ? Math.round(salaried.reduce((s, x) => s + (x.avg_salary_at_placement ?? 0), 0) / salaried.length) : 0;
  const totalOutlay = list.reduce((s, x) => s + x.total_cost, 0);

  const costPerPlacement = list
    .map((x) => ({
      name: x.scheme_id,
      cpp: Math.round(x.total_cost / ((x.placed_12m || x.placed_6m || x.placed_3m) || 1)),
    }))
    .sort((a, b) => b.cpp - a.cpp)
    .slice(0, 8);

  const maxCpp = Math.max(...costPerPlacement.map((c) => c.cpp), 1);

  const kpis = [
    {
      label: "Learners trained",
      icon: Users,

      value: loading ? "—" : <span><AnimatedNumber value={totalEnrolled} /> <span className="text-sm font-semibold t-dim">learners</span></span>,
    },
    {
      label: "Aggregate placement",
      icon: Target,

      value: loading ? "—" : <span><AnimatedNumber value={aggRate} /><span className="text-sm font-semibold t-dim">% placed</span></span>,
    },
    {
      label: "Avg salary at placement",
      icon: IndianRupee,

      value: loading ? "—" : <span>₹<AnimatedNumber value={avgSalary} /> <span className="text-sm font-semibold t-dim">/mo</span></span>,
    },
    {
      label: "Programme outlay",
      icon: BarChart3,

      value: loading ? "—" : <span>₹<AnimatedNumber value={totalOutlay / 1e7} decimals={1} /><span className="text-sm font-semibold t-dim">Cr</span></span>,
    },
  ];

  return (
    <section id="impact" className="relative z-10 mx-auto max-w-6xl scroll-mt-8 px-6 py-10">
      <SectionReveal className="glass glass-inner p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold t-strong">National impact at a glance</h2>
            <p className="mt-1 t-muted">
              Aggregate outcomes across every tracked scheme — how far each rupee goes towards a job.
            </p>
          </div>
          <span className="chip">
            <LineChart className="h-3.5 w-3.5" />
            {list.length} schemes analysed
          </span>
        </div>

        <StaggerGroup className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map(({ label, icon: Icon, value }) => (
            <StaggerItem key={label}>
              <div className="rounded-xl border bd c4 p-4 text-left transition-colors hover:border-[var(--accent)]">
                <div className="tile mb-3 h-10 w-10 rounded-xl">
                  <Icon className="h-5 w-5 t-strong" />
                </div>
                <p className="text-xl font-bold t-strong">{value}</p>
                <p className="text-sm t-muted">{label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="panel-title mb-3 text-sm font-semibold t-body">Cost per placement by scheme</p>
            {loading ? (
              <div className="skeleton h-56 rounded-2xl" />
            ) : costPerPlacement.length === 0 ? (
              <p className="text-sm t-muted">No scheme analytics available yet.</p>
            ) : (
              <div className="space-y-3">
                {costPerPlacement.map((row, i) => (
                  <div key={row.name} className="flex items-center gap-3">
                    <span className="w-28 truncate text-xs font-medium t-body">{row.name}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full c10">
                      <motion.div
                        className="h-full rounded-full bg-[var(--accent)]"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max((row.cpp / maxCpp) * 100, 3)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right text-xs font-semibold t-strong">
                      ₹{row.cpp.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)
            ) : (
              <>
                <div className="rounded-xl border bd c4 p-4">
                  <p className="mb-1 text-xs uppercase tracking-wide t-muted">Most efficient</p>
                  <p className="text-base font-bold t-strong">
                    {costPerPlacement.length
                      ? `${costPerPlacement[costPerPlacement.length - 1].name} · ₹${costPerPlacement[costPerPlacement.length - 1].cpp.toLocaleString()}/placement`
                      : "—"}
                  </p>
                </div>
                <div className="rounded-xl border bd c4 p-4">
                  <p className="mb-1 text-xs uppercase tracking-wide t-muted">Highest outlay</p>
                  <p className="text-base font-bold t-strong">
                    {costPerPlacement.length ? `${costPerPlacement[0].name} · ₹${costPerPlacement[0].cpp.toLocaleString()}/placement` : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="mb-1 text-xs uppercase tracking-wide text-emerald-500">Takeaway</p>
                  <p className="text-sm leading-relaxed t-strong">
                    Every <span className="font-bold t-strong">₹1 crore</span> invested in these schemes produced an average of{" "}
                    <span className="font-bold t-strong">~{totalOutlay ? Math.max(1, Math.round(placedSum / (totalOutlay / 1e7))) : 0} placements</span>{" "}
                    within a year of training.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}

/* ─────────────────────────── Analytics spotlight ─────────────────────────── */

function AnalyticsSpotlight({
  stats,
  loading,
  schemes,
  schemeLoading,
}: {
  stats: ReturnType<typeof usePublicSummary>["data"];
  loading: boolean;
  schemes: PublicScheme[] | null;
  schemeLoading: boolean;
}) {
  const list = schemes ?? [];
  const gaugeValue = typeof stats?.overall_placement_rate === "number" ? Math.min(stats.overall_placement_rate, 100) : 0;

  const shortId = (id: string) => (id.length > 16 ? `${id.slice(0, 14)}…` : id);

  const pipelineData = list.slice(0, 5).map((s) => ({
    name: shortId(s.scheme_id),
    "3 mo": s.placed_3m,
    "6 mo": s.placed_6m,
    "12 mo": s.placed_12m,
  }));

  const byEnrollment = [...list].sort((a, b) => b.total_enrolled - a.total_enrolled).slice(0, 5);
  const completionData = byEnrollment.map((s) => ({ name: shortId(s.scheme_id), value: s.completion_rate }));
  const roiData = byEnrollment.filter((s) => s.roi_score != null).map((s) => ({ name: shortId(s.scheme_id), value: s.roi_score ?? 0 }));

  const ecoData = [
    { name: "Candidates", value: stats?.total_candidates ?? 0, color: "#6d28d9" },
    { name: "Enrollments", value: stats?.total_enrollments ?? 0, color: "#7c3aed" },
    { name: "Employers", value: stats?.total_employers ?? 0, color: "#818cf8" },
    { name: "Partners", value: stats?.total_training_partners ?? 0, color: "#a78bfa" },
    { name: "Courses", value: stats?.total_courses ?? 0, color: "#c7d2fe" },
    { name: "Skills", value: stats?.skills_taught ?? 0, color: "#94a3b8" },
  ];
  const ecoTotal = ecoData.reduce((s, e) => s + e.value, 1);

  const tooltipStyle = { background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: 10, fontSize: 12, color: "var(--tooltip-text)" };

  return (
    <section id="analytics" className="relative z-10 mx-auto max-w-6xl scroll-mt-8 px-6 py-10">
      <SectionReveal className="glass glass-inner p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-3xl font-bold t-strong">Outcome analytics, visualised</h2>
              <p className="mt-1 t-muted">
                Live roll-ups from the analytics engine — placement pipeline, programme efficiency and ecosystem footprint.
              </p>
            </div>
            <span className="chip">
              <TrendingUp className="h-3.5 w-3.5" />
              Live data
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Placement gauge */}
            <div className="rounded-2xl border bd c3 p-5">
              <p className="panel-title mb-2 text-sm font-semibold t-body">Placement engine</p>
              {loading ? (
                <div className="skeleton h-56 rounded-2xl" />
              ) : (
                <>
                  <div className="relative mx-auto h-52 w-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius={66} outerRadius={92} barSize={16} data={[{ name: "Placement rate", value: gaugeValue }]} startAngle={220} endAngle={-40}>
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar dataKey="value" background={{ fill: "rgba(255,255,255,0.06)" }} cornerRadius={12} fill="url(#gaugeGrad)" />
                        <defs>
                          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#818cf8" />
                          </linearGradient>
                        </defs>
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold t-strong">{Math.round(gaugeValue)}%</span>
                      <span className="text-xs t-muted">placement rate</span>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border bd c4 p-3 text-center">
                      <p className="text-lg font-bold t-strong">{(stats?.total_candidates ?? 0).toLocaleString()}</p>
                      <p className="text-xs t-muted">candidates</p>
                    </div>
                    <div className="rounded-xl border bd c4 p-3 text-center">
                      <p className="text-lg font-bold t-strong">{(stats?.total_enrollments ?? 0).toLocaleString()}</p>
                      <p className="text-xs t-muted">enrollments</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Placement pipeline grouped bars */}
            <div className="rounded-2xl border bd c3 p-5 lg:col-span-2">
              <p className="panel-title mb-3 text-sm font-semibold t-body">Placement pipeline by scheme</p>
              {schemeLoading ? (
                <div className="skeleton h-64 rounded-2xl" />
              ) : pipelineData.length === 0 ? (
                <p className="text-sm t-muted">No scheme analytics available yet.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={pipelineData} barGap={2} barCategoryGap="30%" margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(148,163,184,0.2)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={40} />
                      <Tooltip cursor={{ fill: "rgba(148,163,184,0.12)" }} contentStyle={tooltipStyle} labelStyle={{ color: "var(--tooltip-text)" }} formatter={(value) => [Number(value).toLocaleString(), ""]} />
                      <Legend iconSize={9} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                      <Bar dataKey="3 mo" fill="#6d28d9" radius={[4, 4, 0, 0]} barSize={12} />
                      <Bar dataKey="6 mo" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={12} />
                      <Bar dataKey="12 mo" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={12} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Completion & ROI horizontal bars */}
            <div className="rounded-2xl border bd c3 p-5 lg:col-span-2">
              <p className="panel-title mb-3 text-sm font-semibold t-body">Programme efficiency</p>
              {schemeLoading ? (
                <div className="space-y-3">
                  <div className="skeleton h-36 rounded-xl" />
                  <div className="skeleton h-36 rounded-xl" />
                </div>
              ) : completionData.length === 0 ? (
                <p className="text-sm t-muted">No scheme analytics available yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide t-muted">Completion rate</p>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart data={completionData} layout="vertical" barCategoryGap="30%">
                          <CartesianGrid stroke="rgba(148,163,184,0.2)" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="name" width={120} stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{ fill: "rgba(148,163,184,0.12)" }} contentStyle={tooltipStyle} labelStyle={{ color: "var(--tooltip-text)" }} formatter={(value) => [`${value}%`, "completion"]} />
                          <Bar dataKey="value" fill="#34d399" radius={[0, 6, 6, 0]} barSize={11} />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide t-muted">ROI score</p>
                    {roiData.length === 0 ? (
                      <p className="text-sm t-muted">No ROI data yet.</p>
                    ) : (
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <ReBarChart data={roiData} layout="vertical" barCategoryGap="30%">
                            <CartesianGrid stroke="rgba(148,163,184,0.2)" horizontal={false} />
                            <XAxis type="number" stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="name" width={120} stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: "rgba(148,163,184,0.12)" }} contentStyle={tooltipStyle} labelStyle={{ color: "var(--tooltip-text)" }} formatter={(value) => [Number(value), "ROI score"]} />
                            <Bar dataKey="value" fill="#fbbf24" radius={[0, 6, 6, 0]} barSize={11} />
                          </ReBarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ecosystem donut */}
            <div className="rounded-2xl border bd c3 p-5">
              <p className="panel-title mb-2 text-sm font-semibold t-body">Ecosystem footprint</p>
              {loading ? (
                <div className="skeleton h-56 rounded-2xl" />
              ) : (
                <>
                  <div className="relative mx-auto h-52 w-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie data={ecoData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={2} strokeWidth={0}>
                          {ecoData.map((e) => (
                            <Cell key={e.name} fill={e.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--tooltip-text)" }} formatter={(value) => [Number(value).toLocaleString(), ""]} />
                      </RePieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold t-strong">{(stats?.active_schemes ?? 0).toLocaleString()}</span>
                      <span className="text-xs t-muted">active schemes</span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {ecoData.map((e) => (
                      <div key={e.name} className="flex items-center gap-2 text-xs">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: e.color }} />
                        <span className="font-medium t-body">{e.name}</span>
                        <span className="ml-auto font-semibold t-strong">{e.value.toLocaleString()}</span>
                        <span className="w-10 text-right t-dim">{Math.round((e.value / ecoTotal) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
      </SectionReveal>
    </section>
  );
}

/* ─────────────────────────── Feature showcase tabbed ─────────────────────────── */

function FeatureShowcase() {
  const [active, setActive] = useState("gov");
  const current = revealTabs.find((t) => t.id === active) ?? revealTabs[0];

  return (
    <section id="features" className="relative z-10 mx-auto max-w-6xl scroll-mt-8 px-6 py-10">
      <SectionReveal>
        <h2 className="mb-2 text-center text-3xl font-bold t-strong">Built for real outcomes</h2>
        <p className="mb-10 text-center t-muted">
          Intelligence that turns training into measurable employment — pick a portal to explore.
        </p>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {revealTabs.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={`chip px-4 py-2 text-sm ${isActive
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "border bd c6 t-body hover:bg-[var(--chip-10)]"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="glass glass-inner overflow-hidden">
            <div className="flex flex-col gap-4 p-6 sm:p-8 md:flex-row md:items-center">
              <div className="md:w-1/3">
                <div className="tile mb-4 h-14 w-14 rounded-xl">
                  <current.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-2xl font-bold t-strong">{current.title}</h3>
                <p className="text-sm leading-relaxed t-muted">{current.desc}</p>
              </div>
              <div className="md:w-2/3">
                <div className="space-y-2">
                  {current.bullets.map((b) => (
                    <div key={b} className="flex items-center gap-3 rounded-xl border bd c4 p-3">
                      <span className="tile inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm font-medium t-strong">{b}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {current.tags.map((tag) => (
                    <span key={tag} className="chip accent-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}

/* ─────────────────────────── Live radar section ─────────────────────────── */

function LiveRadarSection({ stats }: { stats: ReturnType<typeof usePublicSummary>["data"] }) {
  const placements = Math.round(((stats?.total_candidates ?? 0) * (stats?.overall_placement_rate ?? 0)) / 100);

  const rows = [
    { icon: Users, label: "Candidates tracked", value: stats?.total_candidates ?? 0 },
    { icon: TrendingUp, label: "Placements recorded", value: placements },
    { icon: Building2, label: "Employers onboard", value: stats?.total_employers ?? 0 },
    { icon: GraduationCap, label: "Courses live", value: stats?.total_courses ?? 0 },
    { icon: Landmark, label: "Schemes tracked", value: stats?.active_schemes ?? 0 },
    { icon: BrainCircuit, label: "Training partners", value: stats?.total_training_partners ?? 0 },
  ];

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-10">
      <SectionReveal className="glass glass-inner p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold t-strong">Platform at a glance</h2>
            <p className="mt-1 t-muted">Live roll-up of the ecosystem tracked by SkillTrace AI.</p>
          </div>
          <span className="chip accent-chip">
            <TrendingUp className="h-3.5 w-3.5" />
            Live data
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border bd c4 p-4">
              <div className="tile mb-3 h-9 w-9 rounded-lg">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold t-strong">{value.toLocaleString()}</p>
              <p className="text-xs t-muted">{label}</p>
            </div>
          ))}
        </div>
      </SectionReveal>
    </section>
  );
}

/* ─────────────────────────── Home ─────────────────────────── */

export default function HomePage() {
  const { data: stats, loading } = usePublicSummary();
  const [schemeFilter, setSchemeFilter] = useState<string | null>(null);
  const { data: schemes, availableStates, loading: schemeLoading } = usePublicSchemes(schemeFilter);
  const [selectedScheme, setSelectedScheme] = useState<PublicScheme | null>(null);
  const closeModal = useCallback(() => setSelectedScheme(null), []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ScrollProgress />

      <ThemeToggle className="fixed right-4 top-4 z-[80]" />

      {/* Background */}
      <div className="astronomy pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <Starfield className="absolute inset-0 h-full w-full" />
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pb-16 pt-24 text-center">
        {/* Hero content */}
        <div className="flex w-full flex-col items-center">
          <img
            src="/icon.svg"
            alt="SkillTrace AI logo"
            className="mb-6 h-16 w-16 rounded-2xl shadow-lg"
          />
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border bd c8 px-4 py-1.5 text-xs font-semibold t-body">
            <span className="pill-dot" />
            Vocational Education Intelligence Platform
          </span>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight t-strong sm:text-6xl">
            Skill<span className="brand-gradient-text">Trace</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg t-body">
            Outcome tracking, skill-gap intelligence and labor analytics — from
            enrolment to placement, one verified journey.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/auth" className="btn-glass px-8 py-3 text-base">
              <LogIn className="h-5 w-5" />
              Enter your portal
            </Link>
            <Link href="#features" className="btn-ghost px-8 py-3 text-base">
              Explore features
            </Link>
          </div>

          {!loading && typeof stats?.overall_placement_rate === "number" && (
            <p className="mt-5 flex items-center gap-2 text-sm t-body">
              <span className="chip accent-chip">
                <span className="pill-dot" />
                {stats.overall_placement_rate}% placement rate
              </span>
              <span className="t-dim">across {stats.skills_taught} skills tracked</span>
            </p>
          )}

          {/* Stats bar */}
          <StaggerGroup className="mt-12 grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
            {pillars.map(({ key, label, icon: Icon }) => (
              <StaggerItem key={label} className="h-full">
                <div className="glass glass-inner card-hover h-full p-5 text-left">
                  <div className="tile mb-3 h-10 w-10 rounded-xl">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold t-strong">
                    {loading ? "—" : <CountUp end={stats?.[key] ?? 0} />}
                  </p>
                  <p className="text-sm t-muted">{label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── Skills ticker ────────────────────────────────────────────────── */}
      <section className="relative z-10 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-2">
          {skillTicker.map((skill) => (
            <span
              key={skill}
              className="t-body inline-flex items-center gap-2 rounded-full border bd c5 px-4 py-1.5 text-sm font-medium transition hover:border-[var(--accent)] hover:text-[var(--fg-strong)]"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* ── Roles ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <SectionReveal>
          <h2 className="mb-2 text-center text-3xl font-bold t-strong">One platform, four portals</h2>
          <p className="mb-10 text-center t-muted">
            Purpose-built workspaces for everyone in the skilling ecosystem.
          </p>
        </SectionReveal>
        <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map(({ icon: Icon, title, desc }) => (
            <StaggerItem key={title} className="h-full">
              <div className="glass card-hover h-full">
                <Link href="/auth" className="group block p-6">
                  <div className="tile mb-4 h-12 w-12 rounded-xl">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-1 text-lg font-bold t-strong">{title}</h3>
                  <p className="text-sm t-muted">{desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold gradient-text">
                    Sign in <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <FeatureShowcase />

      {/* ── Featured schemes ────────────────────────────────────────────── */}
      <section id="schemes" className="relative z-10 mx-auto max-w-6xl scroll-mt-8 px-6 py-10">
        <SectionReveal>
          <div className="mb-10 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <div>
              <h2 className="text-3xl font-bold t-strong">Featured skilling schemes</h2>
              <p className="mt-1 t-muted">National programmes driving vocational outcomes.</p>
            </div>
            <span className="chip">
              <Landmark className="h-3.5 w-3.5" />
              {stats?.active_schemes ?? "—"} schemes tracked
            </span>
          </div>
        </SectionReveal>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <motion.button
            type="button"
            onClick={() => setSchemeFilter(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`chip ${schemeFilter === null ? "bg-[var(--accent)] text-white" : "hover:[background:var(--chip-10)]"}`}
          >
            All states
          </motion.button>
          {availableStates.map((state) => {
            const active = schemeFilter === state;
            return (
              <motion.button
                key={state}
                type="button"
                onClick={() => setSchemeFilter(active ? null : state)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`chip ${active ? "bg-[var(--accent)] text-white" : "hover:[background:var(--chip-10)]"}`}
              >
                {state}
              </motion.button>
            );
          })}
        </div>

        {schemeFilter !== null && (
          <div className="mb-4 flex items-center gap-2 text-sm t-muted">
            <span>filtered by <span className="font-semibold t-brand">{schemeFilter}</span></span>
            <button
              type="button"
              onClick={() => setSchemeFilter(null)}
              className="chip hover:[background:var(--chip-10)]"
              aria-label="Clear state filter"
            >
              <span className="t-body">clear</span>
              <span className="t-muted">×</span>
            </button>
          </div>
        )}

        <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {schemeLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass glass-inner card-hover p-6">
                <div className="skeleton mb-3 h-14 w-14 rounded-2xl" />
                <div className="skeleton mb-2 h-5 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))
          ) : (schemes ?? []).map((sc) => {
            const rate = placementRate(sc);
            return (
              <StaggerItem key={sc.scheme_id} className="h-full">
                <div className="glass glass-inner card-hover h-full">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedScheme(sc)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedScheme(sc); } }}
                    className="cursor-pointer p-6"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-base font-bold t-strong">{sc.scheme_id}</h3>
                      <span className="chip accent-chip">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        View details
                      </span>
                    </div>
                    <p className="mb-4 text-3xl font-extrabold t-strong">
                      <CountUp end={sc.total_enrolled} />
                    </p>
                    <p className="mb-3 text-sm t-muted">learners enrolled</p>
                    <div className="mb-3 h-2 w-full overflow-hidden rounded-full c10">
                      <motion.div
                        className="h-full rounded-full bg-[var(--accent)]"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.min(sc.completion_rate, 100)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <p className="mb-4 text-xs t-muted">
                      {sc.completion_rate}% completion · <span className="t-brand">{rate}% placed</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl c5 p-2">
                        <p className="text-sm font-bold t-strong">{sc.placed_3m.toLocaleString()}</p>
                        <p className="text-[10px] t-muted">3-months</p>
                      </div>
                      <div className="rounded-xl c5 p-2">
                        <p className="text-sm font-bold t-strong">{sc.placed_6m.toLocaleString()}</p>
                        <p className="text-[10px] t-muted">6-months</p>
                      </div>
                      <div className="rounded-xl c5 p-2">
                        <p className="text-sm font-bold t-strong">{sc.placed_12m.toLocaleString()}</p>
                        <p className="text-[10px] t-muted">12-months</p>
                      </div>
                    </div>
                    {sc.avg_salary_at_placement != null && (
                      <p className="mt-4 text-xs t-muted">
                        Avg salary at placement{" "}
                        <span className="font-semibold text-emerald-500">
                          ₹{sc.avg_salary_at_placement.toLocaleString()}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </section>

      {/* ── National impact at a glance ──────────────────────────────────── */}
      <NationalImpactSection schemes={schemes} loading={schemeLoading} />

      {/* ── Outcome analytics, visualised ────────────────────────────────── */}
      <AnalyticsSpotlight stats={stats} loading={loading} schemes={schemes} schemeLoading={schemeLoading} />

      {/* ── Live network radar ──────────────────────────────────────────── */}
      <LiveRadarSection stats={stats} />

      {/* ── Training partners across India ──────────────────────────────── */}
      <PartnerCoverageSection />

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        <SectionReveal>
          <h2 className="mb-10 text-center text-3xl font-bold t-strong">How it works</h2>
        </SectionReveal>

        <div className="relative">
          <motion.div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px md:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ originX: 0 }}
          >
            <div className="h-full w-full bg-[var(--accent-soft)]" />
          </motion.div>

          <StaggerGroup className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {steps.map(({ n, icon: Icon, title, desc }) => (
              <StaggerItem key={n}>
                <div className="relative glass glass-inner card-hover p-6">
                  <div className="tile mb-3 h-10 w-10 rounded-xl">
                    <Icon className="h-5 w-5 t-strong" />
                  </div>
                  <span className="gradient-text text-3xl font-extrabold">{n}</span>
                  <h3 className="mt-2 text-base font-bold t-strong">{title}</h3>
                  <p className="text-sm t-muted">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        <SectionReveal>
          <div className="glass-strong card-hover p-10 text-center">
            <div>
              <div className="tile mx-auto mb-4 h-14 w-14 rounded-2xl">
                <CheckCircle2 className="h-7 w-7 t-strong" />
              </div>
              <h2 className="mb-3 text-3xl font-bold t-strong">Ready to connect skills to jobs?</h2>
              <p className="mx-auto mb-7 max-w-xl t-body">
                Join the growing ecosystem turning vocational training into verified employment outcomes.
              </p>
              <Link href="/auth" className="btn-glass px-10 py-3.5 text-base">
                Sign in to get started
                <ArrowUpRight className="h-5 w-5" />
              </Link>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs t-muted">
                <span className="chip c6"><ShieldCheck className="h-3 w-3 text-emerald-500" /> DigiLocker verified</span>
                <span className="chip c6"><Radio className="h-3 w-3 t-brand" /> Live analytics</span>
                <span className="chip c6"><Cloud className="h-3 w-3 text-sky-600" /> National scale</span>
              </div>
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t bd py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm t-muted">
          <span className="flex items-center gap-2 font-semibold t-strong">
            <FileText className="h-4 w-4 t-brand" /> SkillTrace AI
          </span>
          <span>Vocational education outcome tracking &amp; labor analytics</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>

      {selectedScheme && <SchemeModal scheme={selectedScheme} onClose={closeModal} />}
    </main>
  );
}
