// Number, currency and timestamp formatting helpers.

export function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

export function fmtNum(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "－";
  return Number(v).toLocaleString("ja-JP", { maximumFractionDigits: 1 });
}

export function fmtYen(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "－";
  return "¥" + fmtNum(v);
}

/** Formats a date as 2026/09/16 08:35. */
export function fmtStamp(d: Date): string {
  const p = (n: number) => ("0" + n).slice(-2);
  return (
    d.getFullYear() +
    "/" +
    p(d.getMonth() + 1) +
    "/" +
    p(d.getDate()) +
    " " +
    p(d.getHours()) +
    ":" +
    p(d.getMinutes())
  );
}
