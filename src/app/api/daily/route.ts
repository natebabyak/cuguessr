import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { game, round } from "@/lib/db/schema";

export async function POST(request: Request) {
  if (
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized");
  }

  await db.transaction(async (tx) => {
    const date = Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
    }).format(Date.now());

    const [{ id: gameId }] = await tx.insert(game).values({ date }).returning();

    const photos = await tx.query.photo.findMany({
      columns: {
        id: true,
      },
      where: {
        status: "approved",
      },
      orderBy: () => sql`RANDOM()`,
      limit: 5,
    });

    await tx.insert(round).values(
      photos.map(({ id: photoId }, index) => ({
        gameId,
        photoId,
        index,
      })),
    );
  });
}
