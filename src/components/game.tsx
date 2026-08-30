import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, MapPinIcon, SendIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { type MapRef, Marker } from "react-map-gl/maplibre";
import { AppMap } from "#/components/app-map";
import { GoToCenterButton } from "#/components/go-to-center-button";
import { GoToMarkerButton } from "#/components/go-to-marker-button";
import { PhotoDialog } from "#/components/photo-dialog";
import { ReportDialog } from "#/components/report-dialog";
import { Button, buttonVariants } from "#/components/ui/button";
import { ButtonGroup } from "#/components/ui/button-group";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "#/components/ui/item";
import { Spinner } from "#/components/ui/spinner";
import {
	DEFAULT_LATITUDE,
	DEFAULT_LONGITUDE,
	DEFAULT_ZOOM,
} from "#/lib/constants";
import type { getGameByDate } from "#/lib/game/functions";
import type { getGameResultByGameId } from "#/lib/game-result/functions";
import type { getRoundResultsByGameId } from "#/lib/round-result/functions";
import { useSubmitGuessMutation } from "#/lib/round-result/mutations";
import type { Coordinates } from "#/lib/types";
import { GameResultScreen } from "./game-result-screen";
import { MapOverlay } from "./map-overlay";
import { RoundResultItem } from "./round-result-item";
import { RoundResultOverlay } from "./round-result-overlay";

