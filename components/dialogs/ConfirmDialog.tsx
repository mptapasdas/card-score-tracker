"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ open, message, onCancel, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="dialog dialog--confirm"
      aria-labelledby="confirm-title"
      onClick={(e) => {
        if (e.target === dialogRef.current) onCancel();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <form
        className="dialog__form"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm();
        }}
      >
        <h3 id="confirm-title" className="dialog__title">
          Are you certain?
        </h3>
        <p className="dialog__sub">{message}</p>
        <menu className="dialog__menu">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            No, keep it
          </button>
          <button type="submit" className="btn btn--danger">
            Yes, remove
          </button>
        </menu>
      </form>
    </dialog>
  );
}
