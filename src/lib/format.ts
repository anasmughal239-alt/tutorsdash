import { format, parseISO } from "date-fns";

export function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, "MMM d, yyyy");
}

export function fmtDateTime(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, "MMM d, yyyy · h:mm a");
}

export function fmtBytes(n: number | null | undefined) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function letterGrade(pct: number): string {
  if (pct >= 85) return "A++";
  if (pct >= 80) return "A+";
  if (pct >= 75) return "A";
  if (pct >= 60) return "B";
  if (pct >= 45) return "C";
  if (pct >= 40) return "D";
  return "E";
}
