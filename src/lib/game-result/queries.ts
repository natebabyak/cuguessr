import { queryOptions } from "@tanstack/react-query";
import { getGameResultByGameId } from "./functions";

export const gameResultQueryOptions = (gameId: number) =>
  queryOptions({
    queryKey: ["game-result", gameId],
    queryFn: () =>
      getGameResultByGameId({
        data: {
          gameId,
        },
      }) ?? null,
  });
