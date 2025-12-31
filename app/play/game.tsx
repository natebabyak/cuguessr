"use client";

import Map, { MapLayerMouseEvent, Marker } from "react-map-gl/maplibre";
import { useState } from "react";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import { ScoreCard } from "./score-card";
import { Coordinates, distanceInMeters, scoreFromDistance } from "@/lib/math";
import { ButtonGroup } from "@/components/ui/button-group";
import { GuessButton } from "./guess-button";
import { NavigationButton } from "./navigation-button";
import { LocateButton } from "./locate-button";
import { LocateFixedButton } from "./locate-fixed-button";
import { GuessMarker } from "./guess-marker";
import { PhotoDialog } from "./photo-dialog";
import { MapPinCheckInside, MapPinXInside } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CountUp from "react-countup";

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
  const [guess, setGuess] = useState<Coordinates | null>(null);
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);

  const handleClick = (event: MapLayerMouseEvent) => {
    const { lat, lng } = event.lngLat;
    setGuess({ latitude: lat, longitude: lng });
  };

  const handleMouseDown = () => {
    setCursor("grabbing");
  };

  const handleMouseMove = (event: MapLayerMouseEvent) => {
    const { lat, lng } = event.lngLat;
    setCursorCoordinates({ latitude: lat, longitude: lng });
  };

  const handleMouseUp = () => {
    setCursor("crosshair");
  };

  const handleGuess = () => {
    if (!guess) return;

    const photo = photos[round];
    const answer = {
      latitude: photo.latitude,
      longitude: photo.longitude,
    };

    const distance = distanceInMeters(guess, answer);
    const roundScore = scoreFromDistance(distance);

    setScore((s) => s + roundScore);
    setIsRoundOver(true);
  };

  if (isRoundOver) {
    const photo = photos[round];
    const answer = {
      latitude: photo.latitude,
      longitude: photo.longitude,
    };

    return (
      <Map
        cursor="none"
        initialViewState={{
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
          zoom: 0,
        }}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
      >
        <Marker latitude={photo.latitude} longitude={photo.longitude}>
          <MapPinCheckInside className="text-green-500" />
        </Marker>
        {guess && (
          <Marker latitude={guess.latitude} longitude={guess.longitude}>
            <MapPinXInside className="text-red-500" />
          </Marker>
        )}
        <div className="w-full px-2 absolute bottom-10 left-0">
          <Card>
            <CardContent className="flex justify-between">
              <div>
                <span>Distance</span>
                <CountUp
                  start={0}
                  end={distanceInMeters(answer, guess!)}
                  suffix="m"
                />
              </div>
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
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <ScoreCard round={round} score={score} />
      <GuessMarker
        cursorCoordinates={cursorCoordinates}
        guessCoordinates={guess}
        setGuessCoordinates={setGuess}
      />
      <PhotoDialog imagePath={photos[round].image_path} />
      <ButtonGroup
        orientation="vertical"
        className="absolute right-2 bottom-10 md:right-4 md:bottom-12"
      >
        <ButtonGroup orientation="vertical" className="ml-auto">
          <LocateButton />
          <LocateFixedButton guessCoordinates={guess} />
          <NavigationButton />
        </ButtonGroup>
        <ButtonGroup>
          <GuessButton guessCoordinates={guess} handleClick={handleGuess} />
        </ButtonGroup>
      </ButtonGroup>
    </Map>
  );
}
