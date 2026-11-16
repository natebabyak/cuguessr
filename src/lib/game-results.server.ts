import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "#/db/index";
import { game, gameResult, round, roundResult } from "#/db/schema";

import { getTorontoDate } from "./game";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Call while holding the user's row lock, shared by guess submission and account linking.
export async function getCompletedGameResults(tx: Transaction, userId: string, gameIds: number[]) {
  if (gameIds.length === 0) return [];

  const completed = await tx
    .select({
      gameId: round.gameId,
      date: game.date,
      points: sql<number>`sum(${roundResult.points})::integer`,
      completedAt: sql`max(${roundResult.createdAt})`.mapWith(roundResult.createdAt),
    })
    .from(roundResult)
    .innerJoin(round, eq(roundResult.roundId, round.id))
    .innerJoin(game, eq(round.gameId, game.id))
    .where(and(eq(roundResult.userId, userId), inArray(round.gameId, gameIds)))
    .groupBy(round.gameId, game.date)
    .having(sql`count(*) = 5`);

  return completed.map(({ date, ...result }) => ({
    ...result,
    userId,
    onTime: getTorontoDate(result.completedAt) === date,
  }));
}

// Public board presentation and account eligibility are separate product decisions.
export async function getDailyLeaderboard(gameId: number) {
  return db
    .select({
      userId: gameResult.userId,
      points: gameResult.points,
      completedAt: gameResult.completedAt,
    })
    .from(gameResult)
    .where(and(eq(gameResult.gameId, gameId), eq(gameResult.onTime, true)))
    .orderBy(desc(gameResult.points));
}
