import { and, count, eq, sql } from "drizzle-orm";
import type z from "zod";

import { db } from "#/db/index";
import { photo, report } from "#/db/schema";

import type {
  AdminQueue,
  moderatePhotoSchema,
  respondToReportSchema,
  rotatePhotoSchema,
} from "./admin-schema";

export const ADMIN_PAGE_SIZE = 12;

// Check the current database role on every request, including direct server-function calls.
export async function requireAdmin(userId: string | undefined) {
  if (!userId) throw new Error("Unauthorized");
  const actor = await db.query.user.findFirst({
    columns: { id: true, isAdmin: true, isAnonymous: true },
    where: { id: userId },
  });
  if (!actor?.isAdmin || actor.isAnonymous) throw new Error("Forbidden");
  return actor.id;
}

export async function getAdminQueue(userId: string | undefined, query: AdminQueue) {
  await requireAdmin(userId);
  const [photoCounts, reportCounts] = await Promise.all([
    db.select({ status: photo.status, count: count() }).from(photo).groupBy(photo.status),
    db.select({ status: report.status, count: count() }).from(report).groupBy(report.status),
  ]);
  const counts = { photos: photoCounts, reports: reportCounts };
  const total = counts[query.tab].find((entry) => entry.status === query.status)?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const options = {
    where: { status: query.status },
    orderBy: { createdAt: "asc" as const, id: "asc" as const },
    limit: ADMIN_PAGE_SIZE,
    offset: (page - 1) * ADMIN_PAGE_SIZE,
  };
  const photos =
    query.tab === "photos"
      ? await db.query.photo.findMany({
          ...options,
          with: { submittedBy: { columns: { name: true } } },
        })
      : [];
  const reports =
    query.tab === "reports"
      ? await db.query.report.findMany({
          ...options,
          with: {
            photo: true,
            submittedBy: { columns: { name: true } },
          },
        })
      : [];
  return { photos, reports, counts, total, page, pages };
}

function requireUpdated(rows: unknown[]) {
  if (!rows.length)
    throw new Error("This item changed or was removed. Refresh before trying again.");
}

export async function moderatePhoto(
  userId: string | undefined,
  data: z.infer<typeof moderatePhotoSchema>,
) {
  await requireAdmin(userId);
  const rows = await db
    .update(photo)
    .set({ status: data.status, revision: sql`${photo.revision} + 1` })
    .where(and(eq(photo.id, data.photoId), eq(photo.revision, data.revision)))
    .returning({ id: photo.id });
  requireUpdated(rows);
}

export async function rotatePhoto(
  userId: string | undefined,
  data: z.infer<typeof rotatePhotoSchema>,
) {
  await requireAdmin(userId);
  const rows = await db
    .update(photo)
    .set({
      rotation: sql`mod(${photo.rotation} + ${data.direction === "right" ? 90 : 270}, 360)`,
      revision: sql`${photo.revision} + 1`,
    })
    .where(and(eq(photo.id, data.photoId), eq(photo.revision, data.revision)))
    .returning({ id: photo.id });
  requireUpdated(rows);
}

export async function respondToReport(
  userId: string | undefined,
  data: z.infer<typeof respondToReportSchema>,
) {
  const actorId = await requireAdmin(userId);
  const rows = await db
    .update(report)
    .set({
      response: data.response,
      status: data.status,
      resolvedBy: data.status === "pending" ? null : actorId,
      resolvedAt: data.status === "pending" ? null : new Date(),
      revision: sql`${report.revision} + 1`,
    })
    .where(and(eq(report.id, data.reportId), eq(report.revision, data.revision)))
    .returning({ id: report.id });
  requireUpdated(rows);
}
