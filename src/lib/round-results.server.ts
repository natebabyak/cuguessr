import { db } from "#/db/index";
import { roundResult } from "#/db/schema";

import { isAvailableGameDate } from "./game";
import type { Guess } from "./guess-schema";
import { calculateDistance, calculatePoints } from "./scoring";

export async function getRoundResults(gameId: number, userId: string) {
  const results = await db.query.roundResult.findMany({
    columns: {
      roundId: true,
      distance: true,
      points: true,
      latitude: true,
      longitude: true,
    },
    where: {
      AND: [
        {
          round: {
            gameId,
          },
        },
        {
          userId: userId,
        },
      ],
    },
    with: {
      round: {
        columns: { index: true },
        with: {
          photo: {
            columns: {
              latitude: true,
              longitude: true,
            },
          },
        },
      },
    },
  });

  return results
    .flatMap(({ round, ...result }) =>
      round?.photo ? [{ ...result, photo: round.photo, index: round.index }] : [],
    )
    .sort((a, b) => a.index - b.index)
    .map(({ index: _index, ...result }) => result);
}

export async function submitGuess(guess: Guess, userId: string) {
  const round = await db.query.round.findFirst({
    where: { id: guess.roundId },
    with: { photo: true, game: true },
  });

  if (!round?.photo || !round.game || !isAvailableGameDate(round.game.date)) {
    throw new Error("Round not found");
  }

  const distance = calculateDistance({ a: round.photo, b: guess });
  const points = calculatePoints(distance);

  // A retry must return the original score, rather than changing it or adding a duplicate.
  const [inserted] = await db
    .insert(roundResult)
    .values({ ...guess, userId, distance, points })
    .onConflictDoNothing({ target: [roundResult.roundId, roundResult.userId] })
    .returning();
  const result =
    inserted ??
    (await db.query.roundResult.findFirst({
      where: { roundId: guess.roundId, userId },
    }));

  if (!result) throw new Error("Could not save guess");

  return {
    roundId: result.roundId,
    distance: result.distance,
    points: result.points,
    latitude: result.latitude,
    longitude: result.longitude,
    photo: { latitude: round.photo.latitude, longitude: round.photo.longitude },
  };
}
