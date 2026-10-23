import { createServerFn } from "@tanstack/react-start";
import z from "zod";

import { createGame, getGame } from "./game.server";

export const getGameFn = createServerFn({
  method: "GET",
})
  .validator(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
  )
  .handler(async ({ data }) => {
    const { date } = data;
    return await getGame(date);
  });

export const createGameFn = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
  )
  .handler(async ({ data }) => {
    const { date } = data;
    return await createGame(date);
  });
