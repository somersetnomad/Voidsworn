"use client";

import { Button } from "@/components/ui/button";
import { getBargain, getPatron } from "@/lib/game/content";
import type { Action } from "@/lib/game/reducer";
import type { GameState } from "@/lib/game/types";

export function BargainScreen({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: Action) => void;
}) {
  if (!state.bargain) return null;
  const b = state.bargain;
  const patron = getPatron(state.warlock.patron);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-4 py-10">
      <div className="rune-panel rise-in rounded-3xl p-6 sm:p-8">
        <div className="text-center">
          <span className="portal mx-auto !h-28 !w-28" style={{ ["--k" as string]: "oklch(0.65 0.24 20)" }}><span className="levitate !text-5xl">{patron.icon}</span></span>
          <p className="mt-2 font-display text-xs uppercase tracking-[0.4em] text-slate-500">
            The Falling Rift · Fathom {state.floor} cleared
          </p>
          <h1 className="mt-2 font-display text-2xl font-black uppercase tracking-wider text-cosmic">
            Your Patron Offers a Bargain
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm italic leading-relaxed text-slate-400">
            {patron.name} speaks from the space behind your teeth. The rift down is right here. So is the deal.
            <span className="mt-1 block text-xs not-italic text-slate-500">
              You may refuse. Your patron will understand. That is somehow worse.
            </span>
          </p>
        </div>

        {!b.resolved ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {b.offers.map((id, i) => {
              const offer = getBargain(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => dispatch({ type: "BARGAIN_ACCEPT", index: i })}
                  style={{ ["--k" as string]: "oklch(0.65 0.24 20)", animationDelay: `${i * 0.1}s` }}
                  className="choice-card rise-in flex flex-col items-start rounded-2xl border border-rose-400/30 bg-gradient-to-b from-rose-950/40 to-black/40 p-5 text-left transition-all hover:-translate-y-1.5 hover:border-rose-300/80 hover:shadow-[0_16px_50px_-12px_rgba(244,63,94,0.7)]"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-3xl drop-shadow-[0_0_12px_rgba(244,63,94,0.9)]">{offer.icon}</span>
                    <span className="font-display text-base font-bold text-red-200">{offer.name}</span>
                  </span>
                  <span className="mt-2 text-xs leading-relaxed text-slate-400">{offer.desc}</span>
                  <span className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-red-950/70 px-2.5 py-1 text-[10px] font-semibold text-red-300">
                      PRICE · {offer.priceText}
                    </span>
                    <span className="rounded-full bg-emerald-950/70 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                      BOON · {offer.boonText}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rise-in mt-6">
            <p className="rounded-2xl border border-violet-300/30 bg-violet-950/20 p-4 shadow-[inset_0_0_30px_rgba(167,139,250,0.12)] text-sm leading-relaxed text-violet-100">
              {b.resultText}
            </p>
            <Button
              size="lg"
              onClick={() => dispatch({ type: "BARGAIN_CONTINUE" })}
              className="mt-5 h-12 w-full btn-astral rounded-full font-display tracking-[0.25em]"
            >
              ✦ FALL INTO THE RIFT
            </Button>
          </div>
        )}

        {!b.resolved && (
          <Button
            variant="ghost"
            onClick={() => dispatch({ type: "BARGAIN_REFUSE" })}
            className="mt-4 h-11 w-full text-slate-500 hover:bg-black/40 hover:text-slate-300"
          >
            Refuse — keep your soul intact
          </Button>
        )}
      </div>
    </div>
  );
}
