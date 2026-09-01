"use client";

import type { Feature, LineString } from "geojson";
import {
  ArrowLeftIcon,
  MapPinCheckInsideIcon,
  MapPinIcon,
  SendIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
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
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import type { Coordinates } from "@/lib/types";
import { submitGuess } from "./actions";
import type { GameType } from "./page";
import { PhotoDialog } from "./photo-dialog";
import { ReportDialog } from "./report-dialog";
import { RoundResultItem } from "./round-result-item";

type RoundResult = {
  roundId: number;
  distance: number;
  points: number;
};

export function Game({ game }: { game: GameType }) {
  const router = useRouter();
  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [guess, setGuess] = useState<Coordinates | null>(null);
  const [, setCursorCoords] = useState<Coordinates | null>(null);
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [isSubmittingGuess, setIsSubmittingGuess] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(true);
  const mapRef = useRef<MapRef>(null);

  const currentRound = game.rounds[roundIndex];
  const currentResult = roundResults.find(
    (result) => result.roundId === currentRound?.id,
  );
  const answer = currentRound?.photo ?? null;
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

  const totalPoints = roundResults.reduce(
    (total, result) => total + result.points,
    0,
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
          <MapPinIcon className="size-8 fill-white text-red-500 dark:fill-black" />
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
          <Source id="line" type="geojson" data={lineGeoJson}>
            <Layer
              id="line-layer"
              type="line"
              layout={{
                "line-cap": "round",
                "line-join": "round",
              }}
              paint={{
                "line-color": "#fff",
                "line-width": 3,
                "line-dasharray": [0, 2],
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
                <ReportDialog photoId={game.rounds[roundIndex]?.photoId} />
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
