import { headers } from "next/headers";
import { notFound, unauthorized } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function getRoundResult(roundId: number, userId: string) {
  return await db.query.roundResult.findFirst({
    where: {
      roundId,
      userId,
    },
  });
}

export async function GET({
  params,
}: {
  params: Promise<{
    id: number;
  }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) unauthorized();

  const { id: roundId } = await params;
  const userId = session.user.id;

  const roundResult = await getRoundResult(roundId, userId);

  if (!roundResult) notFound();

  return NextResponse.json(roundResult);
}

export type RoundResultResponse = NonNullable<
  Awaited<ReturnType<typeof getRoundResult>>
>;
