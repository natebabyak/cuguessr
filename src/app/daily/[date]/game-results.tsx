import { Item } from "@/components/ui/item";

export function GameResults({ gameId }: { gameId: number }) {
  return (
    <div className="flex h-dvh w-dvw items-center justify-center">
      <div className="fade-in-0 slide-in-from-bottom-5 flex w-full max-w-sm animate-in flex-col gap-4 duration-700">
        <h1 className="text-center font-black text-4xl">
          <span className="text-primary">cu</span>
          Guessr
        </h1>
        <p className="text-center font-medium text-2xl">
          {gameResult.json} points
        </p>
        <div className="mx-auto flex w-full max-w-xs flex-col gap-2">
          {game.rounds.map((round, roundIndex) => (
            <Item key={round.id} variant="outline">
              <ItemMedia variant="icon">
                {scoreToEmoji(round.score || 0)}
              </ItemMedia>
              <ItemContent className="grid grid-cols-2 grid-rows-2">
                <ItemTitle className="col-span-2 justify-start justify-self-start">
                  Round {roundIndex + 1}
                </ItemTitle>
                <span className="self-end justify-self-start text-muted-foreground">
                  {roundResults[roundIndex].distance?.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    },
                  ) ?? "0"}{" "}
                  m
                </span>
                <span className="justify-end justify-self-end text-muted-foreground">
                  {round.score?.toLocaleString() ?? "0"} points
                </span>
              </ItemContent>
            </Item>
          ))}
        </div>
        <div className="grid w-full grid-cols-1 grid-rows-2 gap-2 px-2">
          <Button
            onClick={async () => {
              const emojis = game.rounds
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
            }}
            size="lg"
            variant="default"
            className="rounded-full"
          >
            <Share2 />
            Share Results
          </Button>
          {gameType === "classic" && (
            <Button
              onClick={() => (window.location.href = "/classic")}
              size="lg"
              variant="outline"
              className="rounded-full"
            >
              <RotateCcwIcon />
              Play Again
            </Button>
          )}
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link href="/">
              <HouseIcon />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
