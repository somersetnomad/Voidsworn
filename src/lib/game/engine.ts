/* ============================================================
 * VOIDSWORN: Pact of the Fallen Star — engine: dice & combat math
 * ============================================================ */

import { getSpell, SPELLS } from "./content";
import type { Enemy, Status, StatusId, Warlock } from "./types";

/* ---------------- dice ---------------- */

export function d(sides: number): number {
  return 1 + Math.floor(Math.random() * sides);
}

export function roll(expr: string): number {
  // parses "2d8+3", "1d10", "3d6"
  const m = /^(\d+)d(\d+)([+-]\d+)?$/.exec(expr.replace(/\s/g, ""));
  if (!m) return parseInt(expr, 10) || 0;
  const count = parseInt(m[1], 10);
  const sides = parseInt(m[2], 10);
  const mod = m[3] ? parseInt(m[3], 10) : 0;
  let total = mod;
  for (let i = 0; i < count; i++) total += d(sides);
  return total;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export interface AttackResult {
  d20: number;
  total: number;
  hit: boolean;
  crit: boolean;
}

export function attackRoll(
  attackBonus: number,
  targetAc: number,
  opts: { adv?: boolean; critMin?: number } = {}
): AttackResult {
  const r1 = d(20);
  const r2 = opts.adv ? d(20) : 0;
  const d20 = opts.adv ? Math.max(r1, r2) : r1;
  const total = d20 + attackBonus;
  const critMin = opts.critMin ?? 20;
  const crit = d20 >= critMin;
  const hit = d20 === 1 ? false : crit || total >= targetAc;
  return { d20, total, hit, crit };
}

/* ---------------- status helpers (mutate the given array in place) ---------------- */

export function hasStatus(statuses: Status[], id: StatusId): boolean {
  return statuses.some((s) => s.id === id);
}

export function getStatus(statuses: Status[], id: StatusId): Status | undefined {
  return statuses.find((s) => s.id === id);
}

export function addStatus(statuses: Status[], id: StatusId, turns: number): boolean {
  const existing = statuses.find((s) => s.id === id);
  if (existing) {
    existing.turns = Math.max(existing.turns, turns);
    return false;
  }
  statuses.push({ id, turns });
  return true;
}

export function removeStatus(statuses: Status[], id: StatusId): void {
  const kept = statuses.filter((s) => s.id !== id);
  statuses.length = 0;
  for (const s of kept) statuses.push(s);
}

export function tickStatuses(statuses: Status[]): StatusId[] {
  const expired: StatusId[] = [];
  const kept = statuses.filter((s) => {
    s.turns -= 1;
    if (s.turns <= 0) {
      expired.push(s.id);
      return false;
    }
    return true;
  });
  statuses.length = 0;
  for (const s of kept) statuses.push(s);
  return expired;
}

/* ---------------- warlock derived stats ---------------- */

export function hasInvocation(w: Warlock, id: string): boolean {
  return w.invocations.includes(id);
}

export function ebBeams(w: Warlock): number {
  // 1 beam at L1-2, 2 at L3-4, 3 at L5
  return 1 + Math.floor((w.level - 1) / 2);
}

export function playerCritMin(w: Warlock): number {
  if (w.patron === "hexblade") return 19;
  return 20;
}

export function playerCritChance(w: Warlock): number {
  return 5 + w.critBonus;
}

export function effectivePlayerAc(w: Warlock, statuses: Status[]): number {
  let ac = w.ac;
  if (hasStatus(statuses, "brace")) ac += 2;
  if (hasStatus(statuses, "shielded")) ac += 3;
  return ac;
}

export function spellsKnown(level: number): string[] {
  return SPELLS.filter((s) => level >= s.level).map((s) => s.id);
}

/* ---------------- damage math ---------------- */

// total flat bonuses applied to a beam of eldritch blast
export function ebFlatBonus(w: Warlock): number {
  let flat = w.dmgBonus;
  if (hasInvocation(w, "agonizing_blast")) flat += w.spellAttack;
  return flat;
}

// flat bonuses for other damaging spells (blight, rebuke, vampiric touch…)
export function spellFlatBonus(w: Warlock): number {
  return w.dmgBonus + (hasInvocation(w, "lifedrinker") ? 3 : 0);
}

// per-hit global modifiers (hex / curse add 1d6)
export function targetBonusAgainst(w: Warlock, target: Enemy): number {
  let bonus = 0;
  if (hasStatus(target.statuses, "hexed") || hasStatus(target.statuses, "cursed")) bonus += roll("1d6");
  return bonus;
}
