import useSWR from "swr";
import type { GameResponse } from "@/app/api/games/[id]/route";
import { fetcher } from "@/lib/fetcher";

export function useGame(gameId: number) {
  return useSWR<GameResponse>(`/api/games/${gameId}`, fetcher);
}
