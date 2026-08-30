import { Link } from "@tanstack/react-router";
import { ArrowDownIcon, ArrowLeftIcon, Share2Icon } from "lucide-react";
import type { getGameByDate } from "../../../lib/OLD-TO-DELETE/game/functions";
import type { getGameResultByGameId } from "../../../lib/OLD-TO-DELETE/game-result/functions";
import type { getRoundResultsByGameId } from "../../../lib/OLD-TO-DELETE/round-result/functions";
import { Button, buttonVariants } from "./ui/button";
import { Item, ItemContent, ItemMedia, ItemTitle } from "./ui/item";
import { Separator } from "./ui/separator";
import { toast } from "./ui/toast";

export function GameResultScreen({
  game,
  roundResults,
  gameResult,
}: {
  game: NonNullable<Awaited<ReturnType<typeof getGameByDate>>>;
  roundResults: NonNullable<
    Awaited<ReturnType<typeof getRoundResultsByGameId>>
  >;
  gameResult: Awaited<ReturnType<typeof getGameResultByGameId>>;
}) {
  return (
    <div className="flex h-dvh w-dvw items-center justify-center">
      <div className="fade-in-0 slide-in-from-bottom-5 flex w-full max-w-sm animate-in flex-col gap-4 duration-700">
        <h1 className="text-center font-black text-4xl">
          <span className="text-primary">cu</span>
          Guessr
        </h1>
        <p className="text-center font-medium text-2xl">
          {gameResult?.points} points
        </p>
        <div className="mx-auto flex w-full max-w-xs flex-col gap-2">
          {game.rounds.map((round, roundIndex) => {
            const result = roundResults.find(
              (roundResult) => roundResult.roundId === round.id,
            );

            return (
              <Item key={round.id} variant="outline">
                <ItemMedia variant="icon">EMOJI</ItemMedia>
                <ItemContent className="grid grid-cols-2 grid-rows-2">
                  <ItemTitle className="col-span-2 justify-start justify-self-start">
                    Round {roundIndex + 1}
                  </ItemTitle>
                  <span className="self-end justify-self-start text-muted-foreground">
                    {(result?.distance ?? 0).toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                    m
                  </span>
                  <span className="justify-end justify-self-end text-muted-foreground">
                    {result?.points?.toLocaleString() ?? "0"} points
                  </span>
                </ItemContent>
              </Item>
            );
          })}
        </div>
        <div className="grid w-full grid-cols-1 grid-rows-2 gap-2 px-2">
          <Button
            onClick={async () => {
              const shareText = `cuGuessr #${game.id}\n\n${gameResult?.points} points \nhttps://cuguessr.com/daily`;

              if (navigator.share) {
                try {
                  await navigator.share({
                    title: `cuGuessr #${game.id}`,
                    text: shareText,
                  });
                } catch {}
              } else {
                try {
                  await navigator.clipboard.writeText(shareText);
                  toast.add({ title: "Copied to clipboard!" });
                } catch {
                  toast.add({
                    title: "Something went wrong. Please try again.",
                  });
                }
              }
            }}
            size="lg"
            variant="default"
            className="rounded-full"
          >
            <Share2Icon />
            Share Results
          </Button>
          <Link
            to="/"
            className={buttonVariants({ size: "lg", variant: "ghost" })}
          >
            <ArrowLeftIcon />
            Back to Home
          </Link>
          <div>
            <Separator className="flex-1" />
            <span>
              <ArrowDownIcon />
              Scroll down to compare
            </span>
            <Separator className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
