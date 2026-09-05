import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { game, round } from "@/lib/db/schema";

export async function POST(request: Request) {
  if (
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized");
  }

  const date = Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
  }).format(Date.now());

  const [{ id: gameId }] = await db.insert(game).values({ date }).returning();

  const photos = await db.query.photo.findMany({
    columns: {
      id: true,
    },
    where: {
      status: "approved",
    },
    orderBy: () => sql`RANDOM()`,
    limit: 5,
  });

  await db.insert(round).values(
    photos.map(({ id: photoId }, index) => ({
      gameId,
      photoId,
      index,
    })),
  );

  return new Response("OK");
}
