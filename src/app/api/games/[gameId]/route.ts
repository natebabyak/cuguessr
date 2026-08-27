import { headers } from "next/headers";
import { notFound, unauthorized } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function getGame(gameId: number) {
  return await db.query.game.findFirst({
    where: {
      id: gameId,
    },
    with: {
      rounds: {
        with: {
          photo: {
            columns: {
              latitude: false,
              longitude: false,
            },
          },
        },
      },
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

  const game = await getGame(gameId);

  if (!game) notFound();

  return NextResponse.json(game);
}

export type GameResponse = NonNullable<Awaited<ReturnType<typeof getGame>>>;
