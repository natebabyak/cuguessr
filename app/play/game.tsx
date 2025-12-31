"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Check,
  Locate,
  LocateFixed,
  MapPinCheckInside,
  MapPinXInside,
  Navigation,
  SkipForward,
} from "lucide-react";
import { Coordinates, distanceInMeters, scoreFromDistance } from "@/lib/math";
import CountUp from "react-countup";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import Map, { Marker, useMap } from "react-map-gl/maplibre";
import { PhotoDialog } from "./photo-dialog";
import { ScoreCard } from "./score-card";
import { useState } from "react";

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
  const [score, setScore] = useState(0);

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
        {guessCoordinates && (
          <Marker
            latitude={guessCoordinates.latitude}
            longitude={guessCoordinates.longitude}
          >
            <MapPinXInside className="text-red-500" />
          </Marker>
        )}
        <div className="w-full px-2 absolute bottom-10 left-0">
          <Card>
            <CardContent className="flex justify-between">
              <div className="flex flex-col">
                <span>Distance</span>
                <CountUp
                  start={0}
                  end={distanceInMeters(answer, guessCoordinates!)}
                  suffix=" m"
                  className="ml-auto"
                />
              </div>
              <div className="flex flex-col">
                <span>Round Score</span>
                <CountUp start={0} end={100} className="ml-auto" />
              </div>
              <div className="flex flex-col">
                <span>Total Score</span>
                <CountUp start={0} end={score} className="ml-auto" />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setRound((prev) => prev + 1)}
                className="ml-auto"
              >
                <SkipForward />
                Next Round
              </Button>
            </CardFooter>
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
      <ScoreCard round={round} score={score} />
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
          <LocateFixedButton />
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

              const distance = distanceInMeters(guessCoordinates, answer);
              const roundScore = scoreFromDistance(distance);

              setScore((s) => s + roundScore);
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

  function LocateButton() {
    const { current: map } = useMap();

    const handleClick = () => {
      if (!map) return;

      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        map.flyTo({
          center: [longitude, latitude],
          zoom: 20,
        });
      });
    };

    return (
      <Button onClick={handleClick} size="icon" className="rounded-full">
        <Locate />
      </Button>
    );
  }

  function LocateFixedButton() {
    const { current: map } = useMap();

    const handleClick = () => {
      if (!guessCoordinates || !map) return;

      const { latitude, longitude } = guessCoordinates;

      map.flyTo({
        center: [longitude, latitude],
        zoom: 20,
      });
    };

    return (
      <Button disabled={!guessCoordinates} onClick={handleClick} size="icon">
        <LocateFixed />
      </Button>
    );
  }

  function NavigationButton() {
    const { current: map } = useMap();

    const handleClick = () => {
      if (!map) return;

      map.flyTo({
        center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
        zoom: DEFAULT_ZOOM,
      });
    };

    return (
      <Button onClick={handleClick} size="icon" className="rounded-full">
        <Navigation />
      </Button>
    );
  }
}
