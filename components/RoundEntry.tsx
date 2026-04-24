"use client";

import { FormEvent, useRef } from "react";
import type { Game } from "@/lib/types";
import { ROMANS } from "@/lib/format";
import { actions } from "@/lib/store";

type Props = {
  game: Game;
};

export function RoundEntry({ game }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const inputs = (): HTMLInputElement[] => {
    const form = formRef.current;
    if (!form) return [];
    return Array.from(form.querySelectorAll<HTMLInputElement>("input[data-player-index]"));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fields = inputs();
    const allBlank = fields.every((i) => i.value.trim() === "");
    if (allBlank) {
      fields[0]?.focus();
      return;
    }
    const scores = fields.map((input) => {
      const v = input.value.trim();
      if (v === "" || v === "-" || v === "+") return 0;
      const n = Number(v);
      return Number.isFinite(n) ? Math.trunc(n) : 0;
    });
    actions.addRound(game.id, scores);
    fields.forEach((i) => (i.value = ""));
    fields[0]?.focus();
  };

  const clearEntry = () => {
    const fields = inputs();
    fields.forEach((i) => (i.value = ""));
    fields[0]?.focus();
  };

  return (
    <section className="round-entry" aria-labelledby="entry-heading">
      <h3 id="entry-heading" className="eyebrow">
        Enter the next round
      </h3>
      <form
        ref={formRef}
        className="round-entry__form"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="round-entry__fields">
          {game.players.map((name, i) => (
            <div key={i} className="round-entry__field">
              <label htmlFor={`score-${i}`}>
                <span className="roman">{ROMANS[i]}</span>
                <span className="player-name">{name}</span>
              </label>
              <input
                id={`score-${i}`}
                name={`score-${i}`}
                data-player-index={i}
                type="number"
                inputMode="numeric"
                step="1"
                placeholder="0"
                autoComplete="off"
              />
            </div>
          ))}
        </div>
        <div className="round-entry__submit">
          <button type="submit" className="btn btn--primary">
            Record round
          </button>
          <button type="button" className="btn btn--ghost" onClick={clearEntry}>
            Clear
          </button>
        </div>
        <p className="round-entry__hint">
          Negative numbers welcome. Press <kbd>Enter</kbd> to record.
        </p>
      </form>
    </section>
  );
}
