/* ============================================================
 * VOIDSWORN: Pact of the Fallen Star — game reducer (all state transitions)
 * ============================================================ */

import {
  BARGAINS,
  BOSS_TEMPLATE,
  ENEMY_TEMPLATES,
  EVENTS,
  FLOOR_NAMES,
  getBargain,
  getEvent,
  getInvocation,
  getItem,
  getPatron,
  getSpell,
  ROOM_META,
} from "./content";
import {
  addStatus,
  attackRoll,
  d,
  ebBeams,
  ebFlatBonus,
  effectivePlayerAc,
  hasStatus,
  pick,
  playerCritMin,
  randInt,
  removeStatus,
  roll,
  shuffle,
  spellsKnown,
  spellFlatBonus,
  tickStatuses,
} from "./engine";
import type {
  CombatState,
  EventEffect,
  Enemy,
  EnemyTemplate,
  FxState,
  GameState,
  LogKind,
  PatronId,
  RoomKind,
  RoomOption,
  Status,
} from "./types";

export type CombatAction =
  | { kind: "eb" }
  | { kind: "spell"; spellId: string }
  | { kind: "strike" }
  | { kind: "brace" }
  | { kind: "item"; itemId: string }
  | { kind: "patron" };

export type Action =
  | { type: "START_RUN"; name: string; patron: PatronId }
  | { type: "GO_CREATE" }
  | { type: "GO_TITLE" }
  | { type: "CHOOSE_ROOM"; index: number }
  | { type: "SET_TARGET"; uid: string }
  | { type: "COMBAT_ACTION"; action: CombatAction }
  | { type: "ENEMY_TURN" }
  | { type: "COMBAT_CONTINUE" }
  | { type: "EVENT_CHOICE"; index: number }
  | { type: "EVENT_CONTINUE" }
  | { type: "TAKE_TREASURE"; index: number }
  | { type: "TREASURE_CONTINUE" }
  | { type: "REST_CHOICE"; mode: "slots" | "hp" }
  | { type: "REST_CONTINUE" }
  | { type: "BARGAIN_ACCEPT"; index: number }
  | { type: "BARGAIN_REFUSE" }
  | { type: "BARGAIN_CONTINUE" }
  | { type: "PICK_INVOCATION"; id: string }
  | { type: "CLEAR_FX" };

/* ---------------- progression tables ---------------- */

export function levelStats(level: number): { maxHp: number; maxSlots: number; spellAttack: number } {
  const t = [
    { maxHp: 32, maxSlots: 1, spellAttack: 4 }, // L1
    { maxHp: 40, maxSlots: 2, spellAttack: 5 }, // L2
    { maxHp: 48, maxSlots: 2, spellAttack: 6 }, // L3
    { maxHp: 56, maxSlots: 3, spellAttack: 7 }, // L4
    { maxHp: 64, maxSlots: 3, spellAttack: 8 }, // L5
  ];
  return t[Math.min(level, 5) - 1];
}

let uidCounter = 0;
function nextUid(): string {
  uidCounter += 1;
  return `e${uidCounter}`;
}

/* ---------------- initial state ---------------- */

export function initialState(): GameState {
  return {
    phase: "title",
    floor: 1,
    roomsClearedThisFloor: 0,
    roomsPerFloor: 3,
    currentOptions: [],
    warlock: {
      name: "",
      patron: "fiend",
      level: 1,
      hp: 32,
      maxHp: 32,
      tempHp: 0,
      ac: 14,
      spellAttack: 4,
      dmgBonus: 0,
      critBonus: 0,
      slots: 1,
      maxSlots: 1,
      invocations: [],
      inventory: [],
      gold: 0,
      kills: 0,
      patronUsedThisFight: false,
      reviveUsed: false,
    },
    combat: null,
    event: null,
    treasure: null,
    bargain: null,
    levelup: null,
    log: [],
    fx: { floaters: [], roll: null, shake: 0, seq: 1 },
    stats: { damageDealt: 0, damageTaken: 0, spellsCast: 0, crits: 0, roomsCleared: 0 },
    deathCause: "",
    floorName: FLOOR_NAMES[0],
  };
}

/* ---------------- helpers ---------------- */

function clone(s: GameState): GameState {
  return structuredClone(s);
}

function nextSeq(s: GameState): number {
  s.fx.seq += 1;
  return s.fx.seq;
}

function pushLog(s: GameState, text: string, kind: LogKind = "info"): void {
  s.log.push({ id: nextSeq(s), text, kind });
  if (s.log.length > 80) s.log = s.log.slice(-80);
}

function addFloater(s: GameState, target: string, text: string, kind: FxState["floaters"][number]["kind"]): void {
  s.fx.floaters.push({ id: nextSeq(s), target, text, kind });
}

function setRoll(s: GameState, who: string, label: string, d20: number, total: number, outcome: "hit" | "crit" | "miss" | "fumble"): void {
  s.fx.roll = { id: nextSeq(s), who, label, d20, total, outcome };
}

function shake(s: GameState): void {
  s.fx.shake += 1;
}

function makeEnemy(tpl: EnemyTemplate, floor: number): Enemy {
  return {
    uid: nextUid(),
    templateId: tpl.id,
    name: tpl.name,
    icon: tpl.icon,
    hp: tpl.hp,
    maxHp: tpl.hp,
    ac: tpl.ac,
    attackBonus: tpl.attackBonus,
    damage: tpl.damage,
    statuses: [],
    trait: tpl.trait,
    blurb: tpl.blurb,
    gold: randInt(tpl.gold[0], tpl.gold[1]) + (floor - 1) * 4,
    kind: tpl.id === "vermithrax" ? "boss" : "normal",
    pattern: 0,
  };
}

const HEAVY_IDS = new Set(["ogre_brute", "stone_golem"]);

function poolForFloor(floor: number): EnemyTemplate[] {
  return ENEMY_TEMPLATES.filter((t) => t.floors.includes(floor));
}

