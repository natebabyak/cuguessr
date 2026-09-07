import { PlayIcon, UserPlusIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { columns } from "@/components/leaderboard/columns";
import { DataTable } from "@/components/leaderboard/data-table";
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
import { getGameNumber } from "@/lib/game";

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

  const isAnonymous = !session || Boolean(session.user.isAnonymous);
  const currentUserId = session?.user.id ?? null;

  const leaderboard = await getDailyLeaderboard(
    date,
    currentUserId,
    isAnonymous,
  );

  if (!leaderboard) {
    notFound();
  }

  const {
    gameId,
    rankedResults,
    playerCount,
    averageScore,
    topEntry,
    yourBoardResult,
  } = leaderboard;

  const yourRoundResults = currentUserId
    ? await db.query.roundResult.findMany({
        columns: {
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

  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex flex-1 flex-col items-center gap-4 p-4 py-12">
        <h1 className="text-center font-semibold text-5xl">
          <span className="text-primary">cu</span>
          Guessr #{gameNumber}
        </h1>

        <p className="text-lg text-muted-foreground">{date}</p>

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
