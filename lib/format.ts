export const ROMANS = ["I", "II", "III", "IV"] as const;

export const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const fmtDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const fmtScore = (n: number): string => (n > 0 ? `+${n}` : `${n}`);

export const fmtToday = (): string =>
  new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
