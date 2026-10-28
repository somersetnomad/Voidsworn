"use client";

import { ROOM_META } from "@/lib/game/content";
import type { Action } from "@/lib/game/reducer";
import type { GameState } from "@/lib/game/types";
import { PlayerHud } from "./PlayerHud";

const KIND_COLOR: Record<string, string> = {
  combat: "oklch(0.68 0.24 20)",
  event: "oklch(0.72 0.22 300)",
  treasure: "oklch(0.86 0.15 80)",
  rest: "oklch(0.8 0.15 175)",
};

const KIND_TAG: Record<string, string> = {
  combat: "Danger · combat encounter",
  rest: "Safe · recover slots or HP",
  treasure: "Loot · choose one prize",
  event: "Mystery · consequences guaranteed",
};

/** Floor progress drawn as a constellation: lit stars are cleared rooms. */
function Constellation({ total, cleared }: { total: number; cleared: number }) {
  const pts = Array.from({ length: total }, (_, i) => {
    const x = 20 + (i * 260) / Math.max(1, total - 1);
    const y = 22 + (i % 2 === 0 ? -8 : 8) * (i === 0 || i === total - 1 ? 0.4 : 1);
    return { x, y };
  });
  return (
    <svg viewBox="0 0 300 44" className="mx-auto mt-5 h-12 w-full max-w-sm" aria-label={`${cleared} of ${total} rooms cleared`}>
      {pts.slice(1).map((p, i) => {
        const a = pts[i];
        const lit = i + 1 < cleared;
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={p.x}
            y2={p.y}
            className={lit ? "" : "const-line"}
            stroke={lit ? "oklch(0.85 0.14 200)" : "oklch(0.7 0.05 280 / 50%)"}
            strokeWidth={lit ? 1.4 : 1}
          />
        );
      })}
      {pts.map((p, i) => {
        const lit = i < cleared;
        const next = i === cleared;
        return (
          <g key={i} className={`const-star ${lit ? "lit" : ""}`} style={{ transformOrigin: `${p.x}px ${p.y}px` }}>
            {next && (
              <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="oklch(0.86 0.15 80 / 70%)" strokeWidth="1">
                <animate attributeName="r" values="5;11;5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={lit ? 4 : 3}
              fill={lit ? "oklch(0.95 0.08 200)" : next ? "oklch(0.86 0.15 80)" : "oklch(0.4 0.04 280)"}
              style={{ filter: lit || next ? "drop-shadow(0 0 4px oklch(0.85 0.14 200))" : undefined }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function MapScreen({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: Action) => void;
}) {
  const isBossFloor = state.floor === 5;
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-8 px-4 py-12">
      <header className="text-center">
        <p className="font-display text-[11px] uppercase tracking-[0.6em] text-cyan-200/70">
          ✦ Fathom {state.floor} of 5 ✦
        </p>
        <h1 className="text-cosmic mt-3 font-title text-4xl font-black uppercase tracking-[0.08em] sm:text-5xl">
          {state.floorName}
        </h1>
        <Constellation total={state.roomsPerFloor} cleared={state.roomsClearedThisFloor} />
        <p className="mx-auto mt-2 max-w-md text-xs text-slate-400">
          {isBossFloor
            ? "The starlight ends here. There is only one door left, and it is His."
            : "Two rifts open before you. The void folds shut behind — there is no going back."}
        </p>
      </header>

      <PlayerHud w={state.warlock} compact />

      <div className={`grid gap-5 ${isBossFloor ? "mx-auto w-full max-w-md" : "sm:grid-cols-2"}`}>
        {state.currentOptions.map((opt, i) => {
          const meta = ROOM_META[opt.kind];
          const color = isBossFloor ? "oklch(0.72 0.23 35)" : KIND_COLOR[opt.kind];
          return (
            <button
              key={`${opt.kind}-${i}`}
              type="button"
              onClick={() => dispatch({ type: "CHOOSE_ROOM", index: i })}
              style={{ ["--k" as string]: color, animationDelay: `${0.1 + i * 0.12}s` }}
              className="rune-panel portal-card choice-card rise-in group rounded-2xl p-6 text-left"
              aria-label={`${opt.name}: ${meta?.desc ?? opt.desc}`}
            >
              <div className="flex items-center gap-5">
                <div className="portal">
                  <span>{opt.icon}</span>
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold tracking-wide text-slate-50">{opt.name}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{opt.desc}</p>
                  <p
                    className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color, textShadow: `0 0 12px ${color}` }}
                  >
                    {isBossFloor ? "⚠ BOSS · Vermithrax, the Ember-Sovereign" : KIND_TAG[opt.kind]}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
