import { createFileRoute } from "@tanstack/react-router";

import { createGameFn } from "#/lib/game.functions";
import { getPhotosFn } from "#/lib/photos.functions";
import { createRoundsFn } from "#/lib/rounds.functions";

export const Route = createFileRoute("/api/daily")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
          return new Response("Unauthorized");
        }

        const date = Intl.DateTimeFormat("en-CA", {
          timeZone: "America/Toronto",
        }).format(new Date());

        const gameId = await createGameFn({
          data: {
            date,
          },
        });

        const photos = await getPhotosFn();
        const photoIds = photos.map((photo) => photo.id);

        await createRoundsFn({
          data: {
            gameId,
            photoIds,
          },
        });

        return new Response("OK");
      },
    },
  },
});
