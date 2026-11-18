import { createServerFn } from "@tanstack/react-start";
import { eq, inArray } from "drizzle-orm";
import z from "zod";

import { user } from "#/db/auth-schema";
import { db } from "#/db/index";
import { game } from "#/db/schema";

import { getSession } from "./auth.functions";
import { getDailyLeaderboard, getUserStreaks } from "./game-results.server";

export const getUserStreaksFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session) return null;

  return getUserStreaks(session.user.id);
});

export const getDailyLeaderboardFn = createServerFn({ method: "GET" })
  .validator(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
  )
  .handler(async ({ data }) => {
    const [gameRow] = await db
      .select({ id: game.id, date: game.date })
      .from(game)
      .where(eq(game.date, data.date))
      .limit(1);

    if (!gameRow) {
      return { date: data.date, gameId: null as number | null, entries: [] };
    }

    const rows = await getDailyLeaderboard(gameRow.id);
    if (rows.length === 0) {
      return { date: gameRow.date, gameId: gameRow.id, entries: [] };
    }

    const names = await db
      .select({ id: user.id, name: user.name })
      .from(user)
      .where(
        inArray(
          user.id,
          rows.map((row) => row.userId),
        ),
      );
    const nameById = new Map(names.map((row) => [row.id, row.name]));

    return {
      date: gameRow.date,
      gameId: gameRow.id,
      entries: rows.map((row, index) => ({
        rank: index + 1,
        userId: row.userId,
        name: nameById.get(row.userId) ?? "Player",
        points: row.points,
        completedAt: row.completedAt,
      })),
    };
  });
