"use client";

import { getPatron } from "@/lib/game/content";
import type { Warlock } from "@/lib/game/types";
import { HpBar, SlotPips } from "./parts";

export function PlayerHud({ w, compact = false }: { w: Warlock; compact?: boolean }) {
  const patron = getPatron(w.patron);
  return (
    <div className="rune-panel rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center" aria-hidden>
          <span className="sigil-spin absolute inset-0 rounded-full border border-dashed border-cyan-300/40" />
          <span className="absolute inset-1.5 rounded-full bg-[radial-gradient(circle,oklch(0.6_0.22_300/0.5),transparent_70%)]" />
          <span className="relative text-2xl drop-shadow-[0_0_10px_rgba(167,139,250,0.9)]">{patron.icon}</span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold tracking-wider text-slate-50">
            {w.name} <span className="text-xs font-normal text-cyan-200/60">· Lv {w.level} {patron.name}</span>
          </p>
          <div className="mt-1.5">
            <HpBar hp={w.hp} maxHp={w.maxHp} tempHp={w.tempHp} size={compact ? "md" : "lg"} />
          </div>
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-200">
            <span title="Armor Class">🛡️ {w.ac}</span>
            <span title="Spell attack bonus">✦ +{w.spellAttack}</span>
            <span title="Gold">🪙 {w.gold}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-amber-200/60">Pact stars</span>
            <SlotPips slots={w.slots} maxSlots={w.maxSlots} />
          </div>
        </div>
      </div>
    </div>
  );
}
