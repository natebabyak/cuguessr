import { db } from "#/db/index";

export async function getRoundResults(gameId: number, userId: string) {
  return db.query.roundResult.findMany({
    columns: {
      roundId: true,
      distance: true,
      points: true,
    },
    where: {
      AND: [
        {
          round: {
            gameId,
          },
        },
        {
          userId: userId,
        },
      ],
    },
    with: {
      round: {
        columns: {},
        with: {
          photo: {
            columns: {
              latitude: true,
              longitude: true,
            },
          },
        },
      },
    },
  });
}
