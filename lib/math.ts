const EARTH_RADIUS_IN_METERS = 6371000;
const SIGMA = 100;

/**
 * Converts an angle from degrees to radians.
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Haversine formula to calculate the distance between two points on the Earth
 * @param theta Angle in radians
 * @returns Haversine of the angle
 */
function haversine(theta: number): number {
  return Math.pow(Math.sin(theta / 2), 2);
}

/**
 * Calculates the distance between two points on the Earth using the Haversine formula.
 * @param pointA The first point (latitude and longitude)
 * @param pointB The second point (latitude and longitude)
 * @returns The distance between the two points in meters
 */
function earthDistance(
  pointA: {
    latitude: number;
    longitude: number;
  },
  pointB: {
    latitude: number;
    longitude: number;
  }
): number {
  return (
    2 *
    EARTH_RADIUS_IN_METERS *
    Math.asin(
      Math.sqrt(
        haversine(toRadians(pointB.latitude - pointA.latitude)) +
          Math.cos(toRadians(pointA.latitude)) *
            Math.cos(toRadians(pointB.latitude)) *
            haversine(toRadians(pointB.longitude - pointA.longitude))
      )
    )
  );
}

/**
 * Calculates the score based on the distance between the answer and the guess.
 * @param answer The correct answer (latitude and longitude)
 * @param guess The user's guess (latitude and longitude)
 * @returns The score for the user's guess
 */
function score(
  answer: {
    latitude: number;
    longitude: number;
  },
  guess: {
    latitude: number;
    longitude: number;
  }
): number {
  const distance = earthDistance(answer, guess);
  return 5000 * Math.exp(-0.5 * Math.pow(distance / SIGMA, 2));
}

export { earthDistance, score };
