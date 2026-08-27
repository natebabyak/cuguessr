import { headers } from "next/headers";
import { notFound, unauthorized } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function getRoundResults(gameId: number, userId: string) {
  return await db.query.roundResult.findMany({
    where: {
      round: {
        game: {
          id: gameId,
        },
      },
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

  const roundResults = await getRoundResults(gameId, userId);

  if (!roundResults) notFound();

  return NextResponse.json(roundResults);
}

export type RoundResultsResponse = NonNullable<
  Awaited<ReturnType<typeof getRoundResults>>
>;
