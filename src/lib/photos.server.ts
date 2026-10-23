import { sql } from "drizzle-orm";

import { db } from "#/db/index";

export async function getPhotos() {
  return await db.query.photo.findMany({
    columns: {
      id: true,
    },
    where: {
      status: "approved",
    },
    orderBy: () => sql`RANDOM()`,
    limit: 5,
  });
}
