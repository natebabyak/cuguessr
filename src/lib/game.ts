import { START_DATE } from "./constants";

const MS_PER_DAY = 86_400_000;

export function getGameNumber(date: string): number {
  return Math.floor((Date.parse(date) - Date.parse(START_DATE)) / MS_PER_DAY) + 1;
}

export function isAvailableGameDate(date: string, now = new Date()): boolean {
  const today = Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return (
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(Date.parse(date)) &&
    new Date(date).toISOString().slice(0, 10) === date &&
    date >= START_DATE &&
    date <= today
  );
}
