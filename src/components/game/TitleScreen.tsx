"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const TITLE = "VOIDSWORN";
const RUNES = "ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ✦ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ✦ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ ✦ ";

function Eclipse() {
  return (
    <div className="eclipse float-slow">
      <div className="corona outer" />
      <div className="corona" />
      {/* runic rings */}
      <svg className="ring sigil-spin" viewBox="0 0 200 200" aria-hidden>
        <defs>
          <path id="rune-path-outer" d="M100,100 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" />
        </defs>
        <circle cx="100" cy="100" r="98" fill="none" stroke="oklch(0.82 0.14 200 / 35%)" strokeWidth="0.4" />
        <circle cx="100" cy="100" r="86" fill="none" stroke="oklch(0.82 0.14 200 / 25%)" strokeWidth="0.4" strokeDasharray="1 3" />
        <text fill="oklch(0.88 0.1 200 / 80%)" fontSize="7.2" letterSpacing="2.4">
          <textPath href="#rune-path-outer">{RUNES + RUNES}</textPath>
        </text>
      </svg>
      <svg className="ring sigil-spin-rev" viewBox="0 0 200 200" aria-hidden style={{ inset: "11%" }}>
        <polygon
          points="100,8 178,145 22,145"
          fill="none"
          stroke="oklch(0.85 0.15 80 / 45%)"
          strokeWidth="0.6"
        />
        <polygon
          points="100,192 22,55 178,55"
          fill="none"
          stroke="oklch(0.72 0.22 310 / 45%)"
          strokeWidth="0.6"
        />
      </svg>
      {/* orbiting moons */}
      <div className="orbit" style={{ ["--dur" as string]: "9s", ["--s" as string]: "9px", ["--c" as string]: "oklch(0.88 0.14 200)" }}>
        <i />
      </div>
      <div className="orbit" style={{ inset: "-12%", ["--dur" as string]: "16s", ["--s" as string]: "6px", ["--c" as string]: "oklch(0.86 0.15 80)" }}>
        <i />
      </div>
      <div className="orbit sigil-spin-rev" style={{ inset: "6%", ["--dur" as string]: "24s", ["--s" as string]: "5px", ["--c" as string]: "oklch(0.75 0.22 330)" }}>
        <i />
      </div>
      <div className="disk">
        <div className="eye" />
      </div>
    </div>
  );
}

const BETTER_LIST = [
  ["Real pact magic", "Few, powerful slots that ALL recharge — spend boldly, rest smart, cast hungry."],
  ["Four living patrons", "Fiend, Great Old One, Archfey, Hexblade — each with a unique passive AND a once-per-fight power."],
  ["Eldritch Invocations", "Level up and carve your build: Agonizing Blast, Thirsting Blade, Maddening Hex, and more."],
  ["Dark Bargains", "At every stairway your patron offers power for pieces of you. Refuse — if you dare."],
  ["Telegraphed dragonfire", "Vermithrax gathers flame one turn before the burn. Brace, evade, or become a cautionary tale."],
  ["Five fathoms deep", "Branching rooms, events, treasure caches and rest stops — no two falls through the void play the same."],
];

export function TitleScreen({ onStart }: { onStart: () => void }) {
  const [showBetter, setShowBetter] = useState(false);

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-10 px-4 py-16">
      <Eclipse />

      <div className="text-center">
        <p className="mb-3 font-display text-[11px] uppercase tracking-[0.6em] text-cyan-200/70">
          ✦ A pact signed beyond the stars ✦
        </p>
        <h1
          className="font-title whitespace-nowrap text-[10vw] font-black leading-none tracking-[0.04em] sm:text-8xl sm:tracking-[0.08em]"
          aria-label={TITLE}
        >
          <span className="title-chroma" data-text={TITLE}>
            <span className="letter-rise" aria-hidden>
              {TITLE.split("").map((ch, i) => (
                <span key={i} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
                  {/* gradient lives on an inner span so the rise animation can't break the text clip */}
                  <span
                    className="text-cosmic title-letter"
                    style={{ animationDelay: `${i * -0.35}s` }}
                  >
                    {ch}
                  </span>
                </span>
              ))}
            </span>
          </span>
        </h1>
        <p className="mt-3 font-display text-base tracking-[0.5em] text-amber-200/90 text-glow-ember sm:text-xl">
          PACT OF THE FALLEN STAR
        </p>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-300/80">
          Swear yourself to a power from outside the sky. Descend five fathoms of drowned starlight. Trade pieces of
          yourself for borrowed fire. At the bottom of the void, a dragon made of a dying sun is waiting — and the pact
          says you owe it a visit.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button
          size="lg"
          onClick={onStart}
          className="btn-astral h-14 rounded-full px-10 font-display text-lg font-bold tracking-[0.25em]"
        >
          ✦ SIGN THE PACT
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => setShowBetter((v) => !v)}
          className="btn-ghost-astral h-14 rounded-full px-8 font-display tracking-[0.2em]"
        >
          {showBetter ? "CLOSE THE STARCHART" : "READ THE STARCHART"}
        </Button>
      </div>

      {showBetter && (
        <div className="rune-panel rise-in w-full rounded-xl p-5">
          <ul className="grid gap-3 sm:grid-cols-2">
            {BETTER_LIST.map(([title, desc]) => (
              <li
                key={title}
                className="choice-card rounded-xl border border-cyan-300/15 bg-black/30 p-4 hover:border-cyan-300/40"
              >
                <p className="font-display text-sm font-bold tracking-wide text-amber-200">✦ {title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{desc}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
