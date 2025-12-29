"use client";

import Map from "react-map-gl/maplibre";
import { useState } from "react";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import { ScoreCard } from "./score-card";
import { Coordinates } from "@/lib/math";
import { ButtonGroup } from "@/components/ui/button-group";
import { GuessButton } from "./guess-button";
import { NavigationButton } from "./navigation-button";
import { LocateButton } from "./locate-button";
import { LocateFixedButton } from "./locate-fixed-button";

interface GameProps {
  photos: {
    id: number;
    imageUrl: string;
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
  const [round, setRound] = useState<number>(1);
  const [score, setScore] = useState<number>(0);

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
          <GuessButton />
        </ButtonGroup>
      </ButtonGroup>
    </Map>
  );
}
