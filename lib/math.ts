import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "./constants";

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
 * Calculates the distance between two geographical coordinates.
 * @param a The first set of coordinates.
 * @param b The second set of coordinates (optional).
 * @returns The distance between the two coordinates in meters.
 */
function distanceInMeters(a: Coordinates, b?: Coordinates): number {
  const R = 6_371_000;

  const { latitude: lat1, longitude: lng1 } = a;
  const {
    latitude: lat2 = DEFAULT_LATITUDE,
    longitude: lng2 = DEFAULT_LONGITUDE,
  } = b || {};

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const h =
    haversine(dLat) + Math.cos(lat1Rad) * Math.cos(lat2Rad) * haversine(dLng);

  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Calculates a score based on the distance.
 * @param distance The distance between two coordinates in meters.
 * @returns The calculated score.
 */
function scoreFromDistance(distance: number): number {
  const MIN = 5;
  const MAX = 500;
  const MAX_SCORE = 5_000;
  const EXPONENT = 2.5;

  const clamped = Math.min(Math.max(distance, MIN), MAX);
  const t = (clamped - MIN) / (MAX - MIN);
  const value = Math.pow(1 - t, EXPONENT);
  return Math.round(value * MAX_SCORE);
}

export { type Coordinates, distanceInMeters, scoreFromDistance };
