"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getPatron, getSpell, getItem } from "@/lib/game/content";
import { ebBeams, ebFlatBonus, spellsKnown } from "@/lib/game/engine";
import type { Action, CombatAction } from "@/lib/game/reducer";
import type { Enemy, GameState } from "@/lib/game/types";
import { PlayerHud } from "./PlayerHud";
import { Floater, HpBar, Impact, RollChip, StatusChips } from "./parts";

const TRAIT_AURA: Record<string, string> = {
  healer: "oklch(0.8 0.17 160)",
  drain: "oklch(0.65 0.25 345)",
  burn: "oklch(0.75 0.2 45)",
  fear: "oklch(0.7 0.22 300)",
  none: "oklch(0.8 0.14 210)",
};

function EnemyCard({
  e,
  index,
  selected,
  enraged,
  desperate,
  floaters,
  impacts,
  onClick,
}: {
  e: Enemy;
  index: number;
  selected: boolean;
  enraged: boolean;
  desperate: boolean;
  floaters: React.ReactNode;
  impacts: React.ReactNode;
  onClick: () => void;
}) {
  const dead = e.hp <= 0;
  const boss = e.kind === "boss";
  const aura = boss ? "oklch(0.72 0.23 35)" : (TRAIT_AURA[e.trait] ?? TRAIT_AURA.none);
  return (
    <button
      type="button"
      disabled={dead}
      onClick={onClick}
      aria-pressed={selected}
      style={{ ["--aura" as string]: aura }}
      className={`rune-panel relative flex w-full flex-col items-center gap-2 rounded-2xl p-4 pt-6 text-center transition-all duration-300 ${
        boss ? "max-w-lg px-8 py-8" : "min-w-[160px] max-w-[230px]"
      } ${
        dead
          ? "scale-95 opacity-30 grayscale"
          : selected
            ? "target-ring hover:-translate-y-1"
            : "opacity-85 hover:-translate-y-1 hover:opacity-100"
      }`}
    >
      {selected && !dead && <span className="target-reticle" aria-hidden />}
      {floaters}
      {impacts}
      {dead && <span className="soul-drift absolute top-6 text-3xl">✧</span>}
      <div
        className={`relative mb-2 flex items-center justify-center ${boss ? "h-36 w-36" : "h-20 w-20"} ${dead ? "" : "levitate"}`}
        style={{ animationDelay: `${index * -1.3}s` }}
      >
        {boss && !dead && <span className="boss-corona" aria-hidden />}
        <span
          className={`enemy-glyph relative ${boss ? "text-8xl" : "text-6xl"} ${boss ? "ember-breathe" : ""}`}
        >
          {e.icon}
        </span>
        {!dead && <span className="enemy-portal" aria-hidden />}
      </div>
      <h3
        className={`font-display text-sm font-bold tracking-wider ${
          dead ? "text-slate-500 line-through" : boss ? "text-lg text-amber-100 text-glow-ember" : "text-slate-50"
        }`}
      >
        {e.name}
      </h3>
      {!dead && <HpBar hp={e.hp} maxHp={e.maxHp} size={boss ? "lg" : "sm"} />}
      <StatusChips statuses={e.statuses} />
      {!dead && <p className="text-[10px] italic leading-snug text-slate-400/80">“{e.blurb}”</p>}
      {boss && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {enraged && (
            <span className="ember-breathe rounded-full border border-orange-300/70 bg-orange-950/70 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-200 shadow-[0_0_18px_rgba(251,146,60,0.6)]">
              🔥 Enraged
            </span>
          )}
          {desperate && (
            <span className="rounded-full border border-rose-300/70 bg-rose-950/70 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.6)]">
              💀 Desperate
            </span>
          )}
        </div>
      )}
    </button>
  );
}

