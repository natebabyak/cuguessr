import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { ensureSession } from "#/lib/auth.functions";
import { getGameByDateServer } from "./server";

export const getGameByDate = createServerFn({ method: "POST" })
  .validator(
    z.object({
      date: z.iso.date(),
    }),
  )
  .handler(async ({ data }) => {
    await ensureSession();
    return getGameByDateServer(data.date);
  });
