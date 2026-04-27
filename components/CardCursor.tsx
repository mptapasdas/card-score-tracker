"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, [role="button"], label.player-field, label.field';

export function CardCursor() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const el = rootRef.current;
    if (!el) return;

    const state = { x: -100, y: -100, tx: -100, ty: -100, raf: 0, armed: false };

    const onMove = (e: MouseEvent) => {
      state.tx = e.clientX;
      state.ty = e.clientY;
      if (!state.armed) {
        state.armed = true;
        state.x = state.tx;
        state.y = state.ty;
        el.classList.add("is-visible");
      }
    };

    const onLeave = () => {
      el.classList.remove("is-visible");
    };

    const onEnter = () => {
      if (state.armed) el.classList.add("is-visible");
    };

    const onDown = () => el.classList.add("is-pressed");
    const onUp = () => el.classList.remove("is-pressed");

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t && t.closest?.(INTERACTIVE_SELECTOR)) {
        el.classList.add("is-hot");
      } else {
        el.classList.remove("is-hot");
      }
    };

    const tick = () => {
      state.x += (state.tx - state.x) * 0.26;
      state.y += (state.ty - state.y) * 0.26;
      el.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      state.raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.body.classList.add("has-card-cursor");
    state.raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.body.classList.remove("has-card-cursor");
      cancelAnimationFrame(state.raf);
    };
  }, []);

  return (
    <div ref={rootRef} className="card-cursor" aria-hidden="true">
      <svg
        className="card-cursor__arrow"
        viewBox="0 0 24 28"
        width="22"
        height="26"
      >
        <path
          d="M12 2c-2.76 0-5 2.24-5 5 0 1.19.42 2.29 1.11 3.15C5.8 10.58 3.5 12.8 3.5 15.5c0 2.76 2.24 5 5 5 1.32 0 2.52-.51 3.42-1.35L11 26h2l-.92-6.85c.9.84 2.1 1.35 3.42 1.35 2.76 0 5-2.24 5-5 0-2.7-2.3-4.92-4.61-5.35C16.58 9.29 17 8.19 17 7c0-2.76-2.24-5-5-5z"
          fill="#1a1410"
          stroke="#f6ecd2"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
