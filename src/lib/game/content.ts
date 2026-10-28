/* ============================================================
 * VOIDSWORN: Pact of the Fallen Star — game content
 * ============================================================ */

import type {
  Bargain,
  EnemyTemplate,
  EventTemplate,
  Invocation,
  Item,
  Patron,
  PatronId,
  Spell,
} from "./types";

export const FLOOR_NAMES = [
  "The Gnawing Dark",
  "Halls of Quiet Bones",
  "The Smoldering Deep",
  "Vault of Whispers",
  "The Ember Throne",
];

/* ---------------- Patrons ---------------- */

export const PATRONS: Patron[] = [
  {
    id: "fiend",
    name: "The Fiend",
    title: "Archduchess of the Iron Pyre",
    icon: "🔥",
    tagline: "Every death feeds you. Every flame obeys you.",
    passiveName: "Dark One's Blessing",
    passiveDesc: "Whenever an enemy dies, you absorb its essence: gain 5 + your level temp HP.",
    active: {
      id: "flame_phalanx",
      name: "Flame Phalanx",
      icon: "🜂",
      desc: "Conjure a legion of burning spears: 3d6 fire damage to one enemy and set it Burning for 3 turns.",
    },
    accent: "text-orange-400",
    flavor:
      "It spoke to you in a voice like collapsing coals. The contract was written in ash on your family altar. You signed with a burnt finger.",
  },
  {
    id: "goo",
    name: "The Great Old One",
    title: "That Which Sleeps Below",
    icon: "🐙",
    tagline: "Your mind is a door. Things come through it.",
    passiveName: "Entropic Mind",
    passiveDesc: "Enemies have a 20% chance to lose their grip on reality and miss you automatically. Your critical hits deal +1d6 psychic damage.",
    active: {
      id: "mind_shatter",
      name: "Mind Shatter",
      icon: "👁",
      desc: "Drive a spike of forbidden truth into one enemy's skull: 2d10 psychic damage and Frightened for 2 turns.",
    },
    accent: "text-violet-400",
    flavor:
      "You found the words in a dream you never woke from. The stars were wrong that night. You have not slept since, and you have never rested better.",
  },
  {
    id: "archfey",
    name: "The Archfey",
    title: "Queen of the Moonlit Court",
    icon: "🌙",
    tagline: "Her bargains are kind. Her whims are not.",
    passiveName: "Misty Refuge",
    passiveDesc: "At the start of every fight you are wrapped in silver mist and automatically evade the first attack. You see treasure where others see shadow (+15% gold).",
    active: {
      id: "fey_step",
      name: "Fey Step",
      icon: "✨",
      desc: "Vanish, cleave through the gloaming, and reappear where the blow isn't: 2d6 force damage to ALL enemies, Evade ×2, and your next blast deals +1d10.",
    },
    accent: "text-fuchsia-300",
    flavor:
      "She traded you a trinket for a memory. You cannot recall which one. Sometimes, at dusk, you hum a lullaby in a language you do not speak.",
  },
  {
    id: "hexblade",
    name: "The Hexblade",
    title: "Will of the Raven Queen",
    icon: "⚔️",
    tagline: "The blade remembers every name it takes.",
    passiveName: "Pact of the Blade",
    passiveDesc: "You wield a shard of the Raven Queen's steel: Pact Strike attack from level 1, +2 AC, and your critical range is 19-20.",
    active: {
      id: "hex_curse",
      name: "Hexblade's Curse",
      icon: "💀",
      desc: "Mark one enemy as the blade's rightful death: +1d6 damage taken from you, its attacks weakened, for 4 turns, and you heal half the damage you deal to it. If it dies while marked, the blade collects: temp HP.",
    },
    accent: "text-slate-200",
    flavor:
      "The sword was waiting in a barrow with your name carved beneath the crossguard. It has been waiting a long time. It does not like to wait.",
  },
];

export function getPatron(id: PatronId): Patron {
  return PATRONS.find((p) => p.id === id) ?? PATRONS[0];
}

/* ---------------- Spells ---------------- */

