import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import seedrandom from "seedrandom";
import type { Coordinates } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Picks n random elements from an array using the Fisher-Yates shuffle algorithm.
 * @param arr The array to pick from.
 * @param n The number of elements to pick.
 * @param seed An optional seed for reproducibility.
 * @returns An array of n random elements from the input array.
 */
export function pickRandom<T>(arr: T[], n: number, seed?: string): T[] {
  const rng = seedrandom(seed ? seed.toString() : undefined);

  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (arr.length - i));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, n);
}

/**
 * Converts degrees to radians.
 * @param degrees The angle in degrees.
 * @returns The angle in radians.
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates the haversine of an angle.
 * @param theta The angle in radians.
 * @returns The haversine of the angle.
 */
function haversine(theta: number): number {
  return Math.pow(Math.sin(theta / 2), 2);
}

/**
 * Calculates the distance between two sets of coordinates.
 * @param a The first set of coordinates.
 * @param b The second set of coordinates.
 * @returns The distance between the two sets of coordinates in meters.
 */
export function calculateDistance(a: Coordinates, b: Coordinates): number {
  const R = 6_371_000;

  return (
    2 *
    R *
    Math.asin(
      Math.sqrt(
        haversine(toRadians(b.latitude - a.latitude)) +
          Math.cos(toRadians(a.latitude)) *
            Math.cos(toRadians(b.latitude)) *
            haversine(toRadians(b.longitude - a.longitude)),
      ),
    )
  );
}

/**
 * Calculates a score from a distance.
 * @param distance The distance in meters.
 * @returns The score.
 */
export function calculateScore(distance: number): number {
  const MAX_SCORE = 5_000;
  const MIN = 5;
  const MAX = 500;
  const EXPONENT = 2.5;

  if (distance <= MIN) return MAX_SCORE;
  if (distance >= MAX) return 0;

  const normalizedError = (distance - MIN) / (MAX - MIN);
  const invertedScore = 1 - normalizedError;
  const curvedScore = Math.pow(invertedScore, EXPONENT);
  const finalScore = Math.round(curvedScore * MAX_SCORE);
  return finalScore;
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function getDailyNumber() {
  const estDateStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
  const diff =
    (new Date(estDateStr).getTime() - new Date("2026-03-15").getTime()) /
    86400000;
  return Math.floor(diff) + 1;
}
