import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  MapPinCheckInsideIcon,
  MapPinIcon,
  MapPinXInsideIcon,
  Share2Icon,
  SkipForwardIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Marker } from "react-map-gl/maplibre";
import z from "zod";
import { AppMap } from "#/components/app-map";
import CountUp from "#/components/CountUp";
import { GoToCenterButton } from "#/components/go-to-center-button";
import { GoToMarkerButton } from "#/components/go-to-marker-button";
import { MapOverlay } from "#/components/map-overlay";
import { PhotoDialog } from "#/components/photo-dialog";
import { ReportDialog } from "#/components/report-dialog";
import { SubmitGuessButton } from "#/components/submit-guess-button";
import { Button, buttonVariants } from "#/components/ui/button";
import { ButtonGroup } from "#/components/ui/button-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "#/components/ui/item";
import { Separator } from "#/components/ui/separator";
import { Spinner } from "#/components/ui/spinner";
import { toast } from "#/components/ui/toast";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "#/lib/constants";
import { getGameByDate } from "#/lib/game/functions";
import { gameResultQueryOptions } from "#/lib/game-result/queries";
import { submitGuess } from "#/lib/round-result/functions";
import { roundResultsQueryOptions } from "#/lib/round-result/queries";
import type { Coordinates } from "#/lib/types";

const MIN_DATE = "2026-08-29";

const MAX_DATE = Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
}).format(Date.now());

const paramsSchema = z.object({
  date: z.iso
    .date()
    .refine(
      (value) => value >= MIN_DATE && value <= MAX_DATE,
      `Date must be between ${MIN_DATE} and ${MAX_DATE}`,
    ),
});

