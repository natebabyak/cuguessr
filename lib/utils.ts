import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import seedrandom from "seedrandom";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pickRandom<T>(arr: T[], n: number, seed?: number): T[] {
  const rng = seedrandom(seed ? seed.toString() : undefined);

  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (arr.length - i));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, n);
}
