import { LogOutIcon, MapPinIcon, MapPinXInsideIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  Map as MapLibreMap,
  type MapRef,
  Marker,
  Source,
} from "react-map-gl/maplibre";
import { PhotoDialog } from "@/components/photo-dialog";
import { ReportDialog } from "@/components/report-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { useGame } from "@/hooks/use-game";
import { useRoundResults } from "@/hooks/use-round-results";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import type { Coordinates } from "@/lib/types";

export function GameMap({ gameId }: { gameId: number }) {
  const game = useGame(gameId);
  const roundResults = useRoundResults(gameId);

  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [guess, setGuess] = useState<Coordinates | null>(null);
  const [isRoundOver, setIsRoundOver] = useState(false);

  const mapRef = useRef<MapRef>(null);

  return (
    <MapLibreMap
      ref={mapRef}
      cursor={cursor}
      initialViewState={{
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
        zoom: DEFAULT_ZOOM,
      }}
      onClick={(e) => {
        if (isRoundOver) return;

        const { lat: latitude, lng: longitude } = e.lngLat;

        setGuess({
          latitude,
          longitude,
        });
      }}
      onMouseDown={() => setCursor("grabbing")}
      onMouseMove={(e) => {
        const { lat: latitude, lng: longitude } = e.lngLat;

        setGuess({
          latitude,
          longitude,
        });
      }}
      onMouseUp={() => setCursor("crosshair")}
    >
      {isRoundOver ? (
        <div className="pointer-events-none absolute flex size-full flex-col justify-end gap-2 md:gap-4">
          {guess && (
            <Marker
              anchor="bottom"
              latitude={guess.latitude}
              longitude={guess.longitude}
            >
              <MapPinXInsideIcon fill="white" className="text-primary" />
            </Marker>
          )}
          <Marker
            anchor="bottom"
            latitude={rounds[roundIndex].photo.latitude}
            longitude={rounds[roundIndex].photo.longitude}
          >
            <MapPinCheckInsideIcon fill="white" className="text-green-500" />
          </Marker>
          <div className="flex items-center justify-between px-2 md:px-4">
            <PhotoDialog imageSrc={game.rounds[roundIndex].photo.objectKey} />
            <ReportDialog photoId={game.rounds[roundIndex].photo.id} />
          </div>
          <div className="pointer-events-auto grid grid-cols-3 gap-4 bg-background px-2 pt-2 pb-10 md:grid-cols-4 md:px-4 md:pt-4 md:pb-12">
            <div className="flex flex-col items-end">
              <span className="font-medium text-muted-foreground text-xs uppercase">
                Distance
              </span>
              <CountUp
                from={0}
                to={rounds[roundIndex].distance || 0}
                className="ml-auto font-semibold text-2xl"
              />
              m
            </div>
            <div className="flex flex-col items-end">
              <span className="font-medium text-muted-foreground text-xs uppercase">
                Round Score
              </span>
              <CountUp
                from={0}
                to={rounds[roundIndex].score || 0}
                className="ml-auto font-semibold text-2xl"
              />
            </div>
            <div className="flex flex-col items-end">
              <span className="font-medium text-muted-foreground text-xs uppercase">
                Total Score
              </span>
              <CountUp
                from={
                  rounds.reduce((acc, round) => acc + (round.score || 0), 0) -
                  (rounds[roundIndex].score || 0)
                }
                to={rounds.reduce((acc, round) => acc + (round.score || 0), 0)}
                className="ml-auto font-semibold text-2xl"
              />
            </div>
            <Button
              onClick={nextRound}
              size="lg"
              className="col-span-3 ml-auto w-fit hover:scale-105 md:col-span-1"
            >
              {roundIndex === game?.rounds.length - 1
                ? "Results"
                : "Next Round"}
              <SkipForwardIcon />
            </Button>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute grid h-dvh w-dvw grid-cols-2 grid-rows-2 px-2 pt-2 pb-10 md:px-4 md:pt-4 md:pb-12">
          {guess && (
            <Marker
              anchor="bottom"
              draggable={true}
              latitude={guess.latitude}
              longitude={guess.longitude}
              onDrag={(e) => {
                const { lat: latitude, lng: longitude } = e.lngLat;

                setGuess({
                  latitude,
                  longitude,
                });
              }}
            >
              <MapPinIcon className="fill-white text-primary" />
            </Marker>
          )}
          <Link href="/" className={buttonVariants({ size: "icon-lg" })}>
            <LogOutIcon className="rotate-180" />
          </Link>
          <Item className="pointer-events-auto self-start justify-self-end">
            <ItemContent>
              <ItemDescription>Round</ItemDescription>
              <ItemTitle>placeholder</ItemTitle>
            </ItemContent>
            <ItemContent>
              <ItemDescription>Points</ItemDescription>
              <ItemTitle>placeholder</ItemTitle>
            </ItemContent>
          </Item>
          <PhotoDialog objectKey={game.rounds.at(-1)?.photo?.objectKey} />
          <ButtonGroup
            orientation="vertical"
            className="self-end justify-self-end"
          >
            <ButtonGroup orientation="vertical" className="ml-auto">
              <GoToGuessButton guess={guess} />
              <GoToCenterButton />
            </ButtonGroup>
            <ButtonGroup>
              <SubmitGuessButton guess={guess} />
            </ButtonGroup>
          </ButtonGroup>
        </div>
      )}
    </MapLibreMap>
  );
}
