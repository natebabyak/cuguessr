import { describe, expect, test } from "bun:test";

import { getGameNumber, isAvailableGameDate } from "../src/lib/game";
import { guessSchema } from "../src/lib/guess-schema";
import { reportSchema } from "../src/lib/report-schema";
import { calculateDistance, calculatePoints } from "../src/lib/scoring";

describe("daily game rules from main", () => {
  test("scores perfect, nearby, and out-of-range guesses", () => {
    expect(calculatePoints(0)).toBe(5000);
    expect(calculatePoints(5)).toBe(5000);
    expect(calculatePoints(252.5)).toBe(884);
    expect(calculatePoints(500)).toBe(0);
    expect(calculatePoints(1000)).toBe(0);
  });

  test("measures distance in meters, including identical and antipodal points", () => {
    const origin = { latitude: 0, longitude: 0 };
    expect(calculateDistance({ a: origin, b: origin })).toBe(0);
    expect(calculateDistance({ a: origin, b: { latitude: 0, longitude: 1 } })).toBeCloseTo(
      111194.93,
      2,
    );
    expect(calculateDistance({ a: origin, b: { latitude: 0, longitude: 180 } })).toBeCloseTo(
      20015086.8,
      1,
    );
  });

  test("numbers games consistently across daylight saving changes", () => {
    expect(getGameNumber("2026-09-09")).toBe(1);
    expect(getGameNumber("2026-11-02") - getGameNumber("2026-11-01")).toBe(1);
  });

  test("uses Toronto's day and rejects future, pre-launch, and invalid dates", () => {
    const now = new Date("2026-11-05T02:00:00Z");
    expect(isAvailableGameDate("2026-11-04", now)).toBe(true);
    expect(isAvailableGameDate("2026-11-05", now)).toBe(false);
    expect(isAvailableGameDate("2026-09-08", now)).toBe(false);
    expect(isAvailableGameDate("2026-02-30", now)).toBe(false);
    expect(isAvailableGameDate("not-a-date", now)).toBe(false);
  });

  test("validates guesses and report descriptions on the server boundary", () => {
    expect(guessSchema.safeParse({ roundId: 1, latitude: 45, longitude: -75 }).success).toBe(true);
    for (const invalid of [
      { roundId: 0, latitude: 45, longitude: -75 },
      { roundId: 1, latitude: 91, longitude: -75 },
      { roundId: 1, latitude: 45, longitude: -181 },
      { roundId: 1, latitude: NaN, longitude: -75 },
    ])
      expect(guessSchema.safeParse(invalid).success).toBe(false);
    expect(reportSchema.safeParse({ photoId: 1, description: "     " }).success).toBe(false);
    expect(reportSchema.safeParse({ photoId: 1, description: "x".repeat(256) }).success).toBe(
      false,
    );
    expect(reportSchema.parse({ photoId: 1, description: "  Wrong location  " }).description).toBe(
      "Wrong location",
    );
  });
});
