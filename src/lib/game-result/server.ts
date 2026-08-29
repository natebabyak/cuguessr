import { createServerOnlyFn } from "@tanstack/react-start";
import { db } from "#/lib/db";

export const getGameResultByGameIdServer = createServerOnlyFn(
  async (gameId: number, userId: string) => {
    const gameResult = await db.query.gameResult.findFirst({
      where: {
        gameId,
        userId,
      },
    });

    return gameResult;
  },
);
