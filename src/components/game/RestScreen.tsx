"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Action } from "@/lib/game/reducer";
import type { GameState } from "@/lib/game/types";
import { PlayerHud } from "./PlayerHud";

export function RestScreen({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: Action) => void;
}) {
  const [chosen, setChosen] = useState(false);
  const w = state.warlock;

  const options = [
    {
      mode: "slots" as const,
      icon: "🕯️",
      title: "Ritual of Renewal",
      desc: "Chalk circle, incense, four syllables your patron taught you. Restore ALL spell slots.",
      benefit: `Slots: ${w.slots} → ${w.maxSlots}`,
    },
    {
      mode: "hp" as const,
      icon: "🩹",
      title: "Bandage & Breathe",
      desc: "No magic. Just linen, water, and the stubborn refusal to die. Restore 60% of your max HP.",
      benefit: `HP: ${w.hp} → +${Math.ceil(w.maxHp * 0.6)}`,
    },
  ];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-4 py-10">
      <div className="rune-panel rise-in rounded-3xl p-6 sm:p-8">
        <div className="text-center">
          <span className="portal mx-auto !h-24 !w-24" style={{ ["--k" as string]: "oklch(0.8 0.15 175)" }}><span className="levitate">🔥</span></span>
          <h1 className="mt-3 font-display text-2xl font-black uppercase tracking-wider text-cosmic">
            Becalmed Orbit
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            For one hour, the void forgets you exist. Choose how to spend the mercy — it will not be offered twice.
          </p>
        </div>

        {!chosen ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {options.map((o) => (
              <button
                key={o.mode}
                type="button"
                onClick={() => {
                  dispatch({ type: "REST_CHOICE", mode: o.mode });
                  setChosen(true);
                }}
                style={{ ["--k" as string]: "oklch(0.8 0.15 175)" }}
                className="choice-card flex flex-col items-start rounded-2xl border border-teal-300/30 bg-black/30 p-5 text-left transition-all hover:-translate-y-1.5 hover:border-teal-300/80 hover:shadow-[0_16px_50px_-12px_rgba(45,212,191,0.6)]"
              >
                <span className="float-slow text-4xl drop-shadow-[0_0_14px_rgba(45,212,191,0.8)]">{o.icon}</span>
                <span className="mt-2 font-display text-base font-bold text-teal-100">{o.title}</span>
                <span className="mt-1 text-xs leading-relaxed text-slate-400">{o.desc}</span>
                <span className="mt-2 rounded-full border border-teal-300/30 bg-teal-950/60 px-3 py-1 text-[11px] font-semibold text-teal-200">
                  {o.benefit}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rise-in mt-6 text-center">
            <p className="text-sm italic text-slate-300">
              The fire burns low. Something in the dark honors the truce — mostly.
            </p>
            <Button
              size="lg"
              onClick={() => dispatch({ type: "REST_CONTINUE" })}
              className="mt-5 h-12 w-full btn-astral rounded-full font-display tracking-[0.25em]"
            >
              PRESS ON
            </Button>
          </div>
        )}
      </div>

      <PlayerHud w={w} compact />
    </div>
  );
}
