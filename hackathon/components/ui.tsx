import type { ReactNode } from "react";

export type Tone =
  | "slate"
  | "emerald"
  | "sky"
  | "violet"
  | "amber"
  | "rose"
  | "zinc";

const TONES: Record<Tone, string> = {
  slate: "bg-slate-500/15 text-slate-300 ring-slate-400/25",
  emerald: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25",
  sky: "bg-sky-500/15 text-sky-300 ring-sky-400/25",
  violet: "bg-violet-500/15 text-violet-300 ring-violet-400/25",
  amber: "bg-amber-500/15 text-amber-300 ring-amber-400/25",
  rose: "bg-rose-500/15 text-rose-300 ring-rose-400/25",
  zinc: "bg-zinc-500/15 text-zinc-300 ring-zinc-400/25",
};

export function Badge({
  children,
  tone = "slate",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = "slate" }: { tone?: Tone }) {
  const color =
    tone === "emerald"
      ? "bg-emerald-400"
      : tone === "rose"
        ? "bg-rose-400"
        : tone === "amber"
          ? "bg-amber-400"
          : tone === "sky"
            ? "bg-sky-400"
            : "bg-slate-400";
  return <span className={`size-1.5 rounded-full ${color}`} />;
}

export function Card({
  title,
  subtitle,
  right,
  children,
  className = "",
  bodyClassName = "",
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_40px_-30px_rgba(0,0,0,0.9)] backdrop-blur ${className}`}
    >
      {(title || right) && (
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            {title && (
              <h2 className="truncate text-sm font-semibold text-zinc-100">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="truncate text-[11px] text-zinc-500">{subtitle}</p>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

export function ScoreRing({
  value,
  size = 96,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;
  const color =
    pct >= 80 ? "#34d399" : pct >= 65 ? "#38bdf8" : pct >= 50 ? "#fbbf24" : "#fb7185";

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-semibold text-zinc-100">{pct}</div>
        {label && <div className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>}
      </div>
    </div>
  );
}

export function Meter({ value, tone = "emerald" }: { value: number; tone?: Tone }) {
  const bar =
    tone === "sky"
      ? "bg-sky-400"
      : tone === "violet"
        ? "bg-violet-400"
        : tone === "amber"
          ? "bg-amber-400"
          : tone === "rose"
            ? "bg-rose-400"
            : "bg-emerald-400";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full ${bar} transition-[width] duration-700`}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </div>
  );
}
