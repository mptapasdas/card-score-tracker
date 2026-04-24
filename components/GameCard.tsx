"use client";

import type { Game } from "@/lib/types";
import { fmtDate, fmtScore } from "@/lib/format";
import { rankings, totalsFor } from "@/lib/rankings";

type Props = {
  game: Game;
  onOpen: (id: string) => void;
};

export function GameCard({ game, onOpen }: Props) {
  const totals = totalsFor(game);
  const ranked = rankings(game);
  const leaderIdx = ranked[0]?.playerIndex ?? 0;
  const hasScores = game.rounds.length > 0;

  return (
    <li>
      <button
        className="game-card"
        type="button"
        onClick={() => onOpen(game.id)}
      >
        <div className="game-card__head">
          <span className="game-card__name">{game.name}</span>
          <span className="game-card__date" suppressHydrationWarning>
            {fmtDate(game.createdAt)}
          </span>
        </div>
        <div className="game-card__players">
          {game.players.map((p, i) => (
            <span
              key={i}
              className={
                "chip" + (hasScores && i === leaderIdx ? " chip--leader" : "")
              }
            >
              {p}
            </span>
          ))}
        </div>
        <div className="game-card__foot">
          <span>
            <span className="rounds-count">{game.rounds.length}</span> rounds
          </span>
          {hasScores ? (
            <strong className="leader-score">
              {game.players[leaderIdx]} · {fmtScore(totals[leaderIdx])}
            </strong>
          ) : (
            <strong
              className="leader-score"
              style={{ color: "var(--ink-3)", fontStyle: "italic" }}
            >
              no scores yet
            </strong>
          )}
        </div>
      </button>
    </li>
  );
}