export function generateCombat(floor: number, isBoss: boolean): CombatState {
  if (isBoss) {
    const boss = makeEnemy(BOSS_TEMPLATE, floor);
    return {
      enemies: [boss],
      targetUid: boss.uid,
      round: 1,
      playerStatuses: [],
      awaitEnemy: false,
      over: null,
      isBoss: true,
      telegraph: null,
      enraged: false,
      desperate: false,
      breathCount: 0,
      pearlUsed: false,
      patronUsed: false,
      protectorsUsed: false,
      goldEarned: 0,
    };
  }
  const pool = poolForFloor(floor);
  const count = floor === 1 ? randInt(1, 2) : 2;
  const enemies: Enemy[] = [];
  if (count === 1) {
    enemies.push(makeEnemy(pick(pool), floor));
  } else {
    const a = pick(pool);
    enemies.push(makeEnemy(a, floor));
    const aHeavy = HEAVY_IDS.has(a.id) || a.hp >= 40;
    const light = pool.filter((t) => !HEAVY_IDS.has(t.id) && t.hp < 40 && t.id !== a.id);
    const anyOther = pool.filter((t) => t.id !== a.id);
    const bPool = aHeavy ? (light.length > 0 ? light : anyOther) : anyOther;
    enemies.push(makeEnemy(pick(bPool.length > 0 ? bPool : pool), floor));
  }
  return {
    enemies,
    targetUid: enemies[0].uid,
    round: 1,
    playerStatuses: [],
    awaitEnemy: false,
    over: null,
    isBoss: false,
    telegraph: null,
    enraged: false,
    desperate: false,
    breathCount: 0,
    pearlUsed: false,
    patronUsed: false,
    protectorsUsed: false,
    goldEarned: 0,
  };
}

function rollRoomKind(floor: number, cleared: number, avoid?: RoomKind): RoomKind {
  if (floor === 1 && cleared === 0 && avoid === undefined) return "combat";
  let kind: RoomKind = "combat";
  let guard = 0;
  do {
    const r = Math.random();
    if (r < 0.55) kind = "combat";
    else if (r < 0.72) kind = "event";
    else if (r < 0.86) kind = "treasure";
    else kind = "rest";
    guard += 1;
  } while (avoid && kind === avoid && guard < 12);
  return kind;
}

function generateRoomOptions(s: GameState): RoomOption[] {
  const first = rollRoomKind(s.floor, s.roomsClearedThisFloor);
  const second = rollRoomKind(s.floor, s.roomsClearedThisFloor, first);
  return [first, second].map((k) => ({
    kind: k,
    name: k === "combat" && s.floor === 5 ? "The Ember Throne" : ROOM_META[k].name,
    icon: ROOM_META[k].icon,
    desc: k === "combat" && s.floor === 5 ? "Vermithrax is waiting. He has always been waiting." : ROOM_META[k].desc,
  }));
}

function startFight(s: GameState): void {
  const c = generateCombat(s.floor, s.floor === 5);
  if (s.warlock.patron === "archfey") {
    c.playerStatuses.push({ id: "evade", turns: 2 });
  }
  s.combat = c;
  s.phase = "combat";
  const names = c.enemies.map((e) => e.name).join(" and ");
  pushLog(s, `You enter the chamber. ${names} bar the way.`, "info");
  if (s.floor === 5) pushLog(s, "Vermithrax spreads wings that blacken the ceiling. The Ember Throne regards you.", "pact");
}

function aliveEnemies(c: CombatState): Enemy[] {
  return c.enemies.filter((e) => e.hp > 0);
}

function currentTarget(s: GameState): Enemy | null {
  if (!s.combat) return null;
  const c = s.combat;
  return c.enemies.find((e) => e.uid === c.targetUid && e.hp > 0) ?? aliveEnemies(c)[0] ?? null;
}

function dealToEnemy(s: GameState, enemy: Enemy, amount: number, source: string): void {
  const w = s.warlock;
  const dealt = Math.min(enemy.hp, Math.max(1, amount));
  enemy.hp = Math.max(0, enemy.hp - amount);
  s.stats.damageDealt += dealt;
  addFloater(s, enemy.uid, `-${dealt}`, "dmg");
  if (hasStatus(enemy.statuses, "cursed") && dealt > 0) {
    const heal = Math.floor(dealt / 2);
    if (heal > 0) {
      const healed = Math.min(w.maxHp - w.hp, heal);
      if (healed > 0) {
        w.hp += healed;
        addFloater(s, "player", `+${healed}`, "heal");
      }
    }
  }
  if (enemy.hp <= 0) {
    if (hasStatus(enemy.statuses, "cursed")) {
      const temp = 8 + w.level;
      w.tempHp += temp;
      addFloater(s, "player", `+${temp} temp`, "buff");
      pushLog(s, `The blade collects ${enemy.name}'s name: ${temp} temp HP.`, "pact");
    }
    killEnemy(s, enemy, source);
  }
}

function killEnemy(s: GameState, enemy: Enemy, _source: string): void {
  const w = s.warlock;
  w.kills += 1;
  if (s.combat) s.combat.goldEarned += enemy.gold;
  addFloater(s, enemy.uid, "☠", "status");
  pushLog(s, `${enemy.name} falls. (+${enemy.gold} gold)`, "loot");
  if (w.patron === "fiend") {
    const temp = 4 + w.level;
    w.tempHp += temp;
    addFloater(s, "player", `+${temp} temp`, "buff");
    pushLog(s, `Dark One's Blessing: the Fiend drinks its essence — ${temp} temp HP.`, "pact");
  }
}

function playerTakeDamage(s: GameState, rawAmount: number, source: string): void {
  const w = s.warlock;
  const c = s.combat;
  let amount = rawAmount;
  if (c && hasStatus(c.playerStatuses, "brace")) amount = Math.ceil(amount / 2);
  if (w.tempHp > 0) {
    const absorbed = Math.min(w.tempHp, amount);
    w.tempHp -= absorbed;
    amount -= absorbed;
    if (absorbed > 0) addFloater(s, "player", `-${absorbed}`, "status");
  }
  if (amount > 0) {
    w.hp -= amount;
    s.stats.damageTaken += amount;
    addFloater(s, "player", `-${amount}`, "dmg");
  }
  shake(s);
  if (w.hp <= 0) {
    tryRevive(s, source);
  }
}

