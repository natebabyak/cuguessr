import { db } from "#/db/index";
import { game } from "#/db/schema";

export async function getGame(date: string) {
  return await db.query.game.findFirst({
    where: {
      date,
    },
    with: {
      rounds: {
        columns: {
          id: true,
        },
        with: {
          photo: {
            columns: {
              id: true,
              objectKey: true,
              height: true,
              width: true,
            },
          },
        },
        orderBy: {
          index: "asc",
        },
      },
    },
  });
}

export async function createGame(date: string) {
  const [{ id: gameId }] = await db
    .insert(game)
    .values({
      date,
    })
    .returning();

  return gameId;
}
