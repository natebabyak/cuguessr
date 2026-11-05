import { Link } from "@tanstack/react-router";
import type { Feature, LineString } from "geojson";
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  MapPin,
  MapPinCheckInside,
  MapPinSearch,
  Navigation,
  Send,
} from "lucide-react";
import { animate } from "motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Layer, Marker, Source, type MapRef } from "react-map-gl/maplibre";

import { authClient } from "#/lib/auth-client";
import { DEFAULT_LAT, DEFAULT_LNG, DEFAULT_ZOOM } from "#/lib/constants";
import { submitGuessFn } from "#/lib/round-results.functions";
import type { Coordinates } from "#/lib/scoring";

import { AppMap } from "./app-map";
import CountUp from "./CountUp";
import { PhotoModal } from "./photo-modal";
import { ReportModal } from "./report-modal";
import { Results } from "./results";
import { Button, buttonVariants } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";
import { toast } from "./ui/toast";

type RoundResult = {
  roundId: number;
  distance: number;
  points: number;
  latitude: number;
  longitude: number;
  photo: Coordinates;
};

type Game = {
  id: number;
  date: string;
  rounds: {
    id: number;
    photo: { id: number; objectKey: string; height: number; width: number };
  }[];
};

export function DailyGame({
  game,
  savedRoundResults,
}: {
  game: Game;
  savedRoundResults: RoundResult[];
}) {
  const { data: session, isPending } = authClient.useSession();
  const sessionRequest = useRef(false);
  const submissionRequest = useRef(false);
  const mapRef = useRef<MapRef>(null);
  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [guess, setGuess] = useState<Coordinates | null>(null);
  const [roundResults, setRoundResults] = useState(savedRoundResults);
  const [roundIndex, setRoundIndex] = useState(() =>
    game.rounds.findIndex(
      (round) => !savedRoundResults.some((result) => result.roundId === round.id),
    ),
  );
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(true);
  const [showResults, setShowResults] = useState(roundIndex === -1);
  const [sessionError, setSessionError] = useState(false);

  async function createGuestSession() {
    if (sessionRequest.current) return;
    sessionRequest.current = true;
    setSessionError(false);
    try {
      const result = await authClient.signIn.anonymous();
      if (result.error) throw new Error(result.error.message);
    } catch {
      setSessionError(true);
      toast.add({ title: "Couldn’t start your game session. Please try again.", type: "error" });
    } finally {
      sessionRequest.current = false;
    }
  }

  useEffect(() => {
    if (!isPending && !session) void createGuestSession();
  }, [isPending, session]);

  const currentRound = game.rounds[roundIndex];
  const currentResult = roundResults.find((result) => result.roundId === currentRound?.id);
  const answer = isRoundOver ? currentResult?.photo : undefined;
  const totalPoints = roundResults.reduce((total, result) => total + result.points, 0);
  const hasRemainingRounds = game.rounds.some(
    (round) => !roundResults.some((result) => result.roundId === round.id),
  );

  const line = useMemo<Feature<LineString> | null>(() => {
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
  }, [guess, answer]);

  useEffect(() => {
    if (showResults || !isRoundOver || !guess || !answer || !mapRef.current) return;
    const map = mapRef.current;
    map.flyTo({ center: [guess.longitude, guess.latitude], zoom: 20, duration: 1000 });

    let animation: ReturnType<typeof animate> | undefined;
    const timeout = window.setTimeout(() => {
      animation = animate(0, 1, {
        duration: 2,
        ease: "easeInOut",
        onUpdate: (progress) => {
          if (map.getMap().getLayer("guess-line")) {
            map
              .getMap()
              .setPaintProperty("guess-line", "line-gradient", [
                "step",
                ["line-progress"],
                "#16a34a",
                progress,
                "rgba(0,0,0,0)",
              ]);
          }
        },
      });
      map.fitBounds(
        [
          [Math.min(guess.longitude, answer.longitude), Math.min(guess.latitude, answer.latitude)],
          [Math.max(guess.longitude, answer.longitude), Math.max(guess.latitude, answer.latitude)],
        ],
        {
          bearing: 0,
          maxZoom: 20,
          duration: 2000,
          padding: { top: 100, bottom: 260, left: 50, right: 50 },
        },
      );
    }, 1000);

    return () => {
      window.clearTimeout(timeout);
      animation?.stop();
    };
  }, [isRoundOver, guess, answer, showResults]);

  async function handleSubmitGuess() {
    if (!guess || !currentRound || !session || isRoundOver || submissionRequest.current) return;
    submissionRequest.current = true;
    setIsSubmitting(true);
    try {
      const result = await submitGuessFn({ data: { roundId: currentRound.id, ...guess } });
      setRoundResults((previous) => [
        ...previous.filter((r) => r.roundId !== result.roundId),
        result,
      ]);
      setGuess({ latitude: result.latitude, longitude: result.longitude });
      setIsPhotoOpen(false);
      setIsRoundOver(true);
    } catch {
      toast.add({ title: "Couldn’t save your guess. Please try again.", type: "error" });
    } finally {
      submissionRequest.current = false;
      setIsSubmitting(false);
    }
  }

  function nextRound() {
    if (!hasRemainingRounds) {
      setShowResults(true);
      return;
    }
    setRoundIndex(
      game.rounds.findIndex((round) => !roundResults.some((result) => result.roundId === round.id)),
    );
    setIsRoundOver(false);
    setGuess(null);
    setIsPhotoOpen(true);
    mapRef.current?.flyTo({
      center: [DEFAULT_LNG, DEFAULT_LAT],
      zoom: DEFAULT_ZOOM,
      bearing: 0,
      duration: 1000,
    });
  }

  if (showResults) {
    const orderedResults = game.rounds.flatMap((round) =>
      roundResults.filter((result) => result.roundId === round.id),
    );
    return <Results date={game.date} roundResults={orderedResults} />;
  }

  return (
    <AppMap
      ref={mapRef}
      cursor={cursor}
      initialViewState={{ latitude: DEFAULT_LAT, longitude: DEFAULT_LNG, zoom: DEFAULT_ZOOM }}
      onClick={(event) => {
        if (!isRoundOver && !isSubmitting)
          setGuess({ latitude: event.lngLat.lat, longitude: event.lngLat.lng });
      }}
      onMouseDown={() => setCursor("grabbing")}
      onMouseUp={() => setCursor("crosshair")}
      onMouseOut={() => setCursor("crosshair")}
    >
      {guess && (
        <Marker
          anchor="bottom"
          draggable={!isRoundOver && !isSubmitting}
          latitude={guess.latitude}
          longitude={guess.longitude}
          onClick={(event) => event.originalEvent.stopPropagation()}
          onDrag={(event) => {
            if (!isRoundOver && !isSubmitting)
              setGuess({ latitude: event.lngLat.lat, longitude: event.lngLat.lng });
          }}
        >
          <MapPin
            aria-label="Your guess"
            className="text-primary size-8 fill-white dark:fill-black"
          />
        </Marker>
      )}
      {answer && line && (
        <>
          <Marker anchor="bottom" latitude={answer.latitude} longitude={answer.longitude}>
            <MapPinCheckInside
              aria-label="Correct location"
              className="size-8 fill-white text-green-500 dark:fill-black"
            />
          </Marker>
          <Source id="guess-line-source" type="geojson" lineMetrics data={line}>
            <Layer
              id="guess-line"
              type="line"
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={{
                "line-width": 3,
                "line-gradient": ["step", ["line-progress"], "#16a34a", 0, "rgba(0,0,0,0)"],
              }}
            />
          </Source>
        </>
      )}
      <Link to="/" className={buttonVariants({ size: "lg", className: "absolute top-4 left-4" })}>
        <ArrowLeft />
        Back
      </Link>
      {!isRoundOver && (
        <Item variant="outline" className="bg-card absolute top-4 right-4 w-fit gap-6 shadow-md">
          <ItemContent>
            <ItemDescription>Round</ItemDescription>
            <ItemTitle className="text-2xl">
              {roundIndex + 1}/{game.rounds.length}
            </ItemTitle>
          </ItemContent>
          <ItemContent>
            <ItemDescription>Points</ItemDescription>
            <ItemTitle className="text-2xl">{totalPoints.toLocaleString()}</ItemTitle>
          </ItemContent>
        </Item>
      )}
      {!isRoundOver && currentRound?.photo && (
        <div className="absolute bottom-12 left-4">
          <PhotoModal
            key={currentRound.id}
            {...currentRound.photo}
            open={isPhotoOpen}
            onOpenChange={setIsPhotoOpen}
            triggerClassName=""
          />
        </div>
      )}
      {!isRoundOver && (
        <div className="absolute right-4 bottom-12 flex flex-col items-end gap-3">
          <ButtonGroup orientation="vertical">
            <Button
              disabled={!guess}
              title="Go to marker"
              aria-label="Go to marker"
              onClick={() =>
                guess &&
                mapRef.current?.flyTo({ center: [guess.longitude, guess.latitude], zoom: 20 })
              }
            >
              <MapPinSearch />
            </Button>
            <Button
              title="Recenter"
              aria-label="Recenter"
              onClick={() =>
                mapRef.current?.flyTo({
                  center: [DEFAULT_LNG, DEFAULT_LAT],
                  zoom: DEFAULT_ZOOM,
                  bearing: 0,
                })
              }
            >
              <Navigation />
            </Button>
          </ButtonGroup>
          {sessionError ? (
            <Button onClick={() => void createGuestSession()}>Retry sign-in</Button>
          ) : (
            <Button
              disabled={!guess || isSubmitting || isPending || !session}
              onClick={() => void handleSubmitGuess()}
              size="lg"
              className="shadow-md"
            >
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Send />}Submit Guess
            </Button>
          )}
        </div>
      )}
      {isRoundOver && currentResult && (
        <div className="absolute right-4 bottom-12 left-4 grid gap-3" aria-live="polite">
          {currentRound?.photo && (
            <div className="flex gap-3">
              <PhotoModal
                {...currentRound.photo}
                open={isPhotoOpen}
                onOpenChange={setIsPhotoOpen}
                triggerClassName=""
              />
              <ReportModal key={currentRound.id} photoId={currentRound.photo.id} />
            </div>
          )}
          <Item variant="outline" className="bg-card grid grid-cols-3 shadow-md md:grid-cols-4">
            <ItemContent>
              <ItemDescription>Distance</ItemDescription>
              <ItemTitle>
                <CountUp to={Math.round(currentResult.distance)} /> m
              </ItemTitle>
            </ItemContent>
            <ItemContent>
              <ItemDescription>Points</ItemDescription>
              <ItemTitle>
                <CountUp to={currentResult.points} />
              </ItemTitle>
            </ItemContent>
            <ItemContent>
              <ItemDescription>Total Points</ItemDescription>
              <ItemTitle>
                <CountUp from={totalPoints - currentResult.points} to={totalPoints} />
              </ItemTitle>
            </ItemContent>
            <Button onClick={nextRound} size="lg" className="col-span-3 md:col-span-1">
              {hasRemainingRounds ? "Next Round" : "Results"}
              <ArrowRight />
            </Button>
          </Item>
        </div>
      )}
    </AppMap>
  );
}