export const Route = createFileRoute("/daily/$date")({
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: (params) => ({ date: params.date }),
  },
  loader: async ({ params }) => {
    const game = await getGameByDate({
      data: {
        date: params.date,
      },
    });

    return { game };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { game } = Route.useLoaderData();

  const gameId = game?.id;

  const { data: roundResults } = useQuery(
    roundResultsQueryOptions(gameId as number),
  );

  const { data: gameResult } = useQuery(
    gameResultQueryOptions(gameId as number),
  );

  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [guess, setGuess] = useState<Coordinates | null>(null);
  const [cursorCoords, setCursorCoords] = useState<Coordinates | null>(null);
  const [isRoundOver, setIsRoundOver] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);

  const isGameOver = useMemo(() => roundIndex > 4, [roundIndex]);

  if (!game || !roundResults) return <Spinner />;

  if (isGameOver)
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <div className="fade-in-0 slide-in-from-bottom-5 flex w-full max-w-sm animate-in flex-col gap-4 duration-700">
          <h1 className="text-center font-black text-4xl">
            <span className="text-primary">cu</span>
            Guessr
          </h1>
          <p className="text-center font-medium text-2xl">
            {gameResult?.points} points
          </p>
          <div className="mx-auto flex w-full max-w-xs flex-col gap-2">
            {game?.rounds.map((round, roundIndex) => (
              <Item key={round.id} variant="outline">
                <ItemMedia variant="icon">EMOJI</ItemMedia>
                <ItemContent className="grid grid-cols-2 grid-rows-2">
                  <ItemTitle className="col-span-2 justify-start justify-self-start">
                    Round {roundIndex + 1}
                  </ItemTitle>
                  <span className="self-end justify-self-start text-muted-foreground">
                    {roundResults?.[roundIndex].distance?.toLocaleString(
                      "en-CA",
                      {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      },
                    ) ?? 0}
                    m
                  </span>
                  <span className="justify-end justify-self-end text-muted-foreground">
                    {roundResults?.[roundIndex]?.points?.toLocaleString() ??
                      "0"}{" "}
                    points
                  </span>
                </ItemContent>
              </Item>
            ))}
          </div>
          <div className="grid w-full grid-cols-1 grid-rows-2 gap-2 px-2">
            <Button
              onClick={async () => {
                const shareText = `cuGuessr #${gameId}\n\n${gameResult?.points} points \nhttps://cuguessr.com/daily`;

                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: `cuGuessr #${gameId}`,
                      text: shareText,
                    });
                  } catch {}
                } else {
                  try {
                    await navigator.clipboard.writeText(shareText);
                    toast.add({ title: "Copied to clipboard!" });
                  } catch {
                    toast.add({
                      title: "Something went wrong. Please try again.",
                    });
                  }
                }
              }}
              size="lg"
              variant="default"
              className="rounded-full"
            >
              <Share2Icon />
              Share Results
            </Button>
            )
            <Link
              to="/"
              className={buttonVariants({ size: "lg", variant: "ghost" })}
            >
              <ArrowLeftIcon />
              Back to Home
            </Link>
            <div>
              <Separator className="flex-1" />
              <span>
                <ArrowDownIcon />
                Scroll down to compare
              </span>
              <Separator className="flex-1" />
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <AppMap
      cursor={cursor}
      initialViewState={{
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
        zoom: DEFAULT_ZOOM,
      }}
      maxZoom={18}
      onClick={(e) => {
        if (isRoundOver) return;
        const { lat: latitude, lng: longitude } = e.lngLat;
        setGuess({ latitude, longitude });
      }}
      onMouseDown={() => setCursor("grabbing")}
      onMouseMove={(e) => {
        const { lat: latitude, lng: longitude } = e.lngLat;
        setCursorCoords({ latitude, longitude });
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
            latitude={roundResults[roundIndex].latitude ?? 0}
            longitude={roundResults[roundIndex].longitude ?? 0}
          >
            <MapPinCheckInsideIcon fill="white" className="text-green-600" />
          </Marker>
          <div className="flex items-center justify-between px-2 md:px-4">
            {game?.rounds[roundIndex].photo?.objectKey && (
              <PhotoDialog
                objectKey={game.rounds[roundIndex].photo.objectKey}
                height={game.rounds[roundIndex].photo.height}
                width={game.rounds[roundIndex].photo.width}
              />
            )}
            {game?.rounds[roundIndex].photoId && (
              <ReportDialog photoId={game.rounds[roundIndex].photoId} />
            )}
          </div>
          <div className="pointer-events-auto grid grid-cols-3 gap-4 bg-background px-2 pt-2 pb-10 md:grid-cols-4 md:px-4 md:pt-4 md:pb-12">
            <div className="flex flex-col items-end">
              <span className="font-medium text-muted-foreground text-xs uppercase">
                Distance
              </span>
              <CountUp
                from={0}
                to={roundResults[roundIndex].distance ?? 0}
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
                to={roundResults?.[roundIndex].points ?? 0}
                className="ml-auto font-semibold text-2xl"
              />
            </div>
            <div className="flex flex-col items-end">
              <span className="font-medium text-muted-foreground text-xs uppercase">
                Total Score
              </span>
              <CountUp
                from={
                  (roundResults?.reduce(
                    (acc, result) => acc + (result.points ?? 0),
                    0,
                  ) ?? 0) - (roundResults?.[roundIndex].points ?? 0)
                }
                to={
                  roundResults?.reduce(
                    (acc, result) => acc + (result.points ?? 0),
                    0,
                  ) ?? 0
                }
                className="ml-auto font-semibold text-2xl"
              />
            </div>
            <Button
              onClick={() => {}}
              size="lg"
              className="col-span-3 ml-auto w-fit hover:scale-105 md:col-span-1"
            >
              {roundIndex === 4 ? "Results" : "Next Round"}
              <SkipForwardIcon />
            </Button>
          </div>
        </div>
      ) : (
        <MapOverlay>
          {guess && (
            <Marker
              anchor="bottom"
              draggable={true}
              latitude={guess.latitude}
              longitude={guess.longitude}
              onDrag={(e) => {
                const { lat: latitude, lng: longitude } = e.lngLat;
                setGuess({ latitude, longitude });
              }}
            >
              <MapPinIcon className="fill-white text-primary" />
            </Marker>
          )}
          <Link
            to="/"
            className={buttonVariants({
              size: "icon-lg",
              className: "top-0 left-0",
            })}
          >
            <ArrowLeftIcon />
          </Link>
          <Item variant="outline" className="top-0 right-0 w-fit bg-background">
            <ItemContent>
              <ItemDescription>Round</ItemDescription>
              <ItemTitle className="ml-auto text-2xl">
                {roundIndex + 1}
              </ItemTitle>
            </ItemContent>
            <ItemContent>
              <ItemDescription>Points</ItemDescription>
              <ItemTitle className="ml-auto text-2xl">
                {roundResults.reduce((acc, curr) => acc + curr.points, 0)}
              </ItemTitle>
            </ItemContent>
          </Item>
          <div className="bottom-0 left-0">
            <PhotoDialog
              objectKey={game.rounds[roundIndex].photo?.objectKey as string}
              height={game.rounds[roundIndex].photo?.height as number}
              width={game.rounds[roundIndex].photo?.width as number}
            />
          </div>
          <div className="right-0 bottom-0 flex flex-col items-end gap-2 md:gap-4">
            <ButtonGroup orientation="vertical">
              <GoToMarkerButton marker={guess} />
              <GoToCenterButton />
            </ButtonGroup>
            <SubmitGuessButton
              disabled={!guess}
              onClick={async () =>
                await submitGuess({
                  data: {
                    roundId: game.rounds[roundIndex].id,
                    latitude: guess?.latitude as number,
                    longitude: guess?.longitude as number,
                  },
                })
              }
            />
          </div>
        </MapOverlay>
      )}
    </AppMap>
  );
}