function tryRevive(s: GameState, source: string): void {
  const w = s.warlock;
  // 1. Whispers of the Grave (once per run)
  if (w.invocations.includes("whispers_of_the_grave") && !w.reviveUsed) {
    w.reviveUsed = true;
    w.hp = Math.max(1, Math.floor(w.maxHp * 0.3));
    pushLog(s, "Death reaches for you — and finds the pact already holding the door. Whispers of the Grave revives you!", "pact");
    addFloater(s, "player", "REVIVED", "buff");
    return;
  }
  // 2. Phoenix Ash Vial (inventory, once per run)
  const ashIdx = w.inventory.findIndex((i) => i.itemId === "phoenix_ash" && i.count > 0);
  if (ashIdx >= 0) {
    w.inventory[ashIdx].count -= 1;
    if (w.inventory[ashIdx].count <= 0) w.inventory.splice(ashIdx, 1);
    w.hp = Math.max(1, Math.floor(w.maxHp * 0.25));
    pushLog(s, "The Phoenix Ash Vial ignites. You rise from your own cinders at 25% HP.", "pact");
    addFloater(s, "player", "REBORN", "buff");
    return;
  }
  // 3. Gift of the Protectors (once per fight)
  if (w.invocations.includes("gift_of_the_protectors") && s.combat && !s.combat.protectorsUsed) {
    s.combat.protectorsUsed = true;
    w.hp = 1;
    pushLog(s, "An unseen ward refuses the blow. Gift of the Protectors holds you at 1 HP!", "pact");
    addFloater(s, "player", "WARDED", "buff");
    return;
  }
  if (s.combat) s.combat.over = "lost";
  s.deathCause = source;
  pushLog(s, `The pact falls silent. ${source}`, "enemy");
}

function critMinFor(s: GameState): number {
  const w = s.warlock;
  const base = playerCritMin(w);
  return Math.max(17, base - Math.floor(w.critBonus / 5));
}

function attackOnce(
  s: GameState,
  enemy: Enemy,
  label: string,
  dice: string,
  flat: number,
  opts: { spellTag?: "eb" | "other" } = {}
): void {
  const w = s.warlock;
  const c = s.combat;
  if (!c) return;
  const frightened = c.playerStatuses.some((p) => p.id === "frightened");
  const res = attackRoll(w.spellAttack - (frightened ? 4 : 0), enemy.ac, { critMin: critMinFor(s) });
  const outcome = res.d20 === 1 ? "fumble" : res.crit ? "crit" : res.hit ? "hit" : "miss";
  setRoll(s, "player", label, res.d20, res.total, outcome);
  if (!res.hit) {
    addFloater(s, enemy.uid, "MISS", "miss");
    pushLog(s, `${label} misses ${enemy.name} (rolled ${res.d20}+${w.spellAttack}).`, "player");
    return;
  }
  let dmg = roll(dice) + flat;
  if (res.crit) dmg += roll(dice); // crit doubles the dice
  if (hasStatus(enemy.statuses, "hexed") || hasStatus(enemy.statuses, "cursed")) dmg += roll("1d6");
  if (w.patron === "goo" && res.crit) dmg += roll("1d6");
  if (opts.spellTag === "eb" && c.playerStatuses.some((p) => p.id === "empowered")) {
    dmg += roll("1d10");
    removeStatus(c.playerStatuses, "empowered");
  }
  if (res.crit) {
    s.stats.crits += 1;
    addFloater(s, enemy.uid, "CRIT!", "crit");
    shake(s);
  }
  pushLog(
    s,
    `${label} hits ${enemy.name} for ${dmg}${res.crit ? " — CRITICAL!" : ""} (d20 ${res.d20}).`,
    res.crit ? "crit" : "player"
  );
  dealToEnemy(s, enemy, dmg, label);
  if (opts.spellTag === "eb" && w.invocations.includes("repelling_blast") && enemy.hp > 0) {
    addStatus(enemy.statuses, "repelled", 1);
    const st = enemy.statuses.find((x) => x.id === "repelled");
    if (st) st.power = 3;
  }
}

function splashMaddening(s: GameState, hitEnemy: Enemy): void {
  const w = s.warlock;
  const c = s.combat;
  if (!c || !w.invocations.includes("maddening_hex")) return;
  for (const e of aliveEnemies(c)) {
    if (e.uid === hitEnemy.uid) continue;
    const splash = roll("1d6");
    addFloater(s, e.uid, `-${splash}`, "dmg");
    dealToEnemy(s, e, splash, "Maddening Hex");
  }
}

function aoeDamage(s: GameState, dice: string, flat: number, label: string): void {
  const c = s.combat;
  if (!c) return;
  for (const e of aliveEnemies(c)) {
    let dmg = roll(dice) + flat;
    if (hasStatus(e.statuses, "hexed") || hasStatus(e.statuses, "cursed")) dmg += roll("1d6");
    pushLog(s, `${label} sears ${e.name} for ${dmg}.`, "player");
    dealToEnemy(s, e, dmg, label);
  }
}

function checkCombatWon(s: GameState): void {
  const c = s.combat;
  if (!c || c.over) return;
  if (aliveEnemies(c).length === 0) {
    c.over = "won";
    c.awaitEnemy = false;
    pushLog(s, "The chamber falls silent. The way is clear.", "loot");
  }
}

/* ---------------- enemy turn ---------------- */

