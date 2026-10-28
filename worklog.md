# Worklog

---
Task ID: 1
Agent: main (Z.ai)
Task: Build "Warlock: Pact & Dungeon" — a D&D-Warlock-themed tactical web game, "60% better than the original"

Work Log:
- Initialized fullstack environment (Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui + Prisma/SQLite)
- Designed game systems in src/lib/game/: types.ts (state model), content.ts (4 patrons, 11 spells, 10 invocations, 13 enemies + dragon boss, 8 items, 6 events, 7 dark bargains), engine.ts (dice, attack rolls, status helpers), reducer.ts (all state transitions)
- Built UI in src/components/game/: GameRoot phase router, TitleScreen (hall of fallen warlocks), CreateScreen (patron select), MapScreen (branching room choice), CombatScreen (enemy cards, d20 roll chips, floating damage, status chips, spell/item trays, patron powers, telegraph banner, combat log), Event/Treasure/Rest/Bargain/Levelup/End screens
- Dark fantasy theme in globals.css: oklch violet/ember palette, Cinzel display font, rune panels, vignette, keyframe animations (floaters, shake, dice pop, telegraph pulse, ember breathe)
- Persistence: Prisma Run model + /api/runs (GET top 12, POST with zod validation); EndScreen auto-saves runs; TitleScreen shows hall
- Fixed critical engine bug: status helpers mutated a temp wrapper instead of combat state (permanent evade exploit — Archfey was winning 100% of sim runs)
- Balanced via headless simulation (scripts/simulate.ts, 300 runs): tuned HP curve (32→64), enemy accuracy/damage, boss (150 HP, telegraphed breath cycle, enrage/desperate phases), patron passives; final win rates 43-60% per patron with random-pick AI
- Fixed UI issues: duplicate room kinds on map, floor-1 double-combat, patron button causing mobile horizontal overflow, stale Turbopack CSS cache (server restart)
- Verified with Agent Browser: title→create→map→combat→victory→death→EndScreen→DB save; desktop + 390px mobile screenshots; lint and tsc clean; no runtime errors in dev.log

Stage Summary:
- Deliverable: complete playable roguelite dungeon crawler at / (single route)
- Key artifacts: src/lib/game/* (engine), src/components/game/* (9 screens + parts), src/app/api/runs, prisma Run model, scripts/simulate.ts (balance harness)
- Balance data: 300 sim runs, 0 crashes, deaths spread floors 3-5, boss is the main wall

---
Task ID: 2
Agent: Claude
Task: Make the game "80% more interesting visually, out of this world" and give it a new name

Work Log:
- Renamed the game VOIDSWORN — Pact of the Fallen Star (metadata, title, end screen, file headers); new eclipse favicon at public/icon.svg; floors are now called "Fathoms", the leaderboard is "The Fallen Constellation"
- New Cosmos backdrop (src/components/game/Cosmos.tsx): canvas starfield in 3 parallax depths that follow the cursor, twinkle and drift, diffraction spikes on near stars, shooting stars, hyperspace warp streaks on every scene change, drifting nebulae tinted per phase (boss fight turns the sky ember-red), film grain, cursor light
- New palette (deep-space ink / astral violet / aurora cyan / starfire gold) + Cinzel Decorative title font
- Glass "astral" panels with an animated rotating starlit edge; shimmering gradient buttons with a light sweep
- Title: eclipse sigil with rotating corona, runic ring, sacred-geometry triangles, orbiting moons; letter-by-letter rise with chromatic glitch
- Combat: levitating enemies over glowing portals coloured by trait, boss sun-corona, targeting reticle, impact shockwave + core + shards on hits, gold screen flash on crits, red vignette when you are hit, hexagonal d20 roll chip, coloured action tiles, flowing HP bars with lagging damage trail, spell slots shown as twinkling stars
- Map: rooms are spinning portals; floor progress is a constellation that lights up
- Every other screen restyled to match (portal icons, pointer-following spotlight on choice cards)
- Fixed Rest screen label (said 45% heal, reducer heals 60%)
- prefers-reduced-motion respected
- Game logic untouched; tsc clean; lint shows only the 2 pre-existing shadcn errors
