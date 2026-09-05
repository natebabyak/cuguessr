import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { MIN_DATE } from "@/lib/constants";
import { db } from "@/lib/db";
import { getUserStats } from "@/lib/stats";
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

  const roundResults = session
    ? await db.query.roundResult.findMany({
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
      })
    : [];

  const savedRoundResults = roundResults.map((result) => ({
    roundId: result.roundId,
    distance: result.distance,
    points: result.points,
    photo:
      result.round?.photo != null
        ? {
            latitude: result.round.photo.latitude,
            longitude: result.round.photo.longitude,
          }
        : undefined,
  }));

  if (savedRoundResults.length >= 5) {
    const isAnonymous = !session || Boolean(session.user.isAnonymous);
    const stats =
      !isAnonymous && session ? await getUserStats(session.user.id) : null;

    return (
      <Results
        date={date}
        roundResults={savedRoundResults}
        isAnonymous={isAnonymous}
        stats={stats}
      />
    );
  }

  return (
    <Game
      game={{
        ...game,
        rounds: game.rounds.filter(
          (
            round,
          ): round is typeof round & {
            photo: NonNullable<typeof round.photo>;
          } => round.photo !== null,
        ),
      }}
      savedRoundResults={savedRoundResults}
    />
  );
}
