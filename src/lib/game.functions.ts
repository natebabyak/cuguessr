import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { getOrCreateGameServer } from "./game.server";

export const getOrCreateGame = createServerFn({ method: "POST" })
  .validator(
    z.object({
      date: z.iso.date(),
    }),
  )
  .handler(async ({ data }) => {
    return getOrCreateGameServer(data.date);
  });
