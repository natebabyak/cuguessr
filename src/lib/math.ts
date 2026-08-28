import type { Coordinates } from "#/lib/types.ts";

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function haversine(theta: number): number {
  return Math.sin(theta / 2) ** 2;
}

export function calculateDistance({
  a,
  b,
}: {
  a: Coordinates;
  b: Coordinates;
}) {
  return (
    2 *
    6371000 *
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

export function calculatePoints(distance: number): number {
  const MAX_SCORE = 5_000;
  const MIN = 5;
  const MAX = 500;
  const EXPONENT = 2.5;

  if (distance <= MIN) return MAX_SCORE;
  if (distance >= MAX) return 0;

  return Math.round(
    (1 - (distance - MIN) / (MAX - MIN)) ** EXPONENT * MAX_SCORE,
  );
}
