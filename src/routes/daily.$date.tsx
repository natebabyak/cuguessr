import { createFileRoute, notFound } from "@tanstack/react-router";

import { AppMap } from "#/components/app-map";
import { Results } from "#/components/results";
import { ensureSession } from "#/lib/auth.functions";
import { getGameFn } from "#/lib/game.functions";
import { getRoundResultsFn } from "#/lib/round-results.functions";

export const Route = createFileRoute("/daily/$date")({
  loader: async ({ params }) => {
    const session = await ensureSession();

    const game = await getGameFn({
      data: {
        date: params.date,
      },
    });

    if (!game) throw notFound();

    const roundResults = await getRoundResultsFn({
      data: {
        gameId: game.id,
        userId: session.user.id,
      },
    });

    return { game, roundResults };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { date } = Route.useParams();
  const { roundResults } = Route.useLoaderData();

  if (roundResults.length >= 5) {
    return <Results date={date} roundResults={roundResults} />;
  }

  return <AppMap></AppMap>;
}
