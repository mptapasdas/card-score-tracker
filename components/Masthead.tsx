"use client";

import { useEffect, useState } from "react";
import { fmtToday } from "@/lib/format";

export function Masthead() {
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    setToday(fmtToday());
  }, []);

  return (
    <header className="masthead">
      <div className="masthead__row">
        <div className="masthead__mark">
          <span className="masthead__ornament" aria-hidden="true">§</span>
          <h1 className="masthead__title">The Scorekeeper</h1>
        </div>
        <p className="masthead__meta">
          <span className="masthead__edition">Vol. I</span>
          <span className="masthead__dot" aria-hidden="true">·</span>
          <span suppressHydrationWarning>{today}</span>
        </p>
      </div>
      <p className="masthead__dek">
        A ledger for card games of four &mdash; kept honestly, kept well.
      </p>
      <hr className="masthead__rule" />
    </header>
  );
}
