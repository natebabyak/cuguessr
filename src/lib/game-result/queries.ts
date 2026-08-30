import { queryOptions } from "@tanstack/react-query";
import { getGameResultByGameId } from "./functions";

export const gameResultQueryOptions = (gameId: number) =>
  queryOptions({
    queryKey: ["game-result", gameId],
    queryFn: async () =>
      (await getGameResultByGameId({
        data: {
          gameId,
        },
      })) ?? null,
  });
