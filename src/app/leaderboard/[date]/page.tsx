import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  UserPlusIcon,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { auth } from "@/lib/auth";
import { MIN_DATE } from "@/lib/constants";
import { db } from "@/lib/db";
import { addDays, getGameNumber } from "@/lib/game";
import { columns } from "./columns";
import { DataTable } from "./data-table";

type RankedEntry = {
  userId: string;
  rank: number;
  player: string;
  score: number;
  submittedAt: Date;
  isCurrentUser: boolean;
};

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

  const game = await db.query.game.findFirst({
    columns: {
      id: true,
    },
    where: {
      date,
    },
  });

  if (!game) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAnonymous = !session || Boolean(session.user.isAnonymous);
  const currentUserId = session?.user.id ?? null;

  const roundResults = await db.query.roundResult.findMany({
    columns: {
      userId: true,
      points: true,
      createdAt: true,
    },
    where: {
      round: {
        gameId: game.id,
      },
      submittedBy: {
        isAnonymous: false,
      },
    },
    with: {
      submittedBy: {
        columns: {
          id: true,
          name: true,
          isAnonymous: true,
        },
      },
    },
  });

  const byUser = new Map<
    string,
    {
      name: string;
      points: number[];
      submittedAt: Date;
    }
  >();

  for (const result of roundResults) {
    if (!result.submittedBy || result.submittedBy.isAnonymous) {
      continue;
    }

    const existing = byUser.get(result.userId);
    if (existing) {
      existing.points.push(result.points);
      if (result.createdAt > existing.submittedAt) {
        existing.submittedAt = result.createdAt;
      }
    } else {
      byUser.set(result.userId, {
        name: result.submittedBy.name,
        points: [result.points],
        submittedAt: result.createdAt,
      });
    }
  }

  const completedGames = [...byUser.entries()]
    .filter(([, entry]) => entry.points.length >= 5)
    .map(([userId, entry]) => ({
      userId,
      player: entry.name,
      score: entry.points.reduce((total, value) => total + value, 0),
      submittedAt: entry.submittedAt,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.submittedAt.getTime() - b.submittedAt.getTime();
    });

  const rankedResults: RankedEntry[] = completedGames.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    isCurrentUser: !isAnonymous && currentUserId === entry.userId,
  }));

  const playerCount = rankedResults.length;
  const averageScore =
    playerCount > 0
      ? Math.round(
          rankedResults.reduce((total, entry) => total + entry.score, 0) /
            playerCount,
        )
      : 0;
  const topEntry = playerCount > 0 ? rankedResults[0] : null;
  const yourBoardResult =
    !isAnonymous && currentUserId
      ? rankedResults.find((entry) => entry.userId === currentUserId)
      : undefined;

  const yourRoundResults = currentUserId
    ? await db.query.roundResult.findMany({
        columns: {
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
              userId: currentUserId,
            },
          ],
        },
      })
    : [];

  const yourRoundCount = yourRoundResults.length;
  const yourPoints = yourRoundResults.reduce(
    (total, result) => total + result.points,
    0,
  );
  const yourFinished = yourRoundCount >= 5;

  const gameNumber = getGameNumber(date);
  const previousDate = addDays(date, -1);
  const nextDate = addDays(date, 1);
  const canGoPrevious = previousDate >= MIN_DATE;
  const canGoNext = nextDate <= maxDate;

  return (
    <div className="flex flex-col">
      <AppHeader />
      <main className="flex min-h-svh flex-col items-center gap-4 p-4">
        <h1 className="text-center font-semibold text-5xl">
          <span className="text-primary">cu</span>
          Guessr #{gameNumber}
        </h1>

        <div className="flex items-center gap-2">
          {canGoPrevious ? (
            <Link
              href={`/leaderboard/${previousDate}`}
              className={buttonVariants({ size: "icon-sm", variant: "ghost" })}
              aria-label="Previous day"
            >
              <ChevronLeftIcon />
            </Link>
          ) : (
            <span className="inline-flex size-8 items-center justify-center opacity-40">
              <ChevronLeftIcon className="size-4" />
            </span>
          )}
          <p className="text-lg text-muted-foreground">{date}</p>
          {canGoNext ? (
            <Link
              href={`/leaderboard/${nextDate}`}
              className={buttonVariants({ size: "icon-sm", variant: "ghost" })}
              aria-label="Next day"
            >
              <ChevronRightIcon />
            </Link>
          ) : (
            <span className="inline-flex size-8 items-center justify-center opacity-40">
              <ChevronRightIcon className="size-4" />
            </span>
          )}
        </div>

        <section className="flex w-full max-w-xs flex-col gap-2">
          <h2 className="font-medium text-lg">Summary</h2>
          <Item variant="outline" size="xs">
            <ItemContent>
              <ItemTitle>Players</ItemTitle>
              <ItemDescription>
                {playerCount.toLocaleString("en-CA")}
              </ItemDescription>
            </ItemContent>
          </Item>
          <Item variant="outline" size="xs">
            <ItemContent>
              <ItemTitle>Average score</ItemTitle>
              <ItemDescription>
                {averageScore.toLocaleString("en-CA")} pts.
              </ItemDescription>
            </ItemContent>
          </Item>
          <Item variant="outline" size="xs">
            <ItemContent>
              <ItemTitle>Highest score</ItemTitle>
              <ItemDescription>
                {topEntry
                  ? `${topEntry.score.toLocaleString("en-CA")} pts. · ${topEntry.player}`
                  : "—"}
              </ItemDescription>
            </ItemContent>
          </Item>
        </section>

        <section className="flex w-full max-w-xs flex-col items-center gap-2 text-center">
          <h2 className="font-medium text-lg">Your Results</h2>
          {!isAnonymous && yourBoardResult ? (
            <Item
              variant="outline"
              size="xs"
              className="w-full bg-muted/50 text-left"
            >
              <ItemContent>
                <ItemTitle>
                  Rank #{yourBoardResult.rank}
                  <span className="text-muted-foreground">· You</span>
                </ItemTitle>
                <ItemDescription>
                  {yourBoardResult.score.toLocaleString("en-CA")} pts.
                </ItemDescription>
              </ItemContent>
            </Item>
          ) : !isAnonymous && !yourFinished ? (
            <Link
              href={`/daily/${date}`}
              className={buttonVariants({
                size: "lg",
                className: "w-full",
              })}
            >
              <PlayIcon />
              Play this game
            </Link>
          ) : isAnonymous && yourFinished ? (
            <>
              <Item variant="outline" size="xs" className="w-full text-left">
                <ItemContent>
                  <ItemTitle>
                    {yourPoints.toLocaleString("en-CA")} pts.
                  </ItemTitle>
                  <ItemDescription>
                    Private score · create an account to appear on the
                    leaderboard
                  </ItemDescription>
                </ItemContent>
              </Item>
              <Link
                href="/sign-in"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className: "w-full",
                })}
              >
                <UserPlusIcon />
                Create an account
              </Link>
            </>
          ) : isAnonymous && yourRoundCount > 0 ? (
            <>
              <Item variant="outline" size="xs" className="w-full text-left">
                <ItemContent>
                  <ItemTitle>
                    {yourRoundCount}/5 rounds ·{" "}
                    {yourPoints.toLocaleString("en-CA")} pts.
                  </ItemTitle>
                  <ItemDescription>In progress</ItemDescription>
                </ItemContent>
              </Item>
              <Link
                href={`/daily/${date}`}
                className={buttonVariants({
                  size: "lg",
                  className: "w-full",
                })}
              >
                <PlayIcon />
                Continue playing
              </Link>
            </>
          ) : (
            <Link
              href={`/daily/${date}`}
              className={buttonVariants({
                size: "lg",
                className: "w-full",
              })}
            >
              <PlayIcon />
              Play this game
            </Link>
          )}
        </section>

        <div className="w-full max-w-md rounded-md border">
          <DataTable columns={columns} data={rankedResults} />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
