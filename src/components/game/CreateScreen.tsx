"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PATRONS } from "@/lib/game/content";
import type { PatronId } from "@/lib/game/types";

export function CreateScreen({ onStart }: { onStart: (name: string, patron: PatronId) => void }) {
  const [name, setName] = useState("");
  const [patron, setPatron] = useState<PatronId>("fiend");
  const chosen = PATRONS.find((p) => p.id === patron)!;

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10">
      <header className="text-center">
        <h1 className="font-display text-2xl font-black uppercase tracking-[0.2em] text-glow sm:text-3xl">
          Choose Your Patron
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Every pact grants power. Every pact takes something. Read carefully — the fine print is a language.
        </p>
      </header>

      <div className="mt-10 grid items-start gap-5 md:grid-cols-2">
        {PATRONS.map((p, idx) => {
          const active = p.id === patron;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPatron(p.id)}
              aria-pressed={active}
              style={{ animationDelay: `${idx * 0.08}s` }}
              className={`rune-panel choice-card rise-in rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 ${
                active
                  ? "scale-[1.01] shadow-[0_0_60px_-10px_rgba(139,92,246,0.7)] ring-1 ring-cyan-300/60"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="portal !h-20 !w-20" style={{ ["--k" as string]: active ? "oklch(0.82 0.14 200)" : "oklch(0.6 0.15 300)" }}>
                  <span className={`${active ? "levitate" : ""} text-4xl`}>{p.icon}</span>
                </span>
                <div className="min-w-0">
                  <h2 className={`font-display text-lg font-bold tracking-wide ${p.accent}`}>{p.name}</h2>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{p.title}</p>
                  <p className="mt-2 text-sm italic text-slate-300">“{p.tagline}”</p>
                </div>
              </div>
              {active && (
                <div className="rise-in mt-4 space-y-2 border-t border-cyan-300/15 pt-3">
                  <p className="text-xs leading-relaxed text-slate-400">
                    <span className="font-bold text-emerald-300">Passive — {p.passiveName}:</span> {p.passiveDesc}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-400">
                    <span className="font-bold text-amber-300">
                      {p.active.icon} {p.active.name} (1/fight):
                    </span>{" "}
                    {p.active.desc}
                  </p>
                  <p className="border-l-2 border-violet-300/40 pl-3 text-xs italic leading-relaxed text-slate-500">
                    {p.flavor}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-8 max-w-md">
        <label htmlFor="warlock-name" className="mb-2 block text-center font-display text-xs uppercase tracking-[0.3em] text-slate-500">
          Your name, as written in the contract
        </label>
        <div className="flex gap-2">
          <Input
            id="warlock-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nyxra the Unwritten"
            maxLength={24}
            className="h-12 rounded-full border-cyan-300/30 bg-black/40 text-center font-display tracking-wider shadow-[inset_0_0_20px_rgba(139,92,246,0.15)] backdrop-blur placeholder:text-slate-600 focus-visible:border-cyan-300/70 focus-visible:shadow-[0_0_30px_-6px_rgba(34,211,238,0.7)]"
          />
        </div>
        <Button
          size="lg"
          onClick={() => onStart(name, patron)}
          className="btn-astral blood mt-5 h-14 w-full rounded-full font-display text-lg font-bold tracking-[0.25em]"
        >
          🩸 SIGN IN STARBLOOD
        </Button>
        <p className="mt-3 text-center text-[11px] italic text-slate-600">
          By signing you agree to serve {chosen.name}, fall through the void, and not ask what the whispering is.
        </p>
      </div>
    </div>
  );
}
