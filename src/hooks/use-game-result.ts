import useSWR from "swr";
import type { GameResultResponse } from "@/app/api/games/[id]/results/route";
import { fetcher } from "@/lib/fetcher";

export function useGameResult(gameId: number) {
  return useSWR<GameResultResponse>(`/api/games/${gameId}/results`, fetcher);
}
