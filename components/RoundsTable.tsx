"use client";

import type { Game } from "@/lib/types";
import { fmtScore } from "@/lib/format";
import { totalsFor } from "@/lib/rankings";
import { actions } from "@/lib/store";

type Props = {
  game: Game;
};

export function RoundsTable({ game }: Props) {
  const totals = totalsFor(game);
  const maxVal = totals.length ? Math.max(...totals) : 0;
  const hasRounds = game.rounds.length > 0;

  return (
    <section className="history" aria-labelledby="history-heading">
      <div className="history__head">
        <h3 id="history-heading" className="eyebrow">
          The record
        </h3>
        <p className="history__key">
          positive &mdash; <span className="minus">negative</span>
        </p>
      </div>
      <div className="history__scroller">
        <table className="rounds">
          <thead>
            <tr>
              <th>Round</th>
              {game.players.map((p, i) => (
                <th key={i}>{p}</th>
              ))}
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {game.rounds.map((round, i) => (
              <tr key={round.id}>
                <td>No. {i + 1}</td>
                {round.scores.map((s, j) => {
                  const cls = s > 0 ? "pos" : s < 0 ? "neg" : "zero";
                  return (
                    <td key={j} className={`score-cell ${cls}`}>
                      {fmtScore(s)}
                    </td>
                  );
                })}
                <td>
                  <button
                    type="button"
                    className="row-delete"
                    onClick={() => actions.deleteRound(game.id, round.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              {totals.map((t, i) => {
                const isLeader = hasRounds && t === maxVal;
                return (
                  <td
                    key={i}
                    className={isLeader ? "is-leader" : undefined}
                    style={t < 0 ? { color: "var(--bordeaux-deep)" } : undefined}
                  >
                    {fmtScore(t)}
                  </td>
                );
              })}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      {!hasRounds && (
        <p className="empty empty--inline">No rounds recorded yet.</p>
      )}
    </section>
  );
}
