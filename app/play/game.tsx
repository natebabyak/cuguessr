"use client";

import Map, { useMap } from "react-map-gl/maplibre";
// @ts-expect-error CSS import
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const EARTH_RADIUS = 6371000;
const SIGMA = 100;
const CARLETON_LATITUDE = 45.3866786;
const CARLETON_LONGITUDE = -75.697256;

interface Coordinates {
  latitude: number;
  longitude: number;
}

function rad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function hav(theta: number): number {
  return Math.pow(Math.sin(theta / 2), 2);
}

function d(pointA: Coordinates, pointB: Coordinates): number {
  return (
    2 *
    EARTH_RADIUS *
    Math.asin(
      Math.sqrt(
        hav(rad(pointB.latitude - pointA.latitude)) +
          Math.cos(rad(pointA.latitude)) *
            Math.cos(rad(pointB.latitude)) *
            hav(rad(pointB.longitude - pointA.longitude))
      )
    )
  );
}

function score(answer: Coordinates, guess: Coordinates): number {
  const distance = d(answer, guess);
  return 5000 * Math.exp(-0.5 * Math.pow(distance / SIGMA, 2));
}

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
          latitude: CARLETON_LATITUDE,
          longitude: CARLETON_LONGITUDE,
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
        center: [CARLETON_LONGITUDE, CARLETON_LATITUDE],
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
