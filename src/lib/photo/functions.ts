import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { ensureSession } from "../auth.functions";
import { createPhotoServer } from "./server";

export const createPhoto = createServerFn({ method: "POST" })
  .validator(
    z.object({
      photo: z.file(),
      latitude: z.number(),
      longitude: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await ensureSession();

    const { photo, latitude, longitude } = data;

    createPhotoServer(photo, latitude, longitude, session.user.id);
  });
