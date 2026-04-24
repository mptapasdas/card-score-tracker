"use client";

import { FormEvent, useEffect, useRef } from "react";

type Props = {
  open: boolean;
  initialName: string;
  onClose: () => void;
  onRename: (newName: string) => void;
};

export function RenameDialog({ open, initialName, onClose, onRename }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (inputRef.current) inputRef.current.value = initialName;
      dialog.showModal();
      setTimeout(() => inputRef.current?.select(), 40);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialName]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = inputRef.current?.value ?? "";
    onRename(value);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="rename-title"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <form className="dialog__form" noValidate onSubmit={handleSubmit}>
        <h3 id="rename-title" className="dialog__title">
          Rename the game
        </h3>
        <label className="field">
          <span className="field__label">New name</span>
          <input
            ref={inputRef}
            name="rename"
            className="field__input"
            type="text"
            maxLength={60}
            autoComplete="off"
            defaultValue={initialName}
          />
        </label>
        <menu className="dialog__menu">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            Rename
          </button>
        </menu>
      </form>
    </dialog>
  );
}
