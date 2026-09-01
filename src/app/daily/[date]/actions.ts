"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { report, roundResult } from "@/lib/db/schema";
import { calculateDistance, calculatePoints } from "@/lib/scoring";
import type { Guess } from "./guess-schema";
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

export async function submitGuess(guessData: Guess) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const round = await db.query.round.findFirst({
    where: {
      id: guessData.roundId,
    },
    with: {
      photo: true,
    },
  });

  if (!round?.photo) {
    throw new Error("Round not found");
  }

  const distance = calculateDistance({
    a: {
      latitude: round.photo.latitude,
      longitude: round.photo.longitude,
    },
    b: {
      latitude: guessData.latitude,
      longitude: guessData.longitude,
    },
  });

  const points = calculatePoints(distance);

  await db.insert(roundResult).values({
    roundId: guessData.roundId,
    userId: session.user.id,
    latitude: guessData.latitude,
    longitude: guessData.longitude,
    distance,
    points,
  });

  return {
    roundId: guessData.roundId,
    distance,
    points,
  };
}
