import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { ensureSession } from "#/lib/auth.functions";
import { db } from "#/lib/db";
import { roundResult } from "#/lib/db/schema";
import { calculateDistance, calculatePoints } from "#/lib/scoring";

export const getRoundResultsByGameId = createServerFn({ method: "GET" })
  .validator(
    z.object({
      gameId: z.int(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await ensureSession();

    const results = await db.query.roundResult.findMany({
      where: {
        AND: [
          {
            round: {
              gameId: data.gameId,
            },
          },
          {
            userId: session.user.id,
          },
        ],
      },
      with: {
        round: {
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

    return results.sort(
      (a, b) => (a.round?.index ?? 0) - (b.round?.index ?? 0),
    );
  });

export const getRoundResultsByRoundId = createServerFn({ method: "GET" })
  .validator(
    z.object({
      roundId: z.int(),
    }),
  )
  .handler(async ({ data }) => {
    await ensureSession();

    return await db.query.roundResult.findMany({
      columns: {
        points: true,
      },
      where: {
        roundId: data.roundId,
      },
    });
  });

export const submitGuess = createServerFn({ method: "POST" })
  .validator(
    z.object({
      roundId: z.int(),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  )
  .handler(async ({ data }) => {
    const session = await ensureSession();
    const userId = session.user.id;

    const existing = await db.query.roundResult.findFirst({
      where: { roundId: data.roundId, userId },
    });
    if (existing) return existing;

    const round = await db.query.round.findFirst({
      columns: {},
      where: { id: data.roundId },
      with: { photo: { columns: { latitude: true, longitude: true } } },
    });
    if (!round || !round.photo) {
      throw new Error("Round not found");
    }

    const distance = calculateDistance({
      a: { latitude: data.latitude, longitude: data.longitude },
      b: { latitude: round.photo.latitude, longitude: round.photo.longitude },
    });
    const points = calculatePoints(distance);

    const [newRoundResult] = await db
      .insert(roundResult)
      .values({
        roundId: data.roundId,
        userId,
        latitude: data.latitude,
        longitude: data.longitude,
        distance,
        points,
      })
      .onConflictDoNothing({
        target: [roundResult.roundId, roundResult.userId],
      })
      .returning();

    const finalResult =
      newRoundResult ??
      (await db.query.roundResult.findFirst({
        where: { roundId: data.roundId, userId },
      }));

    if (!finalResult) {
      throw new Error("Failed to record guess");
    }

    return finalResult;
  });
