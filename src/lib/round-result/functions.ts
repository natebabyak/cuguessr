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

    return await db.query.roundResult.findMany({
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

    const round = await db.query.round.findFirst({
      columns: {},
      where: {
        id: data.roundId,
      },
      with: {
        photo: {
          columns: {
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    if (!round || !round.photo) {
      throw new Error("Round not found");
    }

    const distance = calculateDistance({
      a: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
      b: {
        latitude: round.photo.latitude,
        longitude: round.photo.longitude,
      },
    });

    const points = calculatePoints(distance);

    await db.insert(roundResult).values({
      roundId: data.roundId,
      userId: session.user.id,
      latitude: data.latitude,
      longitude: data.longitude,
      distance,
      points,
    });
  });
