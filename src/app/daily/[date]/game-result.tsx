import { ArrowDownIcon, ArrowLeftIcon, Share2Icon } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import type { GameResultType } from "./page";

export function GameResult({ gameResult }: { gameResult: GameResultType }) {
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
          {gameResult.game?.rounds.map((round) => (
            <Item key={round.id} variant="outline">
              <ItemMedia variant="image">{round.results[0].points}</ItemMedia>
              <ItemContent>
                <ItemTitle>Round {round.index + 1}</ItemTitle>
                <ItemDescription>
                  {round.results[0].distance.toLocaleString()} m
                </ItemDescription>
              </ItemContent>
              <ItemContent>
                <ItemDescription>
                  {round.results[0].points.toLocaleString()} points
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </div>
        <div className="grid w-full grid-cols-1 grid-rows-2 gap-2 px-2">
          <Button
            onClick={async () => {
              const shareText = `cuGuessr #${gameResult.game?.date}\n\n${gameResult?.points} points \nhttps://cuguessr.com/daily`;

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
            href="/"
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