export const SPELLS: Spell[] = [
  {
    id: "eldritch_blast",
    name: "Eldritch Blast",
    icon: "🟣",
    level: 1,
    cost: 0,
    target: "enemy",
    desc: "A beam of crackling emerald force. Beams: 1 at level 1-2, 2 at level 3-4, 3 at level 5.",
    conc: [],
    self: [],
  },
  {
    id: "hex",
    name: "Hex",
    icon: "🪬",
    level: 1,
    cost: 1,
    target: "enemy",
    desc: "Place an ancient malediction on one enemy: your damage against it rolls +1d6 necrotic, and its attacks deal -2. Lasts 3 turns.",
    conc: ["hexed"],
    self: [],
    duration: 3,
  },
  {
    id: "hellish_rebuke",
    name: "Hellish Rebuke",
    icon: "☄️",
    level: 1,
    cost: 1,
    target: "enemy",
    desc: "Point a finger and the target is wreathed in infernal flame: 2d10 fire damage and Burning 2 for 2 turns.",
    conc: ["burning"],
    self: [],
    damage: "2d10",
    damageType: "fire",
    duration: 2,
  },
  {
    id: "arms_of_hadar",
    name: "Arms of Hadar",
    icon: "🦑",
    level: 1,
    cost: 1,
    target: "all-enemies",
    desc: "Black tendrils erupt from a rift between stars, lashing EVERY enemy for 2d6 necrotic.",
    conc: [],
    self: [],
    damage: "2d6",
    damageType: "necrotic",
  },
  {
    id: "misty_step",
    name: "Misty Step",
    icon: "🌫️",
    level: 2,
    cost: 1,
    target: "self",
    desc: "Dissolve into silver fog and reform behind reality: Evade the next attack, +3 AC for a turn, and your next blast deals +1d10.",
    conc: [],
    self: ["evade", "empowered", "shielded"],
  },
  {
    id: "vampiric_touch",
    name: "Vampiric Touch",
    icon: "🩸",
    level: 3,
    cost: 1,
    target: "enemy",
    desc: "Your touch drinks the warmth of life: 3d6 necrotic damage, and you heal half the damage dealt.",
    conc: [],
    self: [],
    damage: "3d6",
    damageType: "necrotic",
  },
  {
    id: "hunger_of_hadar",
    name: "Hunger of Hadar",
    icon: "🕳️",
    level: 3,
    cost: 2,
    target: "all-enemies",
    desc: "Open a mouth to the void beneath every enemy: each takes 2d6 necrotic and is Doomed (4 dmg/turn, attacks deal -3) for 3 turns.",
    conc: ["doomed"],
    self: [],
    damage: "2d6",
    damageType: "necrotic",
    duration: 3,
  },
  {
    id: "fear",
    name: "Fear",
    icon: "😱",
    level: 3,
    cost: 1,
    target: "all-enemies",
    desc: "Show them what lives behind your eyes: every enemy becomes Frightened (-40% accuracy) for 2 turns.",
    conc: ["frightened"],
    self: [],
    duration: 2,
  },
  {
    id: "blight",
    name: "Blight",
    icon: "🥀",
    level: 4,
    cost: 2,
    target: "enemy",
    desc: "Withering decay blooms in the target's veins: 4d8 necrotic damage, +your spell attack bonus.",
    conc: [],
    self: [],
    damage: "4d8",
    damageType: "necrotic",
  },
  {
    id: "banishment",
    name: "Banishment",
    icon: "🌀",
    level: 4,
    cost: 2,
    target: "enemy",
    desc: "Hurl one enemy out of reality for 2 turns. Bosses resist: they lose only 1 turn.",
    conc: ["banished"],
    self: [],
    duration: 2,
  },
  {
    id: "synaptic_static",
    name: "Synaptic Static",
    icon: "🧠",
    level: 5,
    cost: 2,
    target: "all-enemies",
    desc: "A psychic detonation inside every skull: 5d6 psychic damage to ALL enemies, and they deal -5 damage for 2 turns.",
    conc: ["repelled"],
    self: [],
    damage: "5d6",
    damageType: "psychic",
    duration: 2,
  },
];

export function getSpell(id: string): Spell {
  const s = SPELLS.find((sp) => sp.id === id);
  if (!s) throw new Error(`Unknown spell: ${id}`);
  return s;
}

