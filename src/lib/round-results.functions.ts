import { createServerFn } from "@tanstack/react-start";
import z from "zod";

import { getRoundResults } from "./round-results.server";

export const getRoundResultsFn = createServerFn({
  method: "GET",
})
  .validator(
    z.object({
      gameId: z.int(),
      userId: z.uuidv4(),
    }),
  )
  .handler(async ({ data }) => {
    const { gameId, userId } = data;
    return await getRoundResults(gameId, userId);
  });
