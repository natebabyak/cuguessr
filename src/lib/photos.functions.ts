import { createServerFn } from "@tanstack/react-start";

import { getPhotos } from "./photos.server";

export const getPhotosFn = createServerFn({
  method: "GET",
}).handler(async () => {
  return await getPhotos();
});
