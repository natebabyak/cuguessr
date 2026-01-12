"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  LocateFixed,
  MapPinCheckInside,
  MapPinXInside,
  SkipForward,
} from "lucide-react";
import { calculateDistance, calculateScore, Coordinates } from "@/lib/math";
import CountUp from "react-countup";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import Map, { Layer, Marker, Source } from "react-map-gl/maplibre";
import { PhotoDialog } from "./photo-dialog";
import { useState } from "react";
import { NavigationButton } from "./navigation-button";
import { LocateButton } from "./locate-button";
import { LocateFixedButton } from "./locate-fixed-button";

interface GameProps {
  photos: {
    id: string;
    image_path: string;
    latitude: number;
    longitude: number;
  }[];
}

export function Game({ photos }: GameProps) {
  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [cursorCoordinates, setCursorCoordinates] =
    useState<Coordinates | null>(null);
  const [guessCoordinates, setGuessCoordinates] = useState<Coordinates | null>(
    null
  );
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [round, setRound] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [score, setScore] = useState(0);

  if (isRoundOver) {
    const photo = photos[round];
    const answerCoordinates = {
      latitude: photo.latitude,
      longitude: photo.longitude,
    };

    const lineGeoJson = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [guessCoordinates!.longitude, guessCoordinates!.latitude],
          [answerCoordinates.longitude, answerCoordinates.latitude],
        ],
      },
    } as unknown as string;

    return (
      <Map
        initialViewState={{
          latitude: answerCoordinates.latitude,
          longitude: answerCoordinates.longitude,
          zoom: 0,
        }}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
      >
        <Marker
          anchor="bottom"
          latitude={photo.latitude}
          longitude={photo.longitude}
        >
          <MapPinCheckInside className="text-green-500" />
        </Marker>
        {guessCoordinates && (
          <Marker
            anchor="bottom"
            latitude={guessCoordinates.latitude}
            longitude={guessCoordinates.longitude}
          >
            <MapPinXInside className="text-red-500" />
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
        <div className="w-full px-2 absolute bottom-10 left-0 md:max-w-94">
          <Card>
            <CardContent className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">
                  Distance
                </span>
                <CountUp
                  start={0}
                  end={calculateDistance(answerCoordinates, guessCoordinates!)}
                  suffix=" m"
                  className="ml-auto text-2xl font-semibold"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">
                  Round Score
                </span>
                <CountUp
                  start={0}
                  end={roundScore}
                  className="ml-auto text-2xl font-semibold"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Score
                </span>
                <CountUp
                  start={score}
                  end={score + roundScore}
                  className="ml-auto text-2xl font-semibold"
                />
              </div>
              <Button
                onClick={() => {
                  setGuessCoordinates(null);
                  setIsRoundOver(false);
                  setRound((prev) => prev + 1);
                  setScore((prev) => prev + roundScore);
                }}
                className="ml-auto"
              >
                Next Round
                <SkipForward />
              </Button>
            </CardContent>
          </Card>
        </div>
      </Map>
    );
  }

  return (
    <Map
      cursor={cursor}
      initialViewState={{
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
        zoom: DEFAULT_ZOOM,
      }}
      mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
      onClick={(e) => {
        const { lat, lng } = e.lngLat;
        setGuessCoordinates({
          latitude: lat,
          longitude: lng,
        });
      }}
      onMouseDown={() => setCursor("grabbing")}
      onMouseMove={(e) => {
        const { lat, lng } = e.lngLat;
        setCursorCoordinates({
          latitude: lat,
          longitude: lng,
        });
      }}
      onMouseUp={() => setCursor("crosshair")}
    >
      <Card className="absolute top-2 right-2 md:right-4 md:top-4 z-10">
        <CardContent className="flex gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-lg font-medium">Round</span>
            <div className="flex ml-auto items-end">
              <span className="text-2xl font-bold">{round + 1}</span>
              <span className="text-muted-foreground text-sm">/5</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-lg font-medium">Score</span>
            <span className="text-2xl font-bold ml-auto">
              {score.toLocaleString("en-us")}
            </span>
          </div>
        </CardContent>
      </Card>
      {guessCoordinates && (
        <Marker
          draggable={true}
          latitude={guessCoordinates.latitude}
          longitude={guessCoordinates.longitude}
          onDrag={() => {
            setGuessCoordinates(cursorCoordinates);
          }}
        >
          <LocateFixed className="text-primary" />
        </Marker>
      )}
      <PhotoDialog imagePath={photos[round].image_path} />
      <ButtonGroup
        orientation="vertical"
        className="absolute right-2 bottom-10 md:right-4 md:bottom-12"
      >
        <ButtonGroup orientation="vertical" className="ml-auto">
          <LocateButton />
          <LocateFixedButton guessCoordinates={guessCoordinates} />
          <NavigationButton />
        </ButtonGroup>
        <ButtonGroup>
          <Button
            disabled={!guessCoordinates}
            onClick={() => {
              if (!guessCoordinates) return;

              const photo = photos[round];
              const answer = {
                latitude: photo.latitude,
                longitude: photo.longitude,
              };

              const distance = calculateDistance(guessCoordinates, answer);
              setRoundScore(calculateScore(distance));
              setIsRoundOver(true);
            }}
            className="rounded-full"
          >
            <Check />
            Make Guess
          </Button>
        </ButtonGroup>
      </ButtonGroup>
    </Map>
  );
}
