"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { Name } from "./name-schema";

export async function changeName(nameData: Name) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    await auth.api.updateUser({
      body: {
        name: nameData.name,
      },
    });
  } catch {
    throw new Error("Failed to update name");
  }
}
