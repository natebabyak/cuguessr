"use client";

import Map, { useMap } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "@/lib/constants";

interface GameProps {
  photos: {
    id: number;
    imageUrl: string;
    latitude: number;
    longitude: number;
  }[];
}

export function Game({ photos }: GameProps) {
  const [round, setRound] = useState<number>(1);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {});

  return (
    <>
      <Scoreboard round={round} score={score} />
      <Map
        initialViewState={{
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
          zoom: 15,
        }}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
      >
        <NavigationButton />
      </Map>
    </>
  );
}

interface ScoreboardProps {
  round: number;
  score: number;
}

function Scoreboard({ round, score }: ScoreboardProps) {
  return (
    <Card>
      <CardContent>
        <span>Round</span>
        <span>{round}</span>
        <span>Score</span>
        <span>{score}</span>
      </CardContent>
    </Card>
  );
}

function NavigationButton() {
  const { current: map } = useMap();

  const handleClick = () => {
    if (map) {
      map.flyTo({
        center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      size="icon"
      className="cursor-pointer absolute rounded-full z-10 right-4 bottom-12"
    >
      <Navigation />
    </Button>
  );
}
