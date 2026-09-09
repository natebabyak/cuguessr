"use client";

import type { Feature, LineString } from "geojson";
import { gsap } from "gsap";
import {
  ArrowLeftIcon,
  MapPinCheckInsideIcon,
  MapPinIcon,
  SendIcon,
} from "lucide-react";
import type { ExpressionSpecification } from "maplibre-gl";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { Layer, type MapRef, Marker, Source } from "react-map-gl/maplibre";
import { AppMap } from "@/components/app-map";
import { GoToMarkerButton } from "@/components/go-to-marker-button";
import { RecenterButton } from "@/components/recenter-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import type { Coordinates } from "@/lib/types";
import { submitGuess } from "./actions";
import { PhotoDialog } from "./photo-dialog";
import { ReportDialog } from "./report-dialog";
import { RoundResultItem } from "./round-result-item";

type RoundResult = {
  roundId: number;
  distance: number;
  points: number;
  photo?: {
    latitude: number;
    longitude: number;
  };
};

interface GameProps {
  game: {
    id: number;
    date: string;
    rounds: {
      id: number;
      photo: {
        id: number;
        objectKey: string;
        height: number;
        width: number;
      };
    }[];
  };
  savedRoundResults: RoundResult[];
}

function easeInOut(t: number) {
  return t * t * (3 - 2 * t);
}

function lineGradient(
  progress: number,
  color: string,
): ExpressionSpecification {
  return ["step", ["line-progress"], color, progress, "rgba(0,0,0,0)"];
}

