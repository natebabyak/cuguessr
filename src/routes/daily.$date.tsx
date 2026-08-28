import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";

const MIN_DATE = "2026-03-11";

const MAX_DATE = Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
}).format(Date.now());

const DateSchema = z.iso
  .date()
  .refine((value) => value >= MIN_DATE && value <= MAX_DATE);

export const Route = createFileRoute("/daily/$date")({
  params: {
    parse: (params) => ({
      date: DateSchema.parse(params.date),
    }),
  },
  beforeLoad: async () => {},
  component: RouteComponent,
});

function RouteComponent() {
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  if (isGameOver)
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
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full"
            >
              <Link href="/">
                <HouseIcon />
                Return Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );

  return (
    <AppMap
      cursor={cursor}
      initialViewState={{
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
        zoom: DEFAULT_ZOOM,
      }}
      onClick={(e) => {
        if (isRoundOver) return;

        const { lat: latitude, lng: longitude } = e.lngLat;

        setGuessMarkerCoordinates({
          latitude,
          longitude,
        });
      }}
      onMouseDown={() => setCursor("grabbing")}
      onMouseMove={(e) => {
        const { lat: latitude, lng: longitude } = e.lngLat;
        setCursorCoordinates({
          latitude,
          longitude,
        });
      }}
      onMouseUp={() => setCursor("crosshair")}
    >
      {isRoundOver ? (
        <div className="pointer-events-none absolute flex size-full flex-col justify-end gap-2 md:gap-4">
          {guessMarkerCoordinates && (
            <Marker
              anchor="bottom"
              latitude={guessMarkerCoordinates.latitude}
              longitude={guessMarkerCoordinates.longitude}
            >
              <MapPinXInsideIcon fill="white" className="text-primary" />
            </Marker>
          )}
          <Marker
            anchor="bottom"
            latitude={roundResults[roundIndex].latitude ?? 0}
            longitude={roundResults[roundIndex].longitude ?? 0}
          >
            <MapPinCheckInsideIcon fill="white" className="text-green-600" />
          </Marker>
          <div className="flex items-center justify-between px-2 md:px-4">
            <PhotoDialog imageSrc={game.rounds[roundIndex].photo.objectKey} />
            <ReportDialog photoId={game.rounds[roundIndex].photo.id} />
          </div>
          <div className="pointer-events-auto grid grid-cols-3 gap-4 bg-background px-2 pt-2 pb-10 md:grid-cols-4 md:px-4 md:pt-4 md:pb-12">
            <div className="flex flex-col items-end">
              <span className="font-medium text-muted-foreground text-xs uppercase">
                Distance
              </span>
              <CountUp
                from={0}
                to={rounds[roundIndex].distance || 0}
                className="ml-auto font-semibold text-2xl"
              />
              m
            </div>
            <div className="flex flex-col items-end">
              <span className="font-medium text-muted-foreground text-xs uppercase">
                Round Score
              </span>
              <CountUp
                from={0}
                to={rounds[roundIndex].score || 0}
                className="ml-auto font-semibold text-2xl"
              />
            </div>
            <div className="flex flex-col items-end">
              <span className="font-medium text-muted-foreground text-xs uppercase">
                Total Score
              </span>
              <CountUp
                from={
                  rounds.reduce((acc, round) => acc + (round.score || 0), 0) -
                  (rounds[roundIndex].score || 0)
                }
                to={rounds.reduce((acc, round) => acc + (round.score || 0), 0)}
                className="ml-auto font-semibold text-2xl"
              />
            </div>
            <Button
              onClick={nextRound}
              size="lg"
              className="col-span-3 ml-auto w-fit hover:scale-105 md:col-span-1"
            >
              {roundIndex === game?.rounds.length - 1
                ? "Results"
                : "Next Round"}
              <SkipForwardIcon />
            </Button>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute grid h-dvh w-dvw grid-cols-2 grid-rows-2 px-2 pt-2 pb-10 md:px-4 md:pt-4 md:pb-12">
          {guess && (
            <Marker
              anchor="bottom"
              draggable={true}
              latitude={guess.latitude}
              longitude={guess.longitude}
              onDrag={(e) => {
                const { lat: latitude, lng: longitude } = e.lngLat;

                setGuess({
                  latitude,
                  longitude,
                });
              }}
            >
              <MapPinIcon className="fill-white text-primary" />
            </Marker>
          )}
          <Link href="/" className={buttonVariants({ size: "icon-lg" })}>
            <LogOutIcon className="rotate-180" />
          </Link>
          <Item className="pointer-events-auto self-start justify-self-end">
            <ItemContent>
              <ItemDescription>Round</ItemDescription>
              <ItemTitle>placeholder</ItemTitle>
            </ItemContent>
            <ItemContent>
              <ItemDescription>Points</ItemDescription>
              <ItemTitle>placeholder</ItemTitle>
            </ItemContent>
          </Item>
          <PhotoDialog objectKey={game.rounds.at(-1)?.photo?.objectKey} />
          <ButtonGroup
            orientation="vertical"
            className="self-end justify-self-end"
          >
            <ButtonGroup orientation="vertical" className="ml-auto">
              <GoToGuessButton guess={guess} />
              <GoToCenterButton />
            </ButtonGroup>
            <ButtonGroup>
              <SubmitGuessButton guess={guess} />
            </ButtonGroup>
          </ButtonGroup>
        </div>
      )}
    </AppMap>
  );
}
