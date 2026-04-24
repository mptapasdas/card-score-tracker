"use client";

import { useState } from "react";
import type { Game } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { actions } from "@/lib/store";
import { useConfirm } from "./providers/ConfirmProvider";
import { Leaderboard } from "./Leaderboard";
import { RoundEntry } from "./RoundEntry";
import { RoundsTable } from "./RoundsTable";
import { RenameDialog } from "./dialogs/RenameDialog";

type Props = {
  game: Game;
};

export function GameView({ game }: Props) {
  const confirm = useConfirm();
  const [renameOpen, setRenameOpen] = useState(false);

  const back = () => {
    actions.setActive(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onDeleteGame = async () => {
    const ok = await confirm(`Remove "${game.name}" and all its rounds?`);
    if (ok) actions.deleteGame(game.id);
  };

  return (
    <section className="view view--game" aria-labelledby="game-heading">
      <nav className="crumbs" aria-label="Breadcrumb">
        <button className="crumbs__back" onClick={back}>
          <span aria-hidden="true">&larr;</span> All games
        </button>
        <span className="crumbs__sep" aria-hidden="true">/</span>
        <span className="crumbs__now">{game.name}</span>
      </nav>

      <header className="game-head">
        <div>
          <h2 id="game-heading" className="game-head__title">
            {game.name}
          </h2>
          <p className="game-head__sub">
            Opened <span suppressHydrationWarning>{fmtDate(game.createdAt)}</span>
            <span className="masthead__dot" aria-hidden="true"> · </span>
            <span>{game.rounds.length}</span> rounds recorded
          </p>
        </div>
        <div className="game-head__actions">
          <button
            className="btn btn--ghost"
            onClick={() => setRenameOpen(true)}
          >
            Rename
          </button>
          <button
            className="btn btn--danger-ghost"
            onClick={onDeleteGame}
          >
            Delete game
          </button>
        </div>
      </header>

      <Leaderboard game={game} />
      <RoundEntry game={game} />
      <RoundsTable game={game} />

      <RenameDialog
        open={renameOpen}
        initialName={game.name}
        onClose={() => setRenameOpen(false)}
        onRename={(newName) => actions.renameGame(game.id, newName)}
      />
    </section>
  );
}