function enemyTurn(s: GameState): void {
  const w = s.warlock;
  const c = s.combat;
  if (!c || c.over) return;

  // resolve pending telegraph first (dragon breath lands now)
  let bossActedViaBreath = false;
  if (c.telegraph) {
    const boss = c.enemies.find((e) => e.kind === "boss");
    const tel = c.telegraph;
    c.telegraph = null;
    c.breathCount += 1;
    if (boss) {
      boss.pattern += 1;
      bossActedViaBreath = true;
      pushLog(s, `${tel.name} erupts across the chamber!`, "enemy");
      if (c.playerStatuses.some((p) => p.id === "evade")) {
        removeStatus(c.playerStatuses, "evade");
        addFloater(s, "player", "EVADED!", "buff");
        pushLog(s, "You step sideways through the flame itself. Not a hair is singed.", "player");
      } else {
        const dmg = roll(tel.nextDamage);
        setRoll(s, boss.uid, tel.name, d(20), dmg, "hit");
        playerTakeDamage(s, dmg, tel.name);
        pushLog(s, `The fire washes over you for ${dmg} damage!`, "enemy");
      }
    }
  }

  for (const enemy of aliveEnemies(c)) {
    if (c.over) break;
    if (enemy.hp <= 0) continue;
    if (enemy.kind === "boss" && bossActedViaBreath) continue;

    // banished enemies skip
    if (hasStatus(enemy.statuses, "banished")) {
      pushLog(s, `${enemy.name} is elsewhere, screaming in a place without walls.`, "info");
      continue;
    }

    if (enemy.kind === "boss") {
      bossAct(s, enemy);
      continue;
    }

    // healer trait: sometimes heals an ally instead of attacking
    if (enemy.trait === "healer" && Math.random() < 0.3) {
      const wounded = aliveEnemies(c).filter((e) => e.uid !== enemy.uid && e.hp < e.maxHp);
      if (wounded.length > 0) {
        const target = wounded[0];
        const heal = 12;
        target.hp = Math.min(target.maxHp, target.hp + heal);
        addFloater(s, target.uid, `+${heal}`, "heal");
        pushLog(s, `${enemy.name} chants — ${target.name} knits back together (+${heal}).`, "enemy");
        continue;
      }
    }

    // Great Old One passive: 15% of attacks simply fail to find you real
    if (w.patron === "goo" && Math.random() < 0.2) {
      addFloater(s, "player", "UNREAL", "miss");
      pushLog(s, `${enemy.name} swings at you — and its blade passes through smoke. (Entropic Mind)`, "player");
      continue;
    }

    if (c.playerStatuses.some((p) => p.id === "evade")) {
      removeStatus(c.playerStatuses, "evade");
      addFloater(s, "player", "EVADED", "miss");
      pushLog(s, `${enemy.name} strikes — mist folds around you and the blow finds nothing.`, "player");
      continue;
    }

    const ac = effectivePlayerAc(w, c.playerStatuses);
    const fearDebuff = hasStatus(enemy.statuses, "frightened") ? 4 : 0;
    const res = attackRoll(enemy.attackBonus - fearDebuff, ac);
    const outcome = res.d20 === 1 ? "fumble" : res.crit ? "crit" : res.hit ? "hit" : "miss";
    setRoll(s, enemy.uid, enemy.name, res.d20, res.total, outcome);
    if (!res.hit) {
      addFloater(s, "player", "MISS", "miss");
      pushLog(s, `${enemy.name} attacks and misses (d20 ${res.d20}).`, "enemy");
      continue;
    }
    let dmg = roll(enemy.damage);
    if (res.crit) dmg += roll(enemy.damage);
    if (hasStatus(enemy.statuses, "hexed")) dmg -= 2;
    if (hasStatus(enemy.statuses, "doomed")) dmg -= 3;
    const repelled = enemy.statuses.find((x) => x.id === "repelled");
    if (repelled) dmg -= repelled.power ?? 3;
    dmg = Math.max(1, dmg);
    if (res.crit) {
      dmg = Math.max(1, dmg);
      addFloater(s, "player", "CRIT!", "crit");
    }
    pushLog(s, `${enemy.name} hits you for ${dmg} damage.`, "enemy");
    playerTakeDamage(s, dmg, `${enemy.name} attacked`);

    // traits on hit
    if (w.hp > 0) {
      if (enemy.trait === "burn" && Math.random() < 0.6) {
        addStatus(c.playerStatuses, "burning", 2);
        addFloater(s, "player", "BURNING", "status");
        pushLog(s, "Fire gnaws into your wounds. You are Burning (2/turn).", "enemy");
      }
      if (enemy.trait === "drain") {
        w.maxHp = Math.max(15, w.maxHp - 1);
        w.hp = Math.max(1, w.hp - 1);
        addFloater(s, "player", "DRAINED", "status");
        pushLog(s, "The wraith drinks of you. Max HP -1.", "enemy");
      }
      if (enemy.trait === "fear" && Math.random() < 0.5) {
        addStatus(c.playerStatuses, "frightened", 2);
        addFloater(s, "player", "FEAR", "status");
        pushLog(s, "Visions you cannot unsee: -4 to your attacks for 2 turns.", "enemy");
      }
    }
  }

  // end of enemy phase: tick everything
  tickEndOfRound(s);
  checkCombatWon(s);
  if (c.over === "won") return;
  c.round += 1;
  c.awaitEnemy = false;
}

function bossAct(s: GameState, boss: Enemy): void {
  const c = s.combat;
  const w = s.warlock;
  if (!c) return;
  boss.pattern += 1;
  const hpFrac = boss.hp / boss.maxHp;

  // Great Old One passive applies to the dragon as well
  if (w.patron === "goo" && Math.random() < 0.2) {
    addFloater(s, "player", "UNREAL", "miss");
    pushLog(s, "The claw descends — and passes through smoke. You were never quite here. (Entropic Mind)", "player");
    return;
  }

  // phase transitions
  if (!c.enraged && hpFrac <= 0.6) {
    c.enraged = true;
    pushLog(s, "VERMITHRX ROARS — the crown-fire blazes white. The air itself ignites! (+5 damage)", "pact");
    addFloater(s, boss.uid, "ENRAGED", "status");
  }
  if (!c.desperate && hpFrac <= 0.25) {
    c.desperate = true;
    pushLog(s, "The Ember-Sovereign's wings sag. Desperation makes dragons honest.", "pact");
  }

  // breath cycle: charge on pattern 3 (or 2 when desperate), unleash next turn
  const chargeTurn = c.desperate ? 2 : 3;
  if (boss.pattern % (chargeTurn + 1) === chargeTurn) {
    const name = c.desperate ? "CATACLYSM" : "DRAGON BREATH";
    c.telegraph = {
      name,
      nextDamage: c.desperate ? "4d8+3" : "3d8+3",
      note: c.desperate
        ? "Vermithrax drinks the furnace of the mountain. BRACE or EVADE — or be buried in fire."
        : "The Ember-Sovereign gathers flame in its throat. BRACE or EVADE next turn!",
    };
    pushLog(s, `⚠ ${boss.name} gathers flame — ${name} incoming! Brace or evade!`, "pact");
    addFloater(s, boss.uid, "CHARGING…", "status");
    return;
  }

  if (c.playerStatuses.some((p) => p.id === "evade")) {
    removeStatus(c.playerStatuses, "evade");
    addFloater(s, "player", "EVADED", "miss");
    pushLog(s, "The dragon's claw closes on mist. (Evaded)", "player");
    return;
  }

  const ac = effectivePlayerAc(w, c.playerStatuses);
  const res = attackRoll(boss.attackBonus - 1 + (c.enraged ? 1 : 0), ac);
  const outcome = res.d20 === 1 ? "fumble" : res.crit ? "crit" : res.hit ? "hit" : "miss";
  setRoll(s, boss.uid, "Claw", res.d20, res.total, outcome);
  if (!res.hit) {
    addFloater(s, "player", "MISS", "miss");
    pushLog(s, `The claw rakes air where you were (d20 ${res.d20}).`, "enemy");
    return;
  }
  let dmg = roll(boss.damage) + (c.enraged ? 4 : 0);
  if (res.crit) dmg += roll(boss.damage);
  pushLog(s, `Vermithrax's claw tears into you for ${dmg} damage.`, "enemy");
  playerTakeDamage(s, dmg, "Vermithrax's claw");
}

