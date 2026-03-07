"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Share2, House } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import Link from "next/link";
import { toast } from "sonner";
import type { Round } from "@/lib/types";

interface ResultsScreenProps {
  rounds: Round[];
}

function getScoreEmoji(score: number): string {
  if (score >= 3750) return "🟩";
  if (score >= 2500) return "🟨";
  if (score >= 1250) return "🟧";
  return "🟥";
}

function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
}

export function ResultsScreen({ rounds }: ResultsScreenProps) {
  const totalScore = rounds.reduce((sum, round) => sum + (round.score ?? 0), 0);

  const handleShare = async () => {
    const emojiGrid = rounds
      .map((round) => getScoreEmoji(round.score ?? 0))
      .join("");

    const shareText = `cuGuessr (Beta)\n\nScore: ${totalScore.toLocaleString()}\n\n${emojiGrid}\n\nPlay at ${window.location.origin}`;

    if (navigator.share) {
      await navigator.share({
        title: "cuGuessr Results",
        text: shareText,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Results copied to clipboard!");
    }
  };

  return (
    <div className="h-screen w-screen bg-[url(/cu.jpg)] bg-cover bg-center">
      <div className="flex size-full flex-row items-center bg-black/10 backdrop-blur-sm dark:bg-black/30">
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl">Game Results</CardTitle>
            <CardDescription className="text-2xl font-medium">
              Final Score: {totalScore.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {rounds.map((round, index) => (
                <Item key={index} variant="outline">
                  <ItemMedia variant="icon">
                    {getScoreEmoji(round.score ?? 0)}
                  </ItemMedia>
                  <ItemContent className="flex flex-row justify-between">
                    <div className="flex flex-col">
                      <ItemTitle>Round {index + 1}</ItemTitle>
                      <ItemDescription>
                        {formatDistance(round.distance ?? 0)} away
                      </ItemDescription>
                    </div>
                    <div className="flex flex-col items-end font-medium">
                      <span>{round.score?.toLocaleString()}</span>
                      <span>points</span>
                    </div>
                  </ItemContent>
                </Item>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <ButtonGroup orientation="vertical" className="w-full">
              <ButtonGroup className="w-full">
                <Button
                  onClick={handleShare}
                  size="lg"
                  variant="default"
                  className="w-full"
                >
                  <Share2 />
                  Share Results
                </Button>
              </ButtonGroup>
              <ButtonGroup className="w-full">
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link href="/">
                    <House />
                    Return Home
                  </Link>
                </Button>
              </ButtonGroup>
            </ButtonGroup>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
