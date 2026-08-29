import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { ensureSession } from "#/lib/auth.functions";
import { db } from "#/lib/db";

export const getGameResultByGameId = createServerFn({ method: "GET" })
  .validator(
    z.object({
      gameId: z.int(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await ensureSession();

    const gameResult = await db.query.gameResult.findFirst({
      where: {
        gameId: data.gameId,
        userId: session.user.id,
      },
    });

    return gameResult ?? null;
  });