export function Game({ game, savedRoundResults }: GameProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const lineColor = resolvedTheme === "dark" ? "#fff" : "#000";
  const { data: session, isPending } = authClient.useSession();
  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [guess, setGuess] = useState<Coordinates | null>(null);
  const [, setCursorCoords] = useState<Coordinates | null>(null);
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [isSubmittingGuess, setIsSubmittingGuess] = useState(false);
  const [roundIndex, setRoundIndex] = useState(savedRoundResults.length);
  const [roundResults, setRoundResults] =
    useState<RoundResult[]>(savedRoundResults);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(true);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (isPending || session) return;

    void authClient.signIn.anonymous();
  }, [isPending, session]);

  const currentRound = game.rounds[roundIndex];
  const currentResult = roundResults.find(
    (result) => result.roundId === currentRound?.id,
  );
  const answer = currentResult?.photo ?? null;

  const lineGeoJson = useMemo<Feature<LineString> | null>(() => {
    if (!guess || !answer) return null;

    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [guess.longitude, guess.latitude],
          [answer.longitude, answer.latitude],
        ],
      },
    };
  }, [answer, guess]);

  useEffect(() => {
    if (!isRoundOver || !guess || !answer || !mapRef.current) return;

    const map = mapRef.current;
    const minLat = Math.min(guess.latitude, answer.latitude);
    const maxLat = Math.max(guess.latitude, answer.latitude);
    const minLng = Math.min(guess.longitude, answer.longitude);
    const maxLng = Math.max(guess.longitude, answer.longitude);

    map.flyTo({
      center: [guess.longitude, guess.latitude],
      zoom: 20,
      duration: 1000,
      easing: easeInOut,
    });

    let lineTween: gsap.core.Tween | null = null;

    const revealTimeout = window.setTimeout(() => {
      const state = { progress: 0 };

      lineTween = gsap.to(state, {
        progress: 1,
        duration: 2,
        ease: "power1.inOut",
        onUpdate: () => {
          map
            .getMap()
            .setPaintProperty(
              "line-layer",
              "line-gradient",
              lineGradient(state.progress, lineColor),
            );
        },
      });

      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          bearing: 0,
          duration: 2000,
          easing: easeInOut,
          padding: { top: 100, bottom: 200, left: 50, right: 50 },
        },
      );
    }, 1000);

    return () => {
      window.clearTimeout(revealTimeout);
      lineTween?.kill();
    };
  }, [isRoundOver, guess, answer, lineColor]);

  const totalPoints = roundResults.reduce(
    (total, result) => total + result.points,
    0,
  );

  return (
    <AppMap
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
          <MapPinIcon className="size-8 fill-white text-primary dark:fill-black" />
        </Marker>
      )}
      {isRoundOver && guess && answer && lineGeoJson && (
        <>
          <Marker
            anchor="bottom"
            latitude={answer.latitude}
            longitude={answer.longitude}
          >
            <MapPinCheckInsideIcon className="size-8 fill-white text-green-500 dark:fill-black" />
          </Marker>
          <Source id="line" type="geojson" lineMetrics data={lineGeoJson}>
            <Layer
              id="line-layer"
              type="line"
              layout={{
                "line-cap": "round",
                "line-join": "round",
              }}
              paint={{
                "line-width": 3,
                "line-gradient": lineGradient(0, lineColor),
              }}
            />
          </Source>
        </>
      )}
      <div className="pointer-events-none absolute inset-2 *:pointer-events-auto *:absolute md:inset-4">
        <Link
          href="/"
          className={buttonVariants({
            size: "icon-lg",
            className: "top-0 left-0",
          })}
        >
          <ArrowLeftIcon />
        </Link>
        <AnimatePresence>
          {!isRoundOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20, y: -20 }}
              className="top-0 right-0 w-fit"
            >
              <Item variant="outline" className="gap-8 bg-background">
                <ItemContent className="*:ml-auto">
                  <ItemDescription>Round</ItemDescription>
                  <ItemTitle className="text-2xl">{roundIndex + 1}</ItemTitle>
                </ItemContent>
                <ItemContent className="*:ml-auto">
                  <ItemDescription>Points</ItemDescription>
                  <ItemTitle className="text-2xl">
                    {totalPoints.toLocaleString()}
                  </ItemTitle>
                </ItemContent>
              </Item>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!isRoundOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20, y: 20 }}
              className="bottom-8 left-0"
            >
              {game.rounds[roundIndex]?.photo && (
                <PhotoDialog
                  objectKey={game.rounds[roundIndex].photo.objectKey}
                  height={game.rounds[roundIndex].photo.height}
                  width={game.rounds[roundIndex].photo.width}
                  open={isPhotoDialogOpen}
                  onOpenChange={setIsPhotoDialogOpen}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!isRoundOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
              className="right-0 bottom-8 flex flex-col items-end gap-2 md:gap-4"
            >
              <ButtonGroup orientation="vertical">
                <GoToMarkerButton marker={guess} />
                <RecenterButton />
              </ButtonGroup>
              <Button
                disabled={!guess || isSubmittingGuess}
                onClick={async () => {
                  if (!guess || !currentRound) return;

                  setIsSubmittingGuess(true);
                  try {
                    const result = await submitGuess({
                      roundId: currentRound.id,
                      latitude: guess.latitude,
                      longitude: guess.longitude,
                    });
                    setRoundResults((previous) => [...previous, result]);
                    setIsRoundOver(true);
                  } finally {
                    setIsSubmittingGuess(false);
                  }
                }}
                size="lg"
              >
                {isSubmittingGuess ? <Spinner /> : <SendIcon />}
                Submit Guess
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isRoundOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="right-0 bottom-8 left-0 flex flex-col gap-2 md:gap-4"
            >
              <div className="flex gap-2 md:gap-4">
                {game.rounds[roundIndex]?.photo && (
                  <PhotoDialog
                    objectKey={game.rounds[roundIndex].photo.objectKey}
                    height={game.rounds[roundIndex].photo.height}
                    width={game.rounds[roundIndex].photo.width}
                    open={isPhotoDialogOpen}
                    onOpenChange={setIsPhotoDialogOpen}
                  />
                )}
                {game.rounds[roundIndex]?.photo && (
                  <ReportDialog photoId={game.rounds[roundIndex].photo.id} />
                )}
              </div>
              <RoundResultItem
                distance={Math.round(currentResult?.distance ?? 0)}
                points={currentResult?.points ?? 0}
                totalPoints={totalPoints}
                isLastRound={roundIndex === game.rounds.length - 1}
                handleClick={() => {
                  if (roundIndex < game.rounds.length - 1) {
                    const nextRoundIndex = roundIndex + 1;
                    setRoundIndex(nextRoundIndex);
                    setIsPhotoDialogOpen(true);
                    mapRef.current?.flyTo({
                      center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
                      zoom: DEFAULT_ZOOM,
                      duration: 1000,
                      easing: easeInOut,
                    });
                  } else {
                    router.refresh();
                  }

                  setIsRoundOver(false);

                  setGuess(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppMap>
  );
}
