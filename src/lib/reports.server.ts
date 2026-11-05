import { db } from "#/db/index";
import { report } from "#/db/schema";

export async function submitReport(photoId: number, description: string, userId: string) {
  await db.insert(report).values({ photoId, description, userId, status: "pending" });
}
