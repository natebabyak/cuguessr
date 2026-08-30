import { queryOptions } from "@tanstack/react-query";
import { getRoundResultsByGameId, getRoundResultsByRoundId } from "./functions";

export const roundResultsByGameIdQueryOptions = (gameId: number) =>
  queryOptions({
    queryKey: ["round-results", gameId],
    queryFn: () =>
      getRoundResultsByGameId({
        data: {
          gameId,
        },
      }) ?? [],
    enabled: !!gameId,
  });

export const roundResultsByRoundIdQueryOptions = (roundId: number) =>
  queryOptions({
    queryKey: ["round-results-by-round-id", roundId],
    queryFn: () =>
      getRoundResultsByRoundId({
        data: {
          roundId,
        },
      }) ?? [],
    enabled: !!roundId,
  });