function tickEndOfRound(s: GameState): void {
  const c = s.combat;
  const w = s.warlock;
  if (!c) return;

  // enemy status ticks
  for (const e of aliveEnemies(c)) {
    if (hasStatus(e.statuses, "burning")) {
      const dmg = 2;
      e.hp -= dmg;
      addFloater(s, e.uid, `-${dmg}`, "status");
      if (e.hp <= 0) killEnemy(s, e, "Burning");
      continue;
    }
    if (hasStatus(e.statuses, "doomed")) {
      const dmg = 4;
      e.hp -= dmg;
      addFloater(s, e.uid, `-${dmg}`, "status");
      if (e.hp <= 0) {
        killEnemy(s, e, "Hunger of Hadar");
        continue;
      }
    }
    tickStatuses(e.statuses);
  }

  // player status ticks
  if (c.playerStatuses.some((p) => p.id === "burning")) {
    playerTakeDamage(s, 2, "Burning wounds");
    if (w.hp <= 0 && (!c || c.over === "lost")) return;
  }
  tickStatuses(c.playerStatuses);
}

/* ---------------- level up ---------------- */

function offerInvocations(s: GameState): string[] {
  const w = s.warlock;
  let pool = shuffle(
    INVOCATION_IDS.filter((id) => !w.invocations.includes(id)).filter(
      (id) => !(w.patron === "hexblade" && id === "thirsting_blade")
    )
  );
  if (w.invocations.length === 0 && !w.invocations.includes("agonizing_blast") && w.patron !== "hexblade") {
    pool = ["agonizing_blast", ...pool.filter((id) => id !== "agonizing_blast")];
  }
  return pool.slice(0, 3);
}

const INVOCATION_IDS = [
  "agonizing_blast",
  "repelling_blast",
  "devils_sight",
  "fiendish_vigor",
  "thirsting_blade",
  "maddening_hex",
  "visions_of_distant_realms",
  "whispers_of_the_grave",
  "gift_of_the_protectors",
  "lifedrinker",
];

function doLevelUp(s: GameState): void {
  const w = s.warlock;
  w.level += 1;
  const ls = levelStats(w.level);
  const hpGain = ls.maxHp - w.maxHp;
  w.maxHp = ls.maxHp;
  w.hp = Math.min(ls.maxHp, w.hp + hpGain);
  w.maxSlots = ls.maxSlots;
  w.spellAttack = ls.spellAttack;
  pushLog(s, `⭐ LEVEL ${w.level} — the pact deepens. (+${hpGain} max HP, spell attack +${w.spellAttack})`, "pact");
  s.levelup = { level: w.level, offers: offerInvocations(s) };
  s.phase = "levelup";
}

function afterRoomCleared(s: GameState): void {
  s.stats.roomsCleared += 1;
  s.roomsClearedThisFloor += 1;
  if (s.roomsClearedThisFloor >= s.roomsPerFloor && s.floor < 5) {
    // stairway: dark bargain
    s.bargain = {
      offers: shuffle(BARGAINS.map((b) => b.id)).slice(0, 2),
      resolved: false,
      resultText: "",
    };
    s.phase = "bargain";
    return;
  }
  s.currentOptions = generateRoomOptions(s);
  s.phase = "map";
}

/* ---------------- events / effects ---------------- */

function applyEffect(s: GameState, effect: EventEffect): string {
  const w = s.warlock;
  switch (effect.kind) {
    case "heal": {
      if (effect.value === 99) {
        const healed = w.maxHp - w.hp;
        w.hp = w.maxHp;
        return effect.text;
      }
      const amt = effect.value ?? 10;
      const healed = Math.min(w.maxHp - w.hp, amt);
      w.hp += healed;
      if (healed > 0) addFloater(s, "player", `+${healed}`, "heal");
      return effect.text;
    }
    case "damage": {
      const amt = effect.value ?? 5;
      w.hp -= amt;
      s.stats.damageTaken += amt;
      addFloater(s, "player", `-${amt}`, "dmg");
      if (w.hp <= 0) {
        w.hp = 1;
        return `${effect.text} You cling to consciousness by a thread.`;
      }
      return effect.text;
    }
    case "gold": {
      const amt = effect.value ?? 20;
      w.gold = Math.max(0, w.gold + amt);
      addFloater(s, "player", amt >= 0 ? `+${amt}g` : `${amt}g`, "gold");
      return effect.text;
    }
    case "item": {
      if (effect.itemId) grantItem(s, effect.itemId);
      return effect.text;
    }
    case "randomItem": {
      const pool = ["potion_healing", "potion_greater", "scroll_hex", "warding_charm", "demon_horn", "void_pearl"];
      grantItem(s, pick(pool));
      return effect.text;
    }
    case "spellAttack":
      w.spellAttack += effect.value ?? 1;
      return effect.text;
    case "maxHp":
      w.maxHp += effect.value ?? 5;
      w.hp += effect.value ?? 5;
      return effect.text;
    case "dmgBonus":
      w.dmgBonus += effect.value ?? 2;
      return effect.text;
    case "critBonus":
      w.critBonus += effect.value ?? 5;
      return effect.text;
    case "tempHp":
      w.tempHp += effect.value ?? 10;
      return effect.text;
    case "slot":
      w.slots = Math.min(w.maxSlots + 2, w.slots + (effect.value ?? 1));
      w.spellAttack += 1;
      return effect.text;
    case "acBonus":
      w.ac += effect.value ?? 1;
      return effect.text;
    case "nothing":
    default:
      return effect.text;
  }
}

function grantItem(s: GameState, itemId: string): void {
  const w = s.warlock;
  const item = getItem(itemId);
  // passive items apply immediately
  if (item.kind === "passive") {
    switch (itemId) {
      case "warding_charm":
        w.ac += 1;
        break;
      case "demon_horn":
        w.dmgBonus += 2;
        break;
      case "eldritch_crucible":
        w.maxSlots += 1;
        w.slots += 1;
        break;
      case "phoenix_ash":
        break;
    }
    pushLog(s, `${item.icon} ${item.name} — ${item.desc}`, "loot");
    return;
  }
  const existing = w.inventory.find((i) => i.itemId === itemId);
  if (existing) existing.count += 1;
  else w.inventory.push({ itemId, count: 1 });
  pushLog(s, `${item.icon} Gained ${item.name}.`, "loot");
}

