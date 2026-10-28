/* ============================================================
 * VOIDSWORN: Pact of the Fallen Star — core type definitions
 * ============================================================ */

export type PatronId = "fiend" | "goo" | "archfey" | "hexblade";

export type Phase =
  | "title"
  | "create"
  | "map"
  | "combat"
  | "event"
  | "treasure"
  | "rest"
  | "bargain"
  | "levelup"
  | "gameover"
  | "victory";

export type RoomKind = "combat" | "event" | "treasure" | "rest";

export interface Status {
  id: StatusId;
  turns: number;
  power?: number; // for repelled: damage reduction amount
}

export type StatusId =
  // on enemies
  | "hexed" // takes +1d6 necrotic from all your hits
  | "burning" // takes burn damage each turn
  | "doomed" // hunger of hadar tick + reduced damage
  | "frightened" // reduced accuracy
  | "repelled" // next attack deals less damage
  | "banished" // skips turns entirely
  | "cursed" // hexblade curse: +1d6 taken, warlock heals half
  // on player
  | "evade" // dodges the next attack entirely
  | "brace" // incoming damage halved this enemy phase
  | "empowered" // next eldritch blast +1d10
  | "shielded" // +3 AC for the duration
  | "burning" // takes burn damage each turn
  | "frightened"; // -4 to attack rolls

/* ---------------- Patron ---------------- */

export interface PatronActive {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export interface Patron {
  id: PatronId;
  name: string;
  title: string;
  icon: string;
  tagline: string;
  passiveName: string;
  passiveDesc: string;
  active: PatronActive;
  accent: string; // tailwind text color class, e.g. "text-red-400"
  flavor: string;
}

/* ---------------- Spells ---------------- */

export type SpellTargeting = "enemy" | "all-enemies" | "self";

export interface Spell {
  id: string;
  name: string;
  icon: string;
  level: number; // warlock level required
  cost: number; // spell slots
  target: SpellTargeting;
  desc: string;
  conc: string[]; // statuses applied to target(s)
  self: string[]; // statuses applied to self
  damage?: string; // dice expression
  damageType?: string;
  duration?: number; // status turns
}

/* ---------------- Invocations ---------------- */

export interface Invocation {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

/* ---------------- Enemies ---------------- */

export type EnemyTrait = "healer" | "drain" | "burn" | "fear" | "none";

export interface EnemyTemplate {
  id: string;
  name: string;
  icon: string;
  floors: number[];
  hp: number;
  ac: number;
  attackBonus: number;
  damage: string;
  gold: [number, number];
  trait: EnemyTrait;
  blurb: string;
}

export interface Enemy {
  uid: string;
  templateId: string;
  name: string;
  icon: string;
  hp: number;
  maxHp: number;
  ac: number;
  attackBonus: number;
  damage: string;
  statuses: Status[];
  trait: EnemyTrait;
  blurb: string;
  gold: number;
  kind: "normal" | "boss";
  pattern: number; // AI step counter
}

/* ---------------- Items ---------------- */

export type ItemKind = "consumable" | "passive";

export interface Item {
  id: string;
  name: string;
  icon: string;
  kind: ItemKind;
  desc: string;
  price: number;
}

/* ---------------- Events ---------------- */

export interface EventEffect {
  kind:
    | "heal"
    | "damage"
    | "gold"
    | "item"
    | "randomItem"
    | "spellAttack"
    | "maxHp"
    | "dmgBonus"
    | "critBonus"
    | "tempHp"
    | "slot"
    | "acBonus"
    | "nothing";
  value?: number;
  itemId?: string;
  text: string;
}

export interface EventOutcome {
  chance: number;
  effect: EventEffect;
}

export interface EventChoice {
  label: string;
  desc: string;
  cost?: number; // gold cost
  hpCost?: number;
  outcomes: EventOutcome[]; // resolved by weighted chance, last one = fallback
}

export interface EventTemplate {
  id: string;
  title: string;
  icon: string;
  flavor: string;
  choices: EventChoice[];
}

/* ---------------- Bargains ---------------- */

export interface Bargain {
  id: string;
  name: string;
  icon: string;
  desc: string;
  priceText: string;
  boonText: string;
}

/* ---------------- Rooms / map ---------------- */

export interface RoomOption {
  kind: RoomKind;
  name: string;
  icon: string;
  desc: string;
}

/* ---------------- Combat FX ---------------- */

export interface Floater {
  id: number;
  target: string; // enemy uid or "player"
  text: string;
  kind: "dmg" | "heal" | "crit" | "miss" | "status" | "buff" | "gold";
}

export interface RollFx {
  id: number;
  who: string; // "player" or enemy uid
  label: string; // e.g. "Eldritch Blast"
  d20: number;
  total: number;
  outcome: "hit" | "crit" | "miss" | "fumble";
}

export interface FxState {
  floaters: Floater[];
  roll: RollFx | null;
  shake: number; // increment to trigger shake
  seq: number;
}

/* ---------------- Log ---------------- */

export type LogKind = "player" | "enemy" | "info" | "crit" | "loot" | "pact";

export interface LogEntry {
  id: number;
  text: string;
  kind: LogKind;
}

/* ---------------- Combat state ---------------- */

export interface CombatState {
  enemies: Enemy[];
  targetUid: string | null;
  round: number;
  playerStatuses: Status[];
  awaitEnemy: boolean;
  over: "won" | "lost" | null;
  isBoss: boolean;
  telegraph: { name: string; nextDamage: string; note: string } | null;
  enraged: boolean;
  desperate: boolean;
  breathCount: number;
  pearlUsed: boolean;
  patronUsed: boolean;
  protectorsUsed: boolean;
  goldEarned: number;
}

/* ---------------- Screens' transient state ---------------- */

export interface EventState {
  eventId: string;
  resolved: boolean;
  resultText: string;
}

export interface TreasureState {
  options: { itemId?: string; gold?: number; heal?: number }[];
  picked: boolean;
  resultText: string;
}

export interface BargainState {
  offers: string[]; // bargain ids
  resolved: boolean;
  resultText: string;
}

export interface LevelupState {
  level: number;
  offers: string[]; // invocation ids
}

/* ---------------- Warlock ---------------- */

export interface Warlock {
  name: string;
  patron: PatronId;
  level: number;
  hp: number;
  maxHp: number;
  tempHp: number;
  ac: number;
  spellAttack: number;
  dmgBonus: number; // flat bonus to all damage
  critBonus: number; // percent
  slots: number;
  maxSlots: number;
  invocations: string[];
  inventory: { itemId: string; count: number }[];
  gold: number;
  kills: number;
  patronUsedThisFight: boolean;
  reviveUsed: boolean;
}

/* ---------------- Game state ---------------- */

export interface RunStats {
  damageDealt: number;
  damageTaken: number;
  spellsCast: number;
  crits: number;
  roomsCleared: number;
}

export interface GameState {
  phase: Phase;
  floor: number;
  roomsClearedThisFloor: number;
  roomsPerFloor: number;
  currentOptions: RoomOption[];
  warlock: Warlock;
  combat: CombatState | null;
  event: EventState | null;
  treasure: TreasureState | null;
  bargain: BargainState | null;
  levelup: LevelupState | null;
  log: LogEntry[];
  fx: FxState;
  stats: RunStats;
  deathCause: string;
  floorName: string;
}
