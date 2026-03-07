import type { Coordinates } from "@/lib/types";

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

/**
 * Calculates the appropriate zoom level to make a line between two points
 * take up the majority of the screen.
 * @param distance The distance between the two points in meters.
 * @param centerLatitude The latitude at the center point (for accurate calculations).
 * @param screenCoverage The desired percentage of screen the line should span (0-1). Default 0.7 (70%).
 * @param viewportWidth The viewport width in pixels. Default 1200.
 * @returns The calculated zoom level.
 */
function calculateZoomForDistance(
  distance: number,
  centerLatitude: number,
  screenCoverage: number = 0.7,
  viewportWidth: number = 1200,
): number {
  // Constants for Web Mercator projection
  const EARTH_CIRCUMFERENCE = 40075017; // meters at equator
  const TILE_SIZE = 256; // pixels per tile

  // Calculate meters per pixel at the given latitude
  // At zoom level z: metersPerPixel = (EARTH_CIRCUMFERENCE * cos(latitude)) / (TILE_SIZE * 2^z)
  // We want: distanceInMeters = screenCoverage * viewportWidth * metersPerPixel
  // Solving for z: 2^z = (EARTH_CIRCUMFERENCE * cos(latitude) * screenCoverage * viewportWidth) / (distanceInMeters * TILE_SIZE)
  // z = log2((EARTH_CIRCUMFERENCE * cos(latitude) * screenCoverage * viewportWidth) / (distanceInMeters * TILE_SIZE))

  const latRad = toRadians(centerLatitude);
  const cosLat = Math.cos(latRad);

  // Calculate the zoom level
  const numerator =
    EARTH_CIRCUMFERENCE * cosLat * screenCoverage * viewportWidth;
  const denominator = distance * TILE_SIZE;

  // Avoid division by zero and ensure minimum zoom
  if (denominator === 0 || numerator === 0) {
    return 15; // Default zoom level
  }

  const zoom = Math.log2(numerator / denominator);

  // Clamp zoom to reasonable bounds (typically 0-20 for web maps)
  return Math.max(0, Math.min(20, zoom));
}

export {
  type Coordinates,
  calculateDistance,
  calculateScore,
  calculateZoomForDistance,
};
