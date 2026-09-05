"use client";

import {
  ArrowLeftIcon,
  PodiumIcon,
  Share2Icon,
  UserPlusIcon,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Item, ItemContent } from "@/components/ui/item";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";
import { MIN_DATE } from "@/lib/constants";
import type { UserStats } from "@/lib/stats";

interface ResultsProps {
  date: string;
  roundResults: {
    roundId: number;
    distance: number;
    points: number;
  }[];
  isAnonymous: boolean;
  stats: UserStats | null;
}

function getGameNumber(date: string): number {
  const [startYear, startMonth, startDay] = MIN_DATE.split("-").map(Number);
  const [targetYear, targetMonth, targetDay] = date.split("-").map(Number);

  const startUtc = Date.UTC(startYear, startMonth - 1, startDay);
  const targetUtc = Date.UTC(targetYear, targetMonth - 1, targetDay);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const diffInDays = Math.floor((targetUtc - startUtc) / MS_PER_DAY);

  return diffInDays + 1;
}

function getEmoji(points: number) {
  if (points >= 3750) return "🟩";
  if (points >= 2500) return "🟧";
  if (points >= 1250) return "🟨";
  return "🟥";
}

export function Results({
  date,
  roundResults,
  isAnonymous,
  stats,
}: ResultsProps) {
  const gameNumber = getGameNumber(date);
  const totalPoints = roundResults
    .reduce((acc, { points }) => acc + points, 0)
    .toLocaleString();
  const emojis = roundResults.map(({ points }) => getEmoji(points)).join(" ");

  async function handleShareResults() {
    const shareText = [
      `cuGuessr #${gameNumber}`,
      date,
      "",
      `${totalPoints} points`,
      emojis,
      "",
      "https://www.cuguessr.com/daily",
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: `cuGuessr #${gameNumber} (${date})`,
          text: shareText,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.add({ title: "Copied to clipboard!" });
      } catch {
        toast.add({ title: "Something went wrong. Please try again." });
      }
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-center font-semibold text-5xl">
        <span className="text-red-500">cu</span>
        Guessr #{gameNumber}
      </h1>
      <p className="text-lg text-muted-foreground">{date}</p>
      <p className="font-medium text-3xl">{totalPoints} points</p>
      {!isAnonymous && stats ? (
        <p className="text-muted-foreground text-sm">
          {stats.currentStreak}-day streak · {stats.gamesPlayed}{" "}
          {stats.gamesPlayed === 1 ? "game" : "games"} played
        </p>
      ) : null}
      <ul className="flex w-full max-w-xs flex-col gap-2">
        {roundResults.map((r, index) => (
          <li key={r.roundId}>
            <Item variant="outline" size="xs">
              <ItemContent>
                <Progress max={5000} value={r.points}>
                  <ProgressLabel>Round {index + 1}</ProgressLabel>
                  <ProgressValue
                    render={
                      <p>
                        {r.distance.toLocaleString("en-CA", {
                          style: "unit",
                          unit: "meter",
                          maximumFractionDigits: 0,
                        })}{" "}
                        &bull; {r.points.toLocaleString("en-CA")} pts.
                      </p>
                    }
                  />
                </Progress>
              </ItemContent>
            </Item>
          </li>
        ))}
      </ul>
      <div className="grid w-full max-w-sm gap-4">
        {isAnonymous ? (
          <Link
            href="/sign-in"
            className={buttonVariants({
              size: "lg",
            })}
          >
            <UserPlusIcon />
            Create an account
          </Link>
        ) : (
          <Link href="/leaderboard" className={buttonVariants({ size: "lg" })}>
            <PodiumIcon />
            View Leaderboard
          </Link>
        )}
        <Button
          onClick={handleShareResults}
          size="lg"
          variant={isAnonymous ? "outline" : "default"}
        >
          <Share2Icon />
          Share Results
        </Button>
        <Link
          href="/"
          className={buttonVariants({
            size: "lg",
            variant: "outline",
          })}
        >
          <ArrowLeftIcon />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
