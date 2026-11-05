import { createServerFn } from "@tanstack/react-start";
import z from "zod";

import { getSession } from "./auth.functions";
import { guessSchema } from "./guess-schema";
import { getRoundResults, submitGuess } from "./round-results.server";

export const getRoundResultsFn = createServerFn({
  method: "GET",
})
  .validator(
    z.object({
      gameId: z.int(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) return [];

    return getRoundResults(data.gameId, session.user.id);
  });

export const submitGuessFn = createServerFn({ method: "POST" })
  .validator(guessSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    return submitGuess(data, session.user.id);
  });
