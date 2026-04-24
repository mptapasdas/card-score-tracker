"use client";

import { actions } from "@/lib/store";
import { useConfirm } from "./providers/ConfirmProvider";

export function Colophon() {
  const confirm = useConfirm();

  const exportAll = () => {
    const state = actions.snapshot();
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scorekeeper-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const resetAll = async () => {
    const ok = await confirm(
      "This clears every game in the book from this browser."
    );
    if (ok) actions.resetAll();
  };

  return (
    <footer className="colophon">
      <hr />
      <p>
        <span>Kept locally, in this browser alone.</span>
        <span className="colophon__sep" aria-hidden="true">·</span>
        <button className="linklike" onClick={exportAll}>
          Export all
        </button>
        <span className="colophon__sep" aria-hidden="true">·</span>
        <button className="linklike linklike--quiet" onClick={resetAll}>
          Clear the book
        </button>
      </p>
    </footer>
  );
}
