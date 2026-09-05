"use client";

import { ArrowLeftIcon, Share2Icon } from "lucide-react";
import { motion } from "motion/react";
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

interface ResultsProps {
  date: string;
  roundResults: {
    roundId: string;
    distance: number;
    points: number;
  }[];
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

export function Results({ date, roundResults }: ResultsProps) {
  const gameNumber = getGameNumber(date);
  const totalPoints = roundResults
    .reduce((acc, { points }) => acc + points, 0)
    .toLocaleString();
  const emojis = roundResults.map(({ points }) => getEmoji(points)).join(" ");

  async function handleShareResults() {
    const shareText = [
      `cuGuessr #${gameNumber} (${date})`,
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
    <div className="flex h-svh flex-col items-center justify-center gap-4">
      <motion.h1 className="text-center font-semibold text-5xl">
        <span className="text-red-500">cu</span>
        Guessr #{gameNumber}
      </motion.h1>
      <p className="size-lg text-muted-foreground">{date}</p>
      <p className="font-medium text-3xl">{totalPoints} points</p>
      <ul className="flex w-full max-w-xs flex-col gap-2">
        {roundResults.map((r, index) => (
          <li key={r.roundId}>
            <Item variant="outline">
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
        <Button onClick={handleShareResults} size="lg">
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