export function Game({
	game,
	roundResults,
	gameResult,
}: {
	game: NonNullable<Awaited<ReturnType<typeof getGameByDate>>>;
	roundResults: NonNullable<
		Awaited<ReturnType<typeof getRoundResultsByGameId>>
	>;
	gameResult: Awaited<ReturnType<typeof getGameResultByGameId>>;
}) {
	const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
	const [guess, setGuess] = useState<Coordinates | null>(null);
	const [, setCursorCoords] = useState<Coordinates | null>(null);
	const [isRoundOver, setIsRoundOver] = useState(false);
	const firstUncompletedRoundIndex = game.rounds.findIndex(
		(round) =>
			!roundResults.some((roundResult) => roundResult.roundId === round.id),
	);
	const initialRoundIndex =
		firstUncompletedRoundIndex === -1
			? game.rounds.length
			: firstUncompletedRoundIndex;
	const [roundIndex, setRoundIndex] = useState(initialRoundIndex);
	const [isGameOver, setIsGameOver] = useState(
		initialRoundIndex >= game.rounds.length,
	);
	const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(true);
	const mapRef = useRef<MapRef>(null);

	const submitGuessMutation = useSubmitGuessMutation(game.id);
	const currentRound = game.rounds[roundIndex];
	const currentResult = roundResults.find(
		(result) => result.roundId === currentRound?.id,
	);
	const answer = currentRound?.photo ?? null;

	const totalPoints = useMemo(
		() =>
			roundResults.reduce(
				(acc, roundResult) => acc + (roundResult.points ?? 0),
				0,
			),
		[roundResults],
	);

	if (isGameOver) {
		return (
			<GameResultScreen
				game={game}
				roundResults={roundResults}
				gameResult={gameResult}
			/>
		);
	}

	return (
		<AppMap
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
				setGuess({ latitude, longitude });
			}}
			onMouseDown={() => setCursor("grabbing")}
			onMouseMove={(e) => {
				const { lat: latitude, lng: longitude } = e.lngLat;
				setCursorCoords({ latitude, longitude });
			}}
			onMouseUp={() => setCursor("crosshair")}
		>
			{guess && (
				<Marker
					anchor="bottom"
					draggable={!isRoundOver}
					latitude={guess.latitude}
					longitude={guess.longitude}
					onDrag={(e) => {
						if (isRoundOver) return;
						const { lat: latitude, lng: longitude } = e.lngLat;
						setGuess({ latitude, longitude });
					}}
				>
					<MapPinIcon className="size-8 fill-white text-red-500 dark:fill-black" />
				</Marker>
			)}
			<RoundResultOverlay
				isRoundOver={isRoundOver}
				guess={guess}
				answer={answer}
			/>
			<MapOverlay>
				<Link
					to="/"
					className={buttonVariants({
						size: "icon-lg",
						className: "top-0 left-0",
					})}
				>
					<ArrowLeftIcon />
				</Link>
				<AnimatePresence>
					{!isRoundOver && (
						<motion.div
							initial={{ opacity: 0, scale: 0.9, x: 20, y: -20 }}
							animate={{ opacity: 1, x: 0, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, x: 20, y: -20 }}
							className="top-0 right-0 w-fit"
						>
							<Item variant="outline" className="gap-8 bg-background">
								<ItemContent className="*:ml-auto">
									<ItemDescription>Round</ItemDescription>
									<ItemTitle className="text-2xl">{roundIndex + 1}</ItemTitle>
								</ItemContent>
								<ItemContent className="*:ml-auto">
									<ItemDescription>Points</ItemDescription>
									<ItemTitle className="text-2xl">
										{totalPoints.toLocaleString()}
									</ItemTitle>
								</ItemContent>
							</Item>
						</motion.div>
					)}
				</AnimatePresence>
				<AnimatePresence>
					{!isRoundOver && (
						<motion.div
							initial={{ opacity: 0, scale: 0.9, x: -20, y: 20 }}
							animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, x: -20, y: 20 }}
							className="bottom-8 left-0"
						>
							{game.rounds[roundIndex]?.photo && (
								<PhotoDialog
									objectKey={game.rounds[roundIndex].photo.objectKey}
									height={game.rounds[roundIndex].photo.height}
									width={game.rounds[roundIndex].photo.width}
									open={isPhotoDialogOpen}
									onOpenChange={setIsPhotoDialogOpen}
								/>
							)}
						</motion.div>
					)}
				</AnimatePresence>
				<AnimatePresence>
					{!isRoundOver && (
						<motion.div
							initial={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
							animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
							className="right-0 bottom-8 flex flex-col items-end gap-2 md:gap-4"
						>
							<ButtonGroup orientation="vertical">
								<GoToMarkerButton marker={guess} />
								<GoToCenterButton />
							</ButtonGroup>
							<Button
								disabled={!guess || submitGuessMutation.isPending}
								onClick={async () => {
									if (!guess) return;

									await submitGuessMutation.mutateAsync({
										roundId: currentRound.id,
										latitude: guess.latitude,
										longitude: guess.longitude,
									});

									setIsRoundOver(true);
								}}
								size="lg"
							>
								{submitGuessMutation.isPending ? <Spinner /> : <SendIcon />}
								Submit Guess
							</Button>
						</motion.div>
					)}
				</AnimatePresence>
				<AnimatePresence>
					{isRoundOver && (
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							className="right-0 bottom-8 left-0 flex flex-col gap-2 md:gap-4"
						>
							<div className="flex gap-2 md:gap-4">
								{game.rounds[roundIndex]?.photo && (
									<PhotoDialog
										objectKey={game.rounds[roundIndex].photo.objectKey}
										height={game.rounds[roundIndex].photo.height}
										width={game.rounds[roundIndex].photo.width}
										open={isPhotoDialogOpen}
										onOpenChange={setIsPhotoDialogOpen}
									/>
								)}
								<ReportDialog photoId={game.rounds[roundIndex]?.photoId} />
							</div>
							<RoundResultItem
								distance={Math.round(currentResult?.distance ?? 0)}
								points={currentResult?.points ?? 0}
								totalPoints={totalPoints}
								isLastRound={roundIndex === 4}
								handleClick={() => {
									if (roundIndex < 4) {
										const nextRoundIndex = roundIndex + 1;
										setRoundIndex(nextRoundIndex);
										setIsPhotoDialogOpen(true);
										mapRef.current?.flyTo({
											center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
											zoom: DEFAULT_ZOOM,
										});
									} else {
										setIsGameOver(true);
									}

									setIsRoundOver(false);

									setGuess(null);
								}}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</MapOverlay>
		</AppMap>
	);
}
