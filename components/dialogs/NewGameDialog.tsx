"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, players: string[]) => string | null;
};

export function NewGameDialog({ open, onClose, onCreate }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setError(null);
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
    const players = [1, 2, 3, 4].map((i) =>
      (fd.get(`p${i}`) || "").toString().trim()
    );
    const err = onCreate(name, players);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onClose();
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
        <p className="dialog__sub">Name the game and deal in your four.</p>

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
            <label className="player-field">
              <span>I</span>
              <input name="p1" maxLength={24} placeholder="Player one" autoComplete="off" />
            </label>
            <label className="player-field">
              <span>II</span>
              <input name="p2" maxLength={24} placeholder="Player two" autoComplete="off" />
            </label>
            <label className="player-field">
              <span>III</span>
              <input name="p3" maxLength={24} placeholder="Player three" autoComplete="off" />
            </label>
            <label className="player-field">
              <span>IV</span>
              <input name="p4" maxLength={24} placeholder="Player four" autoComplete="off" />
            </label>
          </div>
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
