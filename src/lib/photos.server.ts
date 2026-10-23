import { sql } from "drizzle-orm";

import { db } from "#/db/index";

export async function getGamePhotos() {
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

export async function getHomePhotos() {
  return await db.query.photo.findMany({
    columns: {
      objectKey: true,
    },
    where: {
      status: "approved",
    },
    orderBy: {
      createdAt: "desc",
    },
    limit: 10,
  });
}
