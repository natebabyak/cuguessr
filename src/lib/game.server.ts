import { createServerOnlyFn } from "@tanstack/react-start";
import { sql } from "drizzle-orm";
import { db } from "#/lib/db";
import { game as gamesTable, round as roundsTable } from "#/lib/db/schema";

export const getOrCreateGameServer = createServerOnlyFn(
  async (date: string) => {
    await db.transaction(async (tx) => {
      const [game] = await tx
        .insert(gamesTable)
        .values({ date })
        .onConflictDoNothing({ target: gamesTable.date })
        .returning();

      if (game) {
        const photos = await tx.query.photo.findMany({
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

        await tx.insert(roundsTable).values(
          photos.map(({ id: photoId }, photoIndex) => ({
            gameId: game.id,
            photoId,
            number: photoIndex + 1,
          })),
        );
      }
    });

    const game = await db.query.game.findFirst({
      where: {
        date,
      },
      with: {
        rounds: {
          with: {
            photo: {
              columns: {
                latitude: false,
                longitude: false,
              },
            },
          },
        },
      },
    });

    return game;
  },
);
