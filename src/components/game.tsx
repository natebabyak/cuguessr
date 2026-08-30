import { Link } from "@tanstack/react-router";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  MapPinCheckInsideIcon,
  MapPinIcon,
  MapPinXInsideIcon,
  Share2Icon,
  SkipForwardIcon,
} from "lucide-react";
import { useState } from "react";
import { Marker } from "react-map-gl/maplibre";
import { AppMap } from "#/components/app-map";
import CountUp from "#/components/CountUp";
import { GoToCenterButton } from "#/components/go-to-center-button";
import { GoToMarkerButton } from "#/components/go-to-marker-button";
import { PhotoDialog } from "#/components/photo-dialog";
import { ReportDialog } from "#/components/report-dialog";
import { SubmitGuessButton } from "#/components/submit-guess-button";
import { Button, buttonVariants } from "#/components/ui/button";
import { ButtonGroup } from "#/components/ui/button-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "#/components/ui/item";
import { Separator } from "#/components/ui/separator";
import { toast } from "#/components/ui/toast";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "#/lib/constants";
import type { getGameByDate } from "#/lib/game/functions";
import type { getGameResultByGameId } from "#/lib/game-result/functions";
import type { getRoundResultsByGameId } from "#/lib/round-result/functions";
import { useSubmitGuessMutation } from "#/lib/round-result/mutations";
import type { Coordinates } from "#/lib/types";
import { cn } from "#/lib/utils";

type GameData = NonNullable<Awaited<ReturnType<typeof getGameByDate>>>;
type RoundResults = NonNullable<
  Awaited<ReturnType<typeof getRoundResultsByGameId>>
>;
type GameResult = Awaited<ReturnType<typeof getGameResultByGameId>>;

type GameProps = {
  game: GameData;
  gameId: number;
  roundResults: RoundResults;
  gameResult: GameResult | undefined;
};

