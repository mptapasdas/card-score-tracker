"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MAX_PLAYERS, MIN_PLAYERS, ROMANS } from "@/lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, players: string[]) => string | null;
};

const PLACEHOLDERS = [
  "Player one",
  "Player two",
  "Player three",
  "Player four",
  "Player five",
  "Player six",
  "Player seven",
  "Player eight",
  "Player nine",
  "Player ten",
  "Player eleven",
  "Player twelve",
];

export function NewGameDialog({ open, onClose, onCreate }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [seatCount, setSeatCount] = useState(MIN_PLAYERS);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setError(null);
      setSeatCount(MIN_PLAYERS);
      formRef.current?.reset();
      dialog.showModal();
      setTimeout(() => nameRef.current?.focus(), 40);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("game-name") || "").toString().trim();
    const players = Array.from({ length: seatCount }, (_, i) =>
      (fd.get(`p${i + 1}`) || "").toString().trim()
    );
    const err = onCreate(name, players);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onClose();
  };

  const addSeat = () => {
    setSeatCount((n) => Math.min(MAX_PLAYERS, n + 1));
  };

  const removeSeat = (idx: number) => {
    if (seatCount <= MIN_PLAYERS) return;
    const form = formRef.current;
    if (form) {
      const values = Array.from({ length: seatCount }, (_, i) =>
        ((form.elements.namedItem(`p${i + 1}`) as HTMLInputElement | null)?.value) ?? ""
      );
      values.splice(idx, 1);
      requestAnimationFrame(() => {
        values.forEach((v, i) => {
          const input = form.elements.namedItem(`p${i + 1}`) as HTMLInputElement | null;
          if (input) input.value = v;
        });
      });
    }
    setSeatCount((n) => n - 1);
  };

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="new-game-title"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <form
        ref={formRef}
        className="dialog__form"
        noValidate
        onSubmit={handleSubmit}
      >
        <h3 id="new-game-title" className="dialog__title">
          Open a new game
        </h3>
        <p className="dialog__sub">
          Name the game and deal in your players (up to {MAX_PLAYERS}).
        </p>

        <label className="field">
          <span className="field__label">Game name</span>
          <input
            ref={nameRef}
            name="game-name"
            className="field__input"
            type="text"
            maxLength={60}
            placeholder="Sunday Rummy, Tuesday 28, etc."
            autoComplete="off"
          />
        </label>

        <fieldset className="field field--group">
          <legend className="field__label">Players</legend>
          <div className="players-grid">
            {Array.from({ length: seatCount }, (_, i) => {
              const removable = i >= MIN_PLAYERS;
              return (
                <label key={i} className="player-field">
                  <span>{ROMANS[i]}</span>
                  <input
                    name={`p${i + 1}`}
                    maxLength={24}
                    placeholder={PLACEHOLDERS[i] ?? `Player ${i + 1}`}
                    autoComplete="off"
                  />
                  {removable && (
                    <button
                      type="button"
                      className="player-field__remove"
                      aria-label={`Remove ${PLACEHOLDERS[i] ?? `player ${i + 1}`}`}
                      onClick={() => removeSeat(i)}
                    >
                      &times;
                    </button>
                  )}
                </label>
              );
            })}
          </div>
          {seatCount < MAX_PLAYERS && (
            <button
              type="button"
              className="add-player"
              onClick={addSeat}
            >
              <span aria-hidden="true">+</span> Add player
            </button>
          )}
        </fieldset>

        {error && <p className="error">{error}</p>}

        <menu className="dialog__menu">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            Deal in
          </button>
        </menu>
      </form>
    </dialog>
  );
}
