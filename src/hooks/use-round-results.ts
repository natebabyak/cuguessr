import useSWR from "swr";
import type { RoundResultsResponse } from "@/app/api/round-results/[gameId]/route";
import { fetcher } from "@/lib/fetcher";

export function useRoundResults(gameId: number) {
  return useSWR<RoundResultsResponse>(`/api/round-results/${gameId}`, fetcher);
}
