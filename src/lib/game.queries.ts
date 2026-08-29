import { useQuery } from "@tanstack/react-query";
import { getOrCreateGame } from "./game.functions";

export const gameQuery = useQuery({
  queryKey: ["game"],
  queryFn: getOrCreateGame,
});
