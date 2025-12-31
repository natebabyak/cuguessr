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
  const [guessCoordinates, setGuessCoordinates] = useState<Coordinates | null>(
    null
  );
  const [isRoundOver, setIsRoundOver] = useState(true);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);

  const handleClick = (event: MapLayerMouseEvent) => {
    const { lat, lng } = event.lngLat;
    setGuessCoordinates({ latitude: lat, longitude: lng });
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
    if (!guessCoordinates) return;

    const photo = photos[round - 1];
    const answer = {
      latitude: photo.latitude,
      longitude: photo.longitude,
    };

    const distance = distanceInMeters(guessCoordinates, answer);
    const roundScore = scoreFromDistance(distance);

    setScore((s) => s + roundScore);
    setIsRoundOver(true);
  };

  if (isRoundOver) {
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
        <Marker
          latitude={photos[round].latitude}
          longitude={photos[round].longitude}
        >
          <MapPinCheckInside className="text-green-500" />
        </Marker>
        {guessCoordinates && (
          <Marker
            latitude={guessCoordinates.latitude}
            longitude={guessCoordinates.longitude}
          >
            <MapPinXInside className="text-red-500" />
          </Marker>
        )}
        <div className="w-full px-2 absolute bottom-2 left-0">
          <Card>
            <CardContent className="flex justify-between">
              <div>
                <span>Distance</span>
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
        guessCoordinates={guessCoordinates}
        setGuessCoordinates={setGuessCoordinates}
      />
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
          <GuessButton
            guessCoordinates={guessCoordinates}
            handleClick={handleGuess}
          />
        </ButtonGroup>
      </ButtonGroup>
    </Map>
  );
}
