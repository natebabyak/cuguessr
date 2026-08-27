import { headers } from "next/headers";
import { notFound, unauthorized } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function getGameResult(gameId: number, userId: string) {
  return await db.query.gameResult.findFirst({
    where: {
      gameId,
      userId,
    },
  });
}

export async function GET({
  params,
}: {
  params: Promise<{
    gameId: number;
  }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) unauthorized();

  const { gameId } = await params;
  const userId = session.user.id;

  const gameResult = await getGameResult(gameId, userId);

  if (!gameResult) notFound();

  return NextResponse.json(gameResult);
}

export type GameResultResponse = NonNullable<
  Awaited<ReturnType<typeof getGameResult>>
>;
