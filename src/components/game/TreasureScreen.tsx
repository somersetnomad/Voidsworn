"use client";

import { Button } from "@/components/ui/button";
import { getItem } from "@/lib/game/content";
import type { Action } from "@/lib/game/reducer";
import type { GameState } from "@/lib/game/types";
import { PlayerHud } from "./PlayerHud";

export function TreasureScreen({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: Action) => void;
}) {
  if (!state.treasure) return null;
  const t = state.treasure;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-4 py-10">
      <div className="rune-panel rise-in rounded-3xl p-6 text-center sm:p-8">
        <span className="portal mx-auto !h-28 !w-28" style={{ ["--k" as string]: "oklch(0.86 0.15 80)" }}>
          <span className={`!text-5xl ${t.picked ? "grayscale" : "levitate"}`}>💰</span>
        </span>
        <h1 className="mt-3 font-display text-2xl font-black uppercase tracking-wider text-glow-ember">
          Fallen Star Cache
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          A meteor split open on impact; your patron’s mark cools inside it. Choose one prize — the rest crumbles to dust.
        </p>

        {!t.picked ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {t.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => dispatch({ type: "TAKE_TREASURE", index: i })}
                style={{ ["--k" as string]: "oklch(0.86 0.15 80)", animationDelay: `${i * 0.1}s` }}
                className="choice-card rise-in flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-amber-300/30 bg-black/30 p-4 transition-all hover:-translate-y-1.5 hover:border-amber-300/80 hover:shadow-[0_16px_50px_-12px_rgba(251,191,36,0.6)]"
              >
                {opt.itemId ? (
                  <>
                    <span className="float-slow text-4xl drop-shadow-[0_0_14px_rgba(252,211,77,0.8)]">{getItem(opt.itemId).icon}</span>
                    <span className="font-display text-sm font-bold text-amber-200">{getItem(opt.itemId).name}</span>
                    <span className="text-[11px] leading-snug text-slate-400">{getItem(opt.itemId).desc}</span>
                  </>
                ) : (
                  <>
                    <span className="float-slow text-4xl drop-shadow-[0_0_14px_rgba(252,211,77,0.8)]">🪙</span>
                    <span className="font-display text-sm font-bold text-amber-200">{opt.gold} Gold</span>
                    <span className="text-[11px] text-slate-400">Cold, heavy, honest.</span>
                  </>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="rise-in mt-6">
            <p className="rounded-2xl border border-amber-300/30 bg-amber-950/20 p-4 shadow-[inset_0_0_30px_rgba(251,191,36,0.12)] text-sm text-amber-100">
              {t.resultText}
            </p>
            <Button
              size="lg"
              onClick={() => dispatch({ type: "TREASURE_CONTINUE" })}
              className="mt-5 h-12 w-full btn-astral rounded-full font-display tracking-[0.25em]"
            >
              POCKET THE REST
            </Button>
          </div>
        )}
      </div>

      <PlayerHud w={state.warlock} compact />
    </div>
  );
}