/* ---------------- Invocations ---------------- */

export const INVOCATIONS: Invocation[] = [
  {
    id: "agonizing_blast",
    name: "Agonizing Blast",
    icon: "💥",
    desc: "Your Eldritch Blast beams each deal bonus damage equal to your spell attack bonus. The signature of every serious warlock.",
  },
  {
    id: "repelling_blast",
    name: "Repelling Blast",
    icon: "🌪️",
    desc: "Your blasts stagger the target: each beam hit reduces the enemy's next attack damage by 3.",
  },
  {
    id: "devils_sight",
    name: "Devil's Sight",
    icon: "🌑",
    desc: "The dark holds no fear for you: +2 AC permanently — you simply are not where the blow lands.",
  },
  {
    id: "fiendish_vigor",
    name: "Fiendish Vigor",
    icon: "❤️‍🔥",
    desc: "Your patron's vitality floods your veins: +10 max HP, and you heal 10 immediately.",
  },
  {
    id: "thirsting_blade",
    name: "Thirsting Blade",
    icon: "🗡️",
    desc: "Your pact weapon hungers: Pact Strike attacks twice per turn (each 1d12 + spell attack).",
  },
  {
    id: "maddening_hex",
    name: "Maddening Hex",
    icon: "🙃",
    desc: "Each beam of your Eldritch Blast reverberates madly: 1d6 psychic splash damage to every OTHER enemy.",
  },
  {
    id: "visions_of_distant_realms",
    name: "Visions of Distant Realms",
    icon: "🔮",
    desc: "You see the seams of fate: +12% critical chance on all attacks.",
  },
  {
    id: "whispers_of_the_grave",
    name: "Whispers of the Grave",
    icon: "⚰️",
    desc: "Death is a door your patron holds open: the first time you would die this run, revive at 30% HP instead.",
  },
  {
    id: "gift_of_the_protectors",
    name: "Gift of the Protectors",
    icon: "🛡️",
    desc: "Once per fight, an unseen ward refuses to let you fall: survive a lethal blow at 1 HP.",
  },
  {
    id: "lifedrinker",
    name: "Lifedrinker",
    icon: "🫀",
    desc: "Your pact siphons essence with every strike: +3 necrotic damage on ALL damage you deal.",
  },
];

export function getInvocation(id: string): Invocation {
  const inv = INVOCATIONS.find((i) => i.id === id);
  if (!inv) throw new Error(`Unknown invocation: ${id}`);
  return inv;
}

