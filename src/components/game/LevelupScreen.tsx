"use client";

import { Button } from "@/components/ui/button";
import { getInvocation } from "@/lib/game/content";
import type { Action } from "@/lib/game/reducer";
import type { GameState } from "@/lib/game/types";

export function LevelupScreen({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: Action) => void;
}) {
  if (!state.levelup) return null;
  const lu = state.levelup;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <span className="portal mx-auto !h-28 !w-28" style={{ ["--k" as string]: "oklch(0.86 0.15 80)" }}><span className="levitate !text-5xl">⭐</span></span>
        <h1 className="mt-3 font-title text-5xl font-black uppercase tracking-wider text-cosmic">
          Level {lu.level}
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
          The pact swells with borrowed power. New spells stir in your grimoire, your spell attack sharpens —
          and the dark between words offers an <span className="font-semibold text-amber-300">Eldritch Invocation</span>. Choose one.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {lu.offers.map((id, i) => {
          const inv = getInvocation(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => dispatch({ type: "PICK_INVOCATION", id })}
              style={{ ["--k" as string]: "oklch(0.86 0.15 80)", animationDelay: `${i * 0.12}s` }}
              className="rune-panel portal-card choice-card rise-in group flex min-h-60 flex-col items-center rounded-2xl p-6 text-center"
            >
              <span className="portal"><span>{inv.icon}</span></span>
              <h2 className="mt-3 font-display text-base font-bold tracking-wide text-amber-200 text-glow-ember">{inv.name}</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{inv.desc}</p>
              <span className="mt-auto pt-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-200/90 opacity-0 transition-opacity group-hover:opacity-100">
                Carve this into your soul
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
