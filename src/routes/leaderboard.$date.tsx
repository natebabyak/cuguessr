import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { TrophyIcon } from "lucide-react";

import { Footer } from "#/components/footer";
import { Header } from "#/components/header";
import { buttonVariants } from "#/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "#/components/ui/item";
import { getGameNumber, isAvailableGameDate } from "#/lib/game";
import { getDailyLeaderboardFn } from "#/lib/game-results.functions";

export const Route = createFileRoute("/leaderboard/$date")({
  loader: async ({ params }) => {
    if (!isAvailableGameDate(params.date)) throw notFound();

    const board = await getDailyLeaderboardFn({ data: { date: params.date } });
    return { board };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { board } = Route.useLoaderData();
  const gameNumber = getGameNumber(board.date);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <TrophyIcon aria-hidden="true" className="text-primary size-10" />
          <h1 className="text-3xl font-semibold tracking-tight">
            <span className="text-primary">cu</span>
            Guessr #{gameNumber}
          </h1>
          <p className="text-muted-foreground">Daily leaderboard · {board.date}</p>
          <p className="text-muted-foreground text-sm text-balance">
            On-time finishes only. Scores come from completed daily totals, not live round sums.
          </p>
        </div>

        {board.entries.length === 0 ? (
          <p className="text-muted-foreground text-center">
            {board.gameId === null
              ? "No daily game exists for this date yet."
              : "No on-time finishes yet. Be the first on the board."}
          </p>
        ) : (
          <ItemGroup>
            {board.entries.map((entry) => (
              <Item key={entry.userId} variant="outline" size="sm">
                <ItemMedia className="text-muted-foreground w-8 tabular-nums">
                  {entry.rank}
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{entry.name}</ItemTitle>
                  <ItemDescription className="sr-only">Rank {entry.rank}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <p className="font-medium tabular-nums">{entry.points.toLocaleString()} pts</p>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        )}

        <div className="flex flex-col items-center gap-2">
          <Link to="/daily/$date" params={{ date: board.date }} className={buttonVariants()}>
            Play this daily
          </Link>
          <Link to="/" className={buttonVariants({ variant: "ghost" })}>
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
