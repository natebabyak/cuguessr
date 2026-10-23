import { createServerFn } from "@tanstack/react-start";
import z from "zod";

import { createRounds } from "./rounds.server";

export const createRoundsFn = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      gameId: z.int(),
      photoIds: z.array(z.int()).length(5),
    }),
  )
  .handler(async ({ data }) => {
    const { gameId, photoIds } = data;
    await createRounds(gameId, photoIds);
  });
