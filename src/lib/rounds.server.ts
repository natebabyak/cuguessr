import { db } from "#/db/index";
import { round } from "#/db/schema";

export async function createRounds(gameId: number, photoIds: number[]) {
  const values = photoIds.map((photoId, index) => ({
    gameId,
    photoId,
    index,
  }));

  await db.insert(round).values(values);
}