interface OutcomePair {
  chance: number;
  effect: EventEffect;
}

function resolveEventOutcome(outcomes: OutcomePair[]): EventEffect {
  const r = Math.random();
  let acc = 0;
  for (const o of outcomes) {
    acc += o.chance;
    if (r < acc) return o.effect;
  }
  return outcomes[outcomes.length - 1].effect;
}

/* ---------------- combat actions ---------------- */

function combatAction(s: GameState, action: CombatAction): void {
  const w = s.warlock;
  const c = s.combat;
  if (!c || c.over || c.awaitEnemy) return;
  const target = currentTarget(s);
  s.fx.floaters = [];
  s.fx.roll = null;

  switch (action.kind) {
    case "eb": {
      const beams = ebBeams(w);
      const flat = ebFlatBonus(w);
      pushLog(s, `You unleash Eldritch Blast — ${beams} beam${beams > 1 ? "s" : ""} of emerald force.`, "player");
      for (let i = 0; i < beams; i++) {
        const t = currentTarget(s);
        if (!t) break;
        attackOnce(s, t, `Beam ${i + 1}`, "1d10", flat, { spellTag: "eb" });
        if (i === 0) splashMaddening(s, t);
      }
      break;
    }
    case "strike": {
      const canStrike = w.patron === "hexblade" || w.invocations.includes("thirsting_blade");
      if (!canStrike) return;
      const flat = w.spellAttack + w.dmgBonus + (w.invocations.includes("lifedrinker") ? 3 : 0);
      const strikes = w.invocations.includes("thirsting_blade") ? 2 : 1;
      pushLog(s, `Your pact weapon thirsts. ${strikes} strike${strikes > 1 ? "s" : ""}!`, "player");
      for (let i = 0; i < strikes; i++) {
        const t = currentTarget(s);
        if (!t) break;
        attackOnce(s, t, `Pact Strike ${i + 1}`, "1d12", flat);
      }
      break;
    }
    case "brace": {
      addStatus(c.playerStatuses, "brace", 1);
      addFloater(s, "player", "BRACED", "buff");
      pushLog(s, "You set your feet and raise your wards — incoming damage halved this round.", "player");
      break;
    }
    case "patron": {
      if (c.patronUsed) return;
      c.patronUsed = true;
      const patron = getPatron(w.patron);
      pushLog(s, `You call upon ${patron.name}: ${patron.active.name}!`, "pact");
      switch (w.patron) {
        case "fiend": {
          if (!target) break;
          attackOnce(s, target, "Flame Phalanx", "3d6", spellFlatBonus(w));
          if (target.hp > 0) {
            addStatus(target.statuses, "burning", 3);
            pushLog(s, `${target.name} is Burning for 3 turns.`, "pact");
          }
          break;
        }
        case "goo": {
          aoeDamage(s, "2d10", spellFlatBonus(w), "Mind Shatter");
          for (const e of aliveEnemies(c)) {
            if (e.hp > 0) addStatus(e.statuses, "frightened", 2);
          }
          pushLog(s, "Forbidden truth detonates in every skull present. Frightened 2 turns.", "pact");
          break;
        }
        case "archfey": {
          addStatus(c.playerStatuses, "evade", 2);
          addStatus(c.playerStatuses, "empowered", 1);
          aoeDamage(s, "2d6", spellFlatBonus(w), "Gloaming Cleave");
          addFloater(s, "player", "FEY STEP", "buff");
          pushLog(s, "You dissolve into moon-mist, cut through the gloaming, and reappear where the blow isn't. Evade ×2, next blast empowered.", "pact");
          break;
        }
        case "hexblade": {
          if (!target) break;
          addStatus(target.statuses, "cursed", 4);
          addStatus(target.statuses, "repelled", 4);
          const st = target.statuses.find((x) => x.id === "repelled");
          if (st) st.power = 3;
          addFloater(s, target.uid, "CURSED", "status");
          pushLog(s, `The Raven Queen marks ${target.name}: +1d6 damage from you, its blows weakened, and you heal half the damage you deal.`, "pact");
          break;
        }
      }
      break;
    }
    case "item": {
      const inv = w.inventory.find((i) => i.itemId === action.itemId);
      if (!inv || inv.count <= 0) return;
      const item = getItem(action.itemId);
      switch (item.id) {
        case "potion_healing": {
          const heal = roll("2d8+4");
          const healed = Math.min(w.maxHp - w.hp, heal);
          w.hp += healed;
          addFloater(s, "player", `+${healed}`, "heal");
          pushLog(s, `You drink the Potion of Mending: +${healed} HP.`, "player");
          break;
        }
        case "potion_greater": {
          const heal = roll("4d8+8");
          const healed = Math.min(w.maxHp - w.hp, heal);
          w.hp += healed;
          addFloater(s, "player", `+${healed}`, "heal");
          pushLog(s, `You drain the Greater Elixir: +${healed} HP.`, "player");
          break;
        }
        case "scroll_hex": {
          const t = target;
          if (t) {
            addStatus(t.statuses, "hexed", 3);
            addFloater(s, t.uid, "HEXED", "status");
            pushLog(s, `The scroll burns to ash — ${t.name} is Hexed.`, "player");
          }
          break;
        }
        case "void_pearl": {
          if (c.pearlUsed) return;
          c.pearlUsed = true;
          w.slots += 1;
          addFloater(s, "player", "+1 SLOT", "buff");
          pushLog(s, "The Void Pearl collapses into your palm. +1 spell slot.", "player");
          break;
        }
      }
      inv.count -= 1;
      if (inv.count <= 0) {
        w.inventory = w.inventory.filter((i) => i.itemId !== action.itemId);
      }
      break;
    }
    case "spell": {
      const spell = getSpell(action.spellId);
      if (w.slots < spell.cost) return;
      if (spell.id === "eldritch_blast") {
        combatAction(s, { kind: "eb" });
        return;
      }
      w.slots -= spell.cost;
      s.stats.spellsCast += 1;
      pushLog(s, `You weave ${spell.name} (${spell.cost === 0 ? "cantrip" : `${spell.cost} slot${spell.cost > 1 ? "s" : ""}`}).`, "player");
      const flat = spellFlatBonus(w);
      switch (spell.id) {
        case "hex": {
          const t = target;
          if (!t) break;
          addStatus(t.statuses, "hexed", 3);
          addFloater(s, t.uid, "HEXED", "status");
          pushLog(s, `Ancient malediction coils around ${t.name}: +1d6 damage from you, its attacks -2.`, "player");
          break;
        }
        case "hellish_rebuke": {
          const t = target;
          if (!t) break;
          attackOnce(s, t, "Hellish Rebuke", "2d10", flat);
          if (t.hp > 0) {
            addStatus(t.statuses, "burning", 2);
            pushLog(s, `${t.name} is Burning (2/turn).`, "player");
          }
          break;
        }
        case "arms_of_hadar":
          aoeDamage(s, "2d6", flat, "Arms of Hadar");
          break;
        case "misty_step": {
          addStatus(c.playerStatuses, "evade", 1);
          addStatus(c.playerStatuses, "empowered", 1);
          addStatus(c.playerStatuses, "shielded", 1);
          addFloater(s, "player", "MISTY STEP", "buff");
          pushLog(s, "Silver fog swallows you. Evade, +3 AC, next blast +1d10.", "player");
          break;
        }
        case "vampiric_touch": {
          const t = target;
          if (!t) break;
          const preHp = t.hp;
          attackOnce(s, t, "Vampiric Touch", "3d6", flat);
          const dealt = preHp - t.hp;
          if (dealt > 0) {
            const healed = Math.min(w.maxHp - w.hp, Math.floor(dealt / 2));
            if (healed > 0) {
              w.hp += healed;
              addFloater(s, "player", `+${healed}`, "heal");
              pushLog(s, `You drink the stolen warmth: +${healed} HP.`, "player");
            }
          }
          break;
        }
        case "hunger_of_hadar": {
          aoeDamage(s, "2d6", flat, "Hunger of Hadar");
          for (const e of aliveEnemies(c)) {
            if (e.hp > 0) {
              addStatus(e.statuses, "doomed", 3);
              addFloater(s, e.uid, "DOOMED", "status");
            }
          }
          pushLog(s, "A hungry dark opens beneath them. Doomed: 4 dmg/turn, attacks -3.", "player");
          break;
        }
        case "fear": {
          for (const e of aliveEnemies(c)) {
            if (e.hp > 0) {
              addStatus(e.statuses, "frightened", 2);
              addFloater(s, e.uid, "FEAR", "status");
            }
          }
          pushLog(s, "They see what you have seen. All enemies Frightened (-40% accuracy).", "player");
          break;
        }
        case "blight": {
          const t = target;
          if (!t) break;
          attackOnce(s, t, "Blight", "4d8", flat);
          break;
        }
        case "banishment": {
          const t = target;
          if (!t) break;
          const turns = t.kind === "boss" ? 1 : 2;
          addStatus(t.statuses, "banished", turns);
          addFloater(s, t.uid, "BANISHED", "status");
          pushLog(s, `${t.name} is hurled out of reality for ${turns} turn${turns > 1 ? "s" : ""}.`, "player");
          break;
        }
        case "synaptic_static": {
          aoeDamage(s, "5d6", flat, "Synaptic Static");
          for (const e of aliveEnemies(c)) {
            if (e.hp > 0) {
              addStatus(e.statuses, "repelled", 2);
              const st = e.statuses.find((x) => x.id === "repelled");
              if (st) st.power = 5;
            }
          }
          pushLog(s, "Every mind in the chamber stutters. Their damage -5 for 2 turns.", "player");
          break;
        }
      }
      break;
    }
  }

  checkCombatWon(s);
  if (c.over === "won") {
    c.awaitEnemy = false;
    return;
  }
  c.awaitEnemy = true;
}

