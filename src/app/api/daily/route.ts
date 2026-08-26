import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { game, round } from "@/lib/db/schema";

export async function GET(request: Request) {
  if (
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const today = new Date().toISOString().slice(10);

  await db.transaction(async (tx) => {
    const [{ id: gameId }] = await tx
      .insert(game)
      .values({ date: today })
      .returning();

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
      photos.map(({ id: photoId }, photoIndex) => ({
        gameId,
        photoId,
        number: photoIndex + 1,
      })),
    );
  });
}
