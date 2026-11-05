import { createFileRoute, notFound } from "@tanstack/react-router";

import { DailyGame } from "#/components/daily-game";
import { getSession } from "#/lib/auth.functions";
import { isAvailableGameDate } from "#/lib/game";
import { getGameFn } from "#/lib/game.functions";
import { getRoundResultsFn } from "#/lib/round-results.functions";

export const Route = createFileRoute("/daily/$date")({
  loader: async ({ params }) => {
    if (!isAvailableGameDate(params.date)) throw notFound();

    const game = await getGameFn({ data: { date: params.date } });
    if (!game) throw notFound();
    const rounds = game.rounds.flatMap((round) =>
      round.photo ? [{ ...round, photo: round.photo }] : [],
    );
    if (rounds.length === 0 || rounds.length !== game.rounds.length) throw notFound();

    const session = await getSession();
    const roundResults = session ? await getRoundResultsFn({ data: { gameId: game.id } }) : [];

    return { game: { ...game, rounds }, roundResults, userId: session?.user.id };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { game, roundResults, userId } = Route.useLoaderData();

  return (
    <DailyGame
      key={`${game.id}:${userId ?? "guest"}`}
      game={game}
      savedRoundResults={roundResults}
    />
  );
}
