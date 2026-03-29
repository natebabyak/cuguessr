"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  LocateFixed,
  LogOut,
  MapPin,
  MapPinCheckInside,
  MapPinXInside,
  Navigation,
  Send,
  SkipForward,
} from "lucide-react";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import { Layer, Map, Marker, Source } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import { useEffect, useState, useRef, startTransition } from "react";
import { Coordinates, GameType, Round } from "@/lib/types";
import CountUp from "react-countup";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  calculateDistance,
  calculateScore,
  easeInOut,
  getDailyNumber,
} from "@/lib/utils";
import { ResultsScreen } from "./results-screen";
import { PhotoDialog } from "./photo-dialog";
import { ReportDialog } from "./report-dialog";

const mapStyle = `https://api.maptiler.com/maps/streets-v4/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`;

interface GameProps {
  type: GameType;
  photos: {
    id: number;
    image_path: string;
    latitude: number;
    longitude: number;
  }[];
}

type GameState = {
  rounds: Round[];
  roundIndex: number;
  isRoundOver: boolean;
  isGameOver: boolean;
  guessCoordinates: Coordinates | null;
};

export function Game({ type, photos }: GameProps) {
  const STORAGE_KEY = `daily-${getDailyNumber()}`;

  const [cursor, setCursor] = useState<"default" | "crosshair" | "grabbing">(
    "crosshair",
  );
  const [cursorCoordinates, setCursorCoordinates] =
    useState<Coordinates | null>(null);
  const map = useRef<MapRef>(null);
  const animationRef = useRef<number | null>(null);

  const defaultState: GameState = {
    rounds: photos.map((photo) => ({
      photo,
      guess: null,
      distance: null,
      score: null,
    })),
    roundIndex: 0,
    isRoundOver: false,
    isGameOver: false,
    guessCoordinates: null,
  };

  const [gameState, setGameState] = useState<GameState>(defaultState);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (type !== "daily") {
      startTransition(() => setMounted(true));
      return;
    }
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    startTransition(() => {
      if (saved) setGameState(saved);
      setMounted(true);
    });
  }, [type, STORAGE_KEY]);

  useEffect(() => {
    if (!mounted || type !== "daily") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState, mounted, type, STORAGE_KEY]);

  const { rounds, roundIndex, isRoundOver, isGameOver, guessCoordinates } =
    gameState;

  function updateState(patch: Partial<GameState>) {
    setGameState((prev) => ({ ...prev, ...patch }));
  }

  useEffect(() => {
    if (!isRoundOver || !map.current) return;

    const guessLat = rounds[roundIndex].guess?.latitude || 0;
    const guessLng = rounds[roundIndex].guess?.longitude || 0;
    const answerLat = rounds[roundIndex].photo.latitude;
    const answerLng = rounds[roundIndex].photo.longitude;

    const minLat = Math.min(guessLat, answerLat);
    const maxLat = Math.max(guessLat, answerLat);
    const minLng = Math.min(guessLng, answerLng);
    const maxLng = Math.max(guessLng, answerLng);

    if (animationRef.current !== null)
      cancelAnimationFrame(animationRef.current);

    map.current.flyTo({
      center: [guessLng, guessLat],
      zoom: 20,
      duration: 1000,
      easing: easeInOut,
    });

    const traceTimeout = setTimeout(() => {
      const startTime = performance.now();
      const frame = (now: number) => {
        const t = Math.min((now - startTime) / 2000, 1);
        map.current
          ?.getMap()
          .setPaintProperty("line-layer", "line-gradient", [
            "step",
            ["line-progress"],
            "#000000",
            t,
            "rgba(0,0,0,0)",
          ]);
        if (t < 1) animationRef.current = requestAnimationFrame(frame);
      };
      animationRef.current = requestAnimationFrame(frame);
    }, 1000);

    const boundsTimeout = setTimeout(() => {
      map.current?.fitBounds(
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
      clearTimeout(traceTimeout);
      clearTimeout(boundsTimeout);
      if (animationRef.current !== null)
        cancelAnimationFrame(animationRef.current);
    };
  }, [isRoundOver, rounds, roundIndex]);

  function nextRound() {
    if (roundIndex === rounds.length - 1) {
      setGameState((prev) => {
        const finalState = {
          ...prev,
          isRoundOver: false,
          guessCoordinates: null,
          isGameOver: true,
        };
        if (type === "daily")
          localStorage.setItem(STORAGE_KEY, JSON.stringify(finalState));
        return finalState;
      });
      return;
    }

    setGameState((prev) => ({
      ...prev,
      isRoundOver: false,
      guessCoordinates: null,
      roundIndex: prev.roundIndex + 1,
    }));
    map.current?.flyTo({
      center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
      zoom: DEFAULT_ZOOM,
      duration: 1000,
      easing: easeInOut,
    });
  }

  function placeGuessMarker(e: MapLayerMouseEvent) {
    if (isRoundOver) return;
    const { lat, lng } = e.lngLat;
    updateState({ guessCoordinates: { latitude: lat, longitude: lng } });
  }

  function updateCursorCoordinates(e: MapLayerMouseEvent) {
    const { lat, lng } = e.lngLat;
    setCursorCoordinates({ latitude: lat, longitude: lng });
  }

  function goToGuessMarker() {
    if (!guessCoordinates || !map.current) return;
    map.current.flyTo({
      center: [guessCoordinates.longitude, guessCoordinates.latitude],
      zoom: 20,
    });
  }

  function goToCenter() {
    map.current?.flyTo({
      center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
      zoom: DEFAULT_ZOOM,
    });
  }

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

  const fullLineGeoJson = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [guessCoordinates?.longitude ?? 0, guessCoordinates?.latitude ?? 0],
        [rounds[roundIndex].photo.longitude, rounds[roundIndex].photo.latitude],
      ],
    },
  };

  if (isGameOver) return <ResultsScreen gameType={type} rounds={rounds} />;

  return (
    <>
      <Map
        ref={map}
        cursor={cursor}
        initialViewState={{
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
          zoom: DEFAULT_ZOOM,
        }}
        mapStyle={mapStyle}
        onClick={placeGuessMarker}
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
                <MapPinXInside fill="white" className="text-red-500" />
              </Marker>
            )}
            <Marker
              anchor="bottom"
              latitude={rounds[roundIndex].photo.latitude}
              longitude={rounds[roundIndex].photo.longitude}
            >
              <MapPinCheckInside fill="white" className="text-green-500" />
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
              <PhotoDialog
                imagePath={rounds[roundIndex].photo.image_path}
                isRoundOver={isRoundOver}
              />
              <ReportDialog photoId={rounds[roundIndex].photo.id} />
            </div>
            <div className="bg-background pointer-events-auto grid grid-cols-3 gap-4 px-2 pt-2 pb-10 md:grid-cols-4 md:px-4 md:pt-4 md:pb-12">
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground text-xs font-medium uppercase">
                  Distance
                </span>
                <CountUp
                  start={0}
                  end={rounds[roundIndex].distance || 0}
                  suffix=" m"
                  className="ml-auto text-2xl font-semibold"
                />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground text-xs font-medium uppercase">
                  Round Score
                </span>
                <CountUp
                  start={0}
                  end={rounds[roundIndex].score || 0}
                  className="ml-auto text-2xl font-semibold"
                />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground text-xs font-medium uppercase">
                  Total Score
                </span>
                <CountUp
                  start={
                    rounds.reduce((acc, round) => acc + (round.score || 0), 0) -
                    (rounds[roundIndex].score || 0)
                  }
                  end={rounds.reduce(
                    (acc, round) => acc + (round.score || 0),
                    0,
                  )}
                  className="ml-auto text-2xl font-semibold"
                />
              </div>
              <Button
                onClick={nextRound}
                size="lg"
                className="col-span-3 ml-auto w-fit hover:scale-105 md:col-span-1"
              >
                {roundIndex === rounds.length - 1 ? "Results" : "Next Round"}
                <SkipForward />
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
                  updateState({ guessCoordinates: cursorCoordinates })
                }
              >
                <MapPin className="text-primary fill-white" />
              </Marker>
            )}
            <Button
              asChild
              size="icon-lg"
              className="pointer-events-auto self-start justify-self-start rounded-full"
            >
              <Link href="/">
                <LogOut className="rotate-180" />
              </Link>
            </Button>
            <Card className="pointer-events-auto self-start justify-self-end">
              <CardContent className="grid grid-cols-2 grid-rows-2 gap-x-4">
                <span className="self-start justify-self-end text-lg font-medium">
                  Round
                </span>
                <span className="self-start justify-self-end text-lg font-medium">
                  Score
                </span>
                <span className="self-end justify-self-end">
                  <span className="text-2xl font-bold">{roundIndex + 1}</span>
                  <span className="text-muted-foreground text-xs">
                    /{photos.length}
                  </span>
                </span>
                <span className="ml-auto self-end justify-self-end text-2xl font-bold">
                  {rounds
                    .reduce((acc, round) => acc + (round.score || 0), 0)
                    .toLocaleString()}
                </span>
              </CardContent>
            </Card>
            <PhotoDialog
              imagePath={rounds[roundIndex].photo.image_path}
              isRoundOver={isRoundOver}
            />
            <ButtonGroup
              orientation="vertical"
              className="self-end justify-self-end"
            >
              <ButtonGroup orientation="vertical" className="ml-auto">
                <Button
                  disabled={!guessCoordinates}
                  onClick={goToGuessMarker}
                  size="icon-lg"
                  className="pointer-events-auto rounded-full"
                >
                  <LocateFixed />
                </Button>
                <Button
                  onClick={goToCenter}
                  size="icon-lg"
                  className="pointer-events-auto rounded-full"
                >
                  <Navigation />
                </Button>
              </ButtonGroup>
              <ButtonGroup>
                <Button
                  disabled={!guessCoordinates}
                  onClick={makeGuess}
                  size="lg"
                  className="pointer-events-auto rounded-full"
                >
                  <Send />
                  Make Guess
                </Button>
              </ButtonGroup>
            </ButtonGroup>
          </div>
        )}
      </Map>
    </>
  );
}
