import { createServerFn } from "@tanstack/react-start";

import { getGamePhotos, getHomePhotos } from "./photos.server";

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
