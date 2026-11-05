import { and, eq, notInArray } from "drizzle-orm";

import { db } from "#/db/index";
import { photo, report, roundResult } from "#/db/schema";

export async function linkAnonymousAccount(anonymousUserId: string, newUserId: string) {
  if (anonymousUserId === newUserId) return;

  const existingResults = await db
    .select({ roundId: roundResult.roundId })
    .from(roundResult)
    .where(eq(roundResult.userId, newUserId));
  const existingRoundIds = existingResults.map((result) => result.roundId);

  // Keep the account's existing scores when both users played the same round.
  // neon-http does not support interactive db.transaction callbacks.
  await db
    .update(roundResult)
    .set({ userId: newUserId })
    .where(
      existingRoundIds.length > 0
        ? and(
            eq(roundResult.userId, anonymousUserId),
            notInArray(roundResult.roundId, existingRoundIds),
          )
        : eq(roundResult.userId, anonymousUserId),
    );

  await db.update(report).set({ userId: newUserId }).where(eq(report.userId, anonymousUserId));
  await db.update(photo).set({ userId: newUserId }).where(eq(photo.userId, anonymousUserId));
}
