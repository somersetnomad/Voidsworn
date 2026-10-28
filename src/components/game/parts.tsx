"use client";

import type { Status } from "@/lib/game/types";

/* ---------------- HP bar ---------------- */

export function HpBar({
  hp,
  maxHp,
  tempHp = 0,
  size = "md",
}: {
  hp: number;
  maxHp: number;
  tempHp?: number;
  size?: "sm" | "md" | "lg";
}) {
  const pct = Math.max(0, Math.min(100, (hp / Math.max(1, maxHp)) * 100));
  const tempPct = Math.max(0, Math.min(100 - pct, (tempHp / Math.max(1, maxHp)) * 100));
  const h = size === "lg" ? "h-5" : size === "md" ? "h-3.5" : "h-2.5";
  const low = pct <= 30;
  return (
    <div
      className={`relative w-full ${h} overflow-hidden rounded-full border border-white/15 bg-black/70 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]`}
    >
      {/* ghost trail: lags behind the real value so hits read as a chunk */}
      <div
        className="absolute inset-y-0 left-0 bg-white/25 transition-all delay-300 duration-[900ms]"
        style={{ width: `${pct}%` }}
      />
      <div
        className={`hp-fill absolute inset-y-0 left-0 overflow-hidden rounded-full transition-all duration-500 ${
          low
            ? "hp-low bg-[linear-gradient(90deg,#7f1d1d,#ef4444,#fb7185,#ef4444,#7f1d1d)] shadow-[0_0_14px_rgba(248,113,113,0.8)]"
            : "bg-[linear-gradient(90deg,#0e7490,#22d3ee,#a78bfa,#22d3ee,#0e7490)] shadow-[0_0_14px_rgba(34,211,238,0.6)]"
        }`}
        style={{ width: `${pct}%` }}
      />
      {tempHp > 0 && (
        <div
          className="absolute inset-y-0 bg-gradient-to-r from-amber-300/90 to-yellow-100/90 shadow-[0_0_12px_rgba(252,211,77,0.8)] transition-all duration-500"
          style={{ left: `${pct}%`, width: `${tempPct}%` }}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-wider text-white [text-shadow:0_1px_3px_rgba(0,0,0,1)]">
        {Math.max(0, hp)} / {maxHp}
        {tempHp > 0 ? ` (+${tempHp})` : ""}
      </div>
    </div>
  );
}

/* ---------------- spell slot pips ---------------- */

export function SlotPips({ slots, maxSlots }: { slots: number; maxSlots: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: Math.max(maxSlots, slots) }).map((_, i) => (
        <span
          key={i}
          style={{ animationDelay: `${i * 0.35}s` }}
          className={`star-pip inline-block h-4 w-4 transition-all duration-500 ${
            i < slots ? "lit bg-gradient-to-br from-yellow-100 via-amber-300 to-fuchsia-400" : "scale-75 bg-white/15"
          }`}
          aria-label={i < slots ? "Spell slot filled" : "Spell slot spent"}
        />
      ))}
    </div>
  );
}

/* ---------------- status chips ---------------- */

const STATUS_META: Record<string, { label: string; icon: string; cls: string }> = {
  hexed: { label: "Hexed", icon: "🪬", cls: "bg-violet-900/70 text-violet-200 border-violet-500/40" },
  burning: { label: "Burning", icon: "🔥", cls: "bg-orange-900/70 text-orange-200 border-orange-500/40" },
  doomed: { label: "Doomed", icon: "🕳️", cls: "bg-zinc-900/80 text-slate-200 border-zinc-500/40" },
  frightened: { label: "Frightened", icon: "😱", cls: "bg-amber-900/70 text-amber-200 border-amber-500/40" },
  repelled: { label: "Repelled", icon: "🌪️", cls: "bg-teal-900/70 text-teal-200 border-teal-500/40" },
  banished: { label: "Banished", icon: "🌀", cls: "bg-fuchsia-900/70 text-fuchsia-200 border-fuchsia-500/40" },
  cursed: { label: "Cursed", icon: "💀", cls: "bg-red-950/80 text-red-200 border-red-500/40" },
  evade: { label: "Evade", icon: "🌫️", cls: "bg-fuchsia-900/70 text-fuchsia-100 border-fuchsia-400/40" },
  brace: { label: "Brace", icon: "🛡️", cls: "bg-emerald-900/70 text-emerald-200 border-emerald-500/40" },
  empowered: { label: "Empowered", icon: "⚡", cls: "bg-amber-900/70 text-amber-100 border-amber-400/40" },
  shielded: { label: "Shielded", icon: "✨", cls: "bg-emerald-900/70 text-emerald-100 border-emerald-400/40" },
};

