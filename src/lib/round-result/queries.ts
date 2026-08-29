import { queryOptions } from "@tanstack/react-query";
import { getRoundResultsByGameId } from "./functions";

export const roundResultsQueryOptions = (gameId: number) =>
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
