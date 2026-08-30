import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { ensureSession } from "../auth.functions";
import { db } from "../db";
import { createPhotoServer } from "./server";

export const createPhoto = createServerFn({ method: "POST" })
  .validator(
    z.object({
      photo: z.file(),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  )
  .handler(async ({ data }) => {
    const session = await ensureSession();
    const { photo, latitude, longitude } = data;

    await createPhotoServer(photo, latitude, longitude, session.user.id);
  });

export const getGalleryPhotos = createServerFn({ method: "GET" }).handler(
  async () => {
    return await db.query.photo.findMany({
      columns: {
        id: true,
        objectKey: true,
        height: true,
        width: true,
      },
      where: {
        status: "approved",
      },
    });
  },
);
