export type Round = {
  id: string;
  scores: number[];
};

export type Game = {
  id: string;
  name: string;
  createdAt: string;
  players: string[];
  rounds: Round[];
};

export type State = {
  games: Game[];
  activeId: string | null;
};