/* ---------------- Bestiary ---------------- */

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  {
    id: "cave_rat",
    name: "Cave Rat Swarm",
    icon: "🐀",
    floors: [1],
    hp: 11,
    ac: 11,
    attackBonus: 2,
    damage: "1d6+1",
    gold: [6, 12],
    trait: "none",
    blurb: "Teeth like needles, hunger like a religion.",
  },
  {
    id: "goblin_sneak",
    name: "Goblin Sneak",
    icon: "👺",
    floors: [1],
    hp: 15,
    ac: 12,
    attackBonus: 3,
    damage: "1d6+2",
    gold: [10, 18],
    trait: "none",
    blurb: "It was about to rob you. It still might.",
  },
  {
    id: "giant_spider",
    name: "Gloom Spider",
    icon: "🕷️",
    floors: [1, 2],
    hp: 14,
    ac: 12,
    attackBonus: 3,
    damage: "1d6",
    gold: [9, 16],
    trait: "burn",
    blurb: "Its bite smolders with venom that eats the light.",
  },
  {
    id: "skeleton_archer",
    name: "Skeleton Archer",
    icon: "🏹",
    floors: [2],
    hp: 16,
    ac: 12,
    attackBonus: 3,
    damage: "1d8+2",
    gold: [12, 20],
    trait: "none",
    blurb: "It has not missed in three hundred years.",
  },
  {
    id: "deep_cultist",
    name: "Cultist of the Deep",
    icon: "🕯️",
    floors: [2, 3],
    hp: 20,
    ac: 11,
    attackBonus: 3,
    damage: "1d8+1",
    gold: [14, 24],
    trait: "healer",
    blurb: "Chants words that make the walls lean away.",
  },
  {
    id: "dire_wolf",
    name: "Dire Wolf",
    icon: "🐺",
    floors: [2],
    hp: 23,
    ac: 13,
    attackBonus: 3,
    damage: "2d4+2",
    gold: [15, 22],
    trait: "none",
    blurb: "It remembers being worshipped.",
  },
  {
    id: "ogre_brute",
    name: "Ogre Brute",
    icon: "🪓",
    floors: [3],
    hp: 42,
    ac: 12,
    attackBonus: 4,
    damage: "2d6+3",
    gold: [30, 45],
    trait: "none",
    blurb: "A wall that hates you personally.",
  },
  {
    id: "wraith",
    name: "Barrow Wraith",
    icon: "👻",
    floors: [3, 4],
    hp: 30,
    ac: 14,
    attackBonus: 4,
    damage: "2d6+2",
    gold: [25, 40],
    trait: "drain",
    blurb: "Every touch takes a little of what you are.",
  },
  {
    id: "hellhound",
    name: "Hellhound",
    icon: "🔥",
    floors: [3, 4],
    hp: 28,
    ac: 13,
    attackBonus: 4,
    damage: "1d10+2",
    gold: [22, 36],
    trait: "burn",
    blurb: "The furnace was its mother. The ember, its father.",
  },
  {
    id: "demonspawn",
    name: "Demonspawn Marauder",
    icon: "😈",
    floors: [4],
    hp: 40,
    ac: 14,
    attackBonus: 5,
    damage: "2d6+2",
    gold: [40, 60],
    trait: "burn",
    blurb: "Sired in the Pyre, escaped through your dungeon door.",
  },
  {
    id: "stone_golem",
    name: "Vault Stone Golem",
    icon: "🗿",
    floors: [4],
    hp: 54,
    ac: 15,
    attackBonus: 5,
    damage: "2d6+4",
    gold: [45, 65],
    trait: "none",
    blurb: "The vault's guardian. The vault's jailer. Same stone.",
  },
  {
    id: "aberrant_seer",
    name: "Aberrant Seer",
    icon: "👁️",
    floors: [4],
    hp: 34,
    ac: 12,
    attackBonus: 5,
    damage: "2d6",
    gold: [42, 58],
    trait: "fear",
    blurb: "It has seen your death. It is politely waiting.",
  },
];

export const BOSS_TEMPLATE: EnemyTemplate = {
  id: "vermithrax",
  name: "Vermithrax, the Ember-Sovereign",
  icon: "🐉",
  floors: [5],
  hp: 150,
  ac: 15,
  attackBonus: 7,
  damage: "2d6+5",
  gold: [300, 300],
  trait: "none",
  blurb:
    "An ancient red dragon wreathed in crown-fire. Its breath has ended dynasties. Its hoard has bought kingdoms. It is waiting for you.",
};

/* ---------------- Items ---------------- */

export const ITEMS: Item[] = [
  {
    id: "potion_healing",
    name: "Potion of Mending",
    icon: "🧪",
    kind: "consumable",
    desc: "Restores 3d8+4 HP. Tastes of copper and childhood.",
    price: 30,
  },
  {
    id: "potion_greater",
    name: "Greater Elixir",
    icon: "⚗️",
    kind: "consumable",
    desc: "Restores 4d8+8 HP. Bottled sunrise.",
    price: 70,
  },
  {
    id: "scroll_hex",
    name: "Scroll of Hex",
    icon: "📜",
    kind: "consumable",
    desc: "Cast Hex on a target without spending a spell slot.",
    price: 55,
  },
  {
    id: "void_pearl",
    name: "Void Pearl",
    icon: "⚫",
    kind: "consumable",
    desc: "Regain 1 spell slot (once per fight). It whispers when held.",
    price: 80,
  },
  {
    id: "warding_charm",
    name: "Warding Charm",
    icon: "🧿",
    kind: "passive",
    desc: "+1 AC permanently. Applies immediately.",
    price: 90,
  },
  {
    id: "demon_horn",
    name: "Demon Horn Shard",
    icon: "🦄",
    kind: "passive",
    desc: "+2 damage on all your attacks, permanently.",
    price: 100,
  },
  {
    id: "eldritch_crucible",
    name: "Eldritch Crucible",
    icon: "🏺",
    kind: "passive",
    desc: "+1 maximum spell slot, permanently. Applies immediately.",
    price: 140,
  },
  {
    id: "phoenix_ash",
    name: "Phoenix Ash Vial",
    icon: "🕯️",
    kind: "passive",
    desc: "Once per run, survive death and revive at 25% HP. Applies immediately.",
    price: 160,
  },
];

