"use client";

import { useMemo, useState } from "react";
import type { Game } from "@/lib/types";
import { actions } from "@/lib/store";
import { GameCard } from "./GameCard";
import { NewGameDialog } from "./dialogs/NewGameDialog";

type Props = {
  games: Game[];
};

export function GamesList({ games }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const sorted = useMemo(
    () =>
      [...games].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [games]
  );

  const handleCreate = (name: string, players: string[]): string | null => {
    if (!name) return "Give the game a name.";
    if (players.some((p) => !p)) return "All four seats need a name.";
    const lower = players.map((p) => p.toLowerCase());
    if (new Set(lower).size !== 4) return "Players must have distinct names.";
    actions.createGame(name, players);
    return null;
  };

  const openGame = (id: string) => {
    actions.setActive(id);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="view view--index" aria-labelledby="index-heading">
      <div className="section-head">
        <h2 id="index-heading" className="section-head__title">
          Games in the book
        </h2>
        <button
          className="btn btn--primary"
          onClick={() => setDialogOpen(true)}
        >
          <span className="btn__plus" aria-hidden="true">+</span>
          <span>Open a new game</span>
        </button>
      </div>

      {sorted.length > 0 ? (
        <ol className="games" aria-live="polite">
          {sorted.map((game) => (
            <GameCard key={game.id} game={game} onOpen={openGame} />
          ))}
        </ol>
      ) : (
        <p className="empty">
          The book is blank.{" "}
          <button className="linklike" onClick={() => setDialogOpen(true)}>
            Deal the first hand &rarr;
          </button>
        </p>
      )}

      <NewGameDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
    </section>
  );
}