export function CombatScreen({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: Action) => void;
}) {
  const c = state.combat!;
  const w = state.warlock;
  const patron = getPatron(w.patron);
  const [tray, setTray] = useState<"none" | "spells" | "items">("none");
  const logRef = useRef<HTMLDivElement>(null);

  const busy = c.awaitEnemy || c.over !== null;

  /* auto-dispatch enemy turn */
  useEffect(() => {
    if (!c.awaitEnemy || c.over) return;
    const t = setTimeout(() => dispatch({ type: "ENEMY_TURN" }), 1050);
    return () => clearTimeout(t);
  }, [c.awaitEnemy, c.round, c.over, dispatch]);

  /* auto-clear fx */
  useEffect(() => {
    if (state.fx.floaters.length === 0 && !state.fx.roll) return;
    const t = setTimeout(() => dispatch({ type: "CLEAR_FX" }), 1750);
    return () => clearTimeout(t);
  }, [state.fx.seq, dispatch]);

  /* autoscroll log */
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [state.log.length]);

  const act = (a: CombatAction) => {
    if (busy) return;
    setTray("none");
    dispatch({ type: "COMBAT_ACTION", action: a });
  };

  const beams = ebBeams(w);
  const flat = ebFlatBonus(w);
  const canStrike = w.patron === "hexblade" || w.invocations.includes("thirsting_blade");
  const knownSpells = spellsKnown(w.level).filter((id) => id !== "eldritch_blast");
  const logColor: Record<string, string> = {
    player: "text-cyan-200/90",
    enemy: "text-rose-300/90",
    info: "text-slate-400",
    crit: "text-amber-200 font-semibold [text-shadow:0_0_10px_rgba(252,211,77,0.6)]",
    loot: "text-amber-200/90",
    pact: "text-violet-200 font-semibold [text-shadow:0_0_10px_rgba(167,139,250,0.6)]",
  };

  const impactNodesFor = (target: string) => {
    const f = state.fx.floaters.find(
      (x) => x.target === target && (x.kind === "dmg" || x.kind === "crit" || x.kind === "status"),
    );
    return f ? <Impact key={`imp-${f.id}`} kind={f.kind} /> : null;
  };
  const playerHurt = state.fx.floaters.some((f) => f.target === "player" && f.kind === "dmg");
  const anyCrit = state.fx.floaters.some((f) => f.kind === "crit") || state.fx.roll?.outcome === "crit";

  const floaterNodesFor = (target: string) => (
    <>
      {state.fx.floaters
        .filter((f) => f.target === target)
        .map((f) => (
          <Floater key={f.id} text={f.text} kind={f.kind} />
        ))}
    </>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-4">
      {playerHurt && <div key={`hurt-${state.fx.seq}`} className="screen-flash hurt" aria-hidden />}
      {anyCrit && <div key={`crit-${state.fx.seq}`} className="screen-flash crit" aria-hidden />}
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-[11px] uppercase tracking-[0.4em] text-cyan-200/80">
          ✦ Fathom {state.floor} · {state.floorName}
        </p>
        <p className="shrink-0 whitespace-nowrap rounded-full border border-cyan-300/30 bg-[oklch(0.15_0.05_250/0.6)] px-4 py-1 font-display text-xs font-bold tracking-widest text-cyan-100 shadow-[0_0_20px_-4px_rgba(34,211,238,0.6)] backdrop-blur">
          ROUND {c.round}
        </p>
      </div>

      {/* telegraph banner */}
      {c.telegraph && !c.over && (
        <div className="telegraph rise-in mt-4 rounded-2xl border-2 px-4 py-4 text-center" role="alert">
          <p className="font-display text-base font-black uppercase tracking-[0.25em] text-orange-200 text-glow-ember">
            ⚠ {c.telegraph.name} INCOMING ⚠
          </p>
          <p className="mt-1 text-xs text-red-200/80">{c.telegraph.note}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-amber-300/90">
            Brace to halve it · Misty Step / Fey Step / evasion to nullify it
          </p>
        </div>
      )}

      <div
        key={state.fx.shake}
        className={state.fx.shake > 0 ? "shake" : ""}
      >
        {/* enemy row */}
        <div className="relative mt-8 flex flex-wrap items-stretch justify-center gap-4 sm:gap-6">
          <div className="pointer-events-none absolute -top-3 left-1/2 z-30 -translate-x-1/2">
            {state.fx.roll && <RollChip {...state.fx.roll} />}
          </div>
          {c.enemies.map((e, i) => (
            <EnemyCard
              key={e.uid}
              e={e}
              index={i}
              impacts={impactNodesFor(e.uid)}
              selected={c.targetUid === e.uid && e.hp > 0}
              enraged={c.enraged}
              desperate={c.desperate}
              floaters={floaterNodesFor(e.uid)}
              onClick={() => dispatch({ type: "SET_TARGET", uid: e.uid })}
            />
          ))}
        </div>
      </div>

      {c.awaitEnemy && !c.over && (
        <p className="mt-5 animate-pulse text-center font-display text-xs uppercase tracking-[0.4em] text-rose-300/90 [text-shadow:0_0_14px_rgba(244,63,94,0.8)]">
          ✧ The void stirs… ✧
        </p>
      )}

      {/* player + log */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <div className={`relative ${playerHurt ? "hit-flash" : ""}`} key={playerHurt ? `p-${state.fx.seq}` : "p"}>
            {floaterNodesFor("player")}
            <PlayerHud w={w} />
            <div className="mt-2">
              <StatusChips statuses={c.playerStatuses} />
            </div>
          </div>

          {/* trays */}
          {tray === "spells" && (
            <div className="rune-panel rise-in max-h-72 space-y-1.5 overflow-y-auto game-scroll rounded-xl p-3">
              {knownSpells.map((id) => {
                const sp = getSpell(id);
                const affordable = w.slots >= sp.cost && !busy;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={!affordable}
                    onClick={() => act({ kind: "spell", spellId: id })}
                    className={`flex w-full items-start gap-3 rounded-lg border p-2.5 text-left transition-colors ${
                      affordable
                        ? "choice-card border-violet-300/25 bg-black/30 hover:border-cyan-300/60 hover:bg-violet-950/40"
                        : "cursor-not-allowed border-white/5 bg-black/20 opacity-40"
                    }`}
                  >
                    <span className="text-2xl drop-shadow-[0_0_10px_rgba(167,139,250,0.9)]">{sp.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-display text-sm font-bold text-slate-100">{sp.name}</span>
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                          {sp.cost === 0 ? "cantrip" : `${sp.cost} slot${sp.cost > 1 ? "s" : ""}`}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-slate-400">{sp.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {tray === "items" && (
            <div className="rune-panel rise-in max-h-72 space-y-1.5 overflow-y-auto game-scroll rounded-xl p-3">
              {w.inventory.length === 0 ? (
                <p className="p-2 text-center text-xs italic text-slate-500">
                  Your pack holds only crumbs and regret. Find some gear.
                </p>
              ) : (
                w.inventory.map((inv) => {
                  const item = getItem(inv.itemId);
                  const usable = !busy;
                  return (
                    <button
                      key={inv.itemId}
                      type="button"
                      disabled={!usable}
                      onClick={() => act({ kind: "item", itemId: inv.itemId })}
                      className={`choice-card flex w-full items-start gap-3 rounded-lg border border-amber-300/30 bg-black/30 p-2.5 text-left transition-colors hover:border-amber-300/70 hover:bg-amber-950/20`}
                    >
                      <span className="text-2xl drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]">{item.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between">
                          <span className="font-display text-sm font-bold text-slate-100">
                            {item.name} <span className="text-amber-300">×{inv.count}</span>
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-snug text-slate-400">{item.desc}</span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* action bar */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            <Button
              disabled={busy}
              onClick={() => act({ kind: "eb" })}
              style={{ ["--tile" as string]: "oklch(0.72 0.24 305)" }}
              className="action-tile flex flex-col items-center justify-center gap-0.5"
            >
              <span className="tile-icon">🟣</span>
              <span className="text-[11px] font-bold leading-tight">Eldritch Blast</span>
              <span className="text-[9px] text-violet-200/80">
                {beams} beam{beams > 1 ? "s" : ""} · +{flat}/beam
              </span>
            </Button>
            {canStrike && (
              <Button
                disabled={busy}
                  onClick={() => act({ kind: "strike" })}
                style={{ ["--tile" as string]: "oklch(0.85 0.05 250)" }}
                className="action-tile flex flex-col items-center justify-center gap-0.5"
              >
                <span className="tile-icon">🗡️</span>
                <span className="text-[11px] font-bold leading-tight">Pact Strike</span>
                <span className="text-[9px] text-slate-200/80">
                  {w.invocations.includes("thirsting_blade") ? "×2 strikes" : "1d12 + mod"}
                </span>
              </Button>
            )}
            <Button
              disabled={busy}
              onClick={() => setTray(tray === "spells" ? "none" : "spells")}
              data-active={tray === "spells"}
              style={{ ["--tile" as string]: "oklch(0.82 0.14 200)" }}
              className="action-tile flex flex-col items-center justify-center gap-0.5"
            >
              <span className="tile-icon">📖</span>
              <span className="text-[11px] font-bold leading-tight">Spells</span>
              <span className="text-[9px] text-fuchsia-200/80">{w.slots}/{w.maxSlots} slots</span>
            </Button>
            <Button
              disabled={busy}
              onClick={() => setTray(tray === "items" ? "none" : "items")}
              data-active={tray === "items"}
              style={{ ["--tile" as string]: "oklch(0.86 0.15 80)" }}
              className="action-tile flex flex-col items-center justify-center gap-0.5"
            >
              <span className="tile-icon">🎒</span>
              <span className="text-[11px] font-bold leading-tight">Items</span>
              <span className="text-[9px] text-amber-200/80">{w.inventory.length} held</span>
            </Button>
            <Button
              disabled={busy}
              onClick={() => act({ kind: "brace" })}
              style={{ ["--tile" as string]: "oklch(0.8 0.17 160)" }}
              className="action-tile flex flex-col items-center justify-center gap-0.5"
            >
              <span className="tile-icon">🛡️</span>
              <span className="text-[11px] font-bold leading-tight">Brace</span>
              <span className="text-[9px] text-emerald-200/80">halve damage +2 AC</span>
            </Button>
          </div>

          {/* patron power */}
          <Button
            disabled={busy || c.patronUsed}
            onClick={() => act({ kind: "patron" })}
            className={`h-14 w-full whitespace-normal rounded-2xl px-3 font-display leading-tight tracking-[0.12em] ${
              c.patronUsed
                ? "cursor-not-allowed border border-white/10 bg-black/40 text-slate-500"
                : "btn-astral"
            }`}
          >
            {c.patronUsed
              ? `${patron.active.icon} ${patron.active.name} — spent this fight`
              : `${patron.active.icon} ${patron.active.name} · ${patron.name}'s Power (1/fight)`}
          </Button>
        </div>

        {/* log */}
        <div className="rune-panel flex max-h-[280px] flex-col rounded-xl lg:max-h-[520px]">
          <p className="border-b border-cyan-300/15 px-4 py-2.5 font-display text-[10px] uppercase tracking-[0.4em] text-cyan-200/70">
            ✧ The Void Speaks
          </p>
          <div ref={logRef} className="game-scroll flex-1 space-y-1 overflow-y-auto px-3 py-2 text-[11px] leading-relaxed">
            {state.log.map((l) => (
              <p key={l.id} className={`rise-in ${logColor[l.kind] ?? "text-slate-400"}`}>
                {l.text}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* victory / defeat overlay */}
      {c.over && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[oklch(0.05_0.02_280/0.75)] p-4 backdrop-blur-md">
          <div className="rune-panel rise-in w-full max-w-md rounded-3xl p-8 text-center">
            {c.over === "won" ? (
              <>
                <span className="float-slow inline-block text-7xl drop-shadow-[0_0_30px_rgba(252,211,77,0.8)]">
                  {c.isBoss ? "🐉" : "🏆"}
                </span>
                <h2 className="text-cosmic mt-3 font-display text-3xl font-black tracking-wider">
                  {c.isBoss ? "THE DRAGON FALLS" : "CHAMBER CLEARED"}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {c.isBoss
                    ? "Vermithrax collapses into a dying sun\u2019s worth of embers. The Ember Throne is yours."
                    : "The silence of the void returns, almost rude. You loot what is yours."}
                </p>
                <p className="mt-4 font-display text-lg font-bold text-amber-300">+{c.goldEarned} gold</p>
              </>
            ) : (
              <>
                <span className="float-slow inline-block text-7xl grayscale drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]">⚰️</span>
                <h2 className="mt-3 font-display text-3xl font-black tracking-wider text-rose-300 [text-shadow:0_0_24px_rgba(244,63,94,0.8)]">
                  YOU HAVE FALLEN
                </h2>
                <p className="mt-2 text-sm italic text-slate-400">
                  The pact dissolves like smoke. The dungeon adds your name to its floor.
                </p>
              </>
            )}
            <Button
              size="lg"
              onClick={() => dispatch({ type: "COMBAT_CONTINUE" })}
              className="btn-astral mt-6 h-12 w-full rounded-full font-display tracking-[0.25em]"
            >
              {c.over === "won" ? "CLAIM THE SPOILS" : "FACE THE END"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
