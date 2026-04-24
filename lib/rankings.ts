import type { Game } from "./types";

export const totalsFor = (game: Game): number[] => {
  const totals = game.players.map(() => 0);
  for (const round of game.rounds) {
    round.scores.forEach((s, i) => {
      totals[i] += s;
    });
  }
  return totals;
};

export type Ranked = {
  playerIndex: number;
  total: number;
  rank: number;
};

export function rankings(game: Game): Ranked[] {
  const totals = totalsFor(game);
  const indexed: Ranked[] = totals.map((total, playerIndex) => ({
    playerIndex,
    total,
    rank: 0,
  }));
  indexed.sort((a, b) => b.total - a.total);

  let rank = 0;
  let prev: number | null = null;
  indexed.forEach((row, i) => {
    if (prev === null || row.total !== prev) {
      rank = i + 1;
      prev = row.total;
    }
    row.rank = rank;
  });
  return indexed;
}
