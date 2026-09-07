import { MIN_DATE } from "@/lib/constants";

export function getGameNumber(date: string): number {
  const [startYear, startMonth, startDay] = MIN_DATE.split("-").map(Number);
  const [targetYear, targetMonth, targetDay] = date.split("-").map(Number);

  const startUtc = Date.UTC(startYear, startMonth - 1, startDay);
  const targetUtc = Date.UTC(targetYear, targetMonth - 1, targetDay);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const diffInDays = Math.floor((targetUtc - startUtc) / MS_PER_DAY);

  return diffInDays + 1;
}
