"use client";

import { useSyncExternalStore } from "react";
import type { Game, Round, State } from "./types";
import { uid } from "./format";

const STORAGE_KEY = "scorekeeper:v1";

const emptyState: State = { games: [], activeId: null };

let state: State = emptyState;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full / unavailable — ignore
  }
}

function readFromStorage(): State {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { games: [], activeId: null };
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      games: Array.isArray(parsed.games) ? parsed.games : [],
      activeId: parsed.activeId ?? null,
    };
  } catch {
    return { games: [], activeId: null };
  }
}

let hydrated = false;
export function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const next = readFromStorage();
  if (next.games.length > 0 || next.activeId) {
    state = next;
    notify();
  }
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    state = readFromStorage();
    notify();
  });
}

function setState(updater: (prev: State) => State) {
  state = updater(state);
  persist();
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => emptyState;

export function useStore(): State {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const actions = {
  setActive(id: string | null) {
    setState((s) => ({ ...s, activeId: id }));
  },

  createGame(name: string, players: string[]): Game {
    const game: Game = {
      id: uid(),
      name,
      createdAt: new Date().toISOString(),
      players,
      rounds: [],
    };
    setState((s) => ({
      games: [...s.games, game],
      activeId: game.id,
    }));
    return game;
  },

  deleteGame(id: string) {
    setState((s) => ({
      games: s.games.filter((g) => g.id !== id),
      activeId: s.activeId === id ? null : s.activeId,
    }));
  },

  renameGame(id: string, newName: string) {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setState((s) => ({
      ...s,
      games: s.games.map((g) => (g.id === id ? { ...g, name: trimmed } : g)),
    }));
  },

  addRound(gameId: string, scores: number[]) {
    const round: Round = { id: uid(), scores };
    setState((s) => ({
      ...s,
      games: s.games.map((g) =>
        g.id === gameId ? { ...g, rounds: [...g.rounds, round] } : g
      ),
    }));
  },

  deleteRound(gameId: string, roundId: string) {
    setState((s) => ({
      ...s,
      games: s.games.map((g) =>
        g.id === gameId
          ? { ...g, rounds: g.rounds.filter((r) => r.id !== roundId) }
          : g
      ),
    }));
  },

  resetAll() {
    setState(() => ({ games: [], activeId: null }));
  },

  snapshot(): State {
    return state;
  },
};