export function StatusChips({ statuses }: { statuses: Status[] }) {
  if (statuses.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {statuses.map((s, i) => {
        const meta = STATUS_META[s.id];
        if (!meta) return null;
        return (
          <span
            key={`${s.id}-${i}`}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.cls}`}
          >
            {meta.icon} {meta.label} {s.id === "repelled" ? "" : `${s.turns}`}
          </span>
        );
      })}
    </div>
  );
}

/* ---------------- floaters ---------------- */

const FLOATER_STYLE: Record<string, string> = {
  dmg: "text-rose-300 [text-shadow:0_0_14px_rgba(244,63,94,0.95),0_2px_4px_#000]",
  heal: "text-emerald-300 [text-shadow:0_0_14px_rgba(52,211,153,0.95),0_2px_4px_#000]",
  crit: "text-3xl text-amber-200 [text-shadow:0_0_20px_rgba(252,211,77,1),0_0_40px_rgba(251,146,60,0.8),0_2px_4px_#000]",
  miss: "text-sky-200/80 italic [text-shadow:0_2px_6px_#000]",
  status: "text-violet-200 [text-shadow:0_0_14px_rgba(167,139,250,0.95),0_2px_4px_#000]",
  buff: "text-fuchsia-200 [text-shadow:0_0_14px_rgba(232,121,249,0.95),0_2px_4px_#000]",
  gold: "text-amber-200 [text-shadow:0_0_14px_rgba(252,211,77,0.95),0_2px_4px_#000]",
};

export function Floater({ text, kind }: { text: string; kind: string }) {
  return (
    <span
      className={`floater absolute left-1/2 top-2 z-20 whitespace-nowrap font-display text-xl font-black ${
        FLOATER_STYLE[kind] ?? "text-white"
      }`}
    >
      {text}
    </span>
  );
}

/** Spell-impact burst: shockwave ring, white-hot core and flying shards. */
const IMPACT_COLOR: Record<string, string> = {
  dmg: "oklch(0.75 0.22 310)",
  crit: "oklch(0.88 0.16 80)",
  heal: "oklch(0.82 0.17 160)",
  status: "oklch(0.8 0.14 200)",
};

export function Impact({ kind }: { kind: string }) {
  const color = IMPACT_COLOR[kind];
  if (!color) return null;
  const shards = kind === "crit" ? 12 : 7;
  return (
    <span aria-hidden style={{ ["--impact" as string]: color }}>
      <span className="impact core" />
      <span className="impact" />
      {Array.from({ length: shards }).map((_, i) => (
        <span
          key={i}
          className="impact shard"
          style={{ ["--a" as string]: `${(360 / shards) * i + (i % 2) * 12}deg` }}
        />
      ))}
    </span>
  );
}

/* ---------------- dice roll chip ---------------- */

const OUTCOME_META: Record<string, { cls: string; label: string }> = {
  hit: { cls: "border-cyan-300/70 text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.35)]", label: "HIT" },
  crit: { cls: "border-amber-300 text-amber-200 shadow-[0_0_50px_rgba(252,211,77,0.6)]", label: "CRITICAL!" },
  miss: { cls: "border-slate-400/50 text-slate-300", label: "MISS" },
  fumble: { cls: "border-rose-400/80 text-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.4)]", label: "FUMBLE!" },
};

export function RollChip({
  label,
  d20,
  total,
  outcome,
}: {
  label: string;
  d20: number;
  total: number;
  outcome: string;
}) {
  const meta = OUTCOME_META[outcome] ?? OUTCOME_META.hit;
  return (
    <div
      className={`dice-pop pointer-events-none absolute left-1/2 top-0 z-30 flex items-center gap-3 rounded-2xl border-2 bg-[oklch(0.1_0.04_280/0.85)] px-4 py-2 backdrop-blur-md ${meta.cls}`}
    >
      <span className="relative flex h-11 w-11 items-center justify-center">
        <span className="d20 absolute inset-0 bg-current opacity-80" />
        <span className="d20 absolute inset-[2px] bg-gradient-to-br from-[oklch(0.3_0.1_290)] to-black" />
        <span className="relative font-display text-lg font-black">{d20}</span>
      </span>
      <span className="text-left">
        <span className="block text-[10px] uppercase tracking-widest opacity-80">{label}</span>
        <span className="block whitespace-nowrap text-sm font-bold">
          {meta.label} · {total}
        </span>
      </span>
    </div>
  );
}

/* ---------------- misc ---------------- */

export function GameHeader({ floor, floorName, round }: { floor: number; floorName: string; round?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="font-display text-sm uppercase tracking-[0.3em] text-cyan-200/80">
        Floor {floor} — {floorName}
      </div>
      {round !== undefined && (
        <div className="rounded-full border border-violet-500/30 bg-violet-950/60 px-3 py-1 text-xs font-semibold text-violet-200">
          Round {round}
        </div>
      )}
    </div>
  );
}