export function getItem(id: string): Item {
  const it = ITEMS.find((i) => i.id === id);
  if (!it) throw new Error(`Unknown item: ${id}`);
  return it;
}

/* ---------------- Events ---------------- */

export const EVENTS: EventTemplate[] = [
  {
    id: "dying_cultist",
    title: "The Dying Cultist",
    icon: "🕯️",
    flavor:
      "A robed figure slumps against the wall, a halo of blood slowly spreading. The tattoo of a hungry eye twists on his forehead as he sees you — and laughs, softly, twice.",
    choices: [
      {
        label: "Interrogate him",
        desc: "The pact will pry the dungeon's secrets loose from him.",
        outcomes: [
          {
            chance: 0.6,
            effect: { kind: "spellAttack", value: 1, text: "He gasps the vault's wards and rituals. Your sigils sharpen: +1 spell attack this run." },
          },
          {
            chance: 1,
            effect: { kind: "item", itemId: "scroll_hex", text: "His last breath is a coded verse. You copy it: gained a Scroll of Hex." },
          },
        ],
      },
      {
        label: "Give him mercy",
        desc: "Some doors deserve to close gently.",
        outcomes: [
          {
            chance: 1,
            effect: { kind: "heal", value: 12, text: "Peace settles over the corridor like dust. You feel lighter: heal 12 HP." },
          },
        ],
      },
      {
        label: "Offer him to your patron",
        desc: "Let the pact do what pacts do.",
        outcomes: [
          {
            chance: 1,
            effect: { kind: "dmgBonus", value: 2, text: "The shadow beneath you drinks. Your patron is pleased: +2 damage this run." },
          },
        ],
      },
    ],
  },
  {
    id: "whispering_idol",
    title: "The Whispering Idol",
    icon: "🗿",
    flavor:
      "A fist-sized statue of something that should not have a mouth. The mouth is whispering. It has been whispering, you suspect, for a very long time.",
    choices: [
      {
        label: "Touch the idol",
        desc: "What is the worst that could babble into your skull?",
        outcomes: [
          {
            chance: 0.45,
            effect: { kind: "spellAttack", value: 2, text: "The whispers braid into your mind like silver thread: +2 spell attack this run." },
          },
          {
            chance: 0.75,
            effect: { kind: "damage", value: 7, text: "The mouth screams. You stagger back, ears bleeding: take 7 psychic damage." },
          },
          {
            chance: 1,
            effect: { kind: "critBonus", value: 8, text: "It shows you where everything is soft: +8% critical chance this run." },
          },
        ],
      },
      {
        label: "Smash the idol",
        desc: "Mouths that whisper deserve silence.",
        outcomes: [
          {
            chance: 1,
            effect: { kind: "gold", value: 30, text: "Inside the rubble: thirty gold pieces and a guilty silence." },
          },
        ],
      },
      {
        label: "Leave it be",
        desc: "Some doors stay closed.",
        outcomes: [
          {
            chance: 1,
            effect: { kind: "nothing", text: "You walk past. The whispering continues. It sounds almost like gratitude." },
          },
        ],
      },
    ],
  },
  {
    id: "shifting_merchant",
    title: "The Shifting Merchant",
    icon: "🧥",
    flavor:
      "A stall that wasn't there last step. The merchant wears three cloaks, all of them warm, and smiles with exactly the number of teeth that comforts you. Prices in gold. Or blood. He is flexible.",
    choices: [
      {
        label: "Buy a Warding Charm",
        desc: "+1 AC permanently.",
        cost: 50,
        outcomes: [
          {
            chance: 1,
            effect: { kind: "item", itemId: "warding_charm", text: "The charm settles against your pulse like a small loyal animal: +1 AC." },
          },
        ],
      },
      {
        label: "Buy a Greater Elixir",
        desc: "Restores 4d8+8 HP.",
        cost: 45,
        outcomes: [
          {
            chance: 1,
            effect: { kind: "item", itemId: "potion_greater", text: "He wraps it in velvet like a sleeping bee. Gained a Greater Elixir." },
          },
        ],
      },
      {
        label: "Trade blood for wares",
        desc: "Lose 6 HP, receive something interesting.",
        hpCost: 6,
        outcomes: [
          {
            chance: 1,
            effect: { kind: "randomItem", text: "He opens his third cloak. Something interesting is waiting." },
          },
        ],
      },
      {
        label: "Walk on",
        desc: "His smile follows you a little way down the corridor.",
        outcomes: [
          {
            chance: 1,
            effect: { kind: "nothing", text: "Behind you: coins clinking, a stall unfolding like wings." },
          },
        ],
      },
    ],
  },
  {
    id: "ancient_runes",
    title: "The Speaking Runes",
    icon: "🪧",
    flavor:
      "Runes crowd the wall, older than the dungeon that holds them. As you pass, they rearrange themselves — forming words, then sentences. Then a request.",
    choices: [
      {
        label: "Study them",
        desc: "Read what should not be readable.",
        outcomes: [
          {
            chance: 1,
            effect: { kind: "slot", value: 1, text: "The grammar of the pact grows clearer: restore 1 spell slot, +1 spell attack this run." },
          },
        ],
      },
      {
        label: "Copy the sigil of warding",
        desc: "Practical. Survivable.",
        outcomes: [
          {
            chance: 1,
            effect: { kind: "item", itemId: "warding_charm", text: "You trace the sigil onto a scrap of shroud-cloth: +1 AC." },
          },
        ],
      },
      {
        label: "Answer their question",
        desc: "The runes want to know what you fear.",
        outcomes: [
          {
            chance: 0.5,
            effect: { kind: "maxHp", value: 5, text: "You answer honestly. The runes nod, somehow: +5 max HP." },
          },
          {
            chance: 1,
            effect: { kind: "damage", value: 5, text: "You answer. The runes laugh in unison and the wall burns cold: take 5 damage." },
          },
        ],
      },
    ],
  },
  {
    id: "cursed_fountain",
    title: "The Sighing Fountain",
    icon: "⛲",
    flavor:
      "Black water rises from a basin of carved bones, spills over, and sinks back down. The fountain sighs between every cycle, like it is counting.",
    choices: [
      {
        label: "Drink from the black water",
        desc: "It is definitely water. Probably.",
        outcomes: [
          {
            chance: 0.35,
            effect: { kind: "heal", value: 99, text: "The water tastes of cold starlight. Every wound closes: heal to full." },
          },
          {
            chance: 0.7,
            effect: { kind: "maxHp", value: 5, text: "Strength pools in your marrow: +5 max HP." },
          },
          {
            chance: 1,
            effect: { kind: "damage", value: 9, text: "Your throat burns like swallowed winter: take 9 poison damage." },
          },
        ],
      },
      {
        label: "Toss in a coin (20 gold)",
        desc: "All fountains appreciate manners.",
        cost: 20,
        outcomes: [
          {
            chance: 1,
            effect: { kind: "item", itemId: "void_pearl", text: "The water folds the coin away and returns something older: a Void Pearl." },
          },
        ],
      },
      {
        label: "Cover the basin",
        desc: "The counting stops. The dungeon feels quieter.",
        outcomes: [
          {
            chance: 1,
            effect: { kind: "nothing", text: "You leave it sighing. On the way out, you could swear the last sigh shaped your name." },
          },
        ],
      },
    ],
  },
  {
    id: "bone_gambler",
    title: "The Bone Gambler",
    icon: "🎲",
    flavor:
      "A skeleton in a velvet waistcoat sits at a table with two chairs. The dice on the table are carved from knucklebones. It gestures at the empty chair with terrible courtesy.",
    choices: [
      {
        label: "Roll against it",
        desc: "High roll wins. It is very good at rolling.",
        outcomes: [
          {
            chance: 0.45,
            effect: { kind: "gold", value: 60, text: "Snake eyes for the skeleton. It applauds hollowly: win 60 gold." },
          },
          {
            chance: 1,
            effect: { kind: "gold", value: -20, text: "It rolls a twenty. It always rolls a twenty: lose 20 gold." },
          },
        ],
      },
      {
        label: "Flip the table",
        desc: "You did not come this far to gamble.",
        outcomes: [
          {
            chance: 0.6,
            effect: { kind: "item", itemId: "potion_healing", text: "Under the table: a hidden purse and a Potion of Mending. The skeleton does not stop you." },
          },
          {
            chance: 1,
            effect: { kind: "nothing", text: "The table snaps in half. The dice were rigged. So was the table." },
          },
        ],
      },
      {
        label: "Sit and talk",
        desc: "It has been alone a long time.",
        outcomes: [
          {
            chance: 1,
            effect: { kind: "critBonus", value: 5, text: "It tells you where everything in this dungeon keeps its soft parts: +5% critical chance." },
          },
        ],
      },
    ],
  },
];

