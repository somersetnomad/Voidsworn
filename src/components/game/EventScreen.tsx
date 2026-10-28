"use client";

import { Button } from "@/components/ui/button";
import { getEvent } from "@/lib/game/content";
import type { Action } from "@/lib/game/reducer";
import type { GameState } from "@/lib/game/types";
import { PlayerHud } from "./PlayerHud";

export function EventScreen({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: Action) => void;
}) {
  if (!state.event) return null;
  const ev = getEvent(state.event.eventId);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-4 py-10">
      <div className="rune-panel rise-in rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="portal" style={{ ["--k" as string]: "oklch(0.72 0.22 300)" }}><span className="levitate">{ev.icon}</span></span>
          <h1 className="font-display text-2xl font-black uppercase tracking-wider text-cosmic">{ev.title}</h1>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">{ev.flavor}</p>

        {!state.event.resolved ? (
          <div className="mt-6 space-y-3">
            {ev.choices.map((ch, i) => {
              const tooPoor = !!ch.cost && state.warlock.gold < ch.cost;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={tooPoor}
                  onClick={() => dispatch({ type: "EVENT_CHOICE", index: i })}
                  style={{ animationDelay: `${i * 0.08}s` }}
                  className={`choice-card rise-in flex w-full flex-col items-start rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                    tooPoor
                      ? "cursor-not-allowed border-white/10 bg-black/20 opacity-40"
                      : "border-violet-300/25 bg-black/30 hover:border-cyan-300/60 hover:shadow-[0_10px_40px_-12px_rgba(139,92,246,0.8)]"
                  }`}
                >
                  <span className="font-display text-sm font-bold tracking-wide text-amber-200">✦ {ch.label}</span>
                  <span className="mt-1 text-xs text-slate-400">{ch.desc}</span>
                  {ch.cost ? <span className="mt-1 text-[10px] font-semibold text-amber-400/90">Cost: {ch.cost} gold</span> : null}
                  {ch.hpCost ? <span className="mt-1 text-[10px] font-semibold text-red-400/90">Cost: {ch.hpCost} HP</span> : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rise-in mt-6">
            <div className="rounded-2xl border border-cyan-300/30 bg-cyan-950/20 p-5 shadow-[inset_0_0_30px_rgba(34,211,238,0.1)]">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-200/80">✧ What the void returns</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">{state.event.resultText}</p>
            </div>
            <Button
              size="lg"
              onClick={() => dispatch({ type: "EVENT_CONTINUE" })}
              className="mt-5 h-12 w-full btn-astral rounded-full font-display tracking-[0.25em]"
            >
              WALK ON
            </Button>
          </div>
        )}
      </div>

      <PlayerHud w={state.warlock} compact />
    </div>
  );
}
