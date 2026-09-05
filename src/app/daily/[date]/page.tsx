import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { MIN_DATE } from "@/lib/constants";
import { db } from "@/lib/db";
import { Game } from "./game";
import { Results } from "./results";

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
    await auth.api.signInAnonymous();
  }

  const game = await db.query.game.findFirst({
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

  if (!game) {
    notFound();
  }

  const roundResults = await db.query.roundResult.findMany({
    columns: {
      roundId: true,
      distance: true,
      points: true,
    },
    where: {
      AND: [
        {
          round: {
            gameId: game.id,
          },
        },
        {
          userId: session.user.id,
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

  if (roundResults.length >= 5) {
    return <Results date={date} roundResults={roundResults} />;
  }

  return <Game game={game} savedRoundResults={roundResults} />;
}
