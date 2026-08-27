import useSWR from "swr";
import type { GameResultResponse } from "@/app/api/game-results/[gameId]/route";
import { fetcher } from "@/lib/fetcher";

export function useGameResult(gameId: number) {
  return useSWR<GameResultResponse>(`/api/games/${gameId}/results`, fetcher);
}
