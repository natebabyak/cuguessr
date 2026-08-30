import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitGuess } from "./functions";

export function useSubmitGuessMutation(gameId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      roundId: number;
      latitude: number;
      longitude: number;
    }) => submitGuess({ data: vars }),
    onSuccess: (newResult) => {
      queryClient.setQueryData(
        ["round-results", gameId],
        (old: (typeof newResult)[] | undefined) => {
          if (!old) return [newResult];

          const filtered = old.filter(
            (result) => result.roundId !== newResult.roundId,
          );
          return [...filtered, newResult];
        },
      );
      queryClient.invalidateQueries({ queryKey: ["game-result", gameId] });
    },
  });
}
