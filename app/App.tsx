"use client";

import { useEffect, useState } from "react";
import { hydrate, useStore } from "@/lib/store";
import { ConfirmProvider } from "@/components/providers/ConfirmProvider";
import { Masthead } from "@/components/Masthead";
import { Colophon } from "@/components/Colophon";
import { GamesList } from "@/components/GamesList";
import { GameView } from "@/components/GameView";

export function App() {
  const [mounted, setMounted] = useState(false);
  const state = useStore();

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, []);

  const activeGame =
    state.activeId !== null
      ? state.games.find((g) => g.id === state.activeId) ?? null
      : null;

  return (
    <ConfirmProvider>
      <div className="grain" aria-hidden="true" />
      <Masthead />
      <main className="stage">
        {!mounted ? null : activeGame ? (
          <GameView key={activeGame.id} game={activeGame} />
        ) : (
          <GamesList games={state.games} />
        )}
      </main>
      <Colophon />
    </ConfirmProvider>
  );
}
