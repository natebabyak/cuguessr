"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { report } from "@/lib/db/schema";
import type { Report } from "./report-schema";

export async function createReport(reportData: Report) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.insert(report).values({
    photoId: reportData.photoId,
    userId: session.user.id,
    description: reportData.description,
    status: "pending",
  });
}
