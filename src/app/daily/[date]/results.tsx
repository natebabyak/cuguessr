"use client";

import { ArrowLeftIcon, Share2Icon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import CountUp from "@/components/CountUp";
import { Button, buttonVariants } from "@/components/ui/button";
import { Item, ItemContent } from "@/components/ui/item";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";
import { getGameNumber } from "@/lib/game";

function getEmoji(points: number) {
  if (points >= 3750) return "🟩";
  if (points >= 2500) return "🟧";
  if (points >= 1250) return "🟨";
  return "🟥";
}

export function Results({
  date,
  roundResults,
}: {
  date: string;
  roundResults: {
    roundId: number;
    distance: number;
    points: number;
  }[];
}) {
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
        <span className="text-primary">cu</span>
        Guessr #{gameNumber}
      </h1>
      <p className="text-lg text-muted-foreground">{date}</p>
      <p className="font-medium text-3xl">{totalPoints} points</p>
      <ul className="flex w-full max-w-xs flex-col gap-2">
        {roundResults.map((r, index) => (
          <motion.li
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 1) * 0.1 }}
            key={r.roundId}
          >
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
          </motion.li>
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
            variant: "ghost",
          })}
        >
          <ArrowLeftIcon />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
