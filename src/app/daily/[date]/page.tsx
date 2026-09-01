import { headers } from "next/headers";
import { notFound, unauthorized } from "next/navigation";
import { auth } from "@/lib/auth";
import { MIN_DATE } from "@/lib/constants";
import { db } from "@/lib/db";
import { Game } from "./game";
import { GameResult } from "./game-result";

async function getGameResult(date: string, userId: string) {
  const gameResult = await db.query.gameResult.findFirst({
    where: {
      AND: [
        {
          game: {
            date,
          },
        },
        {
          userId,
        },
      ],
    },
    with: {
      game: {
        with: {
          rounds: {
            with: {
              results: {
                where: {
                  userId,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!gameResult?.game) {
    throw new Error("Game result not found");
  }

  return gameResult;
}

export type GameResultType = NonNullable<
  Awaited<ReturnType<typeof getGameResult>>
>;

async function getGame(date: string) {
  return await db.query.game.findFirst({
    where: {
      date,
    },
    with: {
      rounds: {
        with: {
          photo: true,
        },
        orderBy: {
          index: "asc",
        },
      },
    },
  });
}

export type GameType = NonNullable<Awaited<ReturnType<typeof getGame>>>;

export default async function Page({
  params,
}: {
  params: Promise<{
    date: string;
  }>;
}) {
  const { date } = await params;

  const maxDate = Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
  }).format(Date.now());

  if (date < MIN_DATE || date > maxDate) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  const gameResult = await getGameResult(date, session.user.id);

  if (gameResult) {
    return <GameResult gameResult={gameResult} />;
  }

  const game = await getGame(date);

  if (!game) {
    notFound();
  }

  return <Game game={game} />;
}
