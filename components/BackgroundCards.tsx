"use client";

import { memo, useEffect, useRef } from "react";

type CardSpec = {
  left: string;
  top: string;
  rotate: number;
  delay: number;
  duration: number;
  drift: [number, number];
  rank: string;
  suit: "♠" | "♥" | "♦" | "♣";
  size: number;
};

const RED = new Set(["♥", "♦"]);

const CARDS: CardSpec[] = [
  { left: "4%",  top: "8%",   rotate: -18, delay: 0,  duration: 18, drift: [40, -60],  rank: "A",  suit: "♠", size: 1.0 },
  { left: "14%", top: "78%",  rotate: 12,  delay: 3,  duration: 24, drift: [-55, -40], rank: "K",  suit: "♥", size: 1.1 },
  { left: "88%", top: "14%",  rotate: 22,  delay: 6,  duration: 20, drift: [-45, 70],  rank: "Q",  suit: "♦", size: 1.0 },
  { left: "92%", top: "68%",  rotate: -9,  delay: 9,  duration: 22, drift: [-60, -50], rank: "J",  suit: "♣", size: 0.9 },
  { left: "48%", top: "4%",   rotate: 7,   delay: 2,  duration: 16, drift: [30, 55],   rank: "10", suit: "♠", size: 0.85 },
  { left: "72%", top: "88%",  rotate: -24, delay: 5,  duration: 26, drift: [-35, -75], rank: "A",  suit: "♥", size: 1.05 },
  { left: "28%", top: "22%",  rotate: -12, delay: 11, duration: 19, drift: [50, -35],  rank: "9",  suit: "♣", size: 0.8 },
  { left: "60%", top: "46%",  rotate: 18,  delay: 7,  duration: 23, drift: [-40, 60],  rank: "7",  suit: "♦", size: 0.75 },
  { left: "8%",  top: "44%",  rotate: 25,  delay: 13, duration: 21, drift: [45, -55],  rank: "J",  suit: "♠", size: 0.9 },
  { left: "80%", top: "34%",  rotate: -16, delay: 4,  duration: 18, drift: [-30, -65], rank: "K",  suit: "♣", size: 0.95 },
  { left: "38%", top: "90%",  rotate: 8,   delay: 10, duration: 25, drift: [60, -45],  rank: "Q",  suit: "♥", size: 1.0 },
  { left: "54%", top: "70%",  rotate: -20, delay: 1,  duration: 20, drift: [-50, 50],  rank: "8",  suit: "♠", size: 0.8 },
];

const REPEL_RANGE = 200;
const REPEL_STRENGTH = 90;
const EASE = 0.18;

export const BackgroundCards = memo(function BackgroundCards() {
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const mouse = { x: -9999, y: -9999 };
    const current = CARDS.map(() => ({ x: 0, y: 0 }));
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const tick = () => {
      wrapRefs.current.forEach((wrap, i) => {
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - mouse.x;
        const dy = cy - mouse.y;
        const dist = Math.hypot(dx, dy);
        let tx = 0;
        let ty = 0;
        if (dist < REPEL_RANGE && dist > 0) {
          const t = 1 - dist / REPEL_RANGE;
          const falloff = t * t;
          tx = (dx / dist) * falloff * REPEL_STRENGTH;
          ty = (dy / dist) * falloff * REPEL_STRENGTH;
        }
        const state = current[i];
        state.x += (tx - state.x) * EASE;
        state.y += (ty - state.y) * EASE;
        wrap.style.setProperty("--repel-x", `${state.x.toFixed(2)}px`);
        wrap.style.setProperty("--repel-y", `${state.y.toFixed(2)}px`);
      });
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="bg-cards" aria-hidden="true">
      {CARDS.map((c, i) => {
        const red = RED.has(c.suit);
        const wrapStyle = {
          left: c.left,
          top: c.top,
          ["--rotate-base" as string]: `${c.rotate}deg`,
          ["--drift-x" as string]: `${c.drift[0]}px`,
          ["--drift-y" as string]: `${c.drift[1]}px`,
          ["--card-scale" as string]: c.size,
          ["--float-duration" as string]: `${c.duration}s`,
          ["--float-delay" as string]: `${c.delay}s`,
        } as React.CSSProperties;
        return (
          <div
            key={i}
            ref={(el) => {
              wrapRefs.current[i] = el;
            }}
            className="bg-card-wrap"
            style={wrapStyle}
          >
            <div className={`bg-card ${red ? "bg-card--red" : ""}`}>
              <div className="bg-card__corner bg-card__corner--tl">
                <span className="bg-card__rank">{c.rank}</span>
                <span className="bg-card__suit">{c.suit}</span>
              </div>
              <span className="bg-card__center" aria-hidden="true">
                {c.suit}
              </span>
              <div className="bg-card__corner bg-card__corner--br">
                <span className="bg-card__rank">{c.rank}</span>
                <span className="bg-card__suit">{c.suit}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
