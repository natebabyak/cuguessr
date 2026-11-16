import { eq } from "drizzle-orm";

import { user } from "#/db/auth-schema";
import { db } from "#/db/index";
import { gameResult, roundResult } from "#/db/schema";

import { isAvailableGameDate } from "./game";
import { getCompletedGameResults } from "./game-results.server";
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
  return db.transaction(async (tx) => {
    // Serialize this player's guesses and account merges so concurrent final rounds
    // cannot each miss the other's uncommitted result and leave the game unfinished.
    await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for("update");

    const round = await tx.query.round.findFirst({
      where: { id: guess.roundId },
      with: { photo: true, game: true },
    });
    const createdAt = new Date();

    if (!round?.photo || !round.game || !isAvailableGameDate(round.game.date, createdAt)) {
      throw new Error("Round not found");
    }

    const distance = calculateDistance({ a: round.photo, b: guess });
    const points = calculatePoints(distance);

    // A retry must return the original score, rather than changing it or adding a duplicate.
    const [inserted] = await tx
      .insert(roundResult)
      .values({ ...guess, userId, distance, points, createdAt })
      .onConflictDoNothing({ target: [roundResult.roundId, roundResult.userId] })
      .returning();
    const result =
      inserted ??
      (await tx.query.roundResult.findFirst({
        where: { roundId: guess.roundId, userId },
      }));

    if (!result) throw new Error("Could not save guess");

    const completed = await getCompletedGameResults(tx, userId, [round.game.id]);
    if (completed.length > 0) {
      await tx
        .insert(gameResult)
        .values(completed)
        .onConflictDoNothing({ target: [gameResult.gameId, gameResult.userId] });
    }

    return {
      roundId: result.roundId,
      distance: result.distance,
      points: result.points,
      latitude: result.latitude,
      longitude: result.longitude,
      photo: { latitude: round.photo.latitude, longitude: round.photo.longitude },
    };
  });
}
