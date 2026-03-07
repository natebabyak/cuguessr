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
import { calculateDistance, calculateScore, Coordinates } from "@/lib/math";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import { Layer, Map, Marker, Source } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import { PhotoDialog } from "./photo-dialog";
import { useEffect, useState, useRef } from "react";
import { ResultsScreen } from "./results-screen";
import { Round } from "@/lib/types";
import CountUp from "react-countup";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";

const mapStyle = `https://api.maptiler.com/maps/streets-v4/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`;

interface GameProps {
  photos: {
    id: string;
    image_path: string;
    latitude: number;
    longitude: number;
  }[];
}

export function Game({ photos }: GameProps) {
  const [cursor, setCursor] = useState<"default" | "crosshair" | "grabbing">(
    "crosshair",
  );
  const [cursorCoordinates, setCursorCoordinates] =
    useState<Coordinates | null>(null);
  const [guessCoordinates, setGuessCoordinates] = useState<Coordinates | null>(
    null,
  );
  const [rounds, setRounds] = useState<Round[]>([
    ...photos.map((photo) => ({
      photo: photo,
      guessCoordinates: null,
      distance: null,
      score: null,
    })),
  ]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [isRoundOver, setIsRoundOver] = useState(false);
  const map = useRef<MapRef>(null);

  useEffect(() => {
    if (!isRoundOver || !guessCoordinates || !map.current) return;

    const answerCoordinates = {
      latitude: rounds[roundIndex].photo.latitude,
      longitude: rounds[roundIndex].photo.longitude,
    };

    const minLat = Math.min(
      guessCoordinates.latitude,
      answerCoordinates.latitude,
    );
    const maxLat = Math.max(
      guessCoordinates.latitude,
      answerCoordinates.latitude,
    );
    const minLng = Math.min(
      guessCoordinates.longitude,
      answerCoordinates.longitude,
    );
    const maxLng = Math.max(
      guessCoordinates.longitude,
      answerCoordinates.longitude,
    );

    map.current?.flyTo({
      center: [guessCoordinates.longitude, guessCoordinates.latitude],
      zoom: DEFAULT_ZOOM,
      duration: 1000,
      easing(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      },
    });

    setTimeout(() => {
      map.current?.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          bearing: 0,
          duration: 2000,
          easing(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          },
          padding: {
            top: 100,
            bottom: 200,
            left: 50,
            right: 50,
          },
        },
      );
    }, 1000);
  }, [isRoundOver, guessCoordinates, rounds, roundIndex]);

  if (roundIndex >= rounds.length) {
    return <ResultsScreen rounds={rounds} />;
  }

  const lineGeoJson = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [guessCoordinates?.longitude, guessCoordinates?.latitude],
        [rounds[roundIndex].photo.longitude, rounds[roundIndex].photo.latitude],
      ],
    },
  } as unknown as string;

  function placeGuessMarker(e: MapLayerMouseEvent) {
    if (isRoundOver) return;

    const { lngLat } = e;
    setGuessCoordinates({
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    });
  }

  function updateCursorCoordinates(e: MapLayerMouseEvent) {
    const { lat, lng } = e.lngLat;
    setCursorCoordinates({
      latitude: lat,
      longitude: lng,
    });
  }

  function goToGuessMarker() {
    if (!guessCoordinates || !map.current) return;

    const { latitude, longitude } = guessCoordinates;

    map.current.flyTo({
      center: [longitude, latitude],
      zoom: 20,
    });
  }

  function goToCenter() {
    if (!map.current) return;

    map.current.flyTo({
      center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
      zoom: DEFAULT_ZOOM,
    });
  }

  return (
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
        <div className="pointer-events-none absolute flex size-full flex-col justify-end">
          <Marker
            anchor="bottom"
            latitude={rounds[roundIndex].photo.latitude}
            longitude={rounds[roundIndex].photo.longitude}
          >
            <MapPinCheckInside fill="white" className="text-green-500" />
          </Marker>
          {guessCoordinates && (
            <Marker
              anchor="bottom"
              latitude={guessCoordinates.latitude}
              longitude={guessCoordinates.longitude}
            >
              <MapPinXInside fill="white" className="text-red-500" />
            </Marker>
          )}
          {lineGeoJson && (
            <Source id="guess-line" type="geojson" data={lineGeoJson}>
              <Layer
                id="guess-line-layer"
                type="line"
                paint={{
                  "line-color": "#000",
                  "line-width": 2,
                  "line-dasharray": [2, 2],
                }}
              />
            </Source>
          )}
          <div className="bg-background pointer-events-auto flex items-center justify-between px-2 pt-2 pb-10 md:px-4 md:pt-4 md:pb-12">
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-sm font-medium">
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
              <span className="text-muted-foreground text-sm font-medium">
                Round Score
              </span>
              <CountUp
                start={0}
                end={rounds[roundIndex].score || 0}
                className="ml-auto text-2xl font-semibold"
              />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-sm font-medium">
                Total Score
              </span>
              <CountUp
                start={
                  rounds.reduce((acc, round) => acc + (round.score || 0), 0) -
                  (rounds[roundIndex].score || 0)
                }
                end={rounds.reduce((acc, round) => acc + (round.score || 0), 0)}
                className="ml-auto text-2xl font-semibold"
              />
            </div>
            <Button onClick={() => {}} size="sm">
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
              onDrag={() => {
                setGuessCoordinates(cursorCoordinates);
              }}
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
                {rounds.reduce((acc, round) => acc + (round.score || 0), 0)}
              </span>
            </CardContent>
          </Card>
          <PhotoDialog imagePath={rounds[roundIndex].photo.image_path} />
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
                onClick={() => {
                  if (!guessCoordinates) return;

                  const { latitude, longitude } = rounds[roundIndex].photo;

                  const answerCoordinates = {
                    latitude: latitude,
                    longitude: longitude,
                  };

                  const distance = calculateDistance(
                    guessCoordinates,
                    answerCoordinates,
                  );

                  setRounds((prev) => {
                    const newRounds = [...prev];
                    newRounds[roundIndex] = {
                      ...newRounds[roundIndex],
                      guessCoordinates,
                      distance,
                      score: calculateScore(distance),
                    };
                    return newRounds;
                  });

                  setIsRoundOver(true);
                  setGuessCoordinates(null);
                }}
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
  );
}
