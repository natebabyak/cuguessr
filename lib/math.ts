/**
 * Represents geographical coordinates.
 */
interface Coordinates {
  latitude: number;
  longitude: number;
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
function calculateDistance(a: Coordinates, b: Coordinates): number {
  const R = 6_371_000;

  return (
    2 *
    R *
    Math.asin(
      Math.sqrt(
        haversine(toRadians(b.latitude - a.latitude)) +
          Math.cos(toRadians(a.latitude)) *
            Math.cos(toRadians(b.latitude)) *
            haversine(toRadians(b.longitude - a.longitude))
      )
    )
  );
}

/**
 * Calculates a score from a distance.
 * @param distance The distance in meters.
 * @returns The score.
 */
function calculateScore(distance: number): number {
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

export { type Coordinates, calculateDistance, calculateScore };
