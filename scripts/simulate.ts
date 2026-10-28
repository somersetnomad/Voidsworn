/* Headless stress test: simulates full game runs through the reducer.
 * Verifies: no crashes, phase flow reaches victory/gameover, balance stats.
 * Run: bun scripts/simulate.ts
 */
import { gameReducer, initialState, type Action, type CombatAction } from "../src/lib/game/reducer";
import type { GameState } from "../src/lib/game/types";

const PATRONS = ["fiend", "goo", "archfey", "hexblade"] as const;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function playCombat(box: { s: GameState }, dispatch: (a: Action) => void, maxRounds = 60): void {
  let guard = 0;
  while (box.s.phase === "combat" && guard < maxRounds * 3) {
    guard += 1;
    const s = box.s;
    const c = s.combat;
    if (!c) throw new Error("combat phase with no combat state");
    if (c.over) {
      dispatch({ type: "COMBAT_CONTINUE" });
      continue;
    }
    if (c.awaitEnemy) {
      dispatch({ type: "ENEMY_TURN" });
      continue;
    }
    const w = s.warlock;
    const actions: CombatAction[] = [];
    // heuristic AI: use spells when sensible, blast otherwise
    if (w.slots > 0) {
      const target = c.enemies.find((e) => e.hp > 0);
      if (c.isBoss && w.slots >= 2 && w.level >= 4) actions.push({ kind: "spell", spellId: "blight" });
      else if (c.enemies.filter((e) => e.hp > 0).length >= 2) actions.push({ kind: "spell", spellId: "arms_of_hadar" });
      else if (target && !target.statuses.some((st) => st.id === "hexed")) actions.push({ kind: "spell", spellId: "hex" });
      else if (c.telegraph) actions.push({ kind: "brace" });
    }
    if (c.telegraph && Math.random() < 0.7) actions.push({ kind: "brace" });
    if (!c.patronUsed) actions.push({ kind: "patron" });
    if (w.patron === "hexblade" || w.invocations.includes("thirsting_blade")) actions.push({ kind: "strike" });
    actions.push({ kind: "eb" });
    const healing = w.inventory.find((i) => i.itemId === "potion_healing");
    if (healing && w.hp < w.maxHp * 0.4) actions.push({ kind: "item", itemId: "potion_healing" });
    dispatch({ type: "COMBAT_ACTION", action: pick(actions) });
  }
  if (box.s.phase === "combat") {
    console.error("STUCK STATE:", JSON.stringify({ combat: box.s.combat, warlock: { ...box.s.warlock, inventory: box.s.warlock.inventory } }, null, 2));
    throw new Error("combat did not terminate: floor " + box.s.floor);
  }
}

function playRun(patron: (typeof PATRONS)[number]): { result: string; floor: number; hp: number } {
  const box: { s: GameState } = { s: initialState() };
  const dispatch = (a: Action) => {
    box.s = gameReducer(box.s, a);
  };
  dispatch({ type: "START_RUN", name: "Sim " + patron, patron });
  let guard = 0;
  while (box.s.phase !== "victory" && box.s.phase !== "gameover" && guard < 400) {
    guard += 1;
    switch (box.s.phase) {
      case "map":
        dispatch({ type: "CHOOSE_ROOM", index: Math.floor(Math.random() * box.s.currentOptions.length) });
        break;
      case "combat":
        playCombat(box, dispatch);
        break;
      case "event":
        if (!box.s.event!.resolved) dispatch({ type: "EVENT_CHOICE", index: Math.floor(Math.random() * 3) });
        else dispatch({ type: "EVENT_CONTINUE" });
        break;
      case "treasure":
        if (!box.s.treasure!.picked) dispatch({ type: "TAKE_TREASURE", index: 0 });
        else dispatch({ type: "TREASURE_CONTINUE" });
        break;
      case "rest":
        dispatch({ type: "REST_CHOICE", mode: box.s.warlock.slots < box.s.warlock.maxSlots ? "slots" : "hp" });
        dispatch({ type: "REST_CONTINUE" });
        break;
      case "bargain":
        if (!box.s.bargain!.resolved) {
          // accept about half the time
          if (Math.random() < 0.5) dispatch({ type: "BARGAIN_ACCEPT", index: 0 });
          else dispatch({ type: "BARGAIN_REFUSE" });
        } else {
          dispatch({ type: "BARGAIN_CONTINUE" });
        }
        break;
      case "levelup":
        dispatch({ type: "PICK_INVOCATION", id: box.s.levelup!.offers[0] });
        break;
      default:
        throw new Error("unexpected phase " + box.s.phase);
    }
  }
  const st = box.s;
  if (st.phase !== "victory" && st.phase !== "gameover") {
    throw new Error("run stalled in phase " + st.phase + " on floor " + st.floor);
  }
  return {
    result: st.phase,
    floor: st.floor,
    hp: Math.max(0, st.warlock.hp),
  };
}

/* ------------ run ------------ */
const N = 300;
let wins = 0;
let losses = 0;
const floorLoss: Record<number, number> = {};
const patronWins: Record<string, { w: number; n: number }> = {};
for (let i = 0; i < N; i++) {
  const patron = PATRONS[i % PATRONS.length];
  const r = playRun(patron);
  if (!patronWins[patron]) patronWins[patron] = { w: 0, n: 0 };
  patronWins[patron].n += 1;
  if (r.result === "victory") {
    wins += 1;
    patronWins[patron].w += 1;
  } else {
    losses += 1;
    floorLoss[r.floor] = (floorLoss[r.floor] ?? 0) + 1;
  }
}
console.log(`Runs: ${N} | wins: ${wins} (${((wins / N) * 100).toFixed(1)}%) | losses: ${losses}`);
console.log("Deaths by floor:", floorLoss);
for (const [p, v] of Object.entries(patronWins)) {
  console.log(`  ${p}: ${v.w}/${v.n} wins (${((v.w / v.n) * 100).toFixed(0)}%)`);
}
console.log("ALL RUNS COMPLETED WITHOUT CRASHES ✔");