export function Game({ game, gameId, roundResults, gameResult }: GameProps) {
  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [guess, setGuess] = useState<Coordinates | null>(null);
  const [, setCursorCoords] = useState<Coordinates | null>(null);
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [isGameOver, setIsGameOver] = useState(roundIndex > 4);

  const submitGuessMutation = useSubmitGuessMutation(gameId);

  if (isGameOver)
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
            {game.rounds.map((round, roundIndex) => (
              <Item key={round.id} variant="outline">
                <ItemMedia variant="icon">EMOJI</ItemMedia>
                <ItemContent className="grid grid-cols-2 grid-rows-2">
                  <ItemTitle className="col-span-2 justify-start justify-self-start">
                    Round {roundIndex + 1}
                  </ItemTitle>
                  <span className="self-end justify-self-start text-muted-foreground">
                    {roundResults[roundIndex].distance.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }) ?? 0}
                    m
                  </span>
                  <span className="justify-end justify-self-end text-muted-foreground">
                    {roundResults[roundIndex]?.points?.toLocaleString() ?? "0"}{" "}
                    points
                  </span>
                </ItemContent>
              </Item>
            ))}
          </div>
          <div className="grid w-full grid-cols-1 grid-rows-2 gap-2 px-2">
            <Button
              onClick={async () => {
                const shareText = `cuGuessr #${gameId}\n\n${gameResult?.points} points \nhttps://cuguessr.com/daily`;

                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: `cuGuessr #${gameId}`,
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

  const currentRound = game.rounds[roundIndex];
  const currentResult = roundResults.find((r) => r.roundId === currentRound.id);
  const totalPoints = roundResults.reduce((acc, r) => acc + (r.points ?? 0), 0);

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
        setGuess({ latitude, longitude });
      }}
      onMouseDown={() => setCursor("grabbing")}
      onMouseMove={(e) => {
        const { lat: latitude, lng: longitude } = e.lngLat;
        setCursorCoords({ latitude, longitude });
      }}
      onMouseUp={() => setCursor("crosshair")}
    >
      {guess && (
        <Marker
          anchor="bottom"
          draggable={!isRoundOver}
          latitude={guess.latitude}
          longitude={guess.longitude}
          onDrag={(e) => {
            if (isRoundOver) return;
            const { lat: latitude, lng: longitude } = e.lngLat;
            setGuess({ latitude, longitude });
          }}
        >
          {isRoundOver ? (
            <MapPinXInsideIcon fill="white" className="text-primary" />
          ) : (
            <MapPinIcon className="fill-white text-primary" />
          )}
        </Marker>
      )}
      {isRoundOver && currentResult && (
        <Marker
          anchor="bottom"
          latitude={currentResult.latitude}
          longitude={currentResult.longitude}
        >
          <MapPinCheckInsideIcon fill="white" className="text-green-600" />
        </Marker>
      )}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-2 md:p-4">
        <div className="flex items-start justify-between">
          <Link
            to="/"
            className={cn(
              buttonVariants({ size: "icon-lg" }),
              "pointer-events-auto",
            )}
          >
            <ArrowLeftIcon />
          </Link>
          <Item
            variant="outline"
            className="pointer-events-auto w-fit bg-background"
          >
            <ItemContent>
              <ItemDescription>Round</ItemDescription>
              <ItemTitle className="ml-auto text-2xl">
                {roundIndex + 1}
              </ItemTitle>
            </ItemContent>
            <ItemContent>
              <ItemDescription>Points</ItemDescription>
              <ItemTitle className="ml-auto text-2xl">{totalPoints}</ItemTitle>
            </ItemContent>
          </Item>
        </div>
        <div className="flex items-end justify-between">
          <div className="pointer-events-auto mb-8 flex gap-2 md:mb-10 md:gap-4">
            {currentRound.photo?.objectKey && (
              <PhotoDialog
                objectKey={currentRound.photo.objectKey}
                height={currentRound.photo.height}
                width={currentRound.photo.width}
              />
            )}
            {currentRound.photoId && (
              <ReportDialog photoId={currentRound.photoId} />
            )}
          </div>
          <div className="pointer-events-auto mb-8 flex flex-col items-end gap-2 md:mb-10 md:gap-4">
            <ButtonGroup orientation="vertical">
              <GoToMarkerButton marker={guess} />
              <GoToCenterButton />
            </ButtonGroup>
            {!isRoundOver && (
              <SubmitGuessButton
                disabled={!guess || submitGuessMutation.isPending}
                onClick={async () => {
                  if (!guess) return;
                  await submitGuessMutation.mutateAsync({
                    roundId: currentRound.id,
                    latitude: guess.latitude,
                    longitude: guess.longitude,
                  });
                  setIsRoundOver(true);
                }}
              />
            )}
          </div>
        </div>
      </div>
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-20 transition-transform duration-300 ease-out",
          isRoundOver ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="pointer-events-auto grid grid-cols-3 gap-4 bg-background px-2 pt-2 pb-10 md:grid-cols-4 md:px-4 md:pt-4 md:pb-12">
          <div className="flex flex-col items-end">
            <span className="font-medium text-muted-foreground text-xs uppercase">
              Distance
            </span>
            <CountUp
              from={0}
              to={Math.round(currentResult?.distance ?? 0)}
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
              to={currentResult?.points ?? 0}
              className="ml-auto font-semibold text-2xl"
            />
          </div>
          <div className="flex flex-col items-end">
            <span className="font-medium text-muted-foreground text-xs uppercase">
              Total Score
            </span>
            <CountUp
              from={totalPoints - (currentResult?.points ?? 0)}
              to={totalPoints}
              className="ml-auto font-semibold text-2xl"
            />
          </div>
          <Button
            onClick={() => {
              if (roundIndex === 4) {
                setIsGameOver(true);
              } else {
                setRoundIndex((i) => i + 1);
                setIsRoundOver(false);
                setGuess(null);
                setCursorCoords(null);
              }
            }}
            size="lg"
            className="col-span-3 ml-auto w-fit md:col-span-1"
          >
            {roundIndex === 4 ? "Results" : "Next Round"}
            <SkipForwardIcon />
          </Button>
        </div>
      </div>
    </AppMap>
  );
}
