/* Patron comparison diagnostics */
import { gameReducer, initialState, type Action, type CombatAction } from "../src/lib/game/reducer";
import type { GameState } from "../src/lib/game/types";

const PATRONS = ["fiend", "goo", "archfey", "hexblade"] as const;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let fightRoundsTotal = 0;
let fightCount = 0;

function playCombat(box: { s: GameState }, dispatch: (a: Action) => void): void {
  let guard = 0;
  let rounds = 0;
  let lastRound = -1;
  while (box.s.phase === "combat" && guard < 300) {
    guard += 1;
    const s = box.s;
    const c = s.combat;
    if (!c) throw new Error("no combat");
    if (c.over) {
      dispatch({ type: "COMBAT_CONTINUE" });
      continue;
    }
    if (c.awaitEnemy) {
      dispatch({ type: "ENEMY_TURN" });
      if (s.combat && s.combat.round !== lastRound) {
        lastRound = s.combat.round;
        rounds += 1;
      }
      continue;
    }
    const w = s.warlock;
    const actions: CombatAction[] = [];
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
  if (box.s.phase === "combat") throw new Error("stuck combat");
  fightRoundsTotal += rounds;
  fightCount += 1;
}

function playRun(patron: (typeof PATRONS)[number]): { result: string; floor: number; hp: number; level: number; invocations: string[] } {
  const box: { s: GameState } = { s: initialState() };
  const dispatch = (a: Action) => {
    box.s = gameReducer(box.s, a);
  };
  dispatch({ type: "START_RUN", name: "Sim " + patron, patron });
  let guard = 0;
  while (box.s.phase !== "victory" && box.s.phase !== "gameover" && guard < 500) {
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
          if (Math.random() < 0.5) dispatch({ type: "BARGAIN_ACCEPT", index: 0 });
          else dispatch({ type: "BARGAIN_REFUSE" });
        } else {
          dispatch({ type: "BARGAIN_CONTINUE" });
        }
        break;
      case "levelup":
        dispatch({ type: "PICK_INVOCATION", id: box.s.levelup!.offers[0] });
        break;
    }
  }
  const st = box.s;
  return { result: st.phase, floor: st.floor, hp: Math.max(0, st.warlock.hp), level: st.warlock.level, invocations: st.warlock.invocations };
}

for (const patron of PATRONS) {
  let wins = 0;
  let floorSum = 0;
  const invCount: Record<string, number> = {};
  fightRoundsTotal = 0;
  fightCount = 0;
  for (let i = 0; i < 40; i++) {
    const r = playRun(patron);
    if (r.result === "victory") wins += 1;
    floorSum += r.floor;
    for (const inv of r.invocations) invCount[inv] = (invCount[inv] ?? 0) + 1;
  }
  console.log(
    `${patron}: wins ${wins}/40, avg floor ${((floorSum / 40)).toFixed(2)}, avg fight rounds ${(fightRoundsTotal / Math.max(1, fightCount)).toFixed(1)}, invocations:`,
    invCount
  );
}
