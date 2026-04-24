"use client";

import { useLayoutEffect, useRef } from "react";
import type { Game } from "@/lib/types";
import { ROMANS, fmtScore } from "@/lib/format";
import { rankings, totalsFor } from "@/lib/rankings";

type Props = {
  game: Game;
};

export function Leaderboard({ game }: Props) {
  const totals = totalsFor(game);
  const ranked = rankings(game);
  const maxAbs = Math.max(1, ...totals.map((t) => Math.abs(t)));

  const listRef = useRef<HTMLOListElement>(null);
  const prevTopsRef = useRef<Map<string, number>>(new Map());
  const lastRound = game.rounds.at(-1);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = list.querySelectorAll<HTMLLIElement>("[data-player-index]");
    const prev = prevTopsRef.current;
    const next = new Map<string, number>();

    items.forEach((node) => {
      const key = node.dataset.playerIndex ?? "";
      const top = node.getBoundingClientRect().top;
      next.set(key, top);
      const oldTop = prev.get(key);
      if (oldTop !== undefined) {
        const delta = oldTop - top;
        if (Math.abs(delta) > 2) {
          node.animate(
            [
              { transform: `translateY(${delta}px)` },
              { transform: "translateY(0)" },
            ],
            { duration: 420, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
          );
        }
      }
      // animate width bar from 0 to target
      const bar = node.querySelector<HTMLSpanElement>(".rank__bar");
      if (bar) {
        const targetWidth = bar.dataset.targetWidth || "0%";
        bar.style.width = "0%";
        requestAnimationFrame(() => {
          bar.style.width = targetWidth;
        });
      }
    });

    prevTopsRef.current = next;
  });

  return (
    <section className="leaderboard" aria-labelledby="lb-heading">
      <h3 id="lb-heading" className="eyebrow">
        Standing
      </h3>
      <ol ref={listRef} className="leaderboard__list">
        {ranked.map((row) => {
          const { playerIndex, total, rank } = row;
          const name = game.players[playerIndex];
          const lastDelta = lastRound ? lastRound.scores[playerIndex] : null;
          const barWidth = Math.min(100, Math.max(0, (total / maxAbs) * 100));

          return (
            <li
              key={playerIndex}
              className={`rank rank--${rank}`}
              data-player-index={playerIndex}
            >
              <span className="rank__numeral">{rank}</span>
              <div className="rank__body">
                <span className="rank__name" title={name}>
                  {name}
                </span>
                <span className="rank__score">{fmtScore(total)}</span>
                <span
                  className="rank__bar"
                  style={{ width: 0 }}
                  data-target-width={`${barWidth}%`}
                />
                <div className="rank__meta">
                  <span className="rank__seat">
                    Seat {ROMANS[playerIndex]}
                  </span>
                  <span className="rank__delta">
                    {lastDelta === null
                      ? "—"
                      : `last round ${fmtScore(lastDelta)}`}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
