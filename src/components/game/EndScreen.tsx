"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getInvocation, getPatron } from "@/lib/game/content";
import type { Action } from "@/lib/game/reducer";
import type { GameState } from "@/lib/game/types";

export function computeScore(s: GameState, victory: boolean): number {
  return (
    s.warlock.gold +
    s.warlock.kills * 25 +
    (s.floor - 1) * 100 +
    Math.floor(s.stats.damageDealt / 10) +
    (victory ? 500 : 0)
  );
}

export function EndScreen({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: Action) => void;
}) {
  const victory = state.phase === "victory";
  const score = computeScore(state, victory);
  const savedRef = useRef(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    fetch("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: state.warlock.name,
        patron: state.warlock.patron,
        floor: state.floor,
        kills: state.warlock.kills,
        gold: state.warlock.gold,
        score,
        victory,
        cause: victory ? "Slew Vermithrax, the Ember-Sovereign" : state.deathCause || "The dungeon claimed another",
      }),
    })
      .then(() => setSaved(true))
      .catch(() => setSaved(false));
  }, [state.warlock.name, state.warlock.patron, state.warlock.kills, state.warlock.gold, state.floor, score, victory, state.deathCause]);

  const patron = getPatron(state.warlock.patron);
  const stat = (label: string, value: string | number) => (
    <div className="choice-card rounded-xl border border-cyan-300/15 bg-black/30 px-3 py-2.5 text-center hover:border-cyan-300/40">
      <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/50">{label}</p>
      <p className="mt-0.5 font-display text-xl font-bold text-slate-50">{value}</p>
    </div>
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 px-4 py-12">
      <div className="rune-panel rise-in rounded-3xl p-8 text-center">
        <span
          className="portal mx-auto !h-32 !w-32"
          style={{ ["--k" as string]: victory ? "oklch(0.86 0.15 80)" : "oklch(0.65 0.24 20)" }}
        >
          <span className={`levitate !text-6xl ${victory ? "" : "grayscale"}`}>{victory ? "🐉" : "⚰️"}</span>
        </span>
        <h1
          className={`mt-4 font-title text-3xl font-black uppercase tracking-[0.08em] sm:text-5xl ${
            victory ? "text-cosmic" : "text-rose-300 [text-shadow:0_0_30px_rgba(244,63,94,0.7)]"
          }`}
        >
          {victory ? "The Ember Throne Is Yours" : "Here Ends the Pact"}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
          {victory
            ? `${state.warlock.name}, ${patron.name}'s chosen, stood over the ruin of Vermithrax the Ember-Sovereign. The hoard is uncounted. The stories will be exaggerated. They will still undersell it.`
            : `${state.warlock.name} fell at fathom ${state.floor} of the void. The patron closes the ledger without comment and turns to the next name in the book.`}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stat("Fathom Reached", state.floor)}
          {stat("Kills", state.warlock.kills)}
          {stat("Gold", state.warlock.gold)}
          {stat("Score", score)}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stat("Damage Dealt", state.stats.damageDealt)}
          {stat("Damage Taken", state.stats.damageTaken)}
          {stat("Spells Cast", state.stats.spellsCast)}
          {stat("Criticals", state.stats.crits)}
        </div>

        {state.warlock.invocations.length > 0 && (
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            <span className="font-semibold text-violet-300/80">Invocations carved:</span>{" "}
            {state.warlock.invocations.map((id) => getInvocation(id).name).join(" · ")}
          </p>
        )}

        <p className="mt-4 text-[11px] italic text-slate-600">
          {saved ? "✦ Your star now burns in the Fallen Constellation." : "The stars are still aligning…"}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() => dispatch({ type: "GO_CREATE" })}
            className="h-13 flex-1 btn-astral rounded-full font-display tracking-[0.25em]"
          >
            ✒ SIGN A NEW PACT
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => dispatch({ type: "GO_TITLE" })}
            className="btn-ghost-astral h-13 flex-1 rounded-full font-display tracking-[0.2em]"
          >
            RETURN TO THE ECLIPSE
          </Button>
        </div>
      </div>
    </div>
  );
}

