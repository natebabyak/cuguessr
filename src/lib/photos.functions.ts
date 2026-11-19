import { createServerFn } from "@tanstack/react-start";

import { getSession } from "./auth.functions";
import { createPhotoSchema } from "./photo-schema";
import { createPhoto, getGamePhotos, getHomePhotos } from "./photos.server";

export const createPhotoFn = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }

    return createPhotoSchema.parse({
      photo: data.get("photo"),
      latitude: Number(data.get("latitude")),
      longitude: Number(data.get("longitude")),
    });
  })
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    await createPhoto(data, session.user.id);
  });

export const getGamePhotosFn = createServerFn({
  method: "GET",
}).handler(async () => {
  return await getGamePhotos();
});

export const getHomePhotosFn = createServerFn({
  method: "GET",
}).handler(async () => {
  return await getHomePhotos();
});
