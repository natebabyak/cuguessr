"use client";

import { Button } from "@/components/ui/button";
import { Share2, House } from "lucide-react";
import type { GameType, Round } from "@/lib/types";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import Link from "next/link";
import { toast } from "sonner";
import { getDailyNumber } from "@/lib/utils";

interface ResultsScreenProps {
  gameType: GameType;
  rounds: Round[];
}

function scoreToEmoji(score: number): string {
  if (score > 3750) return "🟩";
  if (score > 2500) return "🟨";
  if (score > 1250) return "🟧";
  return "🟥";
}

function scoreToEmojis(score: number): string {
  score = Math.max(0, Math.min(score, 5000));

  const greens = Math.floor(score / 1000);
  const remainder = score % 1000;
  const yellows = remainder >= 500 ? 1 : 0;

  return (
    "🟩".repeat(greens) +
    "🟨".repeat(yellows) +
    "⬛".repeat(5 - greens - yellows)
  );
}

export function ResultsScreen({ gameType, rounds }: ResultsScreenProps) {
  const title =
    gameType === "classic" ? "Classic" : `Daily #${getDailyNumber()}`;
  const totalScore = rounds.reduce((sum, round) => sum + (round.score ?? 0), 0);
  const scoreString = totalScore.toLocaleString();

  async function shareResults() {
    const emojis = rounds
      .map((round) => scoreToEmojis(round.score ?? 0))
      .join("\n");
    const shareText = `cuGuessr ${title}\n\n${scoreString} points\n\n${emojis}\n\nPlay at https://cuguessr.com`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `cuGuessr ${title}`,
          text: shareText,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Copied to clipboard!");
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <div className="flex h-dvh w-dvw items-center justify-center">
      <div className="animate-in fade-in-0 slide-in-from-bottom-5 flex w-full max-w-sm flex-col gap-4 duration-700">
        <h1 className="text-center text-4xl font-black">
          <span className="text-primary">cu</span>
          Guessr {title}
        </h1>
        <p className="text-center text-2xl font-medium">{scoreString} points</p>
        <div className="mx-auto flex w-full max-w-xs flex-col gap-2">
          {rounds.map((round, index) => (
            <Item key={index} variant="outline">
              <ItemMedia variant="icon">
                {scoreToEmoji(round.score || 0)}
              </ItemMedia>
              <ItemContent className="grid grid-cols-2 grid-rows-2">
                <ItemTitle className="col-span-2 justify-start justify-self-start">
                  Round {index + 1}
                </ItemTitle>
                <span className="text-muted-foreground self-end justify-self-start">
                  {round.distance?.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }) ?? "0"}{" "}
                  m
                </span>
                <span className="text-muted-foreground justify-end justify-self-end">
                  {round.score?.toLocaleString() ?? "0"} points
                </span>
              </ItemContent>
            </Item>
          ))}
        </div>
        <div className="grid w-full grid-cols-1 grid-rows-2 gap-2 px-2">
          <Button
            onClick={shareResults}
            size="lg"
            variant="default"
            className="rounded-full"
          >
            <Share2 />
            Share Results
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link href="/">
              <House />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
