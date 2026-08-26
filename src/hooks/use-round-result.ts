import useSWR from "swr";
import type { RoundResultResponse } from "@/app/api/rounds/[id]/results/route";
import { fetcher } from "@/lib/fetcher";

export function useRoundResult(id: number) {
  return useSWR<RoundResultResponse>(`/api/rounds/${id}/results`, fetcher);
}
