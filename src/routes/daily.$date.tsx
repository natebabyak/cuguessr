import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { Game } from "#/components/game";
import { Spinner } from "#/components/ui/spinner";
import { getGameByDate } from "#/lib/game/functions";
import { gameResultQueryOptions } from "#/lib/game-result/queries";
import { roundResultsByGameIdQueryOptions } from "#/lib/round-result/queries";

const MIN_DATE = "2026-08-29";

const MAX_DATE = Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
}).format(Date.now());

const paramsSchema = z.object({
  date: z.iso
    .date()
    .refine(
      (value) => value >= MIN_DATE && value <= MAX_DATE,
      `Date must be between ${MIN_DATE} and ${MAX_DATE}`,
    ),
});

export const Route = createFileRoute("/daily/$date")({
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: (params) => ({ date: params.date }),
  },
  loader: async ({ params }) => {
    const game = await getGameByDate({
      data: {
        date: params.date,
      },
    });

    return { game };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { game } = Route.useLoaderData();

  const { data: roundResults } = useQuery(
    roundResultsByGameIdQueryOptions(game?.id as number),
  );
  const { data: gameResult } = useQuery(
    gameResultQueryOptions(game?.id as number),
  );

  if (!game || !roundResults) return <Spinner />;

  return (
    <Game
      game={game}
      roundResults={roundResults}
      gameResult={gameResult ?? null}
    />
  );
}
