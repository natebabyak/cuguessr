export type Coordinates = { latitude: number; longitude: number };

const EARTH_RADIUS_METERS = 6_371_000;
const MAX_SCORE = 5_000;
const PERFECT_SCORE_DISTANCE_METERS = 5;
const ZERO_SCORE_DISTANCE_METERS = 500;
const SCORE_EXPONENT = 2.5;

export function calculateDistance({ a, b }: { a: Coordinates; b: Coordinates }): number {
  const radians = Math.PI / 180;
  const latitudeA = a.latitude * radians;
  const latitudeB = b.latitude * radians;
  const deltaLatitude = latitudeB - latitudeA;
  const deltaLongitude = (b.longitude - a.longitude) * radians;
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(deltaLongitude / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(Math.min(1, haversine)));
}

export function calculatePoints(distance: number): number {
  if (distance <= PERFECT_SCORE_DISTANCE_METERS) return MAX_SCORE;
  if (distance >= ZERO_SCORE_DISTANCE_METERS) return 0;

  const normalizedDistance =
    (distance - PERFECT_SCORE_DISTANCE_METERS) /
    (ZERO_SCORE_DISTANCE_METERS - PERFECT_SCORE_DISTANCE_METERS);

  return Math.round((1 - normalizedDistance) ** SCORE_EXPONENT * MAX_SCORE);
}
