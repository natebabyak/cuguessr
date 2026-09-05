"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserStats, type UserStats } from "@/lib/stats";
import type { Name } from "./name-schema";

export async function changeName(nameData: Name) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    await auth.api.updateUser({
      body: {
        name: nameData.name,
      },
      headers: requestHeaders,
    });
  } catch (error) {
    throw new Error("Failed to update name", { cause: error });
  }
}

export async function getMyStats(): Promise<UserStats | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.isAnonymous) {
    return null;
  }

  return getUserStats(session.user.id);
}
