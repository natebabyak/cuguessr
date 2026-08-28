"use client";

import { Spinner } from "@/components/ui/spinner";
import { useGameResult } from "@/hooks/use-game-result";
import { GameMap } from "./game-map";
import { GameResults } from "./game-results";

export function Game({ gameId }: { gameId: number }) {
  const gameResult = useGameResult(gameId);

  if (gameResult.isLoading) {
    return <Spinner />;
  }

  if (gameResult.data) {
    return <GameResults gameId={gameId} />;
  }

  return <GameMap gameId={gameId} />;
}
