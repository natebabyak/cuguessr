import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { cn } from "cn";
import { ArrowLeft, MapPin, MapPinSearch, Navigation, Send } from "lucide-react";
import { useState } from "react";
import { Marker } from "react-map-gl/maplibre";

import { AppMap } from "#/components/app-map";
import CountUp from "#/components/CountUp";
import { PhotoModal } from "#/components/photo-modal";
import { Results } from "#/components/results";
import { Button, buttonVariants } from "#/components/ui/button";
import { ButtonGroup } from "#/components/ui/button-group";
import { Item, ItemContent, ItemDescription, ItemSeparator, ItemTitle } from "#/components/ui/item";
import { ensureSession } from "#/lib/auth.functions";
import { DEFAULT_LAT, DEFAULT_LNG, DEFAULT_ZOOM } from "#/lib/constants";
import { getGameFn } from "#/lib/game.functions";
import { getRoundResultsFn } from "#/lib/round-results.functions";

export const Route = createFileRoute("/daily/$date")({
  loader: async ({ params }) => {
    const session = await ensureSession();

    const game = await getGameFn({
      data: {
        date: params.date,
      },
    });

    if (!game) throw notFound();

    const roundResults = await getRoundResultsFn({
      data: {
        gameId: game.id,
        userId: session.user.id,
      },
    });

    return { game, roundResults };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { date } = Route.useParams();
  const { game, roundResults } = Route.useLoaderData();

  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [guessCoords, setGuessCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [roundIndex, setRoundIndex] = useState(roundResults.length);

  if (roundResults.length >= 5) {
    return <Results date={date} roundResults={roundResults} />;
  }

  return (
    <AppMap
      cursor={cursor}
      initialViewState={{
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LNG,
        zoom: DEFAULT_ZOOM,
      }}
      onClick={(e) => {
        if (isRoundOver) return;

        const { lat: latitude, lng: longitude } = e.lngLat;

        setGuessCoords({
          lat: latitude,
          lng: longitude,
        });
      }}
      onMouseDown={() => setCursor("grabbing")}
      onMouseUp={() => setCursor("crosshair")}
    >
      {guessCoords && (
        <Marker
          anchor="bottom"
          draggable={!isRoundOver}
          latitude={guessCoords.lat}
          longitude={guessCoords.lng}
          onDrag={(e) => {
            if (isRoundOver) return;

            const { lat: latitude, lng: longitude } = e.lngLat;

            setGuessCoords({
              lat: latitude,
              lng: longitude,
            });
          }}
        >
          <MapPin className="fill-primary text-primary size-8" />
        </Marker>
      )}
      <Link
        to="/"
        className={cn(
          "left-4 top-4 absolute",
          buttonVariants({
            size: "lg",
          }),
        )}
      >
        <ArrowLeft />
        Back
      </Link>
      <Item variant="outline" className="bg-card absolute top-4 right-4 w-50 shadow-md">
        <ItemContent>
          <ItemTitle className="text-muted-foreground text-xs font-bold uppercase">Round</ItemTitle>
          <ItemDescription className="text-primary-foreground text-2xl font-black tracking-widest italic">
            <CountUp from={roundIndex} to={roundIndex + 1} />
            /5
          </ItemDescription>
        </ItemContent>
        <ItemSeparator orientation="vertical" />
        <ItemContent>
          <ItemTitle className="text-muted-foreground ml-auto text-xs font-bold uppercase">
            Score
          </ItemTitle>
          <ItemDescription className="text-primary-foreground ml-auto text-2xl font-black tracking-widest italic">
            <CountUp to={roundResults.reduce((sum, result) => sum + result.points, 0)} />
          </ItemDescription>
        </ItemContent>
      </Item>
      {game.rounds[roundIndex].photo && (
        <PhotoModal
          objectKey={game.rounds[roundIndex].photo.objectKey}
          height={game.rounds[roundIndex].photo.height}
          width={game.rounds[roundIndex].photo.width}
        />
      )}
      <div className="absolute right-4 bottom-12 flex flex-col">
        <ButtonGroup orientation="vertical">
          <Button>
            <MapPinSearch />
          </Button>
          <Button>
            <Navigation />
          </Button>
        </ButtonGroup>
        <Button disabled size="lg" className="shadow-md">
          <Send />
          Submit Guess
        </Button>
      </div>
      {isRoundOver ? <div></div> : <div></div>}
    </AppMap>
  );
}
