import type { Coordinates } from "./types";

const EARTH_RADIUS_METERS = 6_371_000;

const MAX_SCORE = 5_000;
const PERFECT_SCORE_DISTANCE_METERS = 5;
const ZERO_SCORE_DISTANCE_METERS = 500;
const SCORE_EXPONENT = 2.5;

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function calculateDistance({
  a,
  b,
}: {
  a: Coordinates;
  b: Coordinates;
}): number {
  const latitudeA = degreesToRadians(a.latitude);
  const latitudeB = degreesToRadians(b.latitude);
  const deltaLatitude = latitudeB - latitudeA;
  const deltaLongitude = degreesToRadians(b.longitude - a.longitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(deltaLongitude / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(haversine));
}

export function calculatePoints(distance: number): number {
  if (distance <= PERFECT_SCORE_DISTANCE_METERS) {
    return MAX_SCORE;
  }

  if (distance >= ZERO_SCORE_DISTANCE_METERS) {
    return 0;
  }

  const normalizedDistance =
    (distance - PERFECT_SCORE_DISTANCE_METERS) /
    (ZERO_SCORE_DISTANCE_METERS - PERFECT_SCORE_DISTANCE_METERS);

  return Math.round((1 - normalizedDistance) ** SCORE_EXPONENT * MAX_SCORE);
}
