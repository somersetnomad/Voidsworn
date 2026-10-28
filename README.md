# VOIDSWORN — Pact of the Fallen Star

A cosmic roguelite of pact magic, eldritch invocations and dark bargains. Swear yourself to a power from beyond the sky, fall through five fathoms of drowned starlight, and face Vermithrax — a dragon made of a dying sun — at the bottom of the void.

![VOIDSWORN title and map screens](docs/preview.png)

## Features

- **Four patrons** — the Fiend, the Great Old One, the Archfey and the Hexblade, each with a passive and a once-per-fight power
- **Pact magic** — a few powerful spell slots that all recharge
- **Eldritch Invocations** — carve your build as you level up
- **Dark Bargains** — trade pieces of yourself for power between fathoms
- **Telegraphed boss** — Vermithrax gathers flame a turn before the breath: brace, evade, or burn
- **The Fallen Constellation** — every run is recorded on the leaderboard

## Tech

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma (SQLite)

## Run it locally

```bash
bun install            # or: npm install
cp .env.example .env
bun run db:push        # creates the local SQLite leaderboard
bun run dev            # http://localhost:3000
```

## Project layout

- `src/lib/game/` — the game engine: content, dice and combat math, state reducer
- `src/components/game/` — the screens, plus `Cosmos.tsx` (the animated starfield backdrop)
- `src/app/api/runs` — leaderboard API
- `scripts/simulate.ts` — headless balance simulator