export function getEvent(id: string): EventTemplate {
  const ev = EVENTS.find((e) => e.id === id);
  if (!ev) throw new Error(`Unknown event: ${id}`);
  return ev;
}

/* ---------------- Dark Bargains ---------------- */

export const BARGAINS: Bargain[] = [
  {
    id: "blood_price",
    name: "Blood Price",
    icon: "🩸",
    desc: "Sacrifice 8 of your current HP on the altar of the pact.",
    priceText: "Lose 8 current HP",
    boonText: "+1 maximum spell slot",
  },
  {
    id: "pact_of_sight",
    name: "Pact of Sight",
    icon: "👁️",
    desc: "Let your patron remodel your eyes. You will see seams, weak points, the soft underlining of the world.",
    priceText: "-5 max HP",
    boonText: "+10% critical chance",
  },
  {
    id: "agonizing_whisper",
    name: "Agonizing Whisper",
    icon: "🌪️",
    desc: "The patron's voice takes up residence behind your teeth. It is very persuasive.",
    priceText: "Take 1d10 psychic damage now",
    boonText: "+2 damage on all attacks",
  },
  {
    id: "forbidden_knowledge",
    name: "Forbidden Knowledge",
    icon: "📖",
    desc: "A page of the pact unfolds for you alone. Your patron pretends not to notice.",
    priceText: "-4 max HP",
    boonText: "+1 spell attack bonus",
  },
  {
    id: "patrons_embrace",
    name: "The Patron's Embrace",
    icon: "🫂",
    desc: "It holds you the way a furnace holds fuel: completely, and with love, and with consequences.",
    priceText: "-6 max HP",
    boonText: "Heal to full HP now",
  },
  {
    id: "iron_tongue",
    name: "Iron Tongue",
    icon: "🗡️",
    desc: "Your words gain weight. Doors apologize. Locks reconsider.",
    priceText: "Lose 10 gold",
    boonText: "+1 AC",
  },
  {
    id: "the_hunger",
    name: "The Hunger",
    icon: "🕳️",
    desc: "Something in the pact wants feeding. You will not ask what it eats.",
    priceText: "Lose 6 max HP",
    boonText: "Restore all spell slots + gain 30 gold",
  },
];

export function getBargain(id: string): Bargain {
  const b = BARGAINS.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown bargain: ${id}`);
  return b;
}

/* ---------------- Room names ---------------- */

export const ROOM_META: Record<string, { name: string; icon: string; desc: string }> = {
  combat: {
    name: "Guarded Passage",
    icon: "⚔️",
    desc: "Something between you and the stair. It is between you and everything.",
  },
  event: {
    name: "Strange Corner",
    icon: "🕯️",
    desc: "The dungeon keeps oddities the way a hoarder keeps string.",
  },
  treasure: {
    name: "Sealed Cache",
    icon: "💰",
    desc: "A chest someone died politely beside.",
  },
  rest: {
    name: "Quiet Alcove",
    icon: "🔥",
    desc: "Out of sight. Out of reach. For one hour.",
  },
};
