import { createServerOnlyFn } from "@tanstack/react-start";
import { sql } from "drizzle-orm";
import { db } from "#/lib/db";
import { game as gamesTable, round as roundsTable } from "#/lib/db/schema";

export const createGameServer = createServerOnlyFn(async (date: string) => {
  await db
    .insert(gamesTable)
    .values({ date })
    .onConflictDoNothing({ target: gamesTable.date });

  const game = await db.query.game.findFirst({
    where: {
      date,
    },
    with: {
      rounds: true,
    },
  });

  if (!game) {
    throw new Error("Failed to create game");
  }

  if (game.rounds.length > 0) {
    return;
  }

  const photos = await db.query.photo.findMany({
    columns: {
      id: true,
    },
    where: {
      status: "approved",
    },
    orderBy: () => sql`RANDOM()`,
    limit: 5,
  });

  if (photos.length !== 5) {
    throw new Error("Not enough approved photos");
  }

  await db.insert(roundsTable).values(
    photos.map(({ id: photoId }, index) => ({
      gameId: game.id,
      photoId,
      index,
    })),
  );
});

export const getGameByDateServer = createServerOnlyFn(async (date: string) => {
  return await db.query.game.findFirst({
    where: {
      date,
    },
    with: {
      rounds: {
        orderBy: {
          index: "asc",
        },
        with: {
          photo: true,
        },
      },
    },
  });
});