/* ---------------- the reducer ---------------- */

export function gameReducer(state: GameState, action: Action): GameState {
  const s = clone(state);
  switch (action.type) {
    case "GO_TITLE": {
      return initialState();
    }
    case "GO_CREATE": {
      s.phase = "create";
      return s;
    }
    case "START_RUN": {
      const fresh = initialState();
      fresh.phase = "map";
      fresh.warlock.name = action.name.trim() || "The Nameless";
      fresh.warlock.patron = action.patron;
      if (action.patron === "hexblade") {
        fresh.warlock.ac += 2;
      }
      fresh.currentOptions = generateRoomOptions(fresh);
      pushLog(fresh, `${fresh.warlock.name} signs the pact in blood that is not entirely their own.`, "pact");
      pushLog(fresh, `Floor 1 — ${FLOOR_NAMES[0]}. The dark exhales.`, "info");
      return fresh;
    }
    case "CHOOSE_ROOM": {
      const opt = s.currentOptions[action.index];
      if (!opt) return s;
      switch (opt.kind) {
        case "combat":
          startFight(s);
          break;
        case "event": {
          const ev = pick(EVENTS);
          s.event = { eventId: ev.id, resolved: false, resultText: "" };
          s.phase = "event";
          break;
        }
        case "treasure": {
          const itemPool = shuffle(["potion_healing", "scroll_hex", "warding_charm", "demon_horn", "void_pearl", "potion_greater", "eldritch_crucible"]);
          s.treasure = {
            options: [
              { itemId: itemPool[0] },
              { itemId: itemPool[1] },
              { gold: randInt(35, 70) + s.floor * 8 },
            ],
            picked: false,
            resultText: "",
          };
          s.phase = "treasure";
          break;
        }
        case "rest":
          s.phase = "rest";
          break;
      }
      return s;
    }
    case "SET_TARGET": {
      if (s.combat) s.combat.targetUid = action.uid;
      return s;
    }
    case "COMBAT_ACTION": {
      combatAction(s, action.action);
      return s;
    }
    case "ENEMY_TURN": {
      enemyTurn(s);
      return s;
    }
    case "COMBAT_CONTINUE": {
      const c = s.combat;
      if (!c) return s;
      if (c.over === "won") {
        s.warlock.gold += c.goldEarned;
        const windDown = Math.ceil(s.warlock.maxHp * 0.15);
        const healed = Math.min(s.warlock.maxHp - s.warlock.hp, windDown);
        if (healed > 0) {
          s.warlock.hp += healed;
          pushLog(s, `You bind your wounds among the wreckage: +${healed} HP.`, "player");
        }
        s.combat = null;
        if (s.floor === 5) {
          s.phase = "victory";
          return s;
        }
        afterRoomCleared(s);
        return s;
      }
      if (c.over === "lost") {
        s.phase = "gameover";
        return s;
      }
      return s;
    }
    case "EVENT_CHOICE": {
      if (!s.event || s.event.resolved) return s;
      const ev = getEvent(s.event.eventId);
      const choice = ev.choices[action.index];
      if (!choice) return s;
      if (choice.cost && s.warlock.gold < choice.cost) return s;
      if (choice.cost) s.warlock.gold -= choice.cost;
      if (choice.hpCost) {
        s.warlock.hp = Math.max(1, s.warlock.hp - choice.hpCost);
        addFloater(s, "player", `-${choice.hpCost}`, "dmg");
      }
      const effect = resolveEventOutcome(choice.outcomes);
      s.event.resultText = applyEffect(s, effect);
      s.event.resolved = true;
      pushLog(s, s.event.resultText, "info");
      return s;
    }
    case "EVENT_CONTINUE": {
      s.event = null;
      afterRoomCleared(s);
      return s;
    }
    case "TAKE_TREASURE": {
      if (!s.treasure || s.treasure.picked) return s;
      const opt = s.treasure.options[action.index];
      if (!opt) return s;
      if (opt.itemId) {
        grantItem(s, opt.itemId);
        s.treasure.resultText = `You claim ${getItem(opt.itemId).name}.`;
      } else if (opt.gold) {
        s.warlock.gold += opt.gold;
        addFloater(s, "player", `+${opt.gold}g`, "gold");
        s.treasure.resultText = `You pocket ${opt.gold} gold. The chest looks offended.`;
      } else if (opt.heal) {
        const healed = Math.min(s.warlock.maxHp - s.warlock.hp, opt.heal);
        s.warlock.hp += healed;
        addFloater(s, "player", `+${healed}`, "heal");
        s.treasure.resultText = `You rest a moment by the cache: +${healed} HP.`;
      }
      s.treasure.picked = true;
      return s;
    }
    case "TREASURE_CONTINUE": {
      s.treasure = null;
      afterRoomCleared(s);
      return s;
    }
    case "REST_CHOICE": {
      if (action.mode === "slots") {
        s.warlock.slots = s.warlock.maxSlots;
        pushLog(s, "You perform the Ritual of Renewal. All spell slots restored.", "pact");
      } else {
        const heal = Math.ceil(s.warlock.maxHp * 0.6);
        const healed = Math.min(s.warlock.maxHp - s.warlock.hp, heal);
        s.warlock.hp += healed;
        pushLog(s, `You bind your wounds in the quiet: +${healed} HP.`, "player");
      }
      s.phase = "rest";
      return s;
    }
    case "REST_CONTINUE": {
      afterRoomCleared(s);
      return s;
    }
    case "BARGAIN_ACCEPT": {
      if (!s.bargain || s.bargain.resolved) return s;
      const id = s.bargain.offers[action.index];
      const b = getBargain(id);
      const w = s.warlock;
      let text = "";
      switch (id) {
        case "blood_price": {
          const paid = Math.min(w.hp - 1, 8);
          w.hp -= paid;
          w.maxSlots += 1;
          w.slots += 1;
          text = `You pay ${paid} HP. Your patron counts it, smiles, and grants +1 max spell slot.`;
          break;
        }
        case "pact_of_sight":
          w.maxHp -= 5;
          w.hp = Math.min(w.hp, w.maxHp);
          w.critBonus += 10;
          text = "Your eyes are remade. The world shows its seams: +10% crit, -5 max HP.";
          break;
        case "agonizing_whisper": {
          const dmg = roll("1d10");
          w.hp = Math.max(1, w.hp - dmg);
          w.dmgBonus += 2;
          text = `The whisper moves in (took ${dmg} psychic). In exchange: +2 damage on all attacks.`;
          break;
        }
        case "forbidden_knowledge":
          w.maxHp -= 4;
          w.hp = Math.min(w.hp, w.maxHp);
          w.spellAttack += 1;
          text = "One page, read once. +1 spell attack, -4 max HP.";
          break;
        case "patrons_embrace":
          w.maxHp -= 6;
          w.hp = w.maxHp;
          text = "It holds you. You are fuel, and you are warm. Healed to full, -6 max HP.";
          break;
        case "iron_tongue": {
          const paid = Math.min(w.gold, 10);
          w.gold -= paid;
          w.ac += 1;
          text = `You pay ${paid} gold. Doors will apologize: +1 AC.`;
          break;
        }
        case "the_hunger":
          w.maxHp -= 6;
          w.hp = Math.min(w.hp, w.maxHp);
          w.slots = w.maxSlots;
          w.gold += 30;
          text = "Something is fed. You do not ask what. Slots restored, +30 gold, -6 max HP.";
          break;
      }
      s.bargain.resolved = true;
      s.bargain.resultText = text;
      pushLog(s, `BARGAIN — ${b.name}: ${text}`, "pact");
      return s;
    }
    case "BARGAIN_REFUSE": {
      if (!s.bargain || s.bargain.resolved) return s;
      s.bargain.resolved = true;
      s.bargain.resultText = "You keep your soul intact — for now. Your patron's silence is somehow louder.";
      pushLog(s, "You refuse the bargain. The stairway creaks its approval.", "pact");
      return s;
    }
    case "BARGAIN_CONTINUE": {
      if (!s.bargain || !s.bargain.resolved) return s;
      s.bargain = null;
      doLevelUp(s);
      return s;
    }
    case "PICK_INVOCATION": {
      if (!s.levelup) return s;
      if (!s.levelup.offers.includes(action.id)) return s;
      const inv = getInvocation(action.id);
      s.warlock.invocations.push(action.id);
      pushLog(s, `INVOCATION — ${inv.icon} ${inv.name}: ${inv.desc}`, "pact");
      if (action.id === "fiendish_vigor") {
        s.warlock.maxHp += 10;
        s.warlock.hp = Math.min(s.warlock.maxHp, s.warlock.hp + 10);
      }
      if (action.id === "devils_sight") {
        s.warlock.ac += 2;
      }
      s.levelup = null;
      s.floor += 1;
      s.roomsClearedThisFloor = 0;
      s.floorName = FLOOR_NAMES[s.floor - 1] ?? "The Deep";
      if (s.floor === 5) {
        s.currentOptions = [
          {
            kind: "combat",
            name: "The Ember Throne",
            icon: "🐉",
            desc: "Vermithrax is waiting. He has always been waiting.",
          },
        ];
      } else {
        s.currentOptions = generateRoomOptions(s);
      }
      pushLog(s, `Floor ${s.floor} — ${s.floorName}.`, "info");
      s.phase = "map";
      return s;
    }
    case "CLEAR_FX": {
      s.fx.floaters = [];
      s.fx.roll = null;
      return s;
    }
    default:
      return s;
  }
}
