"use client";

import {
	HouseIcon,
	LocateFixedIcon,
	LogOutIcon,
	MapPinCheckInsideIcon,
	MapPinIcon,
	MapPinXInsideIcon,
	NavigationIcon,
	RotateCcwIcon,
	SendIcon,
	SkipForwardIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import {
	Layer,
	Map as MapLibreMap,
	Marker,
	Source,
} from "react-map-gl/maplibre";
import { PhotoDialog } from "@/components/photo-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Item, ItemMedia } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { useGame } from "@/hooks/use-game";
import { useGameResult } from "@/hooks/use-game-result";
import { useRoundResult } from "@/hooks/use-round-result";
import {
	DEFAULT_LATITUDE,
	DEFAULT_LONGITUDE,
	DEFAULT_ZOOM,
} from "@/lib/constants";

interface Coordinates {
  latitude: number;
  longitude: number;
}

export function Game({ gameId }: { gameId: number }) {
  const { data: game } = useGame(gameId);
  const { data: gameResult } = useGameResult(gameId);

  const roundId = useMemo(() => {
    return game?.rounds.at(-1)?.id;
  }, [game]);

  const { data: roundResult } = useRoundResult(roundId);

  const mapRef = useRef<MapRef>(null);
  const isRoundOver = useMemo(() => roundResults?.durationMs, [roundResults]);

  const [cursor, setCursor] = useState<"default" | "crosshair" | "grabbing">(
    "crosshair",
  );

  const [guess, setGuess] = useState<Coordinates | null
  >(null);


  if (!game) return <Spinner />

  function placeGuessMarker(e: MapLayerMouseEvent) {
    if (isRoundOver) return;
    const { lat, lng } = e.lngLat;
    setGuess({ latitude: lat, longitude: lng });
  }

  function updateCursorCoordinates(e: MapLayerMouseEvent) {
    const { lat, lng } = e.lngLat;
    setCursorCoordinates({ latitude: lat, longitude: lng });
  }

  function goToCenter() {}

  function makeGuess() {
    if (!guessCoordinates) return;
    const { latitude, longitude } = rounds[roundIndex].photo;
    const distance = calculateDistance(guessCoordinates, {
      latitude,
      longitude,
    });
    const newRounds = [...rounds];
    newRounds[roundIndex] = {
      ...newRounds[roundIndex],
      guess: guessCoordinates,
      distance,
      score: calculateScore(distance),
    };
    updateState({ rounds: newRounds, isRoundOver: true });
  }

  if (gameResult) {
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
            {rounds.map((round, index) => (
              <Item key={index} variant="outline">
                <ItemMedia variant="icon">
                  {scoreToEmoji(round.score || 0)}
                </ItemMedia>
                <ItemContent className="grid grid-cols-2 grid-rows-2">
                  <ItemTitle className="col-span-2 justify-start justify-self-start">
                    Round {index + 1}
                  </ItemTitle>
                  <span className="self-end justify-self-start text-muted-foreground">
                    {round.distance?.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }) ?? "0"}{" "}
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
              onClick={() => {
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
  }

  return (
    <MapLibreMap
      ref={mapRef}
      cursor={cursor}
      initialViewState={{
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
        zoom: DEFAULT_ZOOM,
      }}
      onClick={(e) => {
        if (isRoundOver) return;

        const { lat: latitude, lng: longitude } = e.lngLat;

        setGuessCoordinates({
          latitude,
          longitude,
        });
      }}
      onMouseDown={() => setCursor("grabbing")}
      onMouseMove={updateCursorCoordinates}
      onMouseUp={() => setCursor("crosshair")}
    >
      {isRoundOver ? (
        <div className="pointer-events-none absolute flex size-full flex-col justify-end gap-2 md:gap-4">
          {guessCoordinates && (
            <Marker
              anchor="bottom"
              latitude={guessCoordinates.latitude}
              longitude={guessCoordinates.longitude}
            >
              <MapPinXInsideIcon fill="white" className="text-red-500" />
            </Marker>
          )}
          <Marker
            anchor="bottom"
            latitude={rounds[roundIndex].photo.latitude}
            longitude={rounds[roundIndex].photo.longitude}
          >
            <MapPinCheckInsideIcon fill="white" className="text-green-500" />
          </Marker>
          {guessCoordinates && (
            <Source
              id="line"
              type="geojson"
              lineMetrics={true}
              data={fullLineGeoJson as unknown as string}
            >
              <Layer
                id="line-layer"
                type="line"
                paint={{
                  "line-width": 2,
                  "line-gradient": [
                    "step",
                    ["line-progress"],
                    "#000000",
                    0,
                    "rgba(0,0,0,0)",
                  ],
                }}
              />
            </Source>
          )}
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
              {roundIndex === game?.rounds.length - 1 ? "Results" : "Next Round"}
              <SkipForwardIcon />
            </Button>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute grid h-dvh w-dvw grid-cols-2 grid-rows-2 px-2 pt-2 pb-10 md:px-4 md:pt-4 md:pb-12">
          {guessCoordinates && (
            <Marker
              anchor="bottom"
              draggable={true}
              latitude={guessCoordinates.latitude}
              longitude={guessCoordinates.longitude}
              onDrag={() =>
                setGuessCoordinates()
              }
            >
              <MapPinIcon className="fill-white text-primary" />
            </Marker>
          )}
            <Link href="/" className={buttonVariants({ size: "icon-lg" })}>
              <LogOutIcon  className="rotate-180" />
            </Link>
            <!--
          <Card className="pointer-events-auto self-start justify-self-end">
            <CardContent className="grid grid-cols-2 grid-rows-2 gap-x-4">
              <span className="self-start justify-self-end font-medium text-lg">
                Round
              </span>
              <span className="self-start justify-self-end font-medium text-lg">
                Score
              </span>
              <span className="self-end justify-self-end">
                <span className="font-bold text-2xl">{roundIndex + 1}</span>
                <span className="text-muted-foreground text-xs">
                  /{photos.length}
                </span>
              </span>
              <span className="ml-auto self-end justify-self-end font-bold text-2xl">
                {rounds
                  .reduce((acc, round) => acc + (round.score || 0), 0)
                  .toLocaleString()}
              </span>
            </CardContent>
            </Card>
            -->
          <PhotoDialog imageSrc={rounds[roundIndex].photo.image_path} />
          <ButtonGroup
            orientation="vertical"
            className="self-end justify-self-end"
          >
            <ButtonGroup orientation="vertical" className="ml-auto">
              <Button
                disabled={!guessCoordinates}
                onClick={() => {
                  const map = mapRef.current;
                  if (!guessCoordinates || !map) return;
                  map.flyTo({
                    center: [
                      guessCoordinates.longitude,
                      guessCoordinates.latitude,
                    ],
                    zoom: 20,
                  });
                }}
                size="icon-lg"
                className="pointer-events-auto rounded-full"
              >
                <LocateFixedIcon />
              </Button>
              <GoToCenterButton mapRef={mapRef} />
            </ButtonGroup>
            <ButtonGroup>
              <Button
                disabled={!guessCoordinates}
                onClick={makeGuess}
                size="lg"
                className="pointer-events-auto rounded-full"
              >
                <SendIcon />
                Make Guess
              </Button>
            </ButtonGroup>
          </ButtonGroup>
        </div>
      )}
    </MapLibreMap>
  );
}

function GoToCenterButton({ mapRef }: { mapRef: React.RefObject<MapRef> }) {
  function goToCenter() {
    mapRef.current?.flyTo({
      center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
      zoom: DEFAULT_ZOOM,
    });
  }

  return (
    <Button
      onClick={goToCenter}
      size="icon-lg"
      className="pointer-events-auto rounded-full"
    >
      <NavigationIcon />
    </Button>
  );
}
