"use client";

import { useReducer } from "react";
import { gameReducer, initialState } from "@/lib/game/reducer";
import { TitleScreen } from "./TitleScreen";
import { CreateScreen } from "./CreateScreen";
import { MapScreen } from "./MapScreen";
import { CombatScreen } from "./CombatScreen";
import { EventScreen } from "./EventScreen";
import { TreasureScreen } from "./TreasureScreen";
import { RestScreen } from "./RestScreen";
import { BargainScreen } from "./BargainScreen";
import { LevelupScreen } from "./LevelupScreen";
import { EndScreen } from "./EndScreen";
import { Cosmos } from "./Cosmos";

/** Nebula hue per phase — the sky changes with what you face. */
const MOOD: Record<string, number> = {
  title: 300,
  create: 290,
  map: 265,
  combat: 320,
  event: 275,
  treasure: 75,
  rest: 175,
  bargain: 15,
  levelup: 85,
  gameover: 0,
  victory: 60,
};

export default function GameRoot() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState);
  const mood = state.phase === "combat" && state.combat?.isBoss ? 25 : (MOOD[state.phase] ?? 300);
  // a fresh warp each time the floor or phase changes
  const sceneKey = `${state.phase}-${state.floor}`;

  /* spotlight that follows the pointer across any .choice-card */
  const onPointerMove = (e: React.PointerEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(".choice-card");
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <main
      onPointerMove={onPointerMove}
      className="relative min-h-screen overflow-x-hidden text-foreground"
    >
      <Cosmos mood={mood} warpKey={sceneKey} />
      <div key={sceneKey} className="warp-in relative z-10">
        {state.phase === "title" && <TitleScreen onStart={() => dispatch({ type: "GO_CREATE" })} />}
        {state.phase === "create" && (
          <CreateScreen onStart={(name, patron) => dispatch({ type: "START_RUN", name, patron })} />
        )}
        {state.phase === "map" && <MapScreen state={state} dispatch={dispatch} />}
        {state.phase === "combat" && state.combat && <CombatScreen state={state} dispatch={dispatch} />}
        {state.phase === "event" && <EventScreen state={state} dispatch={dispatch} />}
        {state.phase === "treasure" && <TreasureScreen state={state} dispatch={dispatch} />}
        {state.phase === "rest" && <RestScreen state={state} dispatch={dispatch} />}
        {state.phase === "bargain" && <BargainScreen state={state} dispatch={dispatch} />}
        {state.phase === "levelup" && <LevelupScreen state={state} dispatch={dispatch} />}
        {(state.phase === "gameover" || state.phase === "victory") && (
          <EndScreen state={state} dispatch={dispatch} />
        )}
      </div>
    </main>
  );
}
