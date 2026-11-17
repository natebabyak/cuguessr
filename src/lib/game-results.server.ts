import { and, desc, eq, inArray, lte, sql } from "drizzle-orm";

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

export async function getUserStreaks(userId: string, now = new Date()) {
  const today = getTorontoDate(now);
  const completedDates = db.$with("completed_dates").as(
    db
      .select({
        date: game.date,
        // Consecutive calendar dates share the same date minus row number.
        island: sql`${game.date} - row_number() over (order by ${game.date})::integer`.as("island"),
      })
      .from(gameResult)
      .innerJoin(game, eq(gameResult.gameId, game.id))
      .where(
        and(eq(gameResult.userId, userId), eq(gameResult.onTime, true), lte(game.date, today)),
      ),
  );
  const streaks = db.$with("streaks").as(
    db
      .select({
        length: sql<number>`count(*)::integer`.as("length"),
        endDate: sql<string>`max(${completedDates.date})`.as("end_date"),
      })
      .from(completedDates)
      .groupBy(completedDates.island),
  );
  const [result] = await db
    .with(completedDates, streaks)
    .select({
      currentStreak: sql<number>`coalesce(max(${streaks.length}) filter (
        where ${streaks.endDate} between ${today}::date - 1 and ${today}::date
      ), 0)`,
      bestStreak: sql<number>`coalesce(max(${streaks.length}), 0)`,
      lastCompletedDate: sql<string | null>`max(${streaks.endDate})::text`,
    })
    .from(streaks);

  return result;
}
